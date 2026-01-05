import { useMemo, useState } from "react";
import { myPlayer, useIsHost, usePlayersList } from "playroomkit";
import type { AnimalId } from "@/game/types/animal";
import { animalNameMap } from "@/assets/utils/animalNameMap";
import Tilt from "react-parallax-tilt";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSyncHostId } from "@/game/hooks/useSyncHost";
import { Eye } from "lucide-react";
import { ANIMALS } from "@/game/config/animals";

export default function PeekingPhase({
  onNextPhase,
}: {
  onNextPhase: () => void;
}) {
  const isHost = useIsHost();
  const me = myPlayer();
  const players = usePlayersList(true);
  const hostId = useSyncHostId();

  const myRole = me.getState("role") as AnimalId | null;

  /* ===================== HOST VIEW ===================== */
  if (isHost) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-6 text-center">
        <Eye className="h-12 w-12 text-gray-500 animate-eye-blink" />

        <p className="text-gray-600">플레이어들이 직업을 엿보는 중입니다</p>

        <Button
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={onNextPhase}
        >
          다음 단계
        </Button>

        <style>{`
          @keyframes eyeBlink {
            0%,45%,100% { transform: scaleY(1); }
            50% { transform: scaleY(0.1); }
            55% { transform: scaleY(1); }
          }
          .animate-eye-blink {
            animation: eyeBlink 3.5s ease-in-out infinite;
            transform-origin: center;
          }
        `}</style>
      </div>
    );
  }

  /* ===================== SPECTATOR ===================== */
  if (!myRole) {
    return (
      <div className="flex h-full w-full items-center justify-center text-gray-500">
        관전자입니다. 잠시만 기다려주세요…
      </div>
    );
  }

  const peekingCount = ANIMALS[myRole].peekingCount ?? 1;

  /* ===================== STATE ===================== */
  const [targets, setTargets] = useState<(string | null)[]>(
    Array(peekingCount).fill(null)
  );
  const [revealed, setRevealed] = useState<boolean[]>(
    Array(peekingCount).fill(false)
  );

  /* ===================== 후보 ===================== */
  const peekTargets = useMemo(
    () => players.filter((p) => p.id !== me.id && p.id !== hostId),
    [players, me.id, hostId]
  );

  /* ===================== 공개 역할 계산 ===================== */
  const revealedRoles = useMemo(() => {
    return targets.map((targetId, idx) => {
      if (!targetId || !revealed[idx]) return null;

      const p = peekTargets.find((x) => x.id === targetId);
      if (!p) return null;

      const role = p.getState("role") as AnimalId | null;
      if (!role) return null;

      if (role === "CHAMELEON") {
        return (p.getState("camouflagedTo") as AnimalId | null) || "CHAMELEON";
      }

      return role;
    });
  }, [targets, revealed, peekTargets]);

  /* ===================== PLAYER VIEW ===================== */
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-xl md:text-2xl font-semibold">엿보기</h1>

      <p className="text-sm text-gray-500 text-center max-w-sm">
        최대 {peekingCount}명의 정체를 확인할 수 있습니다.
      </p>

      <div className="grid w-full max-w-md gap-6">
        {targets.map((targetId, idx) => {
          const targetPlayer = peekTargets.find((p) => p.id === targetId);

          return (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="mb-3 text-sm font-medium text-gray-600">
                {idx + 1}번째 엿보기
              </p>

              {/* ===================== Reveal Area ===================== */}
              <div className="my-4 flex justify-center">
                <div className="w-full max-w-[220px]">
                  <div className="min-h-[200px]">
                    {" "}
                    {revealedRoles[idx] ? (
                      <Tilt scale={1.05}>
                        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border bg-gray-50 px-5 py-4 text-center">
                          <img
                            src={`/animal/${revealedRoles[idx]}.svg`}
                            className="h-20 w-20"
                          />
                          <p className="mt-2 text-sm text-gray-700">
                            {targetPlayer?.getState("name") ||
                              targetPlayer?.getProfile().name}
                            님은{" "}
                            <span className="font-semibold text-blue-500">
                              {animalNameMap[revealedRoles[idx]!]}
                            </span>
                          </p>
                        </div>
                      </Tilt>
                    ) : (
                      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                        엿보기 결과
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Select
                disabled={revealed[idx]}
                value={targetId ?? undefined}
                onValueChange={(v) => {
                  const next = [...targets];
                  next[idx] = v;
                  setTargets(next);
                }}
              >
                <SelectTrigger className="rounded-full">
                  <SelectValue placeholder="플레이어 선택" />
                </SelectTrigger>

                <SelectContent>
                  {peekTargets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.getState("name") || p.getProfile().name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="mt-3 w-full rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300"
                disabled={!targetId || revealed[idx]}
                onClick={() => {
                  const next = [...revealed];
                  next[idx] = true;
                  setRevealed(next);
                }}
              >
                엿보기
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

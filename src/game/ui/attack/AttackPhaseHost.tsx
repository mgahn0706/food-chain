import { animalNameMap } from "@/assets/utils/animalNameMap";
import { Button } from "@/components/ui/button";
import { BIOMES } from "@/game/config/biome";
import useCheckHasEaten from "@/game/hooks/useCheckHasEaten";
import { useSyncHostId } from "@/game/hooks/useSyncHost";
import AttackLogSidebar from "@/game/components/AttackLogSidebar";

import type { AnimalId } from "@/game/types/animal";
import type { BiomeId } from "@/game/types/biome";

import { Eye, EyeOff, Skull } from "lucide-react";
import { usePlayersList, useMultiplayerState } from "playroomkit";
import { useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

type PlayerStatus = "ALIVE" | "DEAD";

type AttackLog = {
  round: number;
  attacker: AnimalId;
  target: AnimalId;
  result: "SUCCESS" | "FAIL" | "DEAD";
};

export default function AttackPhaseHost({
  round,
  onNextPhase,
}: {
  round: number;
  onNextPhase: () => void;
}) {
  /* ===================== Timer ===================== */
  const [seconds, setSeconds] = useState(0);
  const [isAnimalRevealed, setIsAnimalRevealed] = useState(true);

  useEffect(() => {
    setSeconds(0);
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [round]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  /* ===================== Multiplayer ===================== */
  const hostId = useSyncHostId();
  const playersAll = usePlayersList(true);
  const { checkHasEaten } = useCheckHasEaten({ round });

  const players = useMemo(
    () => playersAll.filter((p) => p.id !== hostId),
    [playersAll, hostId]
  );

  const roundIndex = round - 1;

  /* ===================== Attack Log Toast ===================== */
  const [attackLogs] = useMultiplayerState<AttackLog[]>("attackLogs", []);

  useEffect(() => {
    const log = attackLogs.at(-1);
    if (!log) return;

    // ✅ 현재 라운드 로그만 토스트
    if (log.round !== round) return;

    // ✅ 방어 코드 (undefined 방지)
    if (!log.attacker || !log.target || !log.result) return;

    showAttackToast(log);
  }, [attackLogs, round]);

  /* ===================== Grouping ===================== */
  const grouped = useMemo(() => {
    const initial: Record<BiomeId | "NONE" | "DEAD", typeof players> = {
      SKY: [],
      FIELD: [],
      FOREST: [],
      RIVER: [],
      NONE: [],
      DEAD: [],
    };

    return players.reduce((acc, p) => {
      const status = p.getState("status") as PlayerStatus | null;

      if (status === "DEAD") {
        acc.DEAD.push(p);
        return acc;
      }

      const history = (p.getState("biomeHistory") as (BiomeId | null)[]) ?? [];
      const biome = history[roundIndex];

      if (!biome) {
        acc.NONE.push(p);
        return acc;
      }

      acc[biome].push(p);
      return acc;
    }, initial);
  }, [players, roundIndex]);

  /* ===================== Render ===================== */
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      {/* ================= Header ================= */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm text-gray-400">{round} 라운드</p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">공격 진행 상황</h1>

            <button
              onClick={() => setIsAnimalRevealed((v) => !v)}
              className="text-gray-400 transition-colors hover:text-gray-700"
            >
              {isAnimalRevealed ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AttackLogSidebar />
          <div className="tabular-nums text-sm font-medium text-gray-500">
            {mm}:{ss}
          </div>
        </div>
      </div>

      {/* ================= Biomes ================= */}
      <div className="space-y-4">
        {Object.values(BIOMES).map((biome) => (
          <div
            key={biome.id}
            className="rounded-xl px-6 py-5 text-white"
            style={biomeGradient(biome.color)}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-medium">{biome.name}</span>
              <span className="text-lg font-semibold opacity-90">
                {grouped[biome.id].length}
              </span>
            </div>

            {grouped[biome.id].length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {grouped[biome.id].map((p) => {
                  const role = p.getState("role") as AnimalId | null;

                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-sm text-gray-900"
                    >
                      {isAnimalRevealed && role && (
                        <img
                          src={`/animal/${role}.svg`}
                          className="h-5 w-5 rounded-full"
                        />
                      )}

                      <span className="whitespace-nowrap">
                        {p.getState("name") || p.getProfile().name}
                      </span>

                      {isAnimalRevealed && role && (
                        <span className="whitespace-nowrap text-xs text-gray-500">
                          {animalNameMap[role]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* ================= DEAD ================= */}
        <div className="rounded-xl bg-gray-200 px-6 py-5">
          <div className="mb-3 flex items-center gap-2 text-gray-700">
            <Skull className="h-5 w-5" />
            저승 {grouped.DEAD.length}
          </div>

          <div className="flex flex-wrap gap-2">
            {grouped.DEAD.map((p) => {
              const role = p.getState("role") as AnimalId | null;

              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm"
                >
                  {isAnimalRevealed && role && (
                    <img
                      src={`/animal/${role}.svg`}
                      className="h-5 w-5 rounded-full"
                    />
                  )}

                  <span className="whitespace-nowrap">
                    {p.getState("name") || p.getProfile().name}
                  </span>

                  {isAnimalRevealed && role && (
                    <span className="whitespace-nowrap text-xs text-gray-500">
                      {animalNameMap[role]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= Footer ================= */}
      <div className="mt-10 flex justify-center">
        <Button
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => {
            checkHasEaten();
            onNextPhase();
          }}
        >
          {round} 라운드 종료
        </Button>
      </div>
    </div>
  );
}

/* ===================== Toast Helper ===================== */

function showAttackToast(log: AttackLog) {
  const attacker = animalNameMap[log.attacker] ?? log.attacker;
  const target = animalNameMap[log.target] ?? log.target;

  if (log.result === "DEAD") {
    toast.error(`${attacker} → ${target} ☠️ 사망`, { duration: 3000 });
    return;
  }

  if (log.result === "SUCCESS") {
    toast.success(`${attacker} → ${target} 성공`, { duration: 2500 });
    return;
  }

  toast(`${attacker} → ${target} 실패`, { duration: 2000 });
}

/* ===================== Style ===================== */

function biomeGradient(color: string) {
  return {
    background: `linear-gradient(
      135deg,
      ${color} 0%,
      ${color}CC 55%,
      ${color}99 100%
    )`,
    boxShadow: `0 8px 24px ${color}33`,
  };
}

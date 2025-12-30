import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { myPlayer, usePlayersList } from "playroomkit";
import { Hand } from "lucide-react";

import type { BiomeId } from "@/game/types/biome";
import type { AnimalId } from "@/game/types/animal";
import { animalNameMap } from "@/assets/utils/animalNameMap";
import { BIOMES } from "@/game/config/biome";
import PlayerHeader from "@/game/components/PlayerHeader";
import useExecuteAttack from "@/game/hooks/useExecuteAttack";
import DeathScreen from "@/game/components/DeathScreen";

export default function AttackPhasePlayer({ round }: { round: number }) {
  const me = myPlayer();
  const players = usePlayersList(true);

  const myStatus = me.getState("status");

  /* ===================== ALIVE VIEW ===================== */

  const [targetId, setTargetId] = useState<string | null>(null);

  const roundIndex = round - 1;

  /* ===================== My biome ===================== */

  const myBiome = useMemo(() => {
    const history = (me.getState("biomeHistory") as (BiomeId | null)[]) ?? [];
    return history[roundIndex] ?? null;
  }, [me, roundIndex]);

  const myBiomeName = myBiome ? BIOMES[myBiome].name : null;
  const myBiomeColor = myBiome ? BIOMES[myBiome].color : "#9ca3af";

  /* ===================== Candidates ===================== */

  const candidates = useMemo(() => {
    if (!myBiome) return [];

    return players.filter((p) => {
      if (p.id === me.id) return false;
      if (p.getState("status") !== "ALIVE") return false;

      const history = (p.getState("biomeHistory") as (BiomeId | null)[]) ?? [];
      return history[roundIndex] === myBiome;
    });
  }, [players, me.id, myBiome, roundIndex]);

  const canAttack = !!targetId && candidates.length > 0;

  /* ===================== Execute Attack Hook ===================== */

  const { executeAttack } = useExecuteAttack({
    attackerId: me.id,
    defenderId: targetId,
    round,
  });

  /* ===================== DEAD VIEW ===================== */
  if (myStatus === "DEAD") {
    return <DeathScreen round={round} currentPhase="공격 단계" />;
  }

  return (
    <div className="flex h-full w-full flex-col px-6 py-10">
      <PlayerHeader />

      <div className="mx-auto w-full max-w-md">
        {/* ================= Header ================= */}
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-400">{round} 라운드</p>
          <h1 className="mt-1 text-2xl font-bold">공격 대상을 선택하세요</h1>

          {/* 현재 바이옴 */}
          <div className="mt-4 flex justify-center">
            {myBiomeName ? (
              <div
                className="rounded-full px-4 py-1 text-sm font-bold text-white shadow"
                style={{ backgroundColor: myBiomeColor }}
              >
                현재 위치 · {myBiomeName}
              </div>
            ) : (
              <div className="rounded-full bg-gray-200 px-4 py-1 text-sm font-medium text-gray-500">
                현재 위치 미정
              </div>
            )}
          </div>
        </div>

        {/* ================= Select ================= */}
        <div className="mb-8 w-full">
          <Select value={targetId ?? ""} onValueChange={setTargetId}>
            <SelectTrigger className="h-12 w-full">
              <SelectValue
                placeholder={
                  candidates.length === 0
                    ? "공격 가능한 대상이 없습니다"
                    : "공격 대상을 선택하세요"
                }
              />
            </SelectTrigger>

            <SelectContent>
              {candidates.length === 0 ? (
                <SelectItem value="NONE" disabled>
                  공격 가능한 대상이 없습니다
                </SelectItem>
              ) : (
                candidates.map((p) => {
                  const role = p.getState("role") as AnimalId | null;

                  return (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <span>{p.getState("name") || p.getProfile().name}</span>
                        {role && (
                          <span className="text-xs text-gray-500">
                            {animalNameMap[role]}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
        </div>

        {/* ================= Attack Button ================= */}
        <Button
          disabled={!canAttack}
          onClick={() => {
            executeAttack();
            setTargetId(null);
          }}
          className={[
            "flex h-14 w-full items-center justify-center gap-3",
            "text-lg font-extrabold tracking-wide",
            "transition-all duration-150",

            canAttack
              ? [
                  "bg-red-600 text-white",
                  "hover:bg-red-700 hover:scale-[1.02]",
                  "active:scale-[0.96]",
                  "shadow-[0_8px_0_#7f1d1d]",
                  "active:shadow-[0_3px_0_#7f1d1d]",
                ].join(" ")
              : "cursor-not-allowed bg-gray-300 text-gray-500 shadow-none",
          ].join(" ")}
        >
          <Hand className="h-6 w-6" />
          공격
        </Button>
      </div>
    </div>
  );
}

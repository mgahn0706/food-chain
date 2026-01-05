import React, { useEffect, useState } from "react";
import { myPlayer, usePlayerState } from "playroomkit";
import { Cloud, Wheat, Trees, Waves } from "lucide-react";

import type { BiomeId } from "@/game/types/biome";
import { BIOMES } from "@/game/config/biome";
import type { AnimalId } from "@/game/types/animal";
import { ANIMALS } from "@/game/config/animals";
import PlayerHeader from "@/game/components/PlayerHeader";
import DeathScreen from "@/game/components/DeathScreen";

/* ===================== utils ===================== */

function biomeGradientWave(color: string, active: boolean) {
  if (!active) return {};

  return {
    background: `
      linear-gradient(
        135deg,
        ${color} 0%,
        ${color}CC 40%,
        ${color}99 60%,
        ${color} 100%
      )
    `,
    backgroundSize: "200% 200%",
    animation: "gradientWave 4s ease-in-out infinite",
  };
}

const BIOME_UI: Record<BiomeId, { icon: React.ElementType }> = {
  SKY: { icon: Cloud },
  FIELD: { icon: Wheat },
  FOREST: { icon: Trees },
  RIVER: { icon: Waves },
};

export default function MoveBiomePhasePlayer({ round }: { round: number }) {
  const me = myPlayer();
  const myStatus = me.getState("status");

  /* ===================== TIMER ===================== */

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(0);
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [round]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  /* ===================== DEAD VIEW ===================== */

  if (myStatus === "DEAD") {
    return <DeathScreen round={round} currentPhase="장소 이동 단계" />;
  }

  /* ===================== ALIVE VIEW ===================== */

  const myRole = me.getState("role") as AnimalId | null;

  /* ===================== player state ===================== */

  const [biomeHistory, setBiomeHistory] = usePlayerState<(BiomeId | null)[]>(
    me,
    "biomeHistory",
    []
  );

  const roundIndex = round - 1;
  const selectedBiome = biomeHistory[roundIndex] ?? null;

  const { mainHabitat, unacceptableBiomes } = ANIMALS[myRole as AnimalId];

  /* ===================== rule logic ===================== */

  const prevBiome = roundIndex > 0 ? biomeHistory[roundIndex - 1] : null;

  // 이전 라운드에서 주 서식지가 아니면 → 강제 복귀
  const mustReturnToMain = prevBiome !== null && prevBiome !== mainHabitat;

  const selectBiome = (biomeId: BiomeId) => {
    const next = [...biomeHistory];
    next[roundIndex] = selectedBiome === biomeId ? null : biomeId;
    setBiomeHistory(next, true);
  };

  return (
    <div className="flex h-full w-full flex-col px-6 py-6">
      <style>{`
        @keyframes gradientWave {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
        {/* ================= Header ================= */}
        <PlayerHeader />

        <div className="mb-4 text-center">
          <p className="text-sm text-gray-400">{round} 라운드</p>

          {/* 타이머 */}
          <div className="mt-1 tabular-nums text-sm font-medium text-gray-500">
            {mm}:{ss}
          </div>

          {selectedBiome ? (
            <div className="flex justify-center">
              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                {BIOMES[selectedBiome].name}
              </h1>
              <h1 className="mt-1 text-2xl font-medium tracking-tight">
                {selectedBiome === "FIELD" || selectedBiome === "SKY"
                  ? "로 "
                  : "으로 "}
                이동해 주십시오.
              </h1>
            </div>
          ) : (
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              이동할 서식지를 선택하십시오.
            </h1>
          )}
        </div>

        {/* ================= Grid ================= */}
        <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-6">
          {Object.values(BIOMES).map((biome) => {
            const Icon = BIOME_UI[biome.id].icon;
            const isSelected = selectedBiome === biome.id;

            const isUnacceptable = unacceptableBiomes.includes(biome.id);
            const isForcedDisabled =
              mustReturnToMain && biome.id !== mainHabitat;

            const isDisabled = isUnacceptable || isForcedDisabled;

            return (
              <button
                key={biome.id}
                disabled={isDisabled}
                onClick={() => !isDisabled && selectBiome(biome.id)}
                className={[
                  "relative flex h-full flex-col items-center justify-center rounded-2xl",
                  "transition-colors duration-300 ease-out ring-4",
                  isDisabled
                    ? "cursor-not-allowed bg-gray-100 ring-gray-200 text-gray-400"
                    : isSelected
                    ? "ring-white text-white"
                    : "ring-transparent bg-white text-gray-900",
                ].join(" ")}
                style={
                  isDisabled
                    ? undefined
                    : biomeGradientWave(biome.color, isSelected)
                }
              >
                <div
                  className={[
                    "flex flex-col items-center justify-center",
                    !isDisabled &&
                      "transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.99]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Icon
                    className="mb-4 h-16 w-16 transition-colors duration-300"
                    style={{
                      color: isDisabled
                        ? "#9ca3af"
                        : isSelected
                        ? "#ffffff"
                        : biome.color,
                    }}
                  />

                  <span
                    className="text-3xl font-extrabold tracking-wide transition-colors duration-300"
                    style={{
                      color: isDisabled
                        ? "#9ca3af"
                        : isSelected
                        ? "#ffffff"
                        : biome.color,
                    }}
                  >
                    {biome.name}
                  </span>

                  {isUnacceptable ? (
                    <span className="mt-2 text-sm font-medium text-gray-400">
                      {biome.name} 이동 불가
                    </span>
                  ) : isForcedDisabled ? (
                    <span className="mt-2 text-sm font-medium text-gray-400">
                      주 서식지로 돌아가야함
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 h-4" />
      </div>
    </div>
  );
}

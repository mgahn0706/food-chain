import { animalNameMap } from "@/assets/utils/animalNameMap";
import { Button } from "@/components/ui/button";
import { BIOMES } from "@/game/config/biome";
import { useSyncHostId } from "@/game/hooks/useSyncHost";
import type { AnimalId } from "@/game/types/animal";
import type { BiomeId } from "@/game/types/biome";
import { Eye, EyeOff, Skull } from "lucide-react";
import { usePlayersList } from "playroomkit";
import { useEffect, useMemo, useState } from "react";

type PlayerStatus = "ALIVE" | "DEAD";

export default function MoveBiomePhaseHost({
  round,
  onNextPhase,
}: {
  round: number;
  onNextPhase: () => void;
}) {
  const [seconds, setSeconds] = useState(0);
  const [isAnimalRevealed, setIsAnimalRevealed] = useState(round !== 1);

  useEffect(() => {
    setSeconds(0);
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [round]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const hostId = useSyncHostId();
  const playersAll = usePlayersList(true);

  const players = useMemo(
    () => playersAll.filter((p) => p.id !== hostId),
    [playersAll, hostId]
  );

  const roundIndex = round - 1;

  /* ===================== IMMUTABLE GROUPING ===================== */

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

      // ☠️ 사망자는 무조건 저승
      if (status === "DEAD") {
        return { ...acc, DEAD: [...acc.DEAD, p] };
      }

      const history = (p.getState("biomeHistory") as (BiomeId | null)[]) ?? [];
      const biome = history[roundIndex];

      if (!biome) {
        return { ...acc, NONE: [...acc.NONE, p] };
      }

      return {
        ...acc,
        [biome]: [...acc[biome], p],
      };
    }, initial);
  }, [players, roundIndex]);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      {/* ================= Header ================= */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm text-gray-400">{round} 라운드</p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">장소 이동</h1>
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

        <div className="tabular-nums text-sm font-medium text-gray-500">
          {mm}:{ss}
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
                      {p.getState("name") || p.getProfile().name}
                      {isAnimalRevealed && role && (
                        <span className="text-xs text-gray-500">
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

        {/* ================= NONE ================= */}
        <div className="rounded-xl bg-gray-50 px-6 py-5">
          <p className="mb-3 text-sm font-medium text-gray-600">
            선택 안 됨{" "}
            <span className="font-semibold text-blue-500">
              {grouped.NONE.length}
            </span>
          </p>

          <div className="flex flex-wrap gap-2">
            {grouped.NONE.map((p) => {
              const role = p.getState("role") as AnimalId | null;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm shadow-sm"
                >
                  {isAnimalRevealed && role && (
                    <img
                      src={`/animal/${role}.svg`}
                      className="h-5 w-5 rounded-full"
                    />
                  )}
                  {p.getState("name") || p.getProfile().name}
                  {isAnimalRevealed && role && (
                    <span className="text-xs text-gray-400">
                      {animalNameMap[role]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= DEAD / HELL ================= */}
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
                    <span className="text-xs text-gray-500 whitespace-nowrap">
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
          disabled={grouped.NONE.length > 0}
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={onNextPhase}
        >
          장소 이동 종료
        </Button>
      </div>
    </div>
  );
}

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

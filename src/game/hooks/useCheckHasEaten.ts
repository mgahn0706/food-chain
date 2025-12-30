import { usePlayersList, useMultiplayerState } from "playroomkit";
import { ANIMALS } from "../config/animals";
import type { AnimalId } from "../types/animal";
import type { AttackLog } from "../types/attackLog";

export default function useCheckHasEaten({ round }: { round: number }) {
  const players = usePlayersList(true);

  const [attackLogs, setAttackLogs] = useMultiplayerState<AttackLog[]>(
    "attackLogs",
    []
  );

  const killPlayer = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    player.setState("status", "DEAD", true);
  };

  const checkHasEaten = () => {
    const predators = players.filter((p) => {
      const role = p.getState("role") as AnimalId | null;
      return (
        role &&
        p.getState("status") === "ALIVE" &&
        ANIMALS[role].type === "PREDATOR"
      );
    });

    const starvedPredators = predators.filter((p) => {
      const role = p.getState("role") as AnimalId;
      const hasEaten = (p.getState("hasEaten") as boolean[]) ?? [];

      const starvedCount = hasEaten
        .slice(0, round)
        .filter((eaten) => !eaten).length;

      return starvedCount > ANIMALS[role].maximumStarvingCount;
    });

    console.log(
      "⭐ starvedPredators:",
      starvedPredators,
      predators.map((p) => ({
        name: p.getState("name"),
        hasEaten: p.getState("hasEaten"),
      }))
    );

    // ✅ 굶어 죽은 포식자 처리
    if (starvedPredators.length > 0) {
      const nextLogs: AttackLog[] = [...attackLogs];

      starvedPredators.forEach((p) => {
        killPlayer(p.id);

        nextLogs.push({
          round,
          type: "STARVE",
          attackerId: undefined,
          defenderId: p.id,
          message: `${p.getState("name")}님이 굶어 죽었습니다.`,
        });
      });

      // 🔑 playroomkit 방식
      setAttackLogs(nextLogs, true);
    }

    if (starvedPredators.length === 0) {
      return {
        message: "아무도 굶어 죽지 않았습니다.",
      };
    }

    return {
      message: `${starvedPredators
        .map((p) => `${p.getState("name")}님`)
        .join(", ")} 사망`,
    };
  };

  return { checkHasEaten };
}

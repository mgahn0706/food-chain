// hooks/usePlayerStatus.ts
import { usePlayersList } from "playroomkit";

export function usePlayerStatus() {
  const players = usePlayersList(true);

  const getPlayerById = (id: string) =>
    players.find((p) => p.id === id) ?? null;

  const killPlayer = (playerId: string) => {
    const player = getPlayerById(playerId);
    if (!player) return;

    player.setState("status", "DEAD", true);
  };

  const eatPlayer = (predatorId: string, preyId: string, round: number) => {
    const predator = getPlayerById(predatorId);
    const prey = getPlayerById(preyId);

    if (!predator || !prey) return;

    // predator.hasEaten[round - 1] = true (immutable)
    const prevHasEaten = (predator.getState("hasEaten") as boolean[]) ?? [];

    const nextHasEaten = [
      ...prevHasEaten.slice(0, round - 1),
      true,
      ...prevHasEaten.slice(round),
    ];

    predator.setState("hasEaten", nextHasEaten, true);

    // prey dead
    prey.setState("status", "DEAD", true);
  };

  return {
    players,
    getPlayerById,
    killPlayer,
    eatPlayer,
  };
}

import { useSyncHostId } from "@/game/hooks/useSyncHost";
import type { AnimalId } from "@/game/types/animal";
import { useMultiplayerState, usePlayersList } from "playroomkit";

const usePlayerRole = () => {
  const [role] = useMultiplayerState<AnimalId | null>("role", null);
  const players = usePlayersList(true);
  const hostId = useSyncHostId();

  const randomizePlayerRole = (availableRoles: AnimalId[]) => {
    if (players.length === 0) return;

    // ✅ Host 제외
    const nonHostPlayers = players.filter((player) => player.id !== hostId);

    if (nonHostPlayers.length === 0) return;

    // (안전) 역할 수가 맞지 않으면 early return
    if (availableRoles.length < nonHostPlayers.length) {
      console.warn(
        "[randomizePlayerRole] Not enough roles:",
        availableRoles.length,
        nonHostPlayers.length
      );
      return;
    }

    // ✅ 역할 셔플
    const shuffledRoles = [...availableRoles].sort(() => Math.random() - 0.5);

    // ✅ non-host 플레이어에게만 배정
    nonHostPlayers.forEach((player, index) => {
      player.setState("role", shuffledRoles[index]);
      player.setState("status", "ALIVE");
    });

    // (선택) Host role 명시적으로 null 처리
    const hostPlayer = players.find((p) => p.id === hostId);
    hostPlayer?.setState("role", null);
  };

  return { role, randomizePlayerRole };
};

export default usePlayerRole;

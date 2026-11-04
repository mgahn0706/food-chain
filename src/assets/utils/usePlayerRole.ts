import type { AnimalId } from "@/game/types/animal";
import { myPlayer, usePlayersList } from "playroomkit";

const usePlayerRole = () => {
  const players = usePlayersList(true);
  const hostId = myPlayer().id;

  const randomizePlayerRole = (availableRoles: AnimalId[]) => {
    if (players.length === 0) return [];

    // ✅ Host 제외
    const nonHostPlayers = players.filter((player) => player.id !== hostId);

    if (nonHostPlayers.length === 0) return [];

    // (안전) 역할 수가 맞지 않으면 early return
    if (availableRoles.length < nonHostPlayers.length) {
      console.warn(
        "[randomizePlayerRole] Not enough roles:",
        availableRoles.length,
        nonHostPlayers.length
      );
      return [];
    }

    // ✅ 역할 셔플
    const shuffledRoles = [...availableRoles].sort(() => Math.random() - 0.5);

    // ✅ non-host 플레이어에게만 배정
    const assignments = nonHostPlayers.map((player, index) => ({
      player,
      role: shuffledRoles[index],
    }));
    assignments.forEach(({ player, role }) => {
      player.setState("role", role);
      player.setState("status", "ALIVE");
      player.setState("hasEaten", [false, false, false, false]);
      player.setState("biomeHistory", []);
      player.setState("result", null);
    });

    // (선택) Host role 명시적으로 null 처리
    const hostPlayer = players.find((p) => p.id === hostId);
    hostPlayer?.setState("role", null);
    return assignments;
  };

  return { randomizePlayerRole };
};

export default usePlayerRole;

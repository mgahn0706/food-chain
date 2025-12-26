import GameScreen from "../assets/ui/lobby/GameScreen";
import LobbyScreen from "../assets/ui/lobby/LobbyScreen";
import { useLobbyState } from "../game/state/useLobbyState";

export default function GameRouter() {
  const { lobby } = useLobbyState();

  if (lobby.phase === "LOBBY") return <LobbyScreen />;
  return <GameScreen />;
}

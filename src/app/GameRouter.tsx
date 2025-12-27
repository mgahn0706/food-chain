import useGamePhase from "@/game/state/useGamePhase";
import LobbyScreen from "../assets/ui/lobby/LobbyScreen";

export default function GameRouter() {
  const { phase, round, moveToNextPhase } = useGamePhase();

  if (phase === "SETTING") {
    return <LobbyScreen />;
  }
  return null;
}

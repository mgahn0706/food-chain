import { useMultiplayerState } from "playroomkit";
import { defaultLobbyState, type LobbyState } from "../types/lobby";

export function useLobbyState() {
  const [lobby, setLobby] = useMultiplayerState<LobbyState>(
    "lobby",
    defaultLobbyState
  );

  const setPhase = (phase: LobbyState["phase"]) => {
    setLobby({ ...lobby, phase }, true);
  };

  const setAnimalConfig = (animalConfig: LobbyState["animalConfig"]) => {
    setLobby({ ...lobby, animalConfig }, true);
  };

  return { lobby, setLobby, setPhase, setAnimalConfig };
}

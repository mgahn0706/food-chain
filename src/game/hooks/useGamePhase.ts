import { useMultiplayerState } from "playroomkit";

type GamePhase =
  | "SETTING"
  | "ROLE_REVEAL"
  | "PEEKING"
  | "MOVE_BIOME"
  | "ATTACK"
  | "RESULT";

export default function useGamePhase() {
  const [round, setRound] = useMultiplayerState<number>("round", 0);
  const [phase, setPhase] = useMultiplayerState<GamePhase>("phase", "SETTING");

  const moveToNextPhase = () => {
    switch (phase) {
      case "SETTING":
        setPhase("ROLE_REVEAL");
        break;
      case "ROLE_REVEAL":
        setPhase("PEEKING");
        break;
      case "PEEKING":
        setPhase("MOVE_BIOME");
        setRound(1);
        break;
      case "MOVE_BIOME":
        setPhase("ATTACK");
        break;
      case "ATTACK":
        setRound(round + 1);
        round === 4 ? setPhase("RESULT") : setPhase("MOVE_BIOME");
        break;
      case "RESULT":
        setPhase("SETTING");
        setRound(0);
        break;
    }
  };

  return {
    phase,
    round,
    moveToNextPhase,
  };
}

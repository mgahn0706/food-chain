import useGamePhase from "@/game/hooks/useGamePhase";
import LobbyScreen from "../game/ui/lobby/LobbyScreen";
import usePreventUnload from "@/game/hooks/usePreventUnload";
import PeekingPhase from "@/game/ui/peeking/PeekingPhase";
import ResultPhase from "@/game/ui/result/ResultPhase";
import RoleRevealPhase from "@/game/ui/roleReveal/RoleRevealPhase";
import { useIsHost } from "playroomkit";
import MoveBiomePhaseHost from "@/game/ui/moveBiome/MoveBiomePhaseHost";
import MoveBiomePhasePlayer from "@/game/ui/moveBiome/MoveBiomePhasePlayer";
import AttackPhaseHost from "@/game/ui/attack/AttackPhaseHost";
import AttackPhasePlayer from "@/game/ui/attack/AttackPhasePlayer";

const BACKGROUND_COLOR = "#F9FAFC";

export default function GameRouter() {
  const { phase, round, moveToNextPhase } = useGamePhase();
  const isHost = useIsHost();

  usePreventUnload();

  return (
    <div
      className="flex min-h-[100dvh] w-full justify-center"
      style={{ backgroundColor: BACKGROUND_COLOR }}
    >
      <div className="w-full max-w-[1000px] px-4 py-[52px] sm:px-8 lg:px-12">
        {phase === "SETTING" && <LobbyScreen onNextPhase={moveToNextPhase} />}

        {phase === "ROLE_REVEAL" && (
          <RoleRevealPhase onNextPhase={moveToNextPhase} />
        )}

        {phase === "PEEKING" && <PeekingPhase onNextPhase={moveToNextPhase} />}

        {phase === "MOVE_BIOME" &&
          (isHost ? (
            <MoveBiomePhaseHost round={round} onNextPhase={moveToNextPhase} />
          ) : (
            <MoveBiomePhasePlayer round={round} />
          ))}

        {phase === "ATTACK" &&
          (isHost ? (
            <AttackPhaseHost round={round} onNextPhase={moveToNextPhase} />
          ) : (
            <AttackPhasePlayer round={round} />
          ))}

        {phase === "RESULT" && <ResultPhase onNextPhase={moveToNextPhase} />}
      </div>
    </div>
  );
}

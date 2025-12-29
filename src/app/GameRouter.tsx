import useGamePhase from "@/game/hooks/useGamePhase";
import LobbyScreen from "../assets/ui/lobby/LobbyScreen";
import usePreventUnload from "@/game/hooks/usePreventUnload";
import AttackPhase from "@/assets/ui/attack/AttackPhase";
import MoveBiomePhase from "@/assets/ui/moveBiome/MoveBiomePhasePlayer";
import PeekingPhase from "@/assets/ui/peeking/PeekingPhase";
import ResultPhase from "@/assets/ui/result/ResultPhase";
import RoleRevealPhase from "@/assets/ui/roleReveal/RoleRevealPhase";
import { useIsHost } from "playroomkit";
import MoveBiomePhaseHost from "@/assets/ui/moveBiome/MoveBiomePhaseHost";
import MoveBiomePhasePlayer from "@/assets/ui/moveBiome/MoveBiomePhasePlayer";

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

        {phase === "ATTACK" && (
          <AttackPhase round={round} onNextPhase={moveToNextPhase} />
        )}

        {phase === "RESULT" && <ResultPhase onNextPhase={moveToNextPhase} />}
      </div>
    </div>
  );
}

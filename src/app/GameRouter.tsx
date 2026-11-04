import useGamePhase from "@/game/hooks/useGamePhase";
import LobbyScreen from "../game/ui/lobby/LobbyScreen";
import usePreventUnload from "@/game/hooks/usePreventUnload";
import PeekingPhase from "@/game/ui/peeking/PeekingPhase";
import ResultPhase from "@/game/ui/result/ResultPhase";
import RoleRevealPhase from "@/game/ui/roleReveal/RoleRevealPhase";
import {
  myPlayer,
  useIsHost,
  useMultiplayerState,
  usePlayersList,
  usePlayerState,
} from "playroomkit";
import { useEffect } from "react";
import MoveBiomePhaseHost from "@/game/ui/moveBiome/MoveBiomePhaseHost";
import MoveBiomePhasePlayer from "@/game/ui/moveBiome/MoveBiomePhasePlayer";
import AttackPhaseHost from "@/game/ui/attack/AttackPhaseHost";
import AttackPhasePlayer from "@/game/ui/attack/AttackPhasePlayer";
import useDeathToast from "@/game/hooks/useDeathToast";
import RejoinScreen from "@/game/components/RejoinScreen";
import { savePlayer, type SavedPlayer } from "@/game/rejoin";

const BACKGROUND_COLOR = "#F9FAFC";

export default function GameRouter() {
  const { phase, round, moveToNextPhase } = useGamePhase();
  const isHost = useIsHost();
  const me = myPlayer();
  const [myRole] = usePlayerState<string | null>(me, "role", null);
  const players = usePlayersList(true);
  const [savedPlayers, setSavedPlayers] = useMultiplayerState<SavedPlayer[]>(
    "savedPlayers",
    []
  );

  useEffect(() => {
    if (!isHost || phase === "SETTING" || savedPlayers.length === 0) return;

    const updated = savedPlayers.map((saved) => {
      const player = players.find((p) => p.id === saved.currentId);
      return player?.getState("role") ? savePlayer(player, saved) : saved;
    });
    if (JSON.stringify(updated) !== JSON.stringify(savedPlayers)) {
      setSavedPlayers(updated, true);
    }
  }, [isHost, phase, players, savedPlayers, setSavedPlayers]);

  usePreventUnload();
  useDeathToast();

  return (
    <div
      className="flex min-h-[100dvh] w-full justify-center"
      style={{ backgroundColor: BACKGROUND_COLOR }}
    >
      <div className="w-full max-w-[1000px] px-4 py-[52px] sm:px-8 lg:px-12">
        {phase !== "SETTING" && !isHost && !myRole ? (
          <RejoinScreen />
        ) : (
          <>
            {phase === "SETTING" && (
              <LobbyScreen onNextPhase={moveToNextPhase} />
            )}

            {phase === "ROLE_REVEAL" && (
              <RoleRevealPhase onNextPhase={moveToNextPhase} />
            )}

            {phase === "PEEKING" && (
              <PeekingPhase onNextPhase={moveToNextPhase} />
            )}

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
          </>
        )}
      </div>
    </div>
  );
}

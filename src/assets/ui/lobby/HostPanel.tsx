import { useIsHost, usePlayersState } from "playroomkit";
import { useLobbyState } from "../../../game/state/useLobbyState";
import AnimalConfigPanel from "./AnimalConfigPanel";

export default function HostPanel() {
  const isHost = useIsHost();
  const { lobby, setPhase } = useLobbyState();

  const readyStates = usePlayersState("ready");
  const readyList = readyStates.map((x) => Boolean(x.state));
  const hasPlayers = readyList.length > 0;
  const allReady = hasPlayers && readyList.every((v) => v === true);

  if (!isHost) {
    return (
      <div className="muted">
        Only the host can configure animals and start the game.
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="muted">
        You are host. Configure the animal pool and start when everyone is
        ready.
      </div>

      <AnimalConfigPanel />

      <div className="rowLine">
        <div className="muted">Config size</div>
        <div>{lobby.animalConfig.length}</div>
      </div>

      <button
        className="btn primary"
        disabled={!allReady || lobby.animalConfig.length === 0}
        onClick={() => setPhase("INGAME")}
        title={
          lobby.animalConfig.length === 0
            ? "Select at least one animal"
            : !allReady
            ? "Not everyone is ready"
            : "Start game"
        }
      >
        Start Game
      </button>

      {!hasPlayers && <div className="muted">Waiting for players…</div>}
      {hasPlayers && !allReady && (
        <div className="muted">Someone is not ready yet.</div>
      )}
    </div>
  );
}

import { useMyLobbyPlayer } from "../../../game/state/useMyLobbyPlayer";

export default function ReadyPanel() {
  const { name, setName, ready, setReady } = useMyLobbyPlayer();

  return (
    <div className="stack">
      <label className="label">Display Name</label>
      <input
        className="input"
        value={name}
        onChange={(e) => setName(e.target.value, true)}
        placeholder="Type your name…"
      />

      <button
        className={ready ? "btn secondary" : "btn primary"}
        onClick={() => setReady(!ready, true)}
      >
        {ready ? "Cancel Ready" : "Ready"}
      </button>

      <div className="muted">
        Tip: Host can only start when everyone is ready.
      </div>
    </div>
  );
}

import { usePlayersList } from "playroomkit";
import PlayerRow from "./PlayerRow";

export default function PlayerList() {
  const players = usePlayersList(true);

  if (players.length === 0) {
    return <div className="muted">No players yet…</div>;
  }

  return (
    <div className="list">
      {players.map((p) => (
        <PlayerRow key={p.id} player={p} />
      ))}
    </div>
  );
}

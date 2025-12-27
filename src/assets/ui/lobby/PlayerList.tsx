import { myPlayer, useIsHost, usePlayersList } from "playroomkit";
import PlayerRow from "./PlayerRow";

export default function PlayerList() {
  const players = usePlayersList(true);
  const my = myPlayer();
  const isHost = useIsHost();

  if (players.length === 0) {
    return <div className="muted">No players yet…</div>;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-medium">플레이어</h2>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm">
          {players.length}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[...players].reverse().map((p) => (
          <PlayerRow
            key={p.id}
            player={p}
            isHost={isHost}
            isSelf={p.id === my.id}
          />
        ))}
      </div>
    </>
  );
}

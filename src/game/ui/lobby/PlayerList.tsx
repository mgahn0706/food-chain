import { usePlayersList } from "playroomkit";
import PlayerRow from "./PlayerRow";
import { useSyncHostId } from "@/game/hooks/useSyncHost";

export default function PlayerList() {
  const players = usePlayersList(true);

  const hostId = useSyncHostId();
  const host = players.find((player) => player.id === hostId);
  const gamePlayers = players.filter((player) => player.id !== hostId);

  if (players.length === 0) {
    return <div className="muted">No players yet…</div>;
  }

  return (
    <>
      {host && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">진행자</h2>
          <PlayerRow player={host} isHost />
        </section>
      )}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-medium">플레이어</h2>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm">
          {gamePlayers.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[...gamePlayers].reverse().map((p) => (
          <PlayerRow key={p.id} player={p} isHost={false} />
        ))}
      </div>
    </>
  );
}

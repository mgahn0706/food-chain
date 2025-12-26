import { usePlayerState, type PlayerState } from "playroomkit";

export default function PlayerRow({ player }: { player: PlayerState }) {
  const [name] = usePlayerState<string>(player, "name", "");
  const [ready] = usePlayerState<boolean>(player, "ready", false);

  const displayName = name?.trim() ? name.trim() : player.getProfile().name;

  return (
    <div className="row">
      <div className="rowMain">
        <div className="rowName">{displayName}</div>
        <div className="rowId">{player.id}</div>
      </div>

      <div className={ready ? "badge ok" : "badge"}>
        {ready ? "READY" : "NOT READY"}
      </div>
    </div>
  );
}

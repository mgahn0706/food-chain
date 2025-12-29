import { usePlayerState, type PlayerState } from "playroomkit";
import { Badge } from "@/components/ui/badge";

export default function PlayerRow({
  player,
  isHost,
}: {
  player: PlayerState;
  isHost: boolean;
}) {
  const [name] = usePlayerState<string>(player, "name", "");
  const [ready] = usePlayerState<boolean>(player, "ready", false);

  const displayName = name?.trim() ? name.trim() : player.getProfile().name;

  // deterministic user icon (1~7)
  const userIconIndex =
    (Math.abs(
      player.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
    ) %
      7) +
    1;

  const iconSrc = isHost
    ? "/user/host-icon.png"
    : `/user/user-icon-${userIconIndex}.png`;

  return (
    <div
      className="
        rounded-lg px-3 py-2
        hover:bg-gray-50 transition
        flex flex-col gap-2
        sm:flex-row sm:items-center sm:justify-between
      "
    >
      {/* 좌측: 아이콘 + 이름 */}
      <div className="flex items-center gap-3 min-w-0">
        <img src={iconSrc} alt="user icon" className="h-9 w-9 shrink-0" />

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">{displayName}</span>
          <span className="text-xs text-gray-400 truncate">{player.id}</span>
        </div>
      </div>

      {/* 우측: 역할 + 상태 */}
      <div className="flex items-center gap-2 justify-end sm:justify-start">
        {isHost && (
          <span className="text-xs font-medium text-yellow-600">붕대맨</span>
        )}
        {!isHost && (
          <Badge
            variant={ready ? "default" : "secondary"}
            className={`
            text-xs
            ${ready ? "bg-blue-500 text-white" : "text-gray-500"}
          `}
          >
            {ready ? "준비" : "준비 안 함"}
          </Badge>
        )}
      </div>
    </div>
  );
}

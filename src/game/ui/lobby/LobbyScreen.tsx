import { getRoomCode, myPlayer } from "playroomkit";
import PlayerList from "./PlayerList";
import ReadyPanel from "./ReadyPanel";
import SettingPhase from "./SettingPhase";
import { useSyncHostId } from "@/game/hooks/useSyncHost";

export default function LobbyScreen({
  onNextPhase,
}: {
  onNextPhase: () => void;
}) {
  const my = myPlayer();
  const hostId = useSyncHostId();

  const isHost = my.id === hostId;

  const roomCode = getRoomCode();

  return (
    <div className="flex h-full w-full flex-col gap-6 px-6 py-4">
      {isHost && (
        <div className="text-center text-sm text-gray-500">
          주소:{" "}
          <span className="font-mono font-bold">
            https://food-chain-genius.vercel.app/#r=R{roomCode}
          </span>
        </div>
      )}
      <PlayerList />

      {!isHost && <ReadyPanel />}

      {isHost && (
        <div className="mt-4">
          <SettingPhase onNextPhase={onNextPhase} />
        </div>
      )}
    </div>
  );
}

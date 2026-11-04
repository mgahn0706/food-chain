import { getRoomCode, myPlayer } from "playroomkit";
import { useState } from "react";
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
  const inviteLink = `${window.location.origin}${window.location.pathname}${window.location.search}#r=R${roomCode}`;
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex h-full w-full flex-col gap-6 px-6 py-4">
      {isHost && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          <span>방 코드</span>
          <strong className="font-mono text-xl tracking-widest text-gray-900">{roomCode}</strong>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(inviteLink);
              setCopied(true);
            }}
            className="mt-1 rounded-full bg-blue-500 px-5 py-2 font-medium text-white hover:bg-blue-600"
          >
            {copied ? "초대 링크 복사됨" : "초대 링크 복사"}
          </button>
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

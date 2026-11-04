import { myPlayer, useMultiplayerState, usePlayersList } from "playroomkit";
import { useState } from "react";
import { restorePlayer, type SavedPlayer } from "@/game/rejoin";

export default function RejoinScreen() {
  const me = myPlayer();
  const players = usePlayersList(true);
  const [savedPlayers, setSavedPlayers] = useMultiplayerState<SavedPlayer[]>(
    "savedPlayers",
    []
  );
  const [selectedId, setSelectedId] = useState("");
  const [joining, setJoining] = useState(false);

  const connectedIds = new Set(players.map((player) => player.id));
  const available = savedPlayers.filter(
    (saved) => !connectedIds.has(saved.currentId) || saved.currentId === me.id
  );

  const join = () => {
    const saved = available.find((player) => player.originalId === selectedId);
    if (!saved || joining) return;

    setJoining(true);
    setSavedPlayers(
      savedPlayers.map((player) =>
        player.originalId === saved.originalId
          ? { ...player, currentId: me.id }
          : player
      ),
      true
    );
    restorePlayer(me, saved);
  };

  return (
    <div className="mx-auto flex min-h-[60dvh] w-full max-w-md flex-col items-center justify-center gap-5 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">진행 중인 게임</h1>
      {available.length > 0 ? (
        <>
          <p className="text-sm text-gray-600">
            게임 중 연결이 끊겼다면 이전 사용자를 선택해 다시 참가하세요.
          </p>
          <label className="w-full text-left text-sm font-medium text-gray-700" htmlFor="rejoin-player">
            이전 사용자
          </label>
          <select
            id="rejoin-player"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900"
          >
            <option value="">사용자 선택</option>
            {available.map((player) => (
              <option key={player.originalId} value={player.originalId}>
                {player.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={join}
            disabled={!selectedId || joining}
            className="w-full rounded-full bg-blue-500 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            다시 참가
          </button>
        </>
      ) : (
        <p className="text-sm text-gray-600">
          지금 다시 참가할 수 있는 사용자가 없습니다.
        </p>
      )}
    </div>
  );
}

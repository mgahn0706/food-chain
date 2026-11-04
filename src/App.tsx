import { useEffect, useRef, useState } from "react";
import { insertCoin } from "playroomkit";
import GameRouter from "./app/GameRouter";
import { Toaster } from "sonner";

type ConnectionState = "idle" | "connecting" | "connected";

function roomCodeFromInvite(value: string) {
  try {
    const url = new URL(value);
    const room = new URLSearchParams(url.hash.slice(1)).get("r");
    return room?.startsWith("R") ? room.slice(1) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [connection, setConnection] = useState<ConnectionState>("idle");
  const [roomInput, setRoomInput] = useState("");
  const [error, setError] = useState("");
  const autoJoinStarted = useRef(false);

  const connect = async (roomCode?: string) => {
    setConnection("connecting");
    setError("");
    try {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}${roomCode ? `#r=R${roomCode}` : ""}`
      );
      await insertCoin({
        gameId: import.meta.env.VITE_PLAYROOM_GAME_ID,
        skipLobby: true,
        ...(roomCode ? { roomCode } : {}),
      });
      setConnection("connected");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "방에 연결하지 못했습니다. 코드를 확인하고 다시 시도하세요."
      );
      setConnection("idle");
    }
  };

  useEffect(() => {
    if (autoJoinStarted.current) return;
    const inviteRoom = new URLSearchParams(window.location.hash.slice(1)).get("r");
    if (!inviteRoom?.startsWith("R") || inviteRoom.length < 2) return;
    autoJoinStarted.current = true;
    queueMicrotask(() => void connect(inviteRoom.slice(1)));
  }, []);

  const joinRoom = () => {
    const code = roomCodeFromInvite(roomInput.trim()) ?? roomInput.trim();
    if (!/^[a-zA-Z0-9_-]{1,32}$/.test(code)) {
      setError("올바른 방 코드를 입력하세요.");
      return;
    }
    void connect(code);
  };

  if (connection === "connected") {
    return (
      <>
        <GameRouter />
        <Toaster />
      </>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0b0b0f] px-5 text-white">
      <main className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-extrabold md:text-5xl">먹이사슬</h1>
        <p className="text-sm leading-6 text-gray-400 md:text-base">
          포식자와 피식자들은 지역을 이동하며 생존하고
          <br />
          게임 종료 전까지 각자의 승리조건을 충족하라
        </p>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-gray-500 to-transparent" />

        {connection === "connecting" ? (
          <div className="flex flex-col items-center gap-4" role="status">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-600 border-t-white" />
            <p className="text-sm text-gray-400">방에 연결하는 중…</p>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-4">
            <button
              type="button"
              onClick={() => void connect()}
              className="rounded-full bg-blue-500 px-4 py-3 font-semibold hover:bg-blue-600"
            >
              방 만들기
            </button>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="h-px flex-1 bg-gray-700" />또는
              <span className="h-px flex-1 bg-gray-700" />
            </div>
            <label htmlFor="room-code" className="text-left text-sm text-gray-300">
              방 코드 또는 초대 링크
            </label>
            <input
              id="room-code"
              value={roomInput}
              onChange={(event) => setRoomInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") joinRoom();
              }}
              placeholder="방 코드를 입력하세요"
              className="rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none focus:border-blue-400"
            />
            <button
              type="button"
              onClick={joinRoom}
              className="rounded-full border border-gray-500 px-4 py-3 font-semibold hover:bg-gray-800"
            >
              방 참가
            </button>
          </div>
        )}
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import { insertCoin } from "playroomkit";
import GameRouter from "./app/GameRouter";
import { Toaster } from "sonner";

export default function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    insertCoin({
      gameId: import.meta.env.VITE_PLAYROOM_GAME_ID,
    }).then(() => setConnected(true));
  }, []);

  if (!connected) {
    return (
      <div className="h-screen w-screen bg-[#0b0b0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            먹이사슬
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-gray-400 tracking-wide">
            포식자와 피식자들은 지역을 이동하며 생존하고
            <br /> 게임 종료 전까지 각자의 승리조건을 충족하라
          </p>

          {/* Divider */}
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent" />

          {/* Spinner */}
          <div className="relative">
            <div className="h-10 w-10 rounded-full border-2 border-gray-600 border-t-white animate-spin" />
          </div>

          {/* Loading Text */}
          <p className="text-xs text-gray-500 tracking-widest animate-pulse">
            CONNECTING TO LOBBY
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <GameRouter />
      <Toaster />
    </>
  );
}

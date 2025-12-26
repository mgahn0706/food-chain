import { useEffect, useState } from "react";
import { insertCoin } from "playroomkit";
import GameRouter from "./app/GameRouter";

export default function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    insertCoin({
      gameId: import.meta.env.VITE_PLAYROOM_GAME_ID,
      // you can customize lobby options here
    }).then(() => setConnected(true));
  }, []);

  if (!connected) {
    return <div className="loading">Connecting to Playroom lobby...</div>;
  }

  return <GameRouter />;
}

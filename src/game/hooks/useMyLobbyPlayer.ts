import { useEffect } from "react";
import { myPlayer, usePlayerState } from "playroomkit";

export function useMyLobbyPlayer() {
  const me = myPlayer();

  const [name, setName] = usePlayerState(me, "name", "");
  const [ready, setReady] = usePlayerState(me, "ready", false);

  // ✅ Player 객체의 기본 name을 최초 1회만 반영
  useEffect(() => {
    if (!name && me?.getProfile().name) {
      setName(me.getProfile().name, true); // broadcast
    }
  }, [name, me, setName]);

  return {
    me,
    name,
    setName,
    ready,
    setReady,
  };
}

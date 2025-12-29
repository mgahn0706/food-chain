// game/state/useHost.ts
import { useEffect } from "react";
import { useIsHost, myPlayer, useMultiplayerState } from "playroomkit";

export function useSyncHostId() {
  const isHost = useIsHost();
  const my = myPlayer();

  const [hostId, setHostId] = useMultiplayerState<string | null>(
    "hostId",
    null
  );

  useEffect(() => {
    if (isHost && my.id) {
      setHostId(my.id);
    }
  }, [isHost, my.id, setHostId]);

  return hostId;
}

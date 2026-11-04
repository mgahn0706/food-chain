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
    if (isHost && my.id && hostId !== my.id) {
      setHostId(my.id, true);
    }
  }, [isHost, my.id, hostId, setHostId]);

  return isHost ? my.id : hostId;
}

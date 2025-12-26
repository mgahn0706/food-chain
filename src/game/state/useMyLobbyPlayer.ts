import { myPlayer, usePlayerState } from "playroomkit";

export function useMyLobbyPlayer() {
  const me = myPlayer();

  const [name, setName] = usePlayerState<string>(me, "name", "");
  const [ready, setReady] = usePlayerState<boolean>(me, "ready", false);

  return { me, name, setName, ready, setReady };
}

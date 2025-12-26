import { useEffect, useState } from "react";
import { insertCoin } from "playroomkit";

/**
 * Initializes Playroom once.
 * - Shows the Playroom lobby UI (room create/join, profile)
 * - Resolves when host hits "Launch" in Playroom lobby UI
 *
 * Docs: insertCoin() :contentReference[oaicite:2]{index=2}
 */
export function usePlayroomInit() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await insertCoin({
          gameId: import.meta.env.VITE_PLAYROOM_GAME_ID,
        });
        if (mounted) setReady(true);
      } catch (e) {
        if (mounted) setError(e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { ready, error };
}

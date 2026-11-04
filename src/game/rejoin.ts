import type { PlayerState } from "playroomkit";
import type { AnimalId } from "./types/animal";

const PLAYER_STATE_KEYS = [
  "name", "role", "status", "ready", "checkedRole", "camouflagedTo",
  "predictWinner", "predictedWinner", "biomeHistory", "hasEaten", "result",
] as const;

export type SavedPlayer = {
  originalId: string;
  currentId: string;
  name: string;
  state: Record<string, unknown>;
};

export function savePlayer(player: PlayerState, previous?: SavedPlayer): SavedPlayer {
  const state = Object.fromEntries(
    PLAYER_STATE_KEYS.map((key) => [key, player.getState(key) ?? null])
  );
  return {
    originalId: previous?.originalId ?? player.id,
    currentId: player.id,
    name: String(state.name || player.getProfile().name || "Player"),
    state,
  };
}

export function initialPlayer(
  player: PlayerState,
  role: AnimalId
): SavedPlayer {
  return {
    originalId: player.id,
    currentId: player.id,
    name: String(player.getState("name") || player.getProfile().name || "Player"),
    state: {
      name: player.getState("name") || player.getProfile().name || "Player",
      role,
      status: "ALIVE",
      ready: player.getState("ready") ?? false,
      checkedRole: false,
      camouflagedTo: null,
      predictedWinner: null,
      predictWinner: null,
      biomeHistory: [],
      hasEaten: [false, false, false, false],
      result: null,
    },
  };
}

export function restorePlayer(player: PlayerState, saved: SavedPlayer) {
  for (const [key, value] of Object.entries(saved.state)) {
    if (key !== "role") player.setState(key, value, true);
  }
  // The role is written last so the game view opens after the other state is restored.
  player.setState("role", saved.state.role, true);
}

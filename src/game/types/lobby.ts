import type { AnimalId } from "./animal";

export type LobbyPhase = "LOBBY" | "INGAME";

export type LobbyState = {
  phase: LobbyPhase;
  animalConfig: AnimalId[]; // host-selected pool
};

export const defaultLobbyState: LobbyState = {
  phase: "LOBBY",
  animalConfig: [],
};

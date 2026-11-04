import type { GamePlayer } from "../ui/result/ResultPhase";

export type BiomeId = "RIVER" | "FIELD" | "FOREST" | "SKY";

export type AnimalId =
  | "LION"
  | "CROCODILE"
  | "EAGLE"
  | "HYENA"
  | "DEER"
  | "HARE"
  | "OTTER"
  | "MALLARD"
  | "EGYPTEAN_PLOVER"
  | "RAT"
  | "CHAMELEON"
  | "SNAKE"
  | "CROW"
  | "ARMADILLO"
  | "TURTLE"
  | "WOLF"
  | "RATTLESNAKE"
  | "FLYING_SQUIRREL"
  | "SHEEP"
  | "PLATYPUS"
  | "BAT"
  | "COCK_PHEASANT"
  | "HEN_PHEASANT"
  | "HAWK"
  | "FOX"
  | "LIZARD"
  | "CAT"
  | "CHEETAH"
  | "CAPYBARA";

export interface Player {
  id: number;
  name: string;
  role: AnimalId | null;
  biomeHistory: Array<BiomeId | null>;
  status: "ALIVE" | "DEAD";
  hasEaten: Array<boolean | null>;
  camouflagedTo?: AnimalId;
  predictedWinner?: AnimalId;
  protectedRound?: number | null;
  contactedAnimalCount?: number;
  result: "WIN" | "LOSE" | null;
}

export interface Animal {
  id: AnimalId;
  icon?: string;
  type: "PREDATOR" | "PREY";
  name: string;
  mainHabitat: BiomeId;
  maximumStarvingCount: number;
  peekingCount: 1 | 2;
  rank: number;
  unacceptableBiomes: BiomeId[];
  onVictoryCheck: (players: GamePlayer[]) => boolean;
}

import type { AnimalId } from "../types/animal";
import { DEFAULT_ANIMALS } from "./animals";

const ORIGINAL_CARD_ANIMALS = new Set<AnimalId>(DEFAULT_ANIMALS);

export function animalCardSrc(animal: AnimalId) {
  return ORIGINAL_CARD_ANIMALS.has(animal)
    ? `/card/${animal}.png`
    : `/animal/${animal}.svg`;
}

import { useIsHost, usePlayersList, useMultiplayerState } from "playroomkit";
import type { AnimalId } from "../../../game/types/ids";
import { ALL_ANIMALS } from "../../../game/config/animals";
import { animalNameMap } from "@/assets/utils/animalNameMap";

export default function SettingPhase() {
  const isHost = useIsHost();
  const players = usePlayersList(true);

  const [animalConfig, setAnimalConfig] = useMultiplayerState<AnimalId[]>(
    "animalConfig",
    [...ALL_ANIMALS]
  );

  if (!isHost) return null;

  const playerCount = players.length;
  const selectedAnimals = animalConfig;

  const toggleAnimal = (id: AnimalId) => {
    setAnimalConfig(
      selectedAnimals.includes(id)
        ? selectedAnimals.filter((a) => a !== id)
        : [...selectedAnimals, id],
      true
    );
  };

  const canStart =
    playerCount >= 2 && selectedAnimals.length - 1 === playerCount;

  return (
    <div className="w-full flex flex-col gap-8">
      {/* ================= 동물 설정 ================= */}
      <div>
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">동물 설정</h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm">
              {selectedAnimals.length}
            </span>
          </div>

          {selectedAnimals.length > 0 ? (
            <button
              className="text-sm font-medium text-blue-600 hover:underline"
              onClick={() => setAnimalConfig([], true)}
            >
              선택 취소
            </button>
          ) : (
            <button
              className="text-sm font-medium text-blue-600 hover:underline"
              onClick={() => setAnimalConfig([...ALL_ANIMALS], true)}
            >
              전체 선택
            </button>
          )}
        </div>

        {/* ===== 동물 선택 Grid ===== */}
        <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3">
          {ALL_ANIMALS.map((animalId) => {
            const isSelected = selectedAnimals.includes(animalId);

            return (
              <button
                key={animalId}
                onClick={() => toggleAnimal(animalId)}
                className={`
                  relative flex items-center justify-between
                  rounded-xl px-3 py-2
                  border transition
                  ${
                    isSelected
                      ? "bg-blue-50 border-blue-500 shadow-sm"
                      : "bg-white border-transparent hover:bg-gray-50"
                  }
                `}
              >
                {/* 아이콘 + 이름 */}
                <div
                  className={`
                    flex items-center gap-2 min-w-0
                    ${!isSelected && "opacity-60"}
                  `}
                >
                  <img
                    src={`src/assets/animal/${animalId}.svg`}
                    alt={animalId}
                    className="h-8 w-8 shrink-0"
                  />
                  <span className="text-sm font-medium truncate">
                    {animalNameMap[animalId]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 게임 시작 ================= */}
      <div>
        <button
          disabled={!canStart}
          className={`
            w-full rounded-full py-3 text-base font-semibold transition
            ${
              canStart
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }
          `}
        >
          게임 시작
        </button>

        {!canStart && (
          <p className="mt-2 text-center text-sm text-gray-400">
            플레이어 수와 선택한 동물 수가 같아야 합니다
          </p>
        )}
      </div>
    </div>
  );
}

import { useIsHost, usePlayersList, useMultiplayerState } from "playroomkit";
import type { AnimalId } from "../../../game/types/ids";
import { ALL_ANIMALS } from "../../../game/config/animals";

export default function SettingPhase({
  onNextPhase,
}: {
  onNextPhase: () => void;
}) {
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

  return (
    <div className="w-full">
      {/* ================= 플레이어 설정 ================= */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-medium">플레이어 설정</h2>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-sm">
          {playerCount}
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-3">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex flex-col items-center justify-center rounded-xl bg-gray-100 px-2 py-2"
            >
              <span className="text-xs text-gray-500">{p.id.slice(0, 4)}</span>
              <span className="text-base font-medium">
                {p.getProfile().name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 동물 설정 ================= */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">동물 설정</h2>
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-sm">
              {selectedAnimals.length}
            </span>
          </div>

          {selectedAnimals.length > 0 ? (
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setAnimalConfig([], true)}
            >
              선택 취소
            </button>
          ) : (
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setAnimalConfig([...ALL_ANIMALS], true)}
            >
              전체 선택
            </button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {ALL_ANIMALS.map((animalId) => {
            const isSelected = selectedAnimals.includes(animalId);
            return (
              <button
                key={animalId}
                onClick={() => toggleAnimal(animalId)}
                className={`flex items-center justify-between rounded-xl px-3 py-2 transition
                  ${
                    isSelected
                      ? "bg-blue-50 ring-1 ring-blue-400"
                      : "hover:bg-gray-100"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`/image/icon/food-chain/${animalId}.svg`}
                    alt={animalId}
                    className="h-8 w-8"
                  />
                  <span className="text-sm font-medium">{animalId}</span>
                </div>

                <span
                  className={`text-sm ${
                    isSelected ? "text-blue-500" : "text-gray-300"
                  }`}
                >
                  ●
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 게임 시작 ================= */}
      <div className="mt-8">
        <button
          className={`w-full rounded-full py-3 text-base font-semibold transition
            ${
              playerCount < 2 || selectedAnimals.length !== playerCount
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-black text-white hover:bg-gray-900"
            }
          `}
          disabled={playerCount < 2 || selectedAnimals.length !== playerCount}
          onClick={onNextPhase}
        >
          게임 시작
        </button>
      </div>
    </div>
  );
}

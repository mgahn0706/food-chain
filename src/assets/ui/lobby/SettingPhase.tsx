import { useIsHost, usePlayersList, useMultiplayerState } from "playroomkit";

import type { AnimalId } from "../../../game/types/ids";
import { ALL_ANIMALS } from "../../../game/config/animals";
import { animalNameMap } from "@/assets/utils/animalNameMap";
import { useSyncHostId } from "@/game/hooks/useSyncHost";
import usePlayerRole from "@/assets/utils/usePlayerRole";

export default function SettingPhase({
  onNextPhase,
}: {
  onNextPhase: () => void;
}) {
  const isHost = useIsHost();
  const players = usePlayersList(true);
  const hostId = useSyncHostId();

  const [animalConfig, setAnimalConfig] = useMultiplayerState<AnimalId[]>(
    "animalConfig",
    [...ALL_ANIMALS]
  );
  const { randomizePlayerRole } = usePlayerRole();

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

  /* ================= Ready 체크 ================= */

  // host 제외한 모든 플레이어가 ready인지
  const allNonHostReady = players
    .filter((p) => p.id !== hostId)
    .every((p) => p.getState("ready") === true);

  /* ================= 시작 가능 여부 ================= */

  const canStart =
    playerCount >= 2 &&
    selectedAnimals.length === playerCount - 1 &&
    allNonHostReady;

  return (
    <div className="w-full flex flex-col gap-8">
      {/* ================= 동물 설정 ================= */}
      <section className="flex flex-col gap-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">동물 설정</h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-700">
              {selectedAnimals.length}
            </span>
          </div>

          {selectedAnimals.length > 0 ? (
            <button
              type="button"
              onClick={() => setAnimalConfig([], true)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              선택 취소
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAnimalConfig([...ALL_ANIMALS], true)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              전체 선택
            </button>
          )}
        </div>

        {/* ===== 동물 선택 Grid ===== */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
          {ALL_ANIMALS.map((animalId) => {
            const isSelected = selectedAnimals.includes(animalId);

            return (
              <button
                key={animalId}
                type="button"
                onClick={() => toggleAnimal(animalId)}
                className={`
                  relative flex items-center justify-between
                  rounded-xl px-3 py-2
                  border transition-colors duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${
                    isSelected
                      ? "bg-blue-50 border-blue-500 shadow-sm"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }
                `}
              >
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
                  <span className="text-sm font-medium truncate text-gray-900">
                    {animalNameMap[animalId]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ================= 게임 시작 ================= */}
      <section className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            randomizePlayerRole(animalConfig);
            onNextPhase();
          }}
          disabled={!canStart}
          className={`
            w-full rounded-full py-3 text-base font-semibold
            transition-colors duration-150
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            ${
              canStart
                ? "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          게임 시작
        </button>

        {!canStart && (
          <p className="text-center text-sm text-gray-500">
            모든 플레이어가 준비 완료 상태여야 합니다.
          </p>
        )}
      </section>
    </div>
  );
}

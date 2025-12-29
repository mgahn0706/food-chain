import { animalNameMap } from "@/assets/utils/animalNameMap";
import type { AnimalId } from "@/game/types/ids";
import { Smartphone, ArrowRight } from "lucide-react";
import { myPlayer, useIsHost, usePlayersList } from "playroomkit";
import Tilt from "react-parallax-tilt";

export default function RoleRevealPhase({
  onNextPhase,
}: {
  onNextPhase: () => void;
}) {
  const isHost = useIsHost();
  const me = myPlayer();

  const role = me.getState("role") as AnimalId | null;

  const players = usePlayersList(true);

  /* ===================== HOST LOGIC ===================== */
  const uncheckedPlayers = players.filter(
    (p) => p.id !== me.id && p.getState("checkedRole") !== true
  );

  const allChecked = uncheckedPlayers.length === 0;

  /* ===================== HOST VIEW ===================== */
  if (isHost) {
    return (
      <div className="flex h-full w-full items-center justify-center px-6">
        <div className="flex max-w-xl flex-col items-center gap-8 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-snug">
            플레이어분들은 각자 동물을
            <br />
            확인해주십시오.
          </h1>

          <div className="flex flex-col items-center gap-3">
            <Smartphone
              className="h-10 w-10 text-gray-700 animate-phone-hint"
              strokeWidth={1.5}
            />
            <p className="text-sm text-gray-500">
              카멜레온, 까마귀 등 행동이 필요한 동물들은 지금 행동을
              진행해주세요.
            </p>
          </div>

          {/* 다음 단계 버튼 */}
          <button
            onClick={onNextPhase}
            disabled={!allChecked}
            className={`
              relative z-10
              mt-2 inline-flex items-center gap-2
              rounded-full px-5 py-2
              text-sm font-medium
              transition-colors duration-150
              ${
                allChecked
                  ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  : "bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed"
              }
            `}
          >
            다음 단계
            <ArrowRight className="h-4 w-4 pointer-events-none" />
          </button>

          {/* 미확인 플레이어 목록 */}
          {!allChecked && (
            <div className="mt-2 text-sm text-gray-500">
              <p className="mb-1">아직 확인하지 않은 플레이어</p>
              <ul className="list-disc list-inside space-y-1">
                {uncheckedPlayers.map((p) => (
                  <li key={p.id}>{p.getProfile().name}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-400">
            모든 플레이어가 확인해야 다음 단계로 넘어갈 수 있습니다.
          </p>
        </div>

        {/* animation */}
        <style>{`
          @keyframes phoneHint {
            0% { transform: translateY(6px); opacity: 0.5; }
            50% { transform: translateY(0px); opacity: 1; }
            100% { transform: translateY(6px); opacity: 0.5; }
          }
          .animate-phone-hint {
            animation: phoneHint 1.8s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  /* ===================== PLAYER VIEW ===================== */

  const checkedRole = me.getState("checkedRole") === true;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 gap-6">
      {role && (
        <>
          <Tilt
            tiltMaxAngleX={12}
            tiltMaxAngleY={12}
            scale={1.08}
            transitionSpeed={600}
          >
            <img
              src={`src/assets/animal/${role}.svg`}
              alt="role reveal"
              className="h-32 w-32 md:h-40 md:w-40 select-none"
              draggable={false}
            />
          </Tilt>

          <p className="text-base md:text-lg text-gray-700">
            당신의 동물은{" "}
            <span className="font-semibold text-blue-500">
              {animalNameMap[role]}
            </span>
            입니다
          </p>

          {/* 확인 버튼 */}
          <button
            disabled={checkedRole}
            onClick={() => me.setState("checkedRole", true, true)}
            className={`
              mt-2 w-full max-w-xs rounded-full py-3 text-sm font-medium
              transition
              ${
                checkedRole
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
              }
            `}
          >
            {checkedRole ? "확인 완료" : "확인했어요"}
          </button>
        </>
      )}
    </div>
  );
}

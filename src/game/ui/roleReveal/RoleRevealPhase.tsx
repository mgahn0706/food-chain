import { animalNameMap } from "@/assets/utils/animalNameMap";
import type { AnimalId } from "@/game/types/animal";
import { Smartphone, ArrowRight } from "lucide-react";
import { myPlayer, useIsHost, usePlayersList } from "playroomkit";
import Tilt from "react-parallax-tilt";

// shadcn
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_ANIMALS } from "@/game/config/animals";

export default function RoleRevealPhase({
  onNextPhase,
}: {
  onNextPhase: () => void;
}) {
  const isHost = useIsHost();
  const me = myPlayer();
  const players = usePlayersList(true);

  const role = me.getState("role") as AnimalId | null;

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

          <button
            onClick={onNextPhase}
            disabled={!allChecked}
            className={`
              relative z-10 mt-2 inline-flex items-center gap-2
              rounded-full px-5 py-2 text-sm font-medium
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
          {!allChecked && (
            <div className="mt-4 w-full max-w-md">
              <p className="mb-2 text-sm font-medium text-gray-600">
                아직 확인하지 않은 플레이어
              </p>

              <div className="flex flex-wrap gap-2 justify-center">
                {uncheckedPlayers.map((p) => {
                  const name =
                    p.getState("name") || p.getProfile().name || "Player";

                  return (
                    <div
                      key={p.id}
                      className="
              flex items-center gap-2
              rounded-full px-3 py-1.5
              text-sm text-gray-700
              bg-white border border-gray-200
              shadow-sm
              hover:border-gray-300 hover:bg-gray-50
              transition
            "
                    >
                      {/* status dot */}
                      <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                      <span>{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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

  // CHAMELEON
  const camouflage = me.getState("camouflagedTo") as AnimalId | null;

  // CROW
  const predict = me.getState("predictWinner") as AnimalId | null;

  const mustPickCamouflage = role === "CHAMELEON";
  const mustPickPredict = role === "CROW";

  const canConfirm =
    !checkedRole &&
    (!mustPickCamouflage || !!camouflage) &&
    (!mustPickPredict || !!predict);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 gap-6">
      {role && (
        <>
          <Tilt
            tiltMaxAngleX={12}
            tiltMaxAngleY={12}
            scale={1.1}
            transitionSpeed={600}
          >
            <img
              src={`/card/${role}.png`}
              alt="role reveal"
              className="h-68 w-48 md:h-68 md:w-48 select-none"
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

          {/* ================= CHAMELEON ================= */}
          {role === "CHAMELEON" && (
            <div className="w-full max-w-xs">
              <p className="mb-2 text-sm text-gray-500">
                위장할 동물을 선택하세요
              </p>

              <Select
                disabled={checkedRole}
                value={camouflage || undefined}
                onValueChange={(v) => me.setState("camouflagedTo", v, true)}
              >
                <SelectTrigger className="w-full rounded-full">
                  <SelectValue placeholder="동물 선택" />
                </SelectTrigger>

                <SelectContent>
                  {ALL_ANIMALS.filter((animal) => animal !== "CHAMELEON").map(
                    (animal) => (
                      <SelectItem key={animal} value={animal}>
                        {animalNameMap[animal]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ================= CROW ================= */}
          {role === "CROW" && (
            <div className="w-full max-w-xs">
              <p className="mb-2 text-sm text-gray-500">
                승리할 것으로 예상되는 동물을 선택하세요
              </p>

              <Select
                disabled={checkedRole}
                value={predict || undefined}
                onValueChange={(v) => me.setState("predictWinner", v, true)}
              >
                <SelectTrigger className="w-full rounded-full">
                  <SelectValue placeholder="동물 선택" />
                </SelectTrigger>

                <SelectContent>
                  {ALL_ANIMALS.filter((animal) => animal !== "CROW").map(
                    (animal) => (
                      <SelectItem key={animal} value={animal}>
                        {animalNameMap[animal]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ================= 확인 버튼 ================= */}
          <button
            disabled={!canConfirm}
            onClick={() => me.setState("checkedRole", true, true)}
            className={`
              mt-2 w-full max-w-xs rounded-full py-3 text-sm font-medium
              transition
              ${
                canConfirm
                  ? "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
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

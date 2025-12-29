import { myPlayer, useMultiplayerState, usePlayersList } from "playroomkit";
import { useState } from "react";
import type { AnimalId } from "../types/animal";
import type { AttackLog } from "../types/attackLog";
import { IdCard, Skull } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { animalNameMap } from "@/assets/utils/animalNameMap";
import { BIOMES } from "@/game/config/biome";
import type { BiomeId } from "@/game/types/biome";
import { ANIMALS } from "../config/animals";
import { Description } from "@radix-ui/react-dialog";

/* ===================== constants ===================== */

const TOTAL_ROUNDS = 4;

/* ===================== components ===================== */

function Parallelogram({ active }: { active: boolean }) {
  return (
    <div
      className={[
        "relative h-6 w-10 skew-x-[-20deg] border",
        active
          ? "bg-green-500 border-green-600"
          : "bg-gray-200 border-gray-300",
      ].join(" ")}
    >
      {!active && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-500">
          ×
        </span>
      )}
    </div>
  );
}

/* ===================== main ===================== */

export default function PlayerHeader() {
  const me = myPlayer();
  const players = usePlayersList(true);

  const myRole = me.getState("role") as AnimalId | null;
  const hasEaten = (me.getState("hasEaten") as boolean[]) ?? [];

  const [attackLogs] = useMultiplayerState<AttackLog[]>("attackLogs", []);

  const [openRole, setOpenRole] = useState(false);
  const [openDeathLog, setOpenDeathLog] = useState(false);

  /* ===================== death logs ===================== */

  const deathLogs = attackLogs.filter(
    (log) => log.type === "KILL" && log.defenderId
  );

  const resolveDeathText = (log: AttackLog) => {
    const player = players.find((p) => p.id === log.defenderId);
    if (!player) return null;

    const name = player.getState("name") || player.getProfile().name;

    const biomeHistory =
      (player.getState("biomeHistory") as (BiomeId | null)[]) ?? [];
    const biomeId = biomeHistory[log.round - 1];
    if (!biomeId) return null;

    return `${name}님이 ${BIOMES[biomeId].name}에서 사망했습니다.`;
  };

  return (
    <>
      {/* ================= Header ================= */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-white/80 px-4 py-2 shadow-md backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">
            {myRole ? "추러스 먹이사슬" : "관전자 모드"}
          </h1>

          <div className="flex items-center gap-2">
            {/* ☠️ Death Log */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpenDeathLog(true)}
              aria-label="사망 로그 보기"
            >
              <Skull className="h-5 w-5 text-gray-600" />
            </Button>

            {/* 🪪 Role Card */}
            {myRole && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setOpenRole(true)}
                aria-label="내 직업 카드 보기"
              >
                <IdCard className="h-6 w-6 text-gray-600" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* spacer */}
      <div className="h-12" />

      {/* ================= Role Card Dialog ================= */}
      <Dialog open={openRole} onOpenChange={setOpenRole}>
        <DialogContent
          className="max-w-sm rounded-2xl p-6"
          aria-describedby="role-card-description"
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              내 직업 카드
            </DialogTitle>
          </DialogHeader>

          {myRole && (
            <div className="mt-4 flex flex-col items-center gap-4">
              {/* 이미지 */}
              <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-gray-100 shadow-inner">
                <img
                  src={`/animal/${myRole}.svg`}
                  alt={myRole}
                  className="h-20 w-20"
                />
              </div>

              {/* 이름 */}
              <div className="text-center">
                <p className="text-lg font-extrabold">
                  {animalNameMap[myRole]}
                </p>
                <p className="text-sm text-gray-500">당신의 역할입니다</p>
              </div>

              {/* 🍖 hasEaten visualization */}
              <div className="mt-2 w-full">
                <p className="mb-2 text-center text-sm font-medium text-gray-600">
                  잡아 먹은 기록
                </p>
                {ANIMALS[myRole].type === "PREDATOR" ? (
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                      <Parallelogram key={i} active={hasEaten[i] === true} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-gray-500">
                    피식자는 잡아먹을 수 없습니다.
                  </p>
                )}
              </div>

              <Button
                className="mt-4 w-full"
                onClick={() => setOpenRole(false)}
              >
                확인
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= Death Log Dialog ================= */}
      <Dialog open={openDeathLog} onOpenChange={setOpenDeathLog}>
        <DialogContent
          className="max-w-sm rounded-2xl p-6"
          aria-describedby="death-log-description"
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              사망 로그
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-3 text-sm">
            {deathLogs.length === 0 ? (
              <p className="text-center text-gray-500">
                아직 사망자가 없습니다.
              </p>
            ) : (
              deathLogs.map((log, i) => {
                const text = resolveDeathText(log);
                if (!text) return null;
                return (
                  <div key={i} className="rounded-md bg-gray-100 px-3 py-2">
                    {text}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

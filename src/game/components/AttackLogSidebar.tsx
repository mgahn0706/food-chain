"use client";

import { useMemo } from "react";
import { useMultiplayerState, usePlayersList } from "playroomkit";
import { Skull, Swords, ShieldCheck, Info, AlertTriangle } from "lucide-react";

import type { AttackLog } from "@/game/types/attackLog";
import type { BiomeId } from "@/game/types/biome";
import type { AnimalId } from "@/game/types/animal";

import { BIOMES } from "@/game/config/biome";
import { animalNameMap } from "@/assets/utils/animalNameMap";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

/* ===================== log meta ===================== */

function getLogMeta(type: AttackLog["type"]) {
  switch (type) {
    case "STARVE":
      return { icon: Skull, badge: "warning", label: "굶주림" };
    case "KILL":
      return { icon: Skull, badge: "destructive", label: "사망" };
    case "IMMUNE":
      return { icon: ShieldCheck, badge: "secondary", label: "무효" };
    case "INFO":
      return { icon: Info, badge: "outline", label: "정보" };
    case "ERROR":
      return { icon: AlertTriangle, badge: "destructive", label: "오류" };
    default:
      return { icon: Swords, badge: "outline", label: "공격" };
  }
}

/* ===================== main ===================== */

export default function AttackLogSidebar({
  side = "right",
}: {
  side?: "left" | "right";
}) {
  const players = usePlayersList(true);
  const [attackLogs] = useMultiplayerState<AttackLog[]>("attackLogs", []);

  /**
   * 🔑 로그를 "의미 단위"로 재구성
   */
  const logs = useMemo(() => {
    return attackLogs.map((log, index) => {
      const attacker = log.attackerId
        ? players.find((p) => p.id === log.attackerId)
        : null;

      const defender = log.defenderId
        ? players.find((p) => p.id === log.defenderId)
        : null;

      const attackerName =
        attacker?.getState("name") ||
        attacker?.getProfile().name ||
        "알 수 없음";
      const defenderName =
        defender?.getState("name") ||
        defender?.getProfile().name ||
        "알 수 없음";

      const attackerRole = attacker?.getState("role") as AnimalId | null;
      const defenderRole = defender?.getState("role") as AnimalId | null;

      // 📍 사망/판정 당시 위치 추론 (defender 기준)
      const history =
        (defender?.getState("biomeHistory") as (BiomeId | null)[]) ?? [];
      const biomeId = history[log.round - 1];
      const biomeName = biomeId ? BIOMES[biomeId].name : "알 수 없음";

      /**
       * 🧠 타입별 문장 생성
       */
      let sentence = "";

      switch (log.type) {
        case "STARVE":
          sentence =
            log.message ||
            `${defenderName}님이 ${biomeName}에서 굶어 죽었습니다.`;
          break;
        case "KILL":
          sentence = `${attackerName}(${
            attackerRole ? animalNameMap[attackerRole] : "-"
          })에 의해 ${defenderName}(${
            defenderRole ? animalNameMap[defenderRole] : "-"
          })가 ${biomeName}에서 사망했습니다.`;
          break;

        case "IMMUNE":
          sentence = `${attackerName}의 공격은 ${defenderName}에게 통하지 않았습니다. (${biomeName})`;
          break;

        case "INFO":
          sentence = `${attackerName} → ${defenderName} : 아무 일도 일어나지 않았습니다.`;
          break;

        case "ERROR":
          sentence = `오류 발생: 공격 판정을 수행할 수 없습니다.`;
          break;

        default:
          sentence = `${attackerName} → ${defenderName}`;
      }

      return {
        index,
        round: log.round,
        meta: getLogMeta(log.type),
        sentence,
      };
    });
  }, [attackLogs, players]);

  return (
    <Sheet>
      {/* Trigger */}
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="공격 로그">
          <Swords className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      {/* Content */}
      <SheetContent side={side} className="w-[380px] sm:w-[440px] p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <SheetHeader className="px-5 py-4">
            <SheetTitle className="flex items-center gap-2 text-base font-bold">
              <Swords className="h-5 w-5" />
              공격 로그
            </SheetTitle>
            <div className="mt-2 text-sm text-gray-500">총 {logs.length}개</div>
          </SheetHeader>

          <Separator />

          {/* Body */}
          <ScrollArea className="flex-1">
            <div className="px-5 py-4 space-y-3">
              {logs.length === 0 ? (
                <div className="rounded-xl border bg-white p-4 text-sm text-gray-500">
                  아직 로그가 없습니다.
                </div>
              ) : (
                logs.map((log) => {
                  const Icon = log.meta.icon;

                  return (
                    <div
                      key={log.index}
                      className="rounded-xl border bg-white p-3 shadow-sm"
                    >
                      {/* Top */}
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gray-700" />
                        <Badge variant={log.meta.badge as any}>
                          {log.meta.label}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {log.round}R
                        </span>
                      </div>

                      {/* Sentence */}
                      <div className="mt-2 text-sm text-gray-800">
                        {log.sentence}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t px-5 py-4">
            <SheetClose asChild>
              <Button className="w-full">닫기</Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useMemo } from "react";
import { useMultiplayerState, usePlayersList } from "playroomkit";
import { Skull, Swords, ShieldCheck } from "lucide-react";

import type { AttackLog } from "@/game/types/attackLog";
import type { BiomeId } from "@/game/types/biome";
import type { AnimalId } from "@/game/types/animal";

import { BIOMES } from "@/game/config/biome";

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

/* ===================== meta ===================== */

function getLogMeta(type: AttackLog["type"]) {
  switch (type) {
    case "STARVE":
      return { type, icon: Skull, text: "굶주림" };
    case "KILL":
      return { type, icon: Skull, text: "사망" };
    case "IMMUNE":
      return { type, icon: ShieldCheck, text: "무효" };
    default:
      return { type, icon: Swords, text: "공격" };
  }
}

/* ===================== Player ===================== */

function PlayerIcon({ name, role }: { name: string; role: AnimalId | null }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white">
        {role ? (
          <img
            src={`/animal/${role}.svg`}
            alt={role}
            className="h-6 w-6"
            draggable={false}
          />
        ) : (
          <Skull className="h-5 w-5 text-gray-400" />
        )}
      </div>
      <div className="max-w-[80px] truncate text-xs text-gray-800">{name}</div>
    </div>
  );
}

/* ===================== Card ===================== */

function AttackLogCard({
  round,
  meta,
  attacker,
  defender,
  biome,
}: {
  round: number;
  meta: ReturnType<typeof getLogMeta>;
  attacker: { name: string; role: AnimalId | null } | null;
  defender: { name: string; role: AnimalId | null };
  biome: string;
}) {
  const Icon = meta.icon;
  const isStarve = meta.type === "STARVE";

  return (
    <div className="rounded-xl border bg-white p-3">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
        <Badge variant="secondary">R{round}</Badge>
        <div className="flex items-center gap-1">
          <Icon className="h-3.5 w-3.5" />
          <span>{meta.text}</span>
        </div>
      </div>

      {/* Body */}
      {isStarve ? (
        <div className="flex flex-col items-center gap-2">
          <PlayerIcon name={defender.name} role={defender.role} />
          <span className="text-xs text-gray-600">굶어 죽음</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3">
          {attacker && <PlayerIcon name={attacker.name} role={attacker.role} />}
          <span className="text-sm text-gray-400">→</span>
          <PlayerIcon name={defender.name} role={defender.role} />
        </div>
      )}

      {/* Footer */}
      <div className="mt-2 text-center text-[11px] text-gray-400">{biome}</div>
    </div>
  );
}

/* ===================== Main ===================== */

export default function AttackLogSidebar({
  side = "right",
}: {
  side?: "left" | "right";
}) {
  const players = usePlayersList(true);
  const [attackLogs] = useMultiplayerState<AttackLog[]>("attackLogs", []);

  const logs = useMemo(() => {
    return attackLogs.map((log, index) => {
      const attacker = log.attackerId
        ? players.find((p) => p.id === log.attackerId)
        : null;
      const defender = log.defenderId
        ? players.find((p) => p.id === log.defenderId)
        : null;
      if (!defender) return null;

      const history =
        (defender.getState("biomeHistory") as (BiomeId | null)[]) ?? [];
      const biomeId = history[log.round - 1];

      return {
        index,
        round: log.round,
        meta: getLogMeta(log.type),
        biome: biomeId ? BIOMES[biomeId].name : "알 수 없음",
        attacker: attacker
          ? {
              name:
                attacker.getState("name") ||
                attacker.getProfile().name ||
                "알 수 없음",
              role: attacker.getState("role") as AnimalId | null,
            }
          : null,
        defender: {
          name:
            defender.getState("name") ||
            defender.getProfile().name ||
            "알 수 없음",
          role: defender.getState("role") as AnimalId | null,
        },
      };
    });
  }, [attackLogs, players]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Swords className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side={side} className="w-[360px] p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-4 py-3">
            <SheetTitle className="text-sm font-semibold">공격 로그</SheetTitle>
            <div className="text-xs text-gray-500">
              {logs.filter(Boolean).length} events
            </div>
          </SheetHeader>

          <Separator />

          <ScrollArea className="flex-1">
            <div className="space-y-3 px-4 py-3">
              {logs.filter(Boolean).length === 0 ? (
                <div className="rounded-lg border p-3 text-xs text-gray-400">
                  로그 없음
                </div>
              ) : (
                logs.map(
                  (log) =>
                    log && (
                      <AttackLogCard
                        key={log.index}
                        round={log.round}
                        meta={log.meta}
                        attacker={log.attacker}
                        defender={log.defender}
                        biome={log.biome}
                      />
                    )
                )
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            <SheetClose asChild>
              <Button size="sm" className="w-full">
                닫기
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

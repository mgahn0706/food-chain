"use client";

import { useMemo } from "react";
import { Skull } from "lucide-react";
import { myPlayer, useMultiplayerState, usePlayersList } from "playroomkit";

import PlayerHeader from "./PlayerHeader";

import type { AttackLog } from "@/game/types/attackLog";
import type { AnimalId } from "@/game/types/animal";
import type { BiomeId } from "@/game/types/biome";

import { BIOMES } from "@/game/config/biome";
import { animalNameMap } from "@/assets/utils/animalNameMap";

export default function DeathScreen({
  currentPhase,
  round,
}: {
  currentPhase: string;
  round: number;
}) {
  const me = myPlayer();
  const players = usePlayersList(true);
  const [attackLogs] = useMultiplayerState<AttackLog[]>("attackLogs", []);

  /**
   * 🔍 나의 "사인" 추론
   */
  const deathReason = useMemo(() => {
    // 나를 죽인 가장 마지막 로그
    const myDeathLog = [...attackLogs]
      .reverse()
      .find(
        (log) =>
          (log.type === "KILL" || log.type === "STARVE") &&
          log.defenderId === me.id
      );

    if (!myDeathLog) {
      return {
        title: "사망 원인을 알 수 없습니다",
        detail: "알 수 없는 이유로 사망했습니다.",
      };
    }

    if (myDeathLog.type === "STARVE") {
      const history = (me.getState("biomeHistory") as (BiomeId | null)[]) ?? [];
      const biomeId = history[myDeathLog.round - 1];
      const biomeName = biomeId ? BIOMES[biomeId].name : "알 수 없는 장소";

      return {
        title: "굶주림으로 사망",
        detail: `${biomeName}에서 먹이를 찾지 못해 굶어 죽었습니다.`,
      };
    }

    const attacker = myDeathLog.attackerId
      ? players.find((p) => p.id === myDeathLog.attackerId)
      : null;

    const attackerName =
      attacker?.getState("name") || attacker?.getProfile().name;

    const attackerRole = attacker?.getState("role") as AnimalId | null;

    const history = (me.getState("biomeHistory") as (BiomeId | null)[]) ?? [];
    const biomeId = history[myDeathLog.round - 1];
    const biomeName = biomeId ? BIOMES[biomeId].name : "알 수 없는 장소";

    // 🐍 뱀 반격 케이스 (공격자가 나인데 defender가 나)
    if (attacker && attacker.id === me.id) {
      return {
        title: "반격으로 사망",
        detail: `${biomeName}에서 뱀의 반격으로 사망했습니다.`,
      };
    }

    // 🍖 굶어 죽음 (공격자 없음)
    if (!attacker) {
      return {
        title: "굶주림으로 사망",
        detail: `${biomeName}에서 먹이를 찾지 못해 굶어 죽었습니다.`,
      };
    }

    // 🗡️ 일반 공격 사망
    return {
      title: "공격으로 사망",
      detail: `${biomeName}에서 ${attackerName}(${
        attackerRole ? animalNameMap[attackerRole] : "알 수 없음"
      })의 공격으로 사망했습니다.`,
    };
  }, [attackLogs, me, players]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
      <PlayerHeader />

      <span className="mb-4 text-gray-500">
        {round} 라운드 · {currentPhase}
      </span>

      <Skull className="mb-6 h-20 w-20 text-gray-400" />

      <h1 className="mb-2 text-2xl font-bold text-gray-700">
        {deathReason.title}
      </h1>

      <p className="mb-4 text-gray-600">{deathReason.detail}</p>

      <p className="text-sm text-gray-400">저승으로 이동하여 관전해주세요.</p>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { myPlayer, useMultiplayerState, usePlayersList } from "playroomkit";
import { toast } from "sonner";

import type { AttackLog } from "@/game/types/attackLog";
import type { BiomeId } from "@/game/types/biome";
import { BIOMES } from "@/game/config/biome";

export default function useDeathToast() {
  const me = myPlayer();
  const players = usePlayersList(true);

  const [attackLogs] = useMultiplayerState<AttackLog[]>("attackLogs", []);

  /**
   * seen key 전략
   * - 당사자용 전체 로그: logIndex 기준
   * - 제3자 사망 요약: round-defenderId 기준
   */
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    attackLogs.forEach((log, index) => {
      const isAttacker = log.attackerId === me.id;
      const isDefender = log.defenderId === me.id;
      const isInvolved = isAttacker || isDefender;

      /* ===================== 1. 공격/방어 당사자 ===================== */
      if (isInvolved) {
        const key = `FULL-${index}`;
        if (seen.current.has(key)) return;

        seen.current.add(key);

        toast.message(log.message);
        return;
      }

      /* ===================== 2. 제3자: KILL만 ===================== */
      if (log.type !== "KILL") return;
      if (!log.defenderId) return;

      const key = `DEATH-${log.round}-${log.defenderId}`;
      if (seen.current.has(key)) return;

      const deadPlayer = players.find((p) => p.id === log.defenderId);
      if (!deadPlayer) return;

      const biomeHistory =
        (deadPlayer.getState("biomeHistory") as (BiomeId | null)[]) ?? [];
      const biomeId = biomeHistory[log.round - 1];
      if (!biomeId) return;

      const name = deadPlayer.getState("name") || deadPlayer.getProfile().name;

      const biomeName = BIOMES[biomeId].name;

      seen.current.add(key);

      toast.error(`${name}님이 ${biomeName}에서 사망했습니다.`);
    });
  }, [attackLogs, players, me.id]);
}

import { useEffect, useRef } from "react";
import { useMultiplayerState, usePlayersList } from "playroomkit";
import { toast } from "sonner";

import type { AttackLog } from "@/game/types/attackLog";
import type { BiomeId } from "@/game/types/biome";
import { BIOMES } from "@/game/config/biome";

export default function useDeathToast() {
  const players = usePlayersList(true);

  const [attackLogs] = useMultiplayerState<AttackLog[]>("attackLogs", []);

  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    attackLogs.forEach((log) => {
      if (log.type !== "KILL") return;
      if (!log.defenderId) return;

      const key = `${log.round}-${log.defenderId}`;
      if (seen.current.has(key)) return;

      const deadPlayer = players.find((p) => p.id === log.defenderId);
      if (!deadPlayer) return;

      // 사망 당시 biome 추론
      const biomeHistory =
        (deadPlayer.getState("biomeHistory") as (BiomeId | null)[]) ?? [];
      const biomeId = biomeHistory[log.round - 1];
      if (!biomeId) return;

      const name = deadPlayer.getState("name") || deadPlayer.getProfile().name;

      const biomeName = BIOMES[biomeId].name;

      seen.current.add(key);

      toast.error(`${name}님이 ${biomeName}에서 사망했습니다.`);
    });
  }, [attackLogs, players]);
}

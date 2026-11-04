import { ANIMALS } from "../config/animals";
import type { AnimalId } from "../types/animal";
import type { AttackLog, AttackLogType } from "../types/attackLog";
import { usePlayerStatus } from "./usePlayerStatus";
import { useMultiplayerState } from "playroomkit";

const MAYBE_INVINCIBLE_PREYS: AnimalId[] = ["MALLARD", "HARE", "DEER", "OTTER"];
const EXPANDED_INVINCIBLE_PREYS: AnimalId[] = [
  "SHEEP", "PLATYPUS", "FLYING_SQUIRREL",
];
const SHIELDED_PREYS: AnimalId[] = ["ARMADILLO", "TURTLE", "LIZARD"];

export default function useExecuteAttack({
  attackerId,
  defenderId,
  round,
}: {
  attackerId: string | null;
  defenderId: string | null;
  round: number;
}) {
  const { players, getPlayerById, killPlayer, eatPlayer } = usePlayerStatus();

  const [attackLogs, setAttackLogs] = useMultiplayerState<AttackLog[]>(
    "attackLogs",
    []
  );

  const pushLog = (
    type: AttackLogType,
    message: string,
    extra?: Partial<AttackLog>
  ) => {
    const nextLogs: AttackLog[] = [
      ...attackLogs,
      {
        round,
        type,
        message,
        ...extra,
      },
    ];
    setAttackLogs(nextLogs, true);
  };

  const executeAttack = () => {
    /* ===== validation ===== */
    if (!attackerId || !defenderId) {
      pushLog("ERROR", "공격자와 방어자를 선택해주세요.");
      return;
    }

    const attacker = getPlayerById(attackerId);
    const defender = getPlayerById(defenderId);

    if (!attacker || !defender) {
      pushLog("ERROR", "공격자와 방어자를 찾지 못했습니다.");
      return;
    }

    const attackerRole = attacker.getState("role") as AnimalId | null;
    const defenderRole = defender.getState("role") as AnimalId | null;

    if (!attackerRole || !defenderRole) {
      pushLog("ERROR", "공격자와 방어자의 역할을 찾지 못했습니다.");
      return;
    }

    const attackerName = attacker.getState("name");
    const defenderName = defender.getState("name");

    /* ===== 🐍 snake counter ===== */
    if (defenderRole === "SNAKE" || defenderRole === "RATTLESNAKE") {
      killPlayer(attacker.id);
      pushLog("KILL", `${attackerName}님이 사망했습니다.`, {
        attackerId: defender.id,
        defenderId: attacker.id,
      });
      return;
    }

    /* ===== 🛡️ conditional invincible ===== */
    if (defender.getState("protectedRound") === round) {
      pushLog("IMMUNE", "아무 일도 일어나지 않았습니다.", {
        attackerId,
        defenderId,
      });
      return;
    }

    const protectionGroup = MAYBE_INVINCIBLE_PREYS.includes(defenderRole)
      ? MAYBE_INVINCIBLE_PREYS
      : EXPANDED_INVINCIBLE_PREYS.includes(defenderRole)
        ? EXPANDED_INVINCIBLE_PREYS
        : null;
    if (protectionGroup) {
      const protectedPlayers = players.filter((p) => {
        const role = p.getState("role") as AnimalId | null;
        return (
          !!role &&
          protectionGroup.includes(role) &&
          p.getState("status") === "ALIVE"
        );
      });

      const defenderBiome = (
        defender.getState("biomeHistory") as (string | null)[]
      )?.[round - 1];

      const isAllInSameBiome =
        !!defenderBiome &&
        protectedPlayers.length > 0 &&
        protectedPlayers.every((p) => {
          const history =
            (p.getState("biomeHistory") as (string | null)[]) ?? [];
          return history[round - 1] === defenderBiome;
        });

      if (isAllInSameBiome) {
        pushLog("IMMUNE", "아무 일도 일어나지 않았습니다.", {
          attackerId,
          defenderId,
        });
        return;
      }
    }

    /* ===== ⚖️ same rank ===== */
    if (ANIMALS[attackerRole].rank === ANIMALS[defenderRole].rank) {
      pushLog("INFO", "아무 일도 일어나지 않았습니다.", {
        attackerId,
        defenderId,
      });
      return;
    }

    /* ===== 🦁 attacker wins ===== */
    if (ANIMALS[attackerRole].rank < ANIMALS[defenderRole].rank) {
      if (
        SHIELDED_PREYS.includes(defenderRole) &&
        !defender.getState("protectedRound")
      ) {
        defender.setState("protectedRound", round, true);
        pushLog("IMMUNE", "아무 일도 일어나지 않았습니다.", {
          attackerId,
          defenderId,
        });
        return;
      }

      const pairedRole = defenderRole === "HEN_PHEASANT"
        ? "COCK_PHEASANT"
        : defenderRole === "COCK_PHEASANT"
          ? "HEN_PHEASANT"
          : null;
      const partner = pairedRole
        ? players.find(
            (player) =>
              player.getState("role") === pairedRole &&
              player.getState("status") === "ALIVE"
          )
        : null;
      const eaten = partner ?? defender;
      eatPlayer(attacker.id, eaten.id, round);
      pushLog("KILL", `${eaten.getState("name") || eaten.getProfile().name || defenderName}님이 사망했습니다.`, {
        attackerId: attacker.id,
        defenderId: eaten.id,
      });
      return;
    }

    /* ===== 🩸 defender wins ===== */
    eatPlayer(defender.id, attacker.id, round);
    pushLog("KILL", `${attackerName}님이 사망했습니다.`, {
      attackerId: defender.id,
      defenderId: attacker.id,
    });
  };

  return { executeAttack };
}

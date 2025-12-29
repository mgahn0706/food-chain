// types/attackLog.ts
export type AttackLogType = "INFO" | "KILL" | "IMMUNE" | "ERROR" | "STARVE";

export type AttackLog = {
  round: number;
  type: AttackLogType;
  message: string;
  attackerId?: string;
  defenderId?: string;
};

import { Trophy } from "lucide-react";
import { myPlayer, usePlayersList } from "playroomkit";

import { useSyncHostId } from "@/game/hooks/useSyncHost";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Tilt from "react-parallax-tilt";

import { BIOMES } from "@/game/config/biome";
import { ANIMALS } from "@/game/config/animals";

import type { AnimalId } from "@/game/types/animal";
import type { BiomeId } from "@/game/types/biome";
import AttackLogSidebar from "@/game/components/AttackLogSidebar";

/* ===================== Types ===================== */

export interface GamePlayer {
  id: string;
  name: string;
  role: AnimalId | null;
  status: "ALIVE" | "DEAD";
  biomeHistory: (BiomeId | null)[];
  predictedWinner: AnimalId | null;
}

const MAX_ROUNDS = 4;

/* ===================== Result Phase ===================== */

export default function ResultPhase({
  onNextPhase,
}: {
  onNextPhase: () => void;
}) {
  const me = myPlayer();
  const players = usePlayersList(true);
  const hostId = useSyncHostId();

  const isHost = me.id === hostId;

  /* ---------- normalize ---------- */
  const gamePlayers: GamePlayer[] = players.map((p) => ({
    id: p.id,
    name: p.getState("name"),
    role: p.getState("role"),
    status: p.getState("status"),
    biomeHistory: p.getState("biomeHistory") ?? [],
    predictedWinner: p.getState("predictedWinner"),
  }));

  /* ---------- victory judgment ---------- */
  const winners = gamePlayers.filter(
    (p) => p.role && ANIMALS[p.role].onVictoryCheck(gamePlayers)
  );

  const hasWon =
    me.getState("role") &&
    ANIMALS[me.getState("role") as AnimalId].onVictoryCheck(gamePlayers);

  /* ===================================================== */
  /* ================= NON-HOST VIEW ===================== */
  /* ===================================================== */

  const role = me.getState("role") as AnimalId | null;

  if (!isHost) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
        {hasWon ? (
          <>
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} scale={1.1}>
              <img
                src={`/card/${role}.png`}
                alt="role reveal"
                className="h-68 w-48 select-none"
                draggable={false}
              />
            </Tilt>
            <h1 className="my-2 text-2xl font-bold text-gray-800">
              승리했습니다
            </h1>
            <p className="text-gray-600">먹이사슬의 최종 승자입니다.</p>
          </>
        ) : (
          <>
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} scale={1.1}>
              <img
                src={`/card/${role}.png`}
                alt="role reveal"
                className="h-68 w-48 select-none"
                draggable={false}
              />
            </Tilt>
            <h1 className="my-2 text-2xl font-bold text-gray-700">
              패배했습니다
            </h1>
            <p className="text-gray-500">다음 게임에서 복수하세요.</p>
          </>
        )}
      </div>
    );
  }

  /* ===================================================== */
  /* ===================== HOST VIEW ===================== */
  /* ===================================================== */

  const losers = gamePlayers.filter(
    (p) => p.role && !ANIMALS[p.role].onVictoryCheck(gamePlayers)
  );

  const resetPlayers = () => {
    players.forEach((p) => {
      p.setState("role", null);
      p.setState("status", "ALIVE");
      p.setState("biomeHistory", []);
      p.setState("predictedWinner", null);
      p.setState("result", null);
      p.setState("hasEaten", [false, false, false, false]);
      p.setState("checked", false);
      p.setState("camouflage", null);
      p.setState("ready", false);
    });
  };

  return (
    <div className="relative w-full px-4 pb-24">
      {/* ================= Title ================= */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-gray-900">먹이사슬 결과</h1>
        <AttackLogSidebar />
      </div>

      {/* ================= Winners / Losers ================= */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm text-gray-700">우승자</p>
          <Card className="min-h-[120px]">
            <CardContent className="space-y-2 p-3">
              {winners.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">
                  아직 승자가 없습니다
                </p>
              ) : (
                winners.map((player) => (
                  <PlayerCard key={player.id} player={player} hasWon />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:mt-6">
          <Card className="min-h-[120px]">
            <CardContent className="space-y-2 p-3">
              {losers.map((player) => (
                <PlayerCard key={player.id} player={player} hasWon={false} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ================= Detail Table ================= */}
      <h2 className="mt-8 mb-2 text-base font-medium">게임 진행 상세</h2>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>플레이어</TableHead>
              {[1, 2, 3, 4].map((r) => (
                <TableHead key={r} className="text-center">
                  {r}라운드
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {gamePlayers.map((player) => {
              if (!player.role) return null;

              const paddedHistory = [
                ...player.biomeHistory,
                ...Array(MAX_ROUNDS - player.biomeHistory.length).fill(null),
              ];

              return (
                <TableRow key={player.id}>
                  <TableCell className="min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <img
                        src={`/animal/${player.role}.svg`}
                        className="h-6 w-6"
                        alt=""
                      />
                      <span className="text-sm">{player.name}</span>
                      {ANIMALS[player.role].onVictoryCheck(gamePlayers) && (
                        <Trophy className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  </TableCell>

                  {paddedHistory.map((biome: BiomeId, idx) => (
                    <TableCell
                      key={idx}
                      className="text-center text-xs"
                      style={{
                        backgroundColor: biome
                          ? BIOMES[biome].color
                          : "#f3f4f6",
                        color: biome ? "white" : "#6b7280",
                      }}
                    >
                      {biome ? BIOMES[biome].name : "—"}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ================= Bottom Action Bar ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-white/70 backdrop-blur">
        <div className="flex w-full justify-end px-4 py-3">
          <Button
            className="rounded-full px-6"
            onClick={() => {
              resetPlayers();
              onNextPhase();
            }}
          >
            게임 종료
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Player Card ===================== */

function PlayerCard({
  player,
  hasWon,
}: {
  player: GamePlayer;
  hasWon: boolean;
}) {
  if (!player.role) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border p-3">
      <div className="flex items-center gap-3">
        <img src={`/animal/${player.role}.svg`} className="h-10 w-10" alt="" />
        <div>
          <div className="text-sm font-medium">{player.name}</div>
          <div className="text-xs text-gray-500">
            {ANIMALS[player.role].name}
          </div>
        </div>
      </div>

      {hasWon && <Trophy className="h-5 w-5 text-blue-500" />}
    </div>
  );
}

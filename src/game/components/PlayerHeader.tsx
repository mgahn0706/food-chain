import { myPlayer } from "playroomkit";
import type { AnimalId } from "../types/animal";
import { CreditCard } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { animalNameMap } from "@/assets/utils/animalNameMap";

export default function PlayerHeader() {
  const myRole = myPlayer().getState("role") as AnimalId | null;
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ================= Header ================= */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-white/80 px-4 py-2 shadow-md backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">
            {myRole ? `추러스 먹이사슬` : "관전자 모드"}
          </h1>

          {myRole && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpen(true)}
              className="text-gray-600 hover:text-gray-900"
              aria-label="내 직업 카드 보기"
            >
              <CreditCard className="h-6 w-6" />
            </Button>
          )}
        </div>
      </div>

      {/* 헤더 높이만큼 밀어주기 */}
      <div className="h-12" />

      {/* ================= Role Card Modal ================= */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              내 직업 카드
            </DialogTitle>
          </DialogHeader>

          {myRole ? (
            <div className="mt-4 flex flex-col items-center gap-4">
              {/* 카드 이미지 (확장 포인트) */}
              <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-gray-100 shadow-inner">
                <img
                  src={`/animal/${myRole}.svg`}
                  alt={myRole}
                  className="h-20 w-20"
                />
              </div>

              {/* 직업 이름 */}
              <div className="text-center">
                <p className="text-lg font-extrabold text-gray-800">
                  {animalNameMap[myRole]}
                </p>
                <p className="mt-1 text-sm text-gray-500">당신의 역할입니다</p>
              </div>

              {/* 닫기 */}
              <Button className="mt-2 w-full" onClick={() => setOpen(false)}>
                확인
              </Button>
            </div>
          ) : (
            <div className="mt-6 text-center text-sm text-gray-500">
              관전자에게는 직업 정보가 없습니다.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

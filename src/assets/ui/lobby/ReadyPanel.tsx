import { useEffect, useRef, useState } from "react";
import { useMyLobbyPlayer } from "../../../game/state/useMyLobbyPlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";

export default function ReadyPanel() {
  const { name, setName, ready, setReady } = useMyLobbyPlayer();

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = name && name.trim() ? name : "Player";

  useEffect(() => {
    if (isEditing) {
      setDraftName(name ?? "");
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [isEditing, name]);

  const saveName = () => {
    const trimmed = draftName.trim();
    if (!trimmed) return;
    setName(trimmed, true);
    setIsEditing(false);
  };

  const toggleReady = () => {
    setIsEditing(false); // 모바일: Ready 누르면 편집 종료
    setReady(!ready, true);
  };

  return (
    <div className="w-full flex flex-col gap-5 px-1">
      {/* ================= Name ================= */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-600">
          플레이어 이름
        </label>

        {!isEditing ? (
          <button
            type="button"
            disabled={ready}
            onClick={() => setIsEditing(true)}
            className={`
              h-12 px-4
              rounded-lg border
              flex items-center justify-between
              text-base
              ${
                ready
                  ? "bg-gray-100 text-gray-400 border-gray-200"
                  : "bg-white border-gray-300"
              }
            `}
          >
            <span className="truncate">{displayName}</span>
            {!ready && <Pencil className="h-4 w-4 text-gray-400" />}
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <Input
              ref={inputRef}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveName();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setIsEditing(false);
                }
              }}
              placeholder="이름을 입력하세요"
              className="h-12 text-base"
            />

            <Button
              className="h-12 text-base font-semibold"
              disabled={!draftName.trim()}
              onClick={saveName}
            >
              이름 저장
            </Button>
          </div>
        )}
      </div>

      {/* ================= Ready / Waiting ================= */}
      {!ready ? (
        <Button
          size="lg"
          className="h-14 rounded-full text-lg font-bold bg-blue-600 text-white"
          onClick={toggleReady}
        >
          준비 완료
        </Button>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Waiting Card */}
          <div
            className="
              rounded-xl px-4 py-4
              bg-gradient-to-r from-blue-600 to-indigo-600
              text-white
              flex items-center justify-center gap-2
              animate-pulse
            "
          >
            <WaitingDots />
            <span className="text-sm font-medium">
              다른 플레이어를 기다리는 중
            </span>
          </div>

          <Button
            variant="secondary"
            className="h-12 text-sm"
            onClick={toggleReady}
          >
            준비 취소
          </Button>
        </div>
      )}
    </div>
  );
}

/* ================= Waiting Dots ================= */

function WaitingDots() {
  return (
    <span className="flex gap-1">
      <Dot delay="0ms" />
      <Dot delay="150ms" />
      <Dot delay="300ms" />
    </span>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-bounce"
      style={{ animationDelay: delay }}
    />
  );
}

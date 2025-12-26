import { useIsHost } from "playroomkit";

import PlayerList from "./PlayerList";
import ReadyPanel from "./ReadyPanel";
import SettingPhase from "./SettingPhase";

export default function LobbyScreen() {
  const isHost = useIsHost();

  return (
    <div className="flex h-full w-full flex-col gap-6 px-6 py-4">
      {/* ================= 공통 영역 ================= */}
      {/* 모든 플레이어가 보는 영역 */}
      <div>
        <PlayerList />
      </div>

      <div>
        <ReadyPanel />
      </div>

      {/* ================= Host 전용 영역 ================= */}
      {/* Host만 SettingPhase를 볼 수 있음 */}
      {isHost && (
        <div className="mt-4">
          <SettingPhase onNextPhase={() => {}} />
        </div>
      )}
    </div>
  );
}

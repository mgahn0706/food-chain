import { useIsHost } from "playroomkit";
import { ALL_ANIMALS } from "../../../game/config/animals";
import { useLobbyState } from "../../../game/state/useLobbyState";
import type { AnimalId } from "../../../game/types/ids";

export default function AnimalConfigPanel() {
  const isHost = useIsHost();
  const { lobby, setAnimalConfig } = useLobbyState();

  if (!isHost) return null;

  const selected = new Set(lobby.animalConfig);

  const toggle = (id: AnimalId) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);

    setAnimalConfig(Array.from(next));
  };

  const selectAll = () => setAnimalConfig([...ALL_ANIMALS]);
  const clear = () => setAnimalConfig([]);

  return (
    <div className="stack">
      <div className="rowLine">
        <button className="btn tiny" onClick={selectAll}>
          Select All
        </button>
        <button className="btn tiny secondary" onClick={clear}>
          Clear
        </button>
      </div>

      <div className="chips">
        {ALL_ANIMALS.map((id) => {
          const on = selected.has(id);
          return (
            <button
              key={id}
              className={on ? "chip on" : "chip"}
              onClick={() => toggle(id)}
            >
              {id}
            </button>
          );
        })}
      </div>
    </div>
  );
}

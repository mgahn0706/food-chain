import { useLobbyState } from "../../../game/state/useLobbyState";

export default function GameScreen() {
  const { lobby } = useLobbyState();

  return (
    <div className="page">
      <h1 className="title">Game Started</h1>
      <p className="muted">
        Selected animals: {lobby.animalConfig.join(", ") || "(none)"}
      </p>

      {/* TODO:
          - host assigns roles from lobby.animalConfig
          - move phase machine into your existing food-chain engine
      */}
    </div>
  );
}

import HostPanel from "./HostPanel";
import PlayerList from "./PlayerList";
import ReadyPanel from "./ReadyPanel";

export default function LobbyScreen() {
  return (
    <div className="page">
      <header className="header">
        <h1 className="title">Food-Chain Lobby</h1>
        <p className="subtitle">
          Join the room, set your name, and click Ready.
        </p>
      </header>

      <div className="grid">
        <section className="card">
          <h2 className="cardTitle">Players</h2>
          <PlayerList />
        </section>

        <section className="card">
          <h2 className="cardTitle">Me</h2>
          <ReadyPanel />
        </section>

        <section className="card">
          <h2 className="cardTitle">Host</h2>
          <HostPanel />
        </section>
      </div>
    </div>
  );
}

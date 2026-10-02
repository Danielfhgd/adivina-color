import { useState } from "react";

export default function StartScreen({
  playerName,
  onPlayerNameChange,
  roundDuration,
  onRoundDurationChange,
  totalRounds,
  onTotalRoundsChange,
  onStartGame,
  onStartMultiplayerHost,
  onJoinMultiplayerGuest,
  onOpenEditor,
}) {
  const [gameMode, setGameMode] = useState("single");
  const [joinRoomId, setJoinRoomId] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (gameMode === "single") {
      onStartGame();
    } else if (gameMode === "host") {
      onStartMultiplayerHost();
    } else if (gameMode === "guest") {
      if (!joinRoomId.trim()) return;
      onJoinMultiplayerGuest(joinRoomId.trim());
    }
  }

  return (
    <main className="start-screen">
      <div className="start-layout">
        <div className="hero-side">
          <p className="eyebrow">JUEGO DE PRECISIÓN CROMÁTICA</p>
          <h1>Color Quest</h1>
          <p className="start-description">
            Observa el personaje, ajusta los controles HSL y trata de encontrar
            el color real de su atributo característico.
          </p>
          <ul className="feature-list">
            <li>Selección en tiempo real</li>
            <li>Puntaje por precisión</li>
            <li>Modo Multijugador P2P</li>
          </ul>
        </div>

        <div className="form-side">
          <div className="setup-card">
            <form className="setup-form" onSubmit={handleSubmit}>
              <div className="form-heading">
                <p className="section-label">Configuración de partida</p>
                <h2>Elige tu modo de juego</h2>
              </div>

              <label className="form-field">
                <span>Tu nombre</span>
                <input
                  type="text"
                  value={playerName}
                  maxLength="18"
                  placeholder="Ejemplo: ZitroPlays"
                  onChange={(event) => onPlayerNameChange(event.target.value)}
                  className="input"
                />
              </label>

              <fieldset className="option-group">
                <legend>Modo de Juego</legend>
                <div className="option-buttons">
                  <button
                    type="button"
                    className={gameMode === "single" ? "option-button selected" : "option-button"}
                    onClick={() => setGameMode("single")}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    className={gameMode === "host" ? "option-button selected" : "option-button"}
                    onClick={() => setGameMode("host")}
                  >
                    Crear Sala
                  </button>
                  <button
                    type="button"
                    className={gameMode === "guest" ? "option-button selected" : "option-button"}
                    onClick={() => setGameMode("guest")}
                  >
                    Unirse
                  </button>
                </div>
              </fieldset>

              {gameMode === "guest" && (
                <label className="form-field">
                  <span>Código de la sala</span>
                  <input
                    type="text"
                    value={joinRoomId}
                    placeholder="Pega el ID proporcionado por el Host"
                    onChange={(event) => setJoinRoomId(event.target.value)}
                    className="input"
                  />
                </label>
              )}

              {gameMode !== "guest" && (
                <fieldset className="option-group">
                  <legend>Tiempo por ronda</legend>
                  <div className="option-buttons">
                    {[15, 20, 30].map((duration) => (
                      <button
                        type="button"
                        className={
                          roundDuration === duration
                            ? "option-button selected"
                            : "option-button"
                        }
                        key={duration}
                        onClick={() => onRoundDurationChange(duration)}
                      >
                        {duration}s
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {gameMode !== "guest" && (
                <fieldset className="option-group">
                  <legend>Cantidad de rondas</legend>
                  <div className="option-buttons">
                    {[3, 5, 10].map((rounds) => (
                      <button
                        type="button"
                        className={
                          totalRounds === rounds
                            ? "option-button selected"
                            : "option-button"
                        }
                        key={rounds}
                        onClick={() => onTotalRoundsChange(rounds)}
                      >
                        {rounds}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              <button className="start-button" type="submit">
                {gameMode === "single" && "Comenzar partida"}
                {gameMode === "host" && "Crear Sala Multijugador"}
                {gameMode === "guest" && "Unirse a la Sala"}
              </button>

              <button
                className="editor-button"
                type="button"
                onClick={onOpenEditor}
              >
                Abrir editor de personajes
              </button>

              <p className="form-note">
                Puedes cambiar estos ajustes en una futura partida.
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
import { useState } from "react";

export default function LobbyScreen({
  roomId,
  players,
  isHost,
  onStartGame,
  onLeaveLobby,
}) {
  const [copied, setCopied] = useState(false);

  function handleCopyCode() {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <main className="lobby-screen">
      <div className="lobby-card">
        <div className="lobby-header">
          <div className="lobby-title-block">
            <p className="eyebrow">SALA MULTIJUGADOR</p>
            <h1>Sala de Espera</h1>
            <p className="lobby-description">
              Comparte el código con tus amigos para que se unan a la partida.
            </p>
          </div>
          <div className="room-code-box">
            <span className="code-label">Código: {roomId || "Generando..."}</span>
            <button
              type="button"
              className="copy-button"
              onClick={handleCopyCode}
              disabled={!roomId}
              aria-label="Copiar código de sala"
            >
              {copied ? "✓ Copiado" : "📋 Copiar"}
            </button>
          </div>
        </div>

        <div className="lobby-body">
          <div className="form-heading">
            <p className="section-label">Jugadores conectados ({players.length})</p>
            <h2>Lista de Espera</h2>
          </div>

          <ul className="player-lobby-list">
            {players.map((player, index) => (
              <li key={player.id || index} className="player-lobby-item">
                <span className="player-avatar">
                  {player.name ? player.name.charAt(0).toUpperCase() : "?"}
                </span>
                <span className="player-name">
                  {player.name}
                </span>
                {player.isHost && (
                  <span className="host-badge">Anfitrión</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="lobby-actions">
          {isHost ? (
            <button
              className="start-button"
              type="button"
              onClick={onStartGame}
              disabled={players.length <= 1}
            >
              Iniciar Partida Multijugador
            </button>
          ) : (
            <p className="waiting-note">
              Esperando a que el anfitrión inicie la partida...
            </p>
          )}
          <button
            className="leave-button"
            type="button"
            onClick={onLeaveLobby}
          >
            Salir del lobby
          </button>
        </div>
      </div>
    </main>
  );
}
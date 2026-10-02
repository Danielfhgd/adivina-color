export default function GameHeader({
  round,
  timeLeft,
  isRoundActive,
  totalScore,
  onLeaveGame,
}) {
  return (
    <header className="game-header">
      <div>
        <p className="eyebrow">ADIVINA EL COLOR</p>
        <h1>Color Quest</h1>
      </div>

      <div className="header-stats">
        <div className="stat-card">
          <span>Ronda</span>
          <strong>{round}</strong>
        </div>

        <div className={`stat-card timer ${timeLeft <= 5 && isRoundActive ? "danger" : ""}`}>
          <span>Tiempo</span>
          <strong>{timeLeft}s</strong>
        </div>

        <div className="stat-card">
          <span>Puntos</span>
          <strong>{totalScore}</strong>
        </div>

        {onLeaveGame && (
          <button className="secondary-button leave-button" onClick={onLeaveGame}>
            Salir
          </button>
        )}
      </div>
    </header>
  );
}
export default function GameSummary({
  playerName,
  totalScore,
  totalRounds,
  roundResults = [],
  isMultiplayer,
  leaderboard = [],
  onBackToMenu,
}) {
  const averageAccuracy =
    roundResults.length > 0
      ? Math.round(
          roundResults.reduce((total, result) => total + result.accuracy, 0) /
            roundResults.length
        )
      : 0;

  const bestRound =
    roundResults.length > 0
      ? Math.max(...roundResults.map((result) => result.accuracy))
      : 0;

  const winner = leaderboard.length > 0 ? leaderboard[0] : null;

  return (
    <main className="summary-screen">
      <section className="summary-card">
        <p className="eyebrow">PARTIDA FINALIZADA</p>
        <h1>¡Buen trabajo, {playerName}!</h1>
        <p className="summary-description">
          Completaste {totalRounds} rondas. Estos son los resultados.
        </p>

        {isMultiplayer ? (
          <div className="multiplayer-summary">
            {winner && (
              <div className="winner-banner">
                👑 <h2>¡Ganador: {winner.name}!</h2>
                <p>Puntaje total: {winner.score} pts</p>
              </div>
            )}

            <h2>Tabla Final de Posiciones</h2>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Pos.</th>
                  <th>Jugador</th>
                  <th>Puntaje Total</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, idx) => (
                  <tr key={player.id || idx} className={idx === 0 ? "gold-row" : ""}>
                    <td>#{idx + 1}</td>
                    <td>{player.name}</td>
                    <td>{player.score} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="singleplayer-summary">
            <div className="summary-stats">
              <article>
                <span>Puntaje total</span>
                <strong>{totalScore}</strong>
              </article>

              <article>
                <span>Precisión promedio</span>
                <strong>{averageAccuracy}%</strong>
              </article>

              <article>
                <span>Mejor ronda</span>
                <strong>{bestRound}%</strong>
              </article>
            </div>

            <div className="round-history">
              <h2>Historial de rondas</h2>

              {roundResults.map((result) => (
                <div className="history-row" key={result.round}>
                  <span>Ronda {result.round}</span>
                  <span>{result.characterName}</span>
                  <strong>{result.accuracy}%</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="primary-button" onClick={onBackToMenu}>
          Volver al menú
        </button>
      </section>
    </main>
  );
}
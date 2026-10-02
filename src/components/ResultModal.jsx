import { useState } from "react";
import MaskedCharacter from "./MaskedCharacter";
import { hslToCss } from "../utils/color";

export default function ResultModal({
  accuracy,
  selectedColor,
  targetColor,
  challenge,
  isMultiplayer,
  isHost,
  roundRanking = [],
  onNextRound,
}) {
  // Inicializa siempre en la vista de comparación de personajes
  const [step, setStep] = useState("character"); 

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-large">
        {step === "character" ? (
          <div className="character-preview-stage">
            <h2>Comparativa de Color</h2>

            <div className="character-comparison-grid">
              {/* Tu resultado con el color enviado */}
              <div className="character-box">
                <h3>Tu Elección{!isMultiplayer && ` (${accuracy}%)`}</h3>
                {challenge ? (
                  <MaskedCharacter
                    color={selectedColor}
                    characterName={challenge.characterName}
                    zoneName={challenge.zoneName}
                    baseImage={challenge.baseImage}
                    maskImage={challenge.maskImage}
                  />
                ) : (
                  <p>Cargando imagen...</p>
                )}
                <div className="color-tag">
                  <span
                    className="mini-swatch"
                    style={{ backgroundColor: hslToCss(selectedColor) }}
                  />
                  <small>Color Elegido</small>
                </div>
              </div>

              {/* Resultado original con el color objetivo */}
              <div className="character-box">
                <h3>Color Original</h3>
                {challenge ? (
                  <MaskedCharacter
                    color={targetColor}
                    characterName={challenge.characterName}
                    zoneName={challenge.zoneName}
                    baseImage={challenge.baseImage}
                    maskImage={challenge.maskImage}
                  />
                ) : (
                  <p>Cargando imagen...</p>
                )}
                <div className="color-tag">
                  <span
                    className="mini-swatch"
                    style={{ backgroundColor: hslToCss(targetColor) }}
                  />
                  <small>Color Objetivo</small>
                </div>
              </div>
            </div>

            <button
              className="primary-button"
              onClick={() => setStep("results")}
            >
              {isMultiplayer ? "Ver Tabla de Posiciones" : "Ver Puntuación"}
            </button>
          </div>
        ) : (
          <div className="results-stage">
            <h2>Resultados de la Ronda</h2>

            {!isMultiplayer ? (
              <div className="singleplayer-results">
                <p className="accuracy-badge">{accuracy}% de precisión</p>
              </div>
            ) : (
              <div className="multiplayer-results">
                <h3>Ranking de la Ronda</h3>
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Pos.</th>
                      <th>Jugador</th>
                      <th>Precisión</th>
                      <th>Color</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roundRanking.map((player, idx) => (
                      <tr key={player.id || idx} className={idx === 0 ? "winner-row" : ""}>
                        <td>#{idx + 1}</td>
                        <td>{player.name}</td>
                        <td>{player.accuracy}%</td>
                        <td>
                          <span
                            className="mini-swatch"
                            style={{ backgroundColor: hslToCss(player.color) }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => setStep("character")}
              >
                Volver a Ver Personajes
              </button>

              {(!isMultiplayer || isHost) ? (
                <button className="primary-button" onClick={onNextRound}>
                  Siguiente Ronda
                </button>
              ) : (
                <p className="waiting-host-text">
                  Esperando al anfitrión para la siguiente ronda...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
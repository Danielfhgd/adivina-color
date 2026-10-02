import { hslToCss, getScoreMessage } from "../utils/color";

export default function ResultPanel({
  accuracy,
  selectedColor,
  targetColor,
  challenge,
  onNextRound,
}) {
  const userColorCss = hslToCss(selectedColor);
  const targetColorCss = hslToCss(targetColor);

  // Fix image paths for GitHub Pages / Vite BASE_URL
  const cleanBasePath = challenge.baseImage.replace(/^\.\//, '');
  const finalBaseSrc = `${import.meta.env.BASE_URL}${cleanBasePath}`;

  const cleanMaskPath = challenge.maskImage.replace(/^\.\//, '');
  const finalMaskSrc = `${import.meta.env.BASE_URL}${cleanMaskPath}`;

  return (
    <section className="result-panel">
      <p className="section-label">Resultado de la ronda</p>
      <h2>{accuracy}% de precisión</h2>
      <p className="result-message">{getScoreMessage(accuracy)}</p>

      <div className="character-comparison-grid">
        <div className="comparison-card">
          <span className="comparison-badge user-badge">Tu elección</span>
          <div className="character-preview-stage">
            <div
              className="character-image-layer"
              style={{
                backgroundColor: userColorCss,
                maskImage: `url("${finalMaskSrc}")`,
                WebkitMaskImage: `url("${finalMaskSrc}")`,
              }}
            />
            <img
              className="character-base-image"
              src={finalBaseSrc}
              alt={challenge.characterName}
              draggable="false"
            />
          </div>
          <small>
            HSL({selectedColor.h}°, {selectedColor.s}%, {selectedColor.l}%)
          </small>
        </div>

        <div className="comparison-card">
          <span className="comparison-badge target-badge">Color real</span>
          <div className="character-preview-stage">
            <div
              className="character-image-layer"
              style={{
                backgroundColor: targetColorCss,
                maskImage: `url("${finalMaskSrc}")`,
                WebkitMaskImage: `url("${finalMaskSrc}")`,
              }}
            />
            <img
              className="character-base-image"
              src={finalBaseSrc}
              alt={challenge.characterName}
              draggable="false"
            />
          </div>
          <small>
            HSL({targetColor.h}°, {targetColor.s}%, {targetColor.l}%)
          </small>
        </div>
      </div>

      <button className="primary-button" onClick={onNextRound}>
        Siguiente ronda
      </button>
    </section>
  );
}
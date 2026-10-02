import { hslToCss } from "../utils/color";

export default function MaskedCharacter({
  color,
  characterName,
  zoneName,
  baseImage,
  maskImage,
}) {
  const selectedColor = hslToCss(color);

  return (
    <section className="character-card">
      <div className="character-copy">
        <p className="section-label">Personaje de la ronda</p>
        <h2>{characterName}</h2>
        <p>
          Encuentra el color real de su{" "}
          <strong>{zoneName.toLowerCase()}</strong>.
        </p>
      </div>

      <div className="character-image-stage">
        <div
          className="character-image-layer"
          style={{
            backgroundColor: selectedColor,
            maskImage: `url("${maskImage}")`,
            WebkitMaskImage: `url("${maskImage}")`,
          }}
          aria-label={`${zoneName} recoloreable de ${characterName}`}
          role="img"
        />

        <img
          className="character-base-image"
          src={baseImage}
          alt={characterName}
          draggable="false"
        />
      </div>
    </section>
  );
}
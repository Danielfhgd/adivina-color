import { hslToCss } from "../utils/color";

export default function CharacterPreview({
  color,
  characterName,
  zoneName,
  baseImage,
  maskImage,
}) {
  const selectedColor = hslToCss(color);

  return (
    <div className="character-preview-stage">
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
  );
}
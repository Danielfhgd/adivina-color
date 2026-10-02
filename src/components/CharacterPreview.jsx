import { hslToCss } from "../utils/color";

export default function CharacterPreview({
  color,
  characterName,
  zoneName,
  baseImage,
  maskImage,
}) {
  const selectedColor = hslToCss(color);

  // Fix image paths for GitHub Pages / Vite BASE_URL
  const cleanBasePath = baseImage.replace(/^\.\//, '');
  const finalBaseSrc = `${import.meta.env.BASE_URL}${cleanBasePath}`;

  const cleanMaskPath = maskImage.replace(/^\.\//, '');
  const finalMaskSrc = `${import.meta.env.BASE_URL}${cleanMaskPath}`;

  return (
    <div className="character-preview-stage">
      <div
        className="character-image-layer"
        style={{
          backgroundColor: selectedColor,
          maskImage: `url("${finalMaskSrc}")`,
          WebkitMaskImage: `url("${finalMaskSrc}")`,
        }}
        aria-label={`${zoneName} recoloreable de ${characterName}`}
        role="img"
      />
      <img
        className="character-base-image"
        src={finalBaseSrc}
        alt={characterName}
        draggable="false"
      />
    </div>
  );
}
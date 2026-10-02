import { hslToCss } from "../utils/color";

export default function ColorPreview({ color }) {
  return (
    <section className="preview-card">
      <div
        className="color-swatch"
        style={{ backgroundColor: hslToCss(color) }}
        aria-label="Vista previa del color seleccionado"
      />

      <div>
        <p className="section-label">Tu elección</p>
        <strong>HSL({color.h}°, {color.s}%, {color.l}%)</strong>
      </div>
    </section>
  );
}
import { rgbToCss } from "../utils/color";

export default function ColorPreview({ color }) {
  return (
    <section className="preview-card">
      <div
        className="color-swatch"
        style={{ backgroundColor: rgbToCss(color) }}
        aria-label="Vista previa del color seleccionado"
      />

      <div>
        <p className="section-label">Tu elección</p>
        <strong>RGB({color.r}, {color.g}, {color.b})</strong>
      </div>
    </section>
  );
}
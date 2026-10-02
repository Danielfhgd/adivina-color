const controls = [
  {
    key: "h",
    label: "Tono",
    unit: "°",
    min: 0,
    max: 360,
    className: "hue-range",
  },
  {
    key: "s",
    label: "Saturación",
    unit: "%",
    min: 0,
    max: 100,
    className: "saturation-range",
  },
  {
    key: "l",
    label: "Luminosidad",
    unit: "%",
    min: 0,
    max: 100,
    className: "lightness-range",
  },
];

export default function ColorControls({
  color,
  onColorChange,
  disabled,
}) {
  function handleChange(key, value) {
    onColorChange({
      ...color,
      [key]: Number(value),
    });
  }

  return (
    <section
      className="controls-card"
      style={{
        "--selected-hue": color.h,
        "--selected-saturation": `${color.s}%`,
      }}
    >
      <div className="controls-heading">
        <div>
          <p className="section-label">Laboratorio de color</p>
          <h2>Ajusta tu respuesta</h2>
        </div>
        <span className="live-badge">EN VIVO</span>
      </div>

      <div className="sliders">
        {controls.map((control) => (
          <label className="slider-group" key={control.key}>
            <span className="slider-topline">
              <strong>{control.label}</strong>
              <output>
                {color[control.key]}
                {control.unit}
              </output>
            </span>

            <input
              type="range"
              min={control.min}
              max={control.max}
              value={color[control.key]}
              className={control.className}
              disabled={disabled}
              onChange={(event) =>
                handleChange(control.key, event.target.value)
              }
            />
          </label>
        ))}
      </div>
    </section>
  );
}
const controls = [
  {
    key: "r",
    label: "Rojo",
    unit: "",
    min: 0,
    max: 255,
    className: "red-range",
  },
  {
    key: "g",
    label: "Verde",
    unit: "",
    min: 0,
    max: 255,
    className: "green-range",
  },
  {
    key: "b",
    label: "Azul",
    unit: "",
    min: 0,
    max: 255,
    className: "blue-range",
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
        "--selected-r": color.r,
        "--selected-g": color.g,
        "--selected-b": color.b,
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
import { useEffect, useRef, useState } from "react";
import {
  getAverageColor,
  rgbToHex,
  rgbToHsl,
} from "../utils/colorConversion";

const DEFAULT_TOLERANCE = 58;

function colorDistance(firstColor, secondColor) {
  const redDifference = firstColor.r - secondColor.r;
  const greenDifference = firstColor.g - secondColor.g;
  const blueDifference = firstColor.b - secondColor.b;

  return Math.sqrt(
    redDifference * redDifference +
      greenDifference * greenDifference +
      blueDifference * blueDifference
  );
}

function getPixelColor(data, width, x, y) {
  const index = (y * width + x) * 4;

  return {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2],
    a: data[index + 3],
  };
}

function buildMaskFromSeeds(imageData, seeds, tolerance) {
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  const selected = new Uint8Array(totalPixels);
  const checked = new Uint8Array(totalPixels);

  for (const seed of seeds) {
    const startIndex = seed.y * width + seed.x;

    if (checked[startIndex]) {
      continue;
    }

    const queue = [startIndex];
    let queuePosition = 0;

    while (queuePosition < queue.length) {
      const currentIndex = queue[queuePosition];
      queuePosition += 1;

      if (checked[currentIndex]) {
        continue;
      }

      checked[currentIndex] = 1;

      const x = currentIndex % width;
      const y = Math.floor(currentIndex / width);
      const pixel = getPixelColor(data, width, x, y);

      if (pixel.a === 0) {
        continue;
      }

const distance = colorDistance(pixel, seed);

      if (distance > tolerance) {
        continue;
      }

      selected[currentIndex] = 1;

      if (x > 0) queue.push(currentIndex - 1);
      if (x < width - 1) queue.push(currentIndex + 1);
      if (y > 0) queue.push(currentIndex - width);
      if (y < height - 1) queue.push(currentIndex + width);
    }
  }

  return selected;
}

function createMaskImageData(sourceImageData, selectedPixels) {
  const { width, height } = sourceImageData;
  const maskData = new ImageData(width, height);

  for (let pixelIndex = 0; pixelIndex < selectedPixels.length; pixelIndex += 1) {
    if (!selectedPixels[pixelIndex]) {
      continue;
    }

    const dataIndex = pixelIndex * 4;

    maskData.data[dataIndex] = 255;
    maskData.data[dataIndex + 1] = 255;
    maskData.data[dataIndex + 2] = 255;
    maskData.data[dataIndex + 3] = 255;
  }

  return maskData;
}

function createBaseImageData(sourceImageData, selectedPixels) {
  const { width, height, data } = sourceImageData;
  const baseData = new ImageData(width, height);

  for (let pixelIndex = 0; pixelIndex < selectedPixels.length; pixelIndex += 1) {
    const dataIndex = pixelIndex * 4;

    baseData.data[dataIndex] = data[dataIndex];
    baseData.data[dataIndex + 1] = data[dataIndex + 1];
    baseData.data[dataIndex + 2] = data[dataIndex + 2];
    baseData.data[dataIndex + 3] = selectedPixels[pixelIndex]
      ? 0
      : data[dataIndex + 3];
  }

  return baseData;
}

function getRepresentativeColor(sourceImageData, selectedPixels) {
  const { data } = sourceImageData;

  let totalRed = 0;
  let totalGreen = 0;
  let totalBlue = 0;
  let totalPixels = 0;

  for (let pixelIndex = 0; pixelIndex < selectedPixels.length; pixelIndex += 1) {
    if (!selectedPixels[pixelIndex]) {
      continue;
    }

    const dataIndex = pixelIndex * 4;

    totalRed += data[dataIndex];
    totalGreen += data[dataIndex + 1];
    totalBlue += data[dataIndex + 2];
    totalPixels += 1;
  }

  if (totalPixels === 0) {
    return null;
  }

  const color = {
    r: Math.round(totalRed / totalPixels),
    g: Math.round(totalGreen / totalPixels),
    b: Math.round(totalBlue / totalPixels),
  };

  return {
    ...color,
    hex: rgbToHex(color.r, color.g, color.b),
    hsl: rgbToHsl(color.r, color.g, color.b),
    pixelCount: totalPixels,
  };
}

function downloadCanvasAsPng(canvas, fileName) {
  canvas.toBlob((blob) => {
    if (!blob) {
      return;
    }

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(downloadUrl);
  }, "image/png");
}

function downloadJsonFile(data, fileName) {
  const fileBlob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const downloadUrl = URL.createObjectURL(fileBlob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(downloadUrl);
}

export default function CharacterEditor({ onBackToMenu }) {
  const sourceCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const baseCanvasRef = useRef(null);
  const imageDataRef = useRef(null);

  const [imageInfo, setImageInfo] = useState(null);
  const [samples, setSamples] = useState([]);
  const [tolerance, setTolerance] = useState(DEFAULT_TOLERANCE);
 const [selectedPixels, setSelectedPixels] = useState(null);
const [representativeColor, setRepresentativeColor] = useState(null);
const [generatedMaskImageData, setGeneratedMaskImageData] = useState(null);
const [generatedBaseImageData, setGeneratedBaseImageData] = useState(null);
const [characterName, setCharacterName] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
  if (
    !generatedMaskImageData ||
    !generatedBaseImageData ||
    !maskCanvasRef.current ||
    !baseCanvasRef.current
  ) {
    return;
  }

  const maskCanvas = maskCanvasRef.current;
  const maskContext = maskCanvas.getContext("2d");

  maskCanvas.width = generatedMaskImageData.width;
  maskCanvas.height = generatedMaskImageData.height;
  maskContext.putImageData(generatedMaskImageData, 0, 0);

  const baseCanvas = baseCanvasRef.current;
  const baseContext = baseCanvas.getContext("2d");

  baseCanvas.width = generatedBaseImageData.width;
  baseCanvas.height = generatedBaseImageData.height;
  baseContext.putImageData(generatedBaseImageData, 0, 0);
}, [generatedMaskImageData, generatedBaseImageData]);

  function drawImageOnCanvas(image) {
    const canvas = sourceCanvasRef.current;
    const context = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    imageDataRef.current = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  function clearGeneratedCanvases() {
  setGeneratedMaskImageData(null);
  setGeneratedBaseImageData(null);
}

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Selecciona un archivo PNG, JPG o WEBP válido.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      drawImageOnCanvas(image);

      setImageInfo({
        name: file.name,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });

      setSamples([]);
      setSelectedPixels(null);
      setRepresentativeColor(null);
      setErrorMessage("");
      clearGeneratedCanvases();

      URL.revokeObjectURL(imageUrl);
    };

    image.onerror = () => {
      setErrorMessage(
        "No fue posible cargar la imagen. Prueba con PNG, JPG o WEBP."
      );
      URL.revokeObjectURL(imageUrl);
    };

    image.src = imageUrl;
  }

  function getCanvasCoordinates(event) {
  const canvas = sourceCanvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const styles = window.getComputedStyle(canvas);

  const borderLeft = Number.parseFloat(styles.borderLeftWidth) || 0;
  const borderTop = Number.parseFloat(styles.borderTopWidth) || 0;
  const borderRight = Number.parseFloat(styles.borderRightWidth) || 0;
  const borderBottom = Number.parseFloat(styles.borderBottomWidth) || 0;

  const visibleWidth = rect.width - borderLeft - borderRight;
  const visibleHeight = rect.height - borderTop - borderBottom;

  const x = Math.floor(
    ((event.clientX - rect.left - borderLeft) / visibleWidth) * canvas.width
  );

  const y = Math.floor(
    ((event.clientY - rect.top - borderTop) / visibleHeight) * canvas.height
  );

  return {
    x: Math.max(0, Math.min(canvas.width - 1, x)),
    y: Math.max(0, Math.min(canvas.height - 1, y)),
  };
}

  function handleCanvasClick(event) {
    if (!imageDataRef.current || !sourceCanvasRef.current) {
      return;
    }

    const { x, y } = getCanvasCoordinates(event);
    const color = getAverageColor(imageDataRef.current, x, y);

    if (!color) {
      setErrorMessage(
        "Seleccionaste transparencia. Haz clic dentro de una zona visible."
      );
      return;
    }

    const newSample = {
      id: `${x}-${y}-${Date.now()}`,
      x,
      y,
      ...color,
      hex: rgbToHex(color.r, color.g, color.b),
      hsl: rgbToHsl(color.r, color.g, color.b),
    };

    setSamples((currentSamples) => [...currentSamples, newSample]);
    setSelectedPixels(null);
setRepresentativeColor(null);
setGeneratedMaskImageData(null);
setGeneratedBaseImageData(null);
setErrorMessage("");
  }

  function generateMask() {
    if (!imageDataRef.current || samples.length === 0) {
      setErrorMessage(
        "Primero carga una imagen y agrega al menos una muestra de color."
      );
      return;
    }

    const sourceImageData = imageDataRef.current;
    const pixels = buildMaskFromSeeds(sourceImageData, samples, tolerance);
    const selectedCount = pixels.reduce(
      (total, isSelected) => total + isSelected,
      0
    );

    if (selectedCount === 0) {
      setErrorMessage(
        "No se encontró una región con esa tolerancia. Auméntala o agrega una muestra en una zona más uniforme."
      );
      return;
    }

    const maskImageData = createMaskImageData(sourceImageData, pixels);
    const baseImageData = createBaseImageData(sourceImageData, pixels);
    const targetColor = getRepresentativeColor(sourceImageData, pixels);

    setGeneratedMaskImageData(maskImageData);
setGeneratedBaseImageData(baseImageData);
setSelectedPixels(pixels);
setRepresentativeColor(targetColor);
setErrorMessage("");
  }

  function undoLastSample() {
    setSamples((currentSamples) => currentSamples.slice(0, -1));
    setSelectedPixels(null);
setRepresentativeColor(null);
setGeneratedMaskImageData(null);
setGeneratedBaseImageData(null);
setErrorMessage("");
  }

  function resetSelection() {
    setSamples([]);
    setSelectedPixels(null);
    setRepresentativeColor(null);
    setErrorMessage("");
    clearGeneratedCanvases();
  }

  function downloadAssets() {
    if (!selectedPixels || !imageInfo || !representativeColor) {
      setErrorMessage("Genera una máscara antes de descargar los archivos.");
      return;
    }

    const safeId =
      characterName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "personaje";

    downloadCanvasAsPng(baseCanvasRef.current, "base.png");
    downloadCanvasAsPng(maskCanvasRef.current, "mask.png");

    downloadJsonFile(
      {
        id: safeId,
        characterName: characterName.trim() || "Personaje sin nombre",
        zoneName: zoneName.trim() || "zona recoloreable",
        baseImage: `/characters/${safeId}/base.png`,
        maskImage: `/characters/${safeId}/mask.png`,
        target: representativeColor.hsl,
        targetRgb: {
          r: representativeColor.r,
          g: representativeColor.g,
          b: representativeColor.b,
        },
        targetHex: representativeColor.hex,
        selectedPixels: representativeColor.pixelCount,
      },
      `${safeId}.json`
    );
  }

  const selectionPercentage =
    selectedPixels && imageInfo
      ? ((representativeColor.pixelCount / (imageInfo.width * imageInfo.height)) * 100).toFixed(2)
      : null;

  return (
    <main className="editor-screen">
      <section className="editor-container">
        <header className="editor-header">
          <div>
            <p className="eyebrow">HERRAMIENTA PRIVADA DE CREACIÓN</p>
            <h1>Editor de personajes</h1>
            <p>
              Carga una imagen, marca uno o varios tonos de la misma zona y
              genera automáticamente su máscara recoloreable.
            </p>
          </div>

          <button className="secondary-button" onClick={onBackToMenu}>
            Volver al menú
          </button>
        </header>

        <section className="editor-form-card">
          <div className="editor-name-fields">
            <label className="form-field">
              <span>Nombre del personaje</span>
              <input
                type="text"
                value={characterName}
                maxLength="32"
                placeholder="Ejemplo: Finn"
                onChange={(event) => setCharacterName(event.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Zona que se adivina</span>
              <input
                type="text"
                value={zoneName}
                maxLength="42"
                placeholder="Ejemplo: bolso verde"
                onChange={(event) => setZoneName(event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="editor-workspace">
          <div className="canvas-panel source-panel">
            <div className="panel-heading">
              <div>
                <p className="section-label">1. Imagen original</p>
                <h2>Marca la zona por colores</h2>
              </div>

              {imageInfo && (
                <span className="image-info">
                  {imageInfo.width} × {imageInfo.height}px
                </span>
              )}
            </div>

            <label className="file-picker">
              <span>Subir imagen del personaje</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
              />
            </label>

            {!imageInfo && (
              <div className="empty-canvas-message">
                <span>+</span>
                <p>Selecciona una imagen PNG, JPG o WEBP para empezar.</p>
              </div>
            )}

            <div
              className={`canvas-wrapper ${imageInfo ? "has-image" : ""}`}
            >
              <canvas
                ref={sourceCanvasRef}
                className="character-editor-canvas"
                onClick={handleCanvasClick}
              />

              {samples.map((sample, index) => (
                <span
                  className="sample-marker"
                  key={sample.id}
                  style={{
                    left: `${(sample.x / imageInfo.width) * 100}%`,
                    top: `${(sample.y / imageInfo.height) * 100}%`,
                  }}
                  title={`Muestra ${index + 1}: ${sample.hex}`}
                >
                  {index + 1}
                </span>
              ))}
            </div>

            <p className="canvas-help">
              Haz clic en tonos centrales de la zona. Para un bolso con luces y
              sombras, añade una muestra clara, una media y una oscura.
            </p>
          </div>

          <aside className="selection-controls-panel">
            <p className="section-label">2. Configuración</p>
            <h2>Selecciona y genera</h2>

            <div className="tolerance-control">
              <div className="tolerance-heading">
                <label htmlFor="tolerance">Tolerancia de color</label>
                <output>{tolerance}</output>
              </div>

              <input
                id="tolerance"
                type="range"
                min="5"
                max="180"
                value={tolerance}
                onChange={(event) => {
  setTolerance(Number(event.target.value));
  setSelectedPixels(null);
  setRepresentativeColor(null);
  setGeneratedMaskImageData(null);
  setGeneratedBaseImageData(null);
}}
              />

              <p>
                Baja: más preciso, puede dejar huecos. Alta: cubre más tonos,
                pero puede tomar zonas no deseadas.
              </p>
            </div>

            <div className="samples-list">
              <div className="samples-list-heading">
                <strong>Muestras agregadas</strong>
                <span>{samples.length}</span>
              </div>

              {samples.length === 0 ? (
                <p className="samples-empty">
                  Aún no hay muestras. Haz clic en la imagen.
                </p>
              ) : (
                samples.map((sample, index) => (
                  <div className="sample-list-item" key={sample.id}>
                    <span
                      className="sample-dot"
                      style={{ backgroundColor: sample.hex }}
                    />
                    <div>
                      <strong>Muestra {index + 1}</strong>
                      <small>
                        {sample.hex} · HSL({sample.hsl.h}°, {sample.hsl.s}%,
                        {" "}{sample.hsl.l}%)
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="editor-action-stack">
              <button
                className="primary-button"
                onClick={generateMask}
                disabled={!imageInfo || samples.length === 0}
              >
                Generar máscara
              </button>

              <button
                className="secondary-button"
                onClick={undoLastSample}
                disabled={samples.length === 0}
              >
                Deshacer última muestra
              </button>

              <button
                className="text-button"
                onClick={resetSelection}
                disabled={samples.length === 0}
              >
                Reiniciar selección
              </button>
            </div>

            {errorMessage && (
              <p className="editor-error" role="alert">
                {errorMessage}
              </p>
            )}
          </aside>
        </section>

        {selectedPixels && representativeColor && (
          <section className="generated-assets-section">
            <div className="generated-assets-heading">
              <div>
                <p className="section-label">3. Resultado generado</p>
                <h2>Revisa tu máscara y descarga los recursos</h2>
              </div>

              <span className="selection-stat">
                {representativeColor.pixelCount.toLocaleString()} píxeles ·{" "}
                {selectionPercentage}% de la imagen
              </span>
            </div>

            <div className="generated-preview-grid">
              <article className="generated-preview-card">
                <h3>Base transparente</h3>
                <p>La región seleccionada queda vacía para recibir el color.</p>
                <div className="generated-canvas-wrapper">
                  <canvas ref={baseCanvasRef} />
                </div>
              </article>

              <article className="generated-preview-card">
                <h3>Máscara automática</h3>
                <p>La zona blanca será recoloreable dentro del juego.</p>
                <div className="generated-canvas-wrapper">
                  <canvas ref={maskCanvasRef} />
                </div>
              </article>

              <article className="generated-preview-card target-card">
                <h3>Color objetivo real</h3>
                <p>Promedio de todos los píxeles seleccionados.</p>

                <div
                  className="target-color-preview"
                  style={{ backgroundColor: representativeColor.hex }}
                />

                <div className="target-values">
                  <span>{representativeColor.hex}</span>
                  <strong>
                    HSL({representativeColor.hsl.h}°,{" "}
                    {representativeColor.hsl.s}%,{" "}
                    {representativeColor.hsl.l}%)
                  </strong>
                </div>
              </article>
            </div>

            <div className="download-section">
              <div>
                <h3>Descargar recursos del personaje</h3>
                <p>
                  Se descargarán <code>base.png</code>, <code>mask.png</code>{" "}
                  y un JSON con el color objetivo detectado.
                </p>
              </div>

              <button className="primary-button download-button" onClick={downloadAssets}>
                Descargar recursos
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
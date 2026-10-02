export function rgbToHex(r, g, b) {
  const toHex = (value) => value.toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return {
      h: 0,
      s: 0,
      l: Math.round(lightness * 100),
    };
  }

  const difference = max - min;
  const saturation =
    lightness > 0.5
      ? difference / (2 - max - min)
      : difference / (max + min);

  let hue;

  if (max === red) {
    hue = (green - blue) / difference + (green < blue ? 6 : 0);
  } else if (max === green) {
    hue = (blue - red) / difference + 2;
  } else {
    hue = (red - green) / difference + 4;
  }

  return {
    h: Math.round(hue * 60),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

export function getAverageColor(imageData, centerX, centerY, radius = 4) {
  const { data, width, height } = imageData;

  let totalRed = 0;
  let totalGreen = 0;
  let totalBlue = 0;
  let totalPixels = 0;

  const startX = Math.max(0, centerX - radius);
  const endX = Math.min(width - 1, centerX + radius);
  const startY = Math.max(0, centerY - radius);
  const endY = Math.min(height - 1, centerY + radius);

  for (let y = startY; y <= endY; y += 1) {
    for (let x = startX; x <= endX; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const alpha = data[pixelIndex + 3];

      if (alpha === 0) {
        continue;
      }

      totalRed += data[pixelIndex];
      totalGreen += data[pixelIndex + 1];
      totalBlue += data[pixelIndex + 2];
      totalPixels += 1;
    }
  }

  if (totalPixels === 0) {
    return null;
  }

  return {
    r: Math.round(totalRed / totalPixels),
    g: Math.round(totalGreen / totalPixels),
    b: Math.round(totalBlue / totalPixels),
  };
}
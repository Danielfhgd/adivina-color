// 1. Conversión base de RGB a XYZ
function rgbToXyz(r, g, b) {
  let var_R = r / 255; let var_G = g / 255; let var_B = b / 255;
  var_R = var_R > 0.04045 ? Math.pow((var_R + 0.055) / 1.055, 2.4) : var_R / 12.92;
  var_G = var_G > 0.04045 ? Math.pow((var_G + 0.055) / 1.055, 2.4) : var_G / 12.92;
  var_B = var_B > 0.04045 ? Math.pow((var_B + 0.055) / 1.055, 2.4) : var_B / 12.92;
  var_R *= 100; var_G *= 100; var_B *= 100;
  return {
    x: var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805,
    y: var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722,
    z: var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505
  };
}

// 2. Conversión de XYZ a CIELAB
function xyzToLab(x, y, z) {
  let var_X = x / 95.047; let var_Y = y / 100.000; let var_Z = z / 108.883;
  var_X = var_X > 0.008856 ? Math.pow(var_X, 1/3) : (7.787 * var_X) + (16 / 116);
  var_Y = var_Y > 0.008856 ? Math.pow(var_Y, 1/3) : (7.787 * var_Y) + (16 / 116);
  var_Z = var_Z > 0.008856 ? Math.pow(var_Z, 1/3) : (7.787 * var_Z) + (16 / 116);
  return { l: (116 * var_Y) - 16, a: 500 * (var_X - var_Y), b: 200 * (var_Y - var_Z) };
}

// 3. Algoritmo Oficial de Distancia de Color CIEDE2000
function ciede2000(lab1, lab2) {
  const L1 = lab1.l; const a1 = lab1.a; const b1 = lab1.b;
  const L2 = lab2.l; const a2 = lab2.a; const b2 = lab2.b;

  const kL = 1; const kC = 1; const kH = 1;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const meanC = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(meanC, 7) / (Math.pow(meanC, 7) + Math.pow(25, 7))));
  const a1Prime = a1 * (1 + G);
  const a2Prime = a2 * (1 + G);

  const C1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1);
  const C2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2);

  let h1Prime = Math.atan2(b1, a1Prime) * (180 / Math.PI);
  if (h1Prime < 0) h1Prime += 360;
  let h2Prime = Math.atan2(b2, a2Prime) * (180 / Math.PI);
  if (h2Prime < 0) h2Prime += 360;

  const deltaLPrime = L2 - L1;
  const deltaCPrime = C2Prime - C1Prime;

  let deltahPrime = 0;
  if (C1Prime * C2Prime !== 0) {
    deltahPrime = h2Prime - h1Prime;
    if (deltahPrime > 180) deltahPrime -= 360;
    else if (deltahPrime < -180) deltahPrime += 360;
  }
  const deltaHPrime = 2 * Math.sqrt(C1Prime * C2Prime) * Math.sin((deltahPrime / 2) * (Math.PI / 180));

  const meanLPrime = (L1 + L2) / 2;
  const meanCPrime = (C1Prime + C2Prime) / 2;

  let meanhPrime = 0;
  if (C1Prime * C2Prime !== 0) {
    if (Math.abs(h1Prime - h2Prime) <= 180) {
      meanhPrime = (h1Prime + h2Prime) / 2;
    } else {
      meanhPrime = h1Prime + h2Prime < 360 ? (h1Prime + h2Prime + 360) / 2 : (h1Prime + h2Prime - 360) / 2;
    }
  }

  const T = 1 - 0.17 * Math.cos((meanhPrime - 30) * (Math.PI / 180))
            + 0.24 * Math.cos((2 * meanhPrime) * (Math.PI / 180))
            + 0.32 * Math.cos((3 * meanhPrime + 6) * (Math.PI / 180))
            - 0.20 * Math.cos((4 * meanhPrime - 63) * (Math.PI / 180));

  const deltaTheta = 30 * Math.exp(-Math.pow((meanhPrime - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(meanCPrime, 7) / (Math.pow(meanCPrime, 7) + Math.pow(25, 7)));
  const RT = -Math.sin((2 * deltaTheta) * (Math.PI / 180)) * RC;

  const sL = 1 + (0.015 * Math.pow(meanLPrime - 50, 2)) / Math.sqrt(20 + Math.pow(meanLPrime - 50, 2));
  const sC = 1 + 0.045 * meanCPrime;
  const sH = 1 + 0.015 * meanCPrime * T;

  const deltaE00 = Math.sqrt(
    Math.pow(deltaLPrime / (kL * sL), 2) +
    Math.pow(deltaCPrime / (kC * sC), 2) +
    Math.pow(deltaHPrime / (kH * sH), 2) +
    RT * (deltaCPrime / (kC * sC)) * (deltaHPrime / (kH * sH))
  );

  return deltaE00;
}

// 4. Función de exportación de precisión del juego
export function calculateAccuracy(usuario, objetivo) {
  const u = usuario && typeof usuario === 'object' ? usuario : { r: 128, g: 128, b: 128 };
  const t = objetivo && typeof objetivo === 'object' ? objetivo : { r: 128, g: 128, b: 128 };

  const labUser = xyzToLab(rgbToXyz(u.r, u.g, u.b).x, rgbToXyz(u.r, u.g, u.b).y, rgbToXyz(u.r, u.g, u.b).z);
  const labTarget = xyzToLab(rgbToXyz(t.r, t.g, t.b).x, rgbToXyz(t.r, t.g, t.b).y, rgbToXyz(t.r, t.g, t.b).z);

  const deltaE = ciede2000(labUser, labTarget);

  // En CIEDE2000, una distancia mayor a 40 ya se considera un color completamente diferente para el ojo.
  // Normalizamos el porcentaje linealmente con un factor de escala justo.
  let precision = 100 - (deltaE * 2.2); 
  
  precision = Math.max(0, Math.min(100, precision));
  return parseFloat(precision.toFixed(2));
}

export { calculateAccuracy as calcularPorcentajePrecision };

export function rgbToCss(color) {
  if (!color) return "rgb(128, 128, 128)";
  return `rgb(${color.r || 0}, ${color.g || 0}, ${color.b || 0})`;
}

export function getScoreMessage(accuracy) {
  if (accuracy >= 95) return "¡Increíble! Casi idéntico.";
  if (accuracy >= 80) return "¡Muy buen ojo para el color!";
  if (accuracy >= 60) return "Buen intento. Estuviste cerca.";
  if (accuracy >= 40) return "Vas por buen camino.";
  return "Sigue intentando: cada ronda ayuda a entrenar el ojo.";
}
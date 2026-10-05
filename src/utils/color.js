export function rgbToCss({ r, g, b }) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function andreChannel(userVal, targetVal) {
  if (userVal === targetVal) return 100;

  if (userVal < targetVal) {
    // CASO A: Se quedó corto (lado 0 → puntoDulce)
    // Distancia máxima = targetVal
    // Cada punto vale 100 / targetVal %
    // Usuario está en userVal → userVal * (100/targetVal)
    if (targetVal === 0) return 0;
    return userVal * (100 / targetVal);
  } else {
    // CASO B: Se pasó (lado puntoDulce → 255)
    // Distancia máxima = 255 - targetVal
    // Cada punto vale 100 / (255 - targetVal) %
    // Se pasó (userVal - targetVal) puntos
    // Porcentaje de exceso = (userVal - targetVal) * (100 / (255 - targetVal))
    // Acierto = 100 - exceso
    const maxDer = 255 - targetVal;
    if (maxDer === 0) return 0;
    const exceso = (userVal - targetVal) * (100 / maxDer);
    return Math.max(0, 100 - exceso);
  }
}

export function calculateAccuracy(usuario, objetivo) {
  const u = usuario && typeof usuario === 'object' ? usuario : { r: 128, g: 128, b: 128 };
  const t = objetivo && typeof objetivo === 'object' ? objetivo : { r: 128, g: 128, b: 128 };

  const pctR = andreChannel(u.r, t.r);
  const pctG = andreChannel(u.g, t.g);
  const pctB = andreChannel(u.b, t.b);

  // Regla de Andre: sumar 3 canales (0-300%) y dividir entre 300
  const sumaPorcentajes = pctR + pctG + pctB;
  const promedioBase = (sumaPorcentajes / 300) * 100;

  // Curva de dificultad (pow 2.2)
  const precisionConCurva = Math.pow(promedioBase / 100, 2.2) * 100;

  return parseFloat(precisionConCurva.toFixed(2));
}

export function getScoreMessage(accuracy) {
  if (accuracy >= 95) return "¡Increíble! Casi idéntico.";
  if (accuracy >= 80) return "¡Muy buen ojo para el color!";
  if (accuracy >= 60) return "Buen intento. Estuviste cerca.";
  if (accuracy >= 40) return "Vas por buen camino.";
  return "Sigue intentando: cada ronda ayuda a entrenar el ojo.";
}
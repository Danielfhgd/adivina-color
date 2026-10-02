export function hslToCss({ h, s, l }) {
  return `hsl(${h} ${s}% ${l}%)`;
}

function getCircularHueDifference(firstHue, secondHue) {
  const difference = Math.abs(firstHue - secondHue);
  return difference > 180 ? 360 - difference : difference;
}

export function calculateAccuracy(colorTarget, colorUser) {
  // 1. Calcular diferencias absolutas tomando en cuenta que Hue es circular (0-360)
  let dH = Math.abs(colorTarget.h - colorUser.h);
  if (dH > 180) dH = 360 - dH;

  // Normalizar diferencias individuales (todas a escala 0.0 - 1.0)
  const hError = dH / 180;
  const sError = Math.abs(colorTarget.s - colorUser.s) / 100;
  const lError = Math.abs(colorTarget.l - colorUser.l) / 100;

  // 2. Calcular error geométrico usando distancia euclidiana ponderada
  // Le damos un peso equilibrado: 50% al Tono, 25% a Saturación y 25% a Luminosidad
  const totalError = Math.sqrt(
    Math.pow(hError, 2) * 0.50 +
    Math.pow(sError, 2) * 0.25 +
    Math.pow(lError, 2) * 0.25
  );

  // 3. Aplicar una curva de penalización exponencial suave (exponente 2.2)
  // Esto permite que colores cercanos reciban puntuación justa y motivadora
  // manteniendo penalizados los colores aleatorios.
  const accuracy = 100 * Math.pow(Math.max(0, 1 - totalError), 2.2);

  return Math.round(accuracy);
}

export function getScoreMessage(accuracy) {
  if (accuracy >= 95) return "¡Increíble! Casi idéntico.";
  if (accuracy >= 80) return "¡Muy buen ojo para el color!";
  if (accuracy >= 60) return "Buen intento. Estuviste cerca.";
  if (accuracy >= 40) return "Vas por buen camino.";
  return "Sigue intentando: cada ronda ayuda a entrenar el ojo.";
}
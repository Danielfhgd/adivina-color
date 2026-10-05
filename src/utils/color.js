export function rgbToCss({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

function calculateChannel(userVal, targetVal) {
  if (userVal === targetVal) return 100;
  if (userVal < targetVal) {
    return userVal * (100 / targetVal);
  } else {
    const maxDer = 255 - targetVal;
    return (maxDer - (userVal - targetVal)) * (100 / maxDer);
  }
}

export function calculateAccuracy(usuario, objetivo) {
  // ESCUDO DE SEGURIDAD: Evitar que el juego explote si los datos llegan vacíos
  const u = usuario && typeof usuario === 'object' ? usuario : { r: 128, g: 128, b: 128 };
  const t = objetivo && typeof objetivo === 'object' ? objetivo : { r: 128, g: 128, b: 128 };

  // 1. Calculamos la distancia geométrica real en un espacio 3D (Teorema de Pitágoras tridimensional)
  const diffR = u.r - t.r;
  const diffG = u.g - t.g;
  const diffB = u.b - t.b;
  
  const distanciaReal = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);

  // 2. La distancia máxima posible en el espacio RGB (desde el negro 0,0,0 al blanco 255,255,255) es ~441.67
  const distanciaMaxima = Math.sqrt(255 * 255 + 255 * 255 + 255 * 255);

  // 3. El porcentaje de precisión es la diferencia lineal limpia respecto al total
  // Si la distancia es 0 (colores idénticos), da 100%. 
  // Si están muy cerca (como el short de Mickey), te dará entre 94% y 99%.
  // Si están muy lejos (como el gris contra el rosa de Steven), te dará un puntaje bajo y justo.
  const precisionFinal = (1 - distanciaReal / distanciaMaxima) * 100;

  // Devolvemos el resultado limpio con máximo dos decimales
  return parseFloat(Math.max(0, Math.min(100, precisionFinal)).toFixed(2));
}

export function getScoreMessage(accuracy) {
  if (accuracy >= 95) return "¡Increíble! Casi idéntico.";
  if (accuracy >= 80) return "¡Muy buen ojo para el color!";
  if (accuracy >= 60) return "Buen intento. Estuviste cerca.";
  if (accuracy >= 40) return "Vas por buen camino.";
  return "Sigue intentando: cada ronda ayuda a entrenar el ojo.";
}
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
  const u = usuario && typeof usuario === 'object' ? usuario : { r: 128, g: 128, b: 128 };
  const t = objetivo && typeof objetivo === 'object' ? objetivo : { r: 128, g: 128, b: 128 };

  const calcularCanal = (valUser, targetVal) => {
    if (valUser === targetVal) return 100;
    
    // TRAMO 1: El usuario se quedó CORTO (Izquierda) - Ecuación original de Andre
    if (valUser < targetVal) {
      if (targetVal === 0) return 0;
      return valUser * (100 / targetVal);
    } 
    
    // TRAMO 2: El usuario se PASÓ (Derecha) - La fórmula cómoda corregida de Andre
    else {
      const maxDerecha = 255 - targetVal;
      if (maxDerecha === 0) return 0;
      
      const distanciaAlPuntoDulce = valUser - targetVal;
      const pasosRestantesAPared = maxDerecha - distanciaAlPuntoDulce; // 135 - 80 = 55
      
      return pasosRestantesAPared * (100 / maxDerecha);
    }
  };

  const pctR = calcularCanal(u.r, t.r);
  const pctG = calcularCanal(u.g, t.g);
  const pctB = calcularCanal(u.b, t.b);

  // Regla de Andre: Sumamos los 3 canales (0-300%)
  const sumaPorcentajes = pctR + pctG + pctB;
  const promedioBase = (sumaPorcentajes / 300) * 100;

  // EL TOQUE SECRETO DE DIFICULTAD:
  // Elevamos la nota base a una potencia exponencial (2.2) para que las diferencias 
  // visuales grandes (como el gris contra el rosa) tiren el puntaje hacia abajo de forma justa.
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
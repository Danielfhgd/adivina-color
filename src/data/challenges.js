// Importa dinámicamente todos los archivos JSON dentro de src/data/characters/
const jsonModules = import.meta.glob("./characters/*.json", { eager: true });

// Mapea los módulos JSON importados para construir el arreglo de retos
export const CHALLENGES = Object.values(jsonModules).map((module) => module.default || module);

export const ROUND_DURATION = 20;

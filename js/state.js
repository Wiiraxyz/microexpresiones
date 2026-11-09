/**
 * Estado global de la aplicación (solo en memoria; no se envía ni se guarda nada).
 * Separa la lógica de puntuación de la presentación: la UI se suscribe y se repinta.
 */
const scores = new Map(); // id de actividad → puntos conseguidos
const maxima = new Map(); // id de actividad → puntos máximos posibles
const listeners = new Set();

const sum = (map) => [...map.values()].reduce((a, b) => a + b, 0);
const emit = () => listeners.forEach((fn) => fn({ total: getTotal(), max: getMax() }));

/** Registra una actividad con su puntuación máxima y la deja a cero. */
export function registerActivity(id, max) {
  maxima.set(id, max);
  scores.set(id, 0);
  emit();
}

export function addScore(id, delta = 1) {
  scores.set(id, (scores.get(id) ?? 0) + delta);
  emit();
}

export function resetScore(id) {
  scores.set(id, 0);
  emit();
}

export const getScore = (id) => scores.get(id) ?? 0;
export const getTotal = () => sum(scores);
export const getMax = () => sum(maxima);

/** Suscribe un callback ({ total, max }); se invoca de inmediato y devuelve la función para desuscribir. */
export function subscribe(fn) {
  listeners.add(fn);
  fn({ total: getTotal(), max: getMax() });
  return () => listeners.delete(fn);
}

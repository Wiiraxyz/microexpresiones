/** Utilidades genéricas de DOM y aleatoriedad (sin conocimiento del dominio clínico). */

/**
 * Crea un elemento. Props especiales: `class`, `html` (innerHTML de contenido propio),
 * `dataset`, y `onXxx` para listeners. El resto se asigna como atributo.
 * Los hijos aceptan nodos, strings o arrays; null/false se ignoran.
 */
export function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (/^on[A-Z]/.test(key)) node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  node.append(...children.flat().filter((c) => c != null && c !== false));
  return node;
}

/** Botón neumorfista. variant: 'primary' | 'xl' | undefined */
export function button(label, { onClick, variant = '', ...attrs } = {}) {
  const classes = ['neu-btn', ...variant.split(' ').filter(Boolean).map((v) => `neu-btn--${v}`)];
  return h('button', { type: 'button', class: classes.join(' '), onClick, ...attrs }, label);
}

export const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const sample = (list, n) => shuffle(list).slice(0, n);
export const randInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));
export const pad = (n) => String(n).padStart(2, '0');

/** 4250 → "00:04.2" */
export function formatTime(ms) {
  const total = Math.max(0, ms);
  const m = Math.floor(total / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const d = Math.floor((total % 1000) / 100);
  return `${pad(m)}:${pad(s)}.${d}`;
}

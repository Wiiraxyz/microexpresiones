/**
 * Generador de rostros esquemáticos SVG y helper de estímulos.
 *
 * Un rostro se describe con tres regiones (cejas, ojos, boca), inspiradas en las
 * unidades de acción del FACS. `stimulus(tipo, actor)` es el ÚNICO punto por el que
 * las actividades piden una imagen: devuelve el SVG placeholder o, si
 * CONFIG.useRealAssets = true, un <img> con la foto real `assets/<tipo>_<NN>.jpg`.
 */
import { CONFIG } from './config.js';
import { pad } from './ui.js';

export const REGIONS = ['brows', 'eyes', 'mouth'];
export const ACTORS = Array.from({ length: 12 }, (_, i) => i + 1);

/** Combinación de rasgos de cada tipo de estímulo (también es la solución de la Actividad 1). */
export const FACE_SPECS = Object.freeze({
  neutro: { brows: 'neutral', eyes: 'neutral', mouth: 'neutral' },
  alegria: { brows: 'neutral', eyes: 'squint', mouth: 'smile' },
  tristeza: { brows: 'sadInner', eyes: 'droop', mouth: 'frown' },
  ira: { brows: 'lowered', eyes: 'narrow', mouth: 'pressed' },
  miedo: { brows: 'fearRaised', eyes: 'wide', mouth: 'stretched' },
  sorpresa: { brows: 'raised', eyes: 'wide', mouth: 'open' },
  asco: { brows: 'lowered', eyes: 'narrow', mouth: 'snarl' },
  // Actividad 5: misma boca, distinta implicación del orbicular de los ojos (AU6).
  'sonrisa-genuina': { brows: 'neutral', eyes: 'squint', mouth: 'smile' },
  'sonrisa-falsa': { brows: 'neutral', eyes: 'neutral', mouth: 'smile' },
});

const SKIN = ['#ecd0b4', '#dcb08a', '#c58f66', '#a8714a', '#f2dcc6', '#b27c55', '#e3bf9d', '#94613f', '#f0d2b8', '#cf9d74', '#a97551', '#e6c3a2'];
const HAIR = ['#2b2118', '#4a3322', '#1d1d1f', '#6b4a2b', '#3b2a1e', '#161616'];
const INK = '#3b3029';

const lookFor = (actor) => ({
  skin: SKIN[(actor - 1) % SKIN.length],
  hair: HAIR[(actor * 5 - 1) % HAIR.length],
});

const line = (w = 4) =>
  `fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

/* ---------- Cejas ---------- */
const BROWS = {
  neutral: { yi: 86, yo: 88, yc: 82, pull: 0 },
  raised: { yi: 74, yo: 76, yc: 66, pull: 0 },
  lowered: { yi: 95, yo: 82, yc: 86, pull: 2, furrow: true },
  sadInner: { yi: 80, yo: 92, yc: 83, pull: 0 },
  fearRaised: { yi: 76, yo: 82, yc: 72, pull: 5 },
};

function browsFragment(variant, { hair }) {
  const s = BROWS[variant] ?? BROWS.neutral;
  const paths = [70, 130].map((ex) => {
    const d = ex < 100 ? -1 : 1; // -1 izquierda, +1 derecha
    const xi = ex - d * (16 - s.pull);
    const xo = ex + d * 20;
    return `<path d="M${xi} ${s.yi} Q${(xi + xo) / 2} ${s.yc} ${xo} ${s.yo}" fill="none" stroke="${hair}" stroke-width="5" stroke-linecap="round"/>`;
  });
  const furrow = s.furrow
    ? `<path d="M96 82 L96 94 M104 82 L104 94" ${line(1.6)} opacity=".45"/>`
    : '';
  return paths.join('') + furrow;
}

/* ---------- Ojos ---------- */
function eyeFragment(variant, ex, { skin }) {
  const ey = 108;
  const d = ex < 100 ? -1 : 1;
  const sclera = (ry) =>
    `<ellipse cx="${ex}" cy="${ey}" rx="14" ry="${ry}" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
  const iris = (r) =>
    `<circle cx="${ex}" cy="${ey}" r="${r}" fill="#4a3b32"/><circle cx="${ex}" cy="${ey}" r="${r * 0.45}" fill="#111"/>`;

  switch (variant) {
    case 'wide':
      return sclera(11) + iris(5.5);
    case 'narrow': // mirada tensa: párpado superior descendido hacia el centro
      return (
        sclera(4.6) + iris(3.8) +
        `<path d="M${ex + d * 14} ${ey - 5.5} L${ex - d * 14} ${ey - 1.5}" ${line(3.5)}/>`
      );
    case 'droop': // párpado superior caído, comisura externa descendida
      return (
        `<g transform="rotate(${d * 6} ${ex} ${ey})">` +
        sclera(7.5) + iris(5.5) +
        `<path d="M${ex - 14} ${ey} a14 7.5 0 0 1 28 0 Z" fill="${skin}"/>` +
        `<path d="M${ex - 14} ${ey} L${ex + 14} ${ey}" ${line(3)}/></g>`
      );
    case 'squint': // mejillas elevadas + patas de gallo (AU6)
      return (
        sclera(4.8) + iris(4) +
        `<path d="M${ex - 14} ${ey + 9} Q${ex} ${ey + 1} ${ex + 14} ${ey + 9}" ${line(2)} opacity=".5"/>` +
        [-4, 0, 4]
          .map((dy) => `<path d="M${ex + d * 17} ${ey + dy * 0.5} L${ex + d * 25} ${ey + dy * 2}" ${line(1.6)} opacity=".6"/>`)
          .join('')
      );
    default:
      return sclera(7.5) + iris(5.5);
  }
}

/* ---------- Boca ---------- */
const MOUTHS = {
  neutral: () => `<path d="M76 176 Q100 179 124 176" ${line(4)}/>`,
  smile: () =>
    `<path d="M80 150 Q70 162 72 168 M120 150 Q130 162 128 168" ${line(1.8)} opacity=".35"/>` +
    `<path d="M72 167 Q100 199 128 167" ${line(4.5)}/>`,
  frown: () => `<path d="M76 184 Q100 165 124 184" ${line(4.5)}/>`,
  pressed: () =>
    `<path d="M78 177 L122 177" ${line(6.5)}/><path d="M92 192 Q100 196 108 192" ${line(2)} opacity=".4"/>`,
  stretched: () =>
    `<path d="M68 178 Q100 168 132 178 Q100 195 68 178Z" fill="#6b2f2f" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>` +
    `<path d="M80 177 Q100 172 120 177 L120 181 Q100 177 80 181Z" fill="#f4efe9"/>`,
  open: () => `<ellipse cx="100" cy="183" rx="13" ry="18" fill="#5e2a2a" stroke="${INK}" stroke-width="3.5"/>`,
  snarl: () =>
    `<path d="M90 124 Q100 119 110 124 M92 130 Q100 126 108 130" ${line(1.6)} opacity=".55"/>` +
    `<path d="M76 184 Q88 167 100 174 Q112 167 124 184 Q100 190 76 184Z" fill="#f4efe9" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M80 188 Q100 198 120 188" ${line(3.5)}/>`,
};

/** Fragmento SVG por región; firma común (variante, look) → string. */
const FRAGMENTS = {
  brows: browsFragment,
  eyes: (variant, look) => [70, 130].map((ex) => eyeFragment(variant, ex, look)).join(''),
  mouth: (variant) => (MOUTHS[variant] ?? MOUTHS.neutral)(),
};

const NOSE = `<path d="M100 114 L93 150 Q100 157 107 150" ${line(2.5)} opacity=".5"/>`;

/** Rostro completo como SVG. `label` es genérico a propósito: no debe revelar la emoción. */
export function faceSvg(spec = {}, { actor = 1, label = 'Rostro' } = {}) {
  const look = lookFor(actor);
  const s = { ...FACE_SPECS.neutro, ...spec };
  return (
    `<svg class="face-svg" viewBox="0 0 200 240" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="M24 130 Q18 30 100 18 Q182 30 176 130 Z" fill="${look.hair}"/>` +
    `<rect x="82" y="196" width="36" height="44" rx="10" fill="${look.skin}"/>` +
    `<rect x="82" y="196" width="36" height="44" rx="10" fill="#000" opacity=".12"/>` +
    `<ellipse cx="30" cy="125" rx="8" ry="14" fill="${look.skin}"/><ellipse cx="170" cy="125" rx="8" ry="14" fill="${look.skin}"/>` +
    `<ellipse cx="100" cy="120" rx="70" ry="88" fill="${look.skin}"/>` +
    `<path d="M33 104 Q28 38 100 34 Q172 38 167 104 Q150 58 100 56 Q50 58 33 104Z" fill="${look.hair}"/>` +
    NOSE +
    REGIONS.map((r) => FRAGMENTS[r](s[r], look)).join('') +
    `</svg>`
  );
}

/** Miniatura de un único rasgo (para las piezas arrastrables de la Actividad 1). */
const PREVIEW_BOX = { brows: [28, 62, 144, 42], eyes: [38, 88, 124, 44], mouth: [56, 142, 88, 62] };

export function featurePreview(region, variant, actor = 1) {
  const look = lookFor(actor);
  const [x, y, w, hgt] = PREVIEW_BOX[region];
  return (
    `<svg class="piece-svg" viewBox="${x} ${y} ${w} ${hgt}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">` +
    `<rect x="${x}" y="${y}" width="${w}" height="${hgt}" fill="${look.skin}"/>` +
    FRAGMENTS[region](variant, look) +
    `</svg>`
  );
}

/**
 * Único punto de entrada para imágenes de estímulo.
 * @param {string} kind  clave de FACE_SPECS (= prefijo del archivo real: `ira`, `neutro`, `sonrisa-falsa`…)
 * @param {number} actor 1-12; define tono/pelo en SVG y el sufijo del archivo real (`ira_03.jpg`)
 */
export function stimulus(kind, actor = 1, { label = 'Rostro' } = {}) {
  if (CONFIG.useRealAssets) {
    return `<img class="face-img" src="${CONFIG.assetsDir}/${kind}_${pad(actor)}.jpg" alt="${label}" draggable="false">`;
  }
  return faceSvg(FACE_SPECS[kind], { actor, label });
}

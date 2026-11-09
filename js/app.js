/**
 * Punto de entrada: navegación por semanas, marcador global y montaje de actividades.
 * La lógica de cada actividad vive en js/activities/*; aquí solo se orquesta.
 */
import { subscribe } from './state.js';
import * as a1 from './activities/a1-rompecabezas.js';
import * as a2 from './activities/a2-encuentra-cambio.js';
import * as a3 from './activities/a3-infiltrado.js';
import * as a4 from './activities/a4-infiltrado-2.js';
import * as a5 from './activities/a5-mentira.js';
import * as a6 from './activities/a6-similitudes.js';
import * as a7 from './activities/a7-que-pasara.js';
import * as a8 from './activities/a8-doblaje.js';

const WEEKS = { 1: [a1, a2], 2: [a3, a4], 3: [a5, a6], 4: [a7, a8] };
const DEFAULT_WEEK = 1;

const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];
const scoreValue = document.getElementById('score-value');
const scoreMax = document.getElementById('score-max');
const scoreBox = document.getElementById('score-box');

/* ---------- Montaje de actividades ---------- */
const instances = new Map(); // semana → [shell, shell]

for (const [week, modules] of Object.entries(WEEKS)) {
  instances.set(
    Number(week),
    modules.map((mod) => {
      const mountPoint = document.querySelector(`[data-activity="${mod.id}"] [data-mount]`);
      return mod.mount(mountPoint);
    }),
  );
}

/* ---------- Marcador global ---------- */
let lastTotal = 0;
subscribe(({ total, max }) => {
  scoreValue.textContent = total;
  scoreMax.textContent = max;
  if (total > lastTotal) {
    scoreBox.classList.remove('is-bumped');
    void scoreBox.offsetWidth;
    scoreBox.classList.add('is-bumped');
  }
  lastTotal = total;
});

/* ---------- Navegación ---------- */
let currentWeek = null;
const suspendWeek = (week) => instances.get(week)?.forEach((shell) => shell.suspend());

function showWeek(week, { moveFocus = false } = {}) {
  if (!WEEKS[week]) week = DEFAULT_WEEK;
  if (week !== currentWeek) suspendWeek(currentWeek); // cancela timers de la semana que se abandona
  currentWeek = week;

  tabs.forEach((tab) => {
    const selected = Number(tab.dataset.week) === week;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && moveFocus) tab.focus();
  });
  panels.forEach((panel) => (panel.hidden = Number(panel.dataset.week) !== week));
  history.replaceState(null, '', `#semana-${week}`); // sin saltos de scroll ni historial extra
}

const weekFromHash = () => Number(location.hash.match(/^#semana-(\d)$/)?.[1]) || DEFAULT_WEEK;

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    showWeek(Number(tab.dataset.week));
    window.scrollTo({ top: 0 });
  });
  // Navegación por flechas (patrón ARIA tabs)
  tab.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length];
    showWeek(Number(next.dataset.week), { moveFocus: true });
  });
});

window.addEventListener('hashchange', () => showWeek(weekFromHash()));

// Una pestaña oculta pausa rAF pero no los relojes: se cancela para no falsear tiempos de reacción.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) suspendWeek(currentWeek);
});

showWeek(weekFromHash());

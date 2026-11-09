/**
 * Componentes reutilizables entre actividades:
 *  - createVideoSim: reproductor de vídeo simulado (sustituible por <video> real)
 *  - createFaceGrid: rejilla de rostros con capa "base" y capa "cambio" (Actividades 3 y 4)
 *  - createCountdownBar: barra de progreso regresiva (Actividad 6)
 *  - createDialog: modal neumorfista sobre <dialog> nativo (Actividad 4)
 */
import { EMOTIONS } from './data.js';
import { stimulus } from './faces.js';
import { button, formatTime, h } from './ui.js';

/**
 * Reproductor simulado. Para usar vídeo real: sustituir `.video-sim__screen` por un
 * <video src="assets/<asset>"> y leer `currentTime` en lugar del bucle rAF de `run`.
 * @param {string} asset nombre del archivo real que lo sustituirá (se anota en data-asset)
 */
export function createVideoSim({ asset, badge = '' } = {}) {
  const face = h('div', { class: 'video-sim__face' });
  const status = h('span', { class: 'video-sim__status' }, 'Listo');
  const time = h('span', { class: 'video-sim__time' }, formatTime(0));
  const fill = h('div', { class: 'neu-progress__fill' });
  const el = h(
    'figure',
    { class: 'video-sim', 'data-asset': asset, 'aria-label': 'Reproductor de vídeo simulado' },
    h('div', { class: 'video-sim__screen' }, face, badge && h('span', { class: 'video-sim__badge' }, badge), status),
    h('div', { class: 'video-sim__bar' }, h('div', { class: 'neu-progress' }, fill), time),
  );

  let shownKey = null;
  const sim = {
    el,
    showFace(kind, actor) {
      const key = `${kind}:${actor}`;
      if (key === shownKey) return;
      shownKey = key;
      face.innerHTML = stimulus(kind, actor);
    },
    setStatus: (text) => (status.textContent = text),
    setProgress(ratio, totalMs) {
      fill.style.width = `${ratio * 100}%`;
      time.textContent = `${formatTime(ratio * totalMs)} / ${formatTime(totalMs)}`;
    },
    /**
     * Reproduce una línea de tiempo con requestAnimationFrame.
     * @returns {{stop: () => void, elapsed: () => number}}
     */
    run(durationMs, { onFrame, onEnd } = {}) {
      const t0 = performance.now();
      let raf = 0;
      const elapsed = () => performance.now() - t0;
      const tick = () => {
        const t = elapsed();
        if (t >= durationMs) {
          sim.setProgress(1, durationMs);
          onFrame?.(durationMs);
          onEnd?.();
          return;
        }
        sim.setProgress(t / durationMs, durationMs);
        onFrame?.(t);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return { stop: () => cancelAnimationFrame(raf), elapsed };
    },
  };
  return sim;
}

/**
 * Rejilla de rostros. Cada tarjeta tiene dos capas (neutra / cambio): el "cambio" se activa
 * añadiendo la clase `is-flashing`, sin recrear el DOM, para que los 200 ms sean exactos.
 * Los rostros usan etiquetas genéricas para no desvelar la emoción a lectores de pantalla.
 */
export function createFaceGrid(actors, { columnsClass = 'grid-cols-3' } = {}) {
  let locked = true;
  let selectHandler = () => {};

  const cards = actors.map((actor, index) =>
    h(
      'button',
      {
        type: 'button',
        class: 'face-card neu-btn',
        'aria-label': `Rostro ${index + 1}`,
        onClick: () => !locked && selectHandler(index),
      },
      h('span', { class: 'face-layer layer-base', html: stimulus('neutro', actor) }),
      h('span', { class: 'face-layer layer-alt', html: stimulus('neutro', actor) }),
      h('span', { class: 'face-caption' }),
    ),
  );
  const el = h('div', { class: `face-grid grid gap-4 ${columnsClass}` }, ...cards);

  return {
    el,
    onSelect: (fn) => (selectHandler = fn),
    setLocked(value) {
      locked = value;
      el.classList.toggle('is-locked', value);
    },
    /** Prepara la capa "cambio" de una tarjeta con la emoción indicada. */
    setChange(index, kind) {
      cards[index].querySelector('.layer-alt').innerHTML = stimulus(kind, actors[index]);
    },
    flash: (index, on) => cards[index].classList.toggle('is-flashing', on),
    /** Muestra permanentemente la emoción de una tarjeta con su etiqueta. */
    reveal(index, kind) {
      cards[index].classList.add('is-flashing', 'is-revealed');
      cards[index].querySelector('.face-caption').textContent = EMOTIONS[kind].label;
    },
    mark: (index, tone) => cards[index].classList.add(tone === 'ok' ? 'is-correct' : 'is-wrong'),
  };
}

/** Barra regresiva basada en transición CSS. `start` devuelve la función que la congela. */
export function createCountdownBar() {
  const fill = h('div', { class: 'neu-progress__fill neu-progress__fill--timer' });
  const el = h('div', { class: 'neu-progress', 'aria-hidden': 'true' }, fill);
  return {
    el,
    start(ms) {
      fill.style.transition = 'none';
      fill.style.width = '100%';
      void fill.offsetWidth; // fuerza reflow para reiniciar la transición
      fill.style.transition = `width ${ms}ms linear`;
      fill.style.width = '0%';
    },
    freeze() {
      fill.style.width = getComputedStyle(fill).width;
      fill.style.transition = 'none';
    },
  };
}

/**
 * Modal neumorfista sobre <dialog>. Se cierra solo con Confirmar (Esc bloqueado
 * para que la respuesta no pueda eludirse).
 */
export function createDialog({ title, description, body, confirmLabel = 'Confirmar', onConfirm }) {
  const confirmBtn = button(confirmLabel, {
    variant: 'primary',
    onClick: () => {
      onConfirm();
      close();
    },
  });
  const dialog = h(
    'dialog',
    { class: 'neu-dialog', 'aria-labelledby': 'dialog-title' },
    h('h4', { id: 'dialog-title', class: 'dialog__title' }, title),
    description && h('p', { class: 'dialog__text' }, description),
    body,
    h('div', { class: 'activity-actions' }, confirmBtn),
  );
  dialog.addEventListener('cancel', (e) => e.preventDefault());
  dialog.addEventListener('close', () => dialog.remove());

  function close() {
    if (dialog.open) dialog.close();
  }
  document.body.append(dialog);
  dialog.showModal();
  return { el: dialog, close, setConfirmEnabled: (v) => (confirmBtn.disabled = !v) };
}

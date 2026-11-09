/**
 * Shell común de actividad: instrucciones, barra de ronda/aciertos, escenario,
 * feedback accesible, acciones, resumen final y gestión de temporizadores.
 *
 * Cada actividad solo define qué pasa en una ronda: `shell.onRound(i => …)`.
 * El shell se encarga de avanzar, puntuar, cancelar timers y reiniciar.
 */
import { addScore, getScore, registerActivity, resetScore, subscribe } from './state.js';
import { button, h } from './ui.js';

export function createShell(root, { id, rounds, maxScore, instructions, noun = 'Ronda' }) {
  registerActivity(id, maxScore);

  let round = 0;
  let settled = false; // la ronda actual ya se ha resuelto (evita re-puntuar al suspender)
  let finished = false;
  let roundHandler = () => {};
  const disposers = new Set();

  const roundLabel = h('span');
  const scoreLabel = h('span');
  const stage = h('div', { class: 'activity-stage' });
  const feedback = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
  const actions = h('div', { class: 'activity-actions' });
  const summary = h('div', { class: 'activity-summary neu-inset', hidden: true });

  root.replaceChildren(
    h('p', { class: 'activity-instructions', html: instructions }),
    h('div', { class: 'round-bar' }, roundLabel, scoreLabel),
    stage,
    feedback,
    actions,
    summary,
  );

  const refreshBar = () => {
    roundLabel.textContent = `${noun} ${Math.min(round + 1, rounds)} de ${rounds}`;
    scoreLabel.textContent = `Aciertos: ${getScore(id)} / ${maxScore}`;
  };
  subscribe(refreshBar);

  /* ---- Timers cancelables ---- */
  const track = (cancel) => {
    disposers.add(cancel);
    return cancel;
  };
  const after = (ms, fn) => {
    const timer = setTimeout(() => {
      disposers.delete(cancel);
      fn();
    }, ms);
    const cancel = () => clearTimeout(timer);
    return track(cancel);
  };
  const clearTimers = () => {
    disposers.forEach((cancel) => cancel());
    disposers.clear();
  };

  /* ---- Feedback y acciones ---- */
  const say = (content = '', tone = 'info') => {
    feedback.className = `feedback feedback--${tone}`;
    feedback.replaceChildren(content);
  };
  const setActions = (list = []) => {
    const buttons = list.map(({ label, onClick, variant = '', ...attrs }) =>
      button(label, { onClick, variant, ...attrs }),
    );
    actions.replaceChildren(...buttons);
    return buttons;
  };

  /* ---- Ciclo de vida ---- */
  const begin = () => {
    settled = false;
    finished = false;
    summary.hidden = true;
    stage.hidden = false;
    say();
    setActions();
    refreshBar();
    roundHandler(round);
  };

  const finish = () => {
    finished = true;
    clearTimers();
    stage.replaceChildren();
    stage.hidden = true;
    say();
    setActions();
    const score = getScore(id);
    const pct = Math.round((score / maxScore) * 100);
    summary.replaceChildren(
      h('p', { class: 'summary__title' }, 'Actividad completada'),
      h('p', { class: 'summary__figure' }, `${score} / ${maxScore}`),
      h('p', { class: 'summary__note' }, `${pct}% de aciertos. Puedes repetir la actividad para entrenar de nuevo.`),
      button('Repetir actividad', { variant: 'primary', onClick: api.start }),
    );
    summary.hidden = false;
    refreshBar();
  };

  const api = {
    stage,
    after,
    track,
    say,
    setActions,
    onRound: (fn) => (roundHandler = fn),
    /** Marca la ronda como resuelta; a partir de aquí suspender no la reabre. */
    settle: () => (settled = true),
    award: (points = 1) => addScore(id, points),
    start: () => {
      clearTimers();
      round = 0;
      resetScore(id);
      begin();
    },
    next: () => {
      clearTimers();
      round += 1;
      if (round >= rounds) finish();
      else begin();
    },
    /** Acción estándar «Continuar / Ver resultados». */
    nextAction: () => ({
      label: round + 1 >= rounds ? 'Ver resultados' : 'Continuar',
      variant: 'primary',
      onClick: api.next,
    }),
    /** Se llama al salir de la semana o ocultar la pestaña: cancela y vuelve al estado "listo". */
    suspend: () => {
      clearTimers();
      if (settled || finished) return;
      say();
      setActions();
      roundHandler(round);
    },
  };
  return api;
}

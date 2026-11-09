/**
 * Actividad 5 · ¿Me estás mintiendo? (Semana 3).
 * Dos tarjetas (A y B) del mismo rostro: una con sonrisa genuina (de Duchenne) y otra
 * con sonrisa social. La tarjeta elegida queda «hundida» (estado inset) hasta confirmar.
 *
 * Assets reales (cuando existan): sonrisa-genuina_01…_12.jpg y sonrisa-falsa_01…_12.jpg
 *   (el mismo nº de actor en ambas para comparar a la misma persona).
 */
import { createShell } from '../shell.js';
import { ACTORS, stimulus } from '../faces.js';
import { h, sample, shuffle } from '../ui.js';

export const id = 'a5';
const ROUNDS = 4;
const SIDES = ['A', 'B'];

export function mount(root) {
  const shell = createShell(root, {
    id,
    rounds: ROUNDS,
    maxScore: ROUNDS,
    noun: 'Par',
    instructions:
      'Cada par muestra a la misma persona sonriendo. En una de las tarjetas la sonrisa es <strong>genuina</strong> y en la otra es <strong>social</strong>. ' +
      'Selecciona la genuina y pulsa <strong>Confirmar</strong>.',
  });

  let actors = [];

  shell.onRound((i) => {
    if (i === 0) actors = sample(ACTORS, ROUNDS);
    renderRound(actors[i]);
  });

  function renderRound(actor) {
    const genuineSide = shuffle(SIDES)[0];
    let selected = null;

    const cards = SIDES.map((side) => {
      const kind = side === genuineSide ? 'sonrisa-genuina' : 'sonrisa-falsa';
      return h(
        'button',
        { type: 'button', role: 'radio', 'aria-checked': 'false', class: 'smile-card neu-btn', dataset: { side } },
        h('span', { class: 'smile-card__img', html: stimulus(kind, actor, { label: `Tarjeta ${side}` }) }),
        h('span', { class: 'smile-card__label' }, `Tarjeta ${side}`),
      );
    });

    const choose = (card) => {
      selected = card.dataset.side;
      cards.forEach((c) => c.setAttribute('aria-checked', String(c === card)));
      confirm.disabled = false;
    };
    cards.forEach((card) => card.addEventListener('click', () => choose(card)));

    const [confirm] = shell.setActions([
      { label: 'Confirmar elección', variant: 'primary', disabled: true, onClick: () => resolve() },
    ]);

    shell.stage.replaceChildren(h('div', { class: 'smile-pair', role: 'radiogroup', 'aria-label': '¿Qué sonrisa es genuina?' }, ...cards));
    shell.say('Elige la tarjeta con la sonrisa genuina.');

    function resolve() {
      shell.settle();
      cards.forEach((c) => {
        c.disabled = true;
        const isGenuine = c.dataset.side === genuineSide;
        if (isGenuine) c.classList.add('is-correct');
        else if (c.dataset.side === selected) c.classList.add('is-wrong');
      });
      const ok = selected === genuineSide;
      if (ok) shell.award();
      shell.say(
        `${ok ? 'Correcto' : 'Incorrecto'}: la sonrisa genuina era la tarjeta ${genuineSide}. ` +
          'En la sonrisa de Duchenne participa el orbicular de los ojos (AU6) junto al cigomático mayor (AU12): ' +
          'mejillas elevadas y «patas de gallo». Es un indicador orientativo, no una prueba concluyente de sinceridad.',
        ok ? 'ok' : 'err',
      );
      shell.setActions([shell.nextAction()]);
    }
  }

  shell.start();
  return shell;
}

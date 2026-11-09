/**
 * Actividad 6 · Diferenciar similitudes (Semana 3).
 * Flashcard: la imagen aparece 500 ms y desaparece; después se muestran dos botones
 * (p. ej. «Sorpresa» vs «Miedo») y una barra regresiva de 3 s actúa como temporizador.
 *
 * Assets reales (cuando existan): sorpresa_NN.jpg, miedo_NN.jpg, ira_NN.jpg, asco_NN.jpg
 */
import { createShell } from '../shell.js';
import { createCountdownBar } from '../components.js';
import { CONFIG } from '../config.js';
import { SIMILAR_PAIRS, emotionLabel } from '../data.js';
import { ACTORS, stimulus } from '../faces.js';
import { button, h, sample, shuffle } from '../ui.js';

export const id = 'a6';
const { flashcardExposureMs: EXPOSURE_MS, flashcardAnswerMs: ANSWER_MS } = CONFIG.timing;

export function mount(root) {
  const shell = createShell(root, {
    id,
    rounds: SIMILAR_PAIRS.length,
    maxScore: SIMILAR_PAIRS.length,
    noun: 'Tarjeta',
    instructions:
      'La imagen se mostrará solo <strong>medio segundo</strong>. Después tendrás <strong>3 segundos</strong> para elegir qué emoción viste ' +
      'entre dos opciones muy parecidas.',
  });

  let rounds = [];

  shell.onRound((i) => {
    if (i === 0) {
      const actors = sample(ACTORS, SIMILAR_PAIRS.length);
      rounds = SIMILAR_PAIRS.map((r, n) => ({ ...r, actor: actors[n] }));
    }
    renderReady(rounds[i]);
  });

  function renderReady({ truth, pair, actor }) {
    const card = h('div', { class: 'flashcard neu-raised' }, h('span', { class: 'flashcard__mask' }, '?'));
    const countdown = createCountdownBar();
    const choices = h('div', { class: 'choice-row', hidden: true });
    shell.stage.replaceChildren(h('div', { class: 'flashcard-wrap' }, card, countdown.el, choices));
    shell.say('Pulsa «Mostrar tarjeta» y fija la vista en el recuadro.');
    shell.setActions([{ label: 'Mostrar tarjeta', variant: 'primary', onClick: () => expose() }]);

    function expose() {
      shell.setActions();
      shell.say('');
      card.innerHTML = stimulus(truth, actor);
      shell.after(EXPOSURE_MS, () => {
        card.replaceChildren(h('span', { class: 'flashcard__mask' }, '?'));
        showChoices();
      });
    }

    function showChoices() {
      const buttons = shuffle(pair).map((key) =>
        button(emotionLabel(key), { variant: 'xl', dataset: { key }, onClick: () => answer(key, buttons) }),
      );
      choices.replaceChildren(...buttons);
      choices.hidden = false;
      shell.say('¿Qué emoción viste?');
      countdown.start(ANSWER_MS);
      shell.after(ANSWER_MS, () => answer(null, buttons));
    }

    let answered = false; // el temporizador de 3 s sigue vivo si se responde antes: se ignora su disparo tardío

    function answer(key, buttons) {
      if (answered) return;
      answered = true;
      countdown.freeze();
      shell.settle();
      buttons.forEach((b) => {
        b.disabled = true;
        if (b.dataset.key === truth) b.classList.add('is-correct');
        else if (b.dataset.key === key) b.classList.add('is-wrong');
      });
      card.innerHTML = stimulus(truth, actor); // revela la imagen para aprender del rasgo
      if (key === truth) {
        shell.award();
        shell.say(`¡Correcto! Era ${emotionLabel(truth)}.`, 'ok');
      } else {
        shell.say(key ? `No: era ${emotionLabel(truth)}.` : `Tiempo agotado: era ${emotionLabel(truth)}.`, 'err');
      }
      shell.setActions([shell.nextAction()]);
    }
  }

  shell.start();
  return shell;
}

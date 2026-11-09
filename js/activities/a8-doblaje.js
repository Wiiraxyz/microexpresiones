/**
 * Actividad 8 · Actor de doblaje (Semana 4).
 * Imagen de contexto + <textarea> hundido: el usuario escribe qué piensa el personaje.
 * Al «Evaluar», el campo se bloquea, se despliegan 3 respuestas de referencia y el usuario
 * se autoevalúa («Fui acertado» / «Me desvié»). Ambas opciones puntúan (ver CONFIG.points):
 * se premia la honestidad al valorar el propio desempeño, no solo el "acierto".
 *
 * Assets reales (cuando existan): contexto_doblaje_01.jpg … contexto_doblaje_04.jpg
 *   (nombres exactos en DUBBING_SCENES[].image, js/data.js)
 */
import { createShell } from '../shell.js';
import { CONFIG } from '../config.js';
import { DUBBING_SCENES, emotionLabel } from '../data.js';
import { ACTORS, stimulus } from '../faces.js';
import { button, h, sample, shuffle } from '../ui.js';

export const id = 'a8';
const { selfEvalCorrect: POINTS_OK, selfEvalDeviated: POINTS_DEVIATED } = CONFIG.points;
const MIN_CHARS = CONFIG.minDubbingChars;

export function mount(root) {
  const shell = createShell(root, {
    id,
    rounds: DUBBING_SCENES.length,
    maxScore: DUBBING_SCENES.length * POINTS_OK,
    noun: 'Situación',
    instructions:
      'Observa la situación y escribe, en primera persona, <strong>lo que piensa y siente el personaje</strong> y por qué. ' +
      'Describe su estado mental <em>sin implicarte emocionalmente</em> (empatía cognitiva). Después compara con las respuestas de referencia ' +
      'y valora con honestidad tu respuesta: ambas opciones suman puntos.',
  });

  let scenes = [];

  shell.onRound((i) => {
    if (i === 0) {
      const actors = sample(ACTORS, DUBBING_SCENES.length);
      scenes = shuffle(DUBBING_SCENES).map((s, n) => ({ ...s, actor: actors[n] }));
    }
    renderRound(scenes[i]);
  });

  function renderRound(scene) {
    const context = h(
      'figure',
      { class: 'dubbing-context neu-inset', 'data-asset': scene.image },
      h('div', { class: 'dubbing-context__face', html: stimulus(scene.emotion, scene.actor) }),
      h('figcaption', {}, scene.context),
    );

    const textarea = h('textarea', {
      class: 'neu-field neu-field--area',
      rows: 4,
      id: 'a8-text',
      placeholder: 'Ej.: «Está pensando que… porque… y probablemente…»',
      'aria-describedby': 'a8-count',
    });
    const counter = h('span', { id: 'a8-count', class: 'field__count' }, `0 / ${MIN_CHARS} caracteres mínimos`);
    const references = h('div', { class: 'references', hidden: true });
    const selfEval = h('div', { class: 'choice-row', hidden: true });

    shell.stage.replaceChildren(
      context,
      h('label', { class: 'field__label', for: 'a8-text' }, '¿Qué piensa el personaje?'),
      textarea,
      counter,
      references,
      selfEval,
    );
    shell.say('');

    const [evaluate] = shell.setActions([
      { label: 'Evaluar', variant: 'primary', disabled: true, onClick: () => reveal() },
    ]);

    textarea.addEventListener('input', () => {
      const n = textarea.value.trim().length;
      counter.textContent = `${n} / ${MIN_CHARS} caracteres mínimos`;
      evaluate.disabled = n < MIN_CHARS;
    });

    function reveal() {
      textarea.disabled = true; // bloqueo: ya no se puede retocar tras ver la referencia
      textarea.classList.add('is-locked');
      evaluate.remove();
      references.replaceChildren(
        h('p', { class: 'references__title' }, `Respuestas de referencia · Emoción: ${emotionLabel(scene.emotion)}`),
        ...scene.references.map(([tag, text]) =>
          h('div', { class: 'reference neu-raised-sm' }, h('span', { class: 'reference__tag' }, tag), h('p', {}, text)),
        ),
      );
      references.hidden = false;
      selfEval.replaceChildren(
        button('Fui acertado', { variant: 'xl', onClick: () => resolve(true) }),
        button('Me desvié', { variant: 'xl', onClick: () => resolve(false) }),
      );
      selfEval.hidden = false;
      shell.say('Compara tu texto con las tres referencias y valora con honestidad: ¿identificaste la emoción, su causa y la conducta probable?');
    }

    function resolve(accurate) {
      shell.settle();
      selfEval.querySelectorAll('button').forEach((b) => (b.disabled = true));
      const points = accurate ? POINTS_OK : POINTS_DEVIATED;
      shell.award(points);
      shell.say(
        accurate
          ? `Autoevaluación registrada: +${points} puntos.`
          : `Autoevaluación registrada: +${points} punto. Reconocer una desviación es parte del aprendizaje.`,
        'ok',
      );
      shell.setActions([shell.nextAction()]);
    }
  }

  shell.start();
  return shell;
}

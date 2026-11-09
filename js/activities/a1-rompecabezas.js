/**
 * Actividad 1 · Rompecabezas facial (Semana 1).
 * El usuario arrastra cejas, ojos y boca sobre una cara neutra para construir cada
 * una de las 6 emociones básicas. Se puntúa el acierto a la primera, sin pista.
 *
 * Asset real (opcional): las piezas son SVG generados; no requieren archivos.
 */
import { createShell } from '../shell.js';
import { enableDragDrop } from '../dragdrop.js';
import { EMOTIONS, EMOTION_KEYS, PIECES, REGION_LABELS } from '../data.js';
import { FACE_SPECS, REGIONS, faceSvg, featurePreview } from '../faces.js';
import { h, shuffle } from '../ui.js';

export const id = 'a1';
const ACTOR = 4;

export function mount(root) {
  const shell = createShell(root, {
    id,
    rounds: EMOTION_KEYS.length,
    maxScore: EMOTION_KEYS.length,
    noun: 'Emoción',
    instructions:
      'Arrastra las piezas (cejas, ojos y boca) hasta la cara para formar la emoción indicada y pulsa <strong>Comprobar</strong>. ' +
      'También puedes pulsar una pieza para colocarla. Cuenta como acierto la emoción resuelta <em>a la primera y sin pista</em>.',
  });

  let order = shuffle(EMOTION_KEYS);
  let face; // selección actual por región
  let attempts;
  let hintUsed;
  let faceHost;
  let zones;

  shell.onRound((i) => {
    if (i === 0) order = shuffle(EMOTION_KEYS);
    renderRound(order[i]);
  });

  function renderRound(target) {
    face = { ...FACE_SPECS.neutro };
    attempts = 0;
    hintUsed = false;

    faceHost = h('div', { class: 'face-stage__render' });
    zones = Object.fromEntries(
      REGIONS.map((region) => [
        region,
        h('div', { class: `drop-zone drop-zone--${region}`, dataset: { region }, 'aria-label': `Zona de ${REGION_LABELS[region].toLowerCase()}` }),
      ]),
    );
    const stage = h('div', { class: 'face-stage neu-inset' }, faceHost, ...Object.values(zones));

    const palette = h(
      'div',
      { class: 'palette' },
      ...REGIONS.map((region) =>
        h(
          'fieldset',
          { class: 'palette__group' },
          h('legend', {}, REGION_LABELS[region]),
          h(
            'div',
            { class: 'palette__pieces' },
            ...PIECES[region].map(([variant, label]) =>
              h(
                'button',
                { type: 'button', class: 'piece neu-btn', dataset: { region, variant }, 'aria-label': `${REGION_LABELS[region]}: ${label}`, 'aria-pressed': 'false' },
                h('span', { html: featurePreview(region, variant, ACTOR) }),
                h('span', { class: 'piece__label' }, label),
              ),
            ),
          ),
        ),
      ),
    );

    const prompt = h(
      'div',
      { class: 'prompt' },
      h('p', { class: 'prompt__kicker' }, 'Construye la expresión de'),
      h('p', { class: 'prompt__target' }, EMOTIONS[target].label),
      h('p', { class: 'prompt__hint', id: 'a1-hint', hidden: true }),
    );

    const layout = h('div', { class: 'a1-layout' }, stage, h('div', { class: 'a1-side' }, prompt, palette));
    shell.stage.replaceChildren(layout);

    enableDragDrop(layout, {
      itemSelector: '.piece',
      zoneSelector: '.drop-zone',
      onDrop: (piece, zone) => {
        if (zone === false) return; // soltada fuera de la cara
        const region = piece.dataset.region;
        if (zone && zone.dataset.region !== region) {
          zone.classList.add('is-rejected');
          shell.say(`Esa pieza pertenece a «${REGION_LABELS[region].toLowerCase()}», no a esta zona.`, 'warn');
          setTimeout(() => zone.classList.remove('is-rejected'), 400);
          return;
        }
        place(region, piece.dataset.variant);
      },
    });

    draw();
    shell.say('Forma la expresión y pulsa «Comprobar».');
    shell.setActions([
      { label: 'Comprobar', variant: 'primary', onClick: () => check(target) },
      { label: 'Restablecer cara', onClick: reset },
      { label: 'Ver pista', onClick: () => showHint(target) },
    ]);
  }

  /** Repinta la cara y el estado "hundido" de las piezas colocadas. */
  function draw() {
    faceHost.innerHTML = faceSvg(face, { actor: ACTOR, label: 'Rostro en construcción' });
    shell.stage.querySelectorAll('.piece').forEach((piece) => {
      const { region, variant } = piece.dataset;
      piece.setAttribute('aria-pressed', String(face[region] === variant));
    });
    Object.values(zones).forEach((z) => z.classList.remove('is-wrong'));
  }

  function place(region, variant) {
    face[region] = face[region] === variant ? FACE_SPECS.neutro[region] : variant; // pulsar de nuevo la retira
    draw();
  }

  function reset() {
    face = { ...FACE_SPECS.neutro };
    draw();
  }

  function showHint(target) {
    hintUsed = true;
    const hint = shell.stage.querySelector('#a1-hint');
    hint.hidden = false;
    hint.textContent = EMOTIONS[target].cue;
  }

  function check(target) {
    attempts += 1;
    const solution = FACE_SPECS[target];
    const wrong = REGIONS.filter((r) => face[r] !== solution[r]);

    if (wrong.length === 0) {
      const scored = attempts === 1 && !hintUsed;
      if (scored) shell.award();
      shell.settle();
      shell.say(
        scored
          ? `Correcto: ${EMOTIONS[target].label}. Acierto a la primera.`
          : `Correcto: ${EMOTIONS[target].label}. No puntúa porque hubo reintento o pista, pero ya la tienes.`,
        'ok',
      );
      shell.setActions([shell.nextAction()]);
      return;
    }

    wrong.forEach((r) => zones[r].classList.add('is-wrong'));
    const names = wrong.map((r) => REGION_LABELS[r].toLowerCase()).join(', ');
    shell.say(`${REGIONS.length - wrong.length} de ${REGIONS.length} rasgos correctos. Revisa: ${names}.`, 'err');
  }

  shell.start();
  return shell;
}

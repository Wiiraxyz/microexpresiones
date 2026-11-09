/**
 * Actividad 4 · Tenemos un infiltrado 2.0 (Semana 2).
 * Rejilla de 12 rostros. Dos caras distintas cambian 200 ms cada una, en momentos
 * distintos. Al pulsar «Pausar / Detectar» se abre un modal con dos <select> para
 * identificar las dos emociones infiltradas (1 punto por emoción correcta).
 *
 * Assets reales (cuando existan): los mismos que la Actividad 3 (12 actores).
 */
import { createShell } from '../shell.js';
import { createDialog, createFaceGrid } from '../components.js';
import { CONFIG } from '../config.js';
import { EMOTIONS, EMOTION_KEYS, emotionLabel } from '../data.js';
import { ACTORS } from '../faces.js';
import { button, h, randInt, sample, shuffle } from '../ui.js';

export const id = 'a4';
const ROUNDS = 3;
const INFILTRATED = 2;
const { infiltratedFlashMs: FLASH_MS, infiltratedDelayMs: DELAY, secondFlashGapMs: GAP } = CONFIG.timing;

export function mount(root) {
  const shell = createShell(root, {
    id,
    rounds: ROUNDS,
    maxScore: ROUNDS * INFILTRATED,
    instructions:
      'Entre doce rostros neutros se infiltrarán <strong>dos cambios breves</strong>, de dos emociones distintas. ' +
      'Cuando creas haberlos visto, pulsa <strong>«Pausar / Detectar»</strong> e indica qué emociones fueron.',
  });

  shell.onRound(() => renderReady());

  function renderReady() {
    const grid = createFaceGrid(shuffle(ACTORS), { columnsClass: 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6' });
    grid.setLocked(true);
    const faces = sample([...ACTORS.keys()], INFILTRATED);
    const kinds = sample(EMOTION_KEYS, INFILTRATED);
    faces.forEach((face, n) => grid.setChange(face, kinds[n]));

    const detect = button('Pausar / Detectar', { variant: 'xl primary', disabled: true });
    detect.classList.add('detect-btn');
    shell.stage.replaceChildren(grid.el, detect);
    shell.say('Pulsa «Iniciar observación» cuando estés listo.');
    shell.setActions([{ label: 'Iniciar observación', variant: 'primary', onClick: () => run(grid, detect, faces, kinds) }]);
  }

  function run(grid, detect, faces, kinds) {
    let sequenceDone = false;
    shell.setActions();
    shell.say('Observando… Pulsa «Pausar / Detectar» cuando hayas visto ambos cambios.');
    detect.disabled = false;
    detect.focus();

    const flashAt = (n, then) => {
      grid.flash(faces[n], true);
      shell.after(FLASH_MS, () => {
        grid.flash(faces[n], false);
        then();
      });
    };
    shell.after(randInt(DELAY.min, DELAY.max), () =>
      flashAt(0, () =>
        shell.after(randInt(GAP.min, GAP.max), () =>
          flashAt(1, () => {
            sequenceDone = true;
            shell.say('Secuencia finalizada. Pulsa «Pausar / Detectar» para responder.');
          }),
        ),
      ),
    );

    detect.onclick = () => {
      if (!sequenceDone) {
        shell.say('Aún no se han producido los dos cambios: sigue observando.', 'warn');
        return;
      }
      detect.disabled = true;
      askEmotions(grid, faces, kinds);
    };
  }

  /** Modal con dos <select>; al confirmar evalúa sin importar el orden. */
  function askEmotions(grid, faces, kinds) {
    const makeSelect = (n) =>
      h(
        'label',
        { class: 'dialog__field' },
        h('span', {}, `Emoción infiltrada ${n}`),
        h(
          'select',
          { class: 'neu-field' },
          h('option', { value: '' }, 'Selecciona…'),
          ...EMOTION_KEYS.map((key) => h('option', { value: key }, EMOTIONS[key].label)),
        ),
      );
    const fields = [makeSelect(1), makeSelect(2)];
    const selects = fields.map((f) => f.querySelector('select'));

    const dialog = createDialog({
      title: '¿Qué emociones se infiltraron?',
      description: 'Elige las dos emociones que viste, en cualquier orden.',
      body: h('div', { class: 'dialog__fields' }, ...fields),
      confirmLabel: 'Confirmar respuesta',
      onConfirm: () => evaluate(grid, faces, kinds, selects.map((s) => s.value)),
    });
    dialog.setConfirmEnabled(false);
    shell.track(dialog.close);
    selects.forEach((s) => s.addEventListener('change', () => dialog.setConfirmEnabled(selects.every((x) => x.value))));
    selects[0].focus();
  }

  function evaluate(grid, faces, kinds, chosen) {
    const remaining = [...kinds];
    let hits = 0;
    chosen.forEach((pick) => {
      const at = remaining.indexOf(pick);
      if (at >= 0) {
        hits += 1;
        remaining.splice(at, 1);
      }
    });
    if (hits) shell.award(hits);
    shell.settle();
    faces.forEach((face, n) => {
      grid.reveal(face, kinds[n]);
      grid.mark(face, 'ok');
    });
    const names = kinds.map(emotionLabel).join(' y ');
    shell.say(
      hits === INFILTRATED
        ? `¡Perfecto! Las emociones eran ${names}.`
        : `${hits} de ${INFILTRATED} correctas. Las emociones infiltradas eran ${names}.`,
      hits === INFILTRATED ? 'ok' : 'err',
    );
    shell.setActions([shell.nextAction()]);
  }

  shell.start();
  return shell;
}

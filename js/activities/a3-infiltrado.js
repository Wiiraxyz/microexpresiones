/**
 * Actividad 3 · Tenemos un infiltrado (Semana 2).
 * Rejilla de 6 rostros neutros. Mediante setTimeout, uno cambia 200 ms a una emoción
 * y vuelve a neutro. Después el usuario debe hacer clic en la cara que cambió.
 *
 * Assets reales (cuando existan): neutro_01…neutro_12.jpg y <emocion>_01…_12.jpg
 *   (alegria, tristeza, ira, miedo, sorpresa, asco). El nº de actor une neutro y emoción.
 */
import { createShell } from '../shell.js';
import { createFaceGrid } from '../components.js';
import { CONFIG } from '../config.js';
import { EMOTION_KEYS, emotionLabel } from '../data.js';
import { ACTORS } from '../faces.js';
import { randInt, sample, shuffle } from '../ui.js';

export const id = 'a3';
const ROUNDS = 5;
const FACES = 6;
const { infiltratedFlashMs: FLASH_MS, infiltratedDelayMs: DELAY } = CONFIG.timing;

export function mount(root) {
  const shell = createShell(root, {
    id,
    rounds: ROUNDS,
    maxScore: ROUNDS,
    instructions:
      'Observa la rejilla de rostros neutros. Uno de ellos <strong>cambiará durante una fracción de segundo</strong>. ' +
      'Cuando vuelva la calma, haz clic en la cara que cambió.',
  });

  let emotions = [];

  shell.onRound((i) => {
    if (i === 0) emotions = shuffle(EMOTION_KEYS).slice(0, ROUNDS);
    renderReady(emotions[i]);
  });

  function renderReady(kind) {
    const target = randInt(0, FACES - 1);
    const grid = createFaceGrid(sample(ACTORS, FACES), { columnsClass: 'grid-cols-2 sm:grid-cols-3' });
    grid.setChange(target, kind);
    grid.setLocked(true);
    shell.stage.replaceChildren(grid.el);
    shell.say('Pulsa «Comenzar ronda» y mantén la vista en la rejilla.');
    shell.setActions([{ label: 'Comenzar ronda', variant: 'primary', onClick: () => run(grid, target, kind) }]);
  }

  function run(grid, target, kind) {
    shell.setActions();
    shell.say('Observa…');
    shell.after(randInt(DELAY.min, DELAY.max), () => {
      grid.flash(target, true);
      shell.after(FLASH_MS, () => {
        grid.flash(target, false);
        grid.setLocked(false);
        shell.say('¿Qué cara cambió? Haz clic en ella.');
      });
    });

    grid.onSelect((picked) => {
      grid.setLocked(true);
      shell.settle();
      grid.reveal(target, kind);
      if (picked === target) {
        grid.mark(target, 'ok');
        shell.award();
        shell.say(`¡Correcto! El cambio era ${emotionLabel(kind)}.`, 'ok');
      } else {
        grid.mark(picked, 'err');
        grid.mark(target, 'ok');
        shell.say(`No era esa. La cara que cambió está marcada: mostró ${emotionLabel(kind)}.`, 'err');
      }
      shell.setActions([shell.nextAction()]);
    });
  }

  shell.start();
  return shell;
}

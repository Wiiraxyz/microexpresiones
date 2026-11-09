/**
 * Actividad 2 · Encuentra el cambio (Slowed) (Semana 1).
 * Vídeo simulado a 0,25×: aparece una microexpresión en un instante aleatorio y el
 * usuario debe pulsar «¡Detectado!» dentro de la ventana válida [inicio, fin + margen].
 *
 * Assets reales (cuando existan): assets/slowed_01.mp4, slowed_02.mp4, slowed_03.mp4
 */
import { createShell } from '../shell.js';
import { createVideoSim } from '../components.js';
import { CONFIG } from '../config.js';
import { EMOTION_KEYS, emotionLabel } from '../data.js';
import { ACTORS } from '../faces.js';
import { button, h, pad, randInt, sample } from '../ui.js';

export const id = 'a2';
const TRIALS = 3;
const T = CONFIG.timing.slowed;

export function mount(root) {
  const shell = createShell(root, {
    id,
    rounds: TRIALS,
    maxScore: TRIALS,
    noun: 'Vídeo',
    instructions:
      'Se reproduce un vídeo <strong>ralentizado (0,25×)</strong> de un rostro neutro. En algún momento aparecerá un cambio muy breve. ' +
      'Pulsa <strong>«¡Detectado!»</strong> mientras lo veas (o inmediatamente después). Pulsar antes de que aparezca cuenta como falsa alarma.',
  });

  let plan = [];

  shell.onRound((i) => {
    if (i === 0) {
      const kinds = sample(EMOTION_KEYS, TRIALS);
      const actors = sample(ACTORS, TRIALS);
      plan = kinds.map((kind, n) => ({ kind, actor: actors[n] }));
    }
    renderReady(i, plan[i]);
  });

  function renderReady(i, { kind, actor }) {
    const sim = createVideoSim({ asset: `slowed_${pad(i + 1)}.mp4`, badge: '0,25×' });
    sim.showFace('neutro', actor);
    sim.setProgress(0, T.durationMs);

    const detect = button('¡Detectado!', { variant: 'xl primary', disabled: true });
    detect.classList.add('detect-btn');
    shell.stage.replaceChildren(sim.el, detect);
    shell.say('Pulsa «Iniciar reproducción» cuando estés listo.');
    shell.setActions([{ label: 'Iniciar reproducción', variant: 'primary', onClick: () => play(sim, detect, kind, actor) }]);
  }

  function play(sim, detect, kind, actor) {
    const start = randInt(T.eventMinStartMs, T.eventMaxStartMs);
    const end = start + T.eventMs;
    let visible = false;
    let finished = false;

    shell.setActions();
    shell.say('Observa con atención…');
    sim.setStatus('Reproduciendo');
    detect.disabled = false;
    detect.focus();

    const run = sim.run(T.durationMs, {
      onFrame: (t) => {
        const show = t >= start && t < end;
        if (show === visible) return;
        visible = show;
        sim.showFace(show ? kind : 'neutro', actor);
      },
      onEnd: () => conclude('miss'),
    });
    shell.track(run.stop);

    detect.onclick = () => conclude('press', run.elapsed());

    function conclude(type, t = 0) {
      if (finished) return;
      finished = true;
      run.stop();
      detect.disabled = true;
      detect.onclick = null;
      sim.setStatus('Detenido');
      sim.showFace(kind, actor);
      shell.settle();

      const where = `El cambio (${emotionLabel(kind)}) apareció a los ${(start / 1000).toFixed(1)} s y duró ${T.eventMs} ms a 0,25× (≈${T.eventMs / 4} ms reales).`;
      if (type === 'press' && t < start) {
        shell.say(`Falsa alarma: pulsaste antes de que apareciera el cambio. ${where}`, 'err');
      } else if (type === 'press' && t <= end + T.graceMs) {
        shell.award();
        shell.say(`¡Detectado! Tiempo de reacción: ${Math.round(t - start)} ms desde el inicio del cambio. ${where}`, 'ok');
      } else if (type === 'press') {
        shell.say(`Demasiado tarde: pulsaste cuando el cambio ya había terminado. ${where}`, 'err');
      } else {
        shell.say(`No detectado: el vídeo terminó sin pulsación. ${where}`, 'err');
      }
      shell.setActions([shell.nextAction()]);
    }
  }

  shell.start();
  return shell;
}

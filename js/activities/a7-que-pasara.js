/**
 * Actividad 7 · ¿Qué pasará? (Semana 4).
 * Simulación de vídeo interactivo: la escena se reproduce y se pausa sobre una expresión.
 * El usuario elige, entre 3 opciones, la conducta futura más probable según la emoción.
 *
 * Assets reales (cuando existan): escena_01_ira.mp4 … escena_05_alegria.mp4
 *   (nombres exactos en FUTURE_SCENES[].video, js/data.js)
 */
import { createShell } from '../shell.js';
import { createVideoSim } from '../components.js';
import { CONFIG } from '../config.js';
import { FUTURE_SCENES, emotionLabel } from '../data.js';
import { ACTORS } from '../faces.js';
import { button, h, sample, shuffle } from '../ui.js';

export const id = 'a7';
const { sceneDurationMs: DURATION, sceneExpressionAt: EXPRESSION_AT } = CONFIG.timing;

export function mount(root) {
  const shell = createShell(root, {
    id,
    rounds: FUTURE_SCENES.length,
    maxScore: FUTURE_SCENES.length,
    noun: 'Escena',
    instructions:
      'Se reproducirá una escena breve que se <strong>pausará sobre la expresión de la persona</strong>. ' +
      'Identifica su emoción y elige qué es <strong>más probable que haga a continuación</strong>.',
  });

  let scenes = [];

  shell.onRound((i) => {
    if (i === 0) {
      const actors = sample(ACTORS, FUTURE_SCENES.length);
      scenes = shuffle(FUTURE_SCENES).map((s, n) => ({ ...s, actor: actors[n] }));
    }
    renderReady(scenes[i]);
  });

  function renderReady(scene) {
    const sim = createVideoSim({ asset: scene.video });
    sim.showFace('neutro', scene.actor);
    sim.setProgress(0, DURATION);
    const choices = h('div', { class: 'choice-list', hidden: true });
    shell.stage.replaceChildren(
      h('p', { class: 'scene-context' }, h('strong', {}, 'Contexto: '), scene.context),
      sim.el,
      choices,
    );
    shell.say('Pulsa «Reproducir escena».');
    shell.setActions([{ label: 'Reproducir escena', variant: 'primary', onClick: play }]);

    function play() {
      shell.setActions();
      shell.say('');
      sim.setStatus('Reproduciendo');
      const run = sim.run(DURATION, {
        onFrame: (t) => sim.showFace(t / DURATION >= EXPRESSION_AT ? scene.emotion : 'neutro', scene.actor),
        onEnd: pause,
      });
      shell.track(run.stop);
    }

    function pause() {
      sim.setStatus('⏸ Pausado');
      const entries = shuffle(scene.options).map((opt, n) => {
        const btn = button(`${String.fromCharCode(65 + n)}. ${opt.text}`, {
          variant: 'choice',
          onClick: () => answer(opt, entries),
        });
        return { opt, btn };
      });
      choices.replaceChildren(...entries.map((e) => e.btn));
      choices.hidden = false;
      shell.say('¿Qué es más probable que ocurra a continuación?');
    }

    function answer(picked, entries) {
      shell.settle();
      entries.forEach(({ opt, btn }) => {
        btn.disabled = true;
        if (opt.correct) btn.classList.add('is-correct');
        else if (opt === picked) btn.classList.add('is-wrong');
      });
      const ok = Boolean(picked.correct);
      if (ok) shell.award();
      shell.say(
        `${ok ? 'Correcto' : 'No era la más probable'}. Emoción mostrada: ${emotionLabel(scene.emotion)}. ${scene.why} ` +
          'Recuerda que es una inferencia probabilística, no una certeza.',
        ok ? 'ok' : 'err',
      );
      shell.setActions([shell.nextAction()]);
    }
  }

  shell.start();
  return shell;
}

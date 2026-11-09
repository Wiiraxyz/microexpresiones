/**
 * Configuración central del programa.
 * Todo lo "ajustable" por el equipo clínico vive aquí (tiempos, puntos, assets),
 * de modo que no haya números mágicos repartidos por las actividades.
 */
export const CONFIG = Object.freeze({
  /**
   * false → los estímulos se dibujan como rostros esquemáticos SVG (placeholders).
   * true  → se cargan fotografías reales desde /assets con la convención de nombres
   *         `<tipo>_<NN>.jpg` (p. ej. `ira_03.jpg`, `neutro_07.jpg`).
   *         Ver assets/README.md para la lista completa.
   */
  useRealAssets: false,
  assetsDir: 'assets',

  timing: Object.freeze({
    /** Actividad 2: reproducción ralentizada (0,25×). Un gesto de 175 ms reales dura 700 ms. */
    slowed: Object.freeze({
      durationMs: 9000,
      eventMinStartMs: 3000,
      eventMaxStartMs: 6200,
      eventMs: 700,
      graceMs: 350, // margen razonable de tiempo de reacción tras desaparecer el gesto
    }),
    /** Actividades 3 y 4: duración del cambio facial ("infiltrado"). */
    infiltratedFlashMs: 200,
    infiltratedDelayMs: Object.freeze({ min: 1200, max: 3200 }),
    /** Actividad 4: separación entre el primer y el segundo cambio. */
    secondFlashGapMs: Object.freeze({ min: 1500, max: 2800 }),
    /** Actividad 6: exposición del estímulo y tiempo de respuesta. */
    flashcardExposureMs: 500,
    flashcardAnswerMs: 3000,
    /** Actividad 7: duración de la escena antes de la pausa y momento de la expresión (0-1). */
    sceneDurationMs: 4000,
    sceneExpressionAt: 0.55,
  }),

  points: Object.freeze({
    /** Actividad 8: la autoevaluación honesta también puntúa para no premiar solo "acertar". */
    selfEvalCorrect: 2,
    selfEvalDeviated: 1,
  }),

  /** Actividad 8: mínimo de caracteres para poder pulsar "Evaluar". */
  minDubbingChars: 20,
});

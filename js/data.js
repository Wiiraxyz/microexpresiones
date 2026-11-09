/**
 * Contenido clínico y textual del programa, separado de la lógica de las actividades.
 * Las descripciones de rasgos se basan en las unidades de acción (AU) del FACS.
 * Los textos son material formativo; revisar con el equipo clínico antes de uso con participantes.
 */

export const EMOTIONS = Object.freeze({
  alegria: {
    label: 'Alegría',
    cue: 'Elevación de las mejillas y contracción del orbicular de los ojos (AU6) con comisuras de la boca elevadas (AU12).',
  },
  tristeza: {
    label: 'Tristeza',
    cue: 'Extremos internos de las cejas elevados (AU1+AU4), párpados caídos y comisuras de la boca descendidas (AU15).',
  },
  ira: {
    label: 'Ira',
    cue: 'Cejas descendidas y juntas (AU4), mirada tensa (AU5/AU7) y labios apretados (AU23/AU24).',
  },
  miedo: {
    label: 'Miedo',
    cue: 'Cejas elevadas y juntas (AU1+2+4), párpado superior elevado (AU5) y labios estirados en horizontal (AU20).',
  },
  sorpresa: {
    label: 'Sorpresa',
    cue: 'Cejas elevadas y curvas (AU1+2), ojos muy abiertos (AU5) y mandíbula caída (AU26).',
  },
  asco: {
    label: 'Asco',
    cue: 'Arrugamiento de la nariz y elevación del labio superior (AU9/AU10), con cejas descendidas y ojos entornados.',
  },
});
export const EMOTION_KEYS = Object.keys(EMOTIONS);
export const emotionLabel = (key) => EMOTIONS[key].label;

/** Actividad 1: piezas disponibles por región (la variante "neutral" es la cara de partida). */
export const REGION_LABELS = { brows: 'Cejas', eyes: 'Ojos', mouth: 'Boca' };
export const PIECES = {
  brows: [
    ['raised', 'Elevadas y curvas'],
    ['lowered', 'Descendidas y juntas'],
    ['sadInner', 'Extremos internos elevados'],
    ['fearRaised', 'Elevadas y juntas'],
  ],
  eyes: [
    ['wide', 'Muy abiertos'],
    ['narrow', 'Tensos y entornados'],
    ['droop', 'Párpados caídos'],
    ['squint', 'Mejillas elevadas'],
  ],
  mouth: [
    ['smile', 'Comisuras elevadas'],
    ['frown', 'Comisuras descendidas'],
    ['pressed', 'Labios apretados'],
    ['stretched', 'Labios estirados'],
    ['open', 'Mandíbula caída'],
    ['snarl', 'Labio superior elevado'],
  ],
};

/** Actividad 6: pares de emociones fácilmente confundibles. `truth` es la emoción mostrada. */
export const SIMILAR_PAIRS = [
  { truth: 'miedo', pair: ['sorpresa', 'miedo'] },
  { truth: 'sorpresa', pair: ['sorpresa', 'miedo'] },
  { truth: 'sorpresa', pair: ['sorpresa', 'miedo'] },
  { truth: 'miedo', pair: ['sorpresa', 'miedo'] },
  { truth: 'asco', pair: ['ira', 'asco'] },
  { truth: 'ira', pair: ['ira', 'asco'] },
];

/**
 * Actividad 7: escenas que se pausan sobre una expresión.
 * `video` y `context` son los nombres que deberán tener los archivos reales en /assets.
 */
export const FUTURE_SCENES = [
  {
    video: 'escena_01_ira.mp4',
    emotion: 'ira',
    context: 'En una reunión de equipo, a un compañero le comunican que su propuesta ha sido descartada sin discusión.',
    options: [
      { text: 'Probablemente elevará el tono o confrontará a quien tomó la decisión.', correct: true },
      { text: 'Probablemente agradecerá la decisión y propondrá una alternativa.' },
      { text: 'Probablemente pedirá ayuda para entender qué ha pasado.' },
    ],
    why: 'La ira suele asociarse a la percepción de un obstáculo o una injusticia y prepara conductas de confrontación o reclamación.',
  },
  {
    video: 'escena_02_miedo.mp4',
    emotion: 'miedo',
    context: 'Una persona recibe un mensaje de su responsable: «Tenemos que hablar ahora, es urgente».',
    options: [
      { text: 'Probablemente reaccionará con indiferencia y seguirá con su tarea.' },
      { text: 'Probablemente tratará de evitar el encuentro o se justificará de forma ansiosa.', correct: true },
      { text: 'Probablemente se pondrá a celebrar con sus compañeros.' },
    ],
    why: 'El miedo señala una amenaza anticipada y prepara conductas de evitación, huida o búsqueda de seguridad.',
  },
  {
    video: 'escena_03_tristeza.mp4',
    emotion: 'tristeza',
    context: 'Una joven descubre en redes sociales que su grupo de amigos ha quedado sin invitarla.',
    options: [
      { text: 'Probablemente se retraerá y buscará aislarse o consuelo en alguien cercano.', correct: true },
      { text: 'Probablemente irá al lugar a reclamar a gritos.' },
      { text: 'Probablemente bromeará sobre ello con las mismas personas.' },
    ],
    why: 'La tristeza acompaña a una pérdida percibida y favorece el retraimiento y la búsqueda de apoyo.',
  },
  {
    video: 'escena_04_asco.mp4',
    emotion: 'asco',
    context: 'Un estudiante escucha cómo un conocido presume de haber copiado el trabajo de otro compañero.',
    options: [
      { text: 'Probablemente se acercará con entusiasmo para felicitarle.' },
      { text: 'Probablemente se quedará paralizado sin saber qué hacer.' },
      { text: 'Probablemente se apartará y rechazará de forma explícita esa conducta.', correct: true },
    ],
    why: 'El asco (incluido el moral) motiva el rechazo y el distanciamiento de aquello que se percibe como contaminante o inaceptable.',
  },
  {
    video: 'escena_05_alegria.mp4',
    emotion: 'alegria',
    context: 'Una persona abre un correo y lee que ha sido admitida en el máster que deseaba.',
    options: [
      { text: 'Probablemente comunicará la noticia y buscará compartirla con otros.', correct: true },
      { text: 'Probablemente ocultará la noticia y evitará hablar con nadie.' },
      { text: 'Probablemente reclamará una explicación a la universidad.' },
    ],
    why: 'La alegría se asocia a la consecución de un objetivo y promueve la conducta social de compartir y celebrar.',
  },
];

/**
 * Actividad 8: situaciones para el «actor de doblaje».
 * Las tres respuestas de referencia están redactadas en clave de empatía COGNITIVA:
 * describen estado emocional, valoración y tendencia de acción sin implicación afectiva.
 */
export const DUBBING_SCENES = [
  {
    image: 'contexto_doblaje_01.jpg',
    emotion: 'tristeza',
    context: 'Marcos acaba de leer el correo en el que se le comunica que no ha sido seleccionado para la beca a la que dedicó meses de trabajo.',
    references: [
      ['Emoción y causa', 'Experimenta tristeza por una pérdida de expectativa: su esfuerzo previo no se corresponde con el resultado.'],
      ['Pensamiento probable', '«Mi esfuerzo no ha servido»; puede cuestionar su valía y centrar la atención en lo perdido.'],
      ['Tendencia de conducta', 'Es probable que se retraiga a corto plazo y que le beneficie tiempo y reconocimiento de su esfuerzo.'],
    ],
  },
  {
    image: 'contexto_doblaje_02.jpg',
    emotion: 'miedo',
    context: 'Lucía ve que su teléfono se ilumina con un mensaje de su responsable pidiéndole una reunión inmediata, tras haber entregado ayer un informe con prisas.',
    references: [
      ['Emoción y causa', 'Siente miedo porque anticipa una consecuencia negativa vinculada a una posible falta en su trabajo.'],
      ['Pensamiento probable', '«He cometido un error y puede afectar a mi puesto»; evalúa la situación como amenaza.'],
      ['Tendencia de conducta', 'Probablemente trate de evitar el encuentro, o llegue a él justificándose; necesita información y seguridad.'],
    ],
  },
  {
    image: 'contexto_doblaje_03.jpg',
    emotion: 'ira',
    context: 'Álvaro descubre que un compañero ha presentado como propio el trabajo que prepararon juntos.',
    references: [
      ['Emoción y causa', 'Siente ira por percibir una injusticia y una vulneración de lo acordado.'],
      ['Pensamiento probable', '«Se ha aprovechado de mí»; atribuye intencionalidad a la conducta del compañero.'],
      ['Tendencia de conducta', 'Es probable que lo confronte o reclame; busca restablecer el reconocimiento de su aportación.'],
    ],
  },
  {
    image: 'contexto_doblaje_04.jpg',
    emotion: 'asco',
    context: 'Irene observa cómo un conocido se jacta de haber engañado a un cliente especialmente vulnerable.',
    references: [
      ['Emoción y causa', 'Siente asco moral: la conducta que presencia viola valores importantes para ella.'],
      ['Pensamiento probable', '«Esto es inaceptable»; valora a esa persona como alguien de quien debe tomar distancia.'],
      ['Tendencia de conducta', 'Probablemente se aparte, rechace participar de la conversación y reduzca el contacto.'],
    ],
  },
];

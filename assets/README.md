# Assets (imágenes y vídeos reales)

Mientras `useRealAssets` sea `false` (ver `js/config.js`), la app dibuja rostros esquemáticos SVG y **no necesita ningún archivo de esta carpeta**.

Para pasar a estímulos reales: copia aquí los archivos con **exactamente** estos nombres y cambia `useRealAssets` a `true`.

## Imágenes de rostros (Actividades 1, 3, 4, 5, 6, 8)

Un mismo número `NN` (`01`–`12`) identifica a la misma persona en todos los archivos, de modo que `neutro_03.jpg` e `ira_03.jpg` son el mismo actor. Formato recomendado: JPG, proporción 5:6 (p. ej. 500×600 px), fondo uniforme.

| Estímulo | Archivos |
|---|---|
| Cara neutra | `neutro_01.jpg` … `neutro_12.jpg` |
| Alegría | `alegria_01.jpg` … `alegria_12.jpg` |
| Tristeza | `tristeza_01.jpg` … `tristeza_12.jpg` |
| Ira | `ira_01.jpg` … `ira_12.jpg` |
| Miedo | `miedo_01.jpg` … `miedo_12.jpg` |
| Sorpresa | `sorpresa_01.jpg` … `sorpresa_12.jpg` |
| Asco | `asco_01.jpg` … `asco_12.jpg` |
| Sonrisa genuina (Duchenne) | `sonrisa-genuina_01.jpg` … `sonrisa-genuina_12.jpg` |
| Sonrisa social / falsa | `sonrisa-falsa_01.jpg` … `sonrisa-falsa_12.jpg` |

## Vídeos (Actividades 2 y 7) — requieren un pequeño cambio de código

Estos vídeos todavía **no** se cargan automáticamente: hoy son una simulación con rostros SVG. Los nombres previstos están anotados en `data-asset` del reproductor; para usarlos hay que sustituir `.video-sim__screen` por un `<video>` en `createVideoSim` (`js/components.js`, hay un comentario con las instrucciones).

| Actividad | Archivos |
|---|---|
| 2 · Encuentra el cambio | `slowed_01.mp4`, `slowed_02.mp4`, `slowed_03.mp4` |
| 7 · ¿Qué pasará? | `escena_01_ira.mp4`, `escena_02_miedo.mp4`, `escena_03_tristeza.mp4`, `escena_04_asco.mp4`, `escena_05_alegria.mp4` |

## Imagen de contexto (Actividad 8)

`contexto_doblaje_01.jpg` … `contexto_doblaje_04.jpg` (nombres definidos en `DUBBING_SCENES`, `js/data.js`).
Hoy la actividad muestra el rostro del personaje; la imagen de contexto aún no se carga desde esta carpeta.

## Consentimiento y derechos

Antes de publicar fotografías o vídeos de personas en GitHub Pages (que es público), comprueba que cuentas con su consentimiento y con los derechos de uso del banco de estímulos. Los bancos con licencia restringida (p. ej. METT, NimStim, KDEF) normalmente **no** permiten redistribuirlos en una web abierta.

# Decodificación de microexpresiones · Entrenamiento en empatía cognitiva

Programa de 4 semanas y 8 actividades para entrenar la detección e interpretación de microexpresiones faciales en jóvenes universitarios (18-25 años). Enfoque estrictamente de **empatía cognitiva**: comprender y anticipar el estado emocional ajeno sin contagiarse de él. Referencias metodológicas: METT (P. Ekman) y FACS.

Es una SPA 100 % estática (HTML + Tailwind por CDN + JavaScript ES modules): no hay backend, no se guarda ni se envía ningún dato.

## Estructura

```
index.html          Marco de la app: cabecera fija, pestañas Semana 1-4, puntos de montaje
css/style.css       Tokens y componentes neumorfistas (sombras dobles, estados inset)
js/app.js           Punto de entrada: navegación, marcador global, montaje
js/config.js        Tiempos, puntos y conmutador de assets reales (ajustable por el equipo clínico)
js/data.js          Contenido: emociones, piezas, escenas y respuestas de referencia
js/state.js         Estado de puntuación (sin DOM)
js/shell.js         Estructura común de actividad: rondas, feedback, timers cancelables
js/components.js    Vídeo simulado, rejilla de rostros, barra regresiva, modal
js/faces.js         Generador de rostros SVG (placeholders) y punto único `stimulus()`
js/dragdrop.js      Drag & drop con Pointer Events (ratón, táctil, teclado)
js/activities/      a1 … a8, una por archivo
assets/             Imágenes/vídeos reales (ver assets/README.md con los nombres exactos)
```

## Ejecutar en local

Los ES modules no se cargan desde `file://`; hace falta un servidor estático:

- VS Code: extensión *Live Server* → «Go Live», o
- Python: `python -m http.server 8080` y abrir <http://localhost:8080>.

## Puntuación

| Actividad | Máx. | Criterio |
|---|---|---|
| 1 Rompecabezas | 6 | Emoción resuelta a la primera y sin pista |
| 2 Encuentra el cambio | 3 | Pulsación dentro de la ventana válida |
| 3 Infiltrado | 5 | Cara correcta |
| 4 Infiltrado 2.0 | 6 | 1 punto por emoción correcta (2 por ronda) |
| 5 ¿Me estás mintiendo? | 4 | Sonrisa genuina elegida |
| 6 Similitudes | 6 | Emoción correcta en < 3 s |
| 7 ¿Qué pasará? | 5 | Conducta más probable |
| 8 Actor de doblaje | 8 | Autoevaluación: «Fui acertado» +2, «Me desvié» +1 (valores en `config.js`) |

## Pasar a estímulos reales

Ver [`assets/README.md`](assets/README.md) y `useRealAssets` en `js/config.js`.

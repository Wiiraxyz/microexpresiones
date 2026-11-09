/**
 * Drag & drop con Pointer Events (funciona con ratón, táctil y lápiz; el DnD nativo de
 * HTML5 no funciona en pantallas táctiles).
 *
 * Accesibilidad: un toque/clic sin arrastre (o Enter/Espacio sobre el botón) invoca
 * `onDrop(item, null)`; la actividad decide entonces la zona destino por sí misma.
 */
const MOVE_THRESHOLD_PX = 6;

export function enableDragDrop(root, { itemSelector, zoneSelector, onDrop }) {
  let drag = null;

  const zoneAt = (x, y) => document.elementFromPoint(x, y)?.closest(zoneSelector) ?? null;

  const clearHighlight = () =>
    root.querySelectorAll(`${zoneSelector}.is-over`).forEach((z) => z.classList.remove('is-over'));

  const makeGhost = (item) => {
    const rect = item.getBoundingClientRect();
    const ghost = item.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    document.body.append(ghost);
    return ghost;
  };

  const finish = () => {
    drag?.ghost?.remove();
    drag?.item.classList.remove('is-dragging');
    root.classList.remove('is-dragging-active');
    clearHighlight();
    drag = null;
  };

  root.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const item = e.target.closest(itemSelector);
    if (!item) return;
    e.preventDefault();
    item.setPointerCapture(e.pointerId);
    drag = { item, id: e.pointerId, x0: e.clientX, y0: e.clientY, ghost: null };
  });

  root.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.ghost) {
      if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < MOVE_THRESHOLD_PX) return;
      drag.ghost = makeGhost(drag.item);
      drag.item.classList.add('is-dragging');
      root.classList.add('is-dragging-active');
    }
    const { width, height } = drag.ghost.getBoundingClientRect();
    drag.ghost.style.transform = `translate(${e.clientX - width / 2}px, ${e.clientY - height / 2}px)`;
    clearHighlight();
    zoneAt(e.clientX, e.clientY)?.classList.add('is-over');
  });

  root.addEventListener('pointerup', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { item, ghost } = drag;
    const zone = ghost ? zoneAt(e.clientX, e.clientY) : null;
    finish();
    if (!ghost || zone) onDrop(item, zone); // toque simple → zona null
    else onDrop(item, false); // arrastre soltado fuera de cualquier zona
  });

  root.addEventListener('pointercancel', finish);

  // Teclado: Enter/Espacio disparan click con detail === 0.
  root.addEventListener('click', (e) => {
    const item = e.target.closest(itemSelector);
    if (item && e.detail === 0) onDrop(item, null);
  });
}

/**
 * timeline.js — componente reutilizable de línea de tiempo (TASK-21.2).
 * Usado por P-19 (etapas del trámite) e I-06 (historial del expediente).
 * Script clásico: expone `tm.ui.timeline`.
 *
 * timeline({ items: [{ fecha, titulo, detalle, autor, done, active, estado }], emptyText })
 *   - `done`   (bool) o `estado === "done"`   -> hito completado.
 *   - `active` (bool) o `estado === "active"` -> hito actual.
 *   - `titulo` acepta también `item.evento` como alias.
 */
(function (global) {
  "use strict";

  const { el } = global.tm.layout;

  function isDone(item) {
    return item.done === true || item.estado === "done" || item.estado === "completado";
  }

  function isActive(item) {
    return item.active === true || item.estado === "active" || item.estado === "actual";
  }

  function timeline(opts) {
    const options = opts || {};
    const items = options.items || [];
    const wrap = el("div", "timeline");

    if (!items.length) {
      wrap.appendChild(el("p", "seguimiento-note", options.emptyText || "Sin eventos registrados."));
      return wrap;
    }

    const list = el("ol", "timeline__list");
    for (const raw of items) {
      const item = raw || {};
      const cls = isActive(item) ? "is-active" : isDone(item) ? "is-done" : "";
      const li = el("li", `timeline__item ${cls}`.trim());
      const marker = el("span", "timeline__marker");
      const body = el("div", "timeline__body");
      body.appendChild(el("div", "timeline__header", item.fecha || ""));
      body.appendChild(el("div", "timeline__title", item.titulo || item.evento || ""));
      if (item.detalle) body.appendChild(el("p", "timeline__detail", item.detalle));
      if (item.autor) body.appendChild(el("span", "timeline__meta", `Autor: ${item.autor}`));
      li.appendChild(marker);
      li.appendChild(body);
      list.appendChild(li);
    }
    wrap.appendChild(list);
    return wrap;
  }

  global.tm.ui.timeline = timeline;
})(window);

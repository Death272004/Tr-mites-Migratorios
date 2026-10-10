/**
 * timeline.js — línea de tiempo (P-19, I-06). Script clásico: expone `tm.ui.timeline`.
 */
(function (global) {
  "use strict";

  const { el } = global.tm.layout;

  function timeline({ items = [] } = {}) {
    const wrap = el("div", "timeline");
    const list = el("ol", "timeline__list");
    for (const item of items) {
      const cls = item.active ? "is-active" : item.done ? "is-done" : "";
      const li = el("li", `timeline__item ${cls}`);
      const marker = el("span", "timeline__marker");
      const body = el("div", "timeline__body");
      body.appendChild(el("div", "timeline__header", item.fecha ?? ""));
      body.appendChild(el("div", "timeline__title", item.titulo ?? ""));
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
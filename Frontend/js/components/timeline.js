/**
 * Timeline — línea de tiempo (usado en P-19 e I-06).
 */

import { el } from "./layout.js";

export function timeline({ items = [] } = {}) {
  const wrap = el("div", "timeline");
  const list = el("ol", "timeline__list");
  for (const item of items) {
    const li = el("li", `timeline__item ${item.active ? "is-active" : item.done ? "is-done" : ""}`);
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

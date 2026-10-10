/**
 * Stepper — asistente de pasos (usado en P-09…P-16).
 */

import { el } from "./layout.js";

export function stepper({ steps = [], current = 0 } = {}) {
  const wrap = el("div", "stepper");
  const list = el("ol", "stepper__list");
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const li = el("li", `stepper__item ${i === current ? "is-current" : i < current ? "is-done" : "is-pending"}`);
    const bullet = el("span", "stepper__bullet", String(i + 1));
    const text = el("div", "stepper__text");
    text.appendChild(el("div", "stepper__label", step.label));
    if (step.subtitle) text.appendChild(el("div", "stepper__subtitle", step.subtitle));
    li.appendChild(bullet);
    li.appendChild(text);
    list.appendChild(li);
  }
  wrap.appendChild(list);
  return wrap;
}

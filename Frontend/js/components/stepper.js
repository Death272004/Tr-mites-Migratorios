/**
 * stepper.js — asistente de pasos (P-09…P-16). Script clásico: expone `tm.ui.stepper`.
 */
(function (global) {
  "use strict";

  const { el } = global.tm.layout;

  function stepper({ steps = [], current = 0, unit = "Etapa" } = {}) {
    const wrap = el("div", "stepper");
    const progress = Math.round(((current + 1) / Math.max(steps.length, 1)) * 100);
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Progreso de la solicitud");
    const list = el("ol", "stepper__list");
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const style = i === current ? "is-current" : i < current ? "is-done" : "is-pending";
      const li = el("li", `stepper__item ${style}`);
      if (i === current) li.setAttribute("aria-current", "step");
      const bullet = el("span", "stepper__bullet", i < current ? "✓" : String(i + 1));
      bullet.setAttribute("aria-hidden", "true");
      const text = el("div", "stepper__text");
      text.appendChild(el("div", "stepper__label", step.label));
      text.appendChild(el("div", "stepper__subtitle", i === current ? "En curso" : i < current ? "Completada" : "Pendiente"));
      const sr = el("span", "sr-only", i === current ? "Etapa actual" : i < current ? "Etapa completada" : "Etapa pendiente");
      text.appendChild(sr);
      li.appendChild(bullet);
      li.appendChild(text);
      list.appendChild(li);
    }
    wrap.appendChild(list);

    const meter = el("div", "stepper__meter");
    meter.setAttribute("role", "progressbar");
    meter.setAttribute("aria-label", "Avance total del trámite");
    meter.setAttribute("aria-valuemin", "0");
    meter.setAttribute("aria-valuemax", "100");
    meter.setAttribute("aria-valuenow", String(progress));
    const meterFill = el("span", "stepper__meter-fill");
    meterFill.style.width = progress + "%";
    meter.appendChild(meterFill);
    wrap.appendChild(meter);

    const compact = el("div", "stepper__compact");
    compact.appendChild(el("span", "stepper__compact-count", unit + " " + (current + 1) + " de " + steps.length));
    compact.appendChild(el("strong", "stepper__compact-label", steps[current] ? steps[current].label : "Solicitud"));
    wrap.appendChild(compact);
    return wrap;
  }

  global.tm.ui.stepper = stepper;
})(window);

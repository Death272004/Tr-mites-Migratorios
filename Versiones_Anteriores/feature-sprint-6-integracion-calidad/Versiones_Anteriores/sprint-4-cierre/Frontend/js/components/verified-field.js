/**
 * verified-field.js — campo sellado [A] "verificado automáticamente".
 * Muestra valor de solo lectura con fuente y fecha, y permite forzar
 * revisión manual (MVP: el despacho lo registra en I-07).
 * Script clásico: expone `tm.ui.verifiedField`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var button = global.tm.ui.button;

  function verifiedField(opts) {
    opts = opts || {};
    var wrapper = layout.el("div", "form-field verified-field");
    var lbl = layout.el("label", "form-field__label", opts.label || "");
    wrapper.appendChild(lbl);

    var input = layout.el("input", "form-field__input", opts.value || "—");
    input.type = "text";
    input.id = opts.id || "";
    input.readOnly = true;
    input.disabled = true;
    input.setAttribute("aria-readonly", "true");
    wrapper.appendChild(input);

    var seal = layout.el("div", "verified-field__seal");
    seal.appendChild(layout.el("span", "badge badge--verified", "verificado automáticamente"));
    seal.appendChild(layout.el("span", "verified-field__meta", (opts.fuente || "fuente") + " · " + (opts.fecha || "fecha")));
    wrapper.appendChild(seal);

    if (opts.onForce) {
      var force = button({ text: "Forzar revisión manual", onClick: opts.onForce });
      var actions = layout.el("div", "verified-field__actions");
      actions.appendChild(force);
      wrapper.appendChild(actions);
    }

    return wrapper;
  }

  global.tm.ui.verifiedField = verifiedField;
})(window);
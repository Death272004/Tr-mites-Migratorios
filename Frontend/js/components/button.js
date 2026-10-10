/**
 * button.js — botón con variantes. Script clásico: expone `tm.ui.button`.
 */
(function (global) {
  "use strict";

  const { el } = global.tm.layout;

  function button({ variant = "ghost", text = "", type = "button", disabled = false, onClick } = {}) {
    const cls =
      variant === "primary"
        ? "btn btn--primary"
        : variant === "danger"
          ? "btn btn--danger"
          : "btn";
    const btn = el("button", cls, text);
    btn.type = type;
    btn.disabled = disabled;
    if (onClick) btn.addEventListener("click", onClick);
    return btn;
  }

  global.tm.ui = global.tm.ui || {};
  global.tm.ui.button = button;
})(window);
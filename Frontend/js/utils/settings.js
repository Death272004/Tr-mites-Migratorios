/** Preferencias visuales y de accesibilidad del portal. */
(function (global) {
  "use strict";
  var KEY = "tm-preferencias";
  var DEFAULTS = { tema: "claro", texto: "normal", contraste: false, notificaciones: true, recordarSesion: false };

  function get() {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || "{}")); }
    catch (error) { return Object.assign({}, DEFAULTS); }
  }

  function apply(preferencias) {
    var next = preferencias || get();
    document.documentElement.classList.toggle("theme-dark", next.tema === "oscuro");
    document.documentElement.classList.toggle("theme-high-contrast", !!next.contraste);
    document.documentElement.dataset.textSize = next.texto;
  }

  function save(preferencias) {
    var next = Object.assign({}, DEFAULTS, preferencias || {});
    localStorage.setItem(KEY, JSON.stringify(next));
    apply(next);
    return next;
  }

  function reset() { return save(DEFAULTS); }
  apply();
  global.tm.settings = { get: get, save: save, apply: apply, reset: reset };
})(window);

/**
 * expediente.js — expediente seleccionado en el portal.
 * Se usa para enlazar P-06/P-19/P-20 sin poner identificadores en la URL.
 */
(function (global) {
  "use strict";

  var KEY = "tm.expediente.seleccionado.v1";

  function setSelected(expediente) {
    if (!expediente || !expediente.id) return null;
    try { global.sessionStorage.setItem(KEY, JSON.stringify(expediente)); } catch (e) { /* ignore */ }
    return expediente;
  }

  function getSelected() {
    try {
      var raw = global.sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function clear() {
    try { global.sessionStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  }

  global.tm = global.tm || {};
  global.tm.expediente = { setSelected: setSelected, getSelected: getSelected, clear: clear };
})(window);

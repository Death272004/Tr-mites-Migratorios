/**
 * draft.js — borrador compartido del asistente de solicitud (P-07…P-18).
 * Persistido en `sessionStorage` bajo `tm.solicitud.v1`. Sin datos reales.
 * Script clásico: expone `window.tm.draft`.
 */
(function (global) {
  "use strict";

  var KEY = "tm.solicitud.v1";

  function getDraft() {
    try {
      var raw = global.sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function mergeDraft(partial) {
    var draft = getDraft();
    for (var k in partial) {
      if (Object.prototype.hasOwnProperty.call(partial, k)) draft[k] = partial[k];
    }
    try { global.sessionStorage.setItem(KEY, JSON.stringify(draft)); } catch (e) { /* ignore */ }
    return draft;
  }

  function clearDraft() {
    try { global.sessionStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  }

  global.tm.draft = { getDraft: getDraft, mergeDraft: mergeDraft, clearDraft: clearDraft };
})(window);
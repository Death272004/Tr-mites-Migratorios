/**
 * api-bootstrap.js — activa el modo online de `tm.api` según el origen de la página.
 *
 * - `http:`/`https:`: mismo origen. nginx sirve el frontend y proxya `/api/` al
 *   backend, así que no hay CORS ni host fijo en el cliente.
 * - `file://`: no hay backend; se deja el modo OFFLINE con el demo inline de cada
 *   vista (retrocompatibilidad, ver `js/fixtures/README.md`).
 *
 * Overrides para pruebas: `?api=<ruta|url|off>` o `window.TM_API_BASE_URL`.
 * Script clásico: no expone API propia, solo configura `tm.api`.
 */
(function (global) {
  "use strict";

  var DEFAULT_HTTP_BASE = "/api";

  function override() {
    try {
      var params = new global.URLSearchParams(global.location.search || "");
      if (params.has("api")) {
        var valor = params.get("api");
        return valor === "" || valor === "off" ? null : valor;
      }
    } catch (e) { /* entorno sin URLSearchParams */ }
    if (typeof global.TM_API_BASE_URL !== "undefined") {
      return global.TM_API_BASE_URL || null;
    }
    return undefined; // sin override: decidir por origen
  }

  function resolveBase() {
    var forzado = override();
    if (forzado !== undefined) return forzado;
    var proto = global.location.protocol;
    if (proto === "http:" || proto === "https:") return DEFAULT_HTTP_BASE;
    return null;
  }

  if (!global.tm || !global.tm.api) return;
  global.tm.api.setBaseUrl(resolveBase());
})(window);

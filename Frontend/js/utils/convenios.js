/**
 * convenios.js — convenios de interoperabilidad vigentes con otras instituciones.
 *
 * Con convenio, el dato se obtiene de la institución y el ciudadano no lo digita.
 * Sin convenio, el ciudadano lo declara y adjunta su comprobante; el despacho lo
 * verifica al revisar la solicitud.
 *
 * Define la opción que aparece marcada al inicio; el solicitante puede cambiarla
 * en la pantalla. Hoy no hay convenio con el SNM: cuando exista, basta con
 * cambiar `snm` a `true`. También se puede forzar con `?convenio=snm` en la URL
 * (o `window.TM_CONVENIOS = { snm: true }` antes de cargar este script).
 * Script clásico: expone `window.tm.convenios`.
 */
(function (global) {
  "use strict";

  var VIGENTES = {
    snm: false, // Servicio Nacional de Migración: historial de entradas y salidas
  };

  function forzados() {
    var out = {};
    try {
      var params = new global.URLSearchParams(global.location.search || "");
      (params.get("convenio") || "").split(",").forEach(function (nombre) {
        if (nombre) out[nombre.trim().toLowerCase()] = true;
      });
    } catch (e) { /* entorno sin URLSearchParams */ }
    var externo = global.TM_CONVENIOS || {};
    for (var k in externo) {
      if (Object.prototype.hasOwnProperty.call(externo, k)) out[k.toLowerCase()] = !!externo[k];
    }
    return out;
  }

  function activo(fuente) {
    var clave = String(fuente || "").toLowerCase();
    var forzado = forzados();
    if (Object.prototype.hasOwnProperty.call(forzado, clave)) return forzado[clave];
    return !!VIGENTES[clave];
  }

  global.tm = global.tm || {};
  global.tm.convenios = { activo: activo };
})(window);

/**
 * validacion.js — política de complejidad de contraseñas (HU-12 CA-5).
 *
 * Espejo en cliente de `pa.tramitesmigratorios.seguridad.PoliticaContrasena`
 * (Backend), para avisar antes de enviar sin duplicar reglas en cada vista.
 * El backend sigue siendo la autoridad: sus mensajes por campo se muestran igual.
 * Script clásico: expone `window.tm.validacion`.
 */
(function (global) {
  "use strict";

  var LONGITUD_MINIMA = 10;
  // BCrypt solo considera los primeros 72 bytes.
  var LONGITUD_MAXIMA = 72;

  /** Devuelve los incumplimientos; vacío si la contraseña cumple la política. */
  function incumplimientos(contrasena, correo) {
    var faltas = [];
    var valor = contrasena == null ? "" : String(contrasena);
    if (valor.length < LONGITUD_MINIMA || valor.length > LONGITUD_MAXIMA) {
      faltas.push("Debe tener entre " + LONGITUD_MINIMA + " y " + LONGITUD_MAXIMA + " caracteres.");
    }
    if (!/[A-Z]/.test(valor)) faltas.push("Debe incluir una letra mayúscula.");
    if (!/[a-z]/.test(valor)) faltas.push("Debe incluir una letra minúscula.");
    if (!/[0-9]/.test(valor)) faltas.push("Debe incluir un número.");
    if (!/[^A-Za-z0-9]/.test(valor)) faltas.push("Debe incluir un símbolo.");
    var usuario = (correo == null ? "" : String(correo)).split("@")[0].toLowerCase();
    if (usuario.length >= 4 && valor.toLowerCase().indexOf(usuario) !== -1) {
      faltas.push("No debe contener su correo.");
    }
    return faltas;
  }

  function cumple(contrasena, correo) {
    return incumplimientos(contrasena, correo).length === 0;
  }

  global.tm = global.tm || {};
  global.tm.validacion = {
    incumplimientos: incumplimientos,
    cumple: cumple,
    LONGITUD_MINIMA: LONGITUD_MINIMA,
    LONGITUD_MAXIMA: LONGITUD_MAXIMA,
  };
})(window);

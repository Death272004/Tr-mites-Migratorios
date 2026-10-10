/**
 * session.js — gestor de sesión de demostración sobre sessionStorage.
 * Token ficticio (no firma nada), expiración en segundos. Script clásico.
 * Clave de almacenamiento: tm.session.v1. Expone `window.tm.session`.
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "tm.session.v1";

  function now() {
    return Math.floor(Date.now() / 1000);
  }

  function read() {
    try {
      var raw = global.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.token && parsed.datos) return parsed;
      return null;
    } catch (e) {
      return null;
    }
  }

  function expired(s) {
    return !s.expiraEn || s.expiraEn <= now();
  }

  function saveSession(datos, opts) {
    var config = opts || {};
    var ttl = typeof config.ttlSegundos === "number" ? config.ttlSegundos : 30 * 60;
    var session = {
      token: "demo." + String(now()) + "." + (datos.email || "anon").replace(/\s+/g, "_").toLowerCase(),
      datos: datos,
      expiraEn: now() + ttl,
      creada: new Date().toISOString(),
    };
    global.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  function updateSessionRole(role) {
    var s = read();
    if (!s) return null;
    s.datos.rol = role;
    global.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    return s;
  }

  function getToken() {
    var s = read();
    if (!s || expired(s)) return null;
    return s.token;
  }

  function getSession() {
    var s = read();
    if (!s || expired(s)) return null;
    return s;
  }

  function isAuthenticated() {
    return !!getSession();
  }

  function clearSession() {
    global.sessionStorage.removeItem(STORAGE_KEY);
  }

  global.tm.session = {
    saveSession: saveSession,
    updateSessionRole: updateSessionRole,
    getToken: getToken,
    getSession: getSession,
    isAuthenticated: isAuthenticated,
    clearSession: clearSession,
  };
})(window);
/**
 * session.js — gestor de sesión del portal.
 * El token lo emite el backend; se usa sessionStorage o localStorage según la
 * preferencia explícita de recordar la sesión. Script clásico.
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
      var stores = [global.sessionStorage, global.localStorage];
      for (var i = 0; i < stores.length; i++) {
        var raw = stores[i].getItem(STORAGE_KEY);
        if (!raw) continue;
        var parsed = JSON.parse(raw);
        // Las sesiones demo antiguas no son válidas para el backend real.
        // Se descartan para evitar que una cuenta ficticia reaparezca al abrir la app.
        if (parsed && typeof parsed.token === "string" && parsed.token.indexOf("demo.") === 0) {
          stores[i].removeItem(STORAGE_KEY);
          continue;
        }
        if (parsed && typeof parsed === "object" && parsed.token && parsed.datos) return parsed;
        stores[i].removeItem(STORAGE_KEY);
      }
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
    // TTL del backend llega como duración en segundos (`expiraEn` de LoginRespuesta).
    var ttl = typeof config.ttlSegundos === "number" ? config.ttlSegundos
      : typeof config.expiraEn === "number" ? config.expiraEn
      : 30 * 60;
    var correo = (datos && (datos.email || (datos.usuario && datos.usuario.correo))) || "anon";
    var session = {
      // Con backend se guarda el token real; sin él (demo interno) se conserva uno ficticio.
      token: config.token || ("demo." + String(now()) + "." + correo.replace(/\s+/g, "_").toLowerCase()),
      datos: datos,
      expiraEn: now() + ttl,
      creada: new Date().toISOString(),
    };
    var storage = config.recordar ? global.localStorage : global.sessionStorage;
    var otherStorage = config.recordar ? global.sessionStorage : global.localStorage;
    otherStorage.removeItem(STORAGE_KEY);
    storage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  function updateSessionRole(role) {
    var s = read();
    if (!s) return null;
    s.datos.rol = role;
    try { global.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
    catch (e) { global.localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
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
    global.localStorage.removeItem(STORAGE_KEY);
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

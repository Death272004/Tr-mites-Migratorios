/**
 * api.js — módulo único de servicios HTTP (TASK-09.1, HU-09).
 *
 * Regla del proyecto (§2.1): ninguna vista llama a `fetch`/`XHR` por su cuenta;
 * todo pasa por este módulo. Mientras no haya backend (Sprint 1) opera en modo
 * OFFLINE y lee los fixtures locales con el MISMO esquema que los mocks de la
 * HU-08 (`{ meta, data, error }`), de modo que conectar el backend no exija
 * reescribir vistas: basta con `tm.api.setBaseUrl("http://host/api")`.
 *
 * Aporta:
 *  - token (de `tm.session`) y cabecera `X-Scenario` (de `tm.fixtures.scenario()`);
 *  - manejo centralizado de errores (401/403/404/409/5xx -> texto de usuario,
 *    sin detalles técnicos ni datos personales, §2.2);
 *  - lectura offline de fixtures y caché de envelopes remotos.
 *
 * Script clásico: expone `window.tm.api`.
 */
(function (global) {
  "use strict";

  var DEFAULT_SCENARIO = "exito";

  // Traducción centralizada de estados -> mensaje de usuario (sin tecnicismos).
  var ERROR_MESSAGES = {
    400: "Revisa los datos enviados: hay un campo con formato inválido.",
    401: "Tu sesión expiró o no es válida. Vuelve a iniciar sesión.",
    403: "No tienes permiso para realizar esta acción.",
    404: "No encontramos lo que buscas.",
    405: "La acción solicitada no está disponible.",
    409: "La información cambió mientras trabajabas. Actualiza e inténtalo de nuevo.",
    422: "Revisa los datos enviados: hay un campo con formato inválido.",
    429: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
    500: "Ocurrió un problema temporal. Intenta nuevamente.",
    502: "El servicio no está disponible en este momento. Intenta más tarde.",
    503: "El servicio no está disponible en este momento. Intenta más tarde.",
    504: "El servicio tardó demasiado en responder. Intenta nuevamente."
  };

  var config = { baseUrl: null, timeoutMs: 8000 };
  var cache = {}; // pantalla normalizada -> { escenario -> envelope }

  function normalize(pantalla) {
    return String(pantalla || "").toUpperCase().replace(/\s+/g, "-");
  }

  function getBaseUrl() { return config.baseUrl; }
  function setBaseUrl(url) { config.baseUrl = url || null; return config.baseUrl; }
  function isOnline() { return !!config.baseUrl; }

  function token() {
    try {
      return global.tm.session && global.tm.session.getToken ? global.tm.session.getToken() : null;
    } catch (e) { return null; }
  }

  function scenario() {
    var s = null;
    try { s = global.tm.fixtures && global.tm.fixtures.scenario ? global.tm.fixtures.scenario() : null; } catch (e) { s = null; }
    return s || DEFAULT_SCENARIO;
  }

  // Cabeceras centralizadas: token + X-Scenario (HU-09) + JSON.
  function headers(extra) {
    var h = { "Content-Type": "application/json" };
    var t = token();
    if (t) h.Authorization = "Bearer " + t;
    h["X-Scenario"] = scenario();
    if (extra) { for (var k in extra) { if (Object.prototype.hasOwnProperty.call(extra, k)) h[k] = extra[k]; } }
    return h;
  }

  function translateError(statusOrCode, fallback) {
    if (typeof statusOrCode === "number" && ERROR_MESSAGES[statusOrCode]) return ERROR_MESSAGES[statusOrCode];
    if (typeof statusOrCode === "string") {
      var m = /HTTP-(\d+)/.exec(statusOrCode);
      if (m && ERROR_MESSAGES[Number(m[1])]) return ERROR_MESSAGES[Number(m[1])];
    }
    return fallback || "Ocurrió un problema temporal. Intenta nuevamente.";
  }

  // Fuente local (offline). Se lee el registro crudo de tm.fixtures para no
  // crear recursión con `fixtures.data`/`fixtures.message` (que delegan aquí).
  function localEnvelope(pantalla, escenario) {
    if (global.tm.fixtures && typeof global.tm.fixtures.raw === "function") {
      return global.tm.fixtures.raw(pantalla, escenario);
    }
    return null;
  }

  function envelope(pantalla, escenario) {
    var esc = escenario || scenario();
    if (isOnline()) {
      var byPantalla = cache[normalize(pantalla)];
      if (byPantalla && byPantalla[esc]) return byPantalla[esc];
    }
    return localEnvelope(pantalla, esc);
  }

  function get(pantalla, escenario) {
    var env = envelope(pantalla, escenario);
    return env ? env.data : null;
  }

  function message(pantalla, escenario, fallback) {
    var env = envelope(pantalla, escenario);
    if (env && env.error && env.error.mensajeUsuario) return env.error.mensajeUsuario;
    return fallback || "Ocurrió un problema temporal. Intenta nuevamente.";
  }

  /**
   * Petición central. Offline resuelve desde el fixture local de `pantalla`.
   * Online usa XHR con token + X-Scenario y traduce errores.
   * callback(error, data, envelope): error = { codigo, status, mensajeUsuario } | null.
   */
  function request(method, path, options, callback) {
    options = options || {};
    var cb = typeof callback === "function" ? callback : function () {};
    var pantalla = options.pantalla;
    var esc = options.escenario || scenario();

    if (!isOnline()) {
      var env = localEnvelope(pantalla, esc);
      if (!env) {
        cb({ codigo: "SVC-0404", status: 404, mensajeUsuario: translateError(404), offline: true });
        return;
      }
      if (env.error) {
        cb({ codigo: env.error.codigo || "SVC-0500", status: 500, mensajeUsuario: env.error.mensajeUsuario || translateError(500), offline: true });
        return;
      }
      cb(null, env.data, env);
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open(method, config.baseUrl + path, true);
    var h = headers(options.headers);
    for (var k in h) { if (Object.prototype.hasOwnProperty.call(h, k)) xhr.setRequestHeader(k, h[k]); }
    xhr.timeout = options.timeoutMs || config.timeoutMs;

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      var env = null;
      if (xhr.responseText) { try { env = JSON.parse(xhr.responseText); } catch (e) { env = null; } }
      if (xhr.status >= 200 && xhr.status < 300) {
        if (env && pantalla) {
          cache[normalize(pantalla)] = cache[normalize(pantalla)] || {};
          cache[normalize(pantalla)][esc] = env;
        }
        cb(null, env ? env.data : null, env);
        return;
      }
      var usuario = (env && env.error && env.error.mensajeUsuario) || translateError(xhr.status);
      cb({
        codigo: (env && env.error && env.error.codigo) || ("HTTP-" + xhr.status),
        status: xhr.status,
        mensajeUsuario: usuario
      });
    };
    xhr.onerror = function () { cb({ codigo: "SVC-0000", status: 0, mensajeUsuario: translateError(502) }); };
    xhr.ontimeout = function () { cb({ codigo: "SVC-0000", status: 0, mensajeUsuario: translateError(504) }); };
    xhr.send(options.body ? JSON.stringify(options.body) : null);
  }

  function clearCache() { cache = {}; }

  global.tm = global.tm || {};
  global.tm.api = {
    setBaseUrl: setBaseUrl,
    getBaseUrl: getBaseUrl,
    isOnline: isOnline,
    token: token,
    scenario: scenario,
    headers: headers,
    translateError: translateError,
    envelope: envelope,
    get: get,
    message: message,
    request: request,
    clearCache: clearCache
  };
})(window);

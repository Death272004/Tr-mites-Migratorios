/**
 * tm.fixtures — loader de fixtures locales compatible con `file://` (Sprint 1).
 *
 * En ausencia de backend, cada fixture se registra con un `<script src>` que
 * llama a `tm.fixtures.register(...)` (ver `js/fixtures/README.md` §2.5).
 * El envelope es el mismo `{ meta, data, error }` que llevarán los mocks de la
 * HU-08, de modo que el paso fixtures → mocks no exija reescribir vistas.
 * Con servidor/backend, `load()` intenta servir el mismo envelope como `.json`;
 * en `file://` el navegador lo bloquea y la fuente ya quedó registrada por el
 * `.js` gemelo.
 * Script clásico: expone `tm.fixtures`.
 */
(function (global) {
  "use strict";

  var SCENARIO_KEY = "tm.scenario.v1";
  var registry = {};
  var DEFAULT_SCENARIO = "exito";

  function norm(pantalla) {
    return String(pantalla || "").toUpperCase().replace(/\s+/g, "-");
  }

  function register(pantalla, escenario, envelope) {
    var p = norm(pantalla);
    registry[p] = registry[p] || {};
    envelope = envelope || {};
    envelope.meta = envelope.meta || {};
    envelope.meta.pantalla = envelope.meta.pantalla || p;
    envelope.meta.escenario = escenario;
    registry[p][escenario] = envelope;
    return envelope;
  }

  function get(pantalla, escenario) {
    var byScenario = registry[norm(pantalla)];
    if (!byScenario) return null;
    return byScenario[escenario || DEFAULT_SCENARIO] || null;
  }

  function envelope(pantalla, escenario) {
    return get(pantalla, escenario);
  }

  function data(pantalla, escenario) {
    var env = get(pantalla, escenario);
    return env ? env.data : null;
  }

  function message(pantalla, escenario, fallback) {
    var env = get(pantalla, escenario);
    if (env && env.error && env.error.mensajeUsuario) {
      return env.error.mensajeUsuario;
    }
    return fallback || "Ocurrió un problema temporal. Intente nuevamente.";
  }

  function has(pantalla, escenario) {
    return get(pantalla, escenario) !== null;
  }

  function scenario() {
    try {
      return global.sessionStorage.getItem(SCENARIO_KEY) || null;
    } catch (e) {
      return null;
    }
  }

  function setScenario(escenario) {
    try {
      if (escenario) global.sessionStorage.setItem(SCENARIO_KEY, escenario);
      else global.sessionStorage.removeItem(SCENARIO_KEY);
    } catch (e) { /* storage no disponible */ }
    return escenario;
  }

  // Con servidor, intenta cargar el envelope como JSON del mismo nombre
  // (`js/fixtures/<id>-<slug>.<escenario>.json`). En `file://` el navegador lo
  // bloquea; la fuente ya quedó registrada por el `.js` gemelo (README §2.5).
  function load(pantalla, escenario, idSlug, callback) {
    var nombre = idSlug + (escenario === DEFAULT_SCENARIO ? "" : "." + escenario) + ".json";
    var xhr;
    try {
      xhr = new XMLHttpRequest();
    } catch (e) {
      xhr = null;
    }
    if (!xhr) {
      if (callback) callback(null);
      return;
    }
    xhr.open("GET", "js/fixtures/" + nombre, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      var env = null;
      if (xhr.status === 200) {
        try { env = JSON.parse(xhr.responseText); } catch (e) { env = null; }
      }
      if (env) register(pantalla, escenario, env);
      if (callback) callback(env);
    };
    xhr.onerror = function () { if (callback) callback(null); };
    xhr.send();
  }

  global.tm = global.tm || {};
  global.tm.fixtures = {
    register: register,
    envelope: envelope,
    data: data,
    message: message,
    has: has,
    load: load,
    scenario: scenario,
    setScenario: setScenario,
    REGISTRY: registry,
  };
})(window);
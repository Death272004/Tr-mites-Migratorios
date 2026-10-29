/**
 * wizard.js — andamiaje del asistente de solicitud (P-09…P-16).
 * Ruta ↔ paso, encabezado con stepper y pie de navegación.
 * Script clásico: expone `window.tm.wizard`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var stepper = global.tm.ui.stepper;
  var button = global.tm.ui.button;

  var STEPS = [
    { route: "#/solicitud/paso-1", label: "Datos personales" },
    { route: "#/solicitud/paso-2", label: "Pasaporte e historial" },
    { route: "#/solicitud/paso-3", label: "Domicilio y notificaciones" },
    { route: "#/solicitud/paso-4", label: "Situación laboral/económica" },
    { route: "#/solicitud/paso-5", label: "Dependientes" },
    { route: "#/solicitud/paso-6", label: "Requisitos y documentos" },
    { route: "#/solicitud/paso-7", label: "Pagos y tasas" },
    { route: "#/solicitud/paso-8", label: "Declaración y firma" },
  ];

  var TITULARIDAD = "#/solicitud/titularidad";

  function indexOf(route) {
    for (var i = 0; i < STEPS.length; i++) {
      if (STEPS[i].route === route) return i;
    }
    return -1;
  }

  function nextRoute(route) {
    if (route === TITULARIDAD) return STEPS[0].route;
    var i = indexOf(route);
    if (i >= 0 && i < STEPS.length - 1) return STEPS[i + 1].route;
    return "#/solicitud/resumen";
  }

  function prevRoute(route) {
    if (route === TITULARIDAD) return "#/solicitud/tramite";
    var i = indexOf(route);
    if (i > 0) return STEPS[i - 1].route;
    return TITULARIDAD;
  }

  function frame(container, route) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    var i = indexOf(route);
    var total = STEPS.length;

    inner.appendChild(layout.pageHeader(
      "Nueva solicitud",
      i >= 0 ? "Paso " + (i + 1) + " de " + total + " · " + STEPS[i].label : "Asistente de solicitud"
    ));

    inner.appendChild(stepper({
      steps: STEPS.map(function (s) { return { label: s.label }; }),
      current: i,
    }));

    var draft = global.tm.draft.getDraft();
    if (draft && draft.tramite) {
      var summary = layout.el("p", "wizard-summary", "Trámite en curso: " + draft.tramite + " · Presentante: " + presentanteLabel(draft.presentante));
      inner.appendChild(summary);
    }

    var body = layout.el("div", "wizard-body");
    inner.appendChild(body);
    container.appendChild(inner);
    return body;
  }

  function presentanteLabel(v) {
    if (v === "APODERADO") return "mediante apoderado";
    if (v === "CUENTA_PROPIA") return "por cuenta propia";
    return "—";
  }

  function footer(opts) {
    opts = opts || {};
    var actions = layout.el("div", "auth-actions");
    actions.appendChild(button({
      text: opts.backText || "Volver",
      onClick: function () { if (opts.onBack) opts.onBack(); },
    }));
    actions.appendChild(button({
      variant: "primary",
      text: opts.nextText || "Continuar",
      onClick: function () { if (opts.onNext) opts.onNext(); },
    }));
    return actions;
  }

  function errorBox() {
    var box = layout.el("div", "auth-error", "");
    box.setAttribute("aria-live", "polite");
    return box;
  }

  function showError(box, msg) {
    box.textContent = msg;
    box.classList.add("is-visible");
  }

  function clearError(box) {
    box.textContent = "";
    box.classList.remove("is-visible");
  }

  function val(wrapper) {
    var input = wrapper.querySelector("input, select, textarea");
    return input ? input.value.trim() : "";
  }

  global.tm.wizard = {
    STEPS: STEPS,
    indexOf: indexOf,
    nextRoute: nextRoute,
    prevRoute: prevRoute,
    frame: frame,
    footer: footer,
    errorBox: errorBox,
    showError: showError,
    clearError: clearError,
    val: val,
  };
})(window);
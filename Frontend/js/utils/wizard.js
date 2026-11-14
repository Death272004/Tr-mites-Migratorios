/**
 * wizard.js — andamiaje del asistente de solicitud (P-07…P-17).
 * Ruta ↔ paso (tres pasos), encabezado con stepper y pie de navegación.
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

  // Las pantallas técnicas se agrupan en tres pasos para el ciudadano:
  //   1. Identidad e información   2. Trámite y documentación   3. Revisión y pago
  // Se conserva cada ruta para no alterar el borrador ni el API; `entry` es la
  // ruta canónica con la que se entra a cada paso.
  var PHASES = [
    {
      label: "Identidad e información",
      entry: "#/solicitud/paso-1",
      routes: ["#/solicitud/paso-1", "#/solicitud/paso-2", "#/solicitud/paso-3"],
    },
    {
      label: "Trámite y documentación",
      entry: "#/solicitud/tramite",
      routes: ["#/solicitud/tramite", "#/solicitud/titularidad", "#/solicitud/paso-4", "#/solicitud/paso-5", "#/solicitud/paso-6"],
    },
    {
      label: "Revisión y pago",
      entry: "#/solicitud/paso-7",
      routes: ["#/solicitud/paso-7", "#/solicitud/paso-8", "#/solicitud/resumen"],
    },
  ];

  var TITULARIDAD = "#/solicitud/titularidad";

  function indexOf(route) {
    for (var i = 0; i < STEPS.length; i++) {
      if (STEPS[i].route === route) return i;
    }
    return -1;
  }

  function phaseIndex(route) {
    for (var i = 0; i < PHASES.length; i++) {
      if (PHASES[i].routes.indexOf(route) !== -1) return i;
    }
    return 0;
  }

  // Navegación entre los tres pasos (no entre pantallas internas).
  function nextRoute(route) {
    var i = phaseIndex(route);
    if (i < PHASES.length - 1) return PHASES[i + 1].entry;
    return "#/solicitud/resumen";
  }

  function prevRoute(route) {
    var i = phaseIndex(route);
    if (i > 0) return PHASES[i - 1].entry;
    return "#/mis-tramites";
  }

  function frame(container, route) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    var i = phaseIndex(route);

    inner.appendChild(layout.pageHeader(
      "Nueva solicitud",
      "Complete la información correspondiente a " + PHASES[i].label.toLowerCase() + "."
    ));

    inner.appendChild(stepper({
      steps: PHASES.map(function (s) { return { label: s.label }; }),
      current: i,
      unit: "Paso",
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
    PHASES: PHASES,
    indexOf: indexOf,
    phaseIndex: phaseIndex,
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

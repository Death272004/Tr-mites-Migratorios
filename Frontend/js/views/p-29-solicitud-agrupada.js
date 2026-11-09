/**
 * P-29 — Flujo abreviado de solicitud.
 * Reúne las pantallas heredadas en cuatro etapas dobles sin cambiar su
 * validación, el esquema del borrador ni los contratos con el backend.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var button = global.tm.ui.button;
  var stepper = global.tm.ui.stepper;

  var GROUPS = {
    1: {
      title: "Trámite y representación",
      description: "Seleccione el trámite e indique quién presenta la solicitud.",
      modules: [
        { title: "Trámite solicitado", view: "p07", callback: "onContinue" },
        { title: "Titular y representación", view: "p08", callback: "onNavigate" },
      ],
      back: "#/mis-tramites",
      next: "#/solicitud/paso-1",
    },
    2: {
      title: "Identidad del solicitante",
      description: "Complete los datos personales y la información del pasaporte.",
      modules: [
        { title: "Datos personales", view: "p09", callback: "onNavigate" },
        { title: "Pasaporte e historial migratorio", view: "p10", callback: "onNavigate" },
      ],
      back: "#/solicitud/tramite",
      next: "#/solicitud/paso-3",
    },
    3: {
      title: "Información de contacto y situación",
      description: "Registre el domicilio y únicamente la información aplicable a su situación.",
      modules: [
        { title: "Domicilio y notificaciones", view: "p11", callback: "onNavigate" },
        { title: "Situación laboral, económica o familiar", view: "p12", callback: "onNavigate" },
      ],
      back: "#/solicitud/paso-1",
      next: "#/solicitud/paso-5",
    },
    4: {
      title: "Dependientes y documentos",
      description: "Agregue dependientes solo si corresponde y adjunte los requisitos del trámite.",
      modules: [
        { title: "Dependientes", view: "p13", callback: "onNavigate" },
        { title: "Requisitos y documentos", view: "p14", callback: "onNavigate" },
      ],
      back: "#/solicitud/paso-3",
      next: "#/solicitud/paso-7",
    },
  };

  function render(container, opts, groupNumber) {
    opts = opts || {};
    var group = GROUPS[groupNumber] || GROUPS[1];
    layout.clear(container);

    var inner = layout.el("div", "app-content__inner application-stage");
    inner.appendChild(layout.pageHeader(group.title, group.description));
    inner.appendChild(stepper({
      steps: global.tm.wizard.PHASES.map(function (phase) { return { label: phase.label }; }),
      current: groupNumber - 1,
    }));

    var context = global.tm.draft.getDraft();
    if (context && context.tramite) {
      inner.appendChild(layout.el("p", "wizard-summary application-stage__context", "Solicitud en curso · " + context.tramite));
    }

    var modules = layout.el("div", "application-stage__modules");
    var states = [];
    for (var i = 0; i < group.modules.length; i++) {
      states.push(addModule(modules, group.modules[i], i + 1));
    }
    inner.appendChild(modules);

    var status = layout.el("div", "auth-error application-stage__error", "");
    status.setAttribute("aria-live", "polite");
    inner.appendChild(status);

    var actions = layout.el("div", "auth-actions application-stage__actions");
    actions.appendChild(button({
      text: groupNumber === 1 ? "Cancelar" : "Volver",
      onClick: function () { if (opts.onNavigate) opts.onNavigate(group.back); },
    }));
    var continueButton = button({
      variant: "primary",
      text: groupNumber === 4 ? "Continuar al pago" : "Guardar y continuar",
      onClick: submitAll,
    });
    continueButton.disabled = true;
    actions.appendChild(continueButton);
    inner.appendChild(actions);
    container.appendChild(inner);

    var observer = new MutationObserver(checkReady);
    observer.observe(modules, { childList: true, subtree: true });
    checkReady();

    function addModule(parent, module, order) {
      var section = layout.el("section", "application-stage__module");
      section.appendChild(layout.el("div", "application-stage__module-number", String(order).padStart(2, "0")));
      section.appendChild(layout.el("h2", "application-stage__module-title", module.title));
      var host = layout.el("div", "application-stage__module-host");
      section.appendChild(host);
      parent.appendChild(section);

      var state = { host: host, module: module, success: null };
      var view = global.tm.views[module.view];
      var renderName = Object.keys(view || {}).filter(function (name) { return /^render/.test(name); })[0];
      var childOpts = {
        onBack: function () {},
        onContinue: function () { if (state.success) state.success(); },
        onNavigate: function () { if (state.success) state.success(); },
      };
      if (view && renderName) view[renderName](host, childOpts);
      return state;
    }

    function actionFor(state) {
      var groups = state.host.querySelectorAll(".auth-actions");
      if (!groups.length) return null;
      var buttons = groups[groups.length - 1].querySelectorAll("button");
      return buttons.length ? buttons[buttons.length - 1] : null;
    }

    function checkReady() {
      var ready = states.every(function (state) { return !!actionFor(state); });
      continueButton.disabled = !ready;
      modules.classList.toggle("is-ready", ready);
      if (ready && groupNumber === 1) syncRepresentation();
    }

    function submitAll() {
      status.textContent = "";
      status.classList.remove("is-visible");
      continueButton.disabled = true;
      continueButton.textContent = "Validando…";
      run(0);
    }

    function run(index) {
      if (index >= states.length) {
        observer.disconnect();
        if (opts.onNavigate) opts.onNavigate(group.next);
        return;
      }
      var state = states[index];
      var action = actionFor(state);
      if (!action) return fail("Espere a que termine de cargar la etapa.");

      var completed = false;
      state.success = function () {
        if (completed) return;
        completed = true;
        state.success = null;
        state.host.closest(".application-stage__module").classList.add("is-complete");
        if (groupNumber === 1 && index === 0) syncRepresentation();
        run(index + 1);
      };
      action.click();
      window.setTimeout(function () {
        if (!completed) {
          state.success = null;
          fail("Revise los campos señalados en «" + state.module.title + "».");
        }
      }, 1400);
    }

    function fail(message) {
      status.textContent = message;
      status.classList.add("is-visible");
      continueButton.disabled = false;
      continueButton.textContent = groupNumber === 4 ? "Continuar al pago" : "Guardar y continuar";
    }

    function syncRepresentation() {
      var presentante = (global.tm.draft.getDraft() || {}).presentante;
      var selected = states[0] && states[0].host.querySelector('input[name="presentante"]:checked');
      if (selected) presentante = selected.value;
      var condition = states[1] && states[1].host.querySelector("#condicion");
      if (!condition || !presentante) return;
      condition.value = presentante === "APODERADO" ? "APODERADO" : "TITULAR";
      condition.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p29 = { render: render };
})(window);

/**
 * P-29 — Asistente de solicitud en tres pasos.
 *   1. Identidad e información   2. Trámite y documentación   3. Revisión y pago
 * Reúne las pantallas heredadas (P-07…P-17) como módulos de cada paso sin
 * cambiar su validación, el esquema del borrador ni los contratos con el
 * backend. Los módulos que dependen del trámite (situación y documentos) se
 * pintan al elegirlo en el mismo paso. El paso 3 termina con el envío.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var button = global.tm.ui.button;
  var stepper = global.tm.ui.stepper;

  var GROUPS = {
    1: {
      title: "Identidad e información",
      description: "Complete sus datos generales, la información del pasaporte y dónde recibirá las notificaciones.",
      modules: [
        { title: "Datos personales", view: "p09" },
        { title: "Pasaporte e historial migratorio", view: "p10" },
        { title: "Domicilio y notificaciones", view: "p11" },
      ],
      back: "#/mis-tramites",
      backText: "Cancelar",
      next: "#/solicitud/tramite",
      nextText: "Guardar y continuar",
    },
    2: {
      title: "Trámite y documentación",
      description: "Elija el trámite, indique quién lo presenta y adjunte la documentación que le corresponde.",
      modules: [
        { title: "Trámite solicitado", view: "p07" },
        { title: "Titular y representación", view: "p08" },
        { title: "Información específica del trámite", view: "p12", needsTramite: true },
        { title: "Dependientes", view: "p13" },
        { title: "Documentación requerida", view: "p14", needsTramite: true },
      ],
      syncRepresentation: true,
      back: "#/solicitud/paso-1",
      next: "#/solicitud/paso-7",
      nextText: "Continuar a revisión y pago",
    },
    3: {
      title: "Revisión y pago",
      description: "Revise su solicitud, registre el pago y firme la declaración para enviarla.",
      modules: [
        { title: "Revisión de la solicitud", review: true },
        { title: "Pago", view: "p15" },
        { title: "Declaración y firma", view: "p16" },
      ],
      back: "#/solicitud/tramite",
      nextText: "Enviar solicitud",
      submit: true,
    },
  };

  function render(container, opts, groupNumber) {
    opts = opts || {};
    var group = GROUPS[groupNumber] || GROUPS[1];
    var draft = global.tm.draft;

    // Una solicitud ya enviada no se retoma: se empieza un borrador limpio.
    if (groupNumber === 1 && draft.getDraft().submitted) {
      draft.clearDraft();
      if (global.tm.docs) global.tm.docs.clear();
    }

    layout.clear(container);

    var inner = layout.el("div", "app-content__inner application-stage");
    inner.appendChild(layout.pageHeader(group.title, group.description));
    inner.appendChild(stepper({
      steps: global.tm.wizard.PHASES.map(function (phase) { return { label: phase.label }; }),
      current: groupNumber - 1,
      unit: "Paso",
    }));

    var context = draft.getDraft();
    if (context && context.tramite) {
      inner.appendChild(layout.el("p", "wizard-summary application-stage__context", "Solicitud en curso · " + context.tramite));
    }

    var modules = layout.el("div", "application-stage__modules");
    var states = [];
    for (var i = 0; i < group.modules.length; i++) {
      states.push(addModule(modules, group.modules[i], i + 1));
    }

    var sesion = global.tm.session && global.tm.session.getSession
      ? global.tm.session.getSession()
      : null;
    var usuario = sesion && sesion.datos && sesion.datos.usuario;
    var esPasante = !!(usuario && usuario.rol === "SOLICITANTE" && usuario.tipoSolicitante === "PASANTE_BUFETE");
    var datosCuenta = global.tm.autofill && global.tm.autofill.getAccountProfile
      ? global.tm.autofill.getAccountProfile()
      : null;
    var usarDatosCuenta = !!datosCuenta && !esPasante;

    // El pasante puede probar expedientes con una persona ficticia. Los demás
    // solicitantes usan primero los datos disponibles de su propia cuenta; al
    // pulsar Autollenar, los campos faltantes reciben valores de demostración.
    if (groupNumber === 1 && !esPasante && global.tm.autofill && global.tm.autofill.setProfile) {
      global.tm.autofill.setProfile("");
    }

    var demoControl = global.tm.autofill.createStageControl({
      chooseProfile: groupNumber === 1 && (!usuario || esPasante),
      accountProfile: usarDatosCuenta ? datosCuenta : null,
      // El autorrellenado siempre requiere pulsar el botón; no se ejecuta al abrir la pantalla.
      autoFillOnLoad: false,
      autoFillDelay: 900,
      root: function () { return modules; },
      // El paso 2 pinta módulos al elegir el trámite: se repite el relleno
      // cuando ya cargaron para completarlos también.
      passes: groupNumber === 2 ? [0, 140, 420, 1300, 1700] : null,
      isReady: isReady,
      onFilled: function () {
        if (group.syncRepresentation) syncRepresentation();
        checkReady();
      },
    });
    inner.appendChild(demoControl);
    inner.appendChild(modules);

    var status = layout.el("div", "auth-error application-stage__error", "");
    status.setAttribute("aria-live", "polite");
    inner.appendChild(status);

    var actions = layout.el("div", "auth-actions application-stage__actions");
    actions.appendChild(button({
      text: group.backText || "Volver",
      onClick: function () { if (opts.onNavigate) opts.onNavigate(group.back); },
    }));
    var continueButton = button({
      variant: "primary",
      text: group.nextText,
      onClick: submitAll,
    });
    continueButton.disabled = true;
    actions.appendChild(continueButton);
    inner.appendChild(actions);
    container.appendChild(inner);

    var observer = new MutationObserver(checkReady);
    observer.observe(modules, { childList: true, subtree: true });

    if (groupNumber === 2) watchTramite();
    checkReady();

    function addModule(parent, module, order) {
      var section = layout.el("section", "application-stage__module");
      section.appendChild(layout.el("div", "application-stage__module-number", String(order).padStart(2, "0")));
      section.appendChild(layout.el("h2", "application-stage__module-title", module.title));
      var host = layout.el("div", "application-stage__module-host");
      section.appendChild(host);
      parent.appendChild(section);

      var state = { host: host, module: module, success: null, pending: false, review: !!module.review };
      renderModule(state);
      return state;
    }

    function renderModule(state) {
      var module = state.module;
      layout.clear(state.host);
      state.host.closest(".application-stage__module").classList.remove("is-complete");

      if (module.review) { renderReview(state.host); return; }

      if (module.needsTramite && !draft.getDraft().tramite) {
        state.pending = true;
        state.host.appendChild(layout.el("p", "application-stage__placeholder",
          "Seleccione el trámite para ver esta sección."));
        return;
      }
      state.pending = false;

      var view = global.tm.views[module.view];
      var renderName = Object.keys(view || {}).filter(function (name) { return /^render/.test(name); })[0];
      var childOpts = {
        embedded: true,
        onBack: function () {},
        onContinue: function () { if (state.success) state.success(); },
        onNavigate: function () { if (state.success) state.success(); },
      };
      if (view && renderName) view[renderName](state.host, childOpts);
    }

    function renderReview(host) {
      var p17 = global.tm.views.p17;
      host.appendChild(layout.el("p", "application-stage__hint",
        "Verifique que la información sea correcta. Si necesita corregir algo, vuelva al paso correspondiente; sus datos y documentos se conservan."));
      if (p17 && p17.resumenCards) host.appendChild(p17.resumenCards(draft.getDraft()));
      var edit = layout.el("div", "application-stage__edit");
      edit.appendChild(button({ text: "Editar identidad e información", onClick: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/paso-1"); } }));
      edit.appendChild(button({ text: "Editar trámite y documentos", onClick: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/tramite"); } }));
      host.appendChild(edit);
    }

    // Al elegir categoría o trámite se actualiza el borrador y se repintan los
    // módulos que dependen de él (situación y documentación).
    function watchTramite() {
      var origin = states[0];
      var last = (draft.getDraft().categoria || "") + "|" + (draft.getDraft().tramite || "");
      origin.host.addEventListener("change", function (event) {
        var id = event.target && event.target.id;
        if (id !== "categoria" && id !== "tramite" && id !== "motivo" && id !== "paisOrigen" && id !== "presentante") return;
        var categoria = origin.host.querySelector("#categoria");
        var tramite = origin.host.querySelector("#tramite");
        var motivo = origin.host.querySelector("#motivo");
        var paisOrigen = origin.host.querySelector("#paisOrigen");
        var presentante = origin.host.querySelector('input[name="presentante"]:checked');
        var value = (categoria ? categoria.value : "") + "|" + (tramite ? tramite.value : "") + "|" + (motivo ? motivo.value : "");
        if (value === last && id !== "paisOrigen" && id !== "presentante") return;
        last = value;
        draft.mergeDraft({
          categoria: categoria ? categoria.value : "",
          tramite: tramite ? tramite.value : "",
          motivo: motivo ? motivo.value : "",
          paisOrigen: paisOrigen ? paisOrigen.value : "",
          presentante: presentante ? presentante.value : "",
        });
        if (id === "motivo" || id === "categoria" || id === "tramite") {
          states.forEach(function (state) { if (state.module.needsTramite) renderModule(state); });
        }
        checkReady();
      });
    }

    function actionFor(state) {
      var groups = state.host.querySelectorAll(".auth-actions");
      if (!groups.length) return null;
      var buttons = groups[groups.length - 1].querySelectorAll("button");
      return buttons.length ? buttons[buttons.length - 1] : null;
    }

    // Listo = terminó de cargar todo lo que ya se puede mostrar.
    function isReady() {
      return states.every(function (state) { return state.review || state.pending || !!actionFor(state); });
    }

    function checkReady() {
      var ready = isReady();
      if (!continueButton.dataset.busy) continueButton.disabled = !ready;
      modules.classList.toggle("is-ready", ready);
      if (demoControl && demoControl.updateAvailability) demoControl.updateAvailability();
      if (ready && group.syncRepresentation) syncRepresentation();
    }

    function submitAll() {
      status.textContent = "";
      status.classList.remove("is-visible");
      continueButton.dataset.busy = "1";
      continueButton.disabled = true;
      continueButton.textContent = "Validando…";
      run(0);
    }

    function restore() {
      delete continueButton.dataset.busy;
      continueButton.disabled = false;
      continueButton.textContent = group.nextText;
    }

    function run(index) {
      if (index >= states.length) { finish(); return; }
      var state = states[index];
      if (state.review) { run(index + 1); return; }
      if (state.pending) return fail("Seleccione el trámite para completar «" + state.module.title + "».", state);
      var action = actionFor(state);
      if (!action) return fail("Espere a que termine de cargar el paso.", state);

      var completed = false;
      state.success = function () {
        if (completed) return;
        completed = true;
        state.success = null;
        state.host.closest(".application-stage__module").classList.add("is-complete");
        if (group.syncRepresentation && index === 0) syncRepresentation();
        run(index + 1);
      };
      action.click();
      window.setTimeout(function () {
        if (!completed) {
          state.success = null;
          fail("Revise los campos señalados en «" + state.module.title + "».", state);
        }
      }, 1400);
    }

    function finish() {
      if (group.submit) {
        // Todos los módulos guardaron su parte: se confirma y envía la solicitud.
        var p17 = global.tm.views.p17;
        restore();
        if (p17 && p17.enviar) p17.enviar(container, opts, { onCancel: restore });
        return;
      }
      observer.disconnect();
      if (opts.onNavigate) opts.onNavigate(group.next);
    }

    function fail(message, state) {
      status.textContent = message;
      status.classList.add("is-visible");
      restore();
      if (state) {
        var section = state.host.closest(".application-stage__module");
        var visible = state.host.querySelector(".auth-error.is-visible");
        var target = visible || section;
        if (target && target.scrollIntoView) target.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }

    // «Por cuenta propia» fija al titular como presentante; «mediante apoderado»
    // solo propone APODERADO si aún no se eligió otra condición de representación.
    function syncRepresentation() {
      var presentante = (draft.getDraft() || {}).presentante;
      var selected = states[0] && states[0].host.querySelector('input[name="presentante"]:checked');
      if (selected) presentante = selected.value;
      var condition = states[1] && states[1].host.querySelector("#condicion");
      if (!condition || !presentante) return;
      var wanted = condition.value;
      if (presentante === "APODERADO") {
        if (wanted === "" || wanted === "TITULAR") wanted = "APODERADO";
      } else {
        wanted = "TITULAR";
      }
      if (condition.value === wanted) return;
      condition.value = wanted;
      condition.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p29 = { render: render, GROUPS: GROUPS };
})(window);

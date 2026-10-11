/**
 * P-11 Paso 3 — Domicilio y notificaciones.
 * Corregimiento en cascada (demo), comprobante de domicilio y datos de
 * notificación heredados de P-05.
 * 4 estados: carga, éxito, vacío, error.
 * Script clásico: expone `tm.views.p11.renderP11`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var wizard = global.tm.wizard;
  var draft = global.tm.draft;
  var data = global.tm.data;
  var fixtures = global.tm.fixtures;

  var ROUTE = "#/solicitud/paso-3";

  function byId(id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; }

  var FALLBACK_NOTIF = {
    correo: "cliente.demo@bufete.test",
    telefono: "+507 6000-0000",
  };

  function demoSelector(opts) {
    var wrap = layout.el("label", "toolbar__demo");
    wrap.appendChild(layout.el("span", null, "Vista (demo)"));
    var select = layout.el("select");
    var opciones = [
      { v: "carga", l: "Carga" },
      { v: "exito", l: "Éxito" },
      { v: "vacio", l: "Vacío" },
      { v: "error", l: "Error" },
    ];
    for (var i = 0; i < opciones.length; i++) {
      var o = layout.el("option", null, opciones[i].l);
      o.value = opciones[i].v;
      select.appendChild(o);
    }
    select.addEventListener("change", function () {
      if (opts.onDemoState) opts.onDemoState(select.value);
    });
    wrap.appendChild(select);
    return wrap;
  }

  function renderLoading(container) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Domicilio y notificaciones", "Cargando…"));
    var loading = layout.el("div", "app-loading");
    loading.appendChild(layout.el("span", "spinner"));
    loading.appendChild(layout.el("span", null, "Cargando…"));
    inner.appendChild(loading);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Domicilio y notificaciones", "No se pudo cargar la información"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "No pudimos cargar los datos de domicilio y notificaciones"));
    alert.appendChild(layout.el(
      "span",
      "app-alert__text",
      (opts && opts.mensaje) || "Ocurrió un problema temporal. Intente nuevamente."
    ));
    inner.appendChild(alert);
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    inner.appendChild(retry);
    container.appendChild(inner);
  }

  function renderContent(container, opts, escenario) {
    opts = opts || {};
    var body = wizard.frame(container, ROUTE);
    body.appendChild(demoSelector(opts));
    var d = draft.getDraft().domicilio || {};

    var fuente = (fixtures && fixtures.data("P-11", escenario)) || {};
    var notificaciones = fuente.notificaciones;
    if (notificaciones === undefined) notificaciones = FALLBACK_NOTIF;

    var grid = layout.el("div", "wizard-grid");
    grid.appendChild(field.fieldSelect({ id: "paisDomicilio", label: "País de domicilio", options: data.paisOptions("Seleccione…"), value: d.paisDomicilio, required: true }));
    grid.appendChild(field.fieldSelect({ id: "provincia", label: "Provincia", options: data.provinciaOptions("Seleccione…"), value: d.provincia, required: true }));
    grid.appendChild(field.fieldText({ id: "distrito", label: "Distrito", value: d.distrito, required: true }));
    grid.appendChild(field.fieldText({ id: "corregimiento", label: "Corregimiento", value: d.corregimiento, required: true }));
    grid.appendChild(field.fieldSelect({
      id: "tipoTenencia", label: "Tipo de tenencia",
      options: [{ value: "", label: "Seleccione…" }, { value: "PROPIA", label: "Propia" }, { value: "ALQUILER", label: "Alquiler" }, { value: "EMPLEADOR", label: "Con el empleador" }, { value: "FAMILIARES", label: "Familiares" }],
      value: d.tipoTenencia, required: true,
    }));
    body.appendChild(grid);

    var dirGrid = layout.el("div", "wizard-grid");
    var dir = field.fieldTextarea({ id: "direccionCompleta", label: "Dirección completa (calle, casa/apto, referencia)", value: d.direccionCompleta, required: true, rows: 3 });
    dirGrid.appendChild(dir);
    body.appendChild(dirGrid);

    var compGrid = layout.el("div", "wizard-grid");
    compGrid.appendChild(global.tm.ui.fileUpload({ id: "comprobante", label: "Comprobante de domicilio", accept: ".pdf,.jpg,.jpeg,.png", helpText: "Escritura, contrato de arrendamiento notariado, carta de responsabilidad notariada o certificación de juez de paz." }));
    compGrid.appendChild(field.fieldText({ id: "titularRecibo", label: "Titular del recibo de servicios públicos", value: d.titularRecibo }));
    compGrid.appendChild(field.fieldText({ id: "numeroRecibo", label: "Número de recibo de luz/agua/teléfono", value: d.numeroRecibo }));
    body.appendChild(compGrid);

    var notif = layout.el("fieldset", "wizard-section");
    notif.appendChild(layout.el("legend", "wizard-section-title", "Notificaciones"));
    var notifGrid = layout.el("div", "wizard-grid");
    notifGrid.appendChild(field.fieldText({ id: "direccionNotificacion", label: "Dirección de notificación (si difiere del domicilio)", value: d.direccionNotificacion }));
    notifGrid.appendChild(field.fieldText({ id: "correoNotificacion", label: "Correo de notificación", value: notificaciones ? notificaciones.correo : "", required: true, helpText: "Heredado de su perfil (P-05)." }));
    notifGrid.appendChild(field.fieldText({ id: "telefonoNotificacion", label: "Teléfono de notificación", value: notificaciones ? notificaciones.telefono : "", required: true, helpText: "Heredado de su perfil (P-05)." }));
    notif.appendChild(notifGrid);
    body.appendChild(notif);

    var err = wizard.errorBox();
    body.appendChild(err);

    body.appendChild(wizard.footer({
      onBack: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/paso-2"); },
      onNext: function () {
        wizard.clearError(err);
        if (!byId("paisDomicilio")) return wizard.showError(err, "Seleccione el país de domicilio.");
        if (!byId("provincia")) return wizard.showError(err, "Seleccione la provincia.");
        if (!byId("distrito")) return wizard.showError(err, "Ingrese el distrito.");
        if (!byId("corregimiento")) return wizard.showError(err, "Ingrese el corregimiento.");
        if (!byId("tipoTenencia")) return wizard.showError(err, "Seleccione el tipo de tenencia.");
        if (!byId("direccionCompleta")) return wizard.showError(err, "Ingrese la dirección completa.");
        if (!byId("correoNotificacion") || !byId("telefonoNotificacion")) return wizard.showError(err, "Complete los datos de notificación.");

        draft.mergeDraft({
          domicilio: {
            paisDomicilio: byId("paisDomicilio"),
            provincia: byId("provincia"),
            distrito: byId("distrito"),
            corregimiento: byId("corregimiento"),
            tipoTenencia: byId("tipoTenencia"),
            direccionCompleta: byId("direccionCompleta"),
            titularRecibo: byId("titularRecibo"),
            numeroRecibo: byId("numeroRecibo"),
            direccionNotificacion: byId("direccionNotificacion"),
            correoNotificacion: byId("correoNotificacion"),
            telefonoNotificacion: byId("telefonoNotificacion"),
          },
        });
        if (opts.onNavigate) opts.onNavigate(wizard.nextRoute(ROUTE));
      },
    }));
  }

  function renderP11(container, opts) {
    opts = opts || {};

    function show(state) {
      if (!state) state = "carga";
      if (fixtures) fixtures.setScenario(state);
      if (state === "carga") {
        renderLoading(container);
        setTimeout(function () { renderContent(container, opts, "exito"); }, 700);
        return;
      }
      if (state === "error") {
        renderError(container, {
          onRetry: function () { show("carga"); },
          mensaje: fixtures ? fixtures.message("P-11", "error", null) : null,
        });
        return;
      }
      if (state === "vacio") { renderContent(container, opts, "vacio"); return; }
      renderContent(container, opts, "exito");
    }

    opts.onDemoState = show;
    show("carga");
  }

  var button = global.tm.ui.button;
  global.tm.views = global.tm.views || {};
  global.tm.views.p11 = { renderP11: renderP11 };
})(window);

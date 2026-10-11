/**
 * P-16 Paso 8 — Declaración jurada y firma.
 * Declaración de veracidad, autorización de tratamiento de datos (Ley 81),
 * declaración de no impedimentos y renuncia a nacionalidad (naturalización).
 * Firma manuscrita digital sobre canvas (simulada) con nombre del firmante.
 * Script clásico: expone `tm.views.p16.renderP16`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var wizard = global.tm.wizard;
  var draft = global.tm.draft;
  var fixtures = global.tm.fixtures;

  var ROUTE = "#/solicitud/paso-8";

  function renderContent(container, opts) {
    var body = wizard.frame(container, ROUTE);
    body.appendChild(demoSelector(opts));
    var d = draft.getDraft();
    var decl = d.declaracion || {};

    var esNaturalizacion = (d.categoria === "NATURALIZACION") || /naturalizaci/i.test(d.tramite || "");

    var wrap = layout.el("div", "declaracion");
    var chkVeracidad = field.fieldCheckbox({ id: "veracidad", label: "Declaro que los datos y documentos aportados son veraces y completos.", checked: !!decl.veracidad });
    var chkLey81 = field.fieldCheckbox({
      id: "ley81",
      label: "Autorizo el tratamiento de mis datos personales (Ley 81 de 2019).",
      checked: !!decl.ley81,
      helpText: "Finalidad: tramitar la solicitud. Destinatarios: Tribunal Electoral, CSS, Registro Público y SNM. Conservación según normativa. Derechos ARCO disponibles en P-05.",
    });
    var chkImpedimentos = field.fieldCheckbox({ id: "impedimentos", label: "Declaro no tener impedimentos ni antecedentes que lo impidan.", checked: !!decl.impedimentos });
    wrap.appendChild(chkVeracidad);
    wrap.appendChild(chkLey81);
    wrap.appendChild(chkImpedimentos);

    var chkRenuncia = null;
    if (esNaturalizacion) {
      chkRenuncia = field.fieldCheckbox({ id: "renuncia", label: "Renuncio a mi nacionalidad anterior conforme al Art. 10 de la Constitución.", checked: !!decl.renuncia });
      wrap.appendChild(chkRenuncia);
    }
    body.appendChild(wrap);

    var grid = layout.el("div", "wizard-grid");
    grid.appendChild(field.fieldText({ id: "lugarFirma", label: "Lugar", value: decl.lugarFirma || "Ciudad de Panamá", required: true }));
    grid.appendChild(field.fieldDate({ id: "fechaFirma", label: "Fecha", value: decl.fechaFirma || new Date().toISOString().slice(0, 10), required: true }));
    grid.appendChild(field.fieldText({ id: "nombreFirmante", label: "Nombre del firmante", value: decl.nombreFirmante || (d.titularidad && d.titularidad.nombreTitular) || "", required: true, helpText: "Debe coincidir con el titular de P-08." }));
    body.appendChild(grid);

    var signWrap = layout.el("div", "wizard-grid");
    var signLabel = layout.el("p", "wizard-section-title", "Firma manuscrita digital o huella");
    signWrap.appendChild(signLabel);
    var pad = global.tm.ui.signaturePad({ helpText: "Firme dentro del recuadro. Se guarda con sello de tiempo (simulado)." });
    signWrap.appendChild(pad);
    body.appendChild(signWrap);

    var err = wizard.errorBox();
    body.appendChild(err);

    body.appendChild(wizard.footer({
      backText: "Volver",
      nextText: "Firmar y continuar",
      onBack: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/paso-7"); },
      onNext: function () {
        wizard.clearError(err);
        var box = document.getElementById("veracidad");
        var ley = document.getElementById("ley81");
        var imp = document.getElementById("impedimentos");
        if (!box || !box.checked) return wizard.showError(err, "Debe declarar la veracidad de los datos.");
        if (!ley || !ley.checked) return wizard.showError(err, "Debe autorizar el tratamiento de datos (Ley 81).");
        if (!imp || !imp.checked) return wizard.showError(err, "Debe declarar que no tiene impedimentos.");
        if (esNaturalizacion) {
          var ren = document.getElementById("renuncia");
          if (!ren || !ren.checked) return wizard.showError(err, "Debe firmar la renuncia a la nacionalidad anterior.");
        }
        if (!byId("nombreFirmante")) return wizard.showError(err, "Ingrese el nombre del firmante.");
        if (!pad.isDirty()) return wizard.showError(err, "Capture la firma manuscrita.");

        draft.mergeDraft({
          declaracion: {
            veracidad: box.checked,
            ley81: ley.checked,
            impedimentos: imp.checked,
            renuncia: esNaturalizacion ? !!(document.getElementById("renuncia") || {}).checked : undefined,
            lugarFirma: byId("lugarFirma"),
            fechaFirma: byId("fechaFirma"),
            nombreFirmante: byId("nombreFirmante"),
            firma: true,
          },
        });
        if (opts.onNavigate) opts.onNavigate(wizard.nextRoute(ROUTE));
      },
    }));
  }

  function byId(id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; }

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
    inner.appendChild(layout.pageHeader("Declaración y firma", "Cargando declaración…"));
    var loading = layout.el("div", "app-loading");
    loading.appendChild(layout.el("span", "spinner"));
    loading.appendChild(layout.el("span", null, "Cargando…"));
    inner.appendChild(loading);
    container.appendChild(inner);
  }

  function renderEmpty(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Declaración y firma", "Sin información por el momento"));
    var empty = layout.el("div", "app-empty");
    empty.appendChild(layout.el("p", null, "No hay información de la declaración por el momento."));
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(global.tm.ui.button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    empty.appendChild(retry);
    inner.appendChild(empty);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Declaración y firma", "No se pudo cargar la declaración"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "Declaración no disponible"));
    alert.appendChild(layout.el(
      "span",
      "app-alert__text",
      (opts && opts.mensaje) || "No pudimos cargar la declaración y firma. Intente nuevamente."
    ));
    inner.appendChild(alert);
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(global.tm.ui.button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    inner.appendChild(retry);
    container.appendChild(inner);
  }

  function renderP16(container, opts) {
    opts = opts || {};

    function show(state) {
      if (!state) state = "carga";
      if (fixtures) fixtures.setScenario(state);
      if (state === "carga") {
        renderLoading(container);
        setTimeout(function () { renderContent(container, opts); }, 700);
        return;
      }
      if (state === "error") {
        renderError(container, {
          onRetry: function () { show("carga"); },
          mensaje: fixtures ? fixtures.message("P-16", "error", null) : null,
        });
        return;
      }
      renderContent(container, opts);
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p16 = { renderP16: renderP16 };
})(window);
/**
 * P-12 Paso 4 — Situación laboral, económica o de vínculos.
 * Pantalla dinámica: el bloque se elige según el trámite de P-07.
 * Bloques: laboral, económico/inversión, educativo, actividad especial
 * y vínculos familiares.
 * 4 estados: carga, éxito, vacío, error.
 * Script clásico: expone `tm.views.p12.renderP12`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var wizard = global.tm.wizard;
  var draft = global.tm.draft;
  var data = global.tm.data;
  var fixtures = global.tm.fixtures;

  var ROUTE = "#/solicitud/paso-4";

  function byId(id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; }

  function pickBlock(draftData) {
    var t = (draftData.tramite || "").toLowerCase();
    var cat = draftData.categoria || "";
    if (/casado|familia|reagrupaci|dependiente|hijos/.test(t)) return "familia";
    if (/estudiante|investigador|docente|ciudad del saber|educati|fulbright|misionero/.test(t)) return "educativo";
    if (/inversi|dep[oó]sito|rentista|jubilado|forestal|remoto|comerciante|acciones|planilla/.test(t)) return "economico";
    if (/religios|deport|humanitar|prensa|artista|marino|espect[aá]culos/.test(t)) return "especial";
    if (cat === "RESIDENTE_PERMANENTE") return "economico";
    return "laboral";
  }

  // Respaldo inline; la fuente por defecto es el fixture P-12 (§2.5).
  var TITULOS = {
    laboral: "Bloque laboral / entidad contratante",
    economico: "Bloque económico / inversión",
    educativo: "Bloque educativo",
    especial: "Bloque de actividad especial",
    familia: "Bloque de vínculos familiares",
  };

  var OPCIONES = {
    tipoContrato: [
      { value: "INDEFINIDO", label: "Indefinido" },
      { value: "DEFINIDO", label: "Definido" },
      { value: "OBRA", label: "Por obra" },
    ],
    tipoInversion: [
      { value: "DPF", label: "Depósito a plazo fijo" },
      { value: "INMUEBLE", label: "Inmueble" },
      { value: "FORESTAL", label: "Inversión forestal" },
      { value: "MACRO", label: "Macro-empresa" },
      { value: "MIXTA", label: "Mixta" },
    ],
    nivel: [
      { value: "SUPERIOR", label: "Superior" },
      { value: "POSGRADO", label: "Posgrado" },
      { value: "TECNICO", label: "Técnico" },
      { value: "SECUNDARIA", label: "Secundaria" },
    ],
    parentesco: [
      { value: "CONYUGE", label: "Cónyuge" },
      { value: "HIJO", label: "Hijo(a)" },
      { value: "PADRE_MADRE", label: "Padre/Madre" },
      { value: "DEPENDIENTE", label: "Dependiente" },
    ],
  };

  function estadoActual() {
    return (fixtures && fixtures.scenario && fixtures.scenario()) || "exito";
  }

  function renderContent(container, opts) {
    var body = wizard.frame(container, ROUTE);
    body.appendChild(demoSelector(opts));

    var current = draft.getDraft();
    var d = current.situacion || {};

    var fuente = (fixtures && fixtures.data("P-12", estadoActual())) || {};
    var titulos = fuente.titulos || TITULOS;
    var opciones = fuente.opciones || OPCIONES;

    var block = pickBlock(current);
    var wrap = layout.el("div", "wizard-grid");
    var fields = [];

    function add(node, read) { wrap.appendChild(node); fields.push(read); }

    if (block === "laboral") {
      add(field.fieldText({ id: "empleador", label: "Empleador / entidad contratante", value: d.empleador, required: true }), function () { return byId("empleador"); });
      add(field.fieldText({ id: "ruc", label: "Número de RUC", value: d.ruc, required: true }), function () { return byId("ruc"); });
      add(field.fieldText({ id: "cargo", label: "Cargo y funciones", value: d.cargo, required: true }), function () { return byId("cargo"); });
      add(field.fieldDate({ id: "inicioLaboral", label: "Fecha de inicio", value: d.inicioLaboral, required: true }), function () { return byId("inicioLaboral"); });
      add(field.fieldSelect({
        id: "tipoContrato", label: "Tipo de contrato",
        options: [{ value: "", label: "Seleccione…" }].concat(opciones.tipoContrato),
        value: d.tipoContrato, required: true,
      }), function () { return byId("tipoContrato"); });
      add(field.fieldText({ id: "salario", label: "Salario mensual", value: d.salario, required: true }), function () { return byId("salario"); });
      add(field.fieldText({ id: "moneda", label: "Moneda", value: d.moneda || "USD (B/.)", required: true }), function () { return byId("moneda"); });
      add(field.fieldText({ id: "permisoTrabajo", label: "Número y vigencia del permiso de trabajo", value: d.permisoTrabajo, required: true }), function () { return byId("permisoTrabajo"); });
    } else if (block === "economico") {
      add(field.fieldSelect({
        id: "tipoInversion", label: "Tipo de inversión",
        options: [{ value: "", label: "Seleccione…" }].concat(opciones.tipoInversion),
        value: d.tipoInversion, required: true,
      }), function () { return byId("tipoInversion"); });
      add(field.fieldText({ id: "monto", label: "Monto invertido (B/.)", value: d.monto, required: true, helpText: "Validado contra el mínimo legal del permiso (p. ej. B/.300,000.00)." }), function () { return byId("monto"); });
      add(field.fieldSelect({ id: "banco", label: "Banco o entidad financiera", options: data.bancoOptions("Seleccione…"), value: d.banco, required: true }), function () { return byId("banco"); });
      add(field.fieldText({ id: "numCuenta", label: "Número de cuenta / certificado de plazo fijo", value: d.numCuenta, required: true }), function () { return byId("numCuenta"); });
      add(field.fieldText({ id: "finca", label: "Finca / registro de propiedad (número)", value: d.finca }), function () { return byId("finca"); });
      add(field.fieldText({ id: "sociedad", label: "Sociedad / razón social", value: d.sociedad }), function () { return byId("sociedad"); });
      add(field.fieldText({ id: "capital", label: "Capital social", value: d.capital }), function () { return byId("capital"); });
    } else if (block === "educativo") {
      add(field.fieldText({ id: "institucion", label: "Institución educativa", value: d.institucion, required: true }), function () { return byId("institucion"); });
      add(field.fieldSelect({
        id: "nivel", label: "Nivel y modalidad",
        options: [{ value: "", label: "Seleccione…" }].concat(opciones.nivel),
        value: d.nivel, required: true,
      }), function () { return byId("nivel"); });
      add(field.fieldText({ id: "carrera", label: "Carrera / programa y jornada", value: d.carrera, required: true, helpText: "Tiempo completo obligatorio." }), function () { return byId("carrera"); });
      add(field.fieldText({ id: "matricula", label: "Matrícula vigente", value: d.matricula, required: true }), function () { return byId("matricula"); });
      add(field.fieldText({ id: "beca", label: "Beca (entidad otorgante)", value: d.beca }), function () { return byId("beca"); });
    } else if (block === "familia") {
      add(field.fieldSelect({
        id: "parentesco", label: "Parentesco alegado",
        options: [{ value: "", label: "Seleccione…" }].concat(opciones.parentesco),
        value: d.parentesco, required: true,
      }), function () { return byId("parentesco"); });
      add(field.fieldText({ id: "nombrePariente", label: "Nombre del pariente", value: d.nombrePariente, required: true }), function () { return byId("nombrePariente"); });
      add(field.fieldText({ id: "cedulaPariente", label: "Número de cédula o carné del pariente", value: d.cedulaPariente, required: true }), function () { return byId("cedulaPariente"); });
      add(field.fieldText({ id: "hijosPanamenos", label: "Hijos panameños (cantidad y datos)", value: d.hijosPanamenos }), function () { return byId("hijosPanamenos"); });
    } else {
      add(field.fieldText({ id: "entidad", label: "Institución o entidad", value: d.entidad, required: true }), function () { return byId("entidad"); });
      add(field.fieldText({ id: "actividad", label: "Cargo o actividad", value: d.actividad, required: true }), function () { return byId("actividad"); });
      add(field.fieldDate({ id: "duracionDesde", label: "Duración autorizada — desde", value: d.duracionDesde, required: true }), function () { return byId("duracionDesde"); });
      add(field.fieldDate({ id: "duracionHasta", label: "Duración autorizada — hasta", value: d.duracionHasta, required: true }), function () { return byId("duracionHasta"); });
      add(field.fieldText({ id: "convenio", label: "Convenio con el Estado (si aplica)", value: d.convenio }), function () { return byId("convenio"); });
    }

    var note = layout.el("p", "wizard-summary", "Bloque mostrado: " + titulos[block] + " (según el trámite seleccionado en P-07).");
    body.appendChild(note);
    body.appendChild(wrap);

    var uploads = layout.el("div", "wizard-grid");
    uploads.appendChild(global.tm.ui.fileUpload({ id: "docSituacion", label: block === "laboral" ? "Paz y salvo de la empresa (renta) / ficha CSS" : "Documento de respaldo del bloque", accept: ".pdf,.jpg,.jpeg,.png" }));
    body.appendChild(uploads);

    var err = wizard.errorBox();
    body.appendChild(err);

    body.appendChild(wizard.footer({
      onBack: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/paso-3"); },
      onNext: function () {
        wizard.clearError(err);
        for (var i = 0; i < fields.length; i++) {
          if (!fields[i]()) return wizard.showError(err, "Complete los campos obligatorios del bloque.");
        }
        var snapshot = { bloque: block };
        var all = wrap.querySelectorAll("input, select, textarea");
        for (var j = 0; j < all.length; j++) {
          if (all[j].id) snapshot[all[j].id] = all[j].value;
        }
        draft.mergeDraft({ situacion: snapshot });
        if (opts.onNavigate) opts.onNavigate(wizard.nextRoute(ROUTE));
      },
    }));
  }

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
    inner.appendChild(layout.pageHeader("Nueva solicitud", "Cargando situación del trámite…"));
    var loading = layout.el("div", "app-loading");
    loading.appendChild(layout.el("span", "spinner"));
    loading.appendChild(layout.el("span", null, "Cargando configuración…"));
    inner.appendChild(loading);
    container.appendChild(inner);
  }

  function renderEmpty(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Nueva solicitud", "Sin bloques de situación"));
    var empty = layout.el("div", "app-empty");
    empty.appendChild(layout.el("p", null, "No hay bloques de situación configurados para este trámite."));
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    empty.appendChild(retry);
    inner.appendChild(empty);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Nueva solicitud", "No se pudo cargar la situación"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "No pudimos cargar la configuración de situación"));
    alert.appendChild(layout.el(
      "span",
      "app-alert__text",
      (opts && opts.mensaje) || "No pudimos cargar la configuración de situación de su trámite. Intente nuevamente."
    ));
    inner.appendChild(alert);
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    inner.appendChild(retry);
    container.appendChild(inner);
  }

  function renderP12(container, opts) {
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
          mensaje: fixtures ? fixtures.message("P-12", "error", null) : null,
        });
        return;
      }
      if (state === "vacio") { renderEmpty(container, { onRetry: function () { show("carga"); } }); return; }
      renderContent(container, opts);
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p12 = { renderP12: renderP12, pickBlock: pickBlock };
})(window);

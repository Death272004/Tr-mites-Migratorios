/**
 * P-07 — Nueva solicitud · selección de trámite.
 * Campos: categoría, trámite específico (filtrado), motivo, presentante
 * (cuenta propia o apoderado → deriva a P-08) y país de origen del trámite.
 * El trámite elegido determina el wizard, requisitos, tasas (P-15) y
 * verificaciones (I-07).
 * 4 estados: carga, éxito, vacío, error.
 * Script clásico: expone `tm.views.p07.renderP07`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;

  var DRAFT_KEY = "tm.solicitud.v1";

  var CATALOGO = [
    { value: "REGISTRO_EXTRANJERIA", label: "Registro de Extranjería", tramites: ["Registro inicial", "Actualización de datos", "Reinscripción"] },
    { value: "VISAS_NO_RESIDENTE", label: "Visas no residente", tramites: ["Visa de turista", "Visa de negocios", "Visa de estudiante", "Visa de religioso"] },
    { value: "RESIDENTE_TEMPORAL", label: "Residente temporal", tramites: ["Temporal por trabajo", "Temporal por inversión", "Temporal por familia", "Temporal por estudios"] },
    { value: "RESIDENTE_PERMANENTE", label: "Residente permanente", tramites: ["Permanente por inversión", "Permanente por familia", "Permanente por tiempo de residencia"] },
    { value: "PROCESOS_ESPECIALES", label: "Procesos especiales", tramites: ["Refugio", "Asilo", "Apátrida", "Protección temporal"] },
    { value: "CERTIFICACIONES", label: "Certificaciones", tramites: ["Certificado de residencia", "Certificado de movimiento migratorio", "Paz y salvo migratorio"] },
    { value: "NATURALIZACION", label: "Naturalización", tramites: ["Naturalización por residencia", "Naturalización por matrimonio", "Naturalización por méritos"] },
  ];

  var MOTIVOS = ["Trabajo", "Inversión", "Familia", "Estudios", "Religión", "Humanitario", "Otro"];

  function categorias() {
    return CATALOGO.map(function (c) { return { value: c.value, label: c.label }; });
  }

  function tramitesDe(categoriaValue) {
    var c = CATALOGO.filter(function (x) { return x.value === categoriaValue; })[0];
    return c ? c.tramites : [];
  }

  function saveDraft(datos) {
    try { global.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(datos)); } catch (e) { /* ignore */ }
  }

  function renderForm(container, opts) {
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Nueva solicitud", "Paso 1 de 11 · Seleccione el trámite a realizar"));

    if (opts.onDemoState) inner.appendChild(demoSelector(opts.onDemoState));

    var form = layout.el("form", "card");
    form.noValidate = true;

    var selectCat = field.fieldSelect({
      id: "categoria",
      label: "Categoría del trámite",
      options: [{ value: "", label: "Seleccione una categoría…" }].concat(categorias()),
      required: true,
    });
    form.appendChild(selectCat);

    var tramiteWrap = layout.el("div");
    form.appendChild(tramiteWrap);

    var selectMotivo = field.fieldSelect({
      id: "motivo",
      label: "Motivo de la solicitud",
      options: [{ value: "", label: "Seleccione un motivo…" }].concat(MOTIVOS.map(function (m) { return { value: m, label: m }; })),
      required: true,
    });
    form.appendChild(selectMotivo);

    var selectPais = field.fieldSelect({
      id: "paisOrigen",
      label: "País de origen del trámite",
      options: [
        { value: "", label: "Seleccione una opción…" },
        { value: "PA", label: "En Panamá" },
        { value: "EX", label: "En consulado en el exterior" },
      ],
      helpText: "Determina la oficina y el flujo de recepción del expediente.",
      required: true,
    });
    form.appendChild(selectPais);

    var radioField = layout.el("fieldset", "form-field");
    var legend = layout.el("legend", "form-field__label", "¿Presenta por cuenta propia o mediante apoderado?");
    radioField.appendChild(legend);
    var radioGroup = layout.el("div", "radio-group");
    var opciones = [
      { value: "CUENTA_PROPIA", label: "Por cuenta propia" },
      { value: "APODERADO", label: "Mediante apoderado (bufete)" },
    ];
    var radios = [];
    for (var i = 0; i < opciones.length; i++) {
      var o = opciones[i];
      var lbl = layout.el("label", "radio-option");
      var input = layout.el("input");
      input.type = "radio";
      input.name = "presentante";
      input.value = o.value;
      if (i === 0) input.checked = true;
      lbl.appendChild(input);
      lbl.appendChild(layout.el("span", null, o.label));
      radioGroup.appendChild(lbl);
      radios.push(input);
    }
    radioField.appendChild(radioGroup);
    radioField.appendChild(layout.el("span", "form-field__help", "Ambas opciones continúan en el paso de titularidad y representación."));
    form.appendChild(radioField);

    var errorBox = layout.el("div", "auth-error", "");
    errorBox.setAttribute("aria-live", "polite");
    form.appendChild(errorBox);

    var actions = layout.el("div", "auth-actions");
    var btnBack = button({ text: "Volver a mis trámites", onClick: function () { if (opts.onBack) opts.onBack(); } });
    var btnNext = button({ variant: "primary", text: "Continuar", type: "submit" });
    actions.appendChild(btnBack);
    actions.appendChild(btnNext);
    form.appendChild(actions);

    var catSelect = selectCat.querySelector("select");
    catSelect.addEventListener("change", function () {
      renderTramiteSelect(catSelect.value);
    });
    renderTramiteSelect("");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      clearError();
      var categoria = catSelect.value;
      var tramiteSelect = tramiteWrap.querySelector("select");
      var tramite = tramiteSelect ? tramiteSelect.value : "";
      var motivo = selectMotivo.querySelector("select").value;
      var paisOrigen = selectPais.querySelector("select").value;
      var presentante = radios.filter(function (r) { return r.checked; })[0];

      if (!categoria) return setError("Seleccione la categoría del trámite.");
      if (!tramite) return setError("Seleccione el trámite específico.");
      if (!motivo) return setError("Seleccione el motivo de la solicitud.");
      if (!paisOrigen) return setError("Seleccione el país de origen del trámite.");
      if (!presentante) return setError("Indique si presenta por cuenta propia o mediante apoderado.");

      var datos = {
        categoria: categoria,
        tramite: tramite,
        motivo: motivo,
        paisOrigen: paisOrigen,
        presentante: presentante.value,
      };
      saveDraft(datos);

      btnNext.disabled = true;
      btnNext.textContent = "Guardando…";
      setTimeout(function () {
        btnNext.disabled = false;
        btnNext.textContent = "Continuar";
        if (opts.onContinue) opts.onContinue(datos);
      }, 300);
    });

    function renderTramiteSelect(categoriaValue) {
      layout.clear(tramiteWrap);
      var previos = tramitesDe(categoriaValue);
      var options = [{ value: "", label: categoriaValue ? "Seleccione un trámite…" : "Elija primero una categoría" }];
      options = options.concat(previos.map(function (t) { return { value: t, label: t }; }));
      var sel = field.fieldSelect({
        id: "tramite",
        label: "Trámite específico",
        options: options,
        required: true,
        disabled: !categoriaValue,
        helpText: "La ficha de requisitos y tasas se define según el trámite.",
      });
      tramiteWrap.appendChild(sel);
    }

    function setError(msg) { errorBox.textContent = msg; errorBox.classList.add("is-visible"); }
    function clearError() { errorBox.textContent = ""; errorBox.classList.remove("is-visible"); }

    inner.appendChild(form);
    container.appendChild(inner);
  }

  function demoSelector(onDemoState) {
    var wrap = layout.el("label", "toolbar__demo");
    wrap.appendChild(layout.el("span", null, "Vista (demo)"));
    var select = layout.el("select");
    var opciones = [
      { v: "carga", l: "Carga" },
      { v: "exito", l: "Éxito" },
      { v: "error", l: "Error" },
    ];
    for (var i = 0; i < opciones.length; i++) {
      var o = layout.el("option", null, opciones[i].l);
      o.value = opciones[i].v;
      select.appendChild(o);
    }
    select.addEventListener("change", function () { onDemoState(select.value); });
    wrap.appendChild(select);
    return wrap;
  }

  function renderLoading(container) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Nueva solicitud", "Cargando catálogo de trámites…"));
    var loading = layout.el("div", "app-loading");
    loading.appendChild(layout.el("span", "spinner"));
    loading.appendChild(layout.el("span", null, "Cargando…"));
    inner.appendChild(loading);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Nueva solicitud", "No se pudo cargar el catálogo"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "Catálogo no disponible"));
    alert.appendChild(layout.el("span", "app-alert__text", "No pudimos cargar las categorías y trámites. Intente nuevamente."));
    inner.appendChild(alert);
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    inner.appendChild(retry);
    container.appendChild(inner);
  }

  function renderP07(container, opts) {
    opts = opts || {};

    function show(state) {
      if (state === "carga") {
        renderLoading(container);
        setTimeout(function () { renderForm(container, opts); }, 700);
        return;
      }
      if (state === "error") { renderError(container, { onRetry: function () { show("carga"); } }); return; }
      renderForm(container, opts);
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p07 = { renderP07: renderP07, CATALOGO: CATALOGO };
})(window);
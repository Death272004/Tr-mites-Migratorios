/**
 * P-07 — Nueva solicitud · selección de trámite con ficha de requisitos.
 * Campos: categoría, trámite específico (filtrado), motivo, presentante
 * (cuenta propia o apoderado → deriva a P-08) y país de origen del trámite.
 * Al elegir el trámite se carga su ficha de requisitos (sección 4 de la doc),
 * incluidos los requisitos comunes Art. 28 en permisos de residencia.
 * El trámite elegido determina el wizard, requisitos, tasas (P-15) y
 * verificaciones (I-07).
 * 4 estados: carga, éxito, error.
 * Script clásico: expone `tm.views.p07.renderP07`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;

  var DRAFT_KEY = "tm.solicitud.v1";

  var fixtures = global.tm.fixtures;
  var api = global.tm.api;

  // Fuentes desde el fixture P-07 (§2.5): con `file://` el envelope lo registran
  // los `.js` de js/fixtures/; al publicar el backend se sirve el mismo JSON de
  // la HU-08 sin reescribir la vista. `CATALOGO` se exporta para P-14.
  var BASE_P07 = (fixtures && fixtures.data("P-07", "exito")) || {};

  // Requisitos comunes del Art. 28 (aplican a todos los permisos de residencia).
  var REQUISITOS_ART_28 = BASE_P07.requisitosArt28 || [];

  // Catálogo alineado a la sección 4 de la doc. [A] = obtenible por
  // interoperabilidad en el futuro convenio.
  var CATALOGO = BASE_P07.catalogo || [];

  var MOTIVOS = BASE_P07.motivos || [];
  var PAISES_ORIGEN = BASE_P07.paises || [
    { value: "PA", label: "En Panamá" },
    { value: "EX", label: "En consulado en el exterior" },
  ];

  function catalogoDesdeApi(items) {
    return (items || []).map(function (item) {
      return {
        value: item.codigo,
        label: item.nombre,
        residencia: String(item.codigo || "").indexOf("RESIDENCIA_") === 0,
        tramites: [{
          nombre: item.nombre,
          req: (item.requisitos || []).map(function (r) { return r.nombre + (r.obligatorio ? "" : " (opcional)"); }),
        }],
      };
    });
  }

  function categorias() {
    return CATALOGO.map(function (c) { return { value: c.value, label: c.label }; });
  }

  function getCategoria(value) {
    return CATALOGO.filter(function (x) { return x.value === value; })[0] || null;
  }

  function getTramite(categoriaValue, nombre) {
    var c = getCategoria(categoriaValue);
    if (!c) return null;
    return c.tramites.filter(function (t) { return t.nombre === nombre; })[0] || null;
  }

  function saveDraft(datos) {
    try { global.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(datos)); } catch (e) { /* ignore */ }
  }

  function renderFicha(container, categoriaValue, tramiteNombre) {
    layout.clear(container);
    if (!tramiteNombre) return;

    var categoria = getCategoria(categoriaValue);
    var tramite = getTramite(categoriaValue, tramiteNombre);
    if (!categoria || !tramite) return;

    var card = layout.el("div", "card ficha");
    card.appendChild(layout.el("h3", "ficha__title", "Ficha de requisitos · " + tramite.nombre));

    var list = layout.el("ul", "ficha__list");
    for (var i = 0; i < tramite.req.length; i++) {
      var item = tramite.req[i];
      var esAuto = /\(A\)/.test(item);
      var li = layout.el("li", "ficha__item" + (esAuto ? " ficha__item--auto" : ""));
      li.appendChild(layout.el("span", "ficha__marker", esAuto ? "A" : ""));
      li.appendChild(layout.el("span", null, item.replace(/\s*\(A\)/, "")));
      if (esAuto) li.appendChild(layout.el("span", "ficha__tag", "verificado automáticamente (futuro)"));
      list.appendChild(li);
    }
    card.appendChild(list);

    if (categoria.residencia) {
      card.appendChild(layout.el("h4", "ficha__subtitle", "Requisitos comunes del Art. 28"));
      var list2 = layout.el("ul", "ficha__list");
      for (var j = 0; j < REQUISITOS_ART_28.length; j++) {
        var li2 = layout.el("li", "ficha__item");
        li2.appendChild(layout.el("span", "ficha__marker", ""));
        li2.appendChild(layout.el("span", null, REQUISITOS_ART_28[j]));
        list2.appendChild(li2);
      }
      card.appendChild(list2);
    }

    card.appendChild(layout.el(
      "p",
      "ficha__note",
      "Los requisitos marcados (A) podrían obtenerse por interoperabilidad y quedar sellados como verificados automáticamente; en el MVP el despacho lo registra en I-07. La carga de documentos se realiza en el paso 6 (P-14)."
    ));

    container.appendChild(card);
  }

  function renderForm(container, opts) {
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Nueva solicitud", "Paso 1 de 11 · Seleccione el trámite a realizar"));

    if (opts.onDemoState && (!api || !api.isOnline())) inner.appendChild(demoSelector(opts.onDemoState));

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

    var fichaWrap = layout.el("div");
    form.appendChild(fichaWrap);

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
      options: [{ value: "", label: "Seleccione una opción…" }].concat(PAISES_ORIGEN),
      helpText: "Determina la oficina y el flujo de recepción del expediente.",
      required: true,
    });
    form.appendChild(selectPais);

    var radioField = layout.el("fieldset", "form-field");
    radioField.appendChild(layout.el("legend", "form-field__label", "¿Presenta por cuenta propia o mediante apoderado?"));
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
    catSelect.addEventListener("change", function () { renderTramiteSelect(catSelect.value); });
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
      layout.clear(fichaWrap);
      var cat = getCategoria(categoriaValue);
      var options = [{ value: "", label: categoriaValue ? "Seleccione un trámite…" : "Elija primero una categoría" }];
      if (cat) options = options.concat(cat.tramites.map(function (t) { return { value: t.nombre, label: t.nombre }; }));
      var sel = field.fieldSelect({
        id: "tramite",
        label: "Trámite específico",
        options: options,
        required: true,
        disabled: !categoriaValue,
        helpText: "Al elegirlo se carga su ficha de requisitos.",
      });
      tramiteWrap.appendChild(sel);
      var select = sel.querySelector("select");
      select.addEventListener("change", function () { renderFicha(fichaWrap, categoriaValue, select.value); });
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
      { v: "vacio", l: "Vacío" },
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

  function renderEmpty(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Nueva solicitud", "Catálogo sin trámites"));
    var empty = layout.el("div", "app-empty");
    empty.appendChild(layout.el("p", null, "No hay trámites disponibles en el catálogo por el momento."));
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    empty.appendChild(retry);
    inner.appendChild(empty);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Nueva solicitud", "No se pudo cargar el catálogo"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "Catálogo no disponible"));
    alert.appendChild(layout.el(
      "span",
      "app-alert__text",
      (opts && opts.mensaje) || "No pudimos cargar las categorías y trámites. Intente nuevamente."
    ));
    inner.appendChild(alert);
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    inner.appendChild(retry);
    container.appendChild(inner);
  }

  function renderP07(container, opts) {
    opts = opts || {};

    if (api && api.isOnline()) {
      renderLoading(container);
      api.request("GET", "/catalogos/tipos-tramite", { pantalla: "P-07" }, function (err, items) {
        if (err) { renderError(container, { mensaje: err.mensajeUsuario, onRetry: function () { renderP07(container, opts); } }); return; }
        CATALOGO = catalogoDesdeApi(items);
        if (global.tm.views.p07) global.tm.views.p07.CATALOGO = CATALOGO;
        if (!CATALOGO.length) { renderEmpty(container, { onRetry: function () { renderP07(container, opts); } }); return; }
        renderForm(container, opts);
      });
      return;
    }

    function show(state) {
      if (!state) state = "carga";
      if (fixtures) fixtures.setScenario(state);
      if (state === "carga") {
        renderLoading(container);
        setTimeout(function () { renderForm(container, opts); }, 700);
        return;
      }
      if (state === "error") {
        renderError(container, {
          onRetry: function () { show("carga"); },
          mensaje: fixtures ? fixtures.message("P-07", "error", null) : null,
        });
        return;
      }
      if (state === "vacio") { renderEmpty(container, { onRetry: function () { show("carga"); } }); return; }
      renderForm(container, opts);
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p07 = { renderP07: renderP07, CATALOGO: CATALOGO, REQUISITOS_ART_28: REQUISITOS_ART_28 };
})(window);

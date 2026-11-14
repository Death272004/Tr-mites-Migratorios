/**
 * P-15 — Pago de tasas.
 * Muestra el estado de la solicitud, el desglose de tasas y permite declarar el
 * medio de pago utilizado (ventanilla, Yappy o tarjeta) y adjuntar el recibo
 * como prueba de pago. No hay pasarela: nunca se solicitan datos de tarjetas ni
 * de cuentas; el despacho verifica el comprobante al recibir la solicitud.
 * 4 estados: carga, éxito, vacío, error.
 * Script clásico: expone `tm.views.p15.renderP15`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var wizard = global.tm.wizard;
  var draft = global.tm.draft;
  var fixtures = global.tm.fixtures;
  var docs = global.tm.docs;

  var ROUTE = "#/solicitud/paso-7";
  var CLAVE_COMPROBANTE = "pago:comprobante";

  var METODOS = [
    {
      value: "VENTANILLA",
      label: "Ventanilla",
      ayuda: "Pago presencial en caja. Adjunte el recibo sellado que le entregaron.",
    },
    {
      value: "YAPPY",
      label: "Yappy",
      ayuda: "Adjunte la captura del comprobante de Yappy donde se vea el monto y la fecha.",
    },
    {
      value: "TARJETA",
      label: "Tarjeta de crédito o débito",
      ayuda: "Adjunte el comprobante de la transacción. No se solicitan los datos de su tarjeta.",
    },
    {
      value: "EXONERACION",
      label: "Exoneración",
      ayuda: "Si está exonerado del pago, adjunte la constancia o resolución que lo acredita.",
    },
  ];

  function byId(id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; }

  function estadoActual() {
    return (fixtures && fixtures.scenario && fixtures.scenario()) || "exito";
  }

  function metodoLabel(value) {
    for (var i = 0; i < METODOS.length; i++) if (METODOS[i].value === value) return METODOS[i].label;
    return "";
  }

  /** Estado del pago según el medio declarado y el comprobante adjunto. */
  function estadoPago(metodo, tieneComprobante) {
    if (!metodo) return { codigo: "PENDIENTE", texto: "Pendiente", detalle: "Indique el medio de pago que utilizó.", tono: "warning" };
    if (metodo === "EXONERACION") {
      return tieneComprobante
        ? { codigo: "EXONERACION_SOLICITADA", texto: "Exoneración solicitada", detalle: "Constancia adjunta; el despacho la validará.", tono: "info" }
        : { codigo: "EXONERACION_SIN_CONSTANCIA", texto: "Exoneración sin constancia", detalle: "Adjunte la constancia para agilizar la revisión.", tono: "warning" };
    }
    return tieneComprobante
      ? { codigo: "REPORTADO", texto: "Pago reportado", detalle: "Comprobante adjunto; pendiente de verificación por el despacho.", tono: "success" }
      : { codigo: "SIN_COMPROBANTE", texto: "Pago declarado sin comprobante", detalle: "Puede adjuntar el recibo como prueba de pago.", tono: "warning" };
  }

  function tasasDe(d) {
    var cat = d.categoria || "";
    var fuente = (fixtures && fixtures.data("P-15", estadoActual())) || {};
    if (fuente.tasas) {
      return fuente.tasas[cat] || fuente.tasas["default"] || [];
    }
    if (cat === "RESIDENTE_TEMPORAL" || cat === "RESIDENTE_PERMANENTE") {
      return [{ concepto: "Tesoro Nacional", monto: 250 }, { concepto: "Servicio Nacional de Migración (SNM)", monto: 800 }];
    }
    if (cat === "NATURALIZACION") {
      return [{ concepto: "Timbres — declaración jurada", monto: 8 }, { concepto: "Timbres — estatus", monto: 8 }, { concepto: "Timbres — carné E", monto: 2 }];
    }
    if (cat === "CERTIFICACIONES") return [{ concepto: "Certificación / estatus", monto: 10 }];
    if (cat === "REGISTRO_EXTRANJERIA") return [{ concepto: "Tiquete y tasa de filiación", monto: 5 }];
    if (cat === "PROCESOS_ESPECIALES") return [{ concepto: "Tasas y registro", monto: 10 }];
    return [{ concepto: "Tasa de visa", monto: 100 }, { concepto: "Depósito de garantía", monto: 500 }];
  }

  function money(n) { return "B/." + Number(n).toFixed(2); }

  function statusTile(titulo) {
    var tile = layout.el("div", "status-strip__item");
    tile.appendChild(layout.el("span", "status-strip__label", titulo));
    var value = layout.el("strong", "status-strip__value", "");
    var detail = layout.el("span", "status-strip__detail", "");
    tile.appendChild(value);
    tile.appendChild(detail);
    tile.set = function (texto, detalle, tono) {
      value.textContent = texto;
      detail.textContent = detalle || "";
      tile.className = "status-strip__item" + (tono ? " status-strip__item--" + tono : "");
    };
    return tile;
  }

  function renderContent(container, opts) {
    var body = wizard.frame(container, ROUTE);
    body.appendChild(demoSelector(opts));
    var d = draft.getDraft();
    var pagos = d.pagos || {};
    var requisitos = d.requisitos || {};

    var tasas = tasasDe(d);
    var total = tasas.reduce(function (s, t) { return s + t.monto; }, 0);

    // Estado de la solicitud: en qué punto está, sus documentos y el pago.
    var strip = layout.el("div", "status-strip");
    strip.setAttribute("role", "group");
    strip.setAttribute("aria-label", "Estado de la solicitud");
    var tileSolicitud = statusTile("Estado de la solicitud");
    var tileDocs = statusTile("Documentos");
    var tilePago = statusTile("Pago");
    tilePago.setAttribute("aria-live", "polite");
    strip.appendChild(tileSolicitud);
    strip.appendChild(tileDocs);
    strip.appendChild(tilePago);
    body.appendChild(strip);

    tileSolicitud.set("En preparación", "Aún no se ha enviado al despacho.", "info");
    var adjuntos = docs.list("requisitos").length;
    if (requisitos.prioritarios != null) {
      tileDocs.set(adjuntos + " adjunto(s)", requisitos.prioritarios + " prioritario(s) requeridos para este trámite.", "success");
    } else {
      tileDocs.set(adjuntos + " adjunto(s)", "Complete el paso «Trámite y documentación».", adjuntos ? "success" : "warning");
    }

    var rows = tasas.map(function (t) { return [{ text: t.concepto }, { text: money(t.monto), align: "right" }]; });
    rows.push([{ text: "Total a pagar" }, { text: money(total), align: "right" }]);
    body.appendChild(global.tm.ui.table({ headers: [{ label: "Concepto" }, { label: "Monto", align: "right" }], rows: rows }));

    var metodo = layout.el("fieldset", "form-field pay-method");
    metodo.appendChild(layout.el("legend", "form-field__label", "¿Por qué medio realizó el pago?"));
    var rg = layout.el("div", "radio-group pay-method__options");
    METODOS.forEach(function (m) {
      var lbl = layout.el("label", "radio-option pay-method__option");
      var input = layout.el("input");
      input.type = "radio"; input.name = "metodoPago"; input.value = m.value;
      if (pagos.modalidad === m.value) input.checked = true;
      lbl.appendChild(input);
      lbl.appendChild(layout.el("span", null, m.label));
      rg.appendChild(lbl);
    });
    metodo.appendChild(rg);
    var ayuda = layout.el("span", "form-field__help", "");
    metodo.appendChild(ayuda);
    body.appendChild(metodo);

    var grid = layout.el("div", "wizard-grid");
    grid.appendChild(field.fieldText({
      id: "referenciaPago", label: "Número de recibo o referencia", value: pagos.referencia || "",
      helpText: "Opcional. El número que aparece en su recibo o comprobante.",
    }));
    grid.appendChild(field.fieldDate({ id: "fechaPago", label: "Fecha del pago", value: pagos.fechaPago || "" }));
    body.appendChild(grid);

    var comprobante = docs.card({
      tag: "div",
      key: CLAVE_COMPROBANTE,
      grupo: "pago",
      label: "Recibo o comprobante de pago",
      tipoDocumental: "COMPROBANTE_PAGO",
      nota: "Adjúntelo como prueba de pago. Podrá verlo o descargarlo antes de enviar la solicitud.",
      onChange: refresh,
    });
    comprobante.classList.add("doc-card--receipt");
    body.appendChild(comprobante);

    var err = wizard.errorBox();
    body.appendChild(err);

    function metodoElegido() { return (rg.querySelector("input:checked") || {}).value || ""; }

    function refresh() {
      var m = metodoElegido();
      var estado = estadoPago(m, !!docs.get(CLAVE_COMPROBANTE));
      tilePago.set(estado.texto, (m ? metodoLabel(m) + " · " : "") + estado.detalle, estado.tono);
      var def = METODOS.filter(function (x) { return x.value === m; })[0];
      ayuda.textContent = def ? def.ayuda : "Seleccione una opción. No se realiza ningún cobro desde este portal.";
    }
    rg.addEventListener("change", function () { wizard.clearError(err); refresh(); });
    refresh();

    body.appendChild(wizard.footer({
      onBack: function () { if (opts.onNavigate) opts.onNavigate(wizard.prevRoute(ROUTE)); },
      onNext: function () {
        wizard.clearError(err);
        var m = metodoElegido();
        if (!m) return wizard.showError(err, "Indique por qué medio realizó el pago.");
        var entrada = docs.get(CLAVE_COMPROBANTE);
        var estado = estadoPago(m, !!entrada);
        draft.mergeDraft({
          pagos: {
            modalidad: m,
            metodo: metodoLabel(m),
            concepto: "TRAMITE",
            referencia: byId("referenciaPago"),
            fechaPago: byId("fechaPago"),
            total: total,
            comprobante: entrada ? { archivo: entrada.file.name, tamano: entrada.file.size } : null,
            estado: estado.codigo,
            estadoTexto: estado.texto,
            pagado: estado.codigo === "REPORTADO",
          },
        });
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
    inner.appendChild(layout.pageHeader("Nueva solicitud", "Cargando tasas y medios de pago…"));
    var loading = layout.el("div", "app-loading");
    loading.appendChild(layout.el("span", "spinner"));
    loading.appendChild(layout.el("span", null, "Cargando tasas…"));
    inner.appendChild(loading);
    container.appendChild(inner);
  }

  function renderEmpty(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Nueva solicitud", "Sin tasas disponibles"));
    var empty = layout.el("div", "app-empty");
    empty.appendChild(layout.el("p", null, "No hay tasas disponibles para este trámite."));
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    empty.appendChild(retry);
    inner.appendChild(empty);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Nueva solicitud", "No se pudieron cargar las tasas"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "No pudimos cargar las tasas y medios de pago"));
    alert.appendChild(layout.el(
      "span",
      "app-alert__text",
      (opts && opts.mensaje) || "No pudimos cargar las tasas y medios de pago. Intente nuevamente."
    ));
    inner.appendChild(alert);
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    inner.appendChild(retry);
    container.appendChild(inner);
  }

  function renderP15(container, opts) {
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
          mensaje: fixtures ? fixtures.message("P-15", "error", null) : null,
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
  global.tm.views.p15 = { renderP15: renderP15, estadoPago: estadoPago, METODOS: METODOS, CLAVE_COMPROBANTE: CLAVE_COMPROBANTE };
})(window);

/**
 * P-17 — Resumen y envío.
 * Muestra el resumen de P-08…P-15; al enviar genera número de expediente,
 * trámite, registro y QR (simulados) y fija el estado inicial
 * "RECIBIDO – EN PREPARACIÓN".
 * Script clásico: expone `tm.views.p17.renderP17`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var button = global.tm.ui.button;
  var draft = global.tm.draft;
  var confirmModal = global.tm.ui.confirmModal;
  var fixtures = global.tm.fixtures;

  var ROUTE = "#/solicitud/resumen";

  function fila(label, value) {
    var row = layout.el("div", "detail-row");
    row.appendChild(layout.el("span", "detail-row__label", label));
    row.appendChild(layout.el("span", "detail-row__value", value == null || value === "" ? "—" : String(value)));
    return row;
  }

  function resumenCard(titulo, filas) {
    var card = layout.el("div", "detail-card");
    var h = layout.el("div", "detail-row detail-row--head");
    h.appendChild(layout.el("span", "detail-row__label", titulo));
    card.appendChild(h);
    for (var i = 0; i < filas.length; i++) card.appendChild(fila(filas[i][0], filas[i][1]));
    return card;
  }

  function drawQR(canvas, seed) {
    var ctx = canvas.getContext("2d");
    var n = 21;
    var size = canvas.width;
    var cell = size / n;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#1f2733";
    var h = 0;
    for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    function rnd() { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; }
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n; x++) {
        var finder = (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
        var on;
        if (finder) {
          var fx = x < 7 ? x : x - (n - 7);
          var fy = y < 7 ? y : y - (n - 7);
          on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
        } else {
          on = rnd() > 0.5;
        }
        if (on) ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }

  function renderResult(container, submitted, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Solicitud enviada", "Estado inicial: RECIBIDO – EN PREPARACIÓN"));

    var toolbar = layout.el("div", "toolbar");
    toolbar.appendChild(demoSelector(opts));
    inner.appendChild(toolbar);

    var success = layout.el("div", "app-alert app-alert--info");
    success.appendChild(layout.el("span", "app-alert__title", "Su solicitud fue registrada (simulado)"));
    success.appendChild(layout.el("span", "app-alert__text", "Conserve el número de expediente y el código QR para el seguimiento."));
    inner.appendChild(success);

    var grid = layout.el("div", "wizard-grid");
    grid.appendChild(resumenCard("Identificación", [
      ["Número de expediente", submitted.expediente],
      ["Trámite", submitted.tramite],
      ["Registro", submitted.registro],
      ["Estado", "RECIBIDO – EN PREPARACIÓN"],
      ["Total pagado", submitted.total],
    ]));

    var qrCard = layout.el("div", "detail-card");
    qrCard.appendChild(layout.el("div", "detail-row detail-row--head"));
    var qrWrap = layout.el("div", "qr-box");
    var canvas = layout.el("canvas", "signature__canvas");
    canvas.width = 210; canvas.height = 210;
    canvas.style.width = "210px"; canvas.style.height = "210px";
    drawQR(canvas, submitted.expediente);
    qrWrap.appendChild(canvas);
    qrWrap.appendChild(layout.el("span", "detail-row__value", submitted.expediente));
    qrWrap.appendChild(layout.el("span", "form-field__help", "QR simulado de demostración"));
    qrCard.appendChild(qrWrap);
    grid.appendChild(qrCard);

    inner.appendChild(grid);

    var aviso = layout.el("p", "wizard-summary", "Aviso: «No se recibirán solicitudes incompletas.» Siguiente paso: reserva de cita (P-18) o espera de revisión.");
    inner.appendChild(aviso);

    var actions = layout.el("div", "auth-actions");
    actions.appendChild(button({ variant: "primary", text: "Reservar cita (P-18)", onClick: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/cita"); } }));
    actions.appendChild(button({ text: "Descargar comprobante", onClick: function () { window.print(); } }));
    actions.appendChild(button({ text: "Ir a mis trámites", onClick: function () { draft.clearDraft(); if (opts.onNavigate) opts.onNavigate("#/mis-tramites"); } }));
    inner.appendChild(actions);

    container.appendChild(inner);
  }

  function renderContent(container, opts) {
    var d = draft.getDraft();

    if (d.submitted) { renderResult(container, d.submitted, opts); return; }

    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Resumen y envío", "Revise la información antes de enviar"));

    var toolbar = layout.el("div", "toolbar");
    toolbar.appendChild(demoSelector(opts));
    inner.appendChild(toolbar);

    var dp = d.datosPersonales || {};
    var tit = d.titularidad || {};
    var pas = d.pasaporte || {};
    var dom = d.domicilio || {};
    var pagos = d.pagos || {};

    var grid = layout.el("div", "wizard-grid");
    grid.appendChild(resumenCard("Trámite", [["Categoría", d.categoria], ["Trámite", d.tramite], ["Motivo", d.motivo], ["País de origen", d.paisOrigen]]));
    grid.appendChild(resumenCard("Solicitante", [["Nombre", [dp.nombres, dp.primerApellido, dp.segundoApellido].filter(Boolean).join(" ") || tit.nombreTitular], ["Nacionalidad", dp.nacionalidad], ["Estado civil", dp.estadoCivil]]));
    grid.appendChild(resumenCard("Pasaporte", [["Número", pas.numPasaporte], ["País emisor", pas.paisEmisor], ["Vencimiento", pas.fechaVencimiento], ["Sello de ingreso", pas.selloFecha]]));
    grid.appendChild(resumenCard("Domicilio", [["Provincia", dom.provincia], ["Dirección", dom.direccionCompleta], ["Correo notificación", dom.correoNotificacion]]));
    grid.appendChild(resumenCard("Requisitos", [["Total", d.requisitos ? (d.requisitos.total || "—") : "Pendiente"], ["Automáticos [A]", d.requisitos ? d.requisitos.automaticos : "—"], ["Requisitos de P-14", d.requisitos ? "Cumplidos" : "Pendiente"]]));
    grid.appendChild(resumenCard("Pago", [["Modalidad", pagos.modalidad], ["Total", pagos.total != null ? ("B/." + Number(pagos.total).toFixed(2)) : "—"], ["Pagado", pagos.pagado ? "Sí (simulado)" : "No"]]));
    inner.appendChild(grid);

    var aviso = layout.el("p", "wizard-summary", "Aviso: «No se recibirán solicitudes incompletas.»");
    inner.appendChild(aviso);

    var actions = layout.el("div", "auth-actions");
    actions.appendChild(button({ text: "Volver al asistente", onClick: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/paso-8"); } }));
    actions.appendChild(button({
      variant: "primary",
      text: "Enviar solicitud",
      onClick: function () {
        confirmModal("Enviar solicitud", "¿Confirma el envío de su solicitud? Se generará el número de expediente.", {
          onConfirm: function () {
            var expediente = "EXP-2026-" + String(Math.floor(100000 + Math.random() * 899999));
            var registro = "REG-" + String(Math.floor(1000 + Math.random() * 8999));
            draft.mergeDraft({
              submitted: {
                expediente: expediente,
                registro: registro,
                tramite: d.tramite || "—",
                total: pagos.total != null ? ("B/." + Number(pagos.total).toFixed(2)) : "B/.0.00",
              },
            });
            if (opts.onNavigate) opts.onNavigate(ROUTE);
          },
        });
      },
    }));
    inner.appendChild(actions);

    container.appendChild(inner);
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
    inner.appendChild(layout.pageHeader("Resumen y envío", "Cargando resumen…"));
    var loading = layout.el("div", "app-loading");
    loading.appendChild(layout.el("span", "spinner"));
    loading.appendChild(layout.el("span", null, "Cargando…"));
    inner.appendChild(loading);
    container.appendChild(inner);
  }

  function renderEmpty(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Resumen y envío", "Sin información por el momento"));
    var empty = layout.el("div", "app-empty");
    empty.appendChild(layout.el("p", null, "No hay información de su solicitud por el momento."));
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    empty.appendChild(retry);
    inner.appendChild(empty);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Resumen y envío", "No se pudo cargar el resumen"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "Resumen no disponible"));
    alert.appendChild(layout.el(
      "span",
      "app-alert__text",
      (opts && opts.mensaje) || "No pudimos cargar el resumen de su solicitud. Intente nuevamente."
    ));
    inner.appendChild(alert);
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    inner.appendChild(retry);
    container.appendChild(inner);
  }

  function renderP17(container, opts) {
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
          mensaje: fixtures ? fixtures.message("P-17", "error", null) : null,
        });
        return;
      }
      renderContent(container, opts);
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p17 = { renderP17: renderP17 };
})(window);
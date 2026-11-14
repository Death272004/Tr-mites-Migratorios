/**
 * P-17 — Revisión y envío.
 * Aporta al paso «Revisión y pago» las tarjetas de revisión (`resumenCards`) y
 * el envío de la solicitud (`enviar`), que registra el expediente completo en el
 * backend y carga los documentos adjuntos. Como pantalla propia muestra el
 * resultado del envío. El QR solo existe en el modo de demostración sin conexión.
 * Script clásico: expone `tm.views.p17`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var button = global.tm.ui.button;
  var draft = global.tm.draft;
  var confirmModal = global.tm.ui.confirmModal;
  var fixtures = global.tm.fixtures;
  var api = global.tm.api;

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
    inner.appendChild(layout.pageHeader("Solicitud enviada", "Estado inicial: " + (submitted.simulado ? "RECIBIDO – EN PREPARACIÓN" : "RECIBIDO")));

    var toolbar = layout.el("div", "toolbar");
    if (!api || !api.isOnline()) toolbar.appendChild(demoSelector(opts));
    inner.appendChild(toolbar);

    var success = layout.el("div", "app-alert app-alert--info");
    success.appendChild(layout.el("span", "app-alert__title", submitted.simulado ? "Su solicitud fue registrada (simulado)" : "Su solicitud fue registrada"));
    success.appendChild(layout.el("span", "app-alert__text", submitted.simulado
      ? "Conserve el número de expediente y el código QR para el seguimiento."
      : "Conserve el número de expediente para consultar el seguimiento."));
    inner.appendChild(success);

    if (submitted.documentosPendientes) {
      var uploadAlert = layout.el("div", "app-alert app-alert--warning");
      uploadAlert.appendChild(layout.el("span", "app-alert__title", "Solicitud registrada con documentos pendientes"));
      uploadAlert.appendChild(layout.el("span", "app-alert__text", "El expediente se creó, pero " + submitted.documentosPendientes + " documento(s) no pudieron cargarse. Preséntelos al despacho o adjúntelos al atender una observación."));
      inner.appendChild(uploadAlert);
    }

    var grid = layout.el("div", "wizard-grid");
    grid.appendChild(resumenCard("Identificación", [
      ["Número de expediente", submitted.expediente],
      ["Trámite", submitted.tramite],
      ["Registro", submitted.registro],
      ["Estado", submitted.simulado ? "RECIBIDO – EN PREPARACIÓN" : "RECIBIDO"],
      ["Monto de tasas", submitted.total],
      ["Medio de pago", submitted.metodoPago],
      ["Estado del pago", submitted.estadoPago],
    ]));

    if (submitted.simulado) {
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
    }

    inner.appendChild(grid);

    var aviso = layout.el("p", "wizard-summary", "Siguiente paso: reserve su cita o espere la revisión del despacho. Puede consultar el avance en «Mis trámites».");
    inner.appendChild(aviso);

    var actions = layout.el("div", "auth-actions");
    actions.appendChild(button({ variant: "primary", text: "Reservar cita", onClick: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/cita"); } }));
    actions.appendChild(button({ text: "Descargar comprobante", onClick: function () { window.print(); } }));
    actions.appendChild(button({ text: "Ir a mis trámites", onClick: function () { draft.clearDraft(); if (global.tm.docs) global.tm.docs.clear(); if (opts.onNavigate) opts.onNavigate("#/mis-tramites"); } }));
    inner.appendChild(actions);

    container.appendChild(inner);
  }

  function datosSolicitud(d) {
    var secciones = {
      categoria: d.categoria || null,
      tramite: d.tramite || null,
      motivo: d.motivo || null,
      paisOrigen: d.paisOrigen || null,
      titularidad: d.titularidad || {},
      datosPersonales: d.datosPersonales || {},
      pasaporte: d.pasaporte || {},
      domicilio: d.domicilio || {},
      situacion: d.situacion || {},
      dependientes: d.dependientes || [],
      requisitos: d.requisitos || {},
      pagos: d.pagos || {},
      declaracion: d.declaracion || {},
    };
    // Fuerza un objeto JSON puro y evita conservar referencias o archivos.
    return JSON.parse(JSON.stringify(secciones));
  }

  /** Tarjetas de revisión de los pasos 1 y 2 (el pago se revisa en su propio módulo). */
  function resumenCards(d) {
    d = d || draft.getDraft();
    var dp = d.datosPersonales || {};
    var tit = d.titularidad || {};
    var pas = d.pasaporte || {};
    var dom = d.domicilio || {};
    var req = d.requisitos || {};
    var adjuntos = global.tm.docs ? global.tm.docs.list("requisitos") : [];

    var grid = layout.el("div", "wizard-grid review-grid");
    grid.appendChild(resumenCard("Solicitante", [
      ["Nombre", [dp.nombres, dp.primerApellido, dp.segundoApellido].filter(Boolean).join(" ") || tit.nombreTitular],
      ["Nacionalidad", dp.nacionalidad],
      ["Estado civil", dp.estadoCivil],
    ]));
    grid.appendChild(resumenCard("Pasaporte", [["Número", pas.numPasaporte], ["País emisor", pas.paisEmisor], ["Vencimiento", pas.fechaVencimiento], ["Sello de ingreso", pas.selloFecha],
      ["Entradas y salidas", (pas.historial || []).length + (pas.historialFuente === "SNM" ? " (obtenidas del SNM)" : " declaradas con comprobante")]]));
    grid.appendChild(resumenCard("Domicilio", [["Provincia", dom.provincia], ["Dirección", dom.direccionCompleta], ["Correo de notificación", dom.correoNotificacion]]));
    grid.appendChild(resumenCard("Trámite", [["Categoría", d.categoria], ["Trámite", d.tramite], ["Motivo", d.motivo], ["Presenta", d.presentante === "APODERADO" ? "Mediante apoderado" : (d.presentante ? "Por cuenta propia" : "")]]));

    var docsCard = resumenCard("Documentos", [
      ["Adjuntos", adjuntos.length + " archivo(s)"],
      ["Prioritarios requeridos", req.prioritarios != null ? req.prioritarios : "—"],
      ["Verificación automática", req.automaticos != null ? req.automaticos : "—"],
    ]);
    if (adjuntos.length) {
      var lista = layout.el("ul", "review-docs");
      adjuntos.forEach(function (e) {
        var li = layout.el("li", "review-docs__item");
        li.appendChild(layout.el("span", "review-docs__name", e.label));
        var ver = layout.el("button", "btn review-docs__view", "Ver");
        ver.type = "button";
        ver.setAttribute("aria-label", "Vista previa de " + e.label);
        ver.addEventListener("click", function () { global.tm.docs.preview(e); });
        li.appendChild(ver);
        lista.appendChild(li);
      });
      docsCard.appendChild(lista);
    }
    grid.appendChild(docsCard);
    return grid;
  }

  /**
   * Envía la solicitud (previa confirmación): crea el expediente y carga los
   * documentos adjuntos. `hooks.onCancel` avisa si el usuario no confirma.
   */
  function enviar(container, opts, hooks) {
    opts = opts || {};
    hooks = hooks || {};
    var d = draft.getDraft();
    var pagos = d.pagos || {};
    var totalTexto = pagos.total != null ? ("B/." + Number(pagos.total).toFixed(2)) : "B/.0.00";

    function guardarResultado(resultado) {
      resultado.metodoPago = pagos.metodo || "—";
      resultado.estadoPago = pagos.estadoTexto || "—";
      draft.mergeDraft({ submitted: resultado });
      if (global.tm.expediente) global.tm.expediente.setSelected(resultado);
      if (opts.onNavigate) opts.onNavigate(ROUTE);
    }

    function cargarDocumentos(id, documentos, index, pendientes, base) {
      if (!documentos || index >= documentos.length) {
        base.documentosPendientes = pendientes.length ? pendientes.length : null;
        guardarResultado(base);
        return;
      }
      var documento = documentos[index];
      if (!documento || !documento.file) {
        cargarDocumentos(id, documentos, index + 1, pendientes, base);
        return;
      }
      var formData = new FormData();
      formData.append("archivo", documento.file, documento.file.name);
      formData.append("tipoDocumental", documento.tipoDocumental || "Documento de trámite");
      api.request("POST", "/expedientes/" + encodeURIComponent(id) + "/documentos", { body: formData }, function (uploadErr) {
        if (uploadErr) pendientes.push(documento);
        cargarDocumentos(id, documentos, index + 1, pendientes, base);
      });
    }

    function crearLocal() {
      var expediente = "EXP-2026-" + String(Math.floor(100000 + Math.random() * 899999));
      var registro = "REG-" + String(Math.floor(1000 + Math.random() * 8999));
      guardarResultado({ expediente: expediente, registro: registro, tramite: d.tramite || "—", total: totalTexto, simulado: true });
    }

    confirmModal("Enviar solicitud", "¿Confirma el envío de su solicitud? Se generará el número de expediente.", {
      confirmText: "Enviar solicitud",
      onCancel: function () { if (hooks.onCancel) hooks.onCancel(); },
      onConfirm: function () {
        if (!api || !api.isOnline()) { crearLocal(); return; }

        api.request("POST", "/expedientes", {
          body: {
            tipoTramite: d.categoria || d.tramite || "",
            datosSolicitud: datosSolicitud(d),
          },
        }, function (createErr, dto) {
          if (createErr || !dto || !dto.id) {
            renderError(container, {
              mensaje: createErr ? createErr.mensajeUsuario : "El backend no devolvió el expediente creado.",
              onRetry: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/paso-7"); },
            });
            return;
          }
          var documentos = global.tm.docs ? global.tm.docs.pending() : [];
          cargarDocumentos(dto.id, documentos, 0, [], {
            id: dto.id,
            expediente: dto.numero || dto.id,
            registro: dto.id,
            tramite: d.tramite || "—",
            total: totalTexto,
          });
        });
      },
    });
  }

  function renderContent(container, opts) {
    var d = draft.getDraft();
    if (d.submitted) { renderResult(container, d.submitted, opts); return; }
    // Sin envío previo, la revisión vive en el paso «Revisión y pago».
    if (opts.onNavigate) opts.onNavigate("#/solicitud/paso-7");
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
  global.tm.views.p17 = { renderP17: renderP17, resumenCards: resumenCards, enviar: enviar };
})(window);

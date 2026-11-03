/**
 * P-22 — Resultados: resoluciones, carné digital y certificados.
 * Entrega al cliente los resultados del expediente (resolución, carné digital
 * con QR y constancia de permiso) y, si la resolución es NEGADA, los motivos y
 * la vía de impugnación. Descargas simuladas y auditadas (CP-12).
 * 5 vistas demo: carga, aprobada, negada, vacío, error (fixture de la fuente).
 * Script clásico: expone `tm.views.p22.renderP22`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var button = global.tm.ui.button;

  var DEMO_APROBADA = {
    expediente: "EXP-2026-000047",
    tramite: "Registro de Extranjería",
    resolucion: { numero: "RES-2026-00187", fecha: "2026-05-10", estado: "APROBADA" },
    permiso: { estado: "VIGENTE", tono: "success", tipo: "Residente permanente", fechaLimite: "2027-05-15", diasParaVencer: 216 },
    carne: { codigo: "CARNE-E-8-712-3456", vigencia: "2027-05-15" },
    constancia: { numero: "CONST-2026-00047", fecha: "2026-05-15" },
    etapas: { notificado: "2026-05-12", entregado: "2026-05-15" },
  };

  var DEMO_NEGADA = {
    expediente: "EXP-2026-000159",
    tramite: "Visas no residente",
    resolucion: { numero: "RES-2026-00201", fecha: "2026-09-30", estado: "NEGADA" },
    permiso: null,
    motivos: "No se acreditó el domicilio declarado ni el vínculo laboral requerido para la categoría solicitada.",
    impugnacion: "Puede interponer recurso de reconsideración y, en subsidio, apelación ante el Director General, dentro de los 5 días hábiles siguientes a la notificación.",
    etapas: { notificado: "2026-10-02", entregado: null },
  };

  function fmtFecha(iso) {
    if (!iso) return "—";
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function badge(text, tone) {
    return layout.el("span", "badge badge--" + (tone || "info"), text);
  }

  function descargar(nombre, contenido) {
    try {
      var blob = new Blob([contenido || ("Documento simulado (demostración): " + nombre)], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = nombre;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    } catch (e) {
      window.alert("Descarga simulada (demostración): " + nombre);
    }
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
        } else { on = rnd() > 0.5; }
        if (on) ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }

  function docCard(titulo, metaText) {
    var card = layout.el("section", "resultado-doc");
    var head = layout.el("div", "resultado-doc__head");
    head.appendChild(layout.el("h2", "resultado-doc__title", titulo));
    if (metaText) head.appendChild(layout.el("span", "resultado-doc__meta", metaText));
    card.appendChild(head);
    return card;
  }

  function fila(label, value) {
    var row = layout.el("div", "detail-row");
    row.appendChild(layout.el("span", "detail-row__label", label));
    var val = layout.el("span", "detail-row__value");
    if (value == null || value === "") val.textContent = "—";
    else if (typeof value === "string" || typeof value === "number") val.textContent = String(value);
    else val.appendChild(value);
    row.appendChild(val);
    return row;
  }

  function renderContent(container, opts, data) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    var negada = data.resolucion.estado === "NEGADA";

    inner.appendChild(layout.pageHeader(
      "Resultados del trámite",
      data.tramite + " · Expediente " + data.expediente
    ));

    var toolbar = layout.el("div", "toolbar");
    toolbar.appendChild(layout.el("span", null, negada ? "Resolución: NEGADA" : "Resolución: APROBADA"));
    toolbar.appendChild(demoSelector(opts));
    inner.appendChild(toolbar);

    var aviso = layout.el("div", "app-alert app-alert--info");
    aviso.appendChild(layout.el("span", "app-alert__title", "Descargas auditadas"));
    aviso.appendChild(layout.el("span", "app-alert__text", "Las descargas están disponibles solo para su sesión autenticada y quedan registradas (CP-12). No hay enlaces públicos."));
    inner.appendChild(aviso);

    var grid = layout.el("div", "wizard-grid");

    // Resolución
    var resol = docCard("Resolución", data.resolucion.numero);
    var resolCard = layout.el("div", "detail-card");
    resolCard.appendChild(fila("Número", data.resolucion.numero));
    resolCard.appendChild(fila("Fecha", fmtFecha(data.resolucion.fecha)));
    resolCard.appendChild(fila("Sentido", badge(data.resolucion.estado, negada ? "danger" : "success")));
    resol.appendChild(resolCard);
    var resolActions = layout.el("div", "resultado-doc__actions");
    resolActions.appendChild(button({ text: "Descargar resolución (PDF)", onClick: function () { descargar("resolucion-" + data.resolucion.numero + ".pdf"); } }));
    resol.appendChild(resolActions);
    grid.appendChild(resol);

    if (!negada && data.permiso) {
      // Estado del permiso
      var perm = docCard("Estado del permiso", "Origen [S] · expediente");
      var permAlert = layout.el("div", "app-alert app-alert--" + (data.permiso.tono === "danger" ? "warning" : "info"));
      permAlert.appendChild(layout.el("span", "app-alert__title", "Permiso: " + data.permiso.estado));
      permAlert.appendChild(layout.el("span", "app-alert__text", data.permiso.tipo + (data.permiso.fechaLimite ? " · vence el " + fmtFecha(data.permiso.fechaLimite) : "")));
      perm.appendChild(permAlert);
      if (data.permiso.diasParaVencer != null && data.permiso.diasParaVencer <= 90) {
        perm.appendChild(layout.el("p", "resultado-doc__meta", "Recordatorio: la fecha límite de prórroga o renovación se acerca (" + data.permiso.diasParaVencer + " días)."));
      }
      grid.appendChild(perm);
    }

    if (negada) {
      // Motivos y vía de impugnación
      var mot = docCard("Motivos de la negación", "Origen: I-10");
      mot.appendChild(layout.el("p", "resultado-doc__text", data.motivos));
      mot.appendChild(layout.el("p", "resultado-doc__meta", "Vía de impugnación"));
      mot.appendChild(layout.el("p", "resultado-doc__text", data.impugnacion));
      var motActions = layout.el("div", "resultado-doc__actions");
      motActions.appendChild(button({ text: "Descargar resolución (PDF)", onClick: function () { descargar("resolucion-" + data.resolucion.numero + ".pdf"); } }));
      mot.appendChild(motActions);
      grid.appendChild(mot);
    }

    inner.appendChild(grid);

    if (!negada && data.carne) {
      // Carné digital (origen A, sellado)
      var carne = docCard("Carné digital", "Permiso vigente");
      var seal = layout.el("div", "verified-field__seal");
      seal.appendChild(badge("Datos biométricos + TE", "verified"));
      seal.appendChild(layout.el("span", "verified-field__meta", "Origen [A] · verificado automáticamente"));
      carne.appendChild(seal);

      var qrWrap = layout.el("div", "qr-box");
      var canvas = layout.el("canvas", "signature__canvas");
      canvas.width = 180; canvas.height = 180;
      canvas.style.width = "180px"; canvas.style.height = "180px";
      drawQR(canvas, data.carne.codigo);
      qrWrap.appendChild(canvas);
      qrWrap.appendChild(layout.el("span", "detail-row__value", data.carne.codigo));
      qrWrap.appendChild(layout.el("span", "form-field__help", "QR de verificación (simulado)"));
      carne.appendChild(qrWrap);
      carne.appendChild(layout.el("p", "resultado-doc__meta", "Vigencia del carné: " + fmtFecha(data.carne.vigencia)));
      var carneActions = layout.el("div", "resultado-doc__actions");
      carneActions.appendChild(button({ text: "Descargar carné", onClick: function () { descargar("carne-" + data.carne.codigo + ".png"); } }));
      carne.appendChild(carneActions);
      inner.appendChild(carne);

      // Constancia de permiso vigente / prórroga
      var constancia = docCard("Constancia de permiso vigente / prórroga", data.constancia.numero);
      constancia.appendChild(layout.el("p", "resultado-doc__meta", "Emitida el " + fmtFecha(data.constancia.fecha) + " · origen [S] expediente."));
      var constActions = layout.el("div", "resultado-doc__actions");
      constActions.appendChild(button({ text: "Descargar constancia", onClick: function () { descargar("constancia-" + data.constancia.numero + ".pdf"); } }));
      constancia.appendChild(constActions);
      inner.appendChild(constancia);
    }

    if (data.etapas) {
      var linea = layout.el("p", "seguimiento-note",
        "Hitos: RESUELTO → NOTIFICADO (" + fmtFecha(data.etapas.notificado) + ") → ENTREGADO (" + fmtFecha(data.etapas.entregado) + ").");
      inner.appendChild(linea);
    }

    container.appendChild(inner);
  }

  function renderEmpty(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Resultados del trámite", "Sin resultados aún"));
    var empty = layout.el("div", "app-empty");
    empty.appendChild(layout.el("p", null, "Todavía no hay una resolución ni documentos disponibles."));
    empty.appendChild(layout.el("p", null, "Le notificaremos cuando el despacho emita el resultado."));
    empty.appendChild(button({
      variant: "primary",
      text: "Ver estado del trámite",
      onClick: function () { if (opts.onNavigate) opts.onNavigate("#/seguimiento/estado"); },
    }));
    inner.appendChild(empty);
    container.appendChild(inner);
  }

  function renderLoading(container) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Resultados del trámite", "Cargando resultados…"));
    var loading = layout.el("div", "app-loading");
    loading.appendChild(layout.el("span", "spinner"));
    loading.appendChild(layout.el("span", null, "Consultando resoluciones y documentos…"));
    inner.appendChild(loading);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Resultados del trámite", "No se pudieron cargar"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
    alert.appendChild(layout.el("span", "app-alert__text", "No pudimos consultar los resultados. Intente nuevamente."));
    inner.appendChild(alert);
    var actions = layout.el("div", "toolbar__actions");
    actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    inner.appendChild(actions);
    container.appendChild(inner);
  }

  function demoSelector(opts) {
    var wrap = layout.el("label", "toolbar__demo");
    wrap.appendChild(layout.el("span", null, "Vista (demo)"));
    var select = layout.el("select");
    var opciones = [
      { v: "carga", l: "Carga" },
      { v: "aprobada", l: "Aprobada" },
      { v: "negada", l: "Negada" },
      { v: "vacio", l: "Sin resultados" },
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

  function renderP22(container, opts) {
    opts = opts || {};

    function show(state) {
      if (state === "carga") {
        renderLoading(container);
        setTimeout(function () { renderContent(container, opts, DEMO_APROBADA); }, 700);
        return;
      }
      if (state === "error") { renderError(container, { onRetry: function () { show("carga"); } }); return; }
      if (state === "vacio") { renderEmpty(container, opts); return; }
      if (state === "negada") { renderContent(container, opts, DEMO_NEGADA); return; }
      renderContent(container, opts, DEMO_APROBADA);
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p22 = { renderP22: renderP22, DEMO_APROBADA: DEMO_APROBADA, DEMO_NEGADA: DEMO_NEGADA };
})(window);

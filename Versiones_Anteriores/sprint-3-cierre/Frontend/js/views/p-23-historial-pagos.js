/**
 * P-23 — Historial de pagos.
 * Tabla con todos los pagos del cliente (fecha, concepto, monto, medio,
 * número de comprobante, estado y descarga del recibo), incluidos los
 * depósitos de garantía devueltos. Captura simulada sin pasarela, igual que
 * P-15; descarga auditada (CP-12). 4 estados: carga, éxito, vacío, error.
 * Script clásico: expone `tm.views.p23.renderP23`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var button = global.tm.ui.button;
  var table = global.tm.ui.table;

  // Datos demo (ficticios). Se reemplazan por fixtures/HTTP en Sprint 2.
  var DEMO_PAGOS = [
    { fecha: "2026-09-12", concepto: "Tasa de visa", monto: 100, medio: "En línea (tarjeta)", comprobante: "COMP-2026-004521", estado: "Pagado" },
    { fecha: "2026-09-12", concepto: "Depósito de garantía", monto: 500, medio: "Cheque certificado", comprobante: "COMP-2026-004522", estado: "Pagado" },
    { fecha: "2026-10-02", concepto: "Depósito de garantía (cambio de categoría) — devuelto", monto: 500, medio: "Transferencia", comprobante: "COMP-2026-004880", estado: "Devuelto" },
    { fecha: "2026-10-05", concepto: "Carné de residente", monto: 50, medio: "En línea (tarjeta)", comprobante: "COMP-2026-005110", estado: "Pendiente" },
  ];

  var TONO_ESTADO = { Pagado: "success", Pendiente: "warning", Devuelto: "info" };

  function fmtFecha(iso) {
    if (!iso) return "—";
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function money(n) { return "B/." + Number(n).toFixed(2); }

  function badge(text, tone) {
    return layout.el("span", "badge badge--" + (tone || "info"), text);
  }

  function descargar(nombre) {
    try {
      var blob = new Blob(["Recibo simulado (demostración): " + nombre], { type: "text/plain;charset=utf-8" });
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

  function tableRows(pagos) {
    return pagos.map(function (p) {
      return [
        { text: fmtFecha(p.fecha) },
        { text: p.concepto },
        { text: money(p.monto), align: "right" },
        { text: p.medio },
        { text: p.comprobante },
        { node: badge(p.estado, TONO_ESTADO[p.estado] || "info") },
        { node: button({ text: "Recibo", onClick: function () { descargar("recibo-" + p.comprobante + ".pdf"); } }) },
      ];
    });
  }

  function renderContent(container, opts, pagos) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");

    inner.appendChild(layout.pageHeader(
      "Historial de pagos",
      "Pagos y depósitos de garantía registrados a su nombre"
    ));

    var toolbar = layout.el("div", "toolbar");
    toolbar.appendChild(layout.el("span", null, pagos.length + (pagos.length === 1 ? " pago registrado" : " pagos registrados")));
    toolbar.appendChild(demoSelector(opts));
    inner.appendChild(toolbar);

    if (pagos.length === 0) {
      var empty = layout.el("div", "app-empty");
      empty.appendChild(layout.el("p", null, "Aún no registra pagos."));
      inner.appendChild(empty);
      container.appendChild(inner);
      return;
    }

    inner.appendChild(table({
      headers: [
        { label: "Fecha" },
        { label: "Concepto" },
        { label: "Monto", align: "right" },
        { label: "Medio" },
        { label: "Comprobante" },
        { label: "Estado" },
        { label: "Recibo" },
      ],
      rows: tableRows(pagos),
    }));

    var total = pagos.reduce(function (s, p) { return s + (p.estado === "Devuelto" ? 0 : p.monto); }, 0);
    var resumen = layout.el("p", "seguimiento-note",
      "Total pagado (sin garantías devueltas): " + money(total) + ". Captura simulada, sin pasarela real; descargas auditadas (CP-12).");
    inner.appendChild(resumen);

    container.appendChild(inner);
  }

  function renderLoading(container) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Historial de pagos", "Cargando pagos…"));
    var loading = layout.el("div", "app-loading");
    loading.appendChild(layout.el("span", "spinner"));
    loading.appendChild(layout.el("span", null, "Consultando su historial de pagos…"));
    inner.appendChild(loading);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Historial de pagos", "No se pudo cargar"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
    alert.appendChild(layout.el("span", "app-alert__text", "No pudimos consultar su historial de pagos. Intente nuevamente."));
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

  function renderP23(container, opts) {
    opts = opts || {};

    function show(state) {
      if (state === "carga") {
        renderLoading(container);
        setTimeout(function () { renderContent(container, opts, DEMO_PAGOS); }, 700);
        return;
      }
      if (state === "error") { renderError(container, { onRetry: function () { show("carga"); } }); return; }
      if (state === "vacio") { renderContent(container, opts, []); return; }
      renderContent(container, opts, DEMO_PAGOS);
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p23 = { renderP23: renderP23, DEMO_PAGOS: DEMO_PAGOS };
})(window);

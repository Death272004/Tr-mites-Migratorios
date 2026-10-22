/**
 * I-02 — Tablero de gestión (Fase E).
 * Resume la carga del despacho y sus alertas operativas. Indicadores por rol.
 * 4 estados de vista: carga, éxito, vacío y error.
 * Script clásico: expone `tm.views.i02.renderI02`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var button = global.tm.ui.button;
  var table = global.tm.ui.table;

  var FALLBACK = {
    indicadores: [],
    tiempos: [],
    contadores: [],
    alertas: [],
    nota: "",
  };

  function datos() {
    return global.tm.fixtures.data("I-02", "exito") || FALLBACK;
  }

  function badge(text, tone) {
    return layout.el("span", "badge badge--" + (tone || "info"), text);
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
    select.addEventListener("change", function () { if (opts.onDemoState) opts.onDemoState(select.value); });
    wrap.appendChild(select);
    return wrap;
  }

  function renderI02(container, opts) {
    opts = opts || {};
    var d = datos();

    function renderContent() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Tablero de gestión", "Carga de trabajo del despacho e indicadores por rol"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", null, ""));
      toolbar.appendChild(demoSelector(opts));
      inner.appendChild(toolbar);

      var summary = layout.el("div", "seguimiento-summary");
      for (var i = 0; i < d.indicadores.length; i++) {
        var ind = d.indicadores[i];
        var item = layout.el("div", "seguimiento-summary__item");
        item.appendChild(layout.el("span", "seguimiento-summary__label", ind.label));
        var val = layout.el("span", "seguimiento-summary__value", String(ind.valor));
        val.appendChild(document.createTextNode(" "));
        val.appendChild(badge(ind.tono === "warning" ? "atención" : ind.tono === "danger" ? "fallidas" : "normal", ind.tono));
        item.appendChild(val);
        summary.appendChild(item);
      }
      inner.appendChild(summary);

      var blockT = layout.el("div", "seguimiento-block");
      blockT.appendChild(layout.el("h2", "seguimiento-block__title", "Tiempo por etapa"));
      blockT.appendChild(table({
        headers: [
          { label: "Etapa" },
          { label: "Promedio", align: "right" },
          { label: "Mediana", align: "right" },
          { label: "Máximo", align: "right" },
        ],
        rows: d.tiempos.map(function (t) {
          return [{ text: t.etapa }, { text: t.promedio, align: "right" }, { text: t.mediana, align: "right" }, { text: t.maximo, align: "right" }];
        }),
      }));
      inner.appendChild(blockT);

      var blockC = layout.el("div", "seguimiento-block");
      blockC.appendChild(layout.el("h2", "seguimiento-block__title", "Expedientes por estado"));
      blockC.appendChild(table({
        headers: [{ label: "Estado" }, { label: "Total", align: "right" }],
        rows: d.contadores.map(function (c) {
          return [{ text: c.estado }, { text: String(c.total), align: "right" }];
        }),
      }));
      inner.appendChild(blockC);

      if (d.alertas && d.alertas.length) {
        var blockA = layout.el("div", "seguimiento-block");
        blockA.appendChild(layout.el("h2", "seguimiento-block__title", "Alertas operativas"));
        for (var a = 0; a < d.alertas.length; a++) {
          var alert = layout.el("div", "app-alert app-alert--" + (d.alertas[a].tono || "info"));
          alert.appendChild(layout.el("span", "app-alert__text", d.alertas[a].texto));
          blockA.appendChild(alert);
        }
        inner.appendChild(blockA);
      }

      if (d.nota) inner.appendChild(layout.el("p", "seguimiento-note", d.nota));
      container.appendChild(inner);
    }

    function renderLoading() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Tablero de gestión", "Calculando indicadores…"));
      var loading = layout.el("div", "app-loading");
      loading.appendChild(layout.el("span", "spinner"));
      loading.appendChild(layout.el("span", null, "Generando el tablero del despacho…"));
      inner.appendChild(loading);
      container.appendChild(inner);
    }

    function renderEmpty() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Tablero de gestión", "Sin actividad"));
      var empty = layout.el("div", "app-empty");
      empty.appendChild(layout.el("p", null, "No hay actividad registrada en el periodo."));
      empty.appendChild(layout.el("p", null, "Cuando ingresen expedientes verá aquí los indicadores."));
      inner.appendChild(empty);
      container.appendChild(inner);
    }

    function renderError() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Tablero de gestión", "No se pudo cargar"));
      var alert = layout.el("div", "app-alert app-alert--warning");
      alert.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
      alert.appendChild(layout.el("span", "app-alert__text", global.tm.fixtures.message("I-02", "error", "No pudimos cargar los indicadores.")));
      inner.appendChild(alert);
      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { show("carga"); } }));
      inner.appendChild(actions);
      container.appendChild(inner);
    }

    function cargarReal(callback) {
      if (!global.tm.api.isOnline() || global.tm.api.isDemoSession()) { callback(); return; }
      global.tm.api.request("GET", "/expedientes?tamano=100", { pantalla: "I-02" }, function (err, data) {
        if (!err && data) {
          var expedientes = data.contenido || [];
          var porEstado = {};
          expedientes.forEach(function (e) { porEstado[e.estado] = (porEstado[e.estado] || 0) + 1; });
          d.indicadores = [
            { label: "Expedientes visibles", valor: expedientes.length, tono: "info" },
            { label: "En análisis", valor: porEstado.EN_ANALISIS || 0, tono: "warning" },
            { label: "Con observaciones", valor: porEstado.CON_OBSERVACIONES || 0, tono: "danger" },
            { label: "Resueltos", valor: porEstado.RESUELTO || 0, tono: "success" }
          ];
          d.contadores = Object.keys(porEstado).map(function (estado) { return { estado: estado, total: porEstado[estado] }; });
          d.tiempos = [];
          d.alertas = expedientes.filter(function (e) { return e.estado === "CON_OBSERVACIONES"; }).map(function (e) { return { tono: "warning", texto: "Expediente " + e.numero + " tiene observaciones pendientes." }; });
          d.nota = "Indicadores calculados desde GET /api/expedientes; no se usan datos de demostración.";
        }
        callback(err);
      });
    }

    function show(state) {
      global.tm.fixtures.setScenario(state);
      if (state === "carga") { renderLoading(); setTimeout(function () { cargarReal(function (err) { if (err) { renderError(); return; } renderContent(); }); }, 700); return; }
      if (state === "error") { renderError(); return; }
      if (state === "vacio") { renderEmpty(); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i02 = { renderI02: renderI02 };
})(window);

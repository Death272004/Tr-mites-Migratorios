/**
 * I-17 — Reportes y tiempos por etapa (Fase F).
 * Tiempos, volúmenes y cumplimiento de plazos con periodo configurable y
 * exportación auditada. Línea base 3–8 meses; meta POR DEFINIR (PO). 4 estados.
 * Script clásico: expone `tm.views.i17.renderI17`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var table = global.tm.ui.table;

  var FALLBACK = { periodo: "—", lineaBase: "—", metaReduccion: "—", tiemposPorEtapa: [], motivosDemora: [], volumenPorTramite: [], verificaciones: [], cumplimientoPlazos: [] };

  function datos() {
    return global.tm.fixtures.data("I-17", "exito") || FALLBACK;
  }

  function bars(items, labelKey, valueKey, max) {
    var wrap = layout.el("div", "report-bars");
    for (var i = 0; i < items.length; i++) {
      var row = layout.el("div", "report-bar");
      row.appendChild(layout.el("span", "report-bar__label", items[i][labelKey]));
      var track = layout.el("div", "report-bar__track");
      var fill = layout.el("div", "report-bar__fill");
      fill.style.width = Math.round((items[i][valueKey] / max) * 100) + "%";
      track.appendChild(fill);
      row.appendChild(track);
      row.appendChild(layout.el("span", "report-bar__value", String(items[i][valueKey])));
      wrap.appendChild(row);
    }
    return wrap;
  }

  function renderI17(container, opts) {
    opts = opts || {};
    var d = datos();
    var periodo = d.periodo;

    function demoSelector() {
      var wrap = layout.el("label", "toolbar__demo");
      wrap.appendChild(layout.el("span", null, "Vista (demo)"));
      var sel = layout.el("select");
      var opciones = [{ v: "carga", l: "Carga" }, { v: "exito", l: "Éxito" }, { v: "vacio", l: "Vacío" }, { v: "error", l: "Error" }];
      for (var i = 0; i < opciones.length; i++) { var o = layout.el("option", null, opciones[i].l); o.value = opciones[i].v; sel.appendChild(o); }
      sel.addEventListener("change", function () { if (opts.onDemoState) opts.onDemoState(sel.value); });
      wrap.appendChild(sel);
      return wrap;
    }

    function block(title) {
      var b = layout.el("div", "seguimiento-block");
      b.appendChild(layout.el("h2", "seguimiento-block__title", title));
      return b;
    }

    function renderContent() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Reportes y tiempos por etapa", "Tiempos, volúmenes y cumplimiento de plazos"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", "badge badge--info", "Periodo: " + periodo));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var note = layout.el("div", "app-alert app-alert--warning");
      note.appendChild(layout.el("span", "app-alert__title", "Línea base actual: " + d.lineaBase));
      note.appendChild(layout.el("span", "app-alert__text", "Meta de reducción y desgloses oficiales por etapa: " + d.metaReduccion));
      inner.appendChild(note);

      var filtro = layout.el("fieldset", "wizard-section");
      filtro.appendChild(layout.el("legend", "wizard-section-title", "Periodo"));
      var grid = layout.el("div", "wizard-grid");
      grid.appendChild(field.fieldDate({ id: "repDesde", label: "Desde", value: "2026-09-01" }));
      grid.appendChild(field.fieldDate({ id: "repHasta", label: "Hasta", value: "2026-09-30" }));
      filtro.appendChild(grid);
      var fActions = layout.el("div", "toolbar__actions");
      fActions.appendChild(button({ variant: "primary", text: "Aplicar periodo", onClick: function () {
        var desde = filtro.querySelector("#repDesde");
        var hasta = filtro.querySelector("#repHasta");
        periodo = (desde ? desde.value : "") + " a " + (hasta ? hasta.value : "");
        renderContent();
      } }));
      filtro.appendChild(fActions);
      inner.appendChild(filtro);

      var bEtapas = block("Tiempo por etapa");
      bEtapas.appendChild(table({ headers: [
        { label: "Etapa" }, { label: "Promedio" }, { label: "Mediana" }, { label: "Máximo" },
      ], rows: d.tiemposPorEtapa.map(function (t) { return [t.etapa, t.promedio, t.mediana, t.maximo]; }), emptyText: "Sin datos." }));
      inner.appendChild(bEtapas);

      var bDemora = block("Motivos de demora");
      var maxDemora = Math.max.apply(null, d.motivosDemora.map(function (m) { return m.cantidad; }).concat([1]));
      bDemora.appendChild(bars(d.motivosDemora, "motivo", "cantidad", maxDemora));
      inner.appendChild(bDemora);

      var bVol = block("Volumen por trámite");
      var maxVol = Math.max.apply(null, d.volumenPorTramite.map(function (m) { return m.cantidad; }).concat([1]));
      bVol.appendChild(bars(d.volumenPorTramite, "tramite", "cantidad", maxVol));
      inner.appendChild(bVol);

      var bVer = block("Verificaciones externas (volumen y éxito)");
      bVer.appendChild(table({ headers: [
        { label: "Institución" }, { label: "Volumen" }, { label: "Tasa de éxito" },
      ], rows: d.verificaciones.map(function (v) { return [v.institucion, String(v.volumen), v.exito]; }), emptyText: "Sin datos." }));
      inner.appendChild(bVer);

      var bPlazos = block("Cumplimiento de plazos legales");
      bPlazos.appendChild(table({ headers: [
        { label: "Plazo" }, { label: "Cumplidos" }, { label: "Total" }, { label: "Cumplimiento" },
      ], rows: d.cumplimientoPlazos.map(function (p) { return [p.plazo, String(p.cumplidos), String(p.total), Math.round((p.cumplidos / p.total) * 100) + "%"]; }), emptyText: "Sin datos." }));
      inner.appendChild(bPlazos);

      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "ghost", text: "Exportar CSV", onClick: function () {
        var a = layout.el("div", "app-alert app-alert--info");
        a.appendChild(layout.el("span", "app-alert__text", "Exportación auditada con fecha de corte: reportes-" + periodo.replace(/\s+/g, "") + ".csv"));
        inner.appendChild(a);
      } }));
      actions.appendChild(button({ variant: "ghost", text: "Exportar PDF", onClick: function () {
        var a = layout.el("div", "app-alert app-alert--info");
        a.appendChild(layout.el("span", "app-alert__text", "PDF simulado (fecha de corte incluida)."));
        inner.appendChild(a);
      } }));
      inner.appendChild(actions);

      container.appendChild(inner);
    }

    function renderSimple(titulo, subtitulo, mensaje, retry) {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader(titulo, subtitulo));
      var box = layout.el("div", "app-empty");
      box.appendChild(layout.el("p", null, mensaje));
      inner.appendChild(box);
      if (retry) {
        var actions = layout.el("div", "toolbar__actions");
        actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { show("carga"); } }));
        inner.appendChild(actions);
      }
      container.appendChild(inner);
    }

    function renderLoading() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Reportes y tiempos por etapa", "Generando reporte…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Calculando tiempos por etapa…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderError() {
      renderSimple("Reportes y tiempos por etapa", "No se pudo generar", global.tm.fixtures.message("I-17", "error", "No pudimos generar el reporte."), true);
    }

    function show(state) {
      global.tm.fixtures.setScenario(state);
      if (state === "carga") { renderLoading(); setTimeout(renderContent, 700); return; }
      if (state === "error") { renderError(); return; }
      if (state === "vacio") { renderSimple("Reportes y tiempos por etapa", "Sin datos", "No hay datos para el periodo seleccionado."); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i17 = { renderI17: renderI17 };
})(window);

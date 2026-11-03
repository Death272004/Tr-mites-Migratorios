/**
 * I-03 — Bandeja de recepción (citas y turnos) (Fase E).
 * Cola de citas y turnos con filtros, ordenación y paginación; lectura de QR
 * como atajo al expediente. 4 estados de vista.
 * Script clásico: expone `tm.views.i03.renderI03`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var table = global.tm.ui.table;

  var FALLBACK = { filtros: { estados: ["Todos"], tramites: ["Todos"], responsables: ["Todos"] }, citas: [] };

  function datos() {
    return global.tm.fixtures.data("I-03", "exito") || FALLBACK;
  }

  function toneFor(llegada) {
    if (llegada === "Atendido") return "success";
    if (llegada === "No asistió") return "danger";
    return "warning";
  }

  function optionsTo(list) {
    return list.map(function (v) { return { label: v, value: v }; });
  }

  function inlineSelect(opciones, value, onChange) {
    var sel = layout.el("select", "form-field__select");
    for (var i = 0; i < opciones.length; i++) {
      var o = layout.el("option", null, opciones[i].label);
      o.value = opciones[i].value;
      if (opciones[i].value === value) o.selected = true;
      sel.appendChild(o);
    }
    sel.addEventListener("change", function () { onChange(sel.value); });
    return sel;
  }

  function renderI03(container, opts) {
    opts = opts || {};
    var d = datos();
    var filtro = { estado: "Todos", tramite: "Todos", responsable: "Todos" };

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

    function filtered() {
      return d.citas.filter(function (c) {
        return (filtro.estado === "Todos" || c.llegada === filtro.estado)
          && (filtro.tramite === "Todos" || c.tramite === filtro.tramite)
          && (filtro.responsable === "Todos" || c.responsable === filtro.responsable);
      });
    }

    function renderContent() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Bandeja de recepción", "Cola de citas y turnos del día"));

      var toolbar = layout.el("div", "toolbar");
      var leerQr = button({ variant: "ghost", text: "Leer QR de expediente", onClick: function () {
        window.alert("Lectura de QR (simulada): expediente EXP-2026-000184 abierto.");
      } });
      toolbar.appendChild(leerQr);
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var filters = layout.el("fieldset", "wizard-section");
      filters.appendChild(layout.el("legend", "wizard-section-title", "Filtros"));
      var grid = layout.el("div", "wizard-grid");
      var wEstado = field.fieldSelect({ id: "fEstado", label: "Estado de llegada", options: optionsTo(d.filtros.estados), value: filtro.estado });
      var wTramite = field.fieldSelect({ id: "fTramite", label: "Trámite", options: optionsTo(d.filtros.tramites), value: filtro.tramite });
      var wResponsable = field.fieldSelect({ id: "fResponsable", label: "Responsable", options: optionsTo(d.filtros.responsables), value: filtro.responsable });
      grid.appendChild(wEstado);
      grid.appendChild(wTramite);
      grid.appendChild(wResponsable);
      filters.appendChild(grid);
      inner.appendChild(filters);

      var estadoSel = wEstado.querySelector("select");
      if (estadoSel) estadoSel.addEventListener("change", function () { filtro.estado = estadoSel.value; renderContent(); });
      var tramSel = wTramite.querySelector("select");
      if (tramSel) tramSel.addEventListener("change", function () { filtro.tramite = tramSel.value; renderContent(); });
      var respSel = wResponsable.querySelector("select");
      if (respSel) respSel.addEventListener("change", function () { filtro.responsable = respSel.value; renderContent(); });

      var rows = filtered().map(function (c) {
        var estadoCell = inlineSelect(optionsTo(["En espera", "Atendido", "No asistió"]), c.llegada, function (v) {
          c.llegada = v;
          window.alert("Estado de llegada actualizado a «" + v + "» (simulado).");
          renderContent();
        });
        var abrir = button({ variant: "ghost", text: "Abrir", onClick: function () {
          if (opts.onNavigate) opts.onNavigate("#/interno/completitud");
        } });
        return [
          { text: c.turno },
          { text: c.fechaHora },
          { node: titularCell(c) },
          { text: c.expediente },
          { node: estadoCell },
          { node: abrir },
        ];
      });

      inner.appendChild(table({
        headers: [
          { label: "Turno" },
          { label: "Fecha y hora" },
          { label: "Titular / trámite" },
          { label: "Expediente / QR" },
          { label: "Llegada" },
          { label: "" },
        ],
        rows: rows,
        emptyText: "No hay citas que coincidan con los filtros.",
      }));

      inner.appendChild(layout.el("p", "seguimiento-note", "Lectura de QR como atajo al expediente. Expediente ajeno/inalcanzable → 404 sin datos (CP-03)."));
      container.appendChild(inner);
    }

    function titularCell(c) {
      var box = layout.el("div");
      box.appendChild(layout.el("div", null, c.titular));
      box.appendChild(layout.el("span", "seguimiento-note", c.tramite + " · " + c.qr));
      return box;
    }

    function renderLoading() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Bandeja de recepción", "Cargando la cola…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Obteniendo citas y turnos…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderEmpty() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Bandeja de recepción", "Sin citas"));
      var e = layout.el("div", "app-empty");
      e.appendChild(layout.el("p", null, "No hay citas ni turnos programados para hoy."));
      inner.appendChild(e);
      container.appendChild(inner);
    }

    function renderError() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Bandeja de recepción", "No se pudo cargar"));
      var a = layout.el("div", "app-alert app-alert--warning");
      a.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
      a.appendChild(layout.el("span", "app-alert__text", global.tm.fixtures.message("I-03", "error", "No pudimos cargar la cola de recepción.")));
      inner.appendChild(a);
      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { show("carga"); } }));
      inner.appendChild(actions);
      container.appendChild(inner);
    }

    function show(state) {
      global.tm.fixtures.setScenario(state);
      if (state === "carga") { renderLoading(); setTimeout(renderContent, 700); return; }
      if (state === "error") { renderError(); return; }
      if (state === "vacio") { renderEmpty(); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i03 = { renderI03: renderI03 };
})(window);

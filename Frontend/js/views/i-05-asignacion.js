/**
 * I-05 — Asignación de analista (Fase E).
 * Asigna el expediente al analista adecuado con prioridad y fecha límite;
 * confirmación antes de asignar (HU-05). 4 estados de vista.
 * Script clásico: expone `tm.views.i05.renderI05`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var confirmModal = global.tm.ui.confirmModal;

  var FALLBACK = { expediente: "—", tramite: "—", estadoActual: "RECIBIDO", analistas: [], prioridades: ["Ordinaria"], prioridadSugerida: "Ordinaria", plazoSugerido: "", notaPlazos: "" };

  function datos() {
    return global.tm.fixtures.data("I-05", "exito") || FALLBACK;
  }

  function renderI05(container, opts) {
    opts = opts || {};
    var d = datos();
    var asignado = null;

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

    function detailRow(label, value) {
      var row = layout.el("div", "detail-row");
      row.appendChild(layout.el("span", "detail-row__label", label));
      row.appendChild(layout.el("span", "detail-row__value", value));
      return row;
    }

    function renderContent() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Asignación de analista", "Distribución del expediente a la mesa de análisis"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", null, ""));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var card = layout.el("div", "detail-card");
      card.appendChild(detailRow("N.º de expediente", d.expediente));
      card.appendChild(detailRow("Trámite", d.tramite));
      card.appendChild(detailRow("Estado actual", asignado ? "EN ANÁLISIS" : d.estadoActual));
      inner.appendChild(card);

      var form = layout.el("fieldset", "wizard-section");
      form.appendChild(layout.el("legend", "wizard-section-title", "Datos de la asignación"));
      var grid = layout.el("div", "wizard-grid");
      var wAnalista = field.fieldSelect({
        id: "analistaAsignado",
        label: "Analista asignado",
        options: d.analistas.map(function (a) { return { label: a.nombre + " · " + a.especialidad + " (" + a.carga + " en curso)", value: a.nombre }; }),
        helpText: "Disponibilidad y especialidad (visas, residencias, naturalización).",
      });
      var wPrioridad = field.fieldSelect({ id: "prioridad", label: "Prioridad", options: d.prioridades.map(function (p) { return { label: p, value: p }; }), value: d.prioridadSugerida });
      var wFecha = field.fieldDate({ id: "fechaLimite", label: "Fecha límite sugerida", value: d.plazoSugerido, helpText: "Calculada por tipo de trámite." });
      grid.appendChild(wAnalista);
      grid.appendChild(wPrioridad);
      grid.appendChild(wFecha);
      form.appendChild(grid);
      form.appendChild(field.fieldTextarea({ id: "obsAsignacion", label: "Observación de asignación", rows: 2 }));
      inner.appendChild(form);

      if (d.notaPlazos) inner.appendChild(layout.el("p", "seguimiento-note", d.notaPlazos));

      var errBox = layout.el("div", "auth-error", "");
      errBox.setAttribute("aria-live", "polite");
      inner.appendChild(errBox);

      if (asignado) {
        var res = layout.el("div", "app-alert app-alert--info");
        res.appendChild(layout.el("span", "app-alert__title", "Expediente asignado — nuevo estado EN ANÁLISIS"));
        res.appendChild(layout.el("span", "app-alert__text", asignado.analista + " · Prioridad " + asignado.prioridad + " · Vence " + asignado.fecha));
        inner.appendChild(res);
      }

      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({
        variant: "primary",
        text: asignado ? "Reasignar" : "Asignar analista",
        onClick: function () {
          errBox.textContent = "";
          errBox.classList.remove("is-visible");
          var sAnalista = wAnalista.querySelector("select");
          var sPrioridad = wPrioridad.querySelector("select");
          var iFecha = wFecha.querySelector("input");
          var analista = sAnalista ? sAnalista.value : "";
          var prioridad = sPrioridad ? sPrioridad.value : "";
          var fecha = iFecha ? iFecha.value : "";
          if (!analista) { errBox.textContent = "Seleccione un analista."; errBox.classList.add("is-visible"); return; }
          confirmModal("Confirmar asignación", "¿Asignar " + analista + " con prioridad «" + prioridad + "»?", {
            onConfirm: function () {
              asignado = { analista: analista, prioridad: prioridad, fecha: fecha || "—" };
              renderContent();
            },
          });
        },
      }));
      if (opts.onNavigate) actions.appendChild(button({ variant: "ghost", text: "Ir a análisis", onClick: function () { opts.onNavigate("#/interno/analisis"); } }));
      inner.appendChild(actions);

      container.appendChild(inner);
    }

    function renderLoading() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Asignación de analista", "Cargando analistas…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Obteniendo disponibilidad y especialidad…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderEmpty() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Asignación de analista", "Sin pendientes"));
      var e = layout.el("div", "app-empty");
      e.appendChild(layout.el("p", null, "No hay expedientes pendientes de asignación."));
      inner.appendChild(e);
      container.appendChild(inner);
    }

    function renderError() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Asignación de analista", "No se pudo cargar"));
      var a = layout.el("div", "app-alert app-alert--warning");
      a.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
      a.appendChild(layout.el("span", "app-alert__text", global.tm.fixtures.message("I-05", "error", "No pudimos cargar los analistas.")));
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
  global.tm.views.i05 = { renderI05: renderI05 };
})(window);

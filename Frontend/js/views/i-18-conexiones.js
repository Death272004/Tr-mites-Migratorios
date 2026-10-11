/**
 * I-18 — Salud de las conexiones de interoperabilidad (Fase F).
 * Supervisa el semáforo por institución y permite activar el modo de
 * contingencia. Error técnico ≠ resultado negativo (CP-07). 4 estados.
 * Script clásico: expone `tm.views.i18.renderI18`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var table = global.tm.ui.table;
  var confirmModal = global.tm.ui.confirmModal;

  var FALLBACK = { modoActual: "—", modos: [], catalogo: [] };

  function datos() {
    return global.tm.fixtures.data("I-18", "exito") || FALLBACK;
  }

  function semaforo(estado) {
    var map = { verde: ["success", "VERDE · operativo"], ambar: ["warning", "ÁMBAR · degradado"], rojo: ["danger", "ROJO · caído"] };
    var cfg = map[estado] || ["info", estado];
    return { node: layout.el("span", "badge badge--" + cfg[0], cfg[1]) };
  }

  function renderI18(container, opts) {
    opts = opts || {};
    var d = datos();
    var modo = d.modoActual;
    var aplicado = null;

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

    function renderContent() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Salud de conexiones", "Estado de la interoperabilidad y modo de contingencia"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", "badge badge--warning", "Modo vigente: " + modo));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var note = layout.el("div", "app-alert app-alert--warning");
      note.appendChild(layout.el("span", "app-alert__title", "Error técnico ≠ resultado negativo (CP-07)"));
      note.appendChild(layout.el("span", "app-alert__text", "Un fallo de conexión nunca se presenta como resultado de validación. En el MVP, sin convenios, las métricas provienen del fixture y el modo vigente es la operación manual con verificación diferida."));
      inner.appendChild(note);

      var rows = d.catalogo.map(function (c) {
        return [c.institucion, c.endpoint, semaforo(c.estado), c.ultimaRespuesta, c.latencia, c.tasaError];
      });
      inner.appendChild(table({ headers: [
        { label: "Institución" }, { label: "Endpoint" }, { label: "Estado" }, { label: "Última respuesta" }, { label: "Latencia" }, { label: "Error 24 h" },
      ], rows: rows, emptyText: "No hay conexiones configuradas." }));

      var form = layout.el("fieldset", "wizard-section");
      form.appendChild(layout.el("legend", "wizard-section-title", "Modo de contingencia"));
      var grid = layout.el("div", "wizard-grid");
      grid.appendChild(field.fieldSelect({ id: "conModo", label: "Modo de operación", options: d.modos.map(function (m) { return { label: m, value: m }; }), value: modo, helpText: "El modo manual registra verificaciones diferidas (se refleja en I-07 como modo manual asistido)." }));
      form.appendChild(grid);
      inner.appendChild(form);

      if (aplicado) {
        var ok = layout.el("div", "app-alert app-alert--info");
        ok.appendChild(layout.el("span", "app-alert__title", "Modo aplicado: " + aplicado));
        ok.appendChild(layout.el("span", "app-alert__text", "Cambio auditado (I-16)."));
        inner.appendChild(ok);
      }

      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "primary", text: "Aplicar modo", onClick: function () {
        var sel = form.querySelector("#conModo");
        var nuevo = sel ? sel.value : modo;
        confirmModal("Cambiar modo de contingencia", "¿Activar «" + nuevo + "»? Afecta el registro de verificaciones externas.", {
          onConfirm: function () { modo = nuevo; aplicado = nuevo; renderContent(); },
        });
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
      inner.appendChild(layout.pageHeader("Salud de conexiones", "Consultando el monitor…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Reuniendo estado de las conexiones…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderError() {
      renderSimple("Salud de conexiones", "Error técnico", global.tm.fixtures.message("I-18", "error", "No pudimos consultar el monitor."), true);
    }

    function show(state) {
      global.tm.fixtures.setScenario(state);
      if (state === "carga") { renderLoading(); setTimeout(renderContent, 700); return; }
      if (state === "error") { renderError(); return; }
      if (state === "vacio") { renderSimple("Salud de conexiones", "Sin conexiones", "No hay conexiones configuradas."); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i18 = { renderI18: renderI18 };
})(window);

/**
 * I-11 — Notificación (Fase E).
 * Notifica la resolución al cliente y genera la constancia de notificación.
 * El medio preferido (P-05) se hereda como sugerencia. 4 estados de vista.
 * Script clásico: expone `tm.views.i11.renderI11`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var perms = global.tm.perms;

  var FALLBACK = { expediente: "—", tramite: "—", estadoActual: "RESUELTO", medioPreferido: "Portal", medios: ["Portal"], plazoRetiro: "", textoPlantilla: "" };

  function datos() {
    return global.tm.fixtures.data("I-11", "exito") || FALLBACK;
  }

  function optionsTo(list) {
    return list.map(function (v) { return { label: v, value: v }; });
  }

  function renderI11(container, opts) {
    opts = opts || {};
    var d = datos();
    var notificado = null;

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
      inner.appendChild(layout.pageHeader("Notificación", "Comunicación de la resolución y constancia"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", null, ""));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var card = layout.el("div", "detail-card");
      card.appendChild(detailRow("Expediente", d.expediente + " · " + d.tramite));
      card.appendChild(detailRow("Estado actual", notificado ? "NOTIFICADO" : d.estadoActual));
      inner.appendChild(card);

      var form = layout.el("fieldset", "wizard-section");
      form.appendChild(layout.el("legend", "wizard-section-title", "Datos de la notificación"));
      var grid = layout.el("div", "wizard-grid");
      grid.appendChild(field.fieldSelect({ id: "notMedio", label: "Medio de notificación", options: optionsTo(d.medios), value: d.medioPreferido, helpText: "Medio preferido heredado de P-05 como sugerencia." }));
      grid.appendChild(field.fieldDate({ id: "notPlazo", label: "Plazo de retiro", value: d.plazoRetiro }));
      form.appendChild(grid);
      form.appendChild(field.fieldTextarea({ id: "notTexto", label: "Texto de la comunicación", rows: 4, value: d.textoPlantilla }));
      inner.appendChild(form);

      if (notificado) {
        var doc = layout.el("div", "resultado-doc");
        doc.appendChild(layout.el("div", "resultado-doc__head", null));
        doc.lastChild.appendChild(layout.el("span", "resultado-doc__title", "Constancia de notificación"));
        doc.appendChild(layout.el("p", "resultado-doc__meta", "Medio: " + notificado.medio + " · Fecha: 2026-10-11 · Archivo: constancia-notificacion.pdf"));
        doc.appendChild(layout.el("p", "resultado-doc__text", "Documento archivado en el expediente con fecha y medio."));
        inner.appendChild(doc);
      }

      var errBox = layout.el("div", "auth-error", "");
      errBox.setAttribute("aria-live", "polite");
      inner.appendChild(errBox);

      var actions = layout.el("div", "toolbar__actions");
      var notificarBtn = button({
        variant: "primary",
        text: notificado ? "Notificación registrada" : "Registrar notificación",
        disabled: !!notificado,
        onClick: function () {
          errBox.textContent = "";
          errBox.classList.remove("is-visible");
          var medio = form.querySelector("#notMedio");
          var plazo = form.querySelector("#notPlazo");
          var texto = form.querySelector("#notTexto");
          if (!texto || !texto.value.trim()) { errBox.textContent = "El texto de la comunicación es obligatorio."; errBox.classList.add("is-visible"); return; }
          if (!plazo || !plazo.value) { errBox.textContent = "Indique el plazo de retiro."; errBox.classList.add("is-visible"); return; }
          notificado = { medio: medio ? medio.value : "Portal" };
          renderContent();
        },
      });
      actions.appendChild(perms.can(perms.PERMS.NOTIFICAR) ? notificarBtn : perms.notice(perms.PERMS.NOTIFICAR, "Solo un rol con permiso «notificar» puede registrar notificaciones."));
      if (opts.onNavigate) actions.appendChild(button({ variant: "ghost", text: "Ir a entrega", onClick: function () { opts.onNavigate("#/interno/entrega"); } }));
      inner.appendChild(actions);

      inner.appendChild(layout.el("p", "seguimiento-note", "La notificación por edicto se materializa en I-09/P-24. Estado resultante: NOTIFICADO."));
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
      inner.appendChild(layout.pageHeader("Notificación", "Preparando la comunicación…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Generando la constancia…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderError() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Notificación", "No se pudo registrar"));
      var a = layout.el("div", "app-alert app-alert--warning");
      a.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
      a.appendChild(layout.el("span", "app-alert__text", global.tm.fixtures.message("I-11", "error", "No pudimos registrar la notificación.")));
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
      if (state === "vacio") { renderSimple("Notificación", "Sin pendientes", "No hay resoluciones pendientes de notificar."); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i11 = { renderI11: renderI11 };
})(window);

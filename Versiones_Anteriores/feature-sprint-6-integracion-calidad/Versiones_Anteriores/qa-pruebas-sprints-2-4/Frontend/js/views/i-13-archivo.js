/**
 * I-13 — Archivo y reactivación (Fase E).
 * Archiva documentos con motivo categorizado, conserva la retención y permite
 * reactivar el expediente (permiso elevado). Historial inmutable. 4 estados.
 * Script clásico: expone `tm.views.i13.renderI13`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var perms = global.tm.perms;

  var FALLBACK = { expediente: "—", tramite: "—", estadoActual: "ARCHIVADO", categoriasArchivo: ["Otro"], retencion: "—", historial: [], permiteReactivar: false, reactivarMotivo: "" };

  function datos() {
    return global.tm.fixtures.data("I-13", "exito") || FALLBACK;
  }

  function optionsTo(list) {
    return list.map(function (v) { return { label: v, value: v }; });
  }

  function renderI13(container, opts) {
    opts = opts || {};
    var d = datos();
    var historial = d.historial.map(function (i) { return Object.assign({}, i); });
    var estado = d.estadoActual;
    var archivado = /ARCHIV/i.test(estado);

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
      inner.appendChild(layout.pageHeader("Archivo y reactivación", "Cierre, retención y reactivación del expediente"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", null, ""));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var card = layout.el("div", "detail-card");
      card.appendChild(detailRow("Expediente", d.expediente + " · " + d.tramite));
      card.appendChild(detailRow("Estado actual", estado));
      card.appendChild(detailRow("Retención", d.retencion));
      inner.appendChild(card);

      var histBlock = layout.el("div", "seguimiento-block");
      histBlock.appendChild(layout.el("h2", "seguimiento-block__title", "Historial del expediente (inmutable)"));
      histBlock.appendChild(global.tm.ui.timeline({
        items: historial.map(function (i) { return { fecha: i.fecha, titulo: i.titulo, detalle: i.detalle, done: i.done, active: i.active }; }),
      }));
      histBlock.appendChild(layout.el("p", "seguimiento-note", "El historial no se edita ni elimina: los eventos de archivo se añaden."));
      inner.appendChild(histBlock);

      var errBox = layout.el("div", "auth-error", "");
      errBox.setAttribute("aria-live", "polite");
      inner.appendChild(errBox);

      if (!archivado) {
        var form = layout.el("fieldset", "wizard-section");
        form.appendChild(layout.el("legend", "wizard-section-title", "Archivar expediente"));
        var grid = layout.el("div", "wizard-grid");
        grid.appendChild(field.fieldSelect({ id: "archCategoria", label: "Motivo de archivo", options: optionsTo(d.categoriasArchivo) }));
        form.appendChild(grid);
        form.appendChild(field.fieldTextarea({ id: "archObs", label: "Observación del archivo", rows: 2 }));
        inner.appendChild(form);

        var actions = layout.el("div", "toolbar__actions");
        var archivarBtn = button({
          variant: "danger",
          text: "Archivar expediente",
          onClick: function () {
            errBox.textContent = "";
            errBox.classList.remove("is-visible");
            var cat = form.querySelector("#archCategoria");
            var obs = form.querySelector("#archObs");
            if (!cat || !cat.value) { errBox.textContent = "Seleccione un motivo de archivo."; errBox.classList.add("is-visible"); return; }
            estado = "ARCHIVADO";
            archivado = true;
            historial.push({ fecha: "2026-10-11", titulo: "ARCHIVADO", detalle: "Motivo: " + cat.value + (obs && obs.value ? " · " + obs.value : ""), done: true });
            renderContent();
          },
        });
        actions.appendChild(perms.can(perms.PERMS.NOTIFICAR) ? archivarBtn : perms.notice(perms.PERMS.NOTIFICAR, "Solo un rol con permiso «notificar» puede archivar expedientes."));
        inner.appendChild(actions);
      } else {
        var aviso = layout.el("div", "app-alert app-alert--info");
        aviso.appendChild(layout.el("span", "app-alert__title", "Expediente ARCHIVADO"));
        aviso.appendChild(layout.el("span", "app-alert__text", "Se conserva según la política de retención (" + d.retencion + "). La reactivación requiere permiso elevado."));
        inner.appendChild(aviso);

        var form2 = layout.el("fieldset", "wizard-section");
        form2.appendChild(layout.el("legend", "wizard-section-title", "Reactivar expediente"));
        var grid2 = layout.el("div", "wizard-grid");
        grid2.appendChild(field.fieldSelect({ id: "reactTipo", label: "Tipo de reactivación", options: [{ label: "Reingreso del cliente (P-21)", value: "P-21" }, { label: "Corrección administrativa", value: "ADMIN" }, { label: "Orden superior", value: "SUPERIOR" }] }));
        form2.appendChild(grid2);
        form2.appendChild(field.fieldTextarea({ id: "reactMotivo", label: "Motivo de la reactivación (obligatorio)", rows: 2, value: d.reactivarMotivo }));
        inner.appendChild(form2);

        var actions2 = layout.el("div", "toolbar__actions");
        var reactivarBtn = button({
          variant: "primary",
          text: "Reactivar a «EN ANÁLISIS»",
          onClick: function () {
            errBox.textContent = "";
            errBox.classList.remove("is-visible");
            var motivo = form2.querySelector("#reactMotivo");
            if (!motivo || !motivo.value.trim()) { errBox.textContent = "El motivo de reactivación es obligatorio."; errBox.classList.add("is-visible"); return; }
            estado = "EN ANÁLISIS";
            archivado = false;
            historial.push({ fecha: "2026-10-11", titulo: "REACTIVADO", detalle: motivo.value.trim(), active: true });
            renderContent();
          },
        });
        actions2.appendChild(perms.can(perms.PERMS.ADMINISTRAR) ? reactivarBtn : perms.notice(perms.PERMS.ADMINISTRAR, "La reactivación requiere permiso elevado «administrar»."));
        inner.appendChild(actions2);
      }

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
      inner.appendChild(layout.pageHeader("Archivo y reactivación", "Cargando expediente…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Reuniendo el historial y la política de retención…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderError() {
      renderSimple("Archivo y reactivación", "No se pudo cargar", global.tm.fixtures.message("I-13", "error", "No pudimos cargar el expediente."), true);
    }

    function show(state) {
      global.tm.fixtures.setScenario(state);
      if (state === "carga") { renderLoading(); setTimeout(renderContent, 700); return; }
      if (state === "error") { renderError(); return; }
      if (state === "vacio") { renderSimple("Archivo y reactivación", "Sin expedientes", "No hay expedientes archivados."); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i13 = { renderI13: renderI13 };
})(window);

/**
 * I-08 — Emisión y atención de observaciones (Fase E).
 * Emite observaciones con plazo y da seguimiento a la atención del cliente (P-21).
 * Regla: todas las observaciones en un solo reingreso. 4 estados de vista.
 * Script clásico: expone `tm.views.i08.renderI08`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var perms = global.tm.perms;
  var api = global.tm.api;

  var FALLBACK = { expediente: "—", estadoActual: "CON OBSERVACIONES", tipos: ["Recepción"], medios: ["Portal"], items: [], historial: [], plazo: "" };

  function datos() {
    return global.tm.fixtures.data("I-08", "exito") || FALLBACK;
  }

  function optionsTo(list) {
    return list.map(function (v) { return { label: v, value: v }; });
  }

  function renderI08(container, opts) {
    opts = opts || {};
    var d = datos();
    var items = d.items.map(function (i) { return Object.assign({}, i); });
    var historial = d.historial.slice();
    var emitido = false;

    function cargarReal(callback) {
      if (!api || !api.isOnline()) { callback(null); return; }
      var seleccionado = global.tm.expediente && global.tm.expediente.getSelected ? global.tm.expediente.getSelected() : null;
      function cargar(id) {
        api.request("GET", "/expedientes/" + encodeURIComponent(id), { pantalla: "I-08" }, function (err, expediente) {
          if (err) { callback(err); return; }
          d.id = expediente.id;
          d.expediente = expediente.numero || expediente.id;
          d.estadoActual = expediente.estado || "—";
          d.version = expediente.version;
          items = [];
          api.request("GET", "/expedientes/" + encodeURIComponent(id) + "/observaciones", { pantalla: "I-08" }, function (obsErr, observaciones) {
            if (obsErr) { callback(obsErr); return; }
            historial = (observaciones || []).map(function (o) {
              return { id: o.id, autor: o.autorId || "Despacho", fecha: o.fecha ? o.fecha.slice(0, 10) : "—", texto: o.texto || "" };
            });
            callback(null);
          });
        });
      }
      if (seleccionado && seleccionado.id) { cargar(seleccionado.id); return; }
      api.request("GET", "/expedientes?estado=CON_OBSERVACIONES&pagina=0&tamano=20", { pantalla: "I-08" }, function (err, page) {
        var lista = page && page.contenido ? page.contenido : [];
        if (err || !lista.length) { callback(err || { mensajeUsuario: "No hay expedientes con observaciones." }); return; }
        cargar(lista[0].id);
      });
    }

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
      inner.appendChild(layout.pageHeader("Emisión y atención de observaciones", "Seguimiento de la subsanación del expediente"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", null, ""));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var note = layout.el("div", "app-alert app-alert--info");
      note.appendChild(layout.el("span", "app-alert__title", "Expediente " + d.expediente + " · Estado " + d.estadoActual));
      note.appendChild(layout.el("span", "app-alert__text", "Una observación no cambia el estado en la interfaz del cliente (HU-20); el reingreso es único con todo atendido."));
      inner.appendChild(note);

      var histBlock = layout.el("div", "seguimiento-block");
      histBlock.appendChild(layout.el("h2", "seguimiento-block__title", "Observaciones emitidas"));
      for (var h = 0; h < historial.length; h++) {
        var card = layout.el("div", "obs-card");
        var head = layout.el("div", "obs-card__head");
        head.appendChild(layout.el("span", "obs-card__emisor", historial[h].autor));
        head.appendChild(layout.el("span", "obs-card__fechas", historial[h].fecha));
        card.appendChild(head);
        card.appendChild(layout.el("p", "obs-card__body", historial[h].texto));
        histBlock.appendChild(card);
      }
      inner.appendChild(histBlock);

      var itemsBlock = layout.el("fieldset", "wizard-section");
      itemsBlock.appendChild(layout.el("legend", "wizard-section-title", "Ítems observados (vinculados a P-20/P-21)"));
      for (var i = 0; i < items.length; i++) {
        (function (it) {
          itemsBlock.appendChild(field.fieldCheckbox({
            id: "obs-item-" + it.id,
            label: it.texto + (it.atendido ? " — atendido" : ""),
            checked: it.atendido,
            onChange: function (checked) { it.atendido = checked; },
          }));
        })(items[i]);
      }
      inner.appendChild(itemsBlock);

      var form = layout.el("fieldset", "wizard-section");
      form.appendChild(layout.el("legend", "wizard-section-title", "Emitir observación"));
      var grid = layout.el("div", "wizard-grid");
      grid.appendChild(field.fieldSelect({ id: "obsTipo", label: "Tipo de observación", options: optionsTo(d.tipos) }));
      grid.appendChild(field.fieldSelect({ id: "obsMedio", label: "Medio de notificación", options: optionsTo(d.medios) }));
      grid.appendChild(field.fieldDate({ id: "obsPlazo", label: "Plazo de atención", value: d.plazo, helpText: "Si vence el plazo, el expediente pasa a ARCHIVADO (I-13)." }));
      form.appendChild(grid);
      form.appendChild(field.fieldText({ id: "obsAtencion", label: "Atención recibida (referencia)", helpText: "El cliente carga la respuesta en P-21." }));
      form.appendChild(field.fieldTextarea({ id: "obsDescripcion", label: "Descripción de la observación", rows: 3, helpText: "Texto obligatorio (HU-05 CA-5). Sin datos confidenciales visibles al cliente." }));
      inner.appendChild(form);

      var reingreso = field.fieldCheckbox({ id: "obsReingreso", label: "Reingreso completo: todas las observaciones quedan atendidas en un solo reingreso", checked: emitido });
      inner.appendChild(reingreso);

      var errBox = layout.el("div", "auth-error", "");
      errBox.setAttribute("aria-live", "polite");
      inner.appendChild(errBox);

      var actions = layout.el("div", "toolbar__actions");
      var emitirBtn = button({
        variant: "primary",
        text: "Emitir observación",
        onClick: function () {
          errBox.textContent = "";
          errBox.classList.remove("is-visible");
          var desc = form.querySelector("#obsDescripcion");
          var plazo = form.querySelector("#obsPlazo");
          if (!desc || !desc.value.trim()) { errBox.textContent = "La descripción es obligatoria."; errBox.classList.add("is-visible"); return; }
          if (!plazo || !plazo.value) { errBox.textContent = "Indique el plazo de atención."; errBox.classList.add("is-visible"); return; }
          function finalizar() {
            historial.push({ autor: "Despacho", fecha: new Date().toISOString().slice(0, 10), texto: desc.value.trim() });
            emitido = true;
            renderContent();
          }
          if (!(api && api.isOnline() && d.id)) { finalizar(); return; }
          api.request("POST", "/expedientes/" + encodeURIComponent(d.id) + "/observaciones", {
            pantalla: "I-08",
            body: { texto: desc.value.trim() },
          }, function (err, creada) {
            if (err) { errBox.textContent = err.mensajeUsuario || "No se pudo emitir la observación."; errBox.classList.add("is-visible"); return; }
            historial.push({ id: creada && creada.id, autor: creada && creada.autorId ? creada.autorId : "Despacho", fecha: creada && creada.fecha ? creada.fecha.slice(0, 10) : new Date().toISOString().slice(0, 10), texto: creada && creada.texto ? creada.texto : desc.value.trim() });
            emitido = true;
            renderContent();
          });
        },
      });
      actions.appendChild(perms.can(perms.PERMS.OBSERVAR) ? emitirBtn : perms.notice(perms.PERMS.OBSERVAR, "Solo un rol con permiso «observar» puede emitir observaciones."));
      if (opts.onNavigate) actions.appendChild(button({ variant: "ghost", text: "Archivo y reactivación", onClick: function () { opts.onNavigate("#/interno/archivo"); } }));
      inner.appendChild(actions);

      var estado = layout.el("p", "seguimiento-note", "Estado resultante: CON OBSERVACIONES → EN ANÁLISIS (tras reingreso) o ARCHIVADO (plazo vencido).");
      inner.appendChild(estado);

      container.appendChild(inner);
    }

    function renderLoading() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Emisión y atención de observaciones", "Cargando observaciones…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Reuniendo observaciones y plazos…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderEmpty() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Emisión y atención de observaciones", "Sin observaciones"));
      var e = layout.el("div", "app-empty");
      e.appendChild(layout.el("p", null, "No hay observaciones abiertas para este expediente."));
      inner.appendChild(e);
      container.appendChild(inner);
    }

    function renderError() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Emisión y atención de observaciones", "No se pudo cargar"));
      var a = layout.el("div", "app-alert app-alert--warning");
      a.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
      a.appendChild(layout.el("span", "app-alert__text", global.tm.fixtures.message("I-08", "error", "No pudimos cargar las observaciones.")));
      inner.appendChild(a);
      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { show("carga"); } }));
      inner.appendChild(actions);
      container.appendChild(inner);
    }

    function show(state) {
      global.tm.fixtures.setScenario(state);
      if (state === "carga") {
        renderLoading();
        setTimeout(function () { cargarReal(function (err) { if (err) { renderError(); return; } renderContent(); }); }, 700);
        return;
      }
      if (state === "error") { renderError(); return; }
      if (state === "vacio") { renderEmpty(); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i08 = { renderI08: renderI08 };
})(window);

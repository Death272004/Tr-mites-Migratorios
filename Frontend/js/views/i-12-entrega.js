/**
 * I-12 — Entrega en ventanilla (Fase E).
 * Entrega resolución, carné y certificaciones con verificación de identidad del
 * retirador. No se entrega con saldos pendientes (CP-12). 4 estados de vista.
 * Script clásico: expone `tm.views.i12.renderI12`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;

  var FALLBACK = { expediente: "—", tramite: "—", estadoActual: "NOTIFICADO", quienRetira: {}, esApoderado: false, poderChecklist: [], documentos: [], documentosSeleccionados: [], carneDigital: {}, saldo: "—" };

  function datos() {
    return global.tm.fixtures.data("I-12", "exito") || FALLBACK;
  }

  function renderI12(container, opts) {
    opts = opts || {};
    var d = datos();
    var seleccion = (d.documentosSeleccionados || []).slice();
    var entregado = null;

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
      inner.appendChild(layout.pageHeader("Entrega en ventanilla", "Entrega con verificación de identidad del retirador"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", null, ""));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var card = layout.el("div", "detail-card");
      card.appendChild(detailRow("Expediente", d.expediente + " · " + d.tramite));
      card.appendChild(detailRow("Estado actual", entregado ? "ENTREGADO" : d.estadoActual));
      card.appendChild(detailRow("Quien retira", (d.quienRetira.nombre || "—") + " · " + (d.quienRetira.documento || "—")));
      card.appendChild(detailRow("Condición", d.quienRetira.condicion || "—"));
      inner.appendChild(card);

      var sealed = layout.el("div", "detail-card");
      sealed.appendChild(layout.el("h2", "seguimiento-block__title", "Identidad sellada (origen S)"));
      var idRow = layout.el("div", "verified-field__meta");
      idRow.appendChild(layout.el("span", "badge badge--verified", "verificado"));
      idRow.appendChild(layout.el("span", null, "Documento de identidad original presentado en ventanilla."));
      sealed.appendChild(idRow);
      inner.appendChild(sealed);

      var apod = field.fieldCheckbox({ id: "esApoderado", label: "Retira un apoderado (requiere poder notariado, idoneidad y cédula)", checked: !!d.esApoderado });
      inner.appendChild(apod);

      if (d.esApoderado) {
        var poderBlock = layout.el("fieldset", "wizard-section");
        poderBlock.appendChild(layout.el("legend", "wizard-section-title", "Documentos del apoderado"));
        for (var p = 0; p < d.poderChecklist.length; p++) {
          poderBlock.appendChild(field.fieldCheckbox({ id: "poder-" + p, label: d.poderChecklist[p], checked: true }));
        }
        inner.appendChild(poderBlock);
      }

      var docsBlock = layout.el("fieldset", "wizard-section");
      docsBlock.appendChild(layout.el("legend", "wizard-section-title", "Documentos a entregar"));
      for (var i = 0; i < d.documentos.length; i++) {
        (function (nombre) {
          docsBlock.appendChild(field.fieldCheckbox({
            id: "doc-" + nombre.replace(/\s+/g, "-").toLowerCase(),
            label: nombre,
            checked: seleccion.indexOf(nombre) >= 0,
            onChange: function (checked) {
              var idx = seleccion.indexOf(nombre);
              if (checked && idx < 0) seleccion.push(nombre);
              if (!checked && idx >= 0) seleccion.splice(idx, 1);
            },
          }));
        })(d.documentos[i]);
      }
      inner.appendChild(docsBlock);

      var carne = layout.el("div", "detail-card");
      carne.appendChild(layout.el("h2", "seguimiento-block__title", "Carné digital emitido"));
      var cRow = layout.el("div", "verified-field__meta");
      cRow.appendChild(layout.el("span", "badge badge--verified", "sellado [V]"));
      cRow.appendChild(layout.el("span", null, d.carneDigital.etiqueta + " · origen " + d.carneDigital.origen + " · fuentes: " + (d.carneDigital.fuentes || []).join(", ")));
      carne.appendChild(cRow);
      carne.appendChild(layout.el("p", "seguimiento-note", d.carneDigital.nota || ""));
      inner.appendChild(carne);

      inner.appendChild(field.fieldText({ id: "saldoPendiente", label: "Saldo por cancelar", value: d.saldo, disabled: true, helpText: "No se entrega con saldos pendientes (validado contra I-10)." }));
      var saldoOk = field.fieldCheckbox({ id: "saldosCancelados", label: "Saldos pendientes cancelados", checked: true });
      inner.appendChild(saldoOk);

      var entrega = layout.el("fieldset", "wizard-section");
      entrega.appendChild(layout.el("legend", "wizard-section-title", "Entrega y firma de recibido"));
      var grid = layout.el("div", "wizard-grid");
      grid.appendChild(field.fieldDate({ id: "fechaEntrega", label: "Fecha de entrega", value: "2026-10-15" }));
      entrega.appendChild(grid);
      inner.appendChild(entrega);

      var errBox = layout.el("div", "auth-error", "");
      errBox.setAttribute("aria-live", "polite");
      inner.appendChild(errBox);

      if (entregado) {
        var res = layout.el("div", "app-alert app-alert--info");
        res.appendChild(layout.el("span", "app-alert__title", "Expediente ENTREGADO"));
        res.appendChild(layout.el("span", "app-alert__text", "Documentos entregados: " + entregado.docs.join(", ") + " · Fecha: " + entregado.fecha + "."));
        inner.appendChild(res);
      }

      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({
        variant: "primary",
        text: entregado ? "Entrega registrada" : "Registrar entrega",
        disabled: !!entregado,
        onClick: function () {
          errBox.textContent = "";
          errBox.classList.remove("is-visible");
          var chk = inner.querySelector("#saldosCancelados");
          var fecha = inner.querySelector("#fechaEntrega");
          if (chk && !chk.checked) { errBox.textContent = "No se puede entregar con saldos pendientes (CP-12)."; errBox.classList.add("is-visible"); return; }
          if (seleccion.length === 0) { errBox.textContent = "Seleccione al menos un documento a entregar."; errBox.classList.add("is-visible"); return; }
          entregado = { docs: seleccion.slice(), fecha: fecha ? fecha.value : "—" };
          renderContent();
        },
      }));
      if (opts.onNavigate) actions.appendChild(button({ variant: "ghost", text: "Archivo y reactivación", onClick: function () { opts.onNavigate("#/interno/archivo"); } }));
      inner.appendChild(actions);

      inner.appendChild(layout.el("p", "seguimiento-note", "Descarga/entrega solo con autorización (CP-12). Identidad original obligatoria."));
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
      inner.appendChild(layout.pageHeader("Entrega en ventanilla", "Preparando la entrega…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Verificando identidad y saldos…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderError() {
      renderSimple("Entrega en ventanilla", "No se pudo registrar", global.tm.fixtures.message("I-12", "error", "No pudimos registrar la entrega."), true);
    }

    function show(state) {
      global.tm.fixtures.setScenario(state);
      if (state === "carga") { renderLoading(); setTimeout(renderContent, 700); return; }
      if (state === "error") { renderError(); return; }
      if (state === "vacio") { renderSimple("Entrega en ventanilla", "Sin pendientes", "No hay entregas pendientes."); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i12 = { renderI12: renderI12 };
})(window);

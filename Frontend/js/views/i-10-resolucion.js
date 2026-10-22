/**
 * I-10 — Resolución (aprobar / negar) (Fase E).
 * Decisión final del expediente (permiso `resolver`). Solo transiciones
 * disponibles; motivo obligatorio si NEGADA; confirmación antes de enviar.
 * Firma digital simulada. 4 estados de vista.
 * Script clásico: expone `tm.views.i10.renderI10`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var confirmModal = global.tm.ui.confirmModal;
  var signaturePad = global.tm.ui.signaturePad;
  var perms = global.tm.perms;
  var api = global.tm.api;

  var FALLBACK = { expediente: "—", tramite: "—", estadoActual: "EN RESOLUCIÓN", verificacionesConcluidas: [], inconsistenciasAbiertas: 0, motivosNegacion: ["Otro (detallar)"], transiciones: [], saldo: "—", numeroResolucion: "—", fechaResolucion: "—", vigenciaDesde: "", vigenciaHasta: "" };

  function datos() {
    return global.tm.fixtures.data("I-10", "exito") || FALLBACK;
  }

  function optionsTo(list) {
    return list.map(function (v) { return { label: v, value: v }; });
  }

  function renderI10(container, opts) {
    opts = opts || {};
    var d = datos();
    var resultado = "APROBADA";
    var resuelto = null;

    function cargarReal(callback) {
      if (!api || !api.isOnline() || api.isDemoSession()) { callback(null); return; }
      var seleccionado = global.tm.expediente && global.tm.expediente.getSelected ? global.tm.expediente.getSelected() : null;
      function cargar(id) {
        api.request("GET", "/expedientes/" + encodeURIComponent(id), { pantalla: "I-10" }, function (err, expediente) {
          if (err) { callback(err); return; }
          d.id = expediente.id;
          d.expediente = expediente.numero || expediente.id;
          d.tramite = expediente.tipoTramite || "—";
          d.estadoActual = expediente.estado || "—";
          d.version = expediente.version;
          d.verificacionesConcluidas = [];
          d.inconsistenciasAbiertas = 0;
          d.numeroResolucion = "—";
          d.fechaResolucion = "—";
          d.transiciones = [{ accion: "RESUELTO", disponible: d.estadoActual === "EN_RESOLUCION", motivo: d.estadoActual === "EN_RESOLUCION" ? "" : "El expediente debe estar EN_RESOLUCION." }];
          callback(null);
        });
      }
      if (seleccionado && seleccionado.id) { cargar(seleccionado.id); return; }
      api.request("GET", "/expedientes?estado=EN_RESOLUCION&pagina=0&tamano=20", { pantalla: "I-10" }, function (err, page) {
        var lista = page && page.contenido ? page.contenido : [];
        if (err || !lista.length) { callback(err || { mensajeUsuario: "No hay expedientes en resolución." }); return; }
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

    function detailRow(label, value) {
      var row = layout.el("div", "detail-row");
      row.appendChild(layout.el("span", "detail-row__label", label));
      row.appendChild(layout.el("span", "detail-row__value", value));
      return row;
    }

    function renderContent() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Resolución (aprobar / negar)", "Decisión final del expediente — permiso «resolver»"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", null, ""));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var card = layout.el("div", "detail-card");
      card.appendChild(detailRow("Expediente", d.expediente + " · " + d.tramite));
      card.appendChild(detailRow("Estado actual", resuelto ? resuelto.estado : d.estadoActual));
      card.appendChild(detailRow("N.º de resolución", d.numeroResolucion));
      card.appendChild(detailRow("Fecha de resolución", d.fechaResolucion));
      card.appendChild(detailRow("Saldo por cancelar", d.saldo));
      inner.appendChild(card);

      var verify = layout.el("div", "seguimiento-block");
      verify.appendChild(layout.el("h2", "seguimiento-block__title", "Verificaciones concluidas (I-07)"));
      for (var v = 0; v < d.verificacionesConcluidas.length; v++) {
        var row = layout.el("div", "detail-row");
        row.appendChild(layout.el("span", "detail-row__label", d.verificacionesConcluidas[v].institucion));
        row.appendChild(layout.el("span", "badge badge--" + (d.verificacionesConcluidas[v].resultado === "OK" ? "success" : "danger"), d.verificacionesConcluidas[v].resultado));
        verify.appendChild(row);
      }
      if (d.inconsistenciasAbiertas > 0) {
        verify.appendChild(layout.el("p", "seguimiento-note", "Hay " + d.inconsistenciasAbiertas + " inconsistencia(s) abiertas: no se puede resolver (regla de I-07)."));
      } else {
        verify.appendChild(layout.el("p", "seguimiento-note", "Ninguna inconsistencia abierta."));
      }
      inner.appendChild(verify);

      var trans = layout.el("div", "seguimiento-block");
      trans.appendChild(layout.el("h2", "seguimiento-block__title", "Transiciones disponibles"));
      for (var t = 0; t < d.transiciones.length; t++) {
        var tr = d.transiciones[t];
        var rowT = layout.el("div", "detail-row");
        rowT.appendChild(layout.el("span", "detail-row__label", tr.accion));
        rowT.appendChild(layout.el("span", "detail-row__value", tr.disponible ? "Disponible" : "Deshabilitada — " + tr.motivo));
        trans.appendChild(rowT);
      }
      inner.appendChild(trans);

      if (!resuelto) {
        var conf = layout.el("fieldset", "wizard-section");
        conf.appendChild(layout.el("legend", "wizard-section-title", "Resultado"));
        var radio = layout.el("div", "radio-group");
        [["APROBADA", "APROBADA"], ["NEGADA", "NEGADA"]].forEach(function (par) {
          var opt = layout.el("label", "radio-option");
          var inp = layout.el("input");
          inp.type = "radio";
          inp.name = "resultado";
          inp.value = par[0];
          inp.checked = resultado === par[0];
          inp.addEventListener("change", function () { resultado = par[0]; renderContent(); });
          opt.appendChild(inp);
          opt.appendChild(layout.el("span", null, par[1]));
          radio.appendChild(opt);
        });
        conf.appendChild(radio);
        inner.appendChild(conf);

        var form = layout.el("fieldset", "wizard-section");
        form.appendChild(layout.el("legend", "wizard-section-title", "Datos de la resolución"));
        var grid = layout.el("div", "wizard-grid");
        grid.appendChild(field.fieldDate({ id: "vigDesde", label: "Vigencia del permiso — desde", value: d.vigenciaDesde }));
        grid.appendChild(field.fieldDate({ id: "vigHasta", label: "Vigencia del permiso — hasta", value: d.vigenciaHasta, helpText: "Alimenta P-22 y las alertas de prórroga." }));
        form.appendChild(grid);

        if (resultado === "NEGADA") {
          var grid2 = layout.el("div", "wizard-grid");
          grid2.appendChild(field.fieldSelect({ id: "motivoNeg", label: "Motivo de negación", options: optionsTo(d.motivosNegacion) }));
          form.appendChild(grid2);
        }
        form.appendChild(field.fieldTextarea({ id: "condiciones", label: "Condiciones de la resolución (opcional)", rows: 2 }));
        form.appendChild(field.fieldTextarea({ id: "detalleNeg", label: resultado === "NEGADA" ? "Detalle del motivo (obligatorio)" : "Detalle del motivo (opcional)", rows: 2 }));

        var firma = layout.el("div", "form-field");
        firma.appendChild(layout.el("span", "form-field__label", "Firma digital del resolutor"));
        var sig = signaturePad({ helpText: "Firma simulada en el MVP." });
        firma.appendChild(sig);
        form.appendChild(firma);
        inner.appendChild(form);

        var errBox = layout.el("div", "auth-error", "");
        errBox.setAttribute("aria-live", "polite");
        inner.appendChild(errBox);

        var actions = layout.el("div", "toolbar__actions");
        var resolverBtn = button({
          variant: resultado === "NEGADA" ? "danger" : "primary",
          text: "Registrar resolución " + resultado,
          onClick: function () {
            errBox.textContent = "";
            errBox.classList.remove("is-visible");
            var detalle = form.querySelector("#detalleNeg");
            if (resultado === "NEGADA" && (!detalle || !detalle.value.trim())) {
              errBox.textContent = "El motivo de negación es obligatorio en estados finales.";
              errBox.classList.add("is-visible");
              return;
            }
            if (!sig.isDirty()) {
              errBox.textContent = "La firma digital del resolutor es obligatoria.";
              errBox.classList.add("is-visible");
              return;
            }
            confirmModal("Confirmar resolución", "¿Registrar el expediente como " + resultado + "?", {
              onConfirm: function () {
                var detalleTexto = detalle ? detalle.value.trim() : "";
                if (api && api.isOnline() && d.id) {
                  api.request("PATCH", "/expedientes/" + encodeURIComponent(d.id) + "/estado", {
                    pantalla: "I-10",
                    body: { estadoNuevo: "RESUELTO", motivo: detalleTexto || "Resolución registrada desde I-10.", version: d.version, resultado: resultado },
                  }, function (err, actualizado) {
                    if (err) {
                      errBox.textContent = err.mensajeUsuario || "No se pudo registrar la resolución.";
                      errBox.classList.add("is-visible");
                      return;
                    }
                    d.version = actualizado && actualizado.version != null ? actualizado.version : d.version;
                    d.estadoActual = actualizado && actualizado.estado ? actualizado.estado : "RESUELTO";
                    resuelto = { estado: "RESUELTO (" + resultado + ")", vigencia: (d.vigenciaDesde || "—") + " → " + (d.vigenciaHasta || "—") };
                    renderContent();
                  });
                  return;
                }
                resuelto = { estado: "RESUELTO (" + resultado + ")", vigencia: (d.vigenciaDesde || "—") + " → " + (d.vigenciaHasta || "—") };
                renderContent();
              },
            });
          },
        });
        actions.appendChild(perms.can(perms.PERMS.RESOLVER) ? resolverBtn : perms.notice(perms.PERMS.RESOLVER, "Solo un rol con permiso «resolver» puede decidir el expediente."));
        inner.appendChild(actions);
      } else {
        var res = layout.el("div", "app-alert app-alert--" + (resultado === "APROBADA" ? "info" : "warning"));
        res.appendChild(layout.el("span", "app-alert__title", "Expediente " + resuelto.estado));
        res.appendChild(layout.el("span", "app-alert__text", "Vigencia del permiso: " + resuelto.vigencia + ". Siguiente paso: notificación (I-11)."));
        inner.appendChild(res);
        var act2 = layout.el("div", "toolbar__actions");
        if (opts.onNavigate) act2.appendChild(button({ variant: "primary", text: "Ir a notificación", onClick: function () { opts.onNavigate("#/interno/notificacion"); } }));
        inner.appendChild(act2);
      }

      container.appendChild(inner);
    }

    function renderStatic(titulo, subtitulo, mensajes) {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader(titulo, subtitulo));
      var box = layout.el("div", "app-empty");
      for (var i = 0; i < mensajes.length; i++) box.appendChild(layout.el("p", null, mensajes[i]));
      inner.appendChild(box);
      container.appendChild(inner);
    }

    function renderLoading() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Resolución (aprobar / negar)", "Cargando expediente…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Reuniendo verificaciones y transiciones…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderError() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Resolución (aprobar / negar)", "No se pudo cargar"));
      var a = layout.el("div", "app-alert app-alert--warning");
      a.appendChild(layout.el("span", "app-alert__title", "La vista conserva el estado original (CP-04)"));
      a.appendChild(layout.el("span", "app-alert__text", global.tm.fixtures.message("I-10", "error", "No pudimos procesar la resolución.")));
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
        setTimeout(function () {
          cargarReal(function (err) { if (err) { renderError(); return; } renderContent(); });
        }, 700);
        return;
      }
      if (state === "error") { renderError(); return; }
      if (state === "vacio") { renderStatic("Resolución (aprobar / negar)", "Sin expedientes", ["No hay expedientes en resolución."]); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i10 = { renderI10: renderI10 };
})(window);

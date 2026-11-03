/**
 * I-04 — Recepción y verificación de completitud (Fase E).
 * Verifica identidad, pagos, sello de ingreso, RUEX y completitud; emite el
 * recibo (RECIBIDO) o exige observación (CON OBSERVACIONES). 4 estados de vista.
 * Script clásico: expone `tm.views.i04.renderI04`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var table = global.tm.ui.table;
  var api = global.tm.api;

  var FALLBACK = { expediente: "—", tramite: "—", presentante: {}, sellado: {}, pagos: [], requisitos: [], recibidoAutomatico: "—" };

  function datos() {
    return global.tm.fixtures.data("I-04", "exito") || FALLBACK;
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

  function renderI04(container, opts) {
    opts = opts || {};
    var d = datos();
    var req = d.requisitos.map(function (r) { return { nombre: r.nombre, casilla: r.casilla, estado: r.estado, motivo: r.motivo }; });
    var recibo = null;

    function cargarReal(callback) {
      if (!api || !api.isOnline() || api.isDemoSession()) { callback(null); return; }
      var seleccionado = global.tm.expediente && global.tm.expediente.getSelected ? global.tm.expediente.getSelected() : null;
      function cargar(id) {
        api.request("GET", "/expedientes/" + encodeURIComponent(id), { pantalla: "I-04" }, function (err, expediente) {
          if (err) { callback(err); return; }
          d.id = expediente.id;
          d.expediente = expediente.numero || expediente.id;
          d.tramite = expediente.tipoTramite || "—";
          d.estado = expediente.estado || "—";
          d.version = expediente.version;
          d.presentante = { nombre: "—", documento: "—", condicion: "—" };
          d.sellado = { identidad: "Consulta disponible en el backend", selloIngreso: "Consulta disponible en el backend", ruex: "Consulta disponible en el backend" };
          d.pagos = [];
          d.recibidoAutomatico = expediente.fechaActualizacion || "—";
          d.requisitos = [];
          api.request("GET", "/expedientes/" + encodeURIComponent(id) + "/documentos", { pantalla: "I-04" }, function (docErr, documentos) {
            if (docErr) { callback(docErr); return; }
            var docs = documentos || [];
            for (var i = 0; i < docs.length; i++) {
              d.requisitos.push({ nombre: docs[i].tipoDocumental || docs[i].nombreArchivo || "Documento", casilla: docs[i].nombreArchivo || "Cargado", estado: docs[i].estadoRevision === "APROBADO" ? "Completo" : "Incompleto", motivo: docs[i].estadoRevision || "" });
            }
            req = d.requisitos.map(function (r) { return { nombre: r.nombre, casilla: r.casilla, estado: r.estado, motivo: r.motivo }; });
            callback(null);
          });
        });
      }
      if (seleccionado && seleccionado.id) { cargar(seleccionado.id); return; }
      api.request("GET", "/expedientes?estado=RECIBIDO&pagina=0&tamano=20", { pantalla: "I-04" }, function (err, page) {
        var lista = page && page.contenido ? page.contenido : [];
        if (err || !lista.length) { callback(err || { mensajeUsuario: "No hay expedientes recibidos para verificar." }); return; }
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

    function seccionSealed(titulo, texto) {
      var row = layout.el("div", "verified-field__meta");
      row.appendChild(layout.el("span", "badge badge--verified", "verificado"));
      row.appendChild(layout.el("span", null, texto));
      return row;
    }

    function renderContent() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Recepción y verificación de completitud", "Revisión del expediente presentado en ventanilla"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", null, ""));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var card = layout.el("div", "detail-card");
      card.appendChild(layout.el("h2", "seguimiento-block__title", "Expediente"));
      card.appendChild(detailRow("N.º de expediente", d.expediente));
      card.appendChild(detailRow("Trámite", d.tramite));
      card.appendChild(detailRow("Presentante", (d.presentante.nombre || "—") + " · " + (d.presentante.documento || "—")));
      card.appendChild(detailRow("Condición", d.presentante.condicion || "—"));
      card.appendChild(detailRow("Fecha y hora de recibido", d.recibidoAutomatico));
      inner.appendChild(card);

      var sealed = layout.el("div", "detail-card");
      sealed.appendChild(layout.el("h2", "seguimiento-block__title", "Consultas selladas (origen S)"));
      sealed.appendChild(seccionSealed("Identidad del presentante", d.sellado.identidad || "—"));
      sealed.appendChild(seccionSealed("Sello de ingreso", d.sellado.selloIngreso || "—"));
      sealed.appendChild(seccionSealed("Estado del RUEX", d.sellado.ruex || "—"));
      inner.appendChild(sealed);

      var pagosBlock = layout.el("div", "seguimiento-block");
      pagosBlock.appendChild(layout.el("h2", "seguimiento-block__title", "Verificación de pagos"));
      pagosBlock.appendChild(table({
        headers: [{ label: "Concepto" }, { label: "Monto", align: "right" }, { label: "Banco" }, { label: "Estado" }],
        rows: d.pagos.map(function (p) {
          return [{ text: p.concepto }, { text: p.monto, align: "right" }, { text: p.banco }, { node: layout.el("span", "badge badge--success", p.estado) }];
        }),
      }));
      pagosBlock.appendChild(layout.el("p", "seguimiento-note", "Montos de referencia: B/.250.00 (Tesoro Nacional) y B/.800.00 (SNM)."));
      inner.appendChild(pagosBlock);

      var reqBlock = layout.el("fieldset", "wizard-section");
      reqBlock.appendChild(layout.el("legend", "wizard-section-title", "Revisión casilla por casilla (igual que P-14)"));
      var list = layout.el("div", "checklist");
      for (var i = 0; i < req.length; i++) {
        (function (r) {
          var item = layout.el("div", "checklist__item");
          var main = layout.el("div", "checklist__item-main");
          main.appendChild(layout.el("span", "checklist__name", r.nombre));
          main.appendChild(layout.el("span", "checklist__meta", r.casilla + (r.motivo ? " · " + r.motivo : "")));
          item.appendChild(main);
          item.appendChild(inlineSelect(optionsTo(["Completo", "Incompleto"]), r.estado, function (v) {
            r.estado = v;
            renderContent();
          }));
          list.appendChild(item);
        })(req[i]);
      }
      reqBlock.appendChild(list);
      inner.appendChild(reqBlock);

      var obs = field.fieldTextarea({
        id: "obsRecepcion",
        label: "Observaciones del Recepcionista",
        rows: 3,
        required: false,
        value: recibo ? recibo.observaciones : "",
        helpText: "Obligatorio si el expediente está incompleto («No se recibirán solicitudes incompletas»).",
      });
      inner.appendChild(obs);

      if (recibo) {
        var res = layout.el("div", "app-alert app-alert--" + (recibo.estado === "RECIBIDO" ? "info" : "warning"));
        res.appendChild(layout.el("span", "app-alert__title", "Expediente " + recibo.estado));
        res.appendChild(layout.el("span", "app-alert__text", "Registro N.º " + recibo.registro + " · Trámite N.º " + recibo.tramite + " · Expediente N.º " + recibo.expediente));
        inner.appendChild(res);
      }

      var errBox = layout.el("div", "auth-error", "");
      errBox.setAttribute("aria-live", "polite");
      inner.appendChild(errBox);

      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({
        variant: "primary",
        text: recibo ? "Expediente ya recibido" : "Registrar recibo de expediente",
        disabled: !!recibo,
        onClick: function () {
          errBox.textContent = "";
          errBox.classList.remove("is-visible");
          var incompletos = req.filter(function (r) { return r.estado === "Incompleto"; });
          var ta = inner.querySelector("#obsRecepcion");
          var texto = ta ? ta.value.trim() : "";
          if (incompletos.length && !texto) {
            errBox.textContent = "El expediente está incompleto: registre una observación antes de continuar.";
            errBox.classList.add("is-visible");
            return;
          }
          function guardarLocal() {
            var n = "2026-" + String(Math.floor(1000 + Math.random() * 9000));
            recibo = { estado: incompletos.length ? "CON OBSERVACIONES" : "RECIBIDO", registro: n, tramite: "TRM-" + n, expediente: d.expediente, observaciones: texto };
            renderContent();
          }
          if (!(api && api.isOnline() && d.id)) { guardarLocal(); return; }
          function cambiarEstado() {
            var nuevo = incompletos.length ? "CON_OBSERVACIONES" : "EN_ANALISIS";
            api.request("PATCH", "/expedientes/" + encodeURIComponent(d.id) + "/estado", {
              pantalla: "I-04",
              body: { estadoNuevo: nuevo, motivo: texto || "Verificación de completitud realizada desde I-04.", version: d.version },
            }, function (stateErr, actualizado) {
              if (stateErr) { errBox.textContent = stateErr.mensajeUsuario || "No se pudo actualizar el estado del expediente."; errBox.classList.add("is-visible"); return; }
              d.version = actualizado && actualizado.version != null ? actualizado.version : d.version;
              d.estado = actualizado && actualizado.estado ? actualizado.estado : nuevo;
              recibo = { estado: incompletos.length ? "CON OBSERVACIONES" : "RECIBIDO", registro: d.expediente, tramite: d.tramite, expediente: d.expediente, observaciones: texto };
              renderContent();
            });
          }
          if (incompletos.length) {
            api.request("POST", "/expedientes/" + encodeURIComponent(d.id) + "/observaciones", { pantalla: "I-04", body: { texto: texto } }, function (obsErr) {
              if (obsErr) { errBox.textContent = obsErr.mensajeUsuario || "No se pudo registrar la observación."; errBox.classList.add("is-visible"); return; }
              cambiarEstado();
            });
          } else {
            cambiarEstado();
          }
        },
      }));
      if (opts.onNavigate) actions.appendChild(button({ variant: "ghost", text: "Pasar a asignación", onClick: function () { opts.onNavigate("#/interno/asignacion"); } }));
      inner.appendChild(actions);

      container.appendChild(inner);
    }

    function renderLoading() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Recepción y verificación de completitud", "Verificando el expediente…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Comprobando identidad, pagos y completitud…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderEmpty() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Recepción y verificación de completitud", "Sin expediente"));
      var e = layout.el("div", "app-empty");
      e.appendChild(layout.el("p", null, "No hay un expediente seleccionado para verificar."));
      e.appendChild(layout.el("p", null, "Escanea el QR o selecciónalo desde la bandeja de recepción (I-03)."));
      inner.appendChild(e);
      container.appendChild(inner);
    }

    function renderError() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Recepción y verificación de completitud", "No se pudo cargar"));
      var a = layout.el("div", "app-alert app-alert--warning");
      a.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
      a.appendChild(layout.el("span", "app-alert__text", global.tm.fixtures.message("I-04", "error", "No pudimos cargar el expediente.")));
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
  global.tm.views.i04 = { renderI04: renderI04 };
})(window);

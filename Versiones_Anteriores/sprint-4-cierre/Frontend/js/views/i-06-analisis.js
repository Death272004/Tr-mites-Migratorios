/**
 * I-06 — Análisis del expediente (checklist) (Fase E).
 * Revisa requisitos y vigencias, pide verificaciones externas y decide la
 * conformidad (ADMITIDO) o emite observación (CON OBSERVACIONES). 4 estados.
 * Script clásico: expone `tm.views.i06.renderI06`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var table = global.tm.ui.table;
  var perms = global.tm.perms;
  var timeline = global.tm.ui.timeline;

  var FALLBACK = { expediente: "—", tramite: "—", estadoActual: "EN ANÁLISIS", requisitosComunes: [], requisitosEspecificos: [], verificaciones: [], verificacionesRequeridas: [], historial: [] };

  function datos() {
    return global.tm.fixtures.data("I-06", "exito") || FALLBACK;
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

  function renderI06(container, opts) {
    opts = opts || {};
    var d = datos();
    var comunes = d.requisitosComunes.map(function (r) { return { nombre: r.nombre, estado: r.estado, vigencia: r.vigencia }; });
    var especificos = d.requisitosEspecificos.map(function (r) { return { nombre: r.nombre, estado: r.estado, vigencia: r.vigencia }; });
    var conforme = "SI";
    var requeridas = (d.verificacionesRequeridas || []).slice();
    var resultado = null;
    var historial = (d.historial || []).map(function (h) { return { fecha: h.fecha, evento: h.evento }; });

    function historialItems() {
      return historial.map(function (h, i) {
        return {
          fecha: h.fecha,
          titulo: h.evento,
          done: i < historial.length - 1,
          active: i === historial.length - 1,
        };
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

    function requisitosBlock(titulo, arr, onChangeResp) {
      var block = layout.el("fieldset", "wizard-section");
      block.appendChild(layout.el("legend", "wizard-section-title", titulo));
      var list = layout.el("div", "checklist");
      for (var i = 0; i < arr.length; i++) {
        (function (r) {
          var item = layout.el("div", "checklist__item");
          var main = layout.el("div", "checklist__item-main");
          main.appendChild(layout.el("span", "checklist__name", r.nombre));
          var meta = r.vigencia || "";
          if (r.estado === "Vencido") meta += (meta ? " · " : "") + "vencido";
          if (meta) main.appendChild(layout.el("span", "checklist__meta", meta));
          item.appendChild(main);
          item.appendChild(inlineSelect(optionsTo(["Conforme", "Observado", "Vencido"]), r.estado, function (v) { r.estado = v; renderContent(); }));
          list.appendChild(item);
        })(arr[i]);
      }
      block.appendChild(list);
      return block;
    }

    function renderContent() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Análisis del expediente", "Revisión de requisitos, vigencias y verificaciones"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", null, ""));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var card = layout.el("div", "detail-card");
      card.appendChild(layout.el("div", "detail-row")).appendChild(layout.el("span", "detail-row__label", "Expediente"));
      card.lastChild.appendChild(layout.el("span", "detail-row__value", d.expediente + " · " + d.tramite));
      card.appendChild(layout.el("div", "detail-row")).appendChild(layout.el("span", "detail-row__label", "Estado actual"));
      card.lastChild.appendChild(layout.el("span", "detail-row__value", resultado ? resultado.estado : d.estadoActual));
      inner.appendChild(card);

      var hist = layout.el("div", "seguimiento-block");
      hist.appendChild(layout.el("h2", "seguimiento-block__title", "Historial del expediente"));
      hist.appendChild(table({ headers: [{ label: "Fecha y hora" }, { label: "Evento" }], rows: d.historial.map(function (h) { return [{ text: h.fecha }, { text: h.evento }]; }) }));
      inner.appendChild(hist);

      inner.appendChild(requisitosBlock("Requisitos comunes (Art. 28)", comunes));
      inner.appendChild(requisitosBlock("Requisitos específicos del permiso", especificos));

      var vig = layout.el("p", "seguimiento-note", "Vigencias: antecedentes 30 días; salud, estatus migratorio y carta bancaria 90 días; ficha CSS 90 días y 9 cuotas.");
      inner.appendChild(vig);

      var conf = layout.el("fieldset", "wizard-section");
      conf.appendChild(layout.el("legend", "wizard-section-title", "¿Solicitud conforme?"));
      var radio = layout.el("div", "radio-group");
      [["SI", "SÍ, admisión (I-09/I-10)"], ["NO", "NO, emitir observación (I-08)"]].forEach(function (par) {
        var opt = layout.el("label", "radio-option");
        var inp = layout.el("input");
        inp.type = "radio";
        inp.name = "conforme";
        inp.value = par[0];
        inp.checked = conforme === par[0];
        inp.addEventListener("change", function () { conforme = par[0]; renderContent(); });
        opt.appendChild(inp);
        opt.appendChild(layout.el("span", null, par[1]));
        radio.appendChild(opt);
      });
      conf.appendChild(radio);
      inner.appendChild(conf);

      var verifyBlock = layout.el("fieldset", "wizard-section");
      verifyBlock.appendChild(layout.el("legend", "wizard-section-title", "Verificaciones externas requeridas"));
      for (var v = 0; v < d.verificaciones.length; v++) {
        (function (nombre) {
          verifyBlock.appendChild(field.fieldCheckbox({
            id: "verif-" + nombre.replace(/\s+/g, "-").toLowerCase(),
            label: nombre,
            checked: requeridas.indexOf(nombre) >= 0,
            onChange: function (checked) {
              var idx = requeridas.indexOf(nombre);
              if (checked && idx < 0) requeridas.push(nombre);
              if (!checked && idx >= 0) requeridas.splice(idx, 1);
            },
          }));
        })(d.verificaciones[v]);
      }
      inner.appendChild(verifyBlock);

      inner.appendChild(field.fieldTextarea({ id: "obsAnalista", label: "Observación del Analista", rows: 3, helpText: "Obligatorio si la solicitud no es conforme (ítems observados con plazo de atención)." }));
      inner.appendChild(field.fieldTextarea({ id: "dictamen", label: "Dictamen técnico preliminar (opcional)", rows: 2 }));

      var errBox = layout.el("div", "auth-error", "");
      errBox.setAttribute("aria-live", "polite");
      inner.appendChild(errBox);

      if (resultado) {
        var res = layout.el("div", "app-alert app-alert--" + (resultado.estado === "ADMITIDO" ? "info" : "warning"));
        res.appendChild(layout.el("span", "app-alert__title", "Resolución del análisis: " + resultado.estado));
        res.appendChild(layout.el("span", "app-alert__text", resultado.detalle));
        inner.appendChild(res);
      }

      var histBlock = layout.el("div", "seguimiento-block");
      histBlock.appendChild(layout.el("h2", "seguimiento-block__title", "Historial del expediente"));
      histBlock.appendChild(timeline({ items: historialItems(), emptyText: "Sin eventos registrados." }));
      inner.appendChild(histBlock);

      var actions = layout.el("div", "toolbar__actions");
      var dictamenBtn = button({
        variant: "primary",
        text: "Guardar dictamen",
        onClick: function () {
          errBox.textContent = "";
          errBox.classList.remove("is-visible");
          var ta = inner.querySelector("#obsAnalista");
          var texto = ta ? ta.value.trim() : "";
          var vencidos = comunes.concat(especificos).filter(function (r) { return r.estado === "Vencido" || r.estado === "Observado"; });
          if (conforme === "NO" && !texto) {
            errBox.textContent = "Indique la observación del analista para los ítems no conformes.";
            errBox.classList.add("is-visible");
            return;
          }
          if (conforme === "SI" && vencidos.length) {
            errBox.textContent = "Hay ítems observados o vencidos: la solicitud no puede admitirse sin resolverlos.";
            errBox.classList.add("is-visible");
            return;
          }
          resultado = conforme === "SI"
            ? { estado: "ADMITIDO", detalle: "Solicitud conforme. Verificaciones requeridas: " + (requeridas.join(", ") || "ninguna") + "." }
            : { estado: "CON OBSERVACIONES", detalle: "Se emitirá una observación (I-08) por los ítems marcados." };
          historial.push({ fecha: "2026-10-11", evento: "DICTAMEN — " + resultado.estado });
          renderContent();
        },
      });
      actions.appendChild(perms.can(perms.PERMS.OBSERVAR) ? dictamenBtn : perms.notice(perms.PERMS.OBSERVAR, "Solo un rol con permiso «observar» puede emitir el dictamen."));
      if (opts.onNavigate) {
        actions.appendChild(button({ variant: "ghost", text: "Verificaciones (I-07)", onClick: function () { opts.onNavigate("#/interno/verificaciones"); } }));
        actions.appendChild(button({ variant: "ghost", text: "Resolución (I-10)", onClick: function () { opts.onNavigate("#/interno/resolucion"); } }));
      }
      inner.appendChild(actions);

      container.appendChild(inner);
    }

    function renderLoading() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Análisis del expediente", "Cargando checklist…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Revisando requisitos y vigencias…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderEmpty() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Análisis del expediente", "Sin expedientes"));
      var e = layout.el("div", "app-empty");
      e.appendChild(layout.el("p", null, "No hay expedientes en análisis."));
      inner.appendChild(e);
      container.appendChild(inner);
    }

    function renderError() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Análisis del expediente", "No se pudo cargar"));
      var a = layout.el("div", "app-alert app-alert--warning");
      a.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
      a.appendChild(layout.el("span", "app-alert__text", global.tm.fixtures.message("I-06", "error", "No pudimos cargar el expediente.")));
      inner.appendChild(a);
      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { show("carga"); } }));
      inner.appendChild(actions);
      container.appendChild(inner);
    }

    function cargarReal(callback) {
      if (!global.tm.api.isOnline()) { callback(); return; }
      global.tm.api.request("GET", "/expedientes?tamano=100", { pantalla: "I-06" }, function (err, page) {
        if (err) { callback(err); return; }
        var lista = page && page.contenido ? page.contenido : [];
        var expediente = lista.filter(function (e) { return e.estado === "EN_ANALISIS" || e.estado === "ADMITIDO"; })[0] || lista[0];
        if (!expediente) { d.expediente = "—"; d.tramite = "—"; d.requisitosComunes = []; d.requisitosEspecificos = []; callback(); return; }
        d.expediente = expediente.numero || expediente.id;
        d.tramite = expediente.tipoTramite || "—";
        d.estadoActual = expediente.estado || "—";
        global.tm.api.request("GET", "/expedientes/" + encodeURIComponent(expediente.id) + "/historial", { pantalla: "I-06" }, function (histErr, hist) {
          if (!histErr && Array.isArray(hist)) d.historial = hist.map(function (h) { return { fecha: h.fecha, evento: (h.estadoAnterior || "") + " → " + h.estadoNuevo + (h.motivo ? " — " + h.motivo : "") }; });
          global.tm.api.request("GET", "/expedientes/" + encodeURIComponent(expediente.id) + "/documentos", { pantalla: "I-06" }, function (docErr, docs) {
            var documentos = !docErr && Array.isArray(docs) ? docs : [];
            d.requisitosComunes = documentos.map(function (doc) { return { nombre: doc.tipoDocumental || doc.nombre || "Documento", estado: "Conforme", vigencia: doc.fechaCarga || "Cargado" }; });
            d.requisitosEspecificos = [];
            d.verificaciones = d.verificaciones || [];
            callback();
          });
        });
      });
    }

    function show(state) {
      global.tm.fixtures.setScenario(state);
      if (state === "carga") { renderLoading(); setTimeout(function () { cargarReal(function (err) { if (err) { renderError(); return; } if (d.expediente === "—") { renderEmpty(); return; } renderContent(); }); }, 700); return; }
      if (state === "error") { renderError(); return; }
      if (state === "vacio") { renderEmpty(); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i06 = { renderI06: renderI06 };
})(window);

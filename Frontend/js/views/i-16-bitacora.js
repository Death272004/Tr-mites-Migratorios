/**
 * I-16 — Bitácora de auditoría (Fase F).
 * Consulta (solo lectura) de la bitácora inmutable con filtros y exportación
 * CSV. Sin edición ni borrado. 4 estados de vista.
 * Script clásico: expone `tm.views.i16.renderI16`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var table = global.tm.ui.table;
  var api = global.tm.api;

  var FALLBACK = { tipos: [], usuarios: [], instituciones: [], eventos: [] };

  function datos() {
    return global.tm.fixtures.data("I-16", "exito") || FALLBACK;
  }

  function optionsTo(list) {
    return list.map(function (v) { return { label: v, value: v }; });
  }

  function renderI16(container, opts) {
    opts = opts || {};
    var d = datos();
    var filtro = { usuario: "", tipo: "", expediente: "", desde: "", hasta: "" };

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

    function filtrados() {
      return d.eventos.filter(function (e) {
        if (filtro.usuario && e.usuario !== filtro.usuario) return false;
        if (filtro.tipo && e.tipo !== filtro.tipo) return false;
        if (filtro.expediente && e.expediente.indexOf(filtro.expediente) < 0) return false;
        if (filtro.desde && e.fecha.slice(0, 10) < filtro.desde) return false;
        if (filtro.hasta && e.fecha.slice(0, 10) > filtro.hasta) return false;
        return true;
      });
    }

    function renderContent() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Bitácora de auditoría", "Accesos y operaciones — solo lectura"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", "badge badge--info", filtrados().length + " eventos"));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var note = layout.el("div", "app-alert app-alert--info");
      note.appendChild(layout.el("span", "app-alert__title", "Registros inmutables (Ley 81 de 2019)"));
      note.appendChild(layout.el("span", "app-alert__text", "Sin edición ni borrado desde la aplicación. La propia consulta de la bitácora queda registrada. Toda denegación (403/404) genera evento."));
      inner.appendChild(note);

      var filters = layout.el("fieldset", "wizard-section");
      filters.appendChild(layout.el("legend", "wizard-section-title", "Filtros"));
      var grid = layout.el("div", "wizard-grid");
      var fUsuario = field.fieldSelect({ id: "bitUsuario", label: "Usuario", options: [{ label: "Todos", value: "" }].concat(optionsTo(d.usuarios)), value: filtro.usuario });
      var fTipo = field.fieldSelect({ id: "bitTipo", label: "Tipo de acción", options: [{ label: "Todos", value: "" }].concat(optionsTo(d.tipos)), value: filtro.tipo });
      var fExp = field.fieldText({ id: "bitExpediente", label: "Expediente", value: filtro.expediente });
      grid.appendChild(fUsuario);
      grid.appendChild(fTipo);
      grid.appendChild(fExp);
      grid.appendChild(field.fieldDate({ id: "bitDesde", label: "Desde", value: filtro.desde }));
      grid.appendChild(field.fieldDate({ id: "bitHasta", label: "Hasta", value: filtro.hasta }));
      grid.appendChild(field.fieldSelect({ id: "bitInstitucion", label: "Institución", options: [{ label: "Todas", value: "" }].concat(optionsTo(d.instituciones)) }));
      filters.appendChild(grid);
      var fActions = layout.el("div", "toolbar__actions");
      fActions.appendChild(button({ variant: "primary", text: "Filtrar", onClick: function () {
        var u = filters.querySelector("#bitUsuario");
        var t = filters.querySelector("#bitTipo");
        var e = filters.querySelector("#bitExpediente");
        filtro.usuario = u ? u.value : "";
        filtro.tipo = t ? t.value : "";
        filtro.expediente = e ? e.value.trim() : "";
        var desde = filters.querySelector("#bitDesde");
        var hasta = filters.querySelector("#bitHasta");
        filtro.desde = desde ? desde.value : "";
        filtro.hasta = hasta ? hasta.value : "";
        if (api && api.isOnline() && !api.isDemoSession()) {
          renderLoading();
          cargarReal(function (err) { if (err) { renderError(); return; } renderContent(); });
          return;
        }
        renderContent();
      } }));
      filters.appendChild(fActions);
      inner.appendChild(filters);

      var rows = filtrados().map(function (e) {
        var badge = layout.el("span", "badge badge--" + (e.tipo === "denegacion" || e.tipo === "sesion" ? "warning" : "info"), e.tipo);
        return [e.fecha, e.usuario, e.ip, e.pantalla, e.accion, e.expediente, e.detalle, { node: badge }];
      });
      inner.appendChild(table({ headers: [
        { label: "Fecha/hora" }, { label: "Usuario" }, { label: "IP" }, { label: "Pantalla" }, { label: "Acción" }, { label: "Expediente" }, { label: "Detalle" }, { label: "Tipo" },
      ], rows: rows, emptyText: "No hay eventos para los filtros seleccionados." }));

      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "ghost", text: "Exportar CSV", onClick: function () {
        if (!api || !api.isOnline() || api.isDemoSession()) {
          var local = layout.el("div", "app-alert app-alert--info");
          local.appendChild(layout.el("span", "app-alert__text", "La exportación real requiere conexión con el backend."));
          inner.appendChild(local);
          return;
        }
        var query = [];
        if (filtro.usuario) query.push("actorId=" + encodeURIComponent(filtro.usuario));
        if (filtro.tipo) query.push("operacion=" + encodeURIComponent(filtro.tipo));
        if (filtro.expediente) query.push("recurso=" + encodeURIComponent(filtro.expediente));
        if (filtro.desde) query.push("fechaDesde=" + encodeURIComponent(filtro.desde));
        if (filtro.hasta) query.push("fechaHasta=" + encodeURIComponent(filtro.hasta));
        api.download("/auditoria/eventos/exportacion" + (query.length ? "?" + query.join("&") : ""), {}, function (err, blob) {
          var a = layout.el("div", "app-alert app-alert--" + (err ? "warning" : "info"));
          a.appendChild(layout.el("span", "app-alert__text", err ? err.mensajeUsuario : "Exportación auditada completada: auditoria.csv"));
          inner.appendChild(a);
          if (!err && blob && global.URL && global.URL.createObjectURL) {
            var url = global.URL.createObjectURL(blob);
            var link = layout.el("a");
            link.href = url; link.download = "auditoria.csv"; link.textContent = "Descargar auditoria.csv";
            link.className = "btn btn--ghost";
            inner.appendChild(link);
          }
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
      inner.appendChild(layout.pageHeader("Bitácora de auditoría", "Consultando la bitácora…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Reuniendo eventos…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderError() {
      renderSimple("Bitácora de auditoría", "No se pudo consultar", global.tm.fixtures.message("I-16", "error", "No pudimos consultar la bitácora."), true);
    }

    function cargarReal(callback) {
      if (!api || !api.isOnline() || api.isDemoSession()) { callback(); return; }
      var query = ["pagina=0", "tamano=100"];
      if (filtro.usuario) query.push("actorId=" + encodeURIComponent(filtro.usuario));
      if (filtro.tipo) query.push("operacion=" + encodeURIComponent(filtro.tipo));
      if (filtro.expediente) query.push("recurso=" + encodeURIComponent(filtro.expediente));
      if (filtro.desde) query.push("fechaDesde=" + encodeURIComponent(filtro.desde));
      if (filtro.hasta) query.push("fechaHasta=" + encodeURIComponent(filtro.hasta));
      api.request("GET", "/auditoria/eventos?" + query.join("&"), { pantalla: "I-16" }, function (err, data) {
        if (!err && data) {
          var eventos = data.contenido || [];
          d.eventos = eventos.map(function (e) {
            return { fecha: e.fecha || "—", usuario: e.actorId || "—", ip: "—", pantalla: e.recurso || "—", accion: e.operacion || "—", expediente: e.recurso || "—", detalle: e.correlacionId || "—", tipo: e.resultado || "—" };
          });
          d.tipos = d.eventos.map(function (e) { return e.accion; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
          d.usuarios = d.eventos.map(function (e) { return e.usuario; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
        }
        callback(err);
      });
    }

    function show(state) {
      global.tm.fixtures.setScenario(state);
      if (state === "carga") { renderLoading(); setTimeout(function () { cargarReal(function (err) { if (err) { renderError(); return; } renderContent(); }); }, 700); return; }
      if (state === "error") { renderError(); return; }
      if (state === "vacio") { renderSimple("Bitácora de auditoría", "Sin eventos", "No hay eventos para los filtros seleccionados."); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i16 = { renderI16: renderI16 };
})(window);

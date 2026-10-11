/**
 * I-14 — Catálogos: trámites, requisitos, tasas y vigencias (Fase F).
 * Administración del catálogo base (solo ADMIN). Toda modificación conserva la
 * versión anterior. 4 estados de vista.
 * Script clásico: expone `tm.views.i14.renderI14`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var table = global.tm.ui.table;
  var confirmModal = global.tm.ui.confirmModal;

  var FALLBACK = { version: "—", vigencia: "—", categorias: [], verificacionesDisponibles: [], tramites: [] };

  function datos() {
    return global.tm.fixtures.data("I-14", "exito") || FALLBACK;
  }

  function optionsTo(list) {
    return list.map(function (v) { return { label: v, value: v }; });
  }

  function totalTasas(tasas) {
    return (tasas || []).map(function (t) { return t.concepto + ": " + t.monto; }).join(" · ");
  }

  function renderI14(container, opts) {
    opts = opts || {};
    var d = datos();
    var tramites = d.tramites.map(function (t) { return JSON.parse(JSON.stringify(t)); });
    var seleccion = 0;
    var version = d.version;
    var guardado = null;

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
      inner.appendChild(layout.pageHeader("Catálogos", "Trámites, requisitos, tasas y vigencias"));

      var toolbar = layout.el("div", "toolbar");
      var info = layout.el("div", "toolbar__actions");
      info.appendChild(layout.el("span", "badge badge--info", "Versión " + version));
      info.appendChild(layout.el("span", "badge", "Vigente desde " + d.vigencia));
      toolbar.appendChild(info);
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var note = layout.el("div", "app-alert app-alert--info");
      note.appendChild(layout.el("span", "app-alert__title", "Fuente única del producto"));
      note.appendChild(layout.el("span", "app-alert__text", "Alimenta P-07, P-14, P-15 y P-19. Los expedientes ya presentados se resuelven contra la versión vigente al envío (§8.5)."));
      inner.appendChild(note);

      var rows = tramites.map(function (t, idx) {
        var action = layout.el("button", "btn btn--ghost", "Ver");
        action.type = "button";
        action.addEventListener("click", function () { seleccion = idx; guardado = null; renderContent(); });
        return [t.codigo, t.nombre, t.categoria, String(t.requisitos.length), t.vigenciaDias + " días", totalTasas(t.tasas) || "—", { node: action }];
      });
      inner.appendChild(table({ headers: [
        { label: "Código" }, { label: "Trámite" }, { label: "Categoría" }, { label: "Requisitos" }, { label: "Vigencia" }, { label: "Tasas" }, { label: "" },
      ], rows: rows, emptyText: "No hay trámites en el catálogo." }));

      var t = tramites[seleccion];
      var form = layout.el("fieldset", "wizard-section");
      form.appendChild(layout.el("legend", "wizard-section-title", "Editar trámite " + t.codigo + " — " + t.nombre));
      var grid = layout.el("div", "wizard-grid");
      grid.appendChild(field.fieldText({ id: "catCodigo", label: "Código", value: t.codigo }));
      grid.appendChild(field.fieldText({ id: "catNombre", label: "Nombre", value: t.nombre }));
      grid.appendChild(field.fieldSelect({ id: "catCategoria", label: "Categoría", options: optionsTo(d.categorias), value: t.categoria }));
      grid.appendChild(field.fieldText({ id: "catEstadoLegal", label: "Estado legal", value: t.estadoLegal }));
      grid.appendChild(field.fieldText({ id: "catVigencia", label: "Vigencia por documento (días)", value: String(t.vigenciaDias) }));
      grid.appendChild(field.fieldText({ id: "catPlazo", label: "Plazo oficial", value: t.plazo }));
      form.appendChild(grid);

      var reqBlock = layout.el("div", "wizard-section");
      reqBlock.appendChild(layout.el("h3", "wizard-section-title", "Requisitos del trámite"));
      for (var r = 0; r < t.requisitos.length; r++) reqBlock.appendChild(layout.el("p", "seguimiento-note", "• " + t.requisitos[r]));
      reqBlock.appendChild(layout.el("p", "seguimiento-note", "Requisitos base Art. 28; coinciden con P-14 e I-06."));
      form.appendChild(reqBlock);

      var verBlock = layout.el("div", "wizard-section");
      verBlock.appendChild(layout.el("h3", "wizard-section-title", "Verificaciones externas asociadas"));
      for (var v = 0; v < d.verificacionesDisponibles.length; v++) {
        (function (nombre) {
          verBlock.appendChild(field.fieldCheckbox({ id: "catVer-" + nombre.replace(/\s+/g, "-"), label: nombre, checked: t.verificaciones.indexOf(nombre) >= 0, onChange: function (checked) {
            var i = t.verificaciones.indexOf(nombre);
            if (checked && i < 0) t.verificaciones.push(nombre);
            if (!checked && i >= 0) t.verificaciones.splice(i, 1);
          } }));
        })(d.verificacionesDisponibles[v]);
      }
      form.appendChild(verBlock);

      form.appendChild(layout.el("p", "seguimiento-note", "Tasas: " + (totalTasas(t.tasas) || "—")));
      inner.appendChild(form);

      if (guardado) {
        var ok = layout.el("div", "app-alert app-alert--info");
        ok.appendChild(layout.el("span", "app-alert__title", "Nueva versión guardada: " + guardado));
        ok.appendChild(layout.el("span", "app-alert__text", "La versión anterior se conserva para los expedientes ya presentados."));
        inner.appendChild(ok);
      }

      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "primary", text: "Guardar cambios (nueva versión)", onClick: function () {
        confirmModal("Guardar catálogo", "Se creará una nueva versión del catálogo. Los expedientes presentados conservan la versión anterior. ¿Continuar?", {
          onConfirm: function () {
            var partes = String(version).split(".");
            version = partes[0] + "." + (parseInt(partes[1] || "0", 10) + 1);
            guardado = version;
            renderContent();
          },
        });
      } }));
      actions.appendChild(button({ variant: "ghost", text: "Exportar CSV", onClick: function () {
        var a = layout.el("div", "app-alert app-alert--info");
        a.appendChild(layout.el("span", "app-alert__text", "Exportación simulada: catalogo-tramites.csv"));
        inner.appendChild(a);
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
      inner.appendChild(layout.pageHeader("Catálogos", "Cargando catálogo…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Reuniendo trámites, requisitos y tasas…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderError() {
      renderSimple("Catálogos", "No se pudo cargar", global.tm.fixtures.message("I-14", "error", "No pudimos cargar el catálogo."), true);
    }

    function show(state) {
      global.tm.fixtures.setScenario(state);
      if (state === "carga") { renderLoading(); setTimeout(renderContent, 700); return; }
      if (state === "error") { renderError(); return; }
      if (state === "vacio") { renderSimple("Catálogos", "Sin trámites", "No hay trámites en el catálogo."); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i14 = { renderI14: renderI14 };
})(window);

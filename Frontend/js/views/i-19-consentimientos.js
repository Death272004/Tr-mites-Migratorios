/**
 * I-19 — Consentimientos del titular (panel del despacho, HU-18b).
 * Registro, vigencia y revocación de consentimientos (informado y expreso para
 * datos sensibles) según Ley 81 de 2019 y DE 285 de 2021. La revocación no tiene
 * efecto retroactivo y queda auditada (I-16). 4 estados de vista.
 * Script clásico: expone `tm.views.i19.renderI19`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var button = global.tm.ui.button;
  var table = global.tm.ui.table;
  var confirmModal = global.tm.ui.confirmModal;

  var FALLBACK = { aviso: "", resumen: { vigentes: 0, revocados: 0, porVencer: 0 }, consentimientos: [] };

  function datos() {
    return global.tm.fixtures.data("I-19", "exito") || FALLBACK;
  }

  function estadoBadge(estado) {
    var variante = estado === "vigente" ? "success" : estado === "revocado" ? "danger" : "warning";
    return layout.el("span", "badge badge--" + variante, estado);
  }

  function renderI19(container, opts) {
    opts = opts || {};
    var d = datos();
    var items = d.consentimientos.map(function (c) { return JSON.parse(JSON.stringify(c)); });
    var seleccion = 0;
    var filtro = "todos";
    var aviso = null;

    function visibles() {
      if (filtro === "todos") return items;
      return items.filter(function (c) { return c.estado === filtro; });
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
      inner.appendChild(layout.pageHeader("Consentimientos del titular", "Registro, vigencia y revocación (Ley 81 de 2019 · DE 285 de 2021)"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", "badge badge--success", d.resumen.vigentes + " vigentes"));
      toolbar.appendChild(layout.el("span", "badge badge--warning", d.resumen.porVencer + " por vencer"));
      toolbar.appendChild(layout.el("span", "badge badge--danger", d.resumen.revocados + " revocados"));

      var filtroWrap = layout.el("label", "toolbar__demo");
      filtroWrap.appendChild(layout.el("span", null, "Filtrar"));
      var fSel = layout.el("select");
      var fOps = [{ v: "todos", l: "Todos" }, { v: "vigente", l: "Vigentes" }, { v: "por vencer", l: "Por vencer" }, { v: "revocado", l: "Revocados" }];
      for (var f = 0; f < fOps.length; f++) { var fo = layout.el("option", null, fOps[f].l); fo.value = fOps[f].v; if (fOps[f].v === filtro) fo.selected = true; fSel.appendChild(fo); }
      fSel.addEventListener("change", function () { filtro = fSel.value; renderContent(); });
      filtroWrap.appendChild(fSel);
      toolbar.appendChild(filtroWrap);

      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var note = layout.el("div", "app-alert app-alert--info");
      note.appendChild(layout.el("span", "app-alert__title", "Base legal del tratamiento"));
      note.appendChild(layout.el("span", "app-alert__text", d.aviso));
      inner.appendChild(note);

      if (aviso) {
        var ok = layout.el("div", "app-alert app-alert--info");
        ok.appendChild(layout.el("span", "app-alert__title", "Consentimiento actualizado"));
        ok.appendChild(layout.el("span", "app-alert__text", aviso));
        inner.appendChild(ok);
      }

      var lista = visibles();
      var rows = lista.map(function (c) {
        var idx = items.indexOf(c);
        var ver = layout.el("button", "btn btn--ghost", "Ver / revocar");
        ver.type = "button";
        ver.addEventListener("click", function () { seleccion = idx; aviso = null; renderContent(); });
        return [
          c.titular,
          c.documento,
          c.expediente,
          c.tipo,
          c.fecha,
          c.vigencia,
          c.responsable,
          { node: estadoBadge(c.estado) },
          { node: ver }
        ];
      });
      inner.appendChild(table({
        headers: [
          { label: "Titular" }, { label: "Documento" }, { label: "Expediente" }, { label: "Tipo" },
          { label: "Otorgado" }, { label: "Vigencia" }, { label: "Responsable" }, { label: "Estado" }, { label: "" }
        ],
        rows: rows,
        emptyText: "No hay consentimientos con el filtro seleccionado."
      }));

      var c = items[seleccion] || items[0];
      if (c) {
        var card = layout.el("div", "detail-card");
        card.appendChild(layout.el("h3", "wizard-section-title", "Detalle — " + c.titular + " (" + c.id + ")"));

        var campos = [
          { label: "Documento", value: c.documento },
          { label: "Expediente", value: c.expediente },
          { label: "Tipo de consentimiento", value: c.tipo },
          { label: "Finalidad", value: c.finalidad },
          { label: "Fecha de otorgamiento", value: c.fecha },
          { label: "Vigencia", value: c.vigencia },
          { label: "Responsable del tratamiento", value: c.responsable }
        ];
        for (var k = 0; k < campos.length; k++) {
          var row = layout.el("div", "detail-row");
          row.appendChild(layout.el("span", "detail-row__label", campos[k].label));
          row.appendChild(layout.el("span", "detail-row__value", campos[k].value));
          card.appendChild(row);
        }

        var estRow = layout.el("div", "detail-row");
        estRow.appendChild(layout.el("span", "detail-row__label", "Estado"));
        estRow.appendChild(layout.el("span", "detail-row__value", null));
        estRow.lastChild.appendChild(estadoBadge(c.estado));
        card.appendChild(estRow);

        if (c.nota) {
          var nota = layout.el("p", "detail-row__value", c.nota);
          card.appendChild(nota);
        }

        var actions = layout.el("div", "detail-actions");
        if (c.estado === "revocado") {
          var rol = layout.el("span", "badge badge--warning", "Revocado — sin efecto retroactivo");
          actions.appendChild(rol);
        } else {
          actions.appendChild(button({
            variant: "danger", text: "Revocar consentimiento", type: "button",
            onClick: function () {
              confirmModal(
                "Revocar consentimiento",
                "¿Revocar el consentimiento " + c.id + " de " + c.titular + "? La revocación no tiene efecto retroactivo y quedará registrada en la bitácora.",
                { onConfirm: function () {
                  c.estado = "revocado";
                  d.resumen.vigentes = Math.max(0, d.resumen.vigentes - 1);
                  d.resumen.revocados += 1;
                  aviso = "Consentimiento " + c.id + " revocado. Traza enviada a la bitácora (I-16).";
                  renderContent();
                } }
              );
            }
          }));
        }
        card.appendChild(actions);
        inner.appendChild(card);
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
      inner.appendChild(layout.pageHeader("Consentimientos del titular", "Cargando consentimientos…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Reuniendo consentimientos y vigencias…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderError() {
      renderSimple("Consentimientos del titular", "No se pudo cargar", global.tm.fixtures.message("I-19", "error", "No pudimos cargar los consentimientos."), true);
    }

    function show(state) {
      global.tm.fixtures.setScenario(state);
      if (state === "carga") { renderLoading(); setTimeout(renderContent, 700); return; }
      if (state === "error") { renderError(); return; }
      if (state === "vacio") { renderSimple("Consentimientos del titular", "Sin consentimientos", "No hay consentimientos registrados."); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i19 = { renderI19: renderI19 };
})(window);

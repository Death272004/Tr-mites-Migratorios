/**
 * I-09 — Edictos y publicaciones (Fase E).
 * Publica y retira edictos con historial inmutable (auditoría I-16); minimización
 * del texto visible al cliente (P-24). 4 estados de vista.
 * Script clásico: expone `tm.views.i09.renderI09`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var perms = global.tm.perms;

  var FALLBACK = { expediente: "—", titular: "—", tipos: ["Edicto de admisión"], edictos: [] };

  function datos() {
    return global.tm.fixtures.data("I-09", "exito") || FALLBACK;
  }

  function fmtFecha(iso) {
    if (!iso) return "—";
    var p = iso.split("-");
    return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso;
  }

  function optionsTo(list) {
    return list.map(function (v) { return { label: v, value: v }; });
  }

  function renderI09(container, opts) {
    opts = opts || {};
    var d = datos();
    var edictos = d.edictos.map(function (e) { return { numero: e.numero, tipo: e.tipo, publicacion: e.publicacion, vencimiento: e.vencimiento, estado: e.estado, texto: e.texto, historial: e.historial.slice() }; });

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

    function edictoNode(e) {
      var item = layout.el("div", "edicto-item");
      var head = layout.el("div", "edicto-item__head");
      head.appendChild(layout.el("span", "edicto-item__title", e.numero + " · " + e.tipo));
      head.appendChild(layout.el("span", "badge badge--" + (e.estado === "Publicado" ? "success" : "warning"), e.estado));
      head.appendChild(layout.el("span", "edicto-item__date", "Publicado: " + fmtFecha(e.publicacion) + " · Vence: " + fmtFecha(e.vencimiento)));
      item.appendChild(head);
      item.appendChild(layout.el("p", "edicto-item__text", e.texto));

      var hist = layout.el("div", "seguimiento-note");
      hist.textContent = "Historial: " + e.historial.map(function (h) { return fmtFecha(h.fecha) + " " + h.accion; }).join(" · ");
      item.appendChild(hist);

      var actions = layout.el("div", "detail-actions");
      if (!perms.can(perms.PERMS.OBSERVAR)) {
        actions.appendChild(perms.notice(perms.PERMS.OBSERVAR, "Solo un rol con permiso «observar» puede gestionar edictos."));
      } else if (e.estado === "Publicado") {
        actions.appendChild(button({ variant: "ghost", text: "Retirar", onClick: function () {
          e.estado = "Retirado";
          e.historial.push({ fecha: "2026-10-11", accion: "Retirado (historial inmutable)" });
          renderContent();
        } }));
      } else {
        actions.appendChild(button({ variant: "ghost", text: "Republicar", onClick: function () {
          e.estado = "Publicado";
          e.historial.push({ fecha: "2026-10-11", accion: "Republicado" });
          renderContent();
        } }));
      }
      item.appendChild(actions);
      return item;
    }

    function renderContent() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Edictos y publicaciones", "Publicación y retiro de edictos con historial inmutable"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", null, ""));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var card = layout.el("div", "detail-card");
      var r1 = layout.el("div", "detail-row");
      r1.appendChild(layout.el("span", "detail-row__label", "Expediente"));
      r1.appendChild(layout.el("span", "detail-row__value", d.expediente));
      card.appendChild(r1);
      var r2 = layout.el("div", "detail-row");
      r2.appendChild(layout.el("span", "detail-row__label", "Titular"));
      r2.appendChild(layout.el("span", "detail-row__value", d.titular));
      card.appendChild(r2);
      inner.appendChild(card);

      var block = layout.el("div", "seguimiento-block");
      block.appendChild(layout.el("h2", "seguimiento-block__title", "Edictos del expediente"));
      if (edictos.length === 0) {
        block.appendChild(layout.el("p", "seguimiento-note", "Sin edictos publicados."));
      } else {
        var list = layout.el("div", "edicto-list");
        for (var i = 0; i < edictos.length; i++) list.appendChild(edictoNode(edictos[i]));
        block.appendChild(list);
      }
      inner.appendChild(block);

      var form = layout.el("fieldset", "wizard-section");
      form.appendChild(layout.el("legend", "wizard-section-title", "Publicar nuevo edicto"));
      var grid = layout.el("div", "wizard-grid");
      grid.appendChild(field.fieldSelect({ id: "edTipo", label: "Tipo de publicación", options: optionsTo(d.tipos) }));
      grid.appendChild(field.fieldDate({ id: "edPub", label: "Fecha de publicación", value: "2026-10-11" }));
      grid.appendChild(field.fieldDate({ id: "edVenc", label: "Fecha de vencimiento", value: "2026-10-25" }));
      form.appendChild(grid);
      form.appendChild(field.fieldTextarea({ id: "edTexto", label: "Texto del edicto", rows: 3, helpText: "No incluir datos innecesarios del titular (visible al cliente en P-24)." }));
      inner.appendChild(form);

      var errBox = layout.el("div", "auth-error", "");
      errBox.setAttribute("aria-live", "polite");
      inner.appendChild(errBox);

      var actions = layout.el("div", "toolbar__actions");
      var publicarBtn = button({
        variant: "primary",
        text: "Publicar edicto",
        onClick: function () {
          errBox.textContent = "";
          errBox.classList.remove("is-visible");
          var tipo = form.querySelector("#edTipo");
          var pub = form.querySelector("#edPub");
          var venc = form.querySelector("#edVenc");
          var texto = form.querySelector("#edTexto");
          if (!texto || !texto.value.trim()) { errBox.textContent = "El texto del edicto es obligatorio."; errBox.classList.add("is-visible"); return; }
          var numero = "EDI-2026-" + String(Math.floor(1000 + Math.random() * 8999));
          edictos.push({
            numero: numero,
            tipo: tipo ? tipo.value : "Edicto de admisión",
            publicacion: pub ? pub.value : "2026-10-11",
            vencimiento: venc ? venc.value : "2026-10-25",
            estado: "Publicado",
            texto: texto.value.trim(),
            historial: [{ fecha: pub ? pub.value : "2026-10-11", accion: "Publicado" }],
          });
          renderContent();
        },
      });
      actions.appendChild(perms.can(perms.PERMS.OBSERVAR) ? publicarBtn : perms.notice(perms.PERMS.OBSERVAR, "Solo un rol con permiso «observar» puede publicar edictos."));
      inner.appendChild(actions);

      inner.appendChild(layout.el("p", "seguimiento-note", "El retiro no borra: el historial es inmutable (auditoría I-16)."));
      container.appendChild(inner);
    }

    function renderLoading() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Edictos y publicaciones", "Cargando edictos…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Reuniendo publicaciones…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderEmpty() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Edictos y publicaciones", "Sin edictos"));
      var e = layout.el("div", "app-empty");
      e.appendChild(layout.el("p", null, "No hay edictos publicados para este expediente."));
      inner.appendChild(e);
      container.appendChild(inner);
    }

    function renderError() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Edictos y publicaciones", "No se pudo cargar"));
      var a = layout.el("div", "app-alert app-alert--warning");
      a.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
      a.appendChild(layout.el("span", "app-alert__text", global.tm.fixtures.message("I-09", "error", "No pudimos cargar los edictos.")));
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
      if (state === "vacio") { renderEmpty(); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i09 = { renderI09: renderI09 };
})(window);

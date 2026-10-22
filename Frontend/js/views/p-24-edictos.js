/**
 * P-24 — Edictos y citaciones (modo consulta mínimo).
 * Consulta por número de expediente y apellidos: edictos publicados,
 * oposiciones, citas de retiro y notificaciones con fecha de publicación.
 * Solo edictos propios; se omiten datos de terceros opositores (Ley 81).
 * Estados de vista demo: carga, éxito, vacío y error.
 * Script clásico: expone `tm.views.p24.renderP24`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;

  var DEMO_EDICTOS = {
    expediente: "EXP-2026-000184",
    apellidos: "Demo",
    bloques: [
      {
        titulo: "Edictos publicados",
        items: [
          { titulo: "Edicto de admisión", fecha: "2026-09-22", etiqueta: "ADMITIDO", tono: "info", detalle: "Publicado en el tablero de edictos del SNM." },
        ],
      },
      {
        titulo: "Oposiciones",
        items: [
          { titulo: "Oposición registrada", fecha: "2026-09-29", detalle: "Los datos del opositor se mantienen reservados (minimización, Ley 81)." },
        ],
      },
      {
        titulo: "Citas de retiro",
        items: [
          { titulo: "Cita de retiro de resolución", fecha: "2026-10-15", detalle: "Pase a retirar por la ventanilla 42 con su carné E." },
        ],
      },
      {
        titulo: "Notificaciones",
        items: [
          { titulo: "Notificación de admisión", fecha: "2026-09-24", detalle: "Notificado el 24/09/2026 a las 10:30." },
        ],
      },
    ],
  };

  function fmtFecha(iso) {
    if (!iso) return "—";
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function badge(text, tone) {
    return layout.el("span", "badge badge--" + (tone || "info"), text);
  }

  function renderP24(container, opts) {
    opts = opts || {};
    var consulta = { expediente: DEMO_EDICTOS.expediente, apellidos: DEMO_EDICTOS.apellidos };

    function demoSelector() {
      var wrap = layout.el("label", "toolbar__demo");
      wrap.appendChild(layout.el("span", null, "Vista (demo)"));
      var select = layout.el("select");
      var opciones = [
        { v: "carga", l: "Carga" },
        { v: "exito", l: "Éxito" },
        { v: "vacio", l: "Vacío" },
        { v: "error", l: "Error" },
      ];
      for (var i = 0; i < opciones.length; i++) {
        var o = layout.el("option", null, opciones[i].l);
        o.value = opciones[i].v;
        select.appendChild(o);
      }
      select.addEventListener("change", function () {
        if (opts.onDemoState) opts.onDemoState(select.value);
      });
      wrap.appendChild(select);
      return wrap;
    }

    function consultForm(mostrar, errBox) {
      var form = layout.el("fieldset", "wizard-section");
      form.appendChild(layout.el("legend", "wizard-section-title", "Consultar por expediente"));
      var grid = layout.el("div", "wizard-grid");
      grid.appendChild(field.fieldText({ id: "consultaExpediente", label: "Número de expediente", value: consulta.expediente, required: true }));
      grid.appendChild(field.fieldText({ id: "consultaApellidos", label: "Apellidos del titular", value: consulta.apellidos, required: true }));
      form.appendChild(grid);

      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({
        variant: "primary",
        text: mostrar ? "Volver a consultar" : "Consultar",
        onClick: function () {
          errBox.textContent = "";
          errBox.classList.remove("is-visible");
          var e = byId("consultaExpediente");
          var a = byId("consultaApellidos");
          if (!e || !a) {
            errBox.textContent = "Ingrese el número de expediente y los apellidos.";
            errBox.classList.add("is-visible");
            return;
          }
          consulta.expediente = e;
          consulta.apellidos = a;
          renderContent(container, opts, true, consulta);
        },
      }));
      form.appendChild(actions);
      return form;
    }

    function blockNode(bloque) {
      var block = layout.el("div", "seguimiento-block");
      block.appendChild(layout.el("h2", "seguimiento-block__title", bloque.titulo));
      if (!bloque.items || bloque.items.length === 0) {
        block.appendChild(layout.el("p", "seguimiento-note", "Sin registros para este expediente."));
        return block;
      }
      var list = layout.el("div", "edicto-list");
      for (var i = 0; i < bloque.items.length; i++) {
        var it = bloque.items[i];
        var item = layout.el("div", "edicto-item");
        var head = layout.el("div", "edicto-item__head");
        head.appendChild(layout.el("span", "edicto-item__title", it.titulo));
        if (it.etiqueta) head.appendChild(badge(it.etiqueta, it.tono));
        head.appendChild(layout.el("span", "edicto-item__date", "Publicado: " + fmtFecha(it.fecha)));
        item.appendChild(head);
        if (it.detalle) item.appendChild(layout.el("p", "edicto-item__text", it.detalle));
        list.appendChild(item);
      }
      block.appendChild(list);
      return block;
    }

    function renderContent(container, opts, mostrar, datos) {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Edictos y citaciones", "Consulta de edictos, oposiciones, citas de retiro y notificaciones"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", null, ""));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var errBox = layout.el("div", "auth-error", "");
      errBox.setAttribute("aria-live", "polite");
      inner.appendChild(errBox);
      inner.appendChild(consultForm(mostrar, errBox));

      inner.appendChild(layout.el("p", "seguimiento-note", "Solo se muestran edictos propios; se omiten los datos de terceros opositores (minimización, Ley 81)."));

      if (!mostrar) {
        inner.appendChild(layout.el("p", "seguimiento-note", "Ingrese el expediente y los apellidos, luego pulse «Consultar»."));
        container.appendChild(inner);
        return;
      }

      var intro = layout.el("div", "app-alert app-alert--info");
      intro.appendChild(layout.el("span", "app-alert__title", "Resultado de la consulta"));
      intro.appendChild(layout.el("span", "app-alert__text", "Expediente " + datos.expediente + " · Titular: " + datos.apellidos + "."));
      inner.appendChild(intro);

      for (var b = 0; b < DEMO_EDICTOS.bloques.length; b++) {
        inner.appendChild(blockNode(DEMO_EDICTOS.bloques[b]));
      }
      container.appendChild(inner);
    }

    function renderLoading(container) {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Edictos y citaciones", "Consultando publicaciones…"));
      var loading = layout.el("div", "app-loading");
      loading.appendChild(layout.el("span", "spinner"));
      loading.appendChild(layout.el("span", null, "Buscando edictos y citaciones de su expediente…"));
      inner.appendChild(loading);
      container.appendChild(inner);
    }

    function renderEmpty(container) {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Edictos y citaciones", "Sin resultados"));
      var empty = layout.el("div", "app-empty");
      empty.appendChild(layout.el("p", null, "No encontramos edictos ni citaciones para ese expediente."));
      empty.appendChild(layout.el("p", null, "Verifique el número de expediente o intente más tarde."));
      inner.appendChild(empty);
      container.appendChild(inner);
    }

    function renderError(container, opts) {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Edictos y citaciones", "No se pudo completar la consulta"));
      var alert = layout.el("div", "app-alert app-alert--warning");
      alert.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
      alert.appendChild(layout.el("span", "app-alert__text", "No pudimos consultar las publicaciones. Intente nuevamente."));
      inner.appendChild(alert);
      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
      inner.appendChild(actions);
      container.appendChild(inner);
    }

    function show(state) {
      if (state === "carga") {
        renderLoading(container);
        setTimeout(function () { renderContent(container, opts, true, consulta); }, 700);
        return;
      }
      if (state === "error") { renderError(container, { onRetry: function () { show("carga"); } }); return; }
      if (state === "vacio") { renderEmpty(container); return; }
      renderContent(container, opts, true, consulta);
    }

    opts.onDemoState = show;
    show("carga");
  }

  function byId(id) {
    var e = document.getElementById(id);
    return e ? String(e.value).trim() : "";
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p24 = { renderP24: renderP24, DEMO_EDICTOS: DEMO_EDICTOS };
})(window);

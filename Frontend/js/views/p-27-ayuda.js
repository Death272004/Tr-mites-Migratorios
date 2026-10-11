/**
 * P-27 — Ayuda, FAQ y peticiones.
 * Recibe consultas, peticiones y el canal de ejercicio de derechos ARCO.
 * Adjunto opcional con formato/tamaño limitado (CP-05); canal ARCO (CP-14).
 * Estados de vista demo: carga, éxito, vacío y error.
 * Script clásico: expone `tm.views.p27.renderP27`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var draft = global.tm.draft;

  var TIPOS = [
    { value: "", label: "Seleccione…" },
    { value: "ESTADO", label: "Estado de mi trámite" },
    { value: "REQUISITOS", label: "Requisitos y documentos" },
    { value: "PAGOS", label: "Pagos y tasas" },
    { value: "CITA", label: "Citas y retiro" },
    { value: "ARCO", label: "Ejercicio de derechos ARCO" },
    { value: "OTRO", label: "Otra consulta" },
  ];

  var FAQ = [
    { q: "¿Cómo consulto el estado de mi trámite?", a: "Ve a Seguimiento → Estado del trámite e ingresa el número de expediente." },
    { q: "¿Qué hago si recibo una observación?", a: "Ve a Seguimiento → Observaciones, revisa el detalle y atiende todo en un solo reingreso desde Subsanación." },
    { q: "¿Cómo ejerzo mis derechos ARCO?", a: "Selecciona el tipo de consulta «Ejercicio de derechos ARCO» en este formulario." },
    { q: "¿Cuánto tarda una certificación?", a: "Las certificaciones se emiten y entregan tras la etapa NOTIFICADO → ENTREGADO." },
  ];

  function byId(id) {
    var e = document.getElementById(id);
    return e ? String(e.value).trim() : "";
  }

  function renderP27(container, opts) {
    opts = opts || {};
    var sent = false;

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
        sent = false;
        if (opts.onDemoState) opts.onDemoState(select.value);
      });
      wrap.appendChild(select);
      return wrap;
    }

    function faqBlock() {
      var block = layout.el("div", "seguimiento-block");
      block.appendChild(layout.el("h2", "seguimiento-block__title", "Preguntas frecuentes"));
      for (var i = 0; i < FAQ.length; i++) {
        var det = layout.el("details", "faq-item");
        det.appendChild(layout.el("summary", "faq-item__q", FAQ[i].q));
        det.appendChild(layout.el("p", "faq-item__a", FAQ[i].a));
        block.appendChild(det);
      }
      return block;
    }

    function formNode(errBox) {
      var form = layout.el("fieldset", "wizard-section");
      form.appendChild(layout.el("legend", "wizard-section-title", "Envíe su consulta o petición"));

      var grid = layout.el("div", "wizard-grid");
      grid.appendChild(field.fieldSelect({ id: "tipoConsulta", label: "Tipo de consulta", options: TIPOS, required: true }));
      grid.appendChild(field.fieldText({ id: "expediente", label: "Número de expediente (si tiene)" }));
      grid.appendChild(field.fieldText({ id: "correoRespuesta", label: "Correo de respuesta", required: true, helpText: "Le responderemos a este correo." }));
      form.appendChild(grid);

      form.appendChild(field.fieldTextarea({ id: "descripcion", label: "Descripción", rows: 5, required: true }));

      var docs = layout.el("div", "wizard-grid");
      docs.appendChild(global.tm.ui.fileUpload({ id: "adjunto", label: "Adjunto (opcional)", accept: ".pdf,.jpg,.jpeg,.png", helpText: "PDF/JPG/PNG ≤ 5 MB (CP-05)." }));
      form.appendChild(docs);

      var arco = layout.el("div", "app-alert app-alert--info");
      arco.appendChild(layout.el("span", "app-alert__title", "Derechos ARCO"));
      arco.appendChild(layout.el("span", "app-alert__text", "El ejercicio de derechos de acceso, rectificación, cancelación y oposición se canaliza por este formulario (Ley 81, CP-14)."));
      form.appendChild(arco);

      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({
        variant: "primary",
        text: "Enviar consulta",
        onClick: function () {
          errBox.textContent = "";
          errBox.classList.remove("is-visible");
          var tipo = byId("tipoConsulta");
          var desc = byId("descripcion");
          var correo = byId("correoRespuesta");
          if (!tipo) { errBox.textContent = "Seleccione el tipo de consulta."; errBox.classList.add("is-visible"); return; }
          if (!desc) { errBox.textContent = "Describa su consulta."; errBox.classList.add("is-visible"); return; }
          if (!correo || correo.indexOf("@") < 0) { errBox.textContent = "Ingrese un correo de respuesta válido."; errBox.classList.add("is-visible"); return; }
          sent = true;
          draft.mergeDraft({ ayuda: { tipo: tipo, expediente: byId("expediente"), correo: correo } });
          renderContent(container, opts, sent);
        },
      }));
      form.appendChild(actions);
      return form;
    }

    function sentPanel() {
      var panel = layout.el("div", "app-alert app-alert--info");
      panel.appendChild(layout.el("span", "app-alert__title", "Consulta enviada (simulada)"));
      panel.appendChild(layout.el("span", "app-alert__text", "Referencia: AYUDA-2026-0042. El despacho le responderá al correo indicado. Para derechos ARCO, la respuesta se rige por los plazos de la Ley 81."));
      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "primary", text: "Enviar otra consulta", onClick: function () { sent = false; renderContent(container, opts, false); } }));
      panel.appendChild(actions);
      return panel;
    }

    function renderContent(container, opts, mostrarEnvio) {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Ayuda y FAQ", "Consultas, peticiones y ejercicio de derechos ARCO"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", null, ""));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      if (mostrarEnvio) {
        inner.appendChild(sentPanel());
      } else {
        var errBox = layout.el("div", "auth-error", "");
        errBox.setAttribute("aria-live", "polite");
        inner.appendChild(errBox);
        inner.appendChild(formNode(errBox));
      }

      inner.appendChild(faqBlock());
      container.appendChild(inner);
    }

    function renderLoading(container) {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Ayuda y FAQ", "Cargando…"));
      var loading = layout.el("div", "app-loading");
      loading.appendChild(layout.el("span", "spinner"));
      loading.appendChild(layout.el("span", null, "Cargando preguntas frecuentes y canal de ayuda…"));
      inner.appendChild(loading);
      container.appendChild(inner);
    }

    function renderEmpty(container) {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Ayuda y FAQ", "Sin contenido"));
      var empty = layout.el("div", "app-empty");
      empty.appendChild(layout.el("p", null, "Aún no hay preguntas frecuentes publicadas para su tipo de consulta."));
      empty.appendChild(layout.el("p", null, "Puede enviarnos su consulta igualmente mediante el formulario."));
      inner.appendChild(empty);
      container.appendChild(inner);
    }

    function renderError(container, opts) {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Ayuda y FAQ", "No se pudo cargar"));
      var alert = layout.el("div", "app-alert app-alert--warning");
      alert.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
      alert.appendChild(layout.el("span", "app-alert__text", "No pudimos cargar el centro de ayuda. Intente nuevamente."));
      inner.appendChild(alert);
      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
      inner.appendChild(actions);
      container.appendChild(inner);
    }

    function show(state) {
      if (state === "carga") {
        renderLoading(container);
        setTimeout(function () { renderContent(container, opts, false); }, 700);
        return;
      }
      if (state === "error") { renderError(container, { onRetry: function () { show("carga"); } }); return; }
      if (state === "vacio") { renderEmpty(container); return; }
      renderContent(container, opts, false);
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p27 = { renderP27: renderP27, TIPOS: TIPOS, FAQ: FAQ };
})(window);

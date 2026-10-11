/**
 * P-27 — Ayuda, FAQ y peticiones.
 * Consultas y peticiones + canal de ejercicio de derechos ARCO (CP-14, HU-18c):
 * formulario dedicado (acceso, rectificación, cancelación y oposición), con
 * plazos de la Ley 81 de 2019, y seguimiento de las solicitudes del titular.
 * Adjunto opcional con formato/tamaño limitado (CP-05).
 * Estados de vista demo: carga, éxito, vacío y error.
 * Script clásico: expone `tm.views.p27.renderP27`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var table = global.tm.ui.table;
  var draft = global.tm.draft;

  var TIPOS = [
    { value: "", label: "Seleccione…" },
    { value: "ESTADO", label: "Estado de mi trámite" },
    { value: "REQUISITOS", label: "Requisitos y documentos" },
    { value: "PAGOS", label: "Pagos y tasas" },
    { value: "CITA", label: "Citas y retiro" },
    { value: "OTRO", label: "Otra consulta" },
  ];

  var DERECHOS = [
    { value: "ACCESO", label: "Acceso", plazo: "10 días hábiles", detalle: "Obtener los datos personales almacenados, su origen y la finalidad del tratamiento." },
    { value: "RECTIFICACION", label: "Rectificación", plazo: "5 días hábiles", detalle: "Corregir datos incorrectos, incompletos, desfasados o inexactos." },
    { value: "CANCELACION", label: "Cancelación / supresión", plazo: "5 días hábiles", detalle: "Eliminar datos incorrectos, irrelevantes, incompletos o inexactos." },
    { value: "OPOSICION", label: "Oposición", plazo: "según análisis motivado", detalle: "Negarse a un tratamiento determinado o revocar el consentimiento, por motivos fundados y legítimos." },
  ];

  var ARCO_SOLICITUDES = [
    { ref: "ARCO-2026-0011", derecho: "Acceso", apertura: "2026-05-04", cierre: "2026-05-18", responsable: "Lic. Pedro Ruiz", estado: "Atendida" },
    { ref: "ARCO-2026-0027", derecho: "Rectificación", apertura: "2026-08-12", cierre: "—", responsable: "Lic. Ana Solís", estado: "En plazo" },
  ];

  var FAQ = [
    { q: "¿Cómo consulto el estado de mi trámite?", a: "Ve a Seguimiento → Estado del trámite e ingresa el número de expediente." },
    { q: "¿Qué hago si recibo una observación?", a: "Ve a Seguimiento → Observaciones, revisa el detalle y atiende todo en un solo reingreso desde Subsanación." },
    { q: "¿Cómo ejerzo mis derechos ARCO?", a: "Use el formulario «Ejercicio de derechos ARCO (Ley 81 de 2019)» más abajo y elija el derecho que desea ejercer." },
    { q: "¿Cuánto tarda una certificación?", a: "Las certificaciones se emiten y entregan tras la etapa NOTIFICADO → ENTREGADO." },
  ];

  function byId(id) {
    var e = document.getElementById(id);
    return e ? String(e.value).trim() : "";
  }

  function derechoInfo(value) {
    for (var i = 0; i < DERECHOS.length; i++) { if (DERECHOS[i].value === value) return DERECHOS[i]; }
    return null;
  }

  function renderP27(container, opts) {
    opts = opts || {};

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
          draft.mergeDraft({ ayuda: { tipo: tipo, expediente: byId("expediente"), correo: correo } });
          renderContent(container, opts, true, false);
        },
      }));
      form.appendChild(actions);
      return form;
    }

    function sentPanel() {
      var panel = layout.el("div", "app-alert app-alert--info");
      panel.appendChild(layout.el("span", "app-alert__title", "Consulta enviada (simulada)"));
      panel.appendChild(layout.el("span", "app-alert__text", "Referencia: AYUDA-2026-0042. El despacho le responderá al correo indicado."));
      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "primary", text: "Enviar otra consulta", onClick: function () { renderContent(container, opts, false, false); } }));
      panel.appendChild(actions);
      return panel;
    }

    // ----- Ejercicio de derechos ARCO (HU-18c) -----
    function arcoHeader() {
      var head = layout.el("div", "wizard-section-title");
      head.appendChild(layout.el("span", null, "Ejercicio de derechos ARCO (Ley 81 de 2019)"));
      return head;
    }

    function arcoSolicitudesBlock() {
      var block = layout.el("div", "seguimiento-block");
      block.appendChild(layout.el("h3", "seguimiento-block__title", "Mis solicitudes ARCO"));
      var rows = ARCO_SOLICITUDES.map(function (s) {
        var variante = s.estado === "Atendida" ? "success" : "warning";
        return [
          { text: s.ref }, { text: s.derecho }, { text: s.apertura }, { text: s.cierre }, { text: s.responsable },
          { node: layout.el("span", "badge badge--" + variante, s.estado) },
        ];
      });
      block.appendChild(table({
        headers: [
          { label: "Referencia" }, { label: "Derecho" }, { label: "Apertura" }, { label: "Cierre" },
          { label: "Responsable" }, { label: "Estado" },
        ],
        rows: rows,
        emptyText: "Aún no ha registrado solicitudes ARCO.",
      }));
      return block;
    }

    function arcoForm(errBox) {
      var form = layout.el("fieldset", "wizard-section");
      form.appendChild(arcoHeader());

      var derechoFs = layout.el("fieldset", "form-field");
      derechoFs.appendChild(layout.el("legend", "form-field__label", "Derecho que desea ejercer"));
      var rg = layout.el("div", "radio-group");
      var detalle = layout.el("span", "form-field__help", "");
      DERECHOS.forEach(function (d, i) {
        var lbl = layout.el("label", "radio-option");
        var input = layout.el("input");
        input.type = "radio"; input.name = "arcoDerecho"; input.value = d.value;
        if (i === 0) input.checked = true;
        input.addEventListener("change", function () {
          detalle.textContent = d.detalle + " Plazo de respuesta: " + d.plazo + ".";
          toggleFundamento(d.value === "OPOSICION");
        });
        lbl.appendChild(input); lbl.appendChild(layout.el("span", null, d.label));
        rg.appendChild(lbl);
      });
      derechoFs.appendChild(rg);
      detalle.textContent = DERECHOS[0].detalle + " Plazo de respuesta: " + DERECHOS[0].plazo + ".";
      derechoFs.appendChild(detalle);
      form.appendChild(derechoFs);

      var grid = layout.el("div", "wizard-grid");
      grid.appendChild(field.fieldSelect({
        id: "arcoCondicion",
        label: "Condición de quien solicita",
        options: [
          { value: "TITULAR", label: "Titular de los datos" },
          { value: "REPRESENTANTE", label: "Representante acreditado" },
        ],
        value: "TITULAR",
        helpText: "Si actúa por representación, adjunte la acreditación.",
      }));
      grid.appendChild(field.fieldText({ id: "arcoExpediente", label: "Número de expediente (si tiene)" }));
      grid.appendChild(field.fieldText({ id: "arcoCorreo", label: "Correo de notificación", required: true, helpText: "Recibirá la respuesta en este correo (plazo legal)." }));
      form.appendChild(grid);

      form.appendChild(field.fieldTextarea({
        id: "arcoDescripcion", label: "Descripción de la solicitud", rows: 4, required: true,
        helpText: "Indique los datos o el tratamiento sobre el que ejerce el derecho.",
      }));

      var fundamento = field.fieldTextarea({
        id: "arcoFundamento", label: "Fundamento (obligatorio para Oposición)", rows: 3,
        helpText: "Motivos fundados y legítimos relacionados con una situación en particular (Art. 16, Ley 81).",
      });
      fundamento.id = "arcoFundamentoWrap";
      form.appendChild(fundamento);

      var docs = layout.el("div", "wizard-grid");
      docs.appendChild(global.tm.ui.fileUpload({ id: "arcoAdjunto", label: "Acreditación (opcional)", accept: ".pdf,.jpg,.jpeg,.png", helpText: "Documento de identidad o representación. PDF/JPG/PNG ≤ 5 MB (CP-05)." }));
      form.appendChild(docs);

      var alert = layout.el("div", "app-alert app-alert--info");
      alert.appendChild(layout.el("span", "app-alert__title", "Plazos y alcance (Ley 81 de 2019)"));
      alert.appendChild(layout.el("span", "app-alert__text", "Acceso: respuesta en 10 días hábiles. Rectificación y cancelación: 5 días hábiles. Si no obtiene respuesta en plazo, puede recurrir a la Autoridad Nacional de Transparencia y Acceso a la Información (ANTAI). No procede cuando entorpezca un trámite administrativo o judicial en curso, ni por seguridad del Estado."));
      form.appendChild(alert);

      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({
        variant: "primary",
        text: "Enviar solicitud ARCO",
        onClick: function () {
          errBox.textContent = "";
          errBox.classList.remove("is-visible");
          var derecho = arcoDerecho();
          var desc = byId("arcoDescripcion");
          var correo = byId("arcoCorreo");
          var fundamentoVal = byId("arcoFundamento");
          if (!derecho) { errBox.textContent = "Seleccione el derecho que desea ejercer."; errBox.classList.add("is-visible"); return; }
          if (!desc) { errBox.textContent = "Describa su solicitud."; errBox.classList.add("is-visible"); return; }
          if (!correo || correo.indexOf("@") < 0) { errBox.textContent = "Ingrese un correo de notificación válido."; errBox.classList.add("is-visible"); return; }
          if (derecho === "OPOSICION" && !fundamentoVal) { errBox.textContent = "La oposición exige motivos fundados y legítimos (fundamento)."; errBox.classList.add("is-visible"); return; }
          draft.mergeDraft({ arco: { derecho: derecho, condicion: byId("arcoCondicion"), expediente: byId("arcoExpediente"), correo: correo } });
          renderContent(container, opts, false, true);
        },
      }));
      form.appendChild(actions);

      function toggleFundamento(show) {
        fundamento.style.display = show ? "" : "none";
      }
      toggleFundamento(DERECHOS[0].value === "OPOSICION");
      return form;
    }

    function arcoDerecho() {
      var inputs = document.getElementsByName("arcoDerecho");
      for (var i = 0; i < inputs.length; i++) { if (inputs[i].checked) return inputs[i].value; }
      return "";
    }

    function arcoSentPanel() {
      var derecho = draft.getDraft().arco ? draft.getDraft().arco.derecho : "ACCESO";
      var info = derechoInfo(derecho) || DERECHOS[0];
      var panel = layout.el("div", "app-alert app-alert--info");
      panel.appendChild(layout.el("span", "app-alert__title", "Solicitud ARCO registrada (simulada)"));
      panel.appendChild(layout.el("span", "app-alert__text", "Referencia: ARCO-2026-0031. Derecho: " + info.label + ". Plazo de respuesta: " + info.plazo + ". La solicitud quedó trazada y será atendida por el responsable del tratamiento."));
      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "primary", text: "Registrar otra solicitud ARCO", onClick: function () { renderContent(container, opts, false, false); } }));
      panel.appendChild(actions);
      return panel;
    }

    function arcoBlock(errBox, mostrarArcoEnvio) {
      var block = layout.el("div", "seguimiento-block");
      if (mostrarArcoEnvio) {
        block.appendChild(arcoSentPanel());
      } else {
        block.appendChild(arcoForm(errBox));
      }
      block.appendChild(arcoSolicitudesBlock());
      return block;
    }

    function renderContent(container, opts, mostrarEnvio, mostrarArcoEnvio) {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Ayuda y FAQ", "Consultas, peticiones y ejercicio de derechos ARCO"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", null, ""));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var errBox = layout.el("div", "auth-error", "");
      errBox.setAttribute("aria-live", "polite");
      inner.appendChild(errBox);

      if (mostrarEnvio) {
        inner.appendChild(sentPanel());
      } else {
        inner.appendChild(formNode(errBox));
      }

      inner.appendChild(arcoBlock(errBox, mostrarArcoEnvio));
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
      empty.appendChild(layout.el("p", null, "Puede enviarnos su consulta o su solicitud ARCO igualmente mediante los formularios."));
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
        setTimeout(function () { renderContent(container, opts, false, false); }, 700);
        return;
      }
      if (state === "error") { renderError(container, { onRetry: function () { show("carga"); } }); return; }
      if (state === "vacio") { renderEmpty(container); return; }
      renderContent(container, opts, false, false);
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p27 = { renderP27: renderP27, TIPOS: TIPOS, FAQ: FAQ, DERECHOS: DERECHOS };
})(window);

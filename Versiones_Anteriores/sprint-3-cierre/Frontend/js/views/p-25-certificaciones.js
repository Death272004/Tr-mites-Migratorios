/**
 * P-25 — Certificaciones en línea (flujo corto de 3 pasos).
 * Solicita la certificación de Estatus Migratorio o de Movimiento Migratorio.
 * Pantalla de servicios; emisión/entrega en I-11/I-12 (modo consulta mínimo).
 * Verifica el estatus contra el expediente SNM (origen S, sellado [V]).
 * Estados de vista demo: carga, éxito, vacío y error.
 * Script clásico: expone `tm.views.p25.renderP25`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var stepper = global.tm.ui.stepper;
  var verifiedField = global.tm.ui.verifiedField;
  var draft = global.tm.draft;

  var STEPS = [
    { label: "Datos" },
    { label: "Documentos y retiro" },
    { label: "Pago y confirmación" },
  ];

  var ENTIDADES = [
    { value: "", label: "Seleccione…" },
    { value: "DGI", label: "DGI" },
    { value: "MITRADEL", label: "MITRADEL" },
    { value: "SNM", label: "SNM" },
    { value: "OTRO", label: "Otro" },
  ];
  var PAGOS = [
    { value: "", label: "Seleccione…" },
    { value: "ESTATUS_10", label: "B/.10.00 · Estatus migratorio" },
    { value: "TIMBRES_8", label: "B/.8.00 · Timbres de naturalización" },
  ];

  var PASAPORTE_DEMO = "PA-DEMO-1234 · carné E-2026-000184";

  function byId(id) {
    var e = document.getElementById(id);
    return e ? String(e.value).trim() : "";
  }

  function textVal(id) {
    var e = document.getElementById(id);
    return e ? String(e.value).trim() : null;
  }

  function checkVal(id) {
    var e = document.getElementById(id);
    return e ? e.checked : null;
  }

  function radioVal(name) {
    var list = document.getElementsByName(name);
    for (var i = 0; i < list.length; i++) if (list[i].checked) return list[i].value;
    return null;
  }

  function renderP25(container, opts) {
    opts = opts || {};
    var saved = draft.getDraft().certificaciones || {};
    var values = saved.valores || {};
    var stepIndex = typeof saved.paso === "number" ? Math.min(Math.max(saved.paso, 0), STEPS.length - 1) : 0;
    var mode = "carga";
    var confirmed = false;

    function save() {
      draft.mergeDraft({ certificaciones: { paso: stepIndex, valores: values } });
    }

    function docKey(id) { return "doc:" + id; }

    function docUpload(id, label, required, help) {
      return global.tm.ui.fileUpload({
        id: id,
        label: label + (required ? " *" : ""),
        accept: ".pdf,.jpg,.jpeg,.png",
        helpText: (help ? help + " " : "") + "PDF/JPG/PNG ≤ 5 MB.",
        onChange: function (f) { values[docKey(id)] = f ? { name: f.name, size: f.size } : null; save(); },
      });
    }

    function radioGroup(name, opciones, selected) {
      var rg = layout.el("div", "radio-group");
      for (var i = 0; i < opciones.length; i++) {
        var o = opciones[i];
        var lbl = layout.el("label", "radio-option");
        var input = layout.el("input");
        input.type = "radio";
        input.name = name;
        input.value = o.value;
        if (selected === o.value) input.checked = true;
        input.addEventListener("change", function () { collect(); save(); paint(); });
        lbl.appendChild(input);
        lbl.appendChild(layout.el("span", null, o.label));
        rg.appendChild(lbl);
      }
      return rg;
    }

    function collect() {
      var v;
      if ((v = radioVal("tramite")) !== null) values.tramite = v;
      if ((v = textVal("entidad")) !== null) values.entidad = v;
      if ((v = checkVal("usoNaturalizacion")) !== null) values.usoNaturalizacion = v;
      if ((v = textVal("pasaportesAnteriores")) !== null) values.pasaportesAnteriores = v;
      if ((v = radioVal("tipoRetiro")) !== null) values.tipoRetiro = v;
      if ((v = textVal("cedulaAbogado")) !== null) values.cedulaAbogado = v;
      if ((v = textVal("idoneidadAbogado")) !== null) values.idoneidadAbogado = v;
      if ((v = textVal("pago")) !== null) values.pago = v;
    }

    function validate() {
      if (stepIndex === 0) {
        if (!values.tramite) return "Seleccione el trámite a certificar.";
        if (!values.entidad) return "Seleccione la entidad a la que presentará el certificado.";
        return null;
      }
      if (stepIndex === 1) {
        if (values.tramite === "ESTATUS" && !values[docKey("copiaGenerales")]) {
          return "Adjunte la copia de generales del pasaporte y sello.";
        }
        if (values.tramite === "MOVIMIENTO" && !values[docKey("pasaporteCompleto")]) {
          return "Adjunte la copia de todo el pasaporte vigente (todas las páginas).";
        }
        if (!values.tipoRetiro) return "Seleccione el tipo de retiro.";
        if (values.tipoRetiro === "APODERADO") {
          if (!values[docKey("poderNotariado")]) return "Adjunte el poder notariado.";
          if (!values.cedulaAbogado) return "Ingrese la cédula del apoderado.";
          if (!values.idoneidadAbogado) return "Ingrese la idoneidad del apoderado.";
        }
        return null;
      }
      if (!values.pago) return "Seleccione el método de pago.";
      return null;
    }

    function buildDatos(body) {
      body.appendChild(layout.el("h2", "wizard-section-title", "Paso 1 · Datos de la certificación"));

      var tramite = layout.el("fieldset", "form-field");
      tramite.appendChild(layout.el("legend", "form-field__label", "Trámite solicitado *"));
      tramite.appendChild(radioGroup("tramite", [
        { value: "ESTATUS", label: "Certificación de Estatus Migratorio" },
        { value: "MOVIMIENTO", label: "Certificación de Movimiento Migratorio" },
      ], values.tramite || "ESTATUS"));
      body.appendChild(tramite);

      var grid = layout.el("div", "wizard-grid");
      grid.appendChild(verifiedField({
        id: "pasaporteCarné",
        label: "Número de pasaporte y carné",
        value: PASAPORTE_DEMO,
        fuente: "SNM (expediente)",
        fecha: "2026-09-22",
      }));
      grid.appendChild(field.fieldSelect({ id: "entidad", label: "Entidad a la que se presenta el certificado", options: ENTIDADES, value: values.entidad, required: true }));
      grid.appendChild(field.fieldText({ id: "pasaportesAnteriores", label: "Pasaportes anteriores (números, si aplica)", value: values.pasaportesAnteriores }));
      body.appendChild(grid);

      body.appendChild(field.fieldCheckbox({
        id: "usoNaturalizacion",
        label: "¿Es para uso de Naturalización? (cambia el timbre a B/.8.00 y la leyenda)",
        checked: !!values.usoNaturalizacion,
      }));
    }

    function buildDocumentos(body) {
      body.appendChild(layout.el("h2", "wizard-section-title", "Paso 2 · Documentos y retiro"));
      body.appendChild(layout.el("p", "wizard-summary", values.tramite === "MOVIMIENTO"
        ? "Certificación de Movimiento Migratorio: adjunte el pasaporte vigente completo."
        : "Certificación de Estatus Migratorio: adjunte la copia de generales del pasaporte y sello."));

      var docsBlock = layout.el("fieldset", "wizard-section");
      docsBlock.appendChild(layout.el("legend", "wizard-section-title", "Documentos"));
      var docsGrid = layout.el("div", "wizard-grid");
      if (values.tramite === "MOVIMIENTO") {
        docsGrid.appendChild(docUpload("pasaporteCompleto", "Copia de todo el pasaporte vigente (todas las páginas)", true, "Las entradas/salidas se cruzan con la BD del SNM (origen A)."));
      } else {
        docsGrid.appendChild(docUpload("copiaGenerales", "Copia de generales del pasaporte y sello", true, "Origen A: sustituible por lectura del sello digital; en MVP carga manual."));
      }
      docsGrid.appendChild(docUpload("actaMenor", "Acta de nacimiento del menor y documento del representante", false, "Origen A: Registro Civil (TE), sellado [V]; solo si el titular es menor."));
      docsBlock.appendChild(docsGrid);
      body.appendChild(docsBlock);

      var retiro = layout.el("fieldset", "form-field");
      retiro.appendChild(layout.el("legend", "form-field__label", "Tipo de retiro *"));
      retiro.appendChild(radioGroup("tipoRetiro", [
        { value: "PERSONAL", label: "Personal" },
        { value: "APODERADO", label: "Por apoderado (poder notariado + cédula e idoneidad)" },
      ], values.tipoRetiro || "PERSONAL"));
      body.appendChild(retiro);

      if (values.tipoRetiro === "APODERADO") {
        var apBlock = layout.el("fieldset", "wizard-section");
        apBlock.appendChild(layout.el("legend", "wizard-section-title", "Datos del apoderado"));
        var apGrid = layout.el("div", "wizard-grid");
        apGrid.appendChild(docUpload("poderNotariado", "Poder notariado", true, ""));
        apGrid.appendChild(field.fieldText({ id: "cedulaAbogado", label: "Cédula del apoderado", value: values.cedulaAbogado, required: true }));
        apGrid.appendChild(field.fieldText({ id: "idoneidadAbogado", label: "N.º de idoneidad", value: values.idoneidadAbogado, required: true }));
        apBlock.appendChild(apGrid);
        body.appendChild(apBlock);
      }
    }

    function timbre() {
      return values.usoNaturalizacion ? "B/.8.00 (timbres de naturalización)" : "B/.10.00";
    }

    function buildPago(body) {
      body.appendChild(layout.el("h2", "wizard-section-title", "Paso 3 · Pago y confirmación"));

      var card = layout.el("div", "detail-card");
      var resumen = [
        ["Trámite", values.tramite === "MOVIMIENTO" ? "Movimiento Migratorio" : "Estatus Migratorio"],
        ["Pasaporte y carné", PASAPORTE_DEMO],
        ["Entidad", labelEntidad(values.entidad)],
        ["Uso de naturalización", values.usoNaturalizacion ? "Sí" : "No"],
        ["Tipo de retiro", values.tipoRetiro === "APODERADO" ? "Por apoderado" : "Personal"],
        ["Importe", timbre()],
      ];
      for (var i = 0; i < resumen.length; i++) {
        var row = layout.el("div", "detail-row");
        row.appendChild(layout.el("span", "detail-row__label", resumen[i][0]));
        row.appendChild(layout.el("span", "detail-row__value", resumen[i][1]));
        card.appendChild(row);
      }
      body.appendChild(card);

      var grid = layout.el("div", "wizard-grid");
      grid.appendChild(field.fieldSelect({ id: "pago", label: "Pago *", options: PAGOS, value: values.pago, required: true }));
      body.appendChild(grid);
    }

    function drawStep() {
      var body = layout.el("div", "wizard-body");
      if (stepIndex === 0) buildDatos(body);
      else if (stepIndex === 1) buildDocumentos(body);
      else buildPago(body);

      var errBox = layout.el("div", "auth-error", "");
      errBox.setAttribute("aria-live", "polite");
      body.appendChild(errBox);

      var actions = layout.el("div", "auth-actions");
      actions.appendChild(button({
        text: "Volver",
        disabled: stepIndex === 0,
        onClick: function () {
          if (stepIndex === 0) return;
          collect(); save(); stepIndex--; paint();
        },
      }));
      actions.appendChild(button({
        variant: "primary",
        text: stepIndex === STEPS.length - 1 ? "Confirmar solicitud" : "Continuar",
        onClick: function () {
          errBox.textContent = "";
          errBox.classList.remove("is-visible");
          collect();
          var msg = validate();
          if (msg) { errBox.textContent = msg; errBox.classList.add("is-visible"); return; }
          save();
          if (stepIndex === STEPS.length - 1) { confirmed = true; paint(); return; }
          stepIndex++; save(); paint();
        },
      }));
      body.appendChild(actions);
      return body;
    }

    function confirmPanel() {
      var panel = layout.el("div", "resultado-doc");
      var head = layout.el("div", "resultado-doc__head");
      head.appendChild(layout.el("h2", "resultado-doc__title", "Solicitud de certificación registrada"));
      head.appendChild(layout.el("span", "badge badge--success", "EN TRÁMITE"));
      panel.appendChild(head);
      panel.appendChild(layout.el("p", "resultado-doc__meta", "Referencia: CERT-" + (values.tramite === "MOVIMIENTO" ? "MOV" : "EST") + "-2026-0031."));
      panel.appendChild(layout.el("p", "resultado-doc__text", "El despacho emitirá y entregará su certificación (I-11/I-12). Recibirá una notificación cuando esté disponible para retiro. Importe: " + timbre() + "."));
      var actions = layout.el("div", "resultado-doc__actions");
      actions.appendChild(button({ text: "Nueva consulta", onClick: function () { confirmed = false; stepIndex = 0; paint(); } }));
      actions.appendChild(button({ variant: "primary", text: "Ir a mis trámites", onClick: function () { if (opts.onNavigate) opts.onNavigate("#/mis-tramites"); } }));
      panel.appendChild(actions);
      return panel;
    }

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
        confirmed = false;
        setMode(select.value);
      });
      return wrap;
    }

    function setMode(state) {
      if (state === "carga") {
        mode = "carga";
        paint();
        setTimeout(function () { if (mode === "carga") { mode = "exito"; paint(); } }, 700);
        return;
      }
      mode = state;
      paint();
    }

    function renderLoading() {
      var loading = layout.el("div", "app-loading");
      loading.appendChild(layout.el("span", "spinner"));
      loading.appendChild(layout.el("span", null, "Verificando su expediente en el SNM…"));
      return loading;
    }

    function renderEmpty() {
      var empty = layout.el("div", "app-empty");
      empty.appendChild(layout.el("p", null, "No encontramos el pasaporte ni el expediente en el Servicio Nacional de Migración."));
      empty.appendChild(layout.el("p", null, "El servicio opera en modo consulta mínimo; verifique sus datos o intente más tarde."));
      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { setMode("carga"); } }));
      empty.appendChild(actions);
      return empty;
    }

    function renderError() {
      var wrap = layout.el("div");
      var alert = layout.el("div", "app-alert app-alert--warning");
      alert.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
      alert.appendChild(layout.el("span", "app-alert__text", "No pudimos verificar su expediente. Intente nuevamente."));
      wrap.appendChild(alert);
      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { setMode("carga"); } }));
      wrap.appendChild(actions);
      return wrap;
    }

    function paint() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Certificaciones en línea", "Estatus migratorio y movimiento migratorio · 3 pasos"));

      if (mode === "carga") { inner.appendChild(renderLoading()); container.appendChild(inner); return; }

      inner.appendChild(toolbar());
      if (mode === "error") { inner.appendChild(renderError()); container.appendChild(inner); return; }
      if (mode === "vacio") { inner.appendChild(renderEmpty()); container.appendChild(inner); return; }
      if (confirmed) { inner.appendChild(confirmPanel()); container.appendChild(inner); return; }

      inner.appendChild(stepper({ steps: STEPS, current: stepIndex }));
      inner.appendChild(layout.el("p", "wizard-summary", "Verificación de estatus contra el expediente del SNM (origen S). En modo consulta mínimo la emisión se completa en el despacho."));
      inner.appendChild(drawStep());
      container.appendChild(inner);
    }

    function toolbar() {
      var tb = layout.el("div", "toolbar");
      tb.appendChild(layout.el("span", null, "Paso " + (stepIndex + 1) + " de " + STEPS.length));
      tb.appendChild(demoSelector());
      return tb;
    }

    opts.onDemoState = setMode;
    paint();
    setTimeout(function () { if (mode === "carga") { mode = "exito"; paint(); } }, 700);
  }

  function labelEntidad(value) {
    for (var i = 0; i < ENTIDADES.length; i++) if (ENTIDADES[i].value === value) return ENTIDADES[i].label;
    return "—";
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p25 = { renderP25: renderP25, STEPS: STEPS };
})(window);

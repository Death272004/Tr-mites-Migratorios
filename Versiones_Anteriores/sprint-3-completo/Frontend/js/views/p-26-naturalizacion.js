/**
 * P-26 — Naturalización (Carta de Naturaleza). Flujo específico N-1 a N-13.
 * Se despliega cuando el trámite es Naturalización; requiere abogado apoderado.
 * Reutiliza los componentes del asistente (stepper, campos, file-upload).
 * Persiste el avance en el borrador (`tm.draft`, clave `naturalizacion`).
 * Estados de vista demo: carga, éxito, vacío (trámite distinto) y error.
 * Script clásico: expone `tm.views.p26.renderP26`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var stepper = global.tm.ui.stepper;
  var data = global.tm.data;
  var draft = global.tm.draft;

  var TITULO = "Naturalización (Carta de Naturaleza)";
  var SUBTITULO = "Flujo específico N-1 a N-13 · requiere abogado apoderado";

  var OPC_SEXO = [
    { value: "", label: "Seleccione…" },
    { value: "F", label: "Femenino" },
    { value: "M", label: "Masculino" },
    { value: "O", label: "Otro" },
  ];
  var OPC_ESTADO_CIVIL = [
    { value: "", label: "Seleccione…" },
    { value: "SOLTERO", label: "Soltero(a)" },
    { value: "CASADO", label: "Casado(a)" },
    { value: "DIVORCIADO", label: "Divorciado(a)" },
    { value: "VIUDO", label: "Viudo(a)" },
  ];
  var OPC_FUNDAMENTO = [
    { value: "", label: "Seleccione…" },
    { value: "1", label: "Numeral 1 del Art. 10" },
    { value: "2", label: "Numeral 2 del Art. 10" },
    { value: "3", label: "Numeral 3 del Art. 10 (reciprocidad)" },
  ];
  var OPC_SINO = [
    { value: "", label: "Seleccione…" },
    { value: "SI", label: "Sí" },
    { value: "NO", label: "No" },
  ];
  var OPC_EXAMEN = [
    { value: "", label: "Seleccione…" },
    { value: "APROBADO", label: "Aprobado" },
    { value: "EXONERADO", label: "Exonerado" },
    { value: "PENDIENTE", label: "Pendiente" },
  ];

  var STEPS = [
    {
      label: "N-1 Apoderado",
      title: "N-1 · Apoderado",
      intro: "Datos del abogado que presenta la solicitud en nombre del peticionario.",
      fields: [
        { id: "nombreAbogado", label: "Nombre del abogado apoderado", required: true },
        { id: "cedulaAbogado", label: "Cédula del abogado", required: true },
        { id: "idoneidadAbogado", label: "N.º de idoneidad", required: true },
        { id: "telefonoAbogado", label: "Teléfonos", required: true },
        { id: "correoAbogado", label: "Correo electrónico", required: true },
        { id: "direccionAbogado", label: "Dirección del abogado" },
      ],
      docs: [
        { id: "autorizacionNotariada", label: "Autorización notariada del pasante", required: true },
      ],
      note: "[C] datos del apoderado; el despacho valida cédula e idoneidad (P-08).",
    },
    {
      label: "N-2 Poder y solicitud",
      title: "N-2 · Poder y solicitud",
      intro: "Datos del peticionario tal como figuran en el pasaporte y en el carné E.",
      fields: [
        { id: "nombrePasaporte", label: "Nombre como aparece en el pasaporte", required: true },
        { id: "estatusCarnE", label: "Estatus migratorio y carné E", required: true },
        { id: "domicilio", label: "Domicilio", required: true },
        { id: "sexo", label: "Sexo", type: "select", options: OPC_SEXO, required: true },
        { id: "edad", label: "Edad" },
        { id: "estadoCivil", label: "Estado civil", type: "select", options: OPC_ESTADO_CIVIL, required: true },
        { id: "lugarNacimiento", label: "Lugar de nacimiento", required: true },
        { id: "nacionalidadNacimiento", label: "Nacionalidad de nacimiento", type: "select", options: data.paisOptions("Seleccione…"), required: true },
        { id: "carneE", label: "Carné E" },
        { id: "pasaporte", label: "Pasaporte" },
        { id: "correo", label: "Correo electrónico" },
        { id: "telefono", label: "Teléfonos" },
        { id: "nombrePadre", label: "Nombre del padre" },
        { id: "nacionalidadPadre", label: "Nacionalidad del padre", type: "select", options: data.paisOptions("Seleccione…") },
        { id: "nombreMadre", label: "Nombre de la madre" },
        { id: "nacionalidadMadre", label: "Nacionalidad de la madre", type: "select", options: data.paisOptions("Seleccione…") },
        { id: "fundamentoDerecho", label: "Fundamento de derecho", type: "select", options: OPC_FUNDAMENTO, required: true },
        { id: "servicioPublico", label: "Constancia de servicio público" },
      ],
      docs: [
        { id: "solicitudSellada", label: "Poder/solicitud con sellos", required: true, help: "Sellos del carné E y del estatus (origen A/S)." },
      ],
      note: "[C] la captura de datos; [D] documentos sellados del carné E y del estatus.",
    },
    {
      label: "N-3 Datos migratorios",
      title: "N-3 · Datos migratorios",
      intro: "Documentos migratorios del peticionario.",
      docsTitle: "Documentos migratorios",
      docs: [
        { id: "carneEAutenticado", label: "Carné E autenticado (B/.2.00)", required: true },
        { id: "certificacionEstatus", label: "Certificación de estatus migratorio «para uso de Naturalización» (B/.8.00)", required: true, help: "Vigencia 90 días." },
        { id: "pasaporteCompleto", label: "Copia completa del pasaporte con sello de registro", required: true, help: "Apostillado/legalizado en consulado y certificado por Relaciones Exteriores." },
      ],
      note: "[C] archivos; [V] sellado del carné E (TE).",
    },
    {
      label: "N-4 Antecedentes",
      title: "N-4 · Antecedentes penales",
      intro: "Antecedentes penales del país de residencia de los últimos 5 años o de origen, y de Panamá.",
      fields: [
        { id: "salidaMas3Meses", label: "¿Salió del país por más de 3 meses en los últimos 5 años?", type: "select", options: OPC_SINO, required: true },
      ],
      docsTitle: "Antecedentes",
      docs: [
        { id: "antecedentesResidencia", label: "Antecedentes del país de residencia (últimos 5 años) u origen", required: true, help: "Vigencia 30 días." },
        { id: "antecedentesPanama", label: "Antecedentes penales de Panamá", required: true },
        { id: "declaracionNoSalida", label: "Declaración jurada de no salida del país por más de 3 meses (si aplica)" },
      ],
      note: "Antecedentes con vigencia de 30 días; documentos del exterior apostillados y certificados por Relaciones Exteriores.",
    },
    {
      label: "N-5 Vínculos",
      title: "N-5 · Vínculos familiares",
      intro: "Adjunte únicamente los documentos que correspondan a su caso (Registro Civil).",
      docsTitle: "Vínculos familiares",
      docs: [
        { id: "certMatrimonio", label: "Certificado de matrimonio (B/.3.00)", help: "[V] sellado del Registro Civil." },
        { id: "certNacimientoConyuge", label: "Certificado de nacimiento del cónyuge", help: "[V] sellado del Registro Civil." },
        { id: "certNacimientoHijos", label: "Certificado de nacimiento de hijos panameños", help: "[V] sellado del Registro Civil." },
        { id: "certPadreMadre", label: "Certificado de padre/madre panameño", help: "[V] sellado del Registro Civil." },
        { id: "certInscripcionNaturalizacion", label: "Certificado de inscripción de naturalización (B/.3.00)" },
      ],
      note: "[V] sellados del Registro Civil (§2.3).",
    },
    {
      label: "N-6 Solvencia",
      title: "N-6 · Solvencia económica (2 de 5)",
      intro: "Adjunte al menos 2 de las siguientes 5 opciones para acreditar solvencia.",
      minDocs: 2,
      docsTitle: "Opciones de solvencia (elija al menos 2)",
      docs: [
        { id: "declaracionRenta", label: "Declaración de renta de 2 años con recibo" },
        { id: "cartaBancaria", label: "Carta bancaria de 4 cifras medias", help: "Vigencia 30 días." },
        { id: "cartaTrabajo", label: "Carta de trabajo + ficha CSS de 9 cuotas notariada", help: "Ficha CSS 90 días." },
        { id: "certJubilacion", label: "Certificación de jubilación" },
        { id: "inversion", label: "Inversión: constancia de propiedad o acciones", help: "Admite sello [V] (origen A)." },
      ],
      note: "[C]; la certificación bancaria y la constancia de propiedad admiten sello [V] (origen A).",
    },
    {
      label: "N-7 Dependiente",
      title: "N-7 · Dependiente (ama de casa / estudiante)",
      intro: "Complete este paso solo si el peticionario es dependiente.",
      fields: [
        { id: "nombreResponsable", label: "Nombre del responsable" },
        { id: "cedulaResponsable", label: "Cédula del responsable" },
      ],
      docsTitle: "Documentos del dependiente",
      docs: [
        { id: "cartaResponsabilidad", label: "Carta de responsabilidad" },
        { id: "copiaResponsable", label: "Copia autenticada y timbrada del responsable (B/.2.00)" },
        { id: "pazSalvoDGIResponsable", label: "Paz y salvo de la DGI del responsable", help: "[V] pendiente (§2.3)." },
        { id: "comprobacionVinculos", label: "Comprobación de vínculos" },
      ],
      note: "[C]; paz y salvo de la DGI del responsable [V] pendiente si la DGI habilita el servicio.",
    },
    {
      label: "N-8 Entrevista",
      title: "N-8 · Entrevista (8 páginas)",
      intro: "Adjunte el formato de entrevista escaneado, completado con bolígrafo azul y letra imprenta.",
      docsTitle: "Formato de entrevista",
      docs: [
        { id: "entrevistaEscaneada", label: "Entrevista escaneada (8 secciones)", required: true, help: "Datos personales; familia; trabajo/ingresos/educación; situación migratoria; país de origen; cultura y civismo; razones migratorias; antecedentes y redes sociales." },
      ],
      note: "[C] adjunte el formato completo escaneado.",
    },
    {
      label: "N-9 Paz y salvo DGI",
      title: "N-9 · Paz y salvo DGI",
      intro: "Registre el número de confirmación del paz y salvo de la DGI.",
      fields: [
        { id: "numeroConfirmacionDGI", label: "Número de confirmación", required: true },
        { id: "nombreFirmaDGI", label: "Nombre y firma", required: true },
      ],
      docsTitle: "Respaldo",
      docs: [
        { id: "pazSalvoDGI", label: "Paz y salvo DGI", help: "[V] pendiente si la DGI habilita el servicio (§8.2)." },
      ],
      note: "[C]; [V] pendiente si la DGI habilita el servicio (§8.2).",
    },
    {
      label: "N-10 Salud y fotos",
      title: "N-10 · Salud y fotos",
      intro: "Certificado médico y fotografías recientes.",
      fields: [
        { id: "consentimientoSensibles", label: "Otorga consentimiento expreso para el tratamiento de datos de salud (Ley 81 / DE 285).", type: "check", required: true },
      ],
      docsTitle: "Documentos",
      docs: [
        { id: "certificadoMedico", label: "Certificado médico general de buena salud", required: true, help: "90 días; con carné E, sello y firma." },
        { id: "fotografias", label: "3 fotos carné", required: true, help: "3.5 × 4.5 cm; vestimenta formal." },
      ],
      note: "Dato sensible: se exige consentimiento expreso (Ley 81 / DE 285).",
    },
    {
      label: "N-11 Reciprocidad",
      title: "N-11 · Ley de Reciprocidad",
      intro: "Aplica únicamente cuando el fundamento es el numeral 3 del Art. 10 (reciprocidad).",
      fields: [
        { id: "aplicaReciprocidad", label: "¿Solicita por reciprocidad (numeral 3)?", type: "select", options: OPC_SINO, required: true },
      ],
      docsTitle: "Documentos de reciprocidad",
      docs: [
        { id: "fotocopiaConsulado", label: "Fotocopia autenticada en consulado" },
        { id: "certRelacionesExteriores", label: "Certificación de Relaciones Exteriores" },
        { id: "certLeyVigencia", label: "Certificación de existencia y vigencia de la ley" },
      ],
      note: "Presente la fotocopia autenticada en consulado + certificación de Relaciones Exteriores, o la certificación de existencia y vigencia de la ley.",
    },
    {
      label: "N-12 Examen",
      title: "N-12 · Examen de conocimientos del TE",
      intro: "Registre el resultado del examen del Tribunal Electoral o su exoneración.",
      fields: [
        { id: "resultadoExamen", label: "Resultado", type: "select", options: OPC_EXAMEN, required: true },
      ],
      docsTitle: "Registro",
      docs: [
        { id: "registroExamen", label: "Registro del resultado o de la exoneración" },
      ],
      note: "Exoneración: reciprocidad España/América Latina, estudios en Panamá o discapacidad con certificación médica.",
    },
    {
      label: "N-13 Declaración",
      title: "N-13 · Declaración jurada y firma",
      intro: "Declaración jurada ante notario, con B/.8.00 en timbres y vigencia de 1 año.",
      fields: [
        { id: "motivos", label: "Motivos de la solicitud", type: "textarea", rows: 4, required: true },
        { id: "renunciaNacionalidad", label: "Renuncio a mi nacionalidad anterior conforme al procedimiento.", type: "check", required: true },
        { id: "huella", label: "Autorizo el registro de mi huella dactilar para el expediente.", type: "check", required: true },
      ],
      docsTitle: "Declaración notariada",
      docs: [
        { id: "declaracionNotariada", label: "Declaración jurada notariada", required: true, help: "B/.8.00 en timbres; vigencia 1 año." },
      ],
      aviso: "El Art. 385 del Código Penal sanciona la falsedad en declaración jurada.",
      note: "[C] firma ante notario.",
    },
  ];

  function byId(id) {
    var e = document.getElementById(id);
    return e ? String(e.value).trim() : "";
  }

  function renderP26(container, opts) {
    opts = opts || {};

    var saved = draft.getDraft().naturalizacion || {};
    var values = saved.valores || {};
    var stepIndex = typeof saved.paso === "number" ? Math.min(Math.max(saved.paso, 0), STEPS.length - 1) : 0;
    var mode = "carga";
    var confirmed = false;

    function save() {
      draft.mergeDraft({ naturalizacion: { paso: stepIndex, valores: values } });
    }

    function docKey(id) { return "doc:" + id; }

    function collect(step) {
      if (!step.fields) return;
      for (var i = 0; i < step.fields.length; i++) {
        var def = step.fields[i];
        if (def.type === "check") {
          var c = document.getElementById(def.id);
          values[def.id] = c ? c.checked : false;
        } else {
          values[def.id] = byId(def.id);
        }
      }
    }

    function validate(step) {
      if (step.fields) {
        for (var i = 0; i < step.fields.length; i++) {
          var def = step.fields[i];
          if (!def.required) continue;
          if (def.type === "check") {
            if (!values[def.id]) return "Debe marcar: " + def.label;
          } else if (!values[def.id]) {
            return "Complete: " + def.label + ".";
          }
        }
      }
      if (step.docs) {
        var count = 0;
        for (var j = 0; j < step.docs.length; j++) {
          var doc = step.docs[j];
          var has = !!values[docKey(doc.id)];
          if (has) count++;
          if (doc.required && !has) return "Adjunte: " + doc.label + ".";
        }
        if (step.minDocs && count < step.minDocs) {
          return "Adjunte al menos " + step.minDocs + " documentos en este paso (lleva " + count + ").";
        }
      }
      return null;
    }

    function buildField(def) {
      var value = values[def.id];
      if (def.type === "check") {
        return field.fieldCheckbox({ id: def.id, label: def.label, checked: !!value, helpText: def.help });
      }
      if (def.type === "select") {
        return field.fieldSelect({ id: def.id, label: def.label, options: def.options || [], value: value || "", required: def.required, helpText: def.help });
      }
      if (def.type === "date") {
        return field.fieldDate({ id: def.id, label: def.label, value: value || "", required: def.required, helpText: def.help });
      }
      if (def.type === "textarea") {
        return field.fieldTextarea({ id: def.id, label: def.label, value: value || "", rows: def.rows || 3, required: def.required, helpText: def.help });
      }
      return field.fieldText({ id: def.id, label: def.label, value: value || "", required: def.required, helpText: def.help });
    }

    function buildDoc(step, doc) {
      var req = doc.required ? " *" : step.minDocs ? " (opción)" : "";
      return global.tm.ui.fileUpload({
        id: doc.id,
        label: doc.label + req,
        accept: ".pdf,.jpg,.jpeg,.png",
        helpText: (doc.help ? doc.help + " " : "") + "PDF/JPG/PNG ≤ 5 MB.",
        onChange: function (f) {
          values[docKey(doc.id)] = f ? { name: f.name, size: f.size } : null;
          save();
          if (progress) {
            var loaded = 0;
            for (var k = 0; k < step.docs.length; k++) if (values[docKey(step.docs[k].id)]) loaded++;
            progress.textContent = loaded + " de " + step.docs.length + " documentos adjuntos";
          }
        },
      });
    }

    var progress = null;

    function drawStep(step) {
      var body = layout.el("div", "wizard-body");

      body.appendChild(layout.el("h2", "wizard-section-title", step.title));
      if (step.intro) body.appendChild(layout.el("p", "wizard-summary", step.intro));

      if (step.fields && step.fields.length) {
        var grid = layout.el("div", "wizard-grid");
        for (var i = 0; i < step.fields.length; i++) grid.appendChild(buildField(step.fields[i]));
        body.appendChild(grid);
      }

      progress = null;
      if (step.docs && step.docs.length) {
        var docsBlock = layout.el("fieldset", "wizard-section");
        docsBlock.appendChild(layout.el("legend", "wizard-section-title", step.docsTitle || "Documentos"));
        var docsGrid = layout.el("div", "wizard-grid");
        for (var j = 0; j < step.docs.length; j++) docsGrid.appendChild(buildDoc(step, step.docs[j]));
        docsBlock.appendChild(docsGrid);
        var loaded = 0;
        for (var k = 0; k < step.docs.length; k++) if (values[docKey(step.docs[k].id)]) loaded++;
        progress = layout.el("span", "form-field__help", loaded + " de " + step.docs.length + " documentos adjuntos");
        docsBlock.appendChild(progress);
        body.appendChild(docsBlock);
      }

      if (step.aviso) {
        var aviso = layout.el("div", "app-alert app-alert--warning");
        aviso.appendChild(layout.el("span", "app-alert__title", "Advertencia legal"));
        aviso.appendChild(layout.el("span", "app-alert__text", step.aviso));
        body.appendChild(aviso);
      }

      if (step.note) body.appendChild(layout.el("p", "seguimiento-note", step.note));

      var errBox = layout.el("div", "auth-error", "");
      errBox.setAttribute("aria-live", "polite");
      body.appendChild(errBox);

      var actions = layout.el("div", "auth-actions");
      actions.appendChild(button({
        text: "Volver",
        disabled: stepIndex === 0,
        onClick: function () {
          if (stepIndex === 0) return;
          collect(step);
          save();
          stepIndex--;
          paint();
        },
      }));
      actions.appendChild(button({
        variant: "primary",
        text: stepIndex === STEPS.length - 1 ? "Finalizar y revisar" : "Continuar",
        onClick: function () {
          errBox.textContent = "";
          errBox.classList.remove("is-visible");
          collect(step);
          var msg = validate(step);
          if (msg) {
            errBox.textContent = msg;
            errBox.classList.add("is-visible");
            return;
          }
          save();
          if (stepIndex === STEPS.length - 1) {
            confirmed = true;
            draft.mergeDraft({ naturalizacion: { paso: stepIndex, valores: values, enviado: true } });
            paint();
            return;
          }
          stepIndex++;
          save();
          paint();
        },
      }));
      body.appendChild(actions);
      return body;
    }

    function toolbar() {
      var tb = layout.el("div", "toolbar");
      tb.appendChild(layout.el("span", null, "Paso " + (stepIndex + 1) + " de " + STEPS.length));
      tb.appendChild(demoSelector());
      return tb;
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
        if (select.value === "carga") {
          mode = "carga";
          paint();
          setTimeout(function () { if (mode === "carga") { mode = "exito"; paint(); } }, 700);
          return;
        }
        mode = select.value;
        paint();
      });
      return wrap;
    }

    function confirmPanel() {
      var panel = layout.el("div", "resultado-doc");
      var head = layout.el("div", "resultado-doc__head");
      head.appendChild(layout.el("h2", "resultado-doc__title", "Solicitud de naturalización lista para envío"));
      head.appendChild(layout.el("span", "badge badge--success", "COMPLETA"));
      panel.appendChild(head);

      var totalDocs = 0;
      for (var i = 0; i < STEPS.length; i++) {
        var step = STEPS[i];
        if (!step.docs) continue;
        for (var j = 0; j < step.docs.length; j++) if (values[docKey(step.docs[j].id)]) totalDocs++;
      }
      panel.appendChild(layout.el("p", "resultado-doc__meta", "Pasos completados: " + STEPS.length + " · Documentos adjuntos: " + totalDocs + "."));
      panel.appendChild(layout.el("p", "resultado-doc__text", "El expediente se enviará al despacho de abogados para su revisión y presentación ante el Servicio Nacional de Migración. El despacho le notificará cualquier observación."));

      var list = layout.el("ul", "ficha__list");
      for (var s = 0; s < STEPS.length; s++) {
        var li = layout.el("li", "ficha__item");
        li.appendChild(layout.el("span", "ficha__marker", "✓"));
        li.appendChild(layout.el("span", null, STEPS[s].label));
        list.appendChild(li);
      }
      panel.appendChild(list);

      var actions = layout.el("div", "resultado-doc__actions");
      actions.appendChild(button({
        text: "Volver a revisar",
        onClick: function () { confirmed = false; stepIndex = STEPS.length - 1; paint(); },
      }));
      actions.appendChild(button({
        variant: "primary",
        text: "Ir a mis trámites",
        onClick: function () { if (opts.onNavigate) opts.onNavigate("#/mis-tramites"); },
      }));
      panel.appendChild(actions);
      return panel;
    }

    function renderLoading() {
      var loading = layout.el("div", "app-loading");
      loading.appendChild(layout.el("span", "spinner"));
      loading.appendChild(layout.el("span", null, "Preparando el flujo de naturalización…"));
      return loading;
    }

    function renderEmpty() {
      var empty = layout.el("div", "app-empty");
      empty.appendChild(layout.el("p", null, "Este flujo aplica únicamente cuando el trámite es la Carta de Naturaleza (Naturalización)."));
      empty.appendChild(layout.el("p", null, "Seleccione «Naturalización» en Nueva solicitud para iniciar el flujo N-1 a N-13."));
      empty.appendChild(button({
        variant: "primary",
        text: "Ir a Nueva solicitud",
        onClick: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/tramite"); },
      }));
      return empty;
    }

    function renderError() {
      var wrap = layout.el("div");
      var alert = layout.el("div", "app-alert app-alert--warning");
      alert.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
      alert.appendChild(layout.el("span", "app-alert__text", "No pudimos cargar el flujo de naturalización. Intente nuevamente."));
      wrap.appendChild(alert);
      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { mode = "carga"; paint(); setTimeout(function () { if (mode === "carga") { mode = "exito"; paint(); } }, 700); } }));
      wrap.appendChild(actions);
      return wrap;
    }

    function paint() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader(TITULO, SUBTITULO));

      if (mode === "carga") {
        inner.appendChild(renderLoading());
        container.appendChild(inner);
        return;
      }

      inner.appendChild(toolbar());

      if (mode === "error") { inner.appendChild(renderError()); container.appendChild(inner); return; }
      if (mode === "vacio") { inner.appendChild(renderEmpty()); container.appendChild(inner); return; }
      if (confirmed) { inner.appendChild(confirmPanel()); container.appendChild(inner); return; }

      inner.appendChild(stepper({
        steps: STEPS.map(function (s) { return { label: s.label }; }),
        current: stepIndex,
      }));
      inner.appendChild(layout.el("p", "wizard-summary", "Requiere abogado apoderado. Los documentos del exterior deben estar apostillados/legalizados y certificados por Relaciones Exteriores."));
      inner.appendChild(drawStep(STEPS[stepIndex]));
      container.appendChild(inner);
    }

    opts.onDemoState = function (state) {
      confirmed = false;
      if (state === "carga") {
        mode = "carga";
        paint();
        setTimeout(function () { if (mode === "carga") { mode = "exito"; paint(); } }, 700);
        return;
      }
      mode = state;
      paint();
    };

    paint();
    setTimeout(function () { if (mode === "carga") { mode = "exito"; paint(); } }, 700);
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p26 = { renderP26: renderP26, STEPS: STEPS };
})(window);

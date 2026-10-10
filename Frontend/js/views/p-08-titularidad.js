/**
 * P-08 — Titularidad y representación.
 * Condición del presentante, datos del titular, representación (si aplica) y
 * datos del representante. Incluye bloque de campos origen [A]/consulta con
 * **carga manual bloqueada** (RUEX, idoneidad del abogado).
 * Script clásico: expone `tm.views.p08.renderP08`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var wizard = global.tm.wizard;
  var draft = global.tm.draft;
  var verifiedField = global.tm.ui.verifiedField;

  var ROUTE = "#/solicitud/titularidad";

  function renderP08(container, opts) {
    opts = opts || {};
    var body = wizard.frame(container, ROUTE);

    var grid = layout.el("div", "wizard-grid");

    var condicion = field.fieldSelect({
      id: "condicion",
      label: "Condición del presentante",
      options: [
        { value: "", label: "Seleccione…" },
        { value: "TITULAR", label: "Titular" },
        { value: "APODERADO", label: "Apoderado" },
        { value: "PADRE_MADRE", label: "Padre/Madre" },
        { value: "REP_JURIDICA", label: "Representante de persona jurídica" },
      ],
      required: true,
    });
    grid.appendChild(condicion);

    var tipoDocTitular = field.fieldSelect({
      id: "tipoDocTitular",
      label: "Tipo de documento del titular",
      options: [
        { value: "PASAPORTE", label: "Pasaporte" },
        { value: "CEDULA_E", label: "Cédula E" },
        { value: "CARNE", label: "Carné" },
      ],
      required: true,
    });
    grid.appendChild(tipoDocTitular);

    var numDocTitular = field.fieldText({ id: "numDocTitular", label: "Número de documento del titular", required: true, helpText: "Se consultará en RUEX (simulado)." });
    grid.appendChild(numDocTitular);

    var nombreTitular = field.fieldText({ id: "nombreTitular", label: "Nombre completo del titular", required: true, helpText: "Debe coincidir con el pasaporte." });
    grid.appendChild(nombreTitular);

    body.appendChild(grid);

    var ruxBox = layout.el("div", "wizard-grid");
    ruxBox.appendChild(verifiedField({
      id: "ruex",
      label: "Estado del RUEX del titular [A]",
      value: "Vigente · Registro de Filiación N.º 8-712-3456",
      fuente: "RUEX · SNM",
      fecha: "2026-10-01",
      onForce: function () { window.alert("Solicitud de revisión manual registrada (simulado). El despacho lo verifica en I-07."); },
    }));
    body.appendChild(ruxBox);

    var repSection = layout.el("fieldset", "wizard-section");
    repSection.appendChild(layout.el("legend", "wizard-section-title", "Representación"));
    var repGrid = layout.el("div", "wizard-grid");

    var tipoRep = field.fieldSelect({
      id: "tipoRep",
      label: "Tipo de representación",
      options: [
        { value: "", label: "Seleccione…" },
        { value: "PODER", label: "Poder notariado" },
        { value: "PATRIA_POTESTAD", label: "Patria potestad" },
        { value: "TUTELA", label: "Tutela" },
        { value: "REP_EMPRESA", label: "Representación legal de empresa" },
      ],
    });
    repGrid.appendChild(tipoRep);

    var docRep = global.tm.ui.fileUpload({
      id: "docRep",
      label: "Documento que acredita la representación",
      accept: ".pdf,.jpg,.jpeg,.png",
      helpText: "Poder notariado, acta de nacimiento, resolución de tutela o certificado de Registro Público.",
    });
    repGrid.appendChild(docRep);

    var cedulaAbogado = field.fieldText({ id: "cedulaAbogado", label: "Cédula e idoneidad del abogado", helpText: "Se valida vigencia ante el Colegio de Abogados (simulado)." });
    repGrid.appendChild(cedulaAbogado);

    var cedulaPasante = field.fieldText({ id: "cedulaPasante", label: "Cédula del pasante (si aplica)" });
    repGrid.appendChild(cedulaPasante);

    repSection.appendChild(repGrid);
    body.appendChild(repSection);

    var abogadoBox = layout.el("div", "wizard-grid");
    abogadoBox.appendChild(verifiedField({
      id: "abogadoIdoneidad",
      label: "Idoneidad del abogado [A]",
      value: "Verificada · Idoneidad vigente",
      fuente: "Colegio de Abogados",
      fecha: "2026-10-01",
      onForce: function () { window.alert("Revisión manual solicitada (simulado)."); },
    }));
    body.appendChild(abogadoBox);

    var repData = layout.el("fieldset", "wizard-section");
    repData.appendChild(layout.el("legend", "wizard-section-title", "Datos del representante"));
    var repDataGrid = layout.el("div", "wizard-grid");
    var repNombre = field.fieldText({ id: "repNombre", label: "Nombre del representante", required: true });
    var repDoc = field.fieldText({ id: "repDoc", label: "Documento del representante", required: true });
    var repTel = field.fieldText({ id: "repTel", label: "Teléfono del representante", required: true });
    var repCorreo = field.fieldText({ id: "repCorreo", label: "Correo del representante", required: true });
    repDataGrid.appendChild(repNombre);
    repDataGrid.appendChild(repDoc);
    repDataGrid.appendChild(repTel);
    repDataGrid.appendChild(repCorreo);
    repData.appendChild(repDataGrid);
    body.appendChild(repData);

    var err = wizard.errorBox();
    body.appendChild(err);

    body.appendChild(wizard.footer({
      onBack: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/tramite"); },
      onNext: function () { submit(); },
    }));

    function updateVisibility() {
      var c = wizard.val(condicion);
      var esTitular = c === "TITULAR";
      repSection.style.display = esTitular ? "none" : "";
      abogadoBox.style.display = c === "APODERADO" ? "" : "none";
      repData.style.display = esTitular ? "none" : "";
    }

    condicion.querySelector("select").addEventListener("change", updateVisibility);
    updateVisibility();

    function submit() {
      wizard.clearError(err);
      var c = wizard.val(condicion);
      if (!c) return wizard.showError(err, "Seleccione la condición del presentante.");
      if (!wizard.val(numDocTitular)) return wizard.showError(err, "Ingrese el número de documento del titular.");
      if (!wizard.val(nombreTitular)) return wizard.showError(err, "Ingrese el nombre completo del titular.");

      var esTitular = c === "TITULAR";
      if (!esTitular) {
        if (!wizard.val(tipoRep)) return wizard.showError(err, "Seleccione el tipo de representación.");
        if (!wizard.val(repNombre) || !wizard.val(repDoc) || !wizard.val(repTel) || !wizard.val(repCorreo)) {
          return wizard.showError(err, "Complete los datos del representante.");
        }
      }
      if (c === "APODERADO" && !wizard.val(cedulaAbogado)) {
        return wizard.showError(err, "Ingrese la cédula e idoneidad del abogado.");
      }

      draft.mergeDraft({
        titularidad: {
          condicion: c,
          tipoDocTitular: wizard.val(tipoDocTitular),
          numDocTitular: wizard.val(numDocTitular),
          nombreTitular: wizard.val(nombreTitular),
          tipoRep: wizard.val(tipoRep),
          cedulaAbogado: wizard.val(cedulaAbogado),
          cedulaPasante: wizard.val(cedulaPasante),
          representante: {
            nombre: wizard.val(repNombre),
            documento: wizard.val(repDoc),
            telefono: wizard.val(repTel),
            correo: wizard.val(repCorreo),
          },
        },
      });

      if (opts.onNavigate) opts.onNavigate(wizard.nextRoute(ROUTE));
    }
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p08 = { renderP08: renderP08 };
})(window);
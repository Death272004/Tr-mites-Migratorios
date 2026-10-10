/**
 * P-09 Paso 1 — Datos personales.
 * Script clásico: expone `tm.views.p09.renderP09`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var wizard = global.tm.wizard;
  var draft = global.tm.draft;
  var data = global.tm.data;

  var ROUTE = "#/solicitud/paso-1";

  function renderP09(container, opts) {
    opts = opts || {};
    var body = wizard.frame(container, ROUTE);
    var d = draft.getDraft().datosPersonales || {};

    var grid = layout.el("div", "wizard-grid");

    function add(node) { grid.appendChild(node); }

    add(field.fieldText({ id: "primerApellido", label: "Primer apellido", value: d.primerApellido, required: true }));
    add(field.fieldText({ id: "segundoApellido", label: "Segundo apellido", value: d.segundoApellido }));
    add(field.fieldText({ id: "nombres", label: "Nombres", value: d.nombres, required: true }));
    add(field.fieldText({ id: "nombresPasaporte", label: "Apellidos y nombres en el pasaporte (si difieren)", value: d.nombresPasaporte }));
    add(field.fieldDate({ id: "fechaNacimiento", label: "Fecha de nacimiento", value: d.fechaNacimiento, required: true }));
    add(field.fieldSelect({ id: "paisNacimiento", label: "País de nacimiento", options: data.paisOptions("Seleccione…"), value: d.paisNacimiento, required: true }));
    add(field.fieldText({ id: "lugarNacimiento", label: "Ciudad / lugar de nacimiento", value: d.lugarNacimiento, required: true }));
    add(field.fieldSelect({ id: "nacionalidad", label: "Nacionalidad (de origen)", options: data.paisOptions("Seleccione…"), value: d.nacionalidad, required: true }));
    add(field.fieldSelect({
      id: "sexo", label: "Sexo", options: [{ value: "", label: "Seleccione…" }, { value: "F", label: "Femenino" }, { value: "M", label: "Masculino" }, { value: "O", label: "Otro" }], value: d.sexo, required: true,
    }));
    add(field.fieldSelect({
      id: "estadoCivil", label: "Estado civil",
      options: [{ value: "", label: "Seleccione…" }, { value: "SOLTERO", label: "Soltero(a)" }, { value: "CASADO", label: "Casado(a)" }, { value: "DIVORCIADO", label: "Divorciado(a)" }, { value: "VIUDO", label: "Viudo(a)" }],
      value: d.estadoCivil, required: true,
    }));
    add(field.fieldText({ id: "nombrePadre", label: "Nombre del padre", value: d.nombrePadre, required: true }));
    add(field.fieldSelect({ id: "nacionalidadPadre", label: "Nacionalidad del padre", options: data.paisOptions("Seleccione…"), value: d.nacionalidadPadre, required: true }));
    add(field.fieldText({ id: "nombreMadre", label: "Nombre de la madre", value: d.nombreMadre, required: true }));
    add(field.fieldSelect({ id: "nacionalidadMadre", label: "Nacionalidad de la madre", options: data.paisOptions("Seleccione…"), value: d.nacionalidadMadre, required: true }));

    body.appendChild(grid);

    var matrimonio = layout.el("fieldset", "wizard-section");
    matrimonio.appendChild(layout.el("legend", "wizard-section-title", "Cónyuge (si está casado/a)"));
    var matGrid = layout.el("div", "wizard-grid");
    matGrid.appendChild(field.fieldText({ id: "nombreConyuge", label: "Nombre del cónyuge", value: d.nombreConyuge }));
    matGrid.appendChild(field.fieldSelect({ id: "nacionalidadConyuge", label: "Nacionalidad del cónyuge", options: data.paisOptions("Seleccione…"), value: d.nacionalidadConyuge }));
    matGrid.appendChild(field.fieldDate({ id: "fechaMatrimonio", label: "Fecha de matrimonio", value: d.fechaMatrimonio }));
    matGrid.appendChild(field.fieldText({ id: "lugarMatrimonio", label: "Lugar de matrimonio", value: d.lugarMatrimonio }));
    matrimonio.appendChild(matGrid);
    body.appendChild(matrimonio);

    var extraGrid = layout.el("div", "wizard-grid");
    extraGrid.appendChild(field.fieldText({ id: "docExterior", label: "Documento de identidad del exterior (si tiene)", value: d.docExterior }));
    extraGrid.appendChild(global.tm.ui.fileUpload({ id: "foto", label: "Foto tamaño carné (3.5 × 4.5 cm)", accept: ".jpg,.jpeg,.png", helpText: "JPG/PNG ≤ 2 MB; sin lentes, gorros, escote ni mangas." }));
    extraGrid.appendChild(field.fieldCheckbox({ id: "huella", label: "Autorizo el uso de mi huella digital para el carné (opcional)", checked: !!d.huella }));
    body.appendChild(extraGrid);

    var err = wizard.errorBox();
    body.appendChild(err);

    body.appendChild(wizard.footer({
      onBack: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/titularidad"); },
      onNext: function () {
        wizard.clearError(err);
        if (!byId("primerApellido")) return wizard.showError(err, "Ingrese el primer apellido.");
        if (!byId("nombres")) return wizard.showError(err, "Ingrese los nombres.");
        if (!byId("fechaNacimiento")) return wizard.showError(err, "Ingrese la fecha de nacimiento.");
        if (!byId("paisNacimiento")) return wizard.showError(err, "Seleccione el país de nacimiento.");
        if (!byId("nacionalidad")) return wizard.showError(err, "Seleccione la nacionalidad.");
        if (!byId("sexo")) return wizard.showError(err, "Seleccione el sexo.");
        if (!byId("estadoCivil")) return wizard.showError(err, "Seleccione el estado civil.");

        draft.mergeDraft({
          datosPersonales: {
            primerApellido: byId("primerApellido"),
            segundoApellido: byId("segundoApellido"),
            nombres: byId("nombres"),
            nombresPasaporte: byId("nombresPasaporte"),
            fechaNacimiento: byId("fechaNacimiento"),
            paisNacimiento: byId("paisNacimiento"),
            lugarNacimiento: byId("lugarNacimiento"),
            nacionalidad: byId("nacionalidad"),
            sexo: byId("sexo"),
            estadoCivil: byId("estadoCivil"),
            nombrePadre: byId("nombrePadre"),
            nacionalidadPadre: byId("nacionalidadPadre"),
            nombreMadre: byId("nombreMadre"),
            nacionalidadMadre: byId("nacionalidadMadre"),
            nombreConyuge: byId("nombreConyuge"),
            nacionalidadConyuge: byId("nacionalidadConyuge"),
            fechaMatrimonio: byId("fechaMatrimonio"),
            lugarMatrimonio: byId("lugarMatrimonio"),
            docExterior: byId("docExterior"),
          },
        });
        if (opts.onNavigate) opts.onNavigate(wizard.nextRoute(ROUTE));
      },
    }));
  }

  function byId(id) {
    var e = document.getElementById(id);
    return e ? e.value.trim() : "";
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p09 = { renderP09: renderP09 };
})(window);
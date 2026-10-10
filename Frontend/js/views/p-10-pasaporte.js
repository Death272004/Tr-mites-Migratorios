/**
 * P-10 Paso 2 — Pasaporte e historial migratorio.
 * El sello de ingreso y el RUEX se cotejan con servicios del SNM ([A]/[S]);
 * el historial de entradas/salidas es solo lectura (no lo digita el ciudadano).
 * Script clásico: expone `tm.views.p10.renderP10`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var wizard = global.tm.wizard;
  var draft = global.tm.draft;
  var data = global.tm.data;

  var ROUTE = "#/solicitud/paso-2";

  function byId(id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; }

  function renderP10(container, opts) {
    opts = opts || {};
    var body = wizard.frame(container, ROUTE);
    var d = draft.getDraft().pasaporte || {};

    var grid = layout.el("div", "wizard-grid");
    grid.appendChild(field.fieldText({ id: "numPasaporte", label: "Número de pasaporte vigente", value: d.numPasaporte, required: true }));
    grid.appendChild(field.fieldSelect({ id: "paisEmisor", label: "País emisor del pasaporte", options: data.paisOptions("Seleccione…"), value: d.paisEmisor, required: true }));
    grid.appendChild(field.fieldDate({ id: "fechaExpedicion", label: "Fecha de expedición", value: d.fechaExpedicion, required: true }));
    grid.appendChild(field.fieldDate({ id: "fechaVencimiento", label: "Fecha de vencimiento", value: d.fechaVencimiento, required: true, helpText: "Vigencia mínima habitual: 3 meses." }));
    grid.appendChild(field.fieldText({ id: "lugarExpedicion", label: "Lugar de expedición", value: d.lugarExpedicion }));
    body.appendChild(grid);

    var sello = layout.el("fieldset", "wizard-section");
    sello.appendChild(layout.el("legend", "wizard-section-title", "Sello de ingreso"));
    var selloGrid = layout.el("div", "wizard-grid");
    selloGrid.appendChild(field.fieldDate({ id: "selloFecha", label: "Fecha del sello de ingreso", value: d.selloFecha, required: true }));
    selloGrid.appendChild(field.fieldSelect({
      id: "selloPuesto", label: "Puesto fronterizo",
      options: [{ value: "", label: "Seleccione…" }, { value: "Tocumen", label: "Aeropuerto de Tocumen" }, { value: "Paso Canoas", label: "Paso Canoas" }, { value: "Guabito", label: "Guabito" }, { value: "Puerto", label: "Puerto / marítimo" }],
      value: d.selloPuesto, required: true,
    }));
    selloGrid.appendChild(field.fieldSelect({
      id: "claseAdmision", label: "Clase de admisión",
      options: [{ value: "", label: "Seleccione…" }, { value: "TURISTA", label: "Turista" }, { value: "RESIDENTE", label: "Residente" }, { value: "OTRO", label: "Otro" }],
      value: d.claseAdmision, required: true,
    }));
    sello.appendChild(selloGrid);
    body.appendChild(sello);

    var ruxGrid = layout.el("div", "wizard-grid");
    ruxGrid.appendChild(field.fieldText({ id: "numRUEX", label: "Número de Registro de Filiación (RUEX)", value: d.numRUEX, helpText: "Estado: vigente / vencido / con multa (consulta simulada)." }));
    ruxGrid.appendChild(field.fieldText({ id: "ultimoPermiso", label: "Último permiso migratorio (número/tipo)", value: d.ultimoPermiso }));
    ruxGrid.appendChild(field.fieldText({ id: "numeroCarne", label: "Número de carné migratorio", value: d.numeroCarne }));
    ruxGrid.appendChild(field.fieldText({ id: "carneENumero", label: "Carné de Residente Permanente 'E' (número)", value: d.carneENumero }));
    ruxGrid.appendChild(field.fieldText({ id: "pasaportesAnteriores", label: "Pasaportes anteriores (números)", value: d.pasaportesAnteriores, helpText: "Obligatorio en Movimiento Migratorio." }));
    ruxGrid.appendChild(field.fieldText({ id: "motivoCambioPasaporte", label: "Motivo del cambio de pasaporte", value: d.motivoCambioPasaporte }));
    body.appendChild(ruxGrid);

    var radioField = layout.el("fieldset", "form-field");
    radioField.appendChild(layout.el("legend", "form-field__label", "¿Ha salido del país en los últimos 5 años por más de 3 meses?"));
    var rg = layout.el("div", "radio-group");
    ["Sí", "No"].forEach(function (t, i) {
      var lbl = layout.el("label", "radio-option");
      var input = layout.el("input");
      input.type = "radio"; input.name = "salidaLarga"; input.value = t;
      if (d.salidaLarga === t || (!d.salidaLarga && i === 1)) input.checked = true;
      lbl.appendChild(input); lbl.appendChild(layout.el("span", null, t));
      rg.appendChild(lbl);
    });
    radioField.appendChild(rg);
    radioField.appendChild(layout.el("span", "form-field__help", "Relevante en naturalización (numerales 2 y 3 del Art. 10)."));
    body.appendChild(radioField);

    var hist = layout.el("fieldset", "wizard-section");
    hist.appendChild(layout.el("legend", "wizard-section-title", "Historial de entradas y salidas [A]"));
    hist.appendChild(global.tm.ui.table({
      headers: [{ label: "Fecha" }, { label: "Movimiento" }, { label: "Puesto" }],
      rows: [
        [{ text: "2026-08-30" }, { text: "Entrada" }, { text: "Tocumen" }],
        [{ text: "2026-06-14" }, { text: "Salida" }, { text: "Paso Canoas" }],
        [{ text: "2026-05-02" }, { text: "Entrada" }, { text: "Tocumen" }],
      ],
    }));
    hist.appendChild(layout.el("span", "form-field__help", "Cargado desde el SNM; el ciudadano no lo digita."));
    body.appendChild(hist);

    var err = wizard.errorBox();
    body.appendChild(err);

    body.appendChild(wizard.footer({
      onBack: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/paso-1"); },
      onNext: function () {
        wizard.clearError(err);
        if (!byId("numPasaporte")) return wizard.showError(err, "Ingrese el número de pasaporte.");
        if (!byId("paisEmisor")) return wizard.showError(err, "Seleccione el país emisor.");
        if (!byId("fechaExpedicion")) return wizard.showError(err, "Ingrese la fecha de expedición.");
        if (!byId("fechaVencimiento")) return wizard.showError(err, "Ingrese la fecha de vencimiento.");
        if (!byId("selloFecha")) return wizard.showError(err, "Ingrese la fecha del sello de ingreso.");
        if (!byId("selloPuesto")) return wizard.showError(err, "Seleccione el puesto fronterizo.");

        draft.mergeDraft({
          pasaporte: {
            numPasaporte: byId("numPasaporte"),
            paisEmisor: byId("paisEmisor"),
            fechaExpedicion: byId("fechaExpedicion"),
            fechaVencimiento: byId("fechaVencimiento"),
            lugarExpedicion: byId("lugarExpedicion"),
            selloFecha: byId("selloFecha"),
            selloPuesto: byId("selloPuesto"),
            claseAdmision: byId("claseAdmision"),
            numRUEX: byId("numRUEX"),
            ultimoPermiso: byId("ultimoPermiso"),
            numeroCarne: byId("numeroCarne"),
            carneENumero: byId("carneENumero"),
            pasaportesAnteriores: byId("pasaportesAnteriores"),
            motivoCambioPasaporte: byId("motivoCambioPasaporte"),
            salidaLarga: (rg.querySelector("input:checked") || {}).value || "No",
          },
        });
        if (opts.onNavigate) opts.onNavigate(wizard.nextRoute(ROUTE));
      },
    }));
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p10 = { renderP10: renderP10 };
})(window);
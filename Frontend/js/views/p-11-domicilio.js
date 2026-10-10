/**
 * P-11 Paso 3 — Domicilio y notificaciones.
 * Corregimiento en cascada (demo), comprobante de domicilio y datos de
 * notificación heredados de P-05.
 * Script clásico: expone `tm.views.p11.renderP11`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var wizard = global.tm.wizard;
  var draft = global.tm.draft;
  var data = global.tm.data;

  var ROUTE = "#/solicitud/paso-3";

  function byId(id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; }

  function renderP11(container, opts) {
    opts = opts || {};
    var body = wizard.frame(container, ROUTE);
    var d = draft.getDraft().domicilio || {};

    var grid = layout.el("div", "wizard-grid");
    grid.appendChild(field.fieldSelect({ id: "paisDomicilio", label: "País de domicilio", options: data.paisOptions("Seleccione…"), value: d.paisDomicilio, required: true }));
    grid.appendChild(field.fieldSelect({ id: "provincia", label: "Provincia", options: data.provinciaOptions("Seleccione…"), value: d.provincia, required: true }));
    grid.appendChild(field.fieldText({ id: "distrito", label: "Distrito", value: d.distrito, required: true }));
    grid.appendChild(field.fieldText({ id: "corregimiento", label: "Corregimiento", value: d.corregimiento, required: true }));
    grid.appendChild(field.fieldSelect({
      id: "tipoTenencia", label: "Tipo de tenencia",
      options: [{ value: "", label: "Seleccione…" }, { value: "PROPIA", label: "Propia" }, { value: "ALQUILER", label: "Alquiler" }, { value: "EMPLEADOR", label: "Con el empleador" }, { value: "FAMILIARES", label: "Familiares" }],
      value: d.tipoTenencia, required: true,
    }));
    body.appendChild(grid);

    var dirGrid = layout.el("div", "wizard-grid");
    var dir = field.fieldTextarea({ id: "direccionCompleta", label: "Dirección completa (calle, casa/apto, referencia)", value: d.direccionCompleta, required: true, rows: 3 });
    dirGrid.appendChild(dir);
    body.appendChild(dirGrid);

    var compGrid = layout.el("div", "wizard-grid");
    compGrid.appendChild(global.tm.ui.fileUpload({ id: "comprobante", label: "Comprobante de domicilio", accept: ".pdf,.jpg,.jpeg,.png", helpText: "Escritura, contrato de arrendamiento notariado, carta de responsabilidad notariada o certificación de juez de paz." }));
    compGrid.appendChild(field.fieldText({ id: "titularRecibo", label: "Titular del recibo de servicios públicos", value: d.titularRecibo }));
    compGrid.appendChild(field.fieldText({ id: "numeroRecibo", label: "Número de recibo de luz/agua/teléfono", value: d.numeroRecibo }));
    body.appendChild(compGrid);

    var notif = layout.el("fieldset", "wizard-section");
    notif.appendChild(layout.el("legend", "wizard-section-title", "Notificaciones"));
    var notifGrid = layout.el("div", "wizard-grid");
    notifGrid.appendChild(field.fieldText({ id: "direccionNotificacion", label: "Dirección de notificación (si difiere del domicilio)", value: d.direccionNotificacion }));
    notifGrid.appendChild(field.fieldText({ id: "correoNotificacion", label: "Correo de notificación", value: d.correoNotificacion || "cliente.demo@bufete.test", required: true, helpText: "Heredado de su perfil (P-05)." }));
    notifGrid.appendChild(field.fieldText({ id: "telefonoNotificacion", label: "Teléfono de notificación", value: d.telefonoNotificacion || "+507 6000-0000", required: true, helpText: "Heredado de su perfil (P-05)." }));
    notif.appendChild(notifGrid);
    body.appendChild(notif);

    var err = wizard.errorBox();
    body.appendChild(err);

    body.appendChild(wizard.footer({
      onBack: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/paso-2"); },
      onNext: function () {
        wizard.clearError(err);
        if (!byId("paisDomicilio")) return wizard.showError(err, "Seleccione el país de domicilio.");
        if (!byId("provincia")) return wizard.showError(err, "Seleccione la provincia.");
        if (!byId("distrito")) return wizard.showError(err, "Ingrese el distrito.");
        if (!byId("corregimiento")) return wizard.showError(err, "Ingrese el corregimiento.");
        if (!byId("tipoTenencia")) return wizard.showError(err, "Seleccione el tipo de tenencia.");
        if (!byId("direccionCompleta")) return wizard.showError(err, "Ingrese la dirección completa.");
        if (!byId("correoNotificacion") || !byId("telefonoNotificacion")) return wizard.showError(err, "Complete los datos de notificación.");

        draft.mergeDraft({
          domicilio: {
            paisDomicilio: byId("paisDomicilio"),
            provincia: byId("provincia"),
            distrito: byId("distrito"),
            corregimiento: byId("corregimiento"),
            tipoTenencia: byId("tipoTenencia"),
            direccionCompleta: byId("direccionCompleta"),
            titularRecibo: byId("titularRecibo"),
            numeroRecibo: byId("numeroRecibo"),
            direccionNotificacion: byId("direccionNotificacion"),
            correoNotificacion: byId("correoNotificacion"),
            telefonoNotificacion: byId("telefonoNotificacion"),
          },
        });
        if (opts.onNavigate) opts.onNavigate(wizard.nextRoute(ROUTE));
      },
    }));
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p11 = { renderP11: renderP11 };
})(window);
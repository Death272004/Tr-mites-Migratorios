/**
 * P-15 Paso 7 — Pagos y tasas (simulado, sin pasarela real).
 * Desglose de tasas desde el catálogo, modalidad de pago, verificación de
 * cheque (si aplica) y constancia de pago generada localmente.
 * Script clásico: expone `tm.views.p15.renderP15`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var wizard = global.tm.wizard;
  var draft = global.tm.draft;
  var data = global.tm.data;

  var ROUTE = "#/solicitud/paso-7";

  function byId(id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; }

  function tasasDe(d) {
    var cat = d.categoria || "";
    if (cat === "RESIDENTE_TEMPORAL" || cat === "RESIDENTE_PERMANENTE") {
      return [{ concepto: "Tesoro Nacional", monto: 250 }, { concepto: "Servicio Nacional de Migración (SNM)", monto: 800 }];
    }
    if (cat === "NATURALIZACION") {
      return [{ concepto: "Timbres — declaración jurada", monto: 8 }, { concepto: "Timbres — estatus", monto: 8 }, { concepto: "Timbres — carné E", monto: 2 }];
    }
    if (cat === "CERTIFICACIONES") return [{ concepto: "Certificación / estatus", monto: 10 }];
    if (cat === "REGISTRO_EXTRANJERIA") return [{ concepto: "Tiquete y tasa de filiación", monto: 5 }];
    if (cat === "PROCESOS_ESPECIALES") return [{ concepto: "Tasas y registro", monto: 10 }];
    return [{ concepto: "Tasa de visa", monto: 100 }, { concepto: "Depósito de garantía", monto: 500 }];
  }

  function money(n) { return "B/." + Number(n).toFixed(2); }

  function renderP15(container, opts) {
    opts = opts || {};
    var body = wizard.frame(container, ROUTE);
    var d = draft.getDraft();
    var pagos = d.pagos || {};

    var tasas = tasasDe(d);
    var total = tasas.reduce(function (s, t) { return s + t.monto; }, 0);

    var rows = tasas.map(function (t) { return [{ text: t.concepto }, { text: money(t.monto), align: "right" }]; });
    rows.push([{ text: "Total", }, { text: money(total), align: "right" }]);
    body.appendChild(global.tm.ui.table({ headers: [{ label: "Concepto" }, { label: "Monto", align: "right" }], rows: rows }));

    var grid = layout.el("div", "wizard-grid");

    var modalidad = layout.el("fieldset", "form-field");
    modalidad.appendChild(layout.el("legend", "form-field__label", "Modalidad de pago"));
    var rg = layout.el("div", "radio-group");
    var mods = [
      { value: "EN_LINEA", label: "En línea (tarjeta/transferencia)" },
      { value: "CHEQUE", label: "Cheque certificado presencial" },
      { value: "EXONERACION", label: "Exoneración" },
    ];
    mods.forEach(function (m, i) {
      var lbl = layout.el("label", "radio-option");
      var input = layout.el("input");
      input.type = "radio"; input.name = "modalidad"; input.value = m.value;
      if (pagos.modalidad === m.value || (!pagos.modalidad && i === 0)) input.checked = true;
      rg.appendChild(lbl); lbl.appendChild(input); lbl.appendChild(layout.el("span", null, m.label));
    });
    modalidad.appendChild(rg);
    grid.appendChild(modalidad);

    grid.appendChild(field.fieldSelect({
      id: "concepto", label: "Concepto de pago",
      options: [{ value: "", label: "Seleccione…" }, { value: "TRAMITE", label: "Trámite" }, { value: "CARNE", label: "Carné" }, { value: "REPATRIACION", label: "Repatriación" }, { value: "TIMBRES", label: "Timbres" }],
      value: pagos.concepto, required: true,
    }));
    body.appendChild(grid);

    var chequeWrap = layout.el("div", "wizard-grid");
    chequeWrap.appendChild(field.fieldText({ id: "chequeNumero", label: "Número del cheque", value: pagos.chequeNumero }));
    chequeWrap.appendChild(field.fieldSelect({ id: "chequeBanco", label: "Banco del cheque", options: data.bancoOptions("Seleccione…"), value: pagos.chequeBanco }));
    chequeWrap.appendChild(field.fieldDate({ id: "chequeFecha", label: "Fecha del cheque", value: pagos.chequeFecha }));
    chequeWrap.appendChild(global.tm.ui.fileUpload({ id: "comprobantePago", label: "Comprobante de pago (si aplica)", accept: ".pdf,.jpg,.jpeg,.png" }));
    body.appendChild(chequeWrap);

    var constancia = layout.el("div", "app-alert app-alert--info");
    constancia.style.display = "none";
    constancia.appendChild(layout.el("span", "app-alert__title", "Constancia de pago generada (simulada)"));
    constancia.appendChild(layout.el("span", "app-alert__text", "Referencia: DEMO-" + total + "-" + (d.tramite || "TRAMITE").slice(0, 6).toUpperCase()));
    body.appendChild(constancia);

    var err = wizard.errorBox();
    body.appendChild(err);

    var paid = !!pagos.pagado;

    function updateChequeVisibility() {
      var m = (rg.querySelector("input:checked") || {}).value;
      chequeWrap.style.display = m === "CHEQUE" ? "" : "none";
    }
    rg.addEventListener("change", updateChequeVisibility);
    updateChequeVisibility();

    var actions = layout.el("div", "auth-actions");
    var payBtn = layout.el("button", "btn btn--primary", "Pagar " + money(total) + " (simulado)");
    payBtn.type = "button";
    var nextBtn = layout.el("button", "btn btn--primary", "Continuar");
    nextBtn.type = "button";
    var backBtn = layout.el("button", "btn", "Volver");
    backBtn.type = "button";
    actions.appendChild(backBtn);
    actions.appendChild(payBtn);
    actions.appendChild(nextBtn);
    body.appendChild(actions);

    if (paid) showPaid();
    function showPaid() {
      constancia.style.display = "";
      payBtn.disabled = true;
      payBtn.textContent = "Pagado (simulado)";
    }

    payBtn.addEventListener("click", function () {
      wizard.clearError(err);
      var m = (rg.querySelector("input:checked") || {}).value;
      if (!m) return wizard.showError(err, "Seleccione la modalidad de pago.");
      if (m === "CHEQUE") {
        if (!byId("chequeNumero") || !byId("chequeBanco") || !byId("chequeFecha")) {
          return wizard.showError(err, "Complete los datos del cheque certificado.");
        }
      }
      payBtn.disabled = true;
      payBtn.textContent = "Procesando…";
      setTimeout(function () {
        paid = true;
        showPaid();
      }, 600);
    });

    backBtn.addEventListener("click", function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/paso-6"); });

    nextBtn.addEventListener("click", function () {
      wizard.clearError(err);
      var m = (rg.querySelector("input:checked") || {}).value;
      if (!m) return wizard.showError(err, "Seleccione la modalidad de pago.");
      if (!byId("concepto")) return wizard.showError(err, "Seleccione el concepto de pago.");
      if (m !== "EXONERACION" && !paid) return wizard.showError(err, "Debe registrar el pago (o marcar exoneración) para continuar.");

      draft.mergeDraft({
        pagos: {
          modalidad: m,
          concepto: byId("concepto"),
          chequeNumero: byId("chequeNumero"),
          chequeBanco: byId("chequeBanco"),
          chequeFecha: byId("chequeFecha"),
          total: total,
          pagado: paid || m === "EXONERACION",
        },
      });
      if (opts.onNavigate) opts.onNavigate(wizard.nextRoute(ROUTE));
    });
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p15 = { renderP15: renderP15 };
})(window);
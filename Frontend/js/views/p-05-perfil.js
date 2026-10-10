/**
 * P-05 — Mi perfil / datos de contacto.
 * Datos de solo lectura; cambio de correo con re-verificación OTP simulada.
 * Script clásico: expone `tm.views.p05.renderP05`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var button = global.tm.ui.button;
  var confirmModal = global.tm.ui.confirmModal;

  function renderP05(container, opts) {
    opts = opts || {};
    container.innerHTML = "";
    var inner = layout.el("div", "app-content__inner");

    var header = layout.pageHeader("Mi perfil", "Datos de la cuenta (solo lectura)");
    inner.appendChild(header);

    var card = layout.el("div", "detail-card");

    var rows = [
      { label: "Nombres y apellidos", value: "María Demo" },
      { label: "Tipo y número de documento", value: "Pasaporte · 123456789" },
      { label: "Nacionalidad", value: "Panamá" },
      { label: "País de residencia", value: "Panamá" },
      { label: "Teléfono", value: "+507 6000-0000" },
    ];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var row = layout.el("div", "detail-row");
      row.appendChild(layout.el("span", "detail-row__label", r.label));
      row.appendChild(layout.el("span", "detail-row__value", r.value));
      card.appendChild(row);
    }

    var emailRow = layout.el("div", "detail-row");
    emailRow.appendChild(layout.el("span", "detail-row__label", "Correo electrónico"));
    emailRow.appendChild(layout.el("span", "detail-row__value", "cliente.demo@bufete.test"));
    card.appendChild(emailRow);

    var actions = layout.el("div", "detail-actions");
    var btnEmail = button({ variant: "primary", text: "Cambiar correo", type: "button" });
    btnEmail.addEventListener("click", function () {
      confirmModal(
        "Cambiar correo electrónico",
        "Se enviará un código de verificación (OTP simulado) al nuevo correo. ¿Desea continuar?",
        { onConfirm: function () { if (opts.onRequestChangeEmail) opts.onRequestChangeEmail(); } }
      );
    });
    actions.appendChild(btnEmail);
    card.appendChild(actions);

    inner.appendChild(card);
    container.appendChild(inner);
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p05 = { renderP05: renderP05 };
})(window);
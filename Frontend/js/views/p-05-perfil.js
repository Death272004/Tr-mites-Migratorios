/**
 * P-05 — Mi perfil / datos de contacto.
 * Datos de solo lectura; cambio de correo con re-verificación OTP simulada.
 * Incluye el consentimiento informado (Ley 81 de 2019 / DE 285 de 2021):
 * ver estado y revocar (sin efecto retroactivo). HU-18b.
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

    // ----- Consentimiento informado (HU-18b) -----
    var consentimiento = {
      estado: "vigente",
      tipo: "Informado" ,
      finalidad: "Trámite de residencia permanente",
      fecha: "2026-03-12",
      vigencia: "2027-03-12",
      responsable: "Lic. Pedro Ruiz",
      sensible: true,
    };

    var consentWrap = layout.el("div", "detail-card");

    function renderConsent() {
      layout.clear(consentWrap);
      consentWrap.appendChild(layout.el("h3", "wizard-section-title", "Consentimiento informado (Ley 81 de 2019)"));

      var vigente = consentimiento.estado === "vigente";
      var estRow = layout.el("div", "detail-row");
      estRow.appendChild(layout.el("span", "detail-row__label", "Estado"));
      var estVal = layout.el("span", "detail-row__value");
      estVal.appendChild(layout.el("span", "badge badge--" + (vigente ? "success" : "danger"), consentimiento.estado));
      estRow.appendChild(estVal);
      consentWrap.appendChild(estRow);

      var campos = [
        { label: "Tipo", value: consentimiento.tipo + (consentimiento.sensible ? " · incluye datos sensibles (consentimiento expreso)" : "") },
        { label: "Finalidad", value: consentimiento.finalidad },
        { label: "Otorgado el", value: consentimiento.fecha },
        { label: "Vigencia", value: consentimiento.vigencia },
        { label: "Responsable del tratamiento", value: consentimiento.responsable },
      ];
      for (var k = 0; k < campos.length; k++) {
        var cRow = layout.el("div", "detail-row");
        cRow.appendChild(layout.el("span", "detail-row__label", campos[k].label));
        cRow.appendChild(layout.el("span", "detail-row__value", campos[k].value));
        consentWrap.appendChild(cRow);
      }

      if (!vigente) {
        var alert = layout.el("div", "app-alert app-alert--warning");
        alert.appendChild(layout.el("span", "app-alert__title", "Consentimiento revocado"));
        alert.appendChild(layout.el("span", "app-alert__text", "La revocación no tiene efecto retroactivo. Para volver a operar, otorgue un nuevo consentimiento o autorice por representación acreditada."));
        consentWrap.appendChild(alert);
      }

      var nota = layout.el("p", "detail-row__value", "Sus derechos de acceso, rectificación, cancelación y oposición (ARCO) se ejercen desde “Ayuda y FAQ” (P-27). Destinatarios: Tribunal Electoral, CSS, Registro Público y SNM.");
      consentWrap.appendChild(nota);

      var cActions = layout.el("div", "detail-actions");
      if (vigente) {
        cActions.appendChild(button({
          variant: "danger", text: "Revocar consentimiento", type: "button",
          onClick: function () {
            confirmModal(
              "Revocar consentimiento informado",
              "¿Revocar su consentimiento informado? No tendrá efecto retroactivo y quedará registrado. Para volver a operar necesitará otorgar uno nuevo.",
              { onConfirm: function () { consentimiento.estado = "revocado"; renderConsent(); } }
            );
          }
        }));
      } else {
        cActions.appendChild(button({
          variant: "primary", text: "Otorgar consentimiento", type: "button",
          onClick: function () {
            confirmModal(
              "Otorgar consentimiento informado",
              "¿Otorgar un nuevo consentimiento informado para el tratamiento de sus datos (Ley 81 de 2019 / DE 285 de 2021)?",
              { onConfirm: function () { consentimiento.estado = "vigente"; consentimiento.fecha = "2026-10-11"; renderConsent(); } }
            );
          }
        }));
      }
      consentWrap.appendChild(cActions);
    }

    renderConsent();
    inner.appendChild(consentWrap);

    container.appendChild(inner);
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p05 = { renderP05: renderP05 };
})(window);

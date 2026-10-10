/**
 * P-05 — Mi perfil / datos de contacto.
 * Datos de solo lectura; cambio de correo con re-verificación OTP simulada.
 */

import { el, pageHeader } from "../components/layout.js";
import { fieldText, fieldSelect } from "../components/field.js";
import { button } from "../components/button.js";
import { confirmModal } from "../components/modal.js";

export function renderP05(container, { onRequestChangeEmail } = {}) {
  container.innerHTML = "";
  const inner = el("div", "app-content__inner");

  const header = pageHeader("Mi perfil", "Datos de la cuenta (solo lectura)");
  inner.appendChild(header);

  const card = el("div", "detail-card");

  const rows = [
    { label: "Nombres y apellidos", value: "María Demo" },
    { label: "Tipo y número de documento", value: "Pasaporte · 123456789" },
    { label: "Nacionalidad", value: "Panamá" },
    { label: "País de residencia", value: "Panamá" },
    { label: "Teléfono", value: "+507 6000-0000" },
  ];
  for (const r of rows) {
    const row = el("div", "detail-row");
    row.appendChild(el("span", "detail-row__label", r.label));
    row.appendChild(el("span", "detail-row__value", r.value));
    card.appendChild(row);
  }

  const emailRow = el("div", "detail-row");
  emailRow.appendChild(el("span", "detail-row__label", "Correo electrónico"));
  emailRow.appendChild(el("span", "detail-row__value", "cliente.demo@bufete.test"));
  card.appendChild(emailRow);

  const actions = el("div", "detail-actions");
  const btnEmail = button({ variant: "primary", text: "Cambiar correo", type: "button" });
  btnEmail.addEventListener("click", () => {
    confirmModal(
      "Cambiar correo electrónico",
      "Se enviará un código de verificación (OTP simulado) al nuevo correo. ¿Desea continuar?",
      { onConfirm: () => onRequestChangeEmail?.() }
    );
  });
  actions.appendChild(btnEmail);
  card.appendChild(actions);

  inner.appendChild(card);
  container.appendChild(inner);
}

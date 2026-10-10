/**
 * P-03 — Verificación de identidad (OTP simulado).
 * Código de 6 dígitos, expira en 10 minutos, 3 intentos; sin envío real.
 */

import { el, pageHeader } from "../components/layout.js";
import { fieldText } from "../components/field.js";
import { button } from "../components/button.js";

const CODE_LENGTH = 6;
const EXP_MIN = 10;
const MAX_ATT = 3;

export function renderP03(container, { onVerified, onResend } = {}) {
  container.innerHTML = "";
  const inner = el("div", "app-content__inner app-auth");
  inner.appendChild(pageHeader("Verificación de identidad (OTP)", "Ingrese el código de 6 dígitos enviado a su correo"));

  let attempts = 0;
  const expiresAt = Date.now() + EXP_MIN * 60 * 1000;

  const card = el("form", "auth-card");
  card.noValidate = true;

  const code = fieldText({ id: "otp", label: "Código OTP", placeholder: "123456", required: true, helpText: `Expira en ${EXP_MIN} minutos. Máximo ${MAX_ATT} intentos.` });
  const input = code.querySelector("input");
  input.maxLength = CODE_LENGTH;
  input.inputMode = "numeric";
  input.pattern = "[0-9]{6}";
  card.appendChild(code);

  const errorBox = el("div", "auth-error", "");
  errorBox.setAttribute("aria-live", "polite");
  card.appendChild(errorBox);

  const actions = el("div", "auth-actions");
  const btnVer = button({ variant: "primary", text: "Verificar", type: "submit" });
  const btnRe = button({ text: "Reenviar código (simulado)", type: "button" });
  actions.appendChild(btnRe);
  actions.appendChild(btnVer);
  card.appendChild(actions);

  card.addEventListener("submit", (ev) => {
    ev.preventDefault();
    clearError();
    if (expiresAt < Date.now()) return setError("El código ha expirado. Solicite uno nuevo.");
    const val = input.value.trim();
    if (!/^\d{6}$/.test(val)) return setError("El código debe tener 6 dígitos.");

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      attempts += 1;
      if (attempts >= MAX_ATT) {
        return setError("Demasiados intentos. Solicite un nuevo código.");
      }
      // Simulado: acepta cualquier 6 dígitos (o podrías validar contra "123456")
      onVerified?.({ codigo: val });
    }, 300);
  });

  btnRe.addEventListener("click", () => {
    attempts = 0;
    clearError();
    onResend?.();
  });

  function setError(msg) { errorBox.textContent = msg; errorBox.classList.add("is-visible"); }
  function clearError() { errorBox.textContent = ""; errorBox.classList.remove("is-visible"); }
  function setLoading(l) { btnVer.disabled = l; btnVer.textContent = l ? "Verificando…" : "Verificar"; }

  inner.appendChild(card);
  container.appendChild(inner);
}

/**
 * P-01 — Inicio de sesión (vista del portal cliente).
 * Criterios: validaciones en cliente, mensaje genérico de fallo (CP-02),
 * bloqueo por intentos, 4 estados (carga, éxito, vacío, error).
 */

import { el, pageHeader } from "../components/layout.js";
import { fieldText, fieldPassword } from "../components/field.js";
import { button } from "../components/button.js";
import { confirmModal } from "../components/modal.js";

const MAX_ATTEMPTS = 3;
const BLOCK_SECONDS = 60; // bloqueo visual temporal

// Credencial demo (ficticia) para probar el flujo mientras no exista backend
const DEMO_EMAIL = "demo@bufete.test";
const DEMO_PASS = "Demo123!";
const DEMO_ROL = "SOLICITANTE";
const DEMO_NOMBRE = "María Demo";

export function renderP01(container, { onLoginSuccess, onGoToRegistro, onGoToRecuperar } = {}) {
  container.innerHTML = "";
  const inner = el("div", "app-content__inner app-auth");
  inner.appendChild(pageHeader("Iniciar sesión", "Acceda al portal del cliente del bufete"));

  let attempts = 0;
  let blockedUntil = 0;

  const form = el("form", "auth-card");
  form.noValidate = true;

  const correo = fieldText({
    id: "correo",
    label: "Correo electrónico",
    placeholder: "nombre@ejemplo.com",
    required: true,
    helpText: "Use el correo con el que se registró",
  });
  const clave = fieldPassword({
    id: "clave",
    label: "Contraseña",
    required: true,
    toggle: true,
    helpText: "Mínimo 8 caracteres, incluye mayúscula, número y símbolo",
  });

  form.appendChild(correo);
  form.appendChild(clave);

  const errorBox = el("div", "auth-error", "");
  errorBox.setAttribute("aria-live", "polite");
  form.appendChild(errorBox);

  const actions = el("div", "auth-actions");
  const btnLogin = button({ variant: "primary", text: "Iniciar sesión", type: "submit" });
  actions.appendChild(btnLogin);
  form.appendChild(actions);

  const links = el("div", "auth-links");
  const linkRecuperar = el("a", "auth-link", "¿Olvidó su contraseña?");
  linkRecuperar.href = "#/recuperar-clave";
  linkRecuperar.addEventListener("click", (ev) => {
    ev.preventDefault();
    onGoToRecuperar?.();
  });
  const linkRegistro = el("a", "auth-link", "Crear cuenta");
  linkRegistro.href = "#/registro";
  linkRegistro.addEventListener("click", (ev) => {
    ev.preventDefault();
    onGoToRegistro?.();
  });
  links.appendChild(linkRecuperar);
  links.appendChild(linkRegistro);
  form.appendChild(links);

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    if (blockedUntil > Date.now()) {
      const secs = Math.ceil((blockedUntil - Date.now()) / 1000);
      setError(`Demasiados intentos. Inténtelo de nuevo en ${secs} segundos.`);
      return;
    }

    const email = correo.querySelector("input").value.trim();
    const pass = clave.querySelector("input").value;

    // Validación cliente
    if (!email) return setError("El correo es obligatorio.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Formato de correo inválido.");
    if (!pass) return setError("La contraseña es obligatoria.");
    if (!validatePass(pass)) return setError("La contraseña no cumple con los requisitos mínimos.");

    clearError();
    setLoading(true);

    // Simular respuesta de backend (fixture/demo)
    setTimeout(() => {
      setLoading(false);
      attempts += 1;

      // Credencial demo (ficticia) → éxito; cualquier otra → fallo genérico (CP-02)
      if (email === DEMO_EMAIL && pass === DEMO_PASS) {
        attempts = 0;
        blockedUntil = 0;
        onLoginSuccess?.({ rol: DEMO_ROL, usuario: { nombre: DEMO_NOMBRE, correo: email } });
        return;
      }

      if (attempts >= MAX_ATTEMPTS) {
        blockedUntil = Date.now() + BLOCK_SECONDS * 1000;
        setError(`Demasiados intentos fallidos. Bloqueado temporalmente por ${BLOCK_SECONDS} segundos.`);
      } else {
        setError("No pudimos iniciar sesión. Verifique el correo y la contraseña e intente de nuevo.");
      }
    }, 400);
  });

  function setError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add("is-visible");
  }
  function clearError() {
    errorBox.textContent = "";
    errorBox.classList.remove("is-visible");
  }
  function setLoading(loading) {
    btnLogin.disabled = loading;
    btnLogin.textContent = loading ? "Ingresando…" : "Iniciar sesión";
  }
  function validatePass(p) {
    // Mínimo 8, mayúscula, número y símbolo
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(p);
  }

  inner.appendChild(form);
  container.appendChild(inner);
}

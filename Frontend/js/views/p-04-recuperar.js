/**
 * P-04 — Recuperación de contraseña.
 * Confirmación neutra (no revela si la cuenta existe), enlace temporal simulado (1 h).
 */

import { el, pageHeader } from "../components/layout.js";
import { fieldText } from "../components/field.js";
import { button } from "../components/button.js";

export function renderP04(container, { onGoToLogin } = {}) {
  container.innerHTML = "";
  const inner = el("div", "app-content__inner app-auth");
  inner.appendChild(pageHeader("Recuperar contraseña", "Le enviaremos un enlace temporal si el correo existe"));

  const form = el("form", "auth-card");
  form.noValidate = true;

  const correo = fieldText({ id: "correo", label: "Correo electrónico", placeholder: "nombre@ejemplo.com", required: true });
  form.appendChild(correo);

  const infoBox = el("div", "auth-info", "");
  infoBox.setAttribute("aria-live", "polite");
  form.appendChild(infoBox);

  const errorBox = el("div", "auth-error", "");
  errorBox.setAttribute("aria-live", "polite");
  form.appendChild(errorBox);

  const actions = el("div", "auth-actions");
  const btn = button({ variant: "primary", text: "Enviar enlace", type: "submit" });
  actions.appendChild(btn);
  form.appendChild(actions);

  const links = el("div", "auth-links");
  const linkLogin = el("a", "auth-link", "Volver a iniciar sesión");
  linkLogin.href = "#/login";
  linkLogin.addEventListener("click", (ev) => {
    ev.preventDefault();
    onGoToLogin?.();
  });
  links.appendChild(linkLogin);
  form.appendChild(links);

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    clear();
    const email = correo.querySelector("input").value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Ingrese un correo válido.");

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Mensaje neutro: no confirma ni niega la existencia de la cuenta
      infoBox.textContent = "Si el correo está registrado, recibirá un enlace temporal válido por 1 hora (simulado).";
      infoBox.classList.add("is-visible");
    }, 300);
  });

  function setError(msg) { errorBox.textContent = msg; errorBox.classList.add("is-visible"); }
  function clear() {
    errorBox.textContent = "";
    errorBox.classList.remove("is-visible");
    infoBox.textContent = "";
    infoBox.classList.remove("is-visible");
  }
  function setLoading(l) { btn.disabled = l; btn.textContent = l ? "Enviando…" : "Enviar enlace"; }

  inner.appendChild(form);
  container.appendChild(inner);
}

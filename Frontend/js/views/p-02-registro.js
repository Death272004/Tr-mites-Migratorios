/**
 * P-02 — Registro de cuenta (portal cliente).
 * CP-02 aplicable (mensajes genéricos), aceptación de Ley 81 obligatoria,
 * campos mínimos del plan; catálogo/nacionalidad con fixtures mínimos.
 */

import { el, pageHeader } from "../components/layout.js";
import { fieldText, fieldPassword, fieldSelect } from "../components/field.js";
import { button } from "../components/button.js";

export function renderP02(container, { onRegistered, onGoToLogin } = {}) {
  container.innerHTML = "";
  const inner = el("div", "app-content__inner app-auth");
  inner.appendChild(pageHeader("Crear cuenta", "Registro en el portal del cliente del bufete"));

  const form = el("form", "auth-card");
  form.noValidate = true;

  const tipoDoc = fieldSelect({
    id: "tipoDoc",
    label: "Tipo de documento",
    options: [
      { value: "PASAPORTE", label: "Pasaporte" },
      { value: "CEDULA_E", label: "Cédula E" },
      { value: "CARNE", label: "Carné" },
    ],
    required: true,
  });

  const numDoc = fieldText({ id: "numDoc", label: "Número de documento", required: true });
  const nombres = fieldText({ id: "nombres", label: "Nombres y apellidos", required: true });
  const nacionalidad = fieldSelect({
    id: "nacionalidad",
    label: "Nacionalidad",
    options: [
      { value: "PA", label: "Panamá" },
      { value: "US", label: "Estados Unidos" },
      { value: "CO", label: "Colombia" },
      { value: "VE", label: "Venezuela" },
    ],
    required: true,
  });
  const correo = fieldText({ id: "correo", label: "Correo electrónico", placeholder: "nombre@ejemplo.com", required: true });
  const telefono = fieldText({ id: "telefono", label: "Teléfono (código país + número)", placeholder: "+507 6000-0000", required: true });
  const paisRes = fieldSelect({
    id: "paisRes",
    label: "País de residencia actual",
    options: [
      { value: "PA", label: "Panamá" },
      { value: "US", label: "Estados Unidos" },
      { value: "CO", label: "Colombia" },
      { value: "VE", label: "Venezuela" },
    ],
    required: true,
  });
  const clave = fieldPassword({ id: "clave", label: "Contraseña", required: true, toggle: true });
  const clave2 = fieldPassword({ id: "clave2", label: "Confirmar contraseña", required: true, toggle: true });

  const leyRow = el("label", "auth-check");
  const leyChk = el("input", "auth-check__input");
  leyChk.type = "checkbox";
  leyChk.id = "aceptaLey";
  const leyLbl = el("span", "auth-check__label", "Acepto términos y la autorización de tratamiento de datos personales (Ley 81 de 2019).");
  leyRow.appendChild(leyChk);
  leyRow.appendChild(leyLbl);

  form.appendChild(tipoDoc);
  form.appendChild(numDoc);
  form.appendChild(nombres);
  form.appendChild(nacionalidad);
  form.appendChild(correo);
  form.appendChild(telefono);
  form.appendChild(paisRes);
  form.appendChild(clave);
  form.appendChild(clave2);
  form.appendChild(leyRow);

  const errorBox = el("div", "auth-error", "");
  errorBox.setAttribute("aria-live", "polite");
  form.appendChild(errorBox);

  const actions = el("div", "auth-actions");
  const btnReg = button({ variant: "primary", text: "Crear cuenta", type: "submit" });
  actions.appendChild(btnReg);
  form.appendChild(actions);

  const links = el("div", "auth-links");
  const linkLogin = el("a", "auth-link", "Ya tengo cuenta. Iniciar sesión");
  linkLogin.href = "#/login";
  linkLogin.addEventListener("click", (ev) => {
    ev.preventDefault();
    onGoToLogin?.();
  });
  links.appendChild(linkLogin);
  form.appendChild(links);

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    clearError();
    const email = correo.querySelector("input").value.trim();
    const p1 = clave.querySelector("input").value;
    const p2 = clave2.querySelector("input").value;
    const acepta = leyChk.checked;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Correo inválido.");
    if (!p1 || !validatePass(p1)) return setError("La contraseña no cumple con los requisitos mínimos.");
    if (p1 !== p2) return setError("Las contraseñas no coinciden.");
    if (!acepta) return setError("Debe aceptar la autorización de tratamiento de datos (Ley 81).");

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onRegistered?.({ correo: email });
    }, 300);
  });

  function setError(msg) { errorBox.textContent = msg; errorBox.classList.add("is-visible"); }
  function clearError() { errorBox.textContent = ""; errorBox.classList.remove("is-visible"); }
  function setLoading(l) { btnReg.disabled = l; btnReg.textContent = l ? "Creando…" : "Crear cuenta"; }
  function validatePass(p) { return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(p); }

  inner.appendChild(form);
  container.appendChild(inner);
}

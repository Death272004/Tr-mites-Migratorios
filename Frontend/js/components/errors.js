/**
 * errors.js — vistas globales 403, 404, 500.
 * Cumplen: mensaje en lenguaje no técnico, sin datos personales,
 * y botón de reintento cuando aplica (500).
 */

import { el, pageHeader } from "./layout.js";

export function renderForbidden(container, { onGoHome } = {}) {
  const inner = el("div", "app-content__inner app-error");
  inner.appendChild(pageHeader("Acceso denegado", "No tiene permisos para ver esta página"));

  const body = el("div", "app-error__body");
  body.appendChild(
    el(
      "p",
      null,
      "Su sesión no tiene permisos suficientes para acceder a esta ruta. Verifique su rol o vuelva a la página de inicio."
    )
  );

  const actions = el("div", "app-error__actions");
  const home = el("button", "btn btn--primary", "Volver al inicio");
  home.type = "button";
  home.addEventListener("click", () => onGoHome?.());
  actions.appendChild(home);
  body.appendChild(actions);
  inner.appendChild(body);
  container.appendChild(inner);
}

export function renderNotFound(container, { onGoHome } = {}) {
  const inner = el("div", "app-content__inner app-error");
  inner.appendChild(pageHeader("Página no encontrada", "Error 404"));

  const body = el("div", "app-error__body");
  body.appendChild(el("p", null, "La página solicitada no existe o no está disponible para su rol."));

  const actions = el("div", "app-error__actions");
  const home = el("button", "btn btn--primary", "Volver al inicio");
  home.type = "button";
  home.addEventListener("click", () => onGoHome?.());
  actions.appendChild(home);
  body.appendChild(actions);
  inner.appendChild(body);
  container.appendChild(inner);
}

export function renderServerError(container, { onRetry } = {}) {
  const inner = el("div", "app-content__inner app-error");
  inner.appendChild(pageHeader("Ocurrió un error", "Error 500"));

  const body = el("div", "app-error__body");
  body.appendChild(
    el("p", null, "No pudimos completar la operación. Inténtelo de nuevo en unos momentos.")
  );

  const actions = el("div", "app-error__actions");
  const retry = el("button", "btn btn--primary", "Reintentar");
  retry.type = "button";
  retry.addEventListener("click", () => onRetry?.());
  actions.appendChild(retry);
  body.appendChild(actions);
  inner.appendChild(body);
  container.appendChild(inner);
}

/**
 * errors.js — vistas globales 403/404/500 (CP-05). Script clásico: expone `tm.ui.errors`.
 */
(function (global) {
  "use strict";

  const { el, pageHeader } = global.tm.layout;

  function panel(kind, title, hint) {
    const card = el("div", "card app-error-state");
    card.appendChild(pageHeader(title, hint));

    const p = el("p", "app-error-state__message");
    p.textContent =
      kind === "forbidden"
        ? "Esta ruta existe pero tu rol no tiene permiso para entrar."
        : kind === "not-found"
          ? "La ruta no existe en el inventario de pantallas."
          : "El sistema no pudo procesar la solicitud en este momento.";
    card.appendChild(p);

    const btn = el("button", "btn btn--primary");
    btn.type = "button";
    btn.textContent = kind === "forbidden" ? "Ir a mi inicio" : "Volver al inicio";
    btn.addEventListener("click", () => {
      if (kind === "forbidden") {
        const role = global.tm.session.getSession()?.datos.rol;
        window.location.hash = global.tm.roles.INITIAL_ROUTE[role] ?? "#/mis-tramites";
      } else {
        window.location.hash = global.tm.session.isAuthenticated() ? "#/mis-tramites" : "#/login";
      }
    });
    card.appendChild(btn);
    return card;
  }

  function renderForbidden(container) {
    container.appendChild(panel("forbidden", "403 — Sin acceso", "Permiso denegado"));
  }

  function renderNotFound(container) {
    container.appendChild(panel("not-found", "404 — Página no encontrada", "Ruta desconocida"));
  }

  function renderServerError(container) {
    container.appendChild(panel("server", "500 — Error interno", "Algo salió mal"));
  }

  global.tm.ui = global.tm.ui || {};
  global.tm.ui.errors = { renderForbidden, renderNotFound, renderServerError };
})(window);
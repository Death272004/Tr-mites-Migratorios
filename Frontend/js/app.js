/**
 * app.js — arranque de la aplicación (Sprint 1, Fase A).
 * Monta el armazón (layout) y refleja el menú según el rol activo.
 * El enrutador con guards de rol se implementa en TASK-01.3.
 */

import { DEFAULT_ROLE, INITIAL_ROUTE, isInternalRole, ROLES } from "./utils/roles.js";
import { renderHeaderUser, renderNav, renderView } from "./components/layout.js";
import { getViewKey, resolveRoute, ERRORS, LOGIN_ROUTE, INTERNAL_LOGIN_ROUTE } from "./utils/router.js";
import { renderForbidden, renderNotFound, renderServerError } from "./components/errors.js";
import { saveSession, getSession, clearSession, isAuthenticated, updateSessionRole } from "./services/session.js";

const session = getSession();

const state = {
  user: session?.usuario ?? { nombre: "María Demo", correo: "cliente.demo@bufete.test" },
  role: session?.rol ?? DEFAULT_ROLE,
  route: window.location.hash || INITIAL_ROUTE[session?.rol ?? DEFAULT_ROLE],
};

const els = {
  context: document.getElementById("app-context"),
  user: document.getElementById("app-user"),
  nav: document.getElementById("app-nav"),
  content: document.getElementById("contenido"),
  navToggle: document.getElementById("nav-toggle"),
};

function loginRoute(role) {
  return isInternalRole(role) ? INTERNAL_LOGIN_ROUTE : LOGIN_ROUTE;
}

function navigate(route) {
  if (window.location.hash === route) {
    state.route = route;
    render();
  } else {
    window.location.hash = route;
  }
}

function render() {
  const authed = isAuthenticated();
  const resolved = resolveRoute(state.route, state.role, authed);
  if (resolved !== state.route) {
    state.route = resolved;
    window.location.hash = resolved;
    return;
  }

  els.context.textContent = isInternalRole(state.role) ? "Módulo interno" : "Portal del cliente";

  renderHeaderUser(els.user, {
    user: authed ? state.user : { nombre: "No autenticado" },
    role: state.role,
    onRoleChange: (role) => {
      state.role = role;
      if (authed) updateSessionRole(role);
      navigate(INITIAL_ROUTE[role]);
    },
    onLogout: () => {
      clearSession();
      navigate(loginRoute(state.role));
    },
  });

  renderNav(els.nav, { role: state.role, currentRoute: state.route });

  // Vistas globales
  const key = getViewKey(state.route);
  if (key === "error/403") {
    renderForbidden(els.content, { onGoHome: () => navigate(INITIAL_ROUTE[state.role]) });
    return;
  }
  if (key === "error/404") {
    renderNotFound(els.content, { onGoHome: () => navigate(INITIAL_ROUTE[state.role]) });
    return;
  }
  if (key === "error/500") {
    renderServerError(els.content, { onRetry: () => window.location.reload() });
    return;
  }

  // Vistas del portal P-01–P-05 (Fase B)
  if (key === "login") {
    import("./views/p-01-login.js").then((m) => {
      m.renderP01(els.content, {
        onLoginSuccess: ({ rol, usuario }) => {
          saveSession({ token: "demo.token.simulado", rol, usuario });
          state.role = rol;
          state.user = usuario;
          navigate(INITIAL_ROUTE[state.role]);
        },
        onGoToRegistro: () => navigate("#/registro"),
        onGoToRecuperar: () => navigate("#/recuperar-clave"),
      });
    });
    return;
  }
  if (key === "registro") {
    import("./views/p-02-registro.js").then((m) => {
      m.renderP02(els.content, {
        onRegistered: () => navigate("#/identidad/otp"),
        onGoToLogin: () => navigate("#/login"),
      });
    });
    return;
  }
  if (key === "otp") {
    import("./views/p-03-otp.js").then((m) => {
      m.renderP03(els.content, {
        onVerified: () => navigate("#/login"),
        onResend: () => window.alert("Código reenviado (simulado)."),
      });
    });
    return;
  }
  if (key === "recuperar") {
    import("./views/p-04-recuperar.js").then((m) => {
      m.renderP04(els.content, { onGoToLogin: () => navigate("#/login") });
    });
    return;
  }
  if (key === "p-05") {
    import("./views/p-05-perfil.js").then((m) => {
      m.renderP05(els.content, {
        onRequestChangeEmail: () => navigate("#/identidad/otp"),
      });
    });
    return;
  }

  // Provisional: vistas públicas y internas sin implementación aún → placeholder
  renderView(els.content, { route: state.route, role: state.role });
}

window.addEventListener("hashchange", () => {
  state.route = window.location.hash || INITIAL_ROUTE[state.role];
  render();
});

if (els.navToggle) {
  els.navToggle.addEventListener("click", () => {
    const open = els.nav.classList.toggle("is-open");
    els.navToggle.setAttribute("aria-expanded", String(open));
  });
}

// Arranque
if (!window.location.hash) window.location.hash = INITIAL_ROUTE[state.role];
render();

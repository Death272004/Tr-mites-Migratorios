/**
 * app.js — arranque de la aplicación (Sprint 1).
 * Monta el armazón (layout), enruta por hash con guards de rol y
 * delega cada vista. Script clásico (no depende de ES modules).
 */
(function (global) {
  "use strict";

  var roles = global.tm.roles;
  var layout = global.tm.layout;
  var router = global.tm.router;
  var errors = global.tm.ui.errors;
  var session = global.tm.session;

  var DEFAULT_ROLE = roles.DEFAULT_ROLE;
  var INITIAL_ROUTE = roles.INITIAL_ROUTE;
  var isInternalRole = roles.isInternalRole;

  var sess = session.getSession();

  var state = {
    user: (sess && sess.datos && sess.datos.usuario) || { nombre: "María Demo", correo: "cliente.demo@bufete.test" },
    role: (sess && sess.datos && sess.datos.rol) || DEFAULT_ROLE,
    route: window.location.hash || INITIAL_ROUTE[(sess && sess.datos && sess.datos.rol) || DEFAULT_ROLE],
  };

  var els = {
    context: document.getElementById("app-context"),
    user: document.getElementById("app-user"),
    nav: document.getElementById("app-nav"),
    content: document.getElementById("contenido"),
    navToggle: document.getElementById("nav-toggle"),
  };

  function loginRoute(role) {
    return isInternalRole(role) ? router.INTERNAL_LOGIN_ROUTE : router.LOGIN_ROUTE;
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
    var authed = session.isAuthenticated();
    var resolved = router.resolveRoute(state.route, state.role, authed);
    if (resolved !== state.route) {
      state.route = resolved;
      window.location.hash = resolved;
      return;
    }

    els.context.textContent = isInternalRole(state.role) ? "Módulo interno" : "Portal del cliente";

    layout.renderHeaderUser(els.user, {
      user: authed ? state.user : { nombre: "No autenticado" },
      role: state.role,
      onRoleChange: function (role) {
        state.role = role;
        if (authed) session.updateSessionRole(role);
        navigate(INITIAL_ROUTE[role]);
      },
      onLogout: function () {
        session.clearSession();
        navigate(loginRoute(state.role));
      },
    });

    layout.renderNav(els.nav, { role: state.role, currentRoute: state.route });

    var key = router.getViewKey(state.route);

    if (key === "error/403") { errors.renderForbidden(els.content); return; }
    if (key === "error/404") { errors.renderNotFound(els.content); return; }
    if (key === "error/500") { errors.renderServerError(els.content); return; }

    if (key === "login") {
      global.tm.views.p01.renderP01(els.content, {
        onLoginSuccess: function (res) {
          session.saveSession({ rol: res.rol, usuario: res.usuario }, {});
          state.role = res.rol;
          state.user = res.usuario;
          navigate(INITIAL_ROUTE[state.role]);
        },
        onGoToRegistro: function () { navigate("#/registro"); },
        onGoToRecuperar: function () { navigate("#/recuperar-clave"); },
      });
      return;
    }
    if (key === "registro") {
      global.tm.views.p02.renderP02(els.content, {
        onRegistered: function () { navigate("#/identidad/otp"); },
        onGoToLogin: function () { navigate("#/login"); },
      });
      return;
    }
    if (key === "otp") {
      global.tm.views.p03.renderP03(els.content, {
        onVerified: function () { navigate("#/login"); },
        onResend: function () { window.alert("Código reenviado (simulado)."); },
      });
      return;
    }
    if (key === "recuperar") {
      global.tm.views.p04.renderP04(els.content, {
        onGoToLogin: function () { navigate("#/login"); },
      });
      return;
    }
    if (key === "p-05") {
      global.tm.views.p05.renderP05(els.content, {
        onRequestChangeEmail: function () { navigate("#/identidad/otp"); },
      });
      return;
    }
    if (key === "p-06") {
      global.tm.views.p06.renderP06(els.content, {
        onNueva: function () { navigate("#/solicitud/tramite"); },
        onContinue: function () { navigate("#/solicitud/tramite"); },
        onVerObservacion: function () { navigate("#/seguimiento/observaciones"); },
        onDescargar: function () { navigate("#/seguimiento/resultados"); },
      });
      return;
    }
    if (key === "p-07") {
      global.tm.views.p07.renderP07(els.content, {
        onBack: function () { navigate("#/mis-tramites"); },
        onContinue: function () { navigate("#/solicitud/titularidad"); },
      });
      return;
    }

    layout.renderView(els.content, { route: state.route, role: state.role });
  }

  window.addEventListener("hashchange", function () {
    state.route = window.location.hash || INITIAL_ROUTE[state.role];
    render();
  });

  if (els.navToggle) {
    els.navToggle.addEventListener("click", function () {
      var open = els.nav.classList.toggle("is-open");
      els.navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  if (!window.location.hash) window.location.hash = INITIAL_ROUTE[state.role];
  render();
})(window);
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

    if (key === "interno-login") {
      global.tm.views.i01.renderI01(els.content, {
        onInternalLoginSuccess: function (res) {
          session.saveSession({ rol: res.rol, usuario: res.usuario }, {});
          state.role = res.rol;
          state.user = res.usuario;
          navigate(INITIAL_ROUTE[state.role]);
        },
      });
      return;
    }
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
    if (key === "p-19") {
      global.tm.views.p19.renderP19(els.content, {
        onAtender: function () { navigate("#/seguimiento/observaciones"); },
        onVerDocumentos: function () { navigate("#/solicitud/paso-6"); },
        onGoMisTramites: function () { navigate("#/mis-tramites"); },
      });
      return;
    }
    if (key === "p-20") {
      global.tm.views.p20.renderP20(els.content, {
        onAtender: function () { navigate("#/seguimiento/subsanacion"); },
        onGoMisTramites: function () { navigate("#/mis-tramites"); },
      });
      return;
    }
    if (key === "p-21") {
      global.tm.views.p21.renderP21(els.content, {
        onNavigate: navigate,
      });
      return;
    }
    if (key === "p-22") {
      global.tm.views.p22.renderP22(els.content, {
        onNavigate: navigate,
      });
      return;
    }
    if (key === "p-23") {
      global.tm.views.p23.renderP23(els.content, {
        onNavigate: navigate,
      });
      return;
    }
    if (key === "p-24") {
      global.tm.views.p24.renderP24(els.content, {
        onNavigate: navigate,
      });
      return;
    }
    if (key === "p-25") {
      global.tm.views.p25.renderP25(els.content, {
        onNavigate: navigate,
      });
      return;
    }
    if (key === "p-26") {
      global.tm.views.p26.renderP26(els.content, {
        onNavigate: navigate,
      });
      return;
    }
    if (key === "p-27") {
      global.tm.views.p27.renderP27(els.content, {
        onNavigate: navigate,
      });
      return;
    }

    var wizardOpts = { onNavigate: navigate };
    if (key === "p-08") { global.tm.views.p08.renderP08(els.content, wizardOpts); return; }
    if (key === "p-09") { global.tm.views.p09.renderP09(els.content, wizardOpts); return; }
    if (key === "p-10") { global.tm.views.p10.renderP10(els.content, wizardOpts); return; }
    if (key === "p-11") { global.tm.views.p11.renderP11(els.content, wizardOpts); return; }
    if (key === "p-12") { global.tm.views.p12.renderP12(els.content, wizardOpts); return; }
    if (key === "p-13") { global.tm.views.p13.renderP13(els.content, wizardOpts); return; }
    if (key === "p-14") { global.tm.views.p14.renderP14(els.content, wizardOpts); return; }
    if (key === "p-15") { global.tm.views.p15.renderP15(els.content, wizardOpts); return; }
    if (key === "p-16") { global.tm.views.p16.renderP16(els.content, wizardOpts); return; }
    if (key === "p-17") { global.tm.views.p17.renderP17(els.content, wizardOpts); return; }
    if (key === "p-18") { global.tm.views.p18.renderP18(els.content, wizardOpts); return; }

    var internalOpts = { onNavigate: navigate };
    if (key === "interno/tablero") { global.tm.views.i02.renderI02(els.content, internalOpts); return; }
    if (key === "interno/recepcion") { global.tm.views.i03.renderI03(els.content, internalOpts); return; }
    if (key === "interno/completitud") { global.tm.views.i04.renderI04(els.content, internalOpts); return; }
    if (key === "interno/asignacion") { global.tm.views.i05.renderI05(els.content, internalOpts); return; }
    if (key === "interno/analisis") { global.tm.views.i06.renderI06(els.content, internalOpts); return; }
    if (key === "interno/verificaciones") { global.tm.views.i07.renderI07(els.content, internalOpts); return; }
    if (key === "interno/observaciones") { global.tm.views.i08.renderI08(els.content, internalOpts); return; }
    if (key === "interno/edictos") { global.tm.views.i09.renderI09(els.content, internalOpts); return; }
    if (key === "interno/resolucion") { global.tm.views.i10.renderI10(els.content, internalOpts); return; }
    if (key === "interno/notificacion") { global.tm.views.i11.renderI11(els.content, internalOpts); return; }
    if (key === "interno/entrega") { global.tm.views.i12.renderI12(els.content, internalOpts); return; }
    if (key === "interno/archivo") { global.tm.views.i13.renderI13(els.content, internalOpts); return; }
    if (key === "interno/catalogos") { global.tm.views.i14.renderI14(els.content, internalOpts); return; }
    if (key === "interno/usuarios") { global.tm.views.i15.renderI15(els.content, internalOpts); return; }
    if (key === "interno/bitacora") { global.tm.views.i16.renderI16(els.content, internalOpts); return; }
    if (key === "interno/reportes") { global.tm.views.i17.renderI17(els.content, internalOpts); return; }
    if (key === "interno/conexiones") { global.tm.views.i18.renderI18(els.content, internalOpts); return; }

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
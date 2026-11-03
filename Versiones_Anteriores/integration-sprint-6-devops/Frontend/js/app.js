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
  var fixtures = global.tm.fixtures;

  // Último aplicador de estado (4 estados) de la vista montada; lo usa el
  // selector de escenarios global de la cabecera (HU-09 / TASK-09.4).
  var currentShow = null;
  var lastRenderedRoute = null;

  function showView(renderFn, opts) {
    renderFn(els.content, opts);
    currentShow = typeof opts.onDemoState === "function" ? opts.onDemoState : null;
  }

  var DEFAULT_ROLE = roles.DEFAULT_ROLE;
  var INITIAL_ROUTE = roles.INITIAL_ROUTE;
  var isInternalRole = roles.isInternalRole;

  var sess = session.getSession();

  var state = {
    user: (sess && sess.datos && sess.datos.usuario) || { nombre: "María Demo", correo: "cliente@demo.pa" },
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

    var routeChanged = lastRenderedRoute !== state.route;
    lastRenderedRoute = state.route;

    els.context.textContent = isInternalRole(state.role) ? "Módulo interno" : "Portal del cliente";

    layout.renderHeaderUser(els.user, {
      user: authed ? state.user : { nombre: "No autenticado" },
      role: state.role,
      scenario: fixtures.scenario() || "exito",
      onRoleChange: function (role) {
        state.role = role;
        if (authed) session.updateSessionRole(role);
        navigate(INITIAL_ROUTE[role]);
      },
      onScenarioChange: function (scenario) {
        fixtures.setScenario(scenario);
        if (typeof currentShow === "function") currentShow(scenario);
        else render();
      },
      onAutofill: function () {
        if (global.tm.autofill) return global.tm.autofill.fill(els.content);
        return null;
      },
      onLogout: function () {
        var role = state.role;
        function fin() {
          session.clearSession();
          navigate(loginRoute(role));
        }
        if (global.tm.api.isOnline() && session.getToken()) {
          global.tm.api.request("POST", "/auth/logout", { pantalla: "P-01" }, function () { fin(); });
        } else {
          fin();
        }
      },
    });

    layout.renderNav(els.nav, { role: state.role, currentRoute: state.route });

    if (routeChanged) {
      var routeTitle = els.nav.querySelector('[aria-current="page"]');
      var routeLabel = routeTitle ? routeTitle.textContent.trim() : "Pantalla actual";
      document.title = routeLabel + " | Trámites Migratorios";
      var announcer = document.getElementById("app-announcer");
      if (announcer) announcer.textContent = "Navegaste a: " + routeLabel;
      // Deja el foco en el contenido para que teclado y lector de pantalla no
      // obliguen al usuario a recorrer nuevamente el menú lateral.
      window.setTimeout(function () { els.content.focus({ preventScroll: true }); }, 0);
    }

    var key = router.getViewKey(state.route);

    currentShow = null;

    if (key === "error/403") { errors.renderForbidden(els.content); return; }
    if (key === "error/404") { errors.renderNotFound(els.content); return; }
    if (key === "error/500") { errors.renderServerError(els.content); return; }

    if (key === "interno-login") {
      showView(global.tm.views.i01.renderI01, {
        onInternalLoginSuccess: function (res) {
          session.saveSession({ rol: res.rol, usuario: res.usuario }, res.token ? { token: res.token, expiraEn: res.expiraEn } : {});
          state.role = res.rol;
          state.user = res.usuario;
          navigate(INITIAL_ROUTE[state.role]);
        },
      });
      return;
    }
    if (key === "login") {
      showView(global.tm.views.p01.renderP01, {
        onLoginSuccess: function (res) {
          session.saveSession({ rol: res.rol, usuario: res.usuario }, { token: res.token, expiraEn: res.expiraEn });
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
      showView(global.tm.views.p02.renderP02, {
        // La cuenta queda ACTIVA en el backend: se ofrece iniciar sesión.
        onRegistered: function () { navigate("#/login"); },
        onGoToLogin: function () { navigate("#/login"); },
      });
      return;
    }
    if (key === "otp") {
      showView(global.tm.views.p03.renderP03, {
        onVerified: function () { navigate("#/login"); },
        onResend: function () { window.alert("Código reenviado (simulado)."); },
      });
      return;
    }
    if (key === "recuperar") {
      showView(global.tm.views.p04.renderP04, {
        onGoToLogin: function () { navigate("#/login"); },
      });
      return;
    }
    if (key === "p-05") {
      showView(global.tm.views.p05.renderP05, { onNavigate: navigate });
      return;
    }
    if (key === "p-06") {
      showView(global.tm.views.p06.renderP06, {
        onNueva: function () { navigate("#/solicitud/tramite"); },
        onContinue: function () { navigate("#/solicitud/tramite"); },
        onVerObservacion: function () { navigate("#/seguimiento/observaciones"); },
        onVerEstado: function () { navigate("#/seguimiento/estado"); },
        onDescargar: function () { navigate("#/seguimiento/resultados"); },
      });
      return;
    }
    if (key === "p-07") {
      showView(global.tm.views.p07.renderP07, {
        onBack: function () { navigate("#/mis-tramites"); },
        onContinue: function () { navigate("#/solicitud/titularidad"); },
      });
      return;
    }
    if (key === "p-19") {
      showView(global.tm.views.p19.renderP19, {
        onAtender: function () { navigate("#/seguimiento/observaciones"); },
        onVerDocumentos: function () { navigate("#/solicitud/paso-6"); },
        onGoMisTramites: function () { navigate("#/mis-tramites"); },
      });
      return;
    }
    if (key === "p-20") {
      showView(global.tm.views.p20.renderP20, {
        onAtender: function () { navigate("#/seguimiento/subsanacion"); },
        onGoMisTramites: function () { navigate("#/mis-tramites"); },
      });
      return;
    }
    if (key === "p-21") { showView(global.tm.views.p21.renderP21, { onNavigate: navigate }); return; }
    if (key === "p-22") { showView(global.tm.views.p22.renderP22, { onNavigate: navigate }); return; }
    if (key === "p-23") { showView(global.tm.views.p23.renderP23, { onNavigate: navigate }); return; }
    if (key === "p-24") { showView(global.tm.views.p24.renderP24, { onNavigate: navigate }); return; }
    if (key === "p-25") { showView(global.tm.views.p25.renderP25, { onNavigate: navigate }); return; }
    if (key === "p-26") { showView(global.tm.views.p26.renderP26, { onNavigate: navigate }); return; }
    if (key === "p-27") { showView(global.tm.views.p27.renderP27, { onNavigate: navigate }); return; }

    if (key === "p-08") { showView(global.tm.views.p08.renderP08, { onNavigate: navigate }); return; }
    if (key === "p-09") { showView(global.tm.views.p09.renderP09, { onNavigate: navigate }); return; }
    if (key === "p-10") { showView(global.tm.views.p10.renderP10, { onNavigate: navigate }); return; }
    if (key === "p-11") { showView(global.tm.views.p11.renderP11, { onNavigate: navigate }); return; }
    if (key === "p-12") { showView(global.tm.views.p12.renderP12, { onNavigate: navigate }); return; }
    if (key === "p-13") { showView(global.tm.views.p13.renderP13, { onNavigate: navigate }); return; }
    if (key === "p-14") { showView(global.tm.views.p14.renderP14, { onNavigate: navigate }); return; }
    if (key === "p-15") { showView(global.tm.views.p15.renderP15, { onNavigate: navigate }); return; }
    if (key === "p-16") { showView(global.tm.views.p16.renderP16, { onNavigate: navigate }); return; }
    if (key === "p-17") { showView(global.tm.views.p17.renderP17, { onNavigate: navigate }); return; }
    if (key === "p-18") { showView(global.tm.views.p18.renderP18, { onNavigate: navigate }); return; }

    if (key === "interno/tablero") { showView(global.tm.views.i02.renderI02, { onNavigate: navigate }); return; }
    if (key === "interno/recepcion") { showView(global.tm.views.i03.renderI03, { onNavigate: navigate }); return; }
    if (key === "interno/completitud") { showView(global.tm.views.i04.renderI04, { onNavigate: navigate }); return; }
    if (key === "interno/asignacion") { showView(global.tm.views.i05.renderI05, { onNavigate: navigate }); return; }
    if (key === "interno/analisis") { showView(global.tm.views.i06.renderI06, { onNavigate: navigate }); return; }
    if (key === "interno/verificaciones") { showView(global.tm.views.i07.renderI07, { onNavigate: navigate }); return; }
    if (key === "interno/observaciones") { showView(global.tm.views.i08.renderI08, { onNavigate: navigate }); return; }
    if (key === "interno/edictos") { showView(global.tm.views.i09.renderI09, { onNavigate: navigate }); return; }
    if (key === "interno/resolucion") { showView(global.tm.views.i10.renderI10, { onNavigate: navigate }); return; }
    if (key === "interno/notificacion") { showView(global.tm.views.i11.renderI11, { onNavigate: navigate }); return; }
    if (key === "interno/entrega") { showView(global.tm.views.i12.renderI12, { onNavigate: navigate }); return; }
    if (key === "interno/archivo") { showView(global.tm.views.i13.renderI13, { onNavigate: navigate }); return; }
    if (key === "interno/catalogos") { showView(global.tm.views.i14.renderI14, { onNavigate: navigate }); return; }
    if (key === "interno/usuarios") { showView(global.tm.views.i15.renderI15, { onNavigate: navigate }); return; }
    if (key === "interno/bitacora") { showView(global.tm.views.i16.renderI16, { onNavigate: navigate }); return; }
    if (key === "interno/reportes") { showView(global.tm.views.i17.renderI17, { onNavigate: navigate }); return; }
    if (key === "interno/conexiones") { showView(global.tm.views.i18.renderI18, { onNavigate: navigate }); return; }
    if (key === "interno/consentimientos") { showView(global.tm.views.i19.renderI19, { onNavigate: navigate }); return; }

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

  // En móvil, un enlace seleccionado cierra el menú y evita que tape el
  // contenido recién abierto.
  els.nav.addEventListener("click", function (event) {
    if (event.target.closest("a") && els.nav.classList.contains("is-open")) {
      els.nav.classList.remove("is-open");
      els.navToggle?.setAttribute("aria-expanded", "false");
    }
  });

  if (!window.location.hash) window.location.hash = INITIAL_ROUTE[state.role];
  render();
})(window);

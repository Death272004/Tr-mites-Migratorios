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
  var lastRenderedRoute = null;

  function showView(renderFn, opts) {
    renderFn(els.content, opts);
  }

  // Asistente de solicitud en tres pasos (P-29). Un paso solo se abre si el
  // anterior ya dejó su parte en el borrador; si no, se vuelve al que falta.
  function showSolicitudStep(step) {
    var d = global.tm.draft.getDraft();
    if (step >= 2 && !d.datosPersonales) step = 1;
    if (step === 3 && !(d.tramite && d.requisitos)) step = 2;
    var entry = global.tm.wizard.PHASES[step - 1].entry;
    if (global.tm.wizard.phaseIndex(state.route) !== step - 1) {
      state.route = entry;
      lastRenderedRoute = entry;
      window.history.replaceState({}, "", router.toPath(entry) + window.location.search);
      layout.renderNav(els.nav, { role: state.role, currentRoute: state.route, onNavigate: navigate });
    }
    showView(function (container, viewOpts) { global.tm.views.p29.render(container, viewOpts, step); }, { onNavigate: navigate });
  }

  function nuevaSolicitud() {
    global.tm.draft.clearDraft();
    if (global.tm.docs) global.tm.docs.clear();
    navigate("#/solicitud/paso-1");
  }

  var DEFAULT_ROLE = roles.DEFAULT_ROLE;
  var INITIAL_ROUTE = roles.INITIAL_ROUTE;
  var isInternalRole = roles.isInternalRole;

  var sess = session.getSession();

  var state = {
    user: (sess && sess.datos && sess.datos.usuario) || { nombre: "No autenticado", correo: "" },
    role: (sess && sess.datos && sess.datos.rol) || DEFAULT_ROLE,
    route: router.fromLocation() || INITIAL_ROUTE[(sess && sess.datos && sess.datos.rol) || DEFAULT_ROLE],
  };

  var els = {
    context: document.getElementById("app-context"),
    user: document.getElementById("app-user"),
    nav: document.getElementById("app-nav"),
    content: document.getElementById("contenido"),
    navToggle: document.getElementById("nav-toggle"),
  };

  function navigate(route) {
    var canonical = router.normalizeRoute(route);
    if (router.fromLocation() === canonical) {
      state.route = canonical;
      render();
    } else {
      window.history.pushState({}, "", router.toPath(canonical) + window.location.search);
      state.route = canonical;
      render();
    }
  }

  function render() {
    if (global.tm.settings) global.tm.settings.apply();
    var authed = session.isAuthenticated();
    // Los selectores de escenario y las ayudas de demostración solo deben
    // existir en modo offline. El backend sigue siendo la fuente de verdad.
    document.documentElement.classList.toggle("app-online", !!(global.tm.api && global.tm.api.isOnline()));
    var resolved = router.resolveRoute(state.route, state.role, authed);
    if (resolved !== state.route) {
      state.route = resolved;
      window.history.replaceState({}, "", router.toPath(resolved) + window.location.search);
      // `replaceState` no dispara `popstate`. Continuamos este mismo render
      // para que una ruta protegida abierta sin sesión muestre el login de
      // inmediato, en lugar de dejar el contenido vacío hasta recargar.
    }

    var routeChanged = lastRenderedRoute !== state.route;
    lastRenderedRoute = state.route;

    els.context.textContent = isInternalRole(state.role) ? "Módulo interno" : "Portal del cliente";

    layout.renderHeaderUser(els.user, {
      user: authed ? state.user : { nombre: "No autenticado" },
      role: state.role,
      authenticated: authed,
      onNavigate: navigate,
      onLogout: function () {
        function fin() {
          // Al salir no quedan borradores ni documentos en este navegador.
          if (global.tm.draft) global.tm.draft.clearDraft();
          if (global.tm.docs) global.tm.docs.clear();
          session.clearSession();
          state.role = DEFAULT_ROLE;
          state.user = { nombre: "No autenticado", correo: "" };
          // Todos los perfiles regresan al login general del portal.
          // El rol se resolverá nuevamente después de autenticarse.
          navigate(router.LOGIN_ROUTE);
        }
        if (global.tm.api.isOnline() && session.getToken()) {
          global.tm.api.request("POST", "/auth/logout", { pantalla: "P-01" }, function () { fin(); });
        } else {
          fin();
        }
      },
    });

    layout.renderNav(els.nav, { role: state.role, currentRoute: state.route, onNavigate: navigate });

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

    if (key === "error/403") { errors.renderForbidden(els.content); return; }
    if (key === "error/404") { errors.renderNotFound(els.content); return; }
    if (key === "error/500") { errors.renderServerError(els.content); return; }

    if (key === "interno-login") {
      showView(global.tm.views.i01.renderI01, {
        onInternalLoginSuccess: function (res) {
          session.saveSession({ rol: res.rol, usuario: res.usuario }, Object.assign({}, res.token ? { token: res.token, expiraEn: res.expiraEn } : {}, {
            recordar: !!(global.tm.settings && global.tm.settings.get().recordarSesion),
          }));
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
          session.saveSession({ rol: res.rol, usuario: res.usuario }, {
            token: res.token,
            expiraEn: res.expiraEn,
            recordar: !!(global.tm.settings && global.tm.settings.get().recordarSesion),
          });
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
    if (key === "p-28") {
      showView(global.tm.views.p28.renderP28, { onNavigate: navigate });
      return;
    }
    if (key === "p-06") {
      showView(global.tm.views.p06.renderP06, {
        onNueva: nuevaSolicitud,
        onContinue: function () { navigate("#/solicitud/paso-1"); },
        onVerObservacion: function () { navigate("#/seguimiento/observaciones"); },
        onVerEstado: function () { navigate("#/seguimiento/estado"); },
        onDescargar: function () { navigate("#/seguimiento/resultados"); },
      });
      return;
    }
    if (key === "p-07") { showSolicitudStep(2); return; }
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

    // Paso 1: identidad e información · Paso 2: trámite y documentación ·
    // Paso 3: revisión y pago. Las rutas heredadas abren el paso que las contiene.
    if (key === "p-09" || key === "p-10" || key === "p-11") { showSolicitudStep(1); return; }
    if (key === "p-08" || key === "p-12" || key === "p-13" || key === "p-14") { showSolicitudStep(2); return; }
    if (key === "p-15" || key === "p-16") { showSolicitudStep(3); return; }
    if (key === "p-17") {
      // El resumen como pantalla propia solo muestra el resultado del envío.
      if (global.tm.draft.getDraft().submitted) showView(global.tm.views.p17.renderP17, { onNavigate: navigate });
      else showSolicitudStep(3);
      return;
    }
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

  function syncRouteFromLocation() {
    var route = router.fromLocation();
    if (!route) return;
    state.route = route;
    render();
  }

  window.addEventListener("popstate", syncRouteFromLocation);
  // Compatibilidad temporal con enlaces antiguos que todavía traigan #/ruta.
  window.addEventListener("hashchange", syncRouteFromLocation);

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

  document.addEventListener("click", function (event) {
    if (!els.nav.classList.contains("is-open")) return;
    if (els.nav.contains(event.target) || els.navToggle?.contains(event.target)) return;
    els.nav.classList.remove("is-open");
    els.navToggle?.setAttribute("aria-expanded", "false");
  });

  var initialRoute = router.fromLocation() || INITIAL_ROUTE[state.role];
  if (router.fromLocation() !== initialRoute || window.location.hash) {
    window.history.replaceState({}, "", router.toPath(initialRoute) + window.location.search);
  }
  state.route = initialRoute;
  // Los adjuntos respaldados se recuperan antes de pintar. Sin un borrador en
  // curso (pestaña nueva, sesión anterior) no corresponden a nada y se descartan.
  function arrancar() {
    var d = global.tm.draft ? global.tm.draft.getDraft() : {};
    var hayBorrador = d && Object.keys(d).length > 0 && !d.submitted;
    if (!global.tm.docs || !global.tm.docs.restore) { render(); return; }
    if (!hayBorrador || !session.isAuthenticated()) { global.tm.docs.clear(); render(); return; }
    var listo = false;
    function seguir() { if (!listo) { listo = true; render(); } }
    global.tm.docs.restore().then(seguir, seguir);
    global.setTimeout(seguir, 1500);
  }
  arrancar();
})(window);

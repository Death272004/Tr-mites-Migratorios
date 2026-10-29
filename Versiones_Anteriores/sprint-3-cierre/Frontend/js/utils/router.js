/**
 * router.js — enrutador hash con guards por rol y vistas globales 403/404/500.
 * Script clásico: expone `window.tm.router`.
 */
(function (global) {
  "use strict";

  const { INITIAL_ROUTE, isInternalRole, ROLES } = global.tm.roles;
  const { findNavItem } = global.tm.nav;

  const LOGIN_ROUTE = "#/login";
  const INTERNAL_LOGIN_ROUTE = "#/interno/login";

  const ERRORS = Object.freeze({
    FORBIDDEN: "#/error/403",
    NOT_FOUND: "#/error/404",
    SERVER: "#/error/500",
  });

  function canAccess(route, role) {
    const publicPortal = [LOGIN_ROUTE, "#/registro", "#/recuperar-clave", "#/identidad/otp"];
    if (publicPortal.includes(route)) return true;

    if (route.startsWith("#/interno/")) {
      if (route === INTERNAL_LOGIN_ROUTE) return true;
      return isInternalRole(role);
    }

    if (
      route.startsWith("#/solicitud/") ||
      route.startsWith("#/seguimiento/") ||
      route.startsWith("#/servicios/") ||
      route === "#/perfil" ||
      route === "#/mis-tramites"
    ) {
      return role === ROLES.SOLICITANTE;
    }

    if (route === ERRORS.FORBIDDEN || route === ERRORS.NOT_FOUND || route === ERRORS.SERVER) return true;

    return false;
  }

  function getViewKey(route) {
    if (!route || !route.startsWith("#/")) return "not-found";

    if (route.startsWith("#/interno/")) {
      if (route === INTERNAL_LOGIN_ROUTE) return "interno-login";
      return route.replace("#/interno/", "interno/");
    }

    const map = {
      "#/login": "login",
      "#/registro": "registro",
      "#/recuperar-clave": "recuperar",
      "#/identidad/otp": "otp",
      "#/mis-tramites": "p-06",
      "#/solicitud/tramite": "p-07",
      "#/solicitud/titularidad": "p-08",
      "#/solicitud/paso-1": "p-09",
      "#/solicitud/paso-2": "p-10",
      "#/solicitud/paso-3": "p-11",
      "#/solicitud/paso-4": "p-12",
      "#/solicitud/paso-5": "p-13",
      "#/solicitud/paso-6": "p-14",
      "#/solicitud/paso-7": "p-15",
      "#/solicitud/paso-8": "p-16",
      "#/solicitud/resumen": "p-17",
      "#/solicitud/cita": "p-18",
      "#/seguimiento/estado": "p-19",
      "#/seguimiento/observaciones": "p-20",
      "#/seguimiento/subsanacion": "p-21",
      "#/seguimiento/resultados": "p-22",
      "#/seguimiento/pagos": "p-23",
      "#/seguimiento/edictos": "p-24",
      "#/servicios/certificaciones": "p-25",
      "#/servicios/naturalizacion": "p-26",
      "#/servicios/ayuda": "p-27",
      "#/perfil": "p-05",
    };
    if (map[route]) return map[route];
    if (route === ERRORS.FORBIDDEN) return "error/403";
    if (route === ERRORS.NOT_FOUND) return "error/404";
    if (route === ERRORS.SERVER) return "error/500";
    return "not-found";
  }

  function resolveRoute(inputRoute, role, isAuthenticated) {
    let route = inputRoute && inputRoute.startsWith("#/") ? inputRoute : null;

    if (!route) {
      route = isAuthenticated
        ? INITIAL_ROUTE[role]
        : isInternalRole(role)
          ? INTERNAL_LOGIN_ROUTE
          : LOGIN_ROUTE;
    }

    const publicPortal = [LOGIN_ROUTE, INTERNAL_LOGIN_ROUTE, "#/registro", "#/recuperar-clave", "#/identidad/otp", ERRORS.FORBIDDEN, ERRORS.NOT_FOUND, ERRORS.SERVER];
    const needsAuth =
      (!publicPortal.includes(route) && !isInternalRole(role)) ||
      (route.startsWith("#/interno/") && route !== INTERNAL_LOGIN_ROUTE);

    if (needsAuth && !isAuthenticated) {
      route = isInternalRole(role) ? INTERNAL_LOGIN_ROUTE : LOGIN_ROUTE;
    }

    if (!canAccess(route, role)) {
      return ERRORS.FORBIDDEN;
    }

    const isInner = route.startsWith("#/interno/") && route !== INTERNAL_LOGIN_ROUTE;
    const isPortalRoute =
      route.startsWith("#/solicitud/") ||
      route.startsWith("#/seguimiento/") ||
      route.startsWith("#/servicios/") ||
      route === "#/mis-tramites" ||
      route === "#/perfil";

    if (isInner) {
      if (!findNavItem(role, route)) return ERRORS.NOT_FOUND;
    } else if (isPortalRoute) {
      if (route.startsWith("#/solicitud/")) {
        if (!mapHas(route)) return ERRORS.NOT_FOUND;
      } else if (!findNavItem(role, route)) {
        return ERRORS.NOT_FOUND;
      }
    } else if (!publicPortal.includes(route) && !mapHas(route)) {
      return ERRORS.NOT_FOUND;
    }

    return route;
  }

  function mapHas(route) {
    const map = {
      "#/login": 1, "#/registro": 1, "#/recuperar-clave": 1, "#/identidad/otp": 1,
      "#/mis-tramites": 1, "#/solicitud/tramite": 1, "#/solicitud/titularidad": 1,
      "#/solicitud/paso-1": 1, "#/solicitud/paso-2": 1, "#/solicitud/paso-3": 1,
      "#/solicitud/paso-4": 1, "#/solicitud/paso-5": 1, "#/solicitud/paso-6": 1,
      "#/solicitud/paso-7": 1, "#/solicitud/paso-8": 1, "#/solicitud/resumen": 1,
      "#/solicitud/cita": 1, "#/seguimiento/estado": 1, "#/seguimiento/observaciones": 1,
      "#/seguimiento/subsanacion": 1, "#/seguimiento/resultados": 1, "#/seguimiento/pagos": 1,
      "#/seguimiento/edictos": 1, "#/servicios/certificaciones": 1, "#/servicios/naturalizacion": 1,
      "#/servicios/ayuda": 1, "#/perfil": 1,
    };
    return !!map[route];
  }

  global.tm.router = { getViewKey, resolveRoute, ERRORS, LOGIN_ROUTE, INTERNAL_LOGIN_ROUTE };
})(window);
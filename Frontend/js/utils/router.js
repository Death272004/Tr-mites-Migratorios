/**
 * router.js — enrutador con hash, guards por rol y vistas globales.
 * Sigue el inventario: rutas hash como en plan-de-ejecucion-frontend.md §3.
 * Vistas globales: 403, 404, 500.
 */

import { ROLES, INITIAL_ROUTE, isInternalRole } from "../utils/roles.js";
import { findNavItem } from "../utils/nav.js";

const LOGIN_ROUTE = "#/login";
const INTERNAL_LOGIN_ROUTE = "#/interno/login";

const ERRORS = Object.freeze({
  FORBIDDEN: "#/error/403",
  NOT_FOUND: "#/error/404",
  SERVER: "#/error/500",
});

/** Reglas de guard para comprobar que el rol puede acceder a la ruta. */
function canAccess(route, role) {
  // Rutas públicas del portal cliente
  const publicPortal = [LOGIN_ROUTE, "#/registro", "#/recuperar-clave", "#/identidad/otp"];
  if (publicPortal.includes(route)) return true;

  // Rutas internas (módulo interno)
  if (route.startsWith("#/interno/")) {
    if (route === INTERNAL_LOGIN_ROUTE) return true;
    return isInternalRole(role);
  }

  // Rutas del portal cliente
  if (route.startsWith("#/solicitud/") || route.startsWith("#/seguimiento/") || route.startsWith("#/servicios/") || route.startsWith("#/perfil") || route === "#/mis-tramites") {
    return role === ROLES.SOLICITANTE;
  }

  // Rutas de error públicas
  if (route === ERRORS.FORBIDDEN || route === ERRORS.NOT_FOUND || route === ERRORS.SERVER) return true;

  return false;
}

/** Mapear las rutas a "keys" de vista. */
export function getViewKey(route) {
  if (!route.startsWith("#/")) return route || "#/not-found";

  if (route.startsWith("#/interno/")) {
    if (route === INTERNAL_LOGIN_ROUTE) return "interno-login";
    return route.replace("#/interno/", "interno/");
  }

  switch (route) {
    case LOGIN_ROUTE: return "login";
    case "#/registro": return "registro";
    case "#/recuperar-clave": return "recuperar";
    case "#/identidad/otp": return "otp";
    case "#/mis-tramites": return "p-06";
    case "#/solicitud/tramite": return "p-07";
    case "#/solicitud/titularidad": return "p-08";
    case "#/solicitud/paso-1": return "p-09";
    case "#/solicitud/paso-2": return "p-10";
    case "#/solicitud/paso-3": return "p-11";
    case "#/solicitud/paso-4": return "p-12";
    case "#/solicitud/paso-5": return "p-13";
    case "#/solicitud/paso-6": return "p-14";
    case "#/solicitud/paso-7": return "p-15";
    case "#/solicitud/paso-8": return "p-16";
    case "#/solicitud/resumen": return "p-17";
    case "#/solicitud/cita": return "p-18";
    case "#/seguimiento/estado": return "p-19";
    case "#/seguimiento/observaciones": return "p-20";
    case "#/seguimiento/subsanacion": return "p-21";
    case "#/seguimiento/resultados": return "p-22";
    case "#/seguimiento/pagos": return "p-23";
    case "#/seguimiento/edictos": return "p-24";
    case "#/servicios/certificaciones": return "p-25";
    case "#/servicios/naturalizacion": return "p-26";
    case "#/servicios/ayuda": return "p-27";
    case "#/perfil": return "p-05";
    case ERRORS.FORBIDDEN: return "error/403";
    case ERRORS.NOT_FOUND: return "error/404";
    case ERRORS.SERVER: return "error/500";
    default: return "not-found";
  }
}

/** Resuelve la ruta destino tras validar guards. */
export function resolveRoute(inputRoute, role, isAuthenticated = false) {
  let route = inputRoute && inputRoute.startsWith("#/") ? inputRoute : null;

  if (!route) {
    route = isAuthenticated
      ? INITIAL_ROUTE[role]
      : (isInternalRole(role) ? INTERNAL_LOGIN_ROUTE : LOGIN_ROUTE);
  }

  // Reglas de autenticación (placeholders mientras llega HU-12)
  const needsAuth =
    !isInternalRole(role) &&
    !(route === LOGIN_ROUTE || route === "#/registro" || route === "#/recuperar-clave" || route === "#/identidad/otp" || route === ERRORS.FORBIDDEN || route === ERRORS.NOT_FOUND || route === ERRORS.SERVER) ||
    (route.startsWith("#/interno/") && route !== INTERNAL_LOGIN_ROUTE);

  if (needsAuth && !isAuthenticated) {
    route = isInternalRole(role) ? INTERNAL_LOGIN_ROUTE : LOGIN_ROUTE;
  }

  if (!canAccess(route, role)) {
    return ERRORS.FORBIDDEN;
  }

  // Si no existe en el menú ni es pública válida → 404
  const isKnown =
    getViewKey(route).includes("error") ||
    route === LOGIN_ROUTE ||
    route === INTERNAL_LOGIN_ROUTE ||
    route.startsWith("#/solicitud/") ||
    route.startsWith("#/seguimiento/") ||
    route.startsWith("#/servicios/") ||
    route === "#/perfil" ||
    route === "#/mis-tramites" ||
    (route.startsWith("#/interno/") && route !== INTERNAL_LOGIN_ROUTE) ||
    route === "#/registro" ||
    route === "#/recuperar-clave" ||
    route === "#/identidad/otp";

  const hasMenu = findNavItem(role, route) != null;

  if (route.startsWith("#/interno/") && route !== INTERNAL_LOGIN_ROUTE && !hasMenu) {
    return ERRORS.NOT_FOUND;
  }
  if (route.startsWith("#/solicitud/") && !hasMenu) {
    return ERRORS.NOT_FOUND;
  }
  if (route.startsWith("#/seguimiento/") && !hasMenu) {
    return ERRORS.NOT_FOUND;
  }
  if (route.startsWith("#/servicios/") && !hasMenu) {
    return ERRORS.NOT_FOUND;
  }
  if (route === "#/mis-tramites" && !hasMenu) return ERRORS.NOT_FOUND;
  if (route === "#/perfil" && !hasMenu) return ERRORS.NOT_FOUND;

  if (!isKnown && !hasMenu) return ERRORS.NOT_FOUND;

  return route;
}

export { ERRORS, LOGIN_ROUTE, INTERNAL_LOGIN_ROUTE };

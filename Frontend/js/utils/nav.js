/**
 * nav.js — definición del menú lateral según el rol.
 * Rutas hash tomadas del inventario oficial (plan-de-ejecucion-frontend.md §3).
 */

import { ROLES } from "./roles.js";

/** @typedef {{ label: string, route: string }} NavItem */
/** @typedef {{ title: string, items: NavItem[] }} NavGroup */

const PORTAL = [
  {
    title: "Trámites",
    items: [
      { label: "Mis trámites", route: "#/mis-tramites" },
      { label: "Nueva solicitud", route: "#/solicitud/tramite" },
    ],
  },
  {
    title: "Seguimiento",
    items: [
      { label: "Estado del trámite", route: "#/seguimiento/estado" },
      { label: "Observaciones", route: "#/seguimiento/observaciones" },
      { label: "Subsanación", route: "#/seguimiento/subsanacion" },
      { label: "Resultados", route: "#/seguimiento/resultados" },
      { label: "Historial de pagos", route: "#/seguimiento/pagos" },
      { label: "Edictos y citaciones", route: "#/seguimiento/edictos" },
    ],
  },
  {
    title: "Servicios",
    items: [
      { label: "Certificaciones", route: "#/servicios/certificaciones" },
      { label: "Naturalización", route: "#/servicios/naturalizacion" },
      { label: "Ayuda y FAQ", route: "#/servicios/ayuda" },
    ],
  },
  {
    title: "Cuenta",
    items: [{ label: "Mi perfil", route: "#/perfil" }],
  },
];

const OPERACION_INTERNA = {
  title: "Operación",
  items: [
    { label: "Tablero", route: "#/interno/tablero" },
    { label: "Recepción", route: "#/interno/recepcion" },
    { label: "Completitud", route: "#/interno/completitud" },
    { label: "Asignación de analista", route: "#/interno/asignacion" },
    { label: "Análisis", route: "#/interno/analisis" },
    { label: "Verificaciones", route: "#/interno/verificaciones" },
    { label: "Observaciones", route: "#/interno/observaciones" },
    { label: "Edictos", route: "#/interno/edictos" },
    { label: "Resolución", route: "#/interno/resolucion" },
    { label: "Notificación", route: "#/interno/notificacion" },
    { label: "Entrega", route: "#/interno/entrega" },
    { label: "Archivo y reactivación", route: "#/interno/archivo" },
  ],
};

/** @type {Record<string, NavGroup[]>} */
export const NAV_BY_ROLE = Object.freeze({
  [ROLES.SOLICITANTE]: PORTAL,
  [ROLES.FUNCIONARIO]: [OPERACION_INTERNA],
  [ROLES.SUPERVISOR]: [
    {
      title: "Supervisión",
      items: [
        { label: "Tablero", route: "#/interno/tablero" },
        { label: "Reportes y tiempos", route: "#/interno/reportes" },
        { label: "Verificaciones (lectura)", route: "#/interno/verificaciones" },
      ],
    },
  ],
  [ROLES.AUDITOR]: [
    {
      title: "Auditoría",
      items: [
        { label: "Bitácora", route: "#/interno/bitacora" },
        { label: "Reportes y tiempos", route: "#/interno/reportes" },
      ],
    },
  ],
  [ROLES.ADMIN]: [
    {
      title: "Administración",
      items: [
        { label: "Catálogos", route: "#/interno/catalogos" },
        { label: "Usuarios y roles", route: "#/interno/usuarios" },
        { label: "Salud de conexiones", route: "#/interno/conexiones" },
      ],
    },
  ],
});

export function getNavForRole(role) {
  return NAV_BY_ROLE[role] ?? [];
}

export function findNavItem(role, route) {
  for (const group of getNavForRole(role)) {
    const item = group.items.find((entry) => entry.route === route);
    if (item) return item;
  }
  return null;
}

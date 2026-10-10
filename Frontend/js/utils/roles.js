/**
 * roles.js — roles técnicos del sistema y metadatos de sesión.
 * Fuente: 06-roles-y-accesos.md §6.3 y plan-de-ejecucion-frontend.md §2.1.
 */

export const ROLES = Object.freeze({
  SOLICITANTE: "SOLICITANTE",
  FUNCIONARIO: "FUNCIONARIO",
  SUPERVISOR: "SUPERVISOR",
  AUDITOR: "AUDITOR",
  ADMIN: "ADMIN",
});

export const ROLE_LABELS = Object.freeze({
  [ROLES.SOLICITANTE]: "Cliente del bufete",
  [ROLES.FUNCIONARIO]: "Funcionario",
  [ROLES.SUPERVISOR]: "Supervisor",
  [ROLES.AUDITOR]: "Auditor",
  [ROLES.ADMIN]: "Administrador",
});

/** Ámbito de la aplicación por rol (portal del cliente vs. módulo interno). */
export const ROLE_CONTEXT = Object.freeze({
  [ROLES.SOLICITANTE]: "Portal del cliente",
  [ROLES.FUNCIONARIO]: "Módulo interno",
  [ROLES.SUPERVISOR]: "Módulo interno",
  [ROLES.AUDITOR]: "Módulo interno",
  [ROLES.ADMIN]: "Módulo interno",
});

/** Ruta inicial propuesta por rol (plan §2.1; POR DEFINIR (PO) si cambia). */
export const INITIAL_ROUTE = Object.freeze({
  [ROLES.SOLICITANTE]: "#/mis-tramites",
  [ROLES.FUNCIONARIO]: "#/interno/tablero",
  [ROLES.SUPERVISOR]: "#/interno/reportes",
  [ROLES.AUDITOR]: "#/interno/bitacora",
  [ROLES.ADMIN]: "#/interno/catalogos",
});

export const DEFAULT_ROLE = ROLES.SOLICITANTE;

export function isInternalRole(role) {
  return role !== ROLES.SOLICITANTE;
}

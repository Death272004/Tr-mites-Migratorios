/**
 * roles.js — roles técnicos del sistema y metadatos de sesión.
 * Fuente: 06-roles-y-accesos.md §6.3 y plan-de-ejecucion-frontend.md §2.1.
 * Script clásico: expone `window.tm.roles`.
 */
(function (global) {
  "use strict";

  const ROLES = Object.freeze({
    SOLICITANTE: "SOLICITANTE",
    FUNCIONARIO: "FUNCIONARIO",
    SUPERVISOR: "SUPERVISOR",
    AUDITOR: "AUDITOR",
    ADMIN: "ADMIN",
  });

  const ROLE_LABELS = Object.freeze({
    [ROLES.SOLICITANTE]: "Cliente del bufete",
    [ROLES.FUNCIONARIO]: "Funcionario",
    [ROLES.SUPERVISOR]: "Supervisor",
    [ROLES.AUDITOR]: "Auditor",
    [ROLES.ADMIN]: "Administrador",
  });

  const ROLE_CONTEXT = Object.freeze({
    [ROLES.SOLICITANTE]: "Portal del cliente",
    [ROLES.FUNCIONARIO]: "Módulo interno",
    [ROLES.SUPERVISOR]: "Módulo interno",
    [ROLES.AUDITOR]: "Módulo interno",
    [ROLES.ADMIN]: "Módulo interno",
  });

  const INITIAL_ROUTE = Object.freeze({
    [ROLES.SOLICITANTE]: "#/mis-tramites",
    [ROLES.FUNCIONARIO]: "#/interno/tablero",
    [ROLES.SUPERVISOR]: "#/interno/reportes",
    [ROLES.AUDITOR]: "#/interno/bitacora",
    [ROLES.ADMIN]: "#/interno/catalogos",
  });

  const DEFAULT_ROLE = ROLES.SOLICITANTE;

  function isInternalRole(role) {
    return role !== ROLES.SOLICITANTE;
  }

  global.tm = global.tm || {};
  global.tm.roles = { ROLES, ROLE_LABELS, ROLE_CONTEXT, INITIAL_ROUTE, DEFAULT_ROLE, isInternalRole };
})(window);
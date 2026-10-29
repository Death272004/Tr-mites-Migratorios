/**
 * perms.js — permisos granulares del rol activo (TASK-13.5).
 * La matriz incluida sirve como respaldo para el modo offline. Cuando existe
 * una sesión del backend, los permisos recibidos en `usuario.permisos` son la
 * fuente que usa la interfaz; el backend sigue siendo la autoridad final.
 * Script clásico: expone `window.tm.perms`.
 */
(function (global) {
  "use strict";

  var PERMS = Object.freeze({
    PORTAL: "portal",
    CONSULTAR: "consultar",
    VERIFICAR: "verificar",
    OBSERVAR: "observar",
    RESOLVER: "resolver",
    NOTIFICAR: "notificar",
    REPORTAR: "reportar",
    AUDITAR: "auditar",
    ADMINISTRAR: "administrar",
  });

  var LABELS = Object.freeze({
    [PERMS.PORTAL]: "Portal del cliente",
    [PERMS.CONSULTAR]: "Consultar",
    [PERMS.VERIFICAR]: "Verificar fuentes externas",
    [PERMS.OBSERVAR]: "Emitir/atender observaciones",
    [PERMS.RESOLVER]: "Resolver (aprobar/negar)",
    [PERMS.NOTIFICAR]: "Notificar y entregar",
    [PERMS.REPORTAR]: "Ver reportes y tiempos",
    [PERMS.AUDITAR]: "Consultar bitácora (solo lectura)",
    [PERMS.ADMINISTRAR]: "Administrar catálogos y usuarios",
  });

  // Matriz mock rol × permisos (06-roles-y-accesos.md §6.3.2 y §6.4).
  // FUNCIONARIO se modela como operador completo (demo); en producción el perfil administrador (I-15)
  // asigna los permisos granulares por función y vigencia.
  var MATRIX = Object.freeze({
    SOLICITANTE: [PERMS.PORTAL],
    FUNCIONARIO: [PERMS.CONSULTAR, PERMS.VERIFICAR, PERMS.OBSERVAR, PERMS.RESOLVER, PERMS.NOTIFICAR],
    SUPERVISOR: [PERMS.CONSULTAR, PERMS.REPORTAR],
    AUDITOR: [PERMS.CONSULTAR, PERMS.AUDITAR, PERMS.REPORTAR],
    ADMIN: [PERMS.CONSULTAR, PERMS.ADMINISTRAR],
  });

  function currentRole() {
    var ses = global.tm.session && typeof global.tm.session.getSession === "function" ? global.tm.session.getSession() : null;
    var rol = ses && ses.datos && ses.datos.rol;
    return rol || (global.tm.roles && global.tm.roles.DEFAULT_ROLE) || "SOLICITANTE";
  }

  function currentSessionPermissions(role) {
    var ses = global.tm.session && typeof global.tm.session.getSession === "function"
      ? global.tm.session.getSession() : null;
    var actual = currentRole();
    if (!ses || !ses.datos || !ses.datos.usuario || (role && role !== actual)) return null;
    if (ses.datos.usuario.rol && String(ses.datos.usuario.rol).toUpperCase() !== String(actual).toUpperCase()) return null;
    var raw = ses.datos.usuario.permisos;
    if (!Array.isArray(raw) || !raw.length) return null;
    var permisos = [];
    for (var i = 0; i < raw.length; i++) {
      var valor = raw[i] && typeof raw[i] === "object" ? raw[i].name : raw[i];
      var clave = String(valor || "").toUpperCase();
      if (PERMS[clave] && permisos.indexOf(PERMS[clave]) === -1) permisos.push(PERMS[clave]);
    }
    return permisos;
  }

  function has(role, perm) {
    return list(role).indexOf(perm) >= 0;
  }

  function can(perm, role) {
    return has(role || currentRole(), perm);
  }

  function list(role) {
    var actual = role || currentRole();
    var reales = currentSessionPermissions(actual);
    return reales || (MATRIX[actual] || []).slice();
  }

  function label(perm) {
    return LABELS[perm] || perm;
  }

  // Nodo explicativo cuando el rol activo no tiene el permiso requerido.
  function notice(perm, mensaje) {
    var span = global.tm.layout.el("span", "badge badge--warning", mensaje || ("Sin permiso «" + label(perm) + "» para su rol"));
    span.setAttribute("role", "note");
    return span;
  }

  // Devuelve `node` si hay permiso; si no, deshabilita el control (con explicación)
  // y lo retorna para que la vista siga mostrando la acción, pero inerte.
  function guard(node, perm, mensaje) {
    if (can(perm)) return node;
    if (node && typeof node.disabled === "boolean") node.disabled = true;
    if (node && node.classList) node.classList.add("is-disabled");
    if (node) {
      node.setAttribute("aria-disabled", "true");
      node.setAttribute("title", mensaje || ("Su rol no tiene el permiso «" + label(perm) + "»"));
    }
    return node;
  }

  function describe(role) {
    var actual = role || currentRole();
    var p = list(actual);
    if (!p.length) return "sin permisos";
    var out = [];
    for (var i = 0; i < p.length; i++) out.push(label(p[i]));
    return out.join(" · ");
  }

  global.tm = global.tm || {};
  global.tm.perms = { PERMS: PERMS, LABELS: LABELS, MATRIX: MATRIX, can: can, has: has, list: list, label: label, notice: notice, guard: guard, describe: describe, currentRole: currentRole };
})(window);

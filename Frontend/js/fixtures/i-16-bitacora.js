/**
 * Fixture I-16 · Bitácora de auditoría · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-16", "exito", {
    meta: { pantalla: "I-16", titulo: "Bitácora de auditoría", escenario: "exito", esquema: "hu-08/v1", nota: "Registros inmutables. Sin contraseñas, tokens ni datos personales innecesarios." },
    data: {
      tipos: ["sesion", "expediente", "documento", "verificacion", "exportacion", "denegacion"],
      usuarios: ["a.solis", "p.ruiz", "admin", "l.mora", "desconocido"],
      instituciones: ["TE", "CSS", "Registro Público", "SNM"],
      eventos: [
        { fecha: "2026-10-11 08:00", usuario: "a.solis", ip: "203.0.113.24", pantalla: "I-10", accion: "RESOLUCIÓN", expediente: "EXP-2026-000184", detalle: "Resolución APROBADA", tipo: "expediente" },
        { fecha: "2026-10-11 07:55", usuario: "admin", ip: "203.0.113.10", pantalla: "I-15", accion: "PERMISOS", expediente: "—", detalle: "Cambio de permisos (funcionario)", tipo: "documento" },
        { fecha: "2026-10-10 09:12", usuario: "p.ruiz", ip: "203.0.113.31", pantalla: "I-07", accion: "VERIFICACIÓN EXTERNA", expediente: "EXP-2026-000184", detalle: "Consulta TE (datos consultados)", tipo: "verificacion" },
        { fecha: "2026-10-10 08:40", usuario: "desconocido", ip: "203.0.113.99", pantalla: "I-01", accion: "FALLO DE AUTENTICACIÓN", expediente: "—", detalle: "Intento fallido", tipo: "sesion" },
        { fecha: "2026-10-09 20:00", usuario: "admin", ip: "203.0.113.10", pantalla: "I-16", accion: "403 DENEGADO", expediente: "EXP-2026-000099", detalle: "Acceso sin permiso", tipo: "denegacion" },
        { fecha: "2026-10-09 16:40", usuario: "l.mora", ip: "203.0.113.12", pantalla: "I-17", accion: "EXPORTACIÓN", expediente: "—", detalle: "reportes.csv", tipo: "exportacion" },
      ],
    },
    error: null,
  });
})(window);

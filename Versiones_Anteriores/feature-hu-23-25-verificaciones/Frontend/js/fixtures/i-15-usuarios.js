/**
 * Fixture I-15 · Usuarios, roles y permisos · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-15", "exito", {
    meta: { pantalla: "I-15", titulo: "Usuarios, roles y permisos", escenario: "exito", esquema: "hu-08/v1", nota: "Un usuario por rol. Plazo de revisión de fuentes POR DEFINIR (PO)." },
    data: {
      roles: ["SOLICITANTE", "FUNCIONARIO", "SUPERVISOR", "AUDITOR", "ADMIN"],
      permisosDisponibles: ["consultar", "verificar", "observar", "resolver", "notificar"],
      institucionesDisponibles: ["TE", "CSS", "Registro Público", "SNM"],
      aviso: "Separación técnico-funcional: el ADMIN no obtiene permisos de consulta ni de decisión de expedientes. Permisos de fuentes por finalidad y con revisión periódica.",
      usuarios: [
        { id: 1, nombre: "Lic. Pedro Ruiz", cedula: "8-111-111", cargo: "Abogado analista", seccion: "Resolución", rol: "FUNCIONARIO", permisos: ["consultar", "verificar", "observar"], instituciones: ["TE", "SNM"], estado: "activo", vigencia: "2027-01-01", ultimoAcceso: "2026-10-10 09:12" },
        { id: 2, nombre: "Lic. Ana Solís", cedula: "8-222-222", cargo: "Abogada resolutora", seccion: "Resolución", rol: "FUNCIONARIO", permisos: ["consultar", "verificar", "resolver", "notificar"], instituciones: ["TE"], estado: "activo", vigencia: "2027-01-01", ultimoAcceso: "2026-10-11 08:00" },
        { id: 3, nombre: "Ing. Luis Mora", cedula: "8-333-333", cargo: "Supervisor de operaciones", seccion: "Operaciones", rol: "SUPERVISOR", permisos: ["consultar"], instituciones: [], estado: "activo", vigencia: "2027-06-01", ultimoAcceso: "2026-10-09 16:40" },
        { id: 4, nombre: "Lcda. Sofía Leal", cedula: "8-444-444", cargo: "Auditora", seccion: "Cumplimiento", rol: "AUDITOR", permisos: ["consultar"], instituciones: [], estado: "activo", vigencia: "2027-06-01", ultimoAcceso: "2026-10-08 11:20" },
        { id: 5, nombre: "Admin Sistema", cedula: "8-000-000", cargo: "Administrador", seccion: "TI", rol: "ADMIN", permisos: [], instituciones: [], estado: "activo", vigencia: "2027-01-01", ultimoAcceso: "2026-10-11 07:55" },
      ],
    },
    error: null,
  });
})(window);

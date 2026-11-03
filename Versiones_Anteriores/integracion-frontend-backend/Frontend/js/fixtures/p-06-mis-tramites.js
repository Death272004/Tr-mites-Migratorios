/**
 * Fixture P-06 · Mis trámites · escenario base (éxito).
 * Mismo envelope `{ meta, data, error }` que los mocks de la HU-08 (§2.5).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-06", "exito", {
    meta: {
      pantalla: "P-06",
      titulo: "Mis trámites",
      escenario: "exito",
      esquema: "hu-08/v1",
      nota: "Datos ficticios del solicitante de demostración. Sin datos reales (Ley 81).",
    },
    data: {
      tramites: [
        {
          expediente: "EXP-2026-000184",
          tipo: "Residente temporal",
          fechaEnvio: "2026-09-12",
          estado: "En revisión",
          estadoTono: "info",
          vencimiento: "2026-10-20",
          diasParaVencer: 10,
          pendiente: null,
          borrador: false,
          puedeDescargar: false,
        },
        {
          expediente: "EXP-2026-000159",
          tipo: "Visas no residente",
          fechaEnvio: "2026-08-30",
          estado: "Pendiente del ciudadano",
          estadoTono: "warning",
          vencimiento: null,
          diasParaVencer: null,
          pendiente: "Subsanar observación: documento de domicilio ilegible",
          borrador: false,
          puedeDescargar: false,
        },
        {
          expediente: "EXP-2026-000210",
          tipo: "Certificaciones",
          fechaEnvio: "2026-09-28",
          estado: "Borrador",
          estadoTono: "muted",
          vencimiento: null,
          diasParaVencer: null,
          pendiente: null,
          borrador: true,
          puedeDescargar: false,
        },
        {
          expediente: "EXP-2026-000047",
          tipo: "Registro de Extranjería",
          fechaEnvio: "2026-05-15",
          estado: "Aprobado",
          estadoTono: "success",
          vencimiento: "2027-05-15",
          diasParaVencer: 218,
          pendiente: null,
          borrador: false,
          puedeDescargar: true,
        },
      ],
    },
    error: null,
  });
})(window);
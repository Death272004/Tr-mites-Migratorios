/**
 * Fixture I-03 · Bandeja de recepción (citas y turnos) · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-03", "exito", {
    meta: { pantalla: "I-03", titulo: "Bandeja de recepción", escenario: "exito", esquema: "hu-08/v1", nota: "Cola de citas y turnos ficticia del día." },
    data: {
      filtros: {
        estados: ["Todos", "En espera", "Atendido", "No asistió"],
        tramites: ["Todos", "Residente temporal", "Visas no residente", "Registro de Extranjería", "Naturalización"],
        responsables: ["Todos", "Recepción 1", "Recepción 2", "Ventanilla 42"],
      },
      citas: [
        { turno: "A-014", fechaHora: "2026-10-11 08:30", titular: "María Demo", tramite: "Residente temporal", expediente: "EXP-2026-000184", qr: "QR-EXP-184-2026", llegada: "En espera", responsable: "Recepción 1" },
        { turno: "A-015", fechaHora: "2026-10-11 09:00", titular: "Carlos Núñez", tramite: "Visas no residente", expediente: "EXP-2026-000159", qr: "QR-EXP-159-2026", llegada: "Atendido", responsable: "Recepción 2" },
        { turno: "B-003", fechaHora: "2026-10-11 09:30", titular: "Elena Ríos", tramite: "Naturalización", expediente: "EXP-2026-000210", qr: "QR-EXP-210-2026", llegada: "No asistió", responsable: "Ventanilla 42" },
        { turno: "A-016", fechaHora: "2026-10-11 10:00", titular: "Luis Aparicio", tramite: "Registro de Extranjería", expediente: "EXP-2026-000047", qr: "QR-EXP-047-2026", llegada: "En espera", responsable: "Recepción 1" },
      ],
    },
    error: null,
  });
})(window);

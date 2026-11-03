/**
 * Fixture I-11 · Notificación · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-11", "exito", {
    meta: { pantalla: "I-11", titulo: "Notificación", escenario: "exito", esquema: "hu-08/v1", nota: "Medio preferido heredado de P-05 como sugerencia." },
    data: {
      expediente: "EXP-2026-000184",
      tramite: "Residente temporal",
      estadoActual: "RESUELTO (APROBADA)",
      medioPreferido: "Correo electrónico",
      medios: ["Portal", "Correo electrónico", "Edicto", "Cita"],
      plazoRetiro: "2026-10-25",
      textoPlantilla: "Se le notifica que su solicitud ha sido aprobada. Puede retirar la resolución y su carné en la ventanilla dentro del plazo indicado, presentando su documento de identidad original.",
    },
    error: null,
  });
})(window);

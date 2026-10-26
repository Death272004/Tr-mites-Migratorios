/**
 * Fixture P-18 · Reserva de cita · escenario base (éxito).
 * Sedes y horas de agenda (simuladas), copiadas de la vista sin cambios.
 * Mismo envelope `{ meta, data, error }` que los mocks de la HU-08 (§2.5).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-18", "exito", {
    meta: {
      pantalla: "P-18",
      titulo: "Reserva de cita",
      escenario: "exito",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: {
      sedes: [
        "Oficina Central — Ciudad de Panamá",
        "Sede Regional de Colón",
        "Sede Regional de Chiriquí",
        "Sede Regional de Herrera",
      ],
      horas: ["08:00", "09:00", "10:00", "11:00", "13:30", "14:30", "15:30"],
    },
    error: null,
  });
})(window);

/**
 * Fixture P-18 · Reserva de cita · escenario vacío.
 * Sin sedes con cupo: la vista ofrece reintentar (no muestra el formulario).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-18", "vacio", {
    meta: {
      pantalla: "P-18",
      titulo: "Reserva de cita",
      escenario: "vacio",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: { sedes: [], horas: [] },
    error: null,
  });
})(window);

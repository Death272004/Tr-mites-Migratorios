/**
 * Fixture P-10 · Pasaporte e historial · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-10", "exito", {
    meta: {
      pantalla: "P-10",
      titulo: "Pasaporte e historial migratorio",
      escenario: "exito",
      esquema: "hu-08/v1",
      nota: "Datos ficticios de demostración. Sin datos reales (Ley 81).",
    },
    data: {
      historial: [
        { fecha: "2026-08-30", movimiento: "Entrada", puesto: "Tocumen" },
        { fecha: "2026-06-14", movimiento: "Salida", puesto: "Paso Canoas" },
        { fecha: "2026-05-02", movimiento: "Entrada", puesto: "Tocumen" },
      ],
    },
    error: null,
  });
})(window);

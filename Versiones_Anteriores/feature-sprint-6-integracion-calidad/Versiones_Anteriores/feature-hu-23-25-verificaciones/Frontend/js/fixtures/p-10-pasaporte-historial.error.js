/**
 * Fixture P-10 · Pasaporte e historial · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-10", "error", {
    meta: {
      pantalla: "P-10",
      titulo: "Pasaporte e historial migratorio",
      escenario: "error",
      esquema: "hu-08/v1",
      nota: "Error al cargar historial.",
    },
    data: null,
    error: {
      codigo: "SVC-0500",
      mensajeUsuario: "No pudimos cargar su historial migratorio. Intente nuevamente.",
    },
  });
})(window);

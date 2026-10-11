/**
 * Fixture P-11 · Domicilio y notificaciones · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-11", "error", {
    meta: {
      pantalla: "P-11",
      titulo: "Domicilio y notificaciones",
      escenario: "error",
      esquema: "hu-08/v1",
      nota: "Error al cargar datos.",
    },
    data: null,
    error: {
      codigo: "SVC-0500",
      mensajeUsuario: "No pudimos cargar los datos de domicilio y notificaciones. Intente nuevamente.",
    },
  });
})(window);

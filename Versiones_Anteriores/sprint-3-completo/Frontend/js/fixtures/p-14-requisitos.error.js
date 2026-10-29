/**
 * Fixture P-14 · Requisitos y documentos · escenario de error.
 * Error de servicio, mensaje no técnico (sin datos personales, §2.2).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-14", "error", {
    meta: {
      pantalla: "P-14",
      titulo: "Requisitos y documentos",
      escenario: "error",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: null,
    error: {
      codigo: "SVC-0500",
      mensajeUsuario: "No pudimos cargar la lista de requisitos. Intente nuevamente.",
    },
  });
})(window);

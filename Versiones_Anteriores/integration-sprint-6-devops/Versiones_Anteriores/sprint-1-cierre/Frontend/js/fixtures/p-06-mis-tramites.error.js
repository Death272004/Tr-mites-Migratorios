/**
 * Fixture P-06 · Mis trámites · escenario de error.
 * Error de servicio, mensaje no técnico (sin datos personales, §2.2).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-06", "error", {
    meta: {
      pantalla: "P-06",
      titulo: "Mis trámites",
      escenario: "error",
      esquema: "hu-08/v1",
      nota: "Código ficticio del servicio no publicada (HU-08).",
    },
    data: null,
    error: {
      codigo: "SVC-0500",
      mensajeUsuario: "No pudimos cargar sus trámites en este momento. Intente nuevamente.",
    },
  });
})(window);
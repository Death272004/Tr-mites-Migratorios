/**
 * Fixture P-07 · Nueva solicitud · escenario de error.
 * Error de servicio al cargar el catálogo (mensaje no técnico, §2.2).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-07", "error", {
    meta: {
      pantalla: "P-07",
      titulo: "Nueva solicitud",
      escenario: "error",
      esquema: "hu-08/v1",
      nota: "Código ficticio; el contrato de errores lo publica la HU-08.",
    },
    data: null,
    error: {
      codigo: "SVC-0500",
      mensajeUsuario: "El catálogo de trámites no está disponible en este momento. Intente nuevamente.",
    },
  });
})(window);
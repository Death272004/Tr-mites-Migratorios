/**
 * Fixture I-18 · Salud de las conexiones · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-18", "error", {
    meta: { pantalla: "I-18", titulo: "Salud de conexiones", escenario: "error", esquema: "hu-08/v1", nota: "Error técnico del monitor — no es un resultado negativo (CP-07)." },
    data: null,
    error: { codigo: "SVC-0500", mensajeUsuario: "Error técnico al consultar el monitor: no representa un resultado de validación (CP-07)." },
  });
})(window);

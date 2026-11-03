/**
 * Fixture I-10 · Resolución (aprobar / negar) · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-10", "error", {
    meta: { pantalla: "I-10", titulo: "Resolución (aprobar / negar)", escenario: "error", esquema: "hu-08/v1", nota: "Conflicto 409: el expediente cambió de estado." },
    data: null,
    error: { codigo: "SVC-0409", mensajeUsuario: "El expediente cambió de estado en otro equipo. La vista conserva el estado original (CP-04)." },
  });
})(window);

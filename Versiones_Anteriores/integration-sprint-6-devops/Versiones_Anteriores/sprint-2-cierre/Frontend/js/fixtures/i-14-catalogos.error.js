/**
 * Fixture I-14 · Catálogos · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-14", "error", {
    meta: { pantalla: "I-14", titulo: "Catálogos", escenario: "error", esquema: "hu-08/v1", nota: "Conflicto de versión del catálogo." },
    data: null,
    error: { codigo: "SVC-0409", mensajeUsuario: "Otra persona modificó el catálogo. Recargue para obtener la versión vigente (CP-01)." },
  });
})(window);

/**
 * Fixture I-15 · Usuarios, roles y permisos · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-15", "error", {
    meta: { pantalla: "I-15", titulo: "Usuarios, roles y permisos", escenario: "error", esquema: "hu-08/v1", nota: "Fallo al guardar permisos." },
    data: null,
    error: { codigo: "SVC-0500", mensajeUsuario: "No pudimos guardar los cambios de permisos. Intente nuevamente." },
  });
})(window);

/**
 * Fixture I-11 · Notificación · escenario de error.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-11", "error", {
    meta: { pantalla: "I-11", titulo: "Notificación", escenario: "error", esquema: "hu-08/v1", nota: "Fallo del servicio de notificaciones." },
    data: null,
    error: { codigo: "SVC-0500", mensajeUsuario: "No pudimos registrar la notificación. Intente nuevamente." },
  });
})(window);

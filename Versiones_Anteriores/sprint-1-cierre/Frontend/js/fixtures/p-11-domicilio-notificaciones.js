/**
 * Fixture P-11 · Domicilio y notificaciones · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-11", "exito", {
    meta: {
      pantalla: "P-11",
      titulo: "Domicilio y notificaciones",
      escenario: "exito",
      esquema: "hu-08/v1",
      nota: "Datos ficticios de demostración. Sin datos reales (Ley 81).",
    },
    data: {
      notificaciones: {
        correo: "cliente.demo@bufete.test",
        telefono: "+507 6000-0000",
      },
    },
    error: null,
  });
})(window);

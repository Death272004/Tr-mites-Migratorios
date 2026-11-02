/**
 * Fixture P-07 · Nueva solicitud · escenario vacío.
 * Catálogo sin trámites disponibles por el momento.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-07", "vacio", {
    meta: {
      pantalla: "P-07",
      titulo: "Nueva solicitud",
      escenario: "vacio",
      esquema: "hu-08/v1",
      nota: "Sin catálogo: la vista evita crear solicitudes hasta tener trámites.",
    },
    data: {
      requisitosArt28: [],
      motivos: [],
      paises: [],
      catalogo: [],
    },
    error: null,
  });
})(window);
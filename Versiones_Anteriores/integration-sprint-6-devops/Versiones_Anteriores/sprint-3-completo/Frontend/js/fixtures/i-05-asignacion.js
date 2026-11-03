/**
 * Fixture I-05 · Asignación de analista · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-05", "exito", {
    meta: { pantalla: "I-05", titulo: "Asignación de analista", escenario: "exito", esquema: "hu-08/v1", nota: "Analistas ficticios por especialidad." },
    data: {
      expediente: "EXP-2026-000184",
      tramite: "Residente temporal",
      estadoActual: "RECIBIDO",
      analistas: [
        { nombre: "Lic. Ana Gómez", especialidad: "Visas", carga: 8 },
        { nombre: "Lic. Pedro Ruiz", especialidad: "Residencias", carga: 5 },
        { nombre: "Lic. Sofía León", especialidad: "Naturalización", carga: 11 },
      ],
      prioridades: ["Ordinaria", "Plazo legal"],
      prioridadSugerida: "Ordinaria",
      plazoSugerido: "2026-10-18",
      notaPlazos: "Plazos oficiales del catálogo I-14: cambio de nacionalidad 48 h; corrección de filiación el mismo día.",
    },
    error: null,
  });
})(window);

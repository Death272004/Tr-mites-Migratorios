/**
 * Fixture P-15 · Pagos y tasas · escenario base (éxito).
 * Tasas por categoría del trámite (verbatim del código de la vista).
 * Mismo envelope `{ meta, data, error }` que los mocks de la HU-08 (§2.5).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-15", "exito", {
    meta: {
      pantalla: "P-15",
      titulo: "Pagos y tasas",
      escenario: "exito",
      esquema: "hu-08/v1",
      nota: "Datos ficticios.",
    },
    data: {
      tasas: {
        RESIDENTE_TEMPORAL: [
          { concepto: "Tesoro Nacional", monto: 250 },
          { concepto: "Servicio Nacional de Migración (SNM)", monto: 800 },
        ],
        RESIDENTE_PERMANENTE: [
          { concepto: "Tesoro Nacional", monto: 250 },
          { concepto: "Servicio Nacional de Migración (SNM)", monto: 800 },
        ],
        NATURALIZACION: [
          { concepto: "Timbres — declaración jurada", monto: 8 },
          { concepto: "Timbres — estatus", monto: 8 },
          { concepto: "Timbres — carné E", monto: 2 },
        ],
        CERTIFICACIONES: [
          { concepto: "Certificación / estatus", monto: 10 },
        ],
        REGISTRO_EXTRANJERIA: [
          { concepto: "Tiquete y tasa de filiación", monto: 5 },
        ],
        PROCESOS_ESPECIALES: [
          { concepto: "Tasas y registro", monto: 10 },
        ],
        default: [
          { concepto: "Tasa de visa", monto: 100 },
          { concepto: "Depósito de garantía", monto: 500 },
        ],
      },
    },
    error: null,
  });
})(window);

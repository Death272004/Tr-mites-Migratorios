/**
 * Fixture I-10 · Resolución (aprobar / negar) · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-10", "exito", {
    meta: { pantalla: "I-10", titulo: "Resolución (aprobar / negar)", escenario: "exito", esquema: "hu-08/v1", nota: "Matriz de transiciones POR DEFINIR (PO). Motivos de negación POR DEFINIR." },
    data: {
      expediente: "EXP-2026-000184",
      tramite: "Residente temporal",
      estadoActual: "EN RESOLUCIÓN",
      verificacionesConcluidas: [
        { institucion: "TE", resultado: "OK" },
        { institucion: "SNM", resultado: "OK" },
      ],
      inconsistenciasAbiertas: 0,
      motivosNegacion: ["No cumple requisito legal", "Documentación no subsanada", "Antecedente desfavorable", "Otro (detallar)"],
      transiciones: [
        { accion: "APROBAR", disponible: true, motivo: "" },
        { accion: "NEGAR", disponible: true, motivo: "" },
        { accion: "ARCHIVAR", disponible: false, motivo: "Use Archivo y reactivación (I-13) por plazo vencido" },
      ],
      saldo: "B/.0.00",
      numeroResolucion: "RES-2026-0184",
      fechaResolucion: "2026-10-11",
      vigenciaDesde: "2026-10-11",
      vigenciaHasta: "2027-10-11",
    },
    error: null,
  });
})(window);

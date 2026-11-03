/**
 * Fixture I-13 · Archivo y reactivación · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-13", "exito", {
    meta: { pantalla: "I-13", titulo: "Archivo y reactivación", escenario: "exito", esquema: "hu-08/v1", nota: "Categorías de archivo POR DEFINIR (PO)." },
    data: {
      expediente: "EXP-2026-000184",
      tramite: "Residente temporal",
      estadoActual: "CON OBSERVACIONES",
      categoriasArchivo: ["Plazo vencido", "Desistimiento", "No subsanado", "Duplicado", "Otro"],
      retencion: "7 años",
      historial: [
        { fecha: "2026-08-01", titulo: "Recepción (I-03)", detalle: "Expediente recibido en ventanilla.", done: true },
        { fecha: "2026-08-10", titulo: "Completitud (I-04)", detalle: "Documentos requeridos presentes.", done: true },
        { fecha: "2026-08-20", titulo: "Análisis (I-06)", detalle: "Verificaciones con TE y SNM.", done: true },
        { fecha: "2026-09-05", titulo: "Observaciones (I-08)", detalle: "Emitida observación con plazo de 15 días.", active: true },
      ],
      permiteReactivar: true,
      reactivarMotivo: "Reingreso del cliente (P-21)",
    },
    error: null,
  });
})(window);

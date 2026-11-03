/**
 * Fixture I-12 · Entrega en ventanilla · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-12", "exito", {
    meta: { pantalla: "I-12", titulo: "Entrega en ventanilla", escenario: "exito", esquema: "hu-08/v1", nota: "Carné digital E bloqueado en MVP (§2.3); se muestra sellado [V]." },
    data: {
      expediente: "EXP-2026-000184",
      tramite: "Residente temporal",
      estadoActual: "NOTIFICADO",
      quienRetira: { nombre: "María Demo", documento: "Cédula 8-888-8888", condicion: "Titular" },
      esApoderado: false,
      poderChecklist: ["Poder notariado vigente", "Idoneidad del abogado", "Cédula del apoderado"],
      documentos: ["Resolución", "Carné", "Certificación"],
      documentosSeleccionados: ["Resolución", "Carné"],
      carneDigital: { etiqueta: "Carné E — datos biométricos", origen: "A (automático)", fuentes: ["TE", "SNM"], nota: "Emisión bloqueada en el MVP: requiere convenio con el Tribunal Electoral (§2.3)." },
      saldo: "B/.0.00",
    },
    error: null,
  });
})(window);

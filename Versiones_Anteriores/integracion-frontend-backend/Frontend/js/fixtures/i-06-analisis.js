/**
 * Fixture I-06 · Análisis del expediente (checklist) · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-06", "exito", {
    meta: { pantalla: "I-06", titulo: "Análisis del expediente", escenario: "exito", esquema: "hu-08/v1", nota: "Checklist con una vigencia vencida." },
    data: {
      expediente: "EXP-2026-000184",
      tramite: "Residente temporal",
      estadoActual: "EN ANÁLISIS",
      requisitosComunes: [
        { nombre: "Formulario de solicitud", estado: "Conforme", vigencia: "—" },
        { nombre: "Pasaporte vigente (copia)", estado: "Conforme", vigencia: "Vence 2027-05-15" },
        { nombre: "Antecedentes penales", estado: "Conforme", vigencia: "Vence 2026-11-01 (30 días)" },
        { nombre: "Certificado de salud", estado: "Vencido", vigencia: "Vencido 2026-09-30 (90 días)" },
      ],
      requisitosEspecificos: [
        { nombre: "Ficha CSS (90 días, 9 cuotas)", estado: "Conforme", vigencia: "9 cuotas" },
        { nombre: "Contrato de trabajo o carta de oferta", estado: "Conforme", vigencia: "—" },
      ],
      verificaciones: ["TE", "CSS", "Registro Público", "SNM"],
      verificacionesRequeridas: ["TE", "SNM"],
      historial: [
        { fecha: "2026-10-11 10:15", evento: "RECIBIDO — recibo de expediente" },
        { fecha: "2026-10-11 11:00", evento: "EN ANÁLISIS — asignado a Lic. Pedro Ruiz" },
      ],
    },
    error: null,
  });
})(window);

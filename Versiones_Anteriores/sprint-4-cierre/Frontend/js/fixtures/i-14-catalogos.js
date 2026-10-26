/**
 * Fixture I-14 · Catálogos · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-14", "exito", {
    meta: { pantalla: "I-14", titulo: "Catálogos: trámites, requisitos, tasas y vigencias", escenario: "exito", esquema: "hu-08/v1", nota: "Mismo catálogo base que usa el portal (P-07/P-14/P-15/P-19)." },
    data: {
      version: "2026.10",
      vigencia: "2026-10-01",
      categorias: ["Residencia", "Naturalización", "Certificados", "RUEX", "Permisos"],
      verificacionesDisponibles: ["TE", "CSS", "Registro Público", "SNM"],
      tramites: [
        { codigo: "RT", nombre: "Residente temporal", categoria: "Residencia", estadoLegal: "D.L. 3/2008", vigenciaDias: 90, plazo: "—",
          requisitos: ["Poder notariado", "Solicitud notariada", "3 fotos carné", "Pasaporte cotejado", "Antecedentes penales", "Certificado de salud", "Cheque B/.250.00 Tesoro Nacional", "Cheque B/.800.00 SNM", "Declaración jurada"],
          tasas: [{ concepto: "Tesoro Nacional", monto: "B/.250.00" }, { concepto: "SNM", monto: "B/.800.00" }],
          verificaciones: ["TE", "SNM"] },
        { codigo: "PM1", nombre: "Permiso de migración PM1", categoria: "Permisos", estadoLegal: "D.E. 320/2008", vigenciaDias: 30, plazo: "—",
          requisitos: ["Poder notariado", "Solicitud notariada", "Pasaporte cotejado"],
          tasas: [{ concepto: "SNM", monto: "B/.800.00" }], verificaciones: ["SNM"] },
        { codigo: "NAT", nombre: "Cambio de nacionalidad", categoria: "Naturalización", estadoLegal: "D.L. 3/2008", vigenciaDias: 90, plazo: "48 h",
          requisitos: ["Poder notariado", "Certificado de salud", "Antecedentes penales"],
          tasas: [{ concepto: "Tesoro Nacional", monto: "B/.250.00" }], verificaciones: ["TE", "Registro Público"] },
      ],
    },
    error: null,
  });
})(window);

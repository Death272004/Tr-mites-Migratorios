/**
 * Fixture I-04 · Recepción y verificación de completitud · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-04", "exito", {
    meta: { pantalla: "I-04", titulo: "Recepción y verificación de completitud", escenario: "exito", esquema: "hu-08/v1", nota: "Expediente ficticio con una casilla incompleta." },
    data: {
      expediente: "EXP-2026-000184",
      tramite: "Residente temporal",
      presentante: { nombre: "María Demo", documento: "Cédula 8-888-8888", condicion: "Titular", representacion: null },
      sellado: {
        identidad: "Identidad verificada — origen S (sellado)",
        selloIngreso: "Registro de entradas N.º 2026-10-11-001 — origen S (sellado)",
        ruex: "RUEX vigente — origen S (sellado)",
      },
      pagos: [
        { concepto: "Tesoro Nacional", monto: "B/.250.00", banco: "Banco Nacional de Panamá", estado: "Verificado" },
        { concepto: "SNM", monto: "B/.800.00", banco: "Banco Nacional de Panamá", estado: "Verificado" },
      ],
      requisitos: [
        { nombre: "Formulario de solicitud de residencia", casilla: "Art. 28", estado: "Completo" },
        { nombre: "Pasaporte vigente (copia)", casilla: "Art. 28", estado: "Completo" },
        { nombre: "Antecedentes penales (30 días)", casilla: "Art. 28", estado: "Completo" },
        { nombre: "Certificado de salud (90 días)", casilla: "Específico", estado: "Incompleto", motivo: "Certificado vencido." },
        { nombre: "Ficha CSS (90 días, 9 cuotas)", casilla: "Específico", estado: "Completo" },
      ],
      recibidoAutomatico: "2026-10-11 10:15",
    },
    error: null,
  });
})(window);

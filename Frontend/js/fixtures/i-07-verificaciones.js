/**
 * Fixture I-07 · Panel de verificación interoperable · escenario base (éxito).
 * Un registro manual asistido por institución y por escenario (OK, SIN_RESULTADO,
 * ERROR_TECNICO, TIMEOUT).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-07", "exito", {
    meta: { pantalla: "I-07", titulo: "Panel de verificación interoperable", escenario: "exito", esquema: "hu-08/v1", nota: "En el MVP la verificación es manual asistida (sin convenios)." },
    data: {
      expediente: "EXP-2026-000184",
      modo: "manual asistido",
      resultados: ["OK", "SIN_RESULTADO", "ERROR_TECNICO", "TIMEOUT"],
      instituciones: ["TE", "CSS", "Registro Público", "SNM"],
      verificaciones: [
        { institucion: "TE", dato: "Identidad del titular", resultado: "OK", valorRetornado: "Coincide — cédula 8-888-8888", fecha: "2026-10-11", referencia: "TE-2026-1187", responsable: "Lic. Pedro Ruiz", evidencia: "constancia-te.pdf" },
        { institucion: "CSS", dato: "Afiliación y 9 cuotas", resultado: "SIN_RESULTADO", valorRetornado: "Sin dato en el sistema", fecha: "2026-10-11", referencia: "CSS-2026-5521", responsable: "Lic. Pedro Ruiz", evidencia: null },
        { institucion: "Registro Público", dato: "Propiedad / estado civil", resultado: "ERROR_TECNICO", valorRetornado: "Servicio no disponible", fecha: "2026-10-11", referencia: "RP-2026-3302", responsable: "Lic. Pedro Ruiz", evidencia: null },
        { institucion: "SNM", dato: "RUEX", resultado: "TIMEOUT", valorRetornado: "Tiempo de espera agotado", fecha: "2026-10-11", referencia: "SNM-2026-0099", responsable: "Lic. Pedro Ruiz", evidencia: null },
      ],
    },
    error: null,
  });
})(window);

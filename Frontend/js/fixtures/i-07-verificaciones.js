/**
 * Fixture I-07 - Panel de verificacion interoperable - escenario base (exito).
 * Alineado con el contrato del backend Sprint 5: estados y resultados minimos.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-07", "exito", {
    meta: { pantalla: "I-07", titulo: "Panel de verificacion interoperable", escenario: "exito", esquema: "hu-08/v1", nota: "En el MVP la verificacion es manual asistida (sin convenios)." },
    data: {
      expediente: "EXP-2026-000184",
      tramite: "Residente temporal",
      modo: "manual asistido",
      verificaciones: [
        {
          id: "demo-v1",
          fuente: "TE",
          tipoVerificacion: "IDENTIDAD",
          modo: "MANUAL_ASISTIDO",
          estado: "RESPONDIDA",
          finalidad: "IDENTIDAD_DEL_TITULAR",
          fechaSolicitud: "2026-10-10T14:00:00Z",
          fechaResultado: "2026-10-11T15:30:00Z",
          resultadoMinimo: "COINCIDE",
          referenciaOrigen: "TE-2026-1187",
          responsableId: "Lic. Pedro Ruiz",
          nota: null,
          intentos: 1,
          proximoIntento: null,
          ultimoFallo: null,
          correlacionId: "corr-demo-1"
        },
        {
          id: "demo-v2",
          fuente: "CSS",
          tipoVerificacion: "AFILIACION",
          modo: "SIMULADO",
          estado: "ERROR_TECNICO",
          finalidad: "AFILIACION_DEL_TITULAR",
          fechaSolicitud: "2026-10-11T14:10:00Z",
          fechaResultado: null,
          resultadoMinimo: null,
          referenciaOrigen: null,
          responsableId: null,
          nota: null,
          intentos: 2,
          proximoIntento: null,
          ultimoFallo: "TIMEOUT",
          correlacionId: "corr-demo-2"
        },
        {
          id: "demo-v3",
          fuente: "REGISTRO_PUBLICO",
          tipoVerificacion: "INFORMACION_REGISTRAL",
          modo: "MANUAL_ASISTIDO",
          estado: "SIN_RESULTADO",
          finalidad: "INFORMACION_REGISTRAL",
          fechaSolicitud: "2026-10-11T15:00:00Z",
          fechaResultado: "2026-10-11T15:20:00Z",
          resultadoMinimo: "SIN_RESULTADO",
          referenciaOrigen: "RP-2026-3302",
          responsableId: "Lic. Pedro Ruiz",
          nota: null,
          intentos: 1,
          proximoIntento: null,
          ultimoFallo: null,
          correlacionId: "corr-demo-3"
        },
        {
          id: "demo-v4",
          fuente: "DOCUMENTO_EXTERIOR",
          tipoVerificacion: "LEGALIZACION",
          modo: "SIMULADO",
          estado: "REINTENTO_PROGRAMADO",
          finalidad: "VIGENCIA_Y_LEGALIZACION",
          fechaSolicitud: "2026-10-11T16:00:00Z",
          fechaResultado: null,
          resultadoMinimo: null,
          referenciaOrigen: null,
          responsableId: null,
          nota: null,
          intentos: 1,
          proximoIntento: "2026-10-12T16:00:00Z",
          ultimoFallo: "RATE_LIMIT",
          correlacionId: "corr-demo-4"
        }
      ]
    },
    error: null
  });
})(window);

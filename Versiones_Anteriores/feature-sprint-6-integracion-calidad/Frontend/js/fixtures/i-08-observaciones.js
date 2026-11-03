/**
 * Fixture I-08 · Emisión y atención de observaciones · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-08", "exito", {
    meta: { pantalla: "I-08", titulo: "Emisión y atención de observaciones", escenario: "exito", esquema: "hu-08/v1", nota: "Observación emitida por recepción, pendiente de atención." },
    data: {
      expediente: "EXP-2026-000159",
      estadoActual: "CON OBSERVACIONES",
      tipos: ["Recepción", "Analista"],
      medios: ["Portal", "Correo", "SMS"],
      items: [
        { id: "o1", texto: "Documento de domicilio ilegible", atendido: false, respuesta: null },
        { id: "o2", texto: "Certificado de salud vencido", atendido: false, respuesta: null },
        { id: "o3", texto: "Firma del formulario incompleta", atendido: false, respuesta: null },
      ],
      historial: [
        { autor: "Recepción · Lic. Ana Gómez", fecha: "2026-10-11", texto: "Se observa documentación incompleta; plazo 10 días.", respuesta: null },
      ],
      plazo: "2026-10-21",
    },
    error: null,
  });
})(window);

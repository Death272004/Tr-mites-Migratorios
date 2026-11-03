/**
 * Fixture I-18 · Salud de las conexiones de interoperabilidad · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-18", "exito", {
    meta: { pantalla: "I-18", titulo: "Salud de conexiones", escenario: "exito", esquema: "hu-08/v1", nota: "MVP sin convenios: métricas de fixture; modo vigente = operación manual con verificación diferida." },
    data: {
      modoActual: "Operación manual con verificación diferida",
      modos: ["Operación normal", "Operación manual con verificación diferida", "Solo lectura"],
      catalogo: [
        { institucion: "TE", endpoint: "https://api.tribunal-electoral.gob.pa/v1", estado: "verde", ultimaRespuesta: "2026-10-11 08:05", latencia: "320 ms", tasaError: "1.2%" },
        { institucion: "SNM", endpoint: "https://snm.gob.pa/servicios/migracion", estado: "ambar", ultimaRespuesta: "2026-10-11 07:40", latencia: "1800 ms", tasaError: "6.5%" },
        { institucion: "Registro Público", endpoint: "https://rp.gob.pa/api/consulta", estado: "rojo", ultimaRespuesta: "2026-10-10 19:10", latencia: "—", tasaError: "42.0%" },
        { institucion: "CSS", endpoint: "https://css.gob.pa/interop", estado: "verde", ultimaRespuesta: "2026-10-11 08:00", latencia: "410 ms", tasaError: "2.1%" },
      ],
    },
    error: null,
  });
})(window);

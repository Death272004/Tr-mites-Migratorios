/**
 * Fixture I-17 · Reportes y tiempos por etapa · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-17", "exito", {
    meta: { pantalla: "I-17", titulo: "Reportes y tiempos por etapa", escenario: "exito", esquema: "hu-08/v1", nota: "Línea base 3–8 meses; meta de reducción POR DEFINIR (PO)." },
    data: {
      periodo: "2026-09-01 a 2026-09-30",
      lineaBase: "3–8 meses",
      metaReduccion: "POR DEFINIR (PO) — medir antes de fijar la meta (§8.1)",
      tiemposPorEtapa: [
        { etapa: "Recepción → Análisis", promedio: "12 días", mediana: "10 días", maximo: "25 días" },
        { etapa: "Análisis → Resolución", promedio: "30 días", mediana: "28 días", maximo: "60 días" },
        { etapa: "Resolución → Entrega", promedio: "15 días", mediana: "12 días", maximo: "30 días" },
      ],
      motivosDemora: [
        { motivo: "Expedientes incompletos", cantidad: 14 },
        { motivo: "Observaciones", cantidad: 9 },
        { motivo: "Verificaciones fallidas", cantidad: 5 },
      ],
      volumenPorTramite: [
        { tramite: "Residente temporal", cantidad: 120 },
        { tramite: "Permiso PM1", cantidad: 64 },
        { tramite: "Naturalización", cantidad: 22 },
      ],
      verificaciones: [
        { institucion: "TE", volumen: 80, exito: "92%" },
        { institucion: "SNM", volumen: 74, exito: "88%" },
        { institucion: "CSS", volumen: 30, exito: "70%" },
      ],
      cumplimientoPlazos: [
        { plazo: "Cambio de nacionalidad (48 h)", cumplidos: 18, total: 20 },
        { plazo: "Corrección de filiación (mismo día)", cumplidos: 8, total: 8 },
      ],
    },
    error: null,
  });
})(window);

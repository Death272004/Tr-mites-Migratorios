/**
 * Fixture I-02 · Tablero de gestión · escenario base (éxito).
 * Indicadores por rol (HU-05). Tiempos sin dato oficial usan línea base 3–8 meses.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-02", "exito", {
    meta: {
      pantalla: "I-02",
      titulo: "Tablero de gestión",
      escenario: "exito",
      esquema: "hu-08/v1",
      nota: "Datos ficticios de demostración. Meta de reducción de tiempos POR DEFINIR (PO).",
    },
    data: {
      indicadores: [
        { label: "Solicitudes recibidas hoy", valor: 12, tono: "info" },
        { label: "En análisis", valor: 34, tono: "info" },
        { label: "Con observaciones pendientes", valor: 7, tono: "warning" },
        { label: "En resolución", valor: 5, tono: "info" },
        { label: "Verificaciones externas fallidas", valor: 3, tono: "danger" },
      ],
      tiempos: [
        { etapa: "Recepción → análisis", promedio: "2.1 d", mediana: "2.0 d", maximo: "5 d" },
        { etapa: "Análisis → resolución", promedio: "18.4 d", mediana: "17.0 d", maximo: "41 d" },
        { etapa: "Resolución → entrega", promedio: "6.2 d", mediana: "5.0 d", maximo: "14 d" },
        { etapa: "Total por trámite", promedio: "26.7 d", mediana: "24.0 d", maximo: "60 d" },
      ],
      contadores: [
        { estado: "RECIBIDO", total: 12 },
        { estado: "EN ANÁLISIS", total: 34 },
        { estado: "CON OBSERVACIONES", total: 7 },
        { estado: "EN RESOLUCIÓN", total: 5 },
        { estado: "RESUELTO", total: 9 },
        { estado: "NOTIFICADO", total: 4 },
        { estado: "ENTREGADO", total: 21 },
        { estado: "ARCHIVADO", total: 6 },
      ],
      alertas: [
        { texto: "3 expedientes vencen su plazo legal hoy.", tono: "warning" },
        { texto: "2 verificaciones externas fallidas requieren reintento (I-07).", tono: "warning" },
        { texto: "1 expediente con observaciones vencidas pasará a ARCHIVADO.", tono: "warning" },
      ],
      nota: "Tiempos referenciales en días. Línea base actual del proceso: 3–8 meses (meta POR DEFINIR, PO).",
    },
    error: null,
  });
})(window);

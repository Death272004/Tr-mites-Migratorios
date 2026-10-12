/**
 * Fixture I-09 · Edictos y publicaciones · escenario base (éxito).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-09", "exito", {
    meta: { pantalla: "I-09", titulo: "Edictos y publicaciones", escenario: "exito", esquema: "hu-08/v1", nota: "Historial inmutable de publicación/retiro." },
    data: {
      expediente: "EXP-2026-000184",
      titular: "María Demo",
      tipos: ["Edicto de admisión", "Oposición", "Notificación"],
      edictos: [
        {
          numero: "EDI-2026-0451",
          tipo: "Edicto de admisión",
          publicacion: "2026-09-22",
          vencimiento: "2026-10-06",
          estado: "Publicado",
          texto: "Se hace saber que se ha admitido a trámite la solicitud de residencia de la persona titular, para que quienes tengan interés puedan oponerse dentro del término legal (texto con datos mínimos, Ley 81).",
          historial: [{ fecha: "2026-09-22", accion: "Publicado" }],
        },
        {
          numero: "EDI-2026-0398",
          tipo: "Notificación",
          publicacion: "2026-09-10",
          vencimiento: "2026-09-24",
          estado: "Retirado",
          texto: "Notificación de requerimiento de documentación.",
          historial: [
            { fecha: "2026-09-10", accion: "Publicado" },
            { fecha: "2026-09-24", accion: "Retirado (historial inmutable)" },
          ],
        },
      ],
    },
    error: null,
  });
})(window);

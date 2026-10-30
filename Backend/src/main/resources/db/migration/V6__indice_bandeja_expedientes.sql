-- Rendimiento (HU-29, TASK-29.4). Hallazgo de la prueba JMeter del Sprint 6: la bandeja del
-- despacho (GET /api/expedientes sin filtros, orden fecha_creacion DESC) recorría y ordenaba la
-- tabla completa en cada consulta, porque los índices existentes empiezan por solicitante_id o
-- estado. Con este índice la página se lee en orden y el costo deja de crecer con la tabla.
CREATE INDEX expediente_fecha_creacion ON expediente (fecha_creacion DESC);

-- Conserva el formulario estructurado enviado desde el asistente P-07 a P-17.
-- Los archivos permanecen en la tabla documento; este JSON solo contiene
-- campos de formulario y resúmenes sin contenido binario.
ALTER TABLE expediente
    ADD COLUMN datos_solicitud JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE expediente
    ADD CONSTRAINT expediente_datos_solicitud_tamano
    CHECK (octet_length(datos_solicitud::text) <= 65536);

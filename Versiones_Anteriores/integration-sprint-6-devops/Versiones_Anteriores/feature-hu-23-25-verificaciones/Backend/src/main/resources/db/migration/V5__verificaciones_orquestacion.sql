-- Orquestación de verificaciones (HU-24, TASK-24.1 y TASK-24.3) y minimización (HU-25).
-- Cambio aditivo: las columnas nuevas guardan datos técnicos, nunca la respuesta de la fuente.

ALTER TABLE verificacion
    ADD COLUMN version            BIGINT      NOT NULL DEFAULT 0,
    ADD COLUMN intentos           INTEGER     NOT NULL DEFAULT 0,
    ADD COLUMN proximo_intento    TIMESTAMPTZ,
    ADD COLUMN ultimo_fallo       VARCHAR(30),
    ADD COLUMN clave_idempotencia VARCHAR(80),
    ADD COLUMN correlacion_id     VARCHAR(64),
    ADD CONSTRAINT verificacion_intentos CHECK (intentos >= 0),
    ADD CONSTRAINT verificacion_reintento CHECK ((estado = 'REINTENTO_PROGRAMADO') = (proximo_intento IS NOT NULL)),
    ADD CONSTRAINT verificacion_ultimo_fallo CHECK (ultimo_fallo IS NULL OR ultimo_fallo IN (
        'ERROR_TECNICO', 'TIEMPO_AGOTADO', 'LIMITE_EXCEDIDO', 'RESPUESTA_INVALIDA')),
    -- Vocabulario cerrado del resultado mínimo: no admite texto libre ni copias de la fuente.
    ADD CONSTRAINT verificacion_resultado_minimo CHECK (resultado_minimo IS NULL OR resultado_minimo IN (
        'COINCIDE', 'NO_COINCIDE', 'VIGENTE', 'NO_VIGENTE', 'CON_REGISTROS', 'SIN_RESULTADO')),
    -- Un fallo técnico nunca deja resultado (CP-07).
    ADD CONSTRAINT verificacion_error_sin_resultado CHECK (
        estado NOT IN ('ERROR_TECNICO', 'REINTENTO_PROGRAMADO') OR resultado_minimo IS NULL);

-- Una misma petición repetida no crea una segunda verificación (CP-08).
CREATE UNIQUE INDEX verificacion_idempotencia ON verificacion (expediente_id, clave_idempotencia)
    WHERE clave_idempotencia IS NOT NULL;

-- Reintentos programados vencidos.
CREATE INDEX verificacion_reintentos ON verificacion (proximo_intento) WHERE estado = 'REINTENTO_PROGRAMADO';

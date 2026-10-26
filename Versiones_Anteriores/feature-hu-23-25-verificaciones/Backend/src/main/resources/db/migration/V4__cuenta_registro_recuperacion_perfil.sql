-- Datos de la cuenta del portal (P-02 registro, P-05 perfil) y recuperación de contraseña (P-04).

-- Las columnas del documento son opcionales: las cuentas del personal del bufete no las llevan.
ALTER TABLE usuario
    ADD COLUMN tipo_documento      VARCHAR(20),
    ADD COLUMN numero_documento    VARCHAR(40),
    ADD COLUMN nacionalidad        VARCHAR(2),
    ADD COLUMN pais_residencia     VARCHAR(2),
    ADD COLUMN telefono            VARCHAR(30),
    ADD COLUMN idioma_notificacion VARCHAR(2)  NOT NULL DEFAULT 'ES',
    ADD COLUMN medio_notificacion  VARCHAR(10) NOT NULL DEFAULT 'CORREO',
    -- Aceptación de términos y autorización de tratamiento de datos (Ley 81): fecha e IP.
    ADD COLUMN terminos_aceptados  TIMESTAMPTZ,
    ADD COLUMN terminos_ip         VARCHAR(45),
    ADD CONSTRAINT usuario_tipo_documento CHECK (tipo_documento IN ('PASAPORTE', 'CEDULA_E', 'CARNE')),
    ADD CONSTRAINT usuario_documento_completo CHECK ((tipo_documento IS NULL) = (numero_documento IS NULL)),
    ADD CONSTRAINT usuario_idioma_notificacion CHECK (idioma_notificacion IN ('ES', 'EN')),
    ADD CONSTRAINT usuario_medio_notificacion CHECK (medio_notificacion IN ('CORREO', 'SMS', 'PUSH'));

CREATE UNIQUE INDEX usuario_documento_unico ON usuario (tipo_documento, numero_documento)
    WHERE numero_documento IS NOT NULL;

-- Igual que en sesion: solo se guarda el hash del token del enlace, nunca el token.
CREATE TABLE recuperacion_contrasena (
    id         UUID        PRIMARY KEY,
    usuario_id UUID        NOT NULL REFERENCES usuario (id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    creada     TIMESTAMPTZ NOT NULL DEFAULT now(),
    expira     TIMESTAMPTZ NOT NULL,
    usada      BOOLEAN     NOT NULL DEFAULT FALSE
);
CREATE INDEX recuperacion_contrasena_usuario ON recuperacion_contrasena (usuario_id);

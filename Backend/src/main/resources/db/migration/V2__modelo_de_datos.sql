-- Modelo de datos del producto (HU-11): entidades del plan de desarrollo §3.4.
-- Integridad con claves foráneas, no nulos, unicidad y valores permitidos.

-- ---------- Usuarios, permisos y sesiones (TASK-11.1, HU-12) ----------
CREATE TABLE usuario (
    id                UUID         PRIMARY KEY,
    nombre            VARCHAR(120) NOT NULL,
    correo            VARCHAR(160) NOT NULL UNIQUE,
    contrasena_hash   VARCHAR(100) NOT NULL,
    rol               VARCHAR(20)  NOT NULL REFERENCES rol (codigo),
    estado_cuenta     VARCHAR(20)  NOT NULL DEFAULT 'ACTIVA',
    intentos_fallidos INT          NOT NULL DEFAULT 0,
    bloqueado_hasta   TIMESTAMPTZ,
    fecha_creacion    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT usuario_correo_minusculas CHECK (correo = lower(correo)),
    CONSTRAINT usuario_estado_cuenta CHECK (estado_cuenta IN ('ACTIVA', 'BLOQUEADA', 'DESHABILITADA'))
);

-- Permisos granulares del personal del bufete: 06-roles-y-accesos.md §6.4.
CREATE TABLE permiso (
    codigo      VARCHAR(20)  PRIMARY KEY,
    descripcion VARCHAR(120) NOT NULL
);

INSERT INTO permiso (codigo, descripcion) VALUES
    ('CONSULTAR', 'Consultar expedientes del ámbito'),
    ('VERIFICAR', 'Registrar verificaciones documentales'),
    ('OBSERVAR',  'Registrar observaciones'),
    ('RESOLVER',  'Cambiar el estado y decidir expedientes'),
    ('NOTIFICAR', 'Notificar resultados');

CREATE TABLE usuario_permiso (
    usuario_id UUID        NOT NULL REFERENCES usuario (id) ON DELETE CASCADE,
    permiso    VARCHAR(20) NOT NULL REFERENCES permiso (codigo),
    PRIMARY KEY (usuario_id, permiso)
);

-- Representación acreditada (P-08): el representante presenta en nombre del titular.
CREATE TABLE representacion (
    id               UUID        PRIMARY KEY,
    representante_id UUID        NOT NULL REFERENCES usuario (id),
    titular_id       UUID        NOT NULL REFERENCES usuario (id),
    tipo             VARCHAR(40) NOT NULL,
    vigente          BOOLEAN     NOT NULL DEFAULT TRUE,
    fecha            TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT representacion_unica UNIQUE (representante_id, titular_id),
    CONSTRAINT representacion_distintos CHECK (representante_id <> titular_id)
);

-- Solo se guarda el hash del token; el token nunca queda en la base ni en los registros.
CREATE TABLE sesion (
    id         UUID        PRIMARY KEY,
    usuario_id UUID        NOT NULL REFERENCES usuario (id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    creada     TIMESTAMPTZ NOT NULL DEFAULT now(),
    expira     TIMESTAMPTZ NOT NULL,
    revocada   BOOLEAN     NOT NULL DEFAULT FALSE
);
CREATE INDEX sesion_usuario ON sesion (usuario_id);

-- ---------- Catálogos (TASK-11.4, TASK-15.2, TASK-17.1) ----------
CREATE TABLE tipo_tramite (
    codigo VARCHAR(40)  PRIMARY KEY,
    nombre VARCHAR(160) NOT NULL,
    activo BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE tipo_documental (
    codigo   VARCHAR(40)  PRIMARY KEY,
    nombre   VARCHAR(160) NOT NULL,
    -- Datos sensibles (salud, antecedentes penales): exigen consentimiento expreso (HU-18b).
    sensible BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE TABLE requisito_tramite (
    tipo_tramite    VARCHAR(40) NOT NULL REFERENCES tipo_tramite (codigo),
    tipo_documental VARCHAR(40) NOT NULL REFERENCES tipo_documental (codigo),
    obligatorio     BOOLEAN     NOT NULL DEFAULT TRUE,
    PRIMARY KEY (tipo_tramite, tipo_documental)
);

-- ---------- Expedientes, historial y documentos (TASK-11.2) ----------
CREATE SEQUENCE expediente_numero_seq;

CREATE TABLE expediente (
    id                  UUID        PRIMARY KEY,
    numero              VARCHAR(20) NOT NULL UNIQUE,
    solicitante_id      UUID        NOT NULL REFERENCES usuario (id),
    creado_por_id       UUID        NOT NULL REFERENCES usuario (id),
    tipo_tramite        VARCHAR(40) NOT NULL REFERENCES tipo_tramite (codigo),
    estado              VARCHAR(30) NOT NULL,
    fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    version             BIGINT      NOT NULL DEFAULT 0,
    CONSTRAINT expediente_estado CHECK (estado IN (
        'BORRADOR', 'PRESENTADO', 'EN_REVISION', 'PENDIENTE_DOCUMENTOS', 'EN_VALIDACION',
        'LISTO_DECISION', 'APROBADO', 'DENEGADO', 'OBSERVADO', 'CANCELADO', 'CERRADO'))
);
-- Listados por titularidad y estado, y bandeja del despacho por estado y fecha (HU-11 CA-5).
CREATE INDEX expediente_solicitante_estado ON expediente (solicitante_id, estado, fecha_creacion DESC);
CREATE INDEX expediente_creado_por ON expediente (creado_por_id);
CREATE INDEX expediente_estado_fecha ON expediente (estado, fecha_creacion DESC);

CREATE TABLE historial_estado (
    id              UUID         PRIMARY KEY,
    expediente_id   UUID         NOT NULL REFERENCES expediente (id),
    estado_anterior VARCHAR(30),
    estado_nuevo    VARCHAR(30)  NOT NULL,
    usuario_id      UUID         NOT NULL REFERENCES usuario (id),
    fecha           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    motivo          VARCHAR(500)
);
CREATE INDEX historial_estado_expediente ON historial_estado (expediente_id, fecha);

CREATE TABLE documento (
    id              UUID         PRIMARY KEY,
    expediente_id   UUID         NOT NULL REFERENCES expediente (id),
    tipo_documental VARCHAR(40)  NOT NULL REFERENCES tipo_documental (codigo),
    nombre_archivo  VARCHAR(255) NOT NULL,
    tipo_mime       VARCHAR(100) NOT NULL,
    tamano_bytes    BIGINT       NOT NULL CHECK (tamano_bytes > 0),
    sha256          VARCHAR(64)  NOT NULL,
    -- Referencia interna al archivo; nunca es un enlace público.
    ruta_almacen    VARCHAR(255) NOT NULL UNIQUE,
    estado_revision VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE',
    cargado_por_id  UUID         NOT NULL REFERENCES usuario (id),
    fecha_carga     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT documento_estado_revision CHECK (estado_revision IN ('PENDIENTE', 'VALIDO', 'RECHAZADO'))
);
CREATE INDEX documento_expediente ON documento (expediente_id, tipo_documental);

CREATE TABLE observacion (
    id            UUID          PRIMARY KEY,
    expediente_id UUID          NOT NULL REFERENCES expediente (id),
    autor_id      UUID          NOT NULL REFERENCES usuario (id),
    fecha         TIMESTAMPTZ   NOT NULL DEFAULT now(),
    texto         VARCHAR(2000) NOT NULL CHECK (length(trim(texto)) > 0)
);
CREATE INDEX observacion_expediente ON observacion (expediente_id, fecha);

-- ---------- Verificación, consentimiento, ARCO (TASK-11.3) ----------
-- Regla de minimización: solo el resultado mínimo (fuente, fecha, resultado, responsable).
-- No hay columnas para copiar el dato devuelto por la fuente.
CREATE TABLE verificacion (
    id                UUID         PRIMARY KEY,
    expediente_id     UUID         NOT NULL REFERENCES expediente (id),
    fuente            VARCHAR(30)  NOT NULL,
    tipo_verificacion VARCHAR(80)  NOT NULL,
    modo              VARCHAR(20)  NOT NULL,
    estado            VARCHAR(30)  NOT NULL,
    finalidad         VARCHAR(300) NOT NULL,
    fecha_solicitud   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    fecha_resultado   TIMESTAMPTZ,
    resultado_minimo  VARCHAR(120),
    referencia_origen VARCHAR(120),
    responsable_id    UUID         REFERENCES usuario (id),
    nota              VARCHAR(500),
    CONSTRAINT verificacion_fuente CHECK (fuente IN ('TE', 'CSS', 'REGISTRO_PUBLICO', 'SNM', 'DOCUMENTO_EXTERIOR')),
    CONSTRAINT verificacion_modo CHECK (modo IN ('MANUAL_ASISTIDO', 'SIMULADO')),
    CONSTRAINT verificacion_estado CHECK (estado IN (
        'PENDIENTE', 'EN_ATENCION', 'ENVIADA', 'RESPONDIDA', 'SIN_RESULTADO', 'ERROR_TECNICO', 'REINTENTO_PROGRAMADO'))
);
CREATE INDEX verificacion_expediente ON verificacion (expediente_id);

CREATE TABLE consentimiento (
    id                UUID         PRIMARY KEY,
    titular_id        UUID         NOT NULL REFERENCES usuario (id),
    responsable       VARCHAR(160) NOT NULL,
    finalidad         VARCHAR(300) NOT NULL,
    alcance           VARCHAR(500) NOT NULL,
    base_legal        VARCHAR(300) NOT NULL,
    fecha             TIMESTAMPTZ  NOT NULL DEFAULT now(),
    vigencia_hasta    DATE,
    estado            VARCHAR(20)  NOT NULL DEFAULT 'VIGENTE',
    expreso           BOOLEAN      NOT NULL DEFAULT FALSE,
    fecha_revocacion  TIMESTAMPTZ,
    registrado_por_id UUID         NOT NULL REFERENCES usuario (id),
    CONSTRAINT consentimiento_estado CHECK (estado IN ('VIGENTE', 'REVOCADO')),
    CONSTRAINT consentimiento_revocacion CHECK ((estado = 'REVOCADO') = (fecha_revocacion IS NOT NULL))
);
CREATE INDEX consentimiento_titular ON consentimiento (titular_id, estado);

CREATE TABLE solicitud_arco (
    id                  UUID          PRIMARY KEY,
    titular_id          UUID          NOT NULL REFERENCES usuario (id),
    tipo                VARCHAR(20)   NOT NULL,
    descripcion         VARCHAR(2000) NOT NULL,
    fecha_creacion      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ   NOT NULL DEFAULT now(),
    estado              VARCHAR(20)   NOT NULL DEFAULT 'RECIBIDA',
    responsable_id      UUID          REFERENCES usuario (id),
    plazo_atencion      DATE          NOT NULL,
    motivo_rechazo      VARCHAR(500),
    CONSTRAINT solicitud_arco_tipo CHECK (tipo IN ('ACCESO', 'RECTIFICACION', 'CANCELACION', 'OPOSICION')),
    CONSTRAINT solicitud_arco_estado CHECK (estado IN ('RECIBIDA', 'EN_ATENCION', 'ATENDIDA', 'RECHAZADA')),
    CONSTRAINT solicitud_arco_rechazo CHECK (estado <> 'RECHAZADA' OR motivo_rechazo IS NOT NULL)
);
CREATE INDEX solicitud_arco_titular ON solicitud_arco (titular_id, fecha_creacion DESC);
CREATE INDEX solicitud_arco_estado_plazo ON solicitud_arco (estado, plazo_atencion);

-- ---------- Notificaciones y auditoría ----------
CREATE TABLE notificacion (
    id              UUID         PRIMARY KEY,
    destinatario_id UUID         NOT NULL REFERENCES usuario (id),
    expediente_id   UUID         REFERENCES expediente (id),
    tipo            VARCHAR(30)  NOT NULL,
    mensaje         VARCHAR(300) NOT NULL,
    fecha           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    leida           BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT notificacion_tipo CHECK (tipo IN (
        'PENDIENTE_DOCUMENTOS', 'OBSERVACION', 'RESULTADO_VERIFICACION', 'DECISION_FINAL',
        'SOLICITUD_ARCO', 'CONSENTIMIENTO_REVOCADO'))
);
CREATE INDEX notificacion_destinatario ON notificacion (destinatario_id, leida, fecha DESC);

-- actor_id sin clave foránea y opcional: un intento de acceso fallido puede no tener usuario.
CREATE TABLE evento_auditoria (
    id             UUID         PRIMARY KEY,
    actor_id       UUID,
    operacion      VARCHAR(60)  NOT NULL,
    recurso        VARCHAR(160) NOT NULL,
    fecha          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    resultado      VARCHAR(20)  NOT NULL,
    correlacion_id VARCHAR(64)  NOT NULL,
    detalle        VARCHAR(300),
    CONSTRAINT evento_auditoria_resultado CHECK (resultado IN ('EXITO', 'DENEGADO', 'FALLO'))
);
CREATE INDEX evento_auditoria_fecha ON evento_auditoria (fecha DESC);
CREATE INDEX evento_auditoria_actor ON evento_auditoria (actor_id, fecha DESC);
CREATE INDEX evento_auditoria_operacion ON evento_auditoria (operacion, fecha DESC);

-- La bitácora es inmutable también en la base de datos (HU-22 CA-3).
CREATE FUNCTION evento_auditoria_inmutable() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Los eventos de auditoría no se modifican ni se eliminan';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER evento_auditoria_inmutable BEFORE UPDATE OR DELETE ON evento_auditoria
FOR EACH ROW EXECUTE FUNCTION evento_auditoria_inmutable();

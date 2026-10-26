-- Datos semilla de catálogos (TASK-11.4, TASK-17.1).
-- Catálogo de ejemplo: los valores oficiales están pendientes del PO (PEN-11 del backlog).
-- Los usuarios de demostración no se crean aquí porque llevan contraseña: los crea el
-- backend al arrancar cuando DEMO_USUARIOS=true (ver DatosDemo).

INSERT INTO tipo_tramite (codigo, nombre) VALUES
    ('RESIDENCIA_TEMPORAL',   'Permiso de residencia temporal'),
    ('RESIDENCIA_PERMANENTE', 'Permiso de residencia permanente'),
    ('PRORROGA_ESTADIA',      'Prórroga de estadía'),
    ('NATURALIZACION',        'Naturalización');

INSERT INTO tipo_documental (codigo, nombre, sensible) VALUES
    ('PASAPORTE',            'Pasaporte vigente',                         FALSE),
    ('FOTO_CARNE',           'Fotografía tamaño carné',                   FALSE),
    ('PODER_NOTARIADO',      'Poder notariado al abogado',                FALSE),
    ('DECLARACION_JURADA',   'Declaración jurada',                        FALSE),
    ('COMPROBANTE_PAGO',     'Comprobante de pago de tasas',              FALSE),
    ('FICHA_CSS',            'Ficha de la Caja de Seguro Social',         FALSE),
    ('CERTIFICADO_SALUD',    'Certificado de salud',                      TRUE),
    ('ANTECEDENTES_PENALES', 'Certificado de antecedentes penales',       TRUE);

INSERT INTO requisito_tramite (tipo_tramite, tipo_documental, obligatorio) VALUES
    ('RESIDENCIA_TEMPORAL',   'PASAPORTE',            TRUE),
    ('RESIDENCIA_TEMPORAL',   'FOTO_CARNE',           TRUE),
    ('RESIDENCIA_TEMPORAL',   'PODER_NOTARIADO',      TRUE),
    ('RESIDENCIA_TEMPORAL',   'CERTIFICADO_SALUD',    TRUE),
    ('RESIDENCIA_TEMPORAL',   'ANTECEDENTES_PENALES', TRUE),
    ('RESIDENCIA_TEMPORAL',   'COMPROBANTE_PAGO',     TRUE),
    ('RESIDENCIA_TEMPORAL',   'DECLARACION_JURADA',   FALSE),
    ('RESIDENCIA_PERMANENTE', 'PASAPORTE',            TRUE),
    ('RESIDENCIA_PERMANENTE', 'FOTO_CARNE',           TRUE),
    ('RESIDENCIA_PERMANENTE', 'PODER_NOTARIADO',      TRUE),
    ('RESIDENCIA_PERMANENTE', 'CERTIFICADO_SALUD',    TRUE),
    ('RESIDENCIA_PERMANENTE', 'ANTECEDENTES_PENALES', TRUE),
    ('RESIDENCIA_PERMANENTE', 'FICHA_CSS',            TRUE),
    ('RESIDENCIA_PERMANENTE', 'COMPROBANTE_PAGO',     TRUE),
    ('PRORROGA_ESTADIA',      'PASAPORTE',            TRUE),
    ('PRORROGA_ESTADIA',      'COMPROBANTE_PAGO',     TRUE),
    ('PRORROGA_ESTADIA',      'DECLARACION_JURADA',   FALSE),
    ('NATURALIZACION',        'PASAPORTE',            TRUE),
    ('NATURALIZACION',        'FOTO_CARNE',           TRUE),
    ('NATURALIZACION',        'ANTECEDENTES_PENALES', TRUE),
    ('NATURALIZACION',        'FICHA_CSS',            TRUE),
    ('NATURALIZACION',        'DECLARACION_JURADA',   TRUE),
    ('NATURALIZACION',        'COMPROBANTE_PAGO',     TRUE);

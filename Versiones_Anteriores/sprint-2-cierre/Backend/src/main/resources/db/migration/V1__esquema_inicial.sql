-- Esquema inicial (HU-10, TASK-10.3).
-- Catálogo de roles técnicos del sistema: 06-roles-y-accesos.md §6.3.1.
-- El resto del modelo de datos se agrega en la HU-11 con nuevas migraciones.

CREATE TABLE rol (
    codigo      VARCHAR(20)  PRIMARY KEY,
    descripcion VARCHAR(120) NOT NULL
);

INSERT INTO rol (codigo, descripcion) VALUES
    ('SOLICITANTE', 'Cliente del bufete (titular)'),
    ('FUNCIONARIO', 'Personal del bufete'),
    ('SUPERVISOR',  'Socio director o coordinador'),
    ('AUDITOR',     'Auditoría del despacho'),
    ('ADMIN',       'Administrador del bufete');

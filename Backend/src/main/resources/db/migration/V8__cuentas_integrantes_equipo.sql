-- Cuentas del equipo del proyecto.
-- Las contraseñas iniciales siguen el formato nombre.apellido y solo se
-- almacenan como hash BCrypt. Deben cambiarse en un entorno real.
-- Kenneth queda como ADMIN; las demás cuentas empiezan como SOLICITANTE.

DELETE FROM sesion
WHERE usuario_id IN (
    SELECT id FROM usuario
    WHERE correo IN (
        'cliente@demo.pa', 'cliente2@demo.pa', 'abogado@demo.pa',
        'demo@bufete.test', 'recepcion@demo.pa', 'analista@demo.pa',
        'resolutor@demo.pa', 'supervisor@demo.pa', 'auditor@demo.pa',
        'admin@demo.pa'
    )
);

DELETE FROM recuperacion_contrasena
WHERE usuario_id IN (
    SELECT id FROM usuario
    WHERE correo IN (
        'cliente@demo.pa', 'cliente2@demo.pa', 'abogado@demo.pa',
        'demo@bufete.test', 'recepcion@demo.pa', 'analista@demo.pa',
        'resolutor@demo.pa', 'supervisor@demo.pa', 'auditor@demo.pa',
        'admin@demo.pa'
    )
);

DELETE FROM usuario_permiso
WHERE usuario_id IN (
    SELECT id FROM usuario
    WHERE correo IN (
        'cliente@demo.pa', 'cliente2@demo.pa', 'abogado@demo.pa',
        'demo@bufete.test', 'recepcion@demo.pa', 'analista@demo.pa',
        'resolutor@demo.pa', 'supervisor@demo.pa', 'auditor@demo.pa',
        'admin@demo.pa'
    )
);

DELETE FROM representacion
WHERE representante_id IN (SELECT id FROM usuario WHERE correo = 'abogado@demo.pa')
   OR titular_id IN (SELECT id FROM usuario WHERE correo = 'cliente@demo.pa');

UPDATE usuario
SET nombre = 'Kenneth Carter', correo = 'kenneth.carter@tr-utp.com',
    contrasena_hash = '$2a$10$sBLKDnDG1gEKw/iBcQaOxej.17Az.3bYxtehGXBxRL0fxVBEfYw/G',
    rol = 'ADMIN', estado_cuenta = 'ACTIVA', intentos_fallidos = 0, bloqueado_hasta = NULL
WHERE correo = 'cliente@demo.pa';

UPDATE usuario
SET nombre = 'Richard Rodriguez', correo = 'richard.rodriguez@tr-utp.com',
    contrasena_hash = '$2a$10$kM/vSy/hAHFeE0BC1LrIOuKoul69m5IFsZ.ojAZw9PnybyznRk9dS',
    rol = 'SOLICITANTE', estado_cuenta = 'ACTIVA', intentos_fallidos = 0, bloqueado_hasta = NULL
WHERE correo = 'cliente2@demo.pa';

UPDATE usuario
SET nombre = 'Edgar Rosario', correo = 'edgar.rosario@tr-utp.com',
    contrasena_hash = '$2a$10$XrIhhoMQct8nM7ucGT/CrOYIg/p2H8k7Hj8Q2MLIfv7BI1wBPY0r.',
    rol = 'SOLICITANTE', estado_cuenta = 'ACTIVA', intentos_fallidos = 0, bloqueado_hasta = NULL
WHERE correo = 'abogado@demo.pa';

UPDATE usuario
SET nombre = 'Jonathan Gomez', correo = 'jonathan.gomez@tr-utp.com',
    contrasena_hash = '$2a$10$xH2eRlxu9BPjRMsxPmaMyuzULOZUclS/p2KS6j5PNB1AHpYHaTTim',
    rol = 'SOLICITANTE', estado_cuenta = 'ACTIVA', intentos_fallidos = 0, bloqueado_hasta = NULL
WHERE correo = 'demo@bufete.test';

UPDATE usuario
SET nombre = 'Vivian Paris', correo = 'vivian.paris@tr-utp.com',
    contrasena_hash = '$2a$10$pdAysbzZdKUe0GIyqSCGwOrkr7eiHDCFfShYuafPn5kpVLIwbGz4W',
    rol = 'SOLICITANTE', estado_cuenta = 'ACTIVA', intentos_fallidos = 0, bloqueado_hasta = NULL
WHERE correo = 'recepcion@demo.pa';

UPDATE usuario
SET nombre = 'Daniela Anaya', correo = 'daniela.anaya@tr-utp.com',
    contrasena_hash = '$2a$10$YLx/3Reog/uPG.DkMoGdwOAiaF1NprtKLI.hlvzHbKGeD1h5YnQgW',
    rol = 'SOLICITANTE', estado_cuenta = 'ACTIVA', intentos_fallidos = 0, bloqueado_hasta = NULL
WHERE correo = 'analista@demo.pa';

UPDATE usuario
SET nombre = 'Edwin Cisnero', correo = 'edwin.cisnero@tr-utp.com',
    contrasena_hash = '$2a$10$l.7vc/kbK8UiW2mPmiizHuf2hNdPoyM3feNXiFvlBcknq2lSdX2/S',
    rol = 'SOLICITANTE', estado_cuenta = 'ACTIVA', intentos_fallidos = 0, bloqueado_hasta = NULL
WHERE correo = 'resolutor@demo.pa';

UPDATE usuario
SET nombre = 'Leonardo Liang', correo = 'leonardo.liang@tr-utp.com',
    contrasena_hash = '$2a$10$jGCWsBqg0apdDzPg9nrNXuhA592JYqHxUJLtTKv29mqYQvcSADR0S',
    rol = 'SOLICITANTE', estado_cuenta = 'ACTIVA', intentos_fallidos = 0, bloqueado_hasta = NULL
WHERE correo = 'supervisor@demo.pa';

UPDATE usuario
SET nombre = 'Javier Pravia', correo = 'javier.pravia@tr-utp.com',
    contrasena_hash = '$2a$10$/AALRfbOr7u1QEjJnCGgVOgmDSrBBMUQoEl2UUq50YfwEsvjLjLUG',
    rol = 'SOLICITANTE', estado_cuenta = 'ACTIVA', intentos_fallidos = 0, bloqueado_hasta = NULL
WHERE correo = 'auditor@demo.pa';

-- La décima cuenta semilla no corresponde a un integrante: se conserva su
-- fila solo para no romper referencias históricas y queda inutilizable.
UPDATE usuario
SET nombre = 'Cuenta archivada', correo = 'cuenta.archivada@tr-utp.com',
    contrasena_hash = '$2a$10$sBLKDnDG1gEKw/iBcQaOxej.17Az.3bYxtehGXBxRL0fxVBEfYw/G',
    rol = 'SOLICITANTE', estado_cuenta = 'DESHABILITADA', intentos_fallidos = 0, bloqueado_hasta = NULL
WHERE correo = 'admin@demo.pa';

INSERT INTO usuario_permiso (usuario_id, permiso)
SELECT id, 'PORTAL' FROM usuario
WHERE correo IN (
    'richard.rodriguez@tr-utp.com', 'edgar.rosario@tr-utp.com',
    'jonathan.gomez@tr-utp.com', 'vivian.paris@tr-utp.com',
    'daniela.anaya@tr-utp.com', 'edwin.cisnero@tr-utp.com',
    'leonardo.liang@tr-utp.com', 'javier.pravia@tr-utp.com'
)
ON CONFLICT (usuario_id, permiso) DO NOTHING;

INSERT INTO usuario_permiso (usuario_id, permiso)
SELECT id, permiso
FROM usuario
CROSS JOIN (VALUES ('CONSULTAR'), ('ADMINISTRAR')) AS permisos(permiso)
WHERE correo = 'kenneth.carter@tr-utp.com'
ON CONFLICT (usuario_id, permiso) DO NOTHING;

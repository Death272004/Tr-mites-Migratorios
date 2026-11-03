-- Distribución funcional de las cuentas del equipo.
-- Kenneth conserva la administración; las demás cuentas reciben el rol
-- correspondiente a su responsabilidad dentro del proyecto.

UPDATE usuario
SET rol = CASE correo
    WHEN 'kenneth.carter@tr-utp.com' THEN 'ADMIN'
    WHEN 'richard.rodriguez@tr-utp.com' THEN 'SUPERVISOR'
    WHEN 'edgar.rosario@tr-utp.com' THEN 'FUNCIONARIO'
    WHEN 'jonathan.gomez@tr-utp.com' THEN 'FUNCIONARIO'
    WHEN 'vivian.paris@tr-utp.com' THEN 'AUDITOR'
    WHEN 'daniela.anaya@tr-utp.com' THEN 'SOLICITANTE'
    WHEN 'edwin.cisnero@tr-utp.com' THEN 'SOLICITANTE'
    WHEN 'leonardo.liang@tr-utp.com' THEN 'SOLICITANTE'
    WHEN 'javier.pravia@tr-utp.com' THEN 'SOLICITANTE'
    WHEN 'yomayri2911@gmail.com' THEN 'SOLICITANTE'
    ELSE rol
END
WHERE correo IN (
    'kenneth.carter@tr-utp.com', 'richard.rodriguez@tr-utp.com',
    'edgar.rosario@tr-utp.com', 'jonathan.gomez@tr-utp.com',
    'vivian.paris@tr-utp.com', 'daniela.anaya@tr-utp.com',
    'edwin.cisnero@tr-utp.com', 'leonardo.liang@tr-utp.com',
    'javier.pravia@tr-utp.com', 'yomayri2911@gmail.com'
);

DELETE FROM usuario_permiso
WHERE usuario_id IN (
    SELECT id FROM usuario WHERE correo IN (
        'kenneth.carter@tr-utp.com', 'richard.rodriguez@tr-utp.com',
        'edgar.rosario@tr-utp.com', 'jonathan.gomez@tr-utp.com',
        'vivian.paris@tr-utp.com', 'daniela.anaya@tr-utp.com',
        'edwin.cisnero@tr-utp.com', 'leonardo.liang@tr-utp.com',
        'javier.pravia@tr-utp.com', 'yomayri2911@gmail.com'
    )
);

INSERT INTO usuario_permiso (usuario_id, permiso)
SELECT u.id, p.permiso
FROM usuario u
JOIN (VALUES
    ('kenneth.carter@tr-utp.com', 'CONSULTAR'),
    ('kenneth.carter@tr-utp.com', 'ADMINISTRAR'),
    ('richard.rodriguez@tr-utp.com', 'CONSULTAR'),
    ('richard.rodriguez@tr-utp.com', 'REPORTAR'),
    ('edgar.rosario@tr-utp.com', 'CONSULTAR'),
    ('edgar.rosario@tr-utp.com', 'VERIFICAR'),
    ('edgar.rosario@tr-utp.com', 'OBSERVAR'),
    ('edgar.rosario@tr-utp.com', 'RESOLVER'),
    ('edgar.rosario@tr-utp.com', 'NOTIFICAR'),
    ('jonathan.gomez@tr-utp.com', 'CONSULTAR'),
    ('jonathan.gomez@tr-utp.com', 'VERIFICAR'),
    ('jonathan.gomez@tr-utp.com', 'OBSERVAR'),
    ('jonathan.gomez@tr-utp.com', 'RESOLVER'),
    ('jonathan.gomez@tr-utp.com', 'NOTIFICAR'),
    ('vivian.paris@tr-utp.com', 'CONSULTAR'),
    ('vivian.paris@tr-utp.com', 'AUDITAR'),
    ('vivian.paris@tr-utp.com', 'REPORTAR'),
    ('daniela.anaya@tr-utp.com', 'PORTAL'),
    ('edwin.cisnero@tr-utp.com', 'PORTAL'),
    ('leonardo.liang@tr-utp.com', 'PORTAL'),
    ('javier.pravia@tr-utp.com', 'PORTAL'),
    ('yomayri2911@gmail.com', 'PORTAL')
) AS p(correo, permiso) ON p.correo = u.correo;

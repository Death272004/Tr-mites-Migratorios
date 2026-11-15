-- Datos de cuenta ficticios para probar el autorrellenado con la sesión actual.
-- No son credenciales ni datos de personas reales.
UPDATE usuario
SET tipo_documento = CASE correo
        WHEN 'daniela.anaya@tr-utp.com' THEN 'PASAPORTE'
        WHEN 'edwin.cisnero@tr-utp.com' THEN 'PASAPORTE'
        WHEN 'leonardo.liang@tr-utp.com' THEN 'PASAPORTE'
        WHEN 'javier.pravia@tr-utp.com' THEN 'CEDULA_E'
        ELSE tipo_documento
    END,
    numero_documento = CASE correo
        WHEN 'daniela.anaya@tr-utp.com' THEN 'CO-DEMO-1001'
        WHEN 'edwin.cisnero@tr-utp.com' THEN 'VE-DEMO-1002'
        WHEN 'leonardo.liang@tr-utp.com' THEN 'US-DEMO-1003'
        WHEN 'javier.pravia@tr-utp.com' THEN '8-DEMO-1004'
        ELSE numero_documento
    END,
    nacionalidad = CASE correo
        WHEN 'daniela.anaya@tr-utp.com' THEN 'CO'
        WHEN 'edwin.cisnero@tr-utp.com' THEN 'VE'
        WHEN 'leonardo.liang@tr-utp.com' THEN 'US'
        WHEN 'javier.pravia@tr-utp.com' THEN 'PA'
        ELSE nacionalidad
    END,
    pais_residencia = CASE correo
        WHEN 'daniela.anaya@tr-utp.com' THEN 'PA'
        WHEN 'edwin.cisnero@tr-utp.com' THEN 'PA'
        WHEN 'leonardo.liang@tr-utp.com' THEN 'PA'
        WHEN 'javier.pravia@tr-utp.com' THEN 'PA'
        ELSE pais_residencia
    END,
    telefono = CASE correo
        WHEN 'daniela.anaya@tr-utp.com' THEN '+507 6000-1001'
        WHEN 'edwin.cisnero@tr-utp.com' THEN '+507 6000-1002'
        WHEN 'leonardo.liang@tr-utp.com' THEN '+507 6000-1003'
        WHEN 'javier.pravia@tr-utp.com' THEN '+507 6000-1004'
        ELSE telefono
    END
WHERE correo IN (
    'daniela.anaya@tr-utp.com',
    'edwin.cisnero@tr-utp.com',
    'leonardo.liang@tr-utp.com',
    'javier.pravia@tr-utp.com'
);

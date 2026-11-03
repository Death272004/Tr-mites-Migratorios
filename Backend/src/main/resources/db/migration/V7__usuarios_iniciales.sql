-- Cuentas iniciales del entorno local (10 usuarios).
-- La contraseña común de desarrollo es Demo-Tramites-2026; aquí solo se guarda
-- su hash BCrypt. Debe cambiarse antes de usar un entorno real.

INSERT INTO usuario (id, nombre, correo, contrasena_hash, rol)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'Carla Cliente (demo)',       'cliente@demo.pa',       '$2a$10$WoTUFvDxr21DmFlGZH2yd.hyaxvgsgj3FpA7p6jKLad6.0gQTiIdC', 'SOLICITANTE'),
    ('10000000-0000-0000-0000-000000000002', 'Tomás Titular (demo)',       'cliente2@demo.pa',      '$2a$10$WoTUFvDxr21DmFlGZH2yd.hyaxvgsgj3FpA7p6jKLad6.0gQTiIdC', 'SOLICITANTE'),
    ('10000000-0000-0000-0000-000000000003', 'Ana Abogada (demo)',         'abogado@demo.pa',      '$2a$10$WoTUFvDxr21DmFlGZH2yd.hyaxvgsgj3FpA7p6jKLad6.0gQTiIdC', 'SOLICITANTE'),
    ('10000000-0000-0000-0000-000000000004', 'María Demo',                  'demo@bufete.test',     '$2a$10$WoTUFvDxr21DmFlGZH2yd.hyaxvgsgj3FpA7p6jKLad6.0gQTiIdC', 'SOLICITANTE'),
    ('10000000-0000-0000-0000-000000000005', 'Rita Recepción (demo)',      'recepcion@demo.pa',    '$2a$10$WoTUFvDxr21DmFlGZH2yd.hyaxvgsgj3FpA7p6jKLad6.0gQTiIdC', 'FUNCIONARIO'),
    ('10000000-0000-0000-0000-000000000006', 'Andrés Analista (demo)',     'analista@demo.pa',    '$2a$10$WoTUFvDxr21DmFlGZH2yd.hyaxvgsgj3FpA7p6jKLad6.0gQTiIdC', 'FUNCIONARIO'),
    ('10000000-0000-0000-0000-000000000007', 'Rosa Resolutora (demo)',     'resolutor@demo.pa',   '$2a$10$WoTUFvDxr21DmFlGZH2yd.hyaxvgsgj3FpA7p6jKLad6.0gQTiIdC', 'FUNCIONARIO'),
    ('10000000-0000-0000-0000-000000000008', 'Sara Supervisora (demo)',    'supervisor@demo.pa',  '$2a$10$WoTUFvDxr21DmFlGZH2yd.hyaxvgsgj3FpA7p6jKLad6.0gQTiIdC', 'SUPERVISOR'),
    ('10000000-0000-0000-0000-000000000009', 'Aurelio Auditor (demo)',     'auditor@demo.pa',     '$2a$10$WoTUFvDxr21DmFlGZH2yd.hyaxvgsgj3FpA7p6jKLad6.0gQTiIdC', 'AUDITOR'),
    ('10000000-0000-0000-0000-000000000010', 'Alma Administradora (demo)', 'admin@demo.pa',       '$2a$10$WoTUFvDxr21DmFlGZH2yd.hyaxvgsgj3FpA7p6jKLad6.0gQTiIdC', 'ADMIN')
ON CONFLICT (correo) DO NOTHING;

INSERT INTO usuario_permiso (usuario_id, permiso)
SELECT u.id, p.permiso
FROM (VALUES
    ('cliente@demo.pa', 'PORTAL'),
    ('cliente2@demo.pa', 'PORTAL'),
    ('abogado@demo.pa', 'PORTAL'),
    ('demo@bufete.test', 'PORTAL'),
    ('recepcion@demo.pa', 'CONSULTAR'),
    ('recepcion@demo.pa', 'VERIFICAR'),
    ('recepcion@demo.pa', 'OBSERVAR'),
    ('analista@demo.pa', 'CONSULTAR'),
    ('analista@demo.pa', 'VERIFICAR'),
    ('analista@demo.pa', 'OBSERVAR'),
    ('resolutor@demo.pa', 'CONSULTAR'),
    ('resolutor@demo.pa', 'VERIFICAR'),
    ('resolutor@demo.pa', 'RESOLVER'),
    ('resolutor@demo.pa', 'NOTIFICAR'),
    ('supervisor@demo.pa', 'CONSULTAR'),
    ('supervisor@demo.pa', 'REPORTAR'),
    ('auditor@demo.pa', 'CONSULTAR'),
    ('auditor@demo.pa', 'AUDITAR'),
    ('auditor@demo.pa', 'REPORTAR'),
    ('admin@demo.pa', 'CONSULTAR'),
    ('admin@demo.pa', 'ADMINISTRAR')
) AS p(correo, permiso)
JOIN usuario u ON u.correo = p.correo
ON CONFLICT (usuario_id, permiso) DO NOTHING;

INSERT INTO representacion (id, representante_id, titular_id, tipo)
SELECT '20000000-0000-0000-0000-000000000001', representante.id, titular.id, 'PODER_NOTARIADO'
FROM usuario representante
JOIN usuario titular ON titular.correo = 'cliente@demo.pa'
WHERE representante.correo = 'abogado@demo.pa'
ON CONFLICT (representante_id, titular_id) DO NOTHING;

-- Área institucional para cuentas internas. Conserva los cinco roles técnicos:
-- FUNCIONARIO + área distingue al personal del bufete de RP, CSS y TE.
ALTER TABLE usuario
    ADD COLUMN area_institucional VARCHAR(20) NOT NULL DEFAULT 'BUFETE';

ALTER TABLE usuario
    ADD CONSTRAINT usuario_area_institucional_valida
    CHECK (area_institucional IN ('BUFETE', 'RP', 'CSS', 'TE'));

-- Las cuentas existentes pertenecen al bufete. Estas tres cuentas son solo
-- perfiles ficticios para probar el flujo de verificación restringida.
INSERT INTO usuario (id, nombre, correo, contrasena_hash, rol, estado_cuenta, area_institucional, demo_autocompletable)
VALUES
    ('10000000-0000-0000-0000-000000000011', 'Pasante Registro Público (demo)', 'pasante.rp@tr-utp.com',
     '$2a$10$WoTUFvDxr21DmFlGZH2yd.hyaxvgsgj3FpA7p6jKLad6.0gQTiIdC', 'FUNCIONARIO', 'ACTIVA', 'RP', TRUE),
    ('10000000-0000-0000-0000-000000000012', 'Pasante CSS (demo)', 'pasante.css@tr-utp.com',
     '$2a$10$WoTUFvDxr21DmFlGZH2yd.hyaxvgsgj3FpA7p6jKLad6.0gQTiIdC', 'FUNCIONARIO', 'ACTIVA', 'CSS', TRUE),
    ('10000000-0000-0000-0000-000000000013', 'Pasante Tribunal Electoral (demo)', 'pasante.te@tr-utp.com',
     '$2a$10$WoTUFvDxr21DmFlGZH2yd.hyaxvgsgj3FpA7p6jKLad6.0gQTiIdC', 'FUNCIONARIO', 'ACTIVA', 'TE', TRUE)
ON CONFLICT (correo) DO UPDATE
SET area_institucional = EXCLUDED.area_institucional,
    rol = EXCLUDED.rol,
    estado_cuenta = EXCLUDED.estado_cuenta,
    demo_autocompletable = TRUE;

INSERT INTO usuario_permiso (usuario_id, permiso)
SELECT u.id, p.permiso
FROM usuario u
CROSS JOIN (VALUES ('CONSULTAR'), ('VERIFICAR'), ('OBSERVAR')) AS p(permiso)
WHERE u.correo IN ('pasante.rp@tr-utp.com', 'pasante.css@tr-utp.com', 'pasante.te@tr-utp.com')
ON CONFLICT (usuario_id, permiso) DO NOTHING;

-- Clasifica las cuentas del portal y marca las cuentas ficticias que puede usar
-- el botón de autocompletado durante la demostración local.
ALTER TABLE usuario
    ADD COLUMN tipo_solicitante VARCHAR(32),
    ADD COLUMN demo_autocompletable BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE usuario
    ADD CONSTRAINT usuario_tipo_solicitante_valido
    CHECK (tipo_solicitante IS NULL OR tipo_solicitante IN (
        'TURISTA', 'PASANTE_BUFETE', 'MIGRANTE_INDEPENDIENTE', 'NACIONAL'
    ));

UPDATE usuario
SET tipo_solicitante = CASE correo
        WHEN 'daniela.anaya@tr-utp.com' THEN 'TURISTA'
        WHEN 'edwin.cisnero@tr-utp.com' THEN 'PASANTE_BUFETE'
        WHEN 'leonardo.liang@tr-utp.com' THEN 'MIGRANTE_INDEPENDIENTE'
        WHEN 'javier.pravia@tr-utp.com' THEN 'NACIONAL'
        WHEN 'yomayri.martinez@tr-utp.com' THEN 'NACIONAL'
        ELSE tipo_solicitante
    END,
    demo_autocompletable = TRUE
WHERE correo IN (
    'kenneth.carter@tr-utp.com',
    'richard.rodriguez@tr-utp.com',
    'edgar.rosario@tr-utp.com',
    'jonathan.gomez@tr-utp.com',
    'vivian.paris@tr-utp.com',
    'daniela.anaya@tr-utp.com',
    'edwin.cisnero@tr-utp.com',
    'leonardo.liang@tr-utp.com',
    'javier.pravia@tr-utp.com',
    'yomayri.martinez@tr-utp.com'
);

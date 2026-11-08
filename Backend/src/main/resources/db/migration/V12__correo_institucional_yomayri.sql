-- Unifica la décima cuenta con el dominio institucional local.
-- La contraseña inicial es yomayri.martinez y solo se almacena como BCrypt.
UPDATE usuario
SET nombre = 'Yomayri Martinez',
    correo = 'yomayri.martinez@tr-utp.com',
    contrasena_hash = '$2y$10$JhN9KsJVehEByXV3d1.NluOtiYXii9w4k5msGCuKxpgDPCjlofsH2',
    rol = 'SOLICITANTE',
    estado_cuenta = 'ACTIVA',
    intentos_fallidos = 0,
    bloqueado_hasta = NULL
WHERE lower(correo) = 'yomayri2911@gmail.com';

-- Conserva el restablecimiento solicitado para la cuenta de Yomayri.
-- La contraseña en texto claro nunca se almacena en la base de datos.
UPDATE usuario
SET contrasena_hash = '$2a$10$nk591ztwGNNrJHgDbbkaFeJAiJaec3NNMLLq.XZewQQBlbtSexiJa',
    intentos_fallidos = 0,
    bloqueado_hasta = NULL,
    estado_cuenta = 'ACTIVA'
WHERE lower(correo) = 'yomayri2911@gmail.com';

-- Restablece la contraseña inicial de la cuenta de Yomayri.
-- Solo se almacena el hash BCrypt; la contraseña no se guarda en texto plano.
UPDATE usuario
SET contrasena_hash = '$2a$10$nk591ztwGNNrJHgDbbkaFeJAiJaec3NNMLLq.XZewQQBlbtSexiJa',
    intentos_fallidos = 0,
    bloqueado_hasta = NULL
WHERE correo = 'yomayri2911@gmail.com';

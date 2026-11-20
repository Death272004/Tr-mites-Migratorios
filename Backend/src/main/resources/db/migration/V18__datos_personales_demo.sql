ALTER TABLE usuario ADD COLUMN sexo VARCHAR(1), ADD COLUMN estado_civil VARCHAR(20);

-- Completa únicamente las cuentas ficticias oficiales; no inventa datos de cuentas reales.
UPDATE usuario SET primer_nombre='Daniela', segundo_nombre=NULL, primer_apellido='Anaya', segundo_apellido=NULL, fecha_nacimiento='1990-05-14', sexo='F', estado_civil='SOLTERO' WHERE correo='daniela.anaya@tr-utp.com';
UPDATE usuario SET primer_nombre='Edwin', segundo_nombre=NULL, primer_apellido='Cisnero', segundo_apellido=NULL, fecha_nacimiento='1991-08-22', sexo='M', estado_civil='SOLTERO' WHERE correo='edwin.cisnero@tr-utp.com';
UPDATE usuario SET primer_nombre='Leonardo', segundo_nombre=NULL, primer_apellido='Liang', segundo_apellido=NULL, fecha_nacimiento='1990-05-14', sexo='M', estado_civil='SOLTERO' WHERE correo='leonardo.liang@tr-utp.com';
UPDATE usuario SET primer_nombre='Javier', segundo_nombre=NULL, primer_apellido='Pravia', segundo_apellido=NULL, fecha_nacimiento='1988-03-10', sexo='M', estado_civil='CASADO' WHERE correo='javier.pravia@tr-utp.com';
UPDATE usuario SET primer_nombre='Carla', segundo_nombre=NULL, primer_apellido='Cliente', segundo_apellido=NULL, fecha_nacimiento='1992-06-12', sexo='F', estado_civil='SOLTERO' WHERE correo='cliente@demo.pa';
UPDATE usuario SET primer_nombre='Tomas', segundo_nombre=NULL, primer_apellido='Titular', segundo_apellido=NULL, fecha_nacimiento='1987-11-03', sexo='M', estado_civil='CASADO' WHERE correo='cliente2@demo.pa';
UPDATE usuario SET primer_nombre='Ana', segundo_nombre=NULL, primer_apellido='Abogada', segundo_apellido=NULL, fecha_nacimiento='1985-02-20', sexo='F', estado_civil='CASADO' WHERE correo='abogado@demo.pa';

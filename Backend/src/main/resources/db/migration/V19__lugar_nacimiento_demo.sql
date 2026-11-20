ALTER TABLE usuario ADD COLUMN lugar_nacimiento VARCHAR(120);

UPDATE usuario SET segundo_apellido='Vega', lugar_nacimiento='Bogotá' WHERE correo='daniela.anaya@tr-utp.com';
UPDATE usuario SET segundo_apellido='Gómez', lugar_nacimiento='Caracas' WHERE correo='edwin.cisnero@tr-utp.com';
UPDATE usuario SET segundo_apellido='Chen', lugar_nacimiento='Ciudad de Panamá' WHERE correo='leonardo.liang@tr-utp.com';
UPDATE usuario SET segundo_apellido='Pérez', lugar_nacimiento='Ciudad de Panamá' WHERE correo='javier.pravia@tr-utp.com';
UPDATE usuario SET segundo_apellido='Vega', lugar_nacimiento='Ciudad de Panamá' WHERE correo='cliente@demo.pa';
UPDATE usuario SET segundo_apellido='Soto', lugar_nacimiento='Ciudad de Panamá' WHERE correo='cliente2@demo.pa';
UPDATE usuario SET segundo_apellido='Ríos', lugar_nacimiento='Ciudad de Panamá' WHERE correo='abogado@demo.pa';

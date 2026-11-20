-- Datos separados para autocompletar P-09 sin inferir apellidos desde un campo libre.
ALTER TABLE usuario
    ADD COLUMN primer_nombre VARCHAR(60),
    ADD COLUMN segundo_nombre VARCHAR(60),
    ADD COLUMN primer_apellido VARCHAR(60),
    ADD COLUMN segundo_apellido VARCHAR(60),
    ADD COLUMN fecha_nacimiento DATE;

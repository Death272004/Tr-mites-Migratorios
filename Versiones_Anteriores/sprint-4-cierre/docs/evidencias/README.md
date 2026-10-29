# Evidencias de validación

Esta carpeta conserva evidencias pequeñas, reproducibles y revisables del
proyecto. No debe convertirse en un depósito de archivos temporales.

## Qué se puede guardar

- informes de OWASP ZAP y Apache JMeter;
- resultados de pruebas y cobertura;
- capturas de arranque, healthchecks y flujos aprobados;
- matrices de verificación y registros de instalación limpia;
- un archivo Markdown que indique fecha, commit probado, comandos y resultado.

## Reglas

1. Usar datos ficticios exclusivamente.
2. Eliminar tokens, contraseñas, cookies, documentos y datos personales antes de
   guardar cualquier archivo.
3. Nombrar los archivos con `sprint`, propósito y fecha, por ejemplo:
   `sprint-2-arranque-2026-10-12.md`.
4. No guardar `node_modules`, builds, bases de datos, volúmenes, volcados ni
   archivos generados innecesarios.
5. Cada evidencia debe indicar el commit o rama que se probó.

La evidencia de una prueba no sustituye al resultado de la prueba: debe poder
repetirse siguiendo los comandos documentados.

# Evidencia TASK-31.2 y TASK-31.3

**Fecha de ejecución:** 2026-11-19
**Entorno:** equipo local conectado, Docker y PostgreSQL disponibles.
**Comando:** `./Backend/mvnw -f Backend/pom.xml test`

## TASK-31.2

Se ejecutó la suite automatizada del backend para validar autenticación, autorización, modelo, adaptadores de verificación y contratos.

## TASK-31.3

Se repitió la suite completa como regresión sobre el estado actual del proyecto.

## Resultado

- Tests run: 152
- Failures: 0
- Errors: 0
- Skipped: 0
- Resultado Maven: BUILD SUCCESS
- Tiempo total registrado: 01:20 min

## Evidencia reproducible

El resultado completo quedó registrado durante la ejecución de Maven en `/tmp/sprint7-tests.log` del equipo local. La salida final contiene `BUILD SUCCESS` y los contadores anteriores.

## Alcance pendiente

Esta evidencia cubre la suite automatizada del backend. Aún deben agregarse evidencias manuales de navegador, adjuntos, permisos por rol y recorrido completo del solicitante antes de aceptar globalmente HU-31.

## Verificación manual local (2026-11-19)

- El backend y la base de datos se levantaron con Docker.
- La interfaz frontend no quedó publicada en `localhost:8080` durante esta sesión; por ello no se registran como aprobadas las pruebas manuales de navegador, adjuntos, roles ni recorrido completo.
- Estado de esos casos: BLOQUEADO hasta que frontend esté disponible y QA pueda capturar la evidencia.

## Resultado manual adicional: CP-04

**Estado:** Fallido / bloqueado por INC-31-04-001. Durante la creación de un trámite con la cuenta de Migrante Independiente `Leonardo Liang`, el formulario permitió guardar datos personales incompatibles (`Daniela Daniela Daniela`). La aceptación queda bloqueada hasta corregir la validación de titularidad y repetir la prueba.

## CP-04 — segunda ejecución manual

La cuenta Turista `Daniela Anaya` mostró campos identificatorios editables y permitió introducir `hola`. El caso queda **Fallido** en frontend hasta que esos campos se bloqueen para solicitantes normales. El modo de prueba del Pasante de Bufete permanece permitido.

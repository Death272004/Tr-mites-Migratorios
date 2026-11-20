# Evidencia TASK-31.2 y TASK-31.3

**Fecha de ejecución:** 2026-11-19
**Entorno:** equipo local conectado, Docker y PostgreSQL disponibles.
**Comando:** `./Backend/mvnw -f Backend/pom.xml test`

## TASK-31.2

Se ejecutó la suite automatizada del backend para validar autenticación, autorización, modelo, adaptadores de verificación y contratos.

## TASK-31.3

Se repitió la suite completa como regresión sobre el estado actual del proyecto.

## Resultado (actualización post-auditoría · 2026-11-19)

- Tests run: 156
- Failures: 0
- Errors: 0
- Skipped: 0
- Resultado Maven: BUILD SUCCESS
- Tiempo total registrado: 01:09 min

Incluye las pruebas de regresión agregadas tras la auditoría técnica y de seguridad (`ExpedienteTest`, `PrivacidadTest`, `FuentesSimuladasTest`, `DocumentoTest`, `AutenticacionTest`, `AutorizacionTest` y `CuentaTest`).

## Evidencia reproducible

Comando ejecutado: `./Backend/mvnw -f Backend/pom.xml test` sobre PostgreSQL real (Testcontainers). Además se validó la sintaxis de los módulos JS modificados con `node --check`, `provisioner.py` con `python3 -m py_compile` y el contrato OpenAPI con `FuentesSimuladasTest` (6/6 en verde).

## Alcance pendiente

Esta evidencia cubre la suite automatizada del backend. Aún deben agregarse evidencias manuales de navegador (especialmente la re-prueba visual de CP-04 y CP-12) antes de aceptar globalmente HU-31.

## Historial de hallazgos manuales previos (corregidos en código)

- **CP-04 (`INC-31-04-001`):** Se corrigió la validación estricta de identidad en `ExpedienteServicio.validarTitularidadDatos`, la excepción controlada para `PASANTE_BUFETE` y el bloqueo condicional en `P-09` (evitando el soft-lock de `sexo`/`lugarNacimiento` en cuentas nuevas). Pendiente de repetir captura visual en navegador.
- **CP-12 (`INC-31-12-001`):** Se conectó el endpoint real protegido `GET /api/expedientes/{id}/documentos/{documentoId}/contenido` en `I-04`, `I-06` y `P-19`. Pendiente de repetir captura de red en navegador.

# Evidencia QA — Sprint 5

**Rol:** QA  
**Alcance:** TT-167, TT-172 y TT-176  
**Fecha de validación:** 25 de octubre de 2026

## Resultado

Se ejecutó la suite del backend desde `Backend/`:

```bash
./mvnw -B test
```

Resultado comprobado:

- 139 pruebas ejecutadas.
- 0 fallos.
- 0 errores.
- 70 pruebas omitidas por configuración o escenarios no aplicables.
- Compilación exitosa.

## TT-167 — Adaptadores y registro manual

Se validaron los adaptadores simulados de Tribunal Electoral, CSS y Registro Público, incluyendo respuestas correctas, sin resultado, error técnico, timeout, límite de solicitudes, datos incompletos y registro manual asistido.

También se comprobó que se normalicen los resultados y que no se expongan datos personales innecesarios en las respuestas o logs.

## TT-172 — Fallos, recuperación e idempotencia

Se verificaron los errores técnicos, la diferencia entre error técnico y resultado negativo, los reintentos limitados, el backoff, la recuperación de la fuente y el registro manual después de agotar los reintentos.

También se comprobó la protección contra solicitudes duplicadas mediante `Idempotency-Key`.

## TT-176 — Minimización, autorización, trazabilidad y logs

Se comprobaron la finalidad autorizada, la matriz de fuentes, el consentimiento para datos sensibles, los permisos por rol, la correlación de operaciones, la auditoría y la redacción de información personal en respuestas, base de datos y logs.

## Conclusión

La evidencia de QA del Sprint 5 quedó validada con la suite automatizada del backend. Las tareas TT-167, TT-172 y TT-176 fueron cerradas en TeamTrack.

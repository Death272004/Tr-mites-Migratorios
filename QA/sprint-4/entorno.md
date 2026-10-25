# Resultado de verificación del entorno – Sprint 4

## Pruebas realizadas

Se verificó el entorno local de demostración con datos ficticios y contenedores activos.

| Verificación | Resultado |
|---|---|
| Backend `GET /actuator/health` en puerto 8080 | HTTP 200 |
| Estado reportado por el backend | `UP` |
| Frontend en puerto 8081 | HTTP 200 |
| Frontend alterno en puerto 8083 | HTTP 200 |
| Backend alterno en puerto 8082 | HTTP 200, estado `UP` |
| Base de datos PostgreSQL en contenedor | Activa y saludable |

## Interpretación

El entorno levantado permite comprobar que el frontend y backend responden y que el backend tiene disponible un estado de salud operativo. Esta es una prueba de humo; no equivale a una prueba completa de carga ni a una certificación de seguridad.

## Próximas evidencias

- Ejecutar el plan de carga documentado en JMeter.
- Ejecutar el escaneo autenticado con OWASP ZAP.
- Registrar P95, solicitudes por segundo, porcentaje de errores y hallazgos por severidad.

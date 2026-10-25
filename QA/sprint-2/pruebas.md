# Resultado de pruebas automatizadas – Sprint 2

## Ejecución

- Comando: `./mvnw test`
- Proyecto: backend Java/Spring Boot.
- Perfil: `test`.
- Base de datos de prueba: PostgreSQL 16.15 mediante Testcontainers.
- Fecha de ejecución: 25 de octubre de 2026.

## Resultado

| Resultado | Cantidad |
|---|---:|
| Pruebas ejecutadas | 68 |
| Fallos | 0 |
| Errores | 0 |
| Omitidas | 0 |
| Estado de compilación | BUILD SUCCESS |

## Cobertura funcional observada

La suite ejecutó pruebas de autenticación, autorización, privacidad, cuentas, expedientes, documentos, estados, auditoría, errores y fuentes simuladas. También levantó una base PostgreSQL aislada, aplicó las migraciones y ejecutó las pruebas con datos controlados.

## Interpretación

El resultado confirma que las pruebas automatizadas existentes pasan en un entorno reproducible. Este resultado no sustituye las pruebas manuales de interfaz, el escaneo OWASP ZAP ni la prueba de carga con JMeter; esas evidencias deben mantenerse separadas.

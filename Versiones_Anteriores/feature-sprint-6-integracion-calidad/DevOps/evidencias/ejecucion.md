# Evidencia de ejecución DevOps

Fecha de verificación: 25 de octubre de 2026.

## Compose y smoke test

- `docker compose config --quiet`: aprobado.
- Backend `http://localhost:8080/actuator/health`: HTTP 200, estado `UP`.
- Frontend `http://localhost:8081/`: carga correcta.
- `scripts/smoke-test.sh`: aprobado.

## Pruebas del backend

Comando ejecutado:

`./Backend/mvnw -f Backend/pom.xml test`

Las pruebas se ejecutaron con PostgreSQL 16.15 en un contenedor Testcontainers y migraciones Flyway desde una base limpia.

Resultado: 68 pruebas ejecutadas, 0 fallos, 0 errores y 0 omitidas.

## Alcance verificado

Autenticación, autorización, cuentas, privacidad, expedientes, documentos, estados, auditoría, errores y fuentes simuladas.

## Observación

Esta evidencia valida el entorno y las pruebas automatizadas. No reemplaza los informes de carga de JMeter ni el escaneo de seguridad de OWASP ZAP.

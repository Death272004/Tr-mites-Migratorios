# TASK-32.1 · Manual técnico

**Proyecto:** Sistema Interoperable para la Gestión de Trámites Migratorios
**Estado:** Revisión local del Sprint 7

## 1. Propósito

Este manual explica la instalación, ejecución, pruebas y mantenimiento del MVP. El sistema usa datos ficticios y fuentes de verificación simuladas o asistidas; no consulta directamente sistemas reales del SNM, TE, CSS ni Registro Público.

## 2. Arquitectura

- **Frontend:** HTML, CSS y JavaScript modular servido por Nginx.
- **Backend:** Java 17 con Spring Boot; expone API REST, autenticación, autorización, expedientes, documentos, verificaciones y auditoría.
- **PostgreSQL 16:** usuarios, cuentas, expedientes, estados y resultados.
- **Flyway:** migraciones versionadas de la base de datos.
- **Almacenamiento documental:** volumen Docker protegido.
- **Correo local:** servidor SMTP/IMAP y aprovisionador interno para pruebas.
- **Nginx:** sirve el frontend y redirige `/api` al backend.

Flujo: navegador → Nginx/frontend → API Spring Boot → PostgreSQL y almacenamiento documental.

## 3. Estructura

```text
Backend/             API, seguridad, dominio, persistencia y migraciones
Frontend/            vistas, componentes, utilidades, estilos y activos
QA/                  pruebas e informes de rendimiento y seguridad
DevOps/              automatización y material de entorno
Documentacion/       arquitectura, backlog, roles y entregas
docker/              Nginx y servicios de correo
docker-compose.yml   orquestación local
```

## 4. Requisitos

Git, Docker Desktop/Engine con Compose, 4 GB de memoria, JDK 17 y Node.js.

## 5. Ejecución con Docker Compose

Desde la raíz:

```bash
docker compose up --build
```

| Servicio | Dirección |
|---|---|
| Frontend | http://localhost:8080 |
| Salud backend | http://localhost:8080/actuator/health |
| PostgreSQL | 127.0.0.1:5433 |
| Webmail local | http://localhost:8081 |

Detener:

```bash
docker compose down
```

Eliminar datos locales de prueba:

```bash
docker compose down -v
```

Si un puerto está ocupado, copia `.env.example` a `.env` y cambia `FRONTEND_PORT` o `DB_PORT`. No subas `.env`.

## 6. Variables de entorno

`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`, `FRONTEND_PORT`, `DOCUMENTOS_DIR`, `SPRING_PROFILES_ACTIVE`, `DEMO_AUTOCOMPLETAR`, `CORREO_MODO`, `SMTP_HOST`, `SMTP_PORT` y `MAIL_PROVISIONER_TOKEN`.

El atajo `POST /api/auth/autocompletar` está restringido al perfil `@Profile("demo")` y exige `DEMO_AUTOCOMPLETAR=true`. En `application.yml` y `.env.example` queda desactivado por defecto (`false`); en `docker-compose.yml` se habilita únicamente para pruebas locales rápidas.

Los secretos deben permanecer fuera del repositorio.

## 7. Base de datos

Flyway ejecuta las migraciones al iniciar el backend. Las migraciones del Sprint 7 son:

- `V17__datos_personales_cuenta.sql`
- `V18__datos_personales_demo.sql`
- `V19__lugar_nacimiento_demo.sql`

No edites una migración ya ejecutada; crea una nueva versión. Para reconstruir una base de prueba:

```bash
docker compose down -v
docker compose up --build
```

## 8. Seguridad y roles

Roles técnicos: `SOLICITANTE`, `FUNCIONARIO`, `SUPERVISOR`, `AUDITOR` y `ADMIN`. El solicitante puede tener un tipo adicional: turista, pasante de bufete, migrante independiente o nacional.

La identidad de solicitantes normales se carga desde la cuenta y queda protegida contra edición. El pasante de bufete puede usar datos de demostración para completar una persona ficticia. Esa excepción es únicamente para demostración.

## 9. Pruebas

Backend:

```bash
cd Backend
./mvnw test
```

JavaScript:

```bash
find Frontend/js -name '*.js' -print0 | xargs -0 -n1 node --check
```

Cambios de formato:

```bash
git diff --check
```

También se utilizan JUnit/Spring Test, Testcontainers, Apache JMeter y OWASP ZAP.

## 10. Despliegue

Antes de desplegar se deben configurar secretos fuera del repositorio, respaldar la base, ejecutar migraciones, verificar los endpoints de salud, revisar roles y permisos documentales, ejecutar regresión y confirmar restauración de respaldos. En producción no deben activarse cuentas demo ni el correo local.

## 11. Diagnóstico

- Backend no inicia: revisar PostgreSQL, variables `DB_*` y Flyway.
- Frontend sin API: revisar Nginx, proxy `/api` y salud del backend.
- Migración falla: consultar la versión de Flyway y crear una nueva migración.
- Archivo no aparece: revisar volumen documental y permisos del expediente.
- Cambios JS no aparecen: usar `Ctrl+F5` y verificar el parámetro de versión.

## 12. Limitaciones

Las fuentes institucionales son simuladas o manuales; el MVP no es una conexión institucional ni una decisión migratoria oficial. Los datos demo no representan personas reales. El endpoint protegido de descarga (`GET /api/expedientes/{id}/documentos/{documentoId}/contenido`) ya está conectado en `I-04`, `I-06` y `P-19` y validado en `DocumentoTest`; queda pendiente registrar la evidencia visual en navegador para cerrar CP-12.

## 13. Referencias

- `Documentacion/usuarios-proyecto.md`
- `Documentacion/documentos-base/01-propuesta-de-arquitectura.md`
- `Documentacion/documentos-base/06-roles-y-accesos.md`
- `docs/evidencias/sprint-6-validacion-local-2026-10-29.md`
- `docs/evidencias/sprint-7-task-31.1-matriz-aceptacion.md`
- `docs/evidencias/sprint-7-task-31.2-31.3-ejecucion.md`
- `docs/evidencias/sprint-7-task-31.4-registro-aceptaciones.md`

Este documento queda en revisión local y no se sube a GitHub hasta la aprobación del Product Owner.

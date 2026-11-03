# Verificación de cierre local — Sprint 1

**Fecha:** 2026-10-19
**Rama de cierre:** `sprint-1-cierre`
**Base:** `origin/integracion/frontend-backend`
**Alcance:** integración local de Frontend, Backend, PostgreSQL y controles DevOps.

## Controles ejecutados

| Control | Resultado |
| --- | --- |
| `git diff --check` | PASS |
| `docker compose config --quiet` | PASS |
| Sintaxis de todos los archivos JavaScript del Frontend | PASS |
| `Backend/./mvnw test` | PASS — 68 pruebas, 0 fallos, 0 errores |
| Migraciones Flyway desde una base limpia | PASS — migraciones V1 a V4 aplicadas |
| Construcción de la imagen Backend | PASS |
| Construcción de la imagen Frontend | PASS |
| Healthcheck de PostgreSQL | PASS |
| Healthcheck del Backend | PASS — `status: UP` |
| Healthcheck del Frontend | PASS — respuesta `ok` |
| Portal Frontend | PASS — HTTP 302 hacia `/html/index.html` |
| Login por el Backend | PASS |
| Perfil consumido mediante el proxy del Frontend | PASS |

## Ejecución Docker

El puerto PostgreSQL predeterminado `5433` ya estaba ocupado en el equipo, por
lo que la validación se ejecutó con puertos aislados:

- PostgreSQL: `55433`
- Backend: `18080`
- Frontend: `18081`

Esto no cambia la configuración versionada ni representa un error del proyecto;
solo evita interferir con otro entorno local.

Comando utilizado:

```bash
DB_PORT=55433 BACKEND_PORT=18080 FRONTEND_PORT=18081 \
docker compose -p sprint1-cierre up -d
```

Los servicios quedaron en estado `healthy`:

```text
sprint1-cierre-db-1        healthy
sprint1-cierre-backend-1   healthy
sprint1-cierre-frontend-1  healthy
```

## Validación funcional integrada

1. Se inició sesión con el usuario ficticio documentado para desarrollo local.
2. Se recibió un token válido desde `POST /api/auth/login`.
3. Se consultó `GET /api/perfil` mediante `/api/` del Frontend.
4. El perfil correspondió al usuario autenticado.

No se utilizaron credenciales reales ni datos personales.

## Estado para Pull Request

La rama contiene la integración local y la documentación DevOps del Sprint 1.
El Pull Request debe ser revisado por otro integrante antes de solicitar un
merge. `main` no fue modificado.

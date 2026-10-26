# Evidencia de cierre técnico del Sprint 2

**Fecha:** 2026-10-19  
**Rama de trabajo:** `sprint-2-cierre`  
**Base revisada:** `integracion/frontend-backend` (`a0a4200`)  
**Datos:** únicamente usuarios y datos ficticios de desarrollo.

## Entregables comprobados

- Entorno reproducible con PostgreSQL, Backend y Frontend en Docker.
- Migraciones Flyway V1–V4 aplicadas desde una base limpia.
- Autenticación real: login, registro, recuperación, perfil, cierre de sesión y
  cambio de contraseña.
- Autorización por roles en Backend, verificación de titularidad y auditoría de
  accesos denegados.
- Frontend conectado por el proxy `/api/` y usando los permisos recibidos por el
  usuario autenticado para mostrar u ocultar acciones.
- Matriz rol × endpoint × operación documentada en
  `Backend/docs/matriz-autorizacion.md`.
- Estándar de errores documentado en `Backend/docs/estandar-errores.md` y
  reflejado en `Backend/docs/openapi.yaml`.

## Validaciones ejecutadas

| Validación | Resultado |
| --- | --- |
| `./Backend/mvnw test` | PASS — 68 pruebas, 0 fallos, 0 errores |
| Sintaxis de todos los `.js` del Frontend | PASS |
| Prueba de permisos reales en `tm.perms` | PASS — usa `usuario.permisos` de la sesión |
| `docker compose config --quiet` | PASS |
| Construcción de imágenes Backend y Frontend | PASS — constructor clásico de Docker |
| Healthchecks de DB, Backend y Frontend | PASS — PostgreSQL healthy, Backend `UP`, Frontend `ok` |
| Arranque con base de datos limpia | PASS — 4 migraciones Flyway aplicadas |
| Login y perfil por el proxy del Frontend | PASS — login HTTP 200 y perfil HTTP 200 |
| Ruta protegida sin credenciales | PASS — HTTP 401 con `NO_AUTENTICADO` |
| Revisión de diferencias y secretos | PASS — `git diff --check`, `.env` ignorado y sin cambios fuera de la rama |

Las pruebas Docker se ejecutaron con el proyecto aislado `sprint2-cierre` y los
puertos locales `55434`, `18082` y `18083`; al terminar se eliminaron solamente
los contenedores, la red y los volúmenes temporales de ese proyecto.

Este documento no implica cierre administrativo en TeamTrack ni integración a
`main`.

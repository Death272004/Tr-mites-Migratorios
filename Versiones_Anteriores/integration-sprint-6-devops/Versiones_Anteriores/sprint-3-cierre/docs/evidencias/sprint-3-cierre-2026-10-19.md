# Evidencia de validación técnica del Sprint 3

**Fecha:** 2026-10-19  
**Rama de trabajo:** `sprint-3-cierre`  
**Base:** `main` (`675767f`)  
**Datos:** únicamente usuarios, documentos y expedientes ficticios de desarrollo.

## Trabajo realizado

- P-06 consulta `GET /api/expedientes` y convierte la proyección del backend en
  tarjetas de la bandeja del ciudadano.
- P-07 carga `GET /api/catalogos/tipos-tramite` cuando la aplicación se sirve
  por HTTP; conserva fixtures al abrirse offline.
- P-17 crea el expediente con `POST /api/expedientes` usando el código real del
  catálogo y conserva el número devuelto por el backend.
- P-14 conserva los archivos seleccionados en memoria y P-17 los envía como
  `multipart/form-data` a `/api/expedientes/{id}/documentos` después de crear
  el expediente.
- P-19 consulta el expediente y su historial mediante
  `GET /api/expedientes/{id}` y `GET /api/expedientes/{id}/historial`.
- P-20 consulta notificaciones reales y marca cada una como leída mediante
  `PUT /api/notificaciones/{id}/leida`.
- `tm.api` ahora soporta JSON y `FormData` sin romper el modo offline.
- El expediente seleccionado se guarda solo en `sessionStorage`; no se ponen
  identificadores en la URL ni se guardan archivos en almacenamiento web.

## Validaciones ejecutadas

| Validación | Resultado |
| --- | --- |
| Sintaxis de todos los `.js` del Frontend | PASS |
| `git diff --check` | PASS |
| `./Backend/mvnw test -q` | PASS — proceso terminó con código 0 |
| `docker compose config` | PASS |
| Construcción Backend y Frontend | PASS |
| Healthcheck del Backend | PASS — `status: UP` |
| Healthcheck del Frontend | PASS — `ok` |
| Ruta protegida sin credenciales | PASS — HTTP 401 |
| Login de usuario ficticio | PASS — HTTP 200 |
| Catálogo, creación de expediente y listado | PASS |
| Historial del expediente recién creado | PASS — 1 evento |

## Alcance pendiente

El backend ya contiene las entidades y endpoints de expedientes, documentos,
notificaciones, consentimiento y ARCO. Sin embargo, las pantallas internas
I-02, I-03 e I-06 todavía no tienen endpoints equivalentes para sustituir sus
fixtures. Por eso no se declaran cerradas esas tareas únicamente con esta
validación: necesitan un contrato backend acordado o una evidencia funcional
del equipo que las implementó.

Esta evidencia documenta el avance técnico local; no implica por sí sola cierre
administrativo en TeamTrack ni integración a `main`.

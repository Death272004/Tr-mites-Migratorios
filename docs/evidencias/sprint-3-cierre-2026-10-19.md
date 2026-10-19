# Evidencia de validación técnica del Sprint 3

**Fecha:** 2026-10-19  
**Rama de trabajo:** `sprint-3-completo`
**Base:** `origin/main` (`a95899f`)
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
- P-05 consulta, registra y revoca consentimientos mediante
  `/api/consentimientos`, con confirmación antes de revocar.
- P-27 registra y consulta solicitudes ARCO mediante
  `/api/solicitudes-arco`, conservando la referencia devuelta por el backend.
- I-19 consulta y revoca consentimientos reales del despacho mediante
  `/api/consentimientos`.
- I-03 y I-02 calculan la bandeja y los indicadores desde
  `GET /api/expedientes`, sin depender de datos ficticios cuando hay sesión.
- I-06 carga el expediente seleccionado, su historial y sus documentos desde
  los endpoints reales disponibles.
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
| Consentimientos y solicitudes ARCO (tests de backend) | PASS — `./mvnw test -q` |
| Smoke aislado con Docker (`db`, `backend`, `frontend`) | PASS — healthchecks UP/ok |
| Flujo autenticado de Sprint 3 | PASS — login, expediente, consentimiento y ARCO |

## Criterio de cierre técnico

Las tareas de integración frontend del Sprint 3 quedan validadas contra los
contratos que ya existen en Backend. Las vistas conservan fixtures únicamente
como respaldo de demostración offline; al configurar `tm.api` con la URL del
backend, la fuente de datos es la API real. El cierre administrativo requiere
integrar esta rama a `integracion/frontend-backend`, luego a `main`, y marcar las
tareas correspondientes en TeamTrack con el commit y la evidencia de pruebas.

# Registro de cambios del contrato de la API

Contrato: [`openapi.yaml`](openapi.yaml) — HU-07 del backlog (`Documentacion/05-backlog-siete-sprints.md`).

## Procedimiento de cambios

1. Toda modificación al contrato se anota aquí **antes** de implementarse (HU-07, criterio 6).
2. Se sube el número de versión en `info.version` de `openapi.yaml`.
3. El archivo debe validar sin errores: `npx @redocly/cli lint Backend/docs/openapi.yaml`.
4. Se avisa a la rama Frontend cuando el cambio afecta una ruta, un campo o un enumerado que ya consume.

## 0.3.0 — 2026-10-11

Estados y permisos alineados con los que ya usa el Frontend. **Cambia un enumerado existente**: quien consuma `EstadoExpediente` debe actualizar los valores.

- `EstadoExpediente` pasa a la cadena de `Pantallas_y_Datos_Migracion.md`: `EN_PREPARACION`, `RECIBIDO`, `CON_OBSERVACIONES`, `EN_ANALISIS`, `ADMITIDO`, `EN_RESOLUCION`, `RESUELTO`, `NOTIFICADO`, `ENTREGADO`, `ARCHIVADO`. El Frontend los muestra con espacios y tildes; la API usa el código.

  | Antes | Ahora |
  | --- | --- |
  | `BORRADOR` | `EN_PREPARACION` |
  | `PRESENTADO` | `RECIBIDO` |
  | `PENDIENTE_DOCUMENTOS`, `OBSERVADO` | `CON_OBSERVACIONES` |
  | `EN_REVISION` | `EN_ANALISIS` |
  | `EN_VALIDACION` | `ADMITIDO` |
  | `LISTO_DECISION` | `EN_RESOLUCION` |
  | `APROBADO`, `DENEGADO` | `RESUELTO` con `resultado` `APROBADA` o `NEGADA` |
  | `CERRADO` | `NOTIFICADO` y luego `ENTREGADO` |
  | `CANCELADO` | `ARCHIVADO` |

- Campo `resultado` (`APROBADA`, `NEGADA`) en `Expediente` y en `CambioEstadoSolicitud`; es obligatorio al pasar a `RESUELTO`.
- `PATCH /api/expedientes/{id}/estado` ya no exige siempre `RESOLVER`: el permiso depende del estado de destino (`OBSERVAR`, `RESOLVER` o `NOTIFICAR`), igual que en las pantallas I-04 a I-13.
- Enumerado `Permiso` con los nueve del Frontend (se agregan `PORTAL`, `REPORTAR`, `AUDITAR` y `ADMINISTRAR`) y campo `permisos` en `Usuario`, que llega en la respuesta del inicio de sesión.

## 0.2.0 — 2026-10-11

Cambios aditivos al implementar las historias de los Sprints 1 a 4. Ninguna ruta ni campo existente cambia.

- `GET /api/catalogos/tipos-tramite` y `GET /api/catalogos/tipos-documentales` (TASK-15.2, TASK-17.1): el asistente necesita los tipos de trámite, sus requisitos y los límites de archivo.
- Campo `numero` en `Expediente` (número legible, p. ej. `EXP-2026-000001`); es el que consulta el SNM simulado.
- Valor `CONSENTIMIENTO_REVOCADO` en `TipoNotificacion`: aviso al despacho cuando un cliente revoca (HU-18b CA-4).
- `Documento.estadoRevision` pasa de texto libre a los valores `PENDIENTE`, `VALIDO`, `RECHAZADO` (cierre de la TASK-17.1).

### Códigos de error en uso

Además de los genéricos por código HTTP (`ENTRADA_INVALIDA`, `NO_AUTENTICADO`, `SIN_PERMISO`, `NO_ENCONTRADO`, `CONFLICTO`, `ERROR_INTERNO`), el campo `codigo` puede traer: `CREDENCIALES_INVALIDAS` (401), `SIN_REPRESENTACION`, `CONSENTIMIENTO_REQUERIDO` y `CONSENTIMIENTO_EXPRESO_REQUERIDO` (403), `TRANSICION_NO_PERMITIDA`, `REQUISITOS_INCOMPLETOS`, `VERSION_DESACTUALIZADA`, `EXPEDIENTE_CERRADO` y `CONSENTIMIENTO_YA_REVOCADO` (409), y en las fuentes simuladas `SIN_RESULTADO` (404), `LIMITE_EXCEDIDO` (429), `ERROR_TECNICO` (500) y `TIEMPO_AGOTADO` (504).

## 0.1.0 — 2026-10-10

Primera versión del contrato.

### Servicios

| Módulo | Servicios | Historia |
| --- | --- | --- |
| Autenticación | `POST /api/auth/login`, `POST /api/auth/logout`, `PUT /api/auth/contrasena` | HU-12 |
| Expedientes | `GET` y `POST /api/expedientes`, `GET /api/expedientes/{id}` | HU-15, HU-16 |
| Documentos | `GET` y `POST /api/expedientes/{id}/documentos`, `GET /api/expedientes/{id}/documentos/{documentoId}/contenido` | HU-17 |
| Estados | `PATCH /api/expedientes/{id}/estado`, `GET /api/expedientes/{id}/historial` | HU-19, HU-21 |
| Observaciones | `GET` y `POST /api/expedientes/{id}/observaciones` | HU-20 |
| Verificaciones | `GET` y `POST /api/expedientes/{id}/verificaciones` | HU-24, HU-26 |
| Consentimientos | `GET` y `POST /api/consentimientos`, `PATCH /api/consentimientos/{consentimientoId}` | HU-18b |
| Solicitudes ARCO | `GET` y `POST /api/solicitudes-arco`, `GET` y `PATCH /api/solicitudes-arco/{solicitudId}` | HU-18c |
| Notificaciones | `GET /api/notificaciones`, `PUT /api/notificaciones/{notificacionId}/leida` | HU-18 |
| Auditoría | `GET /api/auditoria/eventos`, `GET /api/auditoria/eventos/exportacion` | HU-22 |
| Fuentes simuladas | `GET /api/mock/te/personas/{tipoDoc}/{numero}`, `GET /api/mock/css/afiliaciones/{idPersona}`, `GET /api/mock/registro/consultas/{idPersona}`, `GET /api/mock/snm/expedientes/{numero}` | HU-08 |

### Convenciones

- Autenticación por token en la cabecera `Authorization` (`bearerAuth`); solo el inicio de sesión es público.
- Cada operación declara en `x-roles` los roles permitidos, según `Documentacion/06-roles-y-accesos.md` §6.5.
- Cuerpo de error uniforme (`Error`) y códigos 400, 401, 403, 404, 409 y 5xx (HU-14).
- Las fuentes simuladas aceptan el escenario por la cabecera `X-Scenario` o por `?scenario=`:
  `SIN_RESULTADO` responde 404, `RATE_LIMIT` 429, `ERROR_TECNICO` 500 y `TIMEOUT` 504.

### Definiciones que el backlog no fija y se adoptan aquí

- Rutas de cierre de sesión, cambio de contraseña, descarga de documento, observaciones, notificaciones y auditoría.
- Ruta de consentimientos: `/api/consentimientos` (backlog, HU-18b), no `/api/clientes/{id}/consentimientos` (plan de desarrollo §3.6).
- Estados de la cuenta de usuario: `ACTIVA`, `BLOQUEADA`, `DESHABILITADA`.
- Campo `titularId` al crear un expediente, para el `SOLICITANTE` con representación acreditada.
- Campo `avisoDuplicado` en `Documento`.
- Campos de las respuestas de las fuentes simuladas (datos ficticios).
- El tipo de trámite, el tipo documental y el estado de revisión del documento son texto hasta cerrar la TASK-17.1.

### Pendiente para versiones posteriores

- Reintento de verificaciones con clave de idempotencia (HU-24, Sprint 5).
- Registro de cuenta, código de verificación y recuperación de contraseña (pantallas P-02, P-03 y P-04; no forman parte de la HU-12).

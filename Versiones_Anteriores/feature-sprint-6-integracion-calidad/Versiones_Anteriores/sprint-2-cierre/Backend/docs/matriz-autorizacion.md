# Matriz de autorización del Sprint 2

Esta matriz documenta la relación rol × endpoint × operación de la HU-13 / TASK-13.1.
Es coherente con `MatrizAutorizacion.java`, el campo `x-roles` de `openapi.yaml` y la
prueba `AutorizacionTest`. Todo endpoint que no aparece en la matriz se deniega.

## Roles

| Rol | Regla principal |
| --- | --- |
| `SOLICITANTE` | Solo sus expedientes, documentos, consentimiento y solicitudes ARCO. |
| `FUNCIONARIO` | Operación del despacho según permisos granulares y titularidad. |
| `SUPERVISOR` | Consulta y seguimiento; no decide ni administra usuarios. |
| `AUDITOR` | Consulta de expedientes y bitácora; no modifica expedientes. |
| `ADMIN` | Administración técnica; no obtiene acceso a expedientes por defecto. |

## Endpoint × operación × roles

| Método | Endpoint | Roles permitidos | Regla adicional |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login`, `/api/auth/registro`, `/api/auth/recuperacion` y `/api/auth/recuperacion/confirmacion` | Público | Las respuestas de autenticación y recuperación no revelan si una cuenta existe. |
| `POST` | `/api/auth/logout` | Todos autenticados | Invalida la sesión usada. |
| `PUT` | `/api/auth/contrasena` | Todos autenticados | Exige contraseña actual y política de complejidad. |
| `GET`, `PATCH` | `/api/perfil` | Todos autenticados | Solo permite consultar o cambiar el propio perfil. |
| `GET` | `/api/catalogos/tipos-tramite`, `/api/catalogos/tipos-documentales` | Todos autenticados | Solo lectura. |
| `GET` | `/api/expedientes` | `SOLICITANTE`, `FUNCIONARIO`, `SUPERVISOR`, `AUDITOR` | El resultado se filtra por titularidad y ámbito. |
| `POST` | `/api/expedientes` | `SOLICITANTE` | El expediente queda asociado al titular autenticado. |
| `GET` | `/api/expedientes/{id}` y `/historial` | `SOLICITANTE`, `FUNCIONARIO`, `SUPERVISOR`, `AUDITOR` | Un expediente ajeno no revela datos y responde `404`/`403`. |
| `GET` | `/api/expedientes/{id}/documentos` | `SOLICITANTE`, `FUNCIONARIO`, `SUPERVISOR`, `AUDITOR` | Se comprueba titularidad o ámbito del despacho. |
| `POST` | `/api/expedientes/{id}/documentos` | `SOLICITANTE`, `FUNCIONARIO` | Requiere permiso de la operación y expediente accesible. |
| `GET` | `/api/expedientes/{id}/documentos/{documentoId}/contenido` | `SOLICITANTE`, `FUNCIONARIO`, `SUPERVISOR` | No incluye al `AUDITOR` ni al `ADMIN` por defecto. |
| `PATCH` | `/api/expedientes/{id}/estado` | `FUNCIONARIO` | Además requiere permiso granular y transición válida. |
| `GET` | `/api/expedientes/{id}/observaciones` | `SOLICITANTE`, `FUNCIONARIO`, `SUPERVISOR`, `AUDITOR` | Consulta limitada al expediente accesible. |
| `POST` | `/api/expedientes/{id}/observaciones` | `SOLICITANTE`, `FUNCIONARIO` | Requiere permiso `OBSERVAR` cuando aplica. |
| `GET`, `POST`, `PATCH` | `/api/consentimientos` y `/{consentimientoId}` | Según operación: `SOLICITANTE`, `FUNCIONARIO`, `AUDITOR` | El titular solo gestiona su consentimiento. |
| `GET`, `POST`, `PATCH` | `/api/solicitudes-arco` y `/{solicitudId}` | Consulta: `SOLICITANTE`, `FUNCIONARIO`, `AUDITOR`; creación: `SOLICITANTE`; atención: `FUNCIONARIO` | Se verifica titularidad y ámbito. |
| `GET`, `PUT` | `/api/notificaciones` y `/{notificacionId}/leida` | `SOLICITANTE`, `FUNCIONARIO` | Solo notificaciones del usuario o ámbito permitido. |
| `GET` | `/api/auditoria/eventos` y `/exportacion` | `AUDITOR` | Solo lectura; cada denegación genera auditoría. |
| `GET` | `/api/mock/te/**`, `/api/mock/css/**`, `/api/mock/registro/**`, `/api/mock/snm/**` | `FUNCIONARIO` | Fuentes simuladas; no se guardan datos institucionales completos. |

## Permisos granulares del Frontend

Después del login, el Backend devuelve `usuario.permisos`. La interfaz usa esos
permisos para mostrar u ocultar acciones; si se ejecuta sin sesión, usa la matriz
local solo como respaldo de demostración. La decisión de seguridad siempre la toma
el Backend.

| Permiso | Acciones protegidas |
| --- | --- |
| `PORTAL` | Flujo del solicitante. |
| `CONSULTAR` | Consultar expedientes y catálogos. |
| `VERIFICAR` | Registrar resultados de verificación. |
| `OBSERVAR` | Emitir observaciones y dictámenes. |
| `RESOLVER` | Aprobar o negar expedientes. |
| `NOTIFICAR` | Notificar, entregar y archivar. |
| `REPORTAR` | Consultar reportes. |
| `AUDITAR` | Consultar y exportar bitácora. |
| `ADMINISTRAR` | Administrar catálogos, usuarios y permisos. |

## Casos mínimos de aceptación

1. Una petición sin token responde `401` con el cuerpo de error estándar.
2. Un rol no incluido en esta matriz responde `403` sin datos de negocio.
3. Un solicitante que intenta consultar un expediente ajeno no recibe información
   del expediente y obtiene `404` o `403` según la operación.
4. Una denegación autenticada deja un evento `ACCESO_DENEGADO` en la bitácora.
5. `AutorizacionTest` recorre las reglas con todos los roles y valida permitidos,
   denegados y accesos sin sesión.

# Estándar de errores de la API — Sprint 2

La API devuelve un único cuerpo JSON para errores de validación, seguridad, negocio
y fallos internos. El esquema está definido como `components.schemas.Error` en
[`openapi.yaml`](openapi.yaml) y se aplica mediante `ManejadorErrores` y la cadena
de seguridad.

## Cuerpo de respuesta

```json
{
  "codigo": "ENTRADA_INVALIDA",
  "mensaje": "Revise los datos enviados.",
  "correlacionId": "7a6f5b4c-3210-4f1e-8b0d-123456789abc",
  "errores": [
    {"campo": "correo", "mensaje": "Debe ser un correo válido."}
  ]
}
```

| Campo | Obligatorio | Uso |
| --- | --- | --- |
| `codigo` | Sí | Código estable para que el cliente pueda tomar decisiones. |
| `mensaje` | Sí | Mensaje seguro, sin trazas, SQL, nombres de tablas ni datos personales. |
| `correlacionId` | Sí | Identifica la petición en los logs; también se devuelve en `X-Correlation-Id`. |
| `errores` | No | Detalle por campo únicamente cuando la entrada es inválida. |

## Mapeo HTTP

| HTTP | Código estándar | Cuándo se usa |
| --- | --- | --- |
| `400` | `ENTRADA_INVALIDA` | JSON ilegible, validación de campos, parámetros inválidos o archivo no válido. |
| `401` | `NO_AUTENTICADO` | Falta el token, está vencido o no es válido. |
| `403` | `SIN_PERMISO` | El usuario está autenticado, pero su rol o permiso no permite la operación. |
| `404` | `NO_ENCONTRADO` | Recurso inexistente o expediente que no debe revelarse al solicitante. |
| `409` | `CONFLICTO` / código de negocio | Conflicto de estado, versión desactualizada o transición no permitida. |
| `429` | `LIMITE_EXCEDIDO` | La fuente simulada o una política de intentos excede su límite. |
| `500` | `ERROR_INTERNO` / `ERROR_TECNICO` | Fallo inesperado o dependencia externa con error técnico. |
| `504` | `TIEMPO_AGOTADO` | Una fuente simulada o adaptador supera su tiempo de respuesta. |

## Reglas de seguridad

- Nunca se devuelve `contrasena`, hash, token, SQL, stack trace ni datos personales
  de otra cuenta.
- El login y la recuperación usan mensajes genéricos para no revelar si un correo
  está registrado.
- Los errores de fuentes externas se registran con nivel técnico en el servidor,
  pero al cliente solo llega el código seguro y la correlación.
- La correlación recibida por `X-Correlation-Id` se valida; si no cumple el formato
  permitido se genera una nueva.
- El Frontend traduce los códigos HTTP a mensajes comprensibles sin mostrar detalles
  técnicos y conserva el `codigo` para trazabilidad.

## Validación

`ErroresYModeloTest` comprueba respuestas `400`, `401`, `403`, `404` y `409`, la
correlación consistente y la ausencia de trazas o nombres internos. El contrato
OpenAPI referencia el esquema `Error` en las respuestas de los endpoints.

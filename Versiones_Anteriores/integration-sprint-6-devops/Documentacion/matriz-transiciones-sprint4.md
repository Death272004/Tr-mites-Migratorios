# Matriz de transiciones — Sprint 4

## Alcance

El MVP utiliza una matriz común para los tipos de trámite activos:

- `RESIDENCIA_TEMPORAL`
- `RESIDENCIA_PERMANENTE`
- `PRORROGA_ESTADIA`
- `NATURALIZACION`

La matriz está registrada explícitamente por código en `Transiciones.POR_TRAMITE`. Esto permite que el Product Owner restrinja un tipo en el futuro sin cambiar la validación de permisos, concurrencia ni prerrequisitos.

| Estado actual | Estados permitidos |
|---|---|
| `EN_PREPARACION` | `RECIBIDO`, `ARCHIVADO` |
| `RECIBIDO` | `CON_OBSERVACIONES`, `EN_ANALISIS`, `ARCHIVADO` |
| `CON_OBSERVACIONES` | `EN_ANALISIS`, `ARCHIVADO` |
| `EN_ANALISIS` | `CON_OBSERVACIONES`, `ADMITIDO`, `ARCHIVADO` |
| `ADMITIDO` | `EN_RESOLUCION`, `CON_OBSERVACIONES` |
| `EN_RESOLUCION` | `RESUELTO`, `ADMITIDO` |
| `RESUELTO` | `NOTIFICADO` |
| `NOTIFICADO` | `ENTREGADO` |
| `ENTREGADO` | `ARCHIVADO` |

## Reglas que acompañan la matriz

1. Cada cambio exige el permiso de la etapa correspondiente.
2. Cada solicitud exige `motivo` y la versión actual del expediente.
3. Una versión desactualizada responde con conflicto y no modifica el expediente.
4. Para llegar a `EN_RESOLUCION` o `RESUELTO` deben existir los documentos obligatorios y las verificaciones resueltas.
5. Los cambios válidos y rechazados se registran en la bitácora de auditoría.

Esta matriz es la decisión técnica del MVP para cerrar el Sprint 4; cualquier excepción por tipo debe aprobarse y documentarse antes de cambiar `POR_TRAMITE`.

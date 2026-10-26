# Evidencia de validación local — Sprint 4

**Rama:** `sprint-4-cierre`  
**Base:** `origin/main` en `c33d132`  
**Fecha:** 2026-10-19  
**Alcance:** validación y cierre técnico local. No se publicó esta rama en `main` ni se actualizó TeamTrack.

## Trabajo integrado

- I-04 consulta el expediente seleccionado, sus documentos y registra contra la API la observación de incompletitud o la transición a `EN_ANALISIS`.
- I-08 consulta el historial real de observaciones y registra nuevas observaciones mediante `POST /api/expedientes/{id}/observaciones`.
- I-10 carga el expediente real seleccionado y registra la resolución mediante `PATCH /api/expedientes/{id}/estado`, enviando versión, motivo y resultado.
- I-16 consulta la bitácora real y descarga el CSV protegido desde `/api/auditoria/eventos/exportacion`.
- P-20 combina notificaciones y observaciones del expediente consultado, conservando el modo offline para demostraciones.
- La matriz de transición del MVP quedó definida por tipo de trámite y documentada en `Documentacion/matriz-transiciones-sprint4.md`.

## Validaciones realizadas

| Validación | Resultado |
|---|---|
| Sintaxis de todos los JavaScript de `Frontend/js` con `node --check` | Aprobada |
| Pruebas unitarias e integración del backend con Maven/Testcontainers | Aprobada |
| Configuración de Docker Compose con `docker compose config` | Aprobada |
| Build de imágenes `backend` y `frontend` | Aprobada |
| Healthcheck backend `/actuator/health` | `UP` |
| Healthcheck frontend `/salud` | `ok` |
| Protección de API sin sesión | `401` esperado |
| Login demo de auditor y consulta/exportación de auditoría | Aprobada; CSV `200 text/csv` |

## Criterios de aceptación verificados por inspección

- Las vistas ya no generan cambios reales con identificadores aleatorios cuando el backend está conectado.
- Las operaciones pasan por `tm.api`; no se agregaron llamadas `fetch` o `XMLHttpRequest` directamente en las vistas.
- Los cambios de estado conservan control de permisos, versión, motivo y prerrequisitos en backend.
- La exportación de auditoría mantiene la autorización del rol auditor y la descarga se realiza como archivo CSV.
- Los eventos de auditoría permanecen en modo solo lectura desde la interfaz.

## Pendiente antes de publicar

1. Revisar los resultados con el equipo.
2. Preparar el PR y actualizar TeamTrack solo después de la aprobación del equipo.

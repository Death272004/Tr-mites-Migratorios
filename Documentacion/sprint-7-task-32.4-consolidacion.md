# TASK-32.4 · Consolidación de pruebas, marco legal y decisiones

## Propósito

Este documento reúne las fuentes que respaldan la aceptación del Sprint 7 y deja separadas las evidencias técnicas de las decisiones del Product Owner.

## Informes de pruebas

| Área | Evidencia | Uso |
|---|---|---|
| Aceptación y regresión | `docs/evidencias/sprint-7-task-31.1-matriz-aceptacion.md` | Casos CP-01 a CP-12 y criterios |
| Ejecución automatizada | `docs/evidencias/sprint-7-task-31.2-31.3-ejecucion.md` | Resultados de pruebas y regresión |
| Aceptaciones y bloqueos | `docs/evidencias/sprint-7-task-31.4-registro-aceptaciones.md` | Decisiones, incidencias y pendientes |
| Rendimiento | `QA/sprint-6/rendimiento/HU29-informe.md` | JMeter, carga y latencias |
| Seguridad | `QA/sprint-6/seguridad/HU28-informe.md` | OWASP ZAP y revalidaciones |
| Usabilidad | `QA/sprint-6/usabilidad/evidencia-frontend.md` | Revisión de interfaz |

Los informes de Sprint 6 se usan como evidencia técnica de soporte para CP-10 y CP-11. No sustituyen la aceptación del Product Owner.

## Marco legal y fuentes

La referencia normativa y funcional está en:

- `Documentacion/documentos-base/ley-81-de-26-de-marzo-de-2019-sobre-proteccion-de-datos-personales.md`
- `Documentacion/documentos-base/07-marco-legal-y-matriz-fuentes-verificacion.md`
- `Documentacion/documentos-base/Intercambio_Informacion_Instituciones_Migratorias.md`
- `Documentacion/documentos-base/Procesos_Migratorios_Panama.md`

Las fuentes RP, CSS, TE y SNM se manejan como simuladas o asistidas en el MVP. Una integración real requiere autorización institucional, controles de acceso, consentimiento y reglas de retención.

## Decisiones consolidadas

1. El flujo distingue solicitantes, personal del bufete y personal de verificación por rol y área.
2. Los datos de demostración del Pasante de Bufete están aislados del flujo de cuentas reales.
3. La identidad del solicitante se valida en backend antes de guardar el expediente.
4. Los documentos y verificaciones deben conservar trazabilidad.
5. CP-12 permanece bloqueado mientras no exista evidencia HTTP de una descarga protegida; `ERR_FILE_NOT_FOUND` no se interpreta como respuesta de autorización.
6. No se publican cambios en GitHub sin validación explícita del Product Owner.

## Estado de TASK-32.4

**Completada documentalmente y pendiente de revisión del Product Owner.** Las referencias apuntan a archivos existentes del repositorio local. No se modificó código, no se hizo commit y no se hizo push.

# TASK-31.4 · Registro de aceptaciones, bloqueos y errores conocidos

**Sprint:** 7 · Aceptación, documentación y entrega
**Responsable:** Product Owner
**Fecha de apertura:** 2026-11-19
**Estado:** En validación post-auditoría · correcciones técnicas aplicadas localmente, pendiente de re-ejecución manual QA y decisión final del PO

## Propósito

Registrar la decisión del Product Owner sobre cada historia del Sprint 7 después de revisar sus criterios, resultados y evidencias. Este registro no marca historias como aceptadas antes de ejecutar las pruebas.

## Resumen por historia

| Historia | Alcance | Estado de aceptación | Bloqueo actual | Errores conocidos | Evidencia | Decisión del PO |
|---|---|---|---|---|---|---|
| HU-31 | Pruebas de aceptación y regresión | Pendiente de re-validación QA | Pendiente repetir CP-04 y CP-12 en navegador tras correcciones de auditoría. | INC-31-12-001 (descarga `/contenido` ya conectada en frontend I-04/I-06/P-19) e INC-31-04-001 (validación estricta de identidad y excepción `PASANTE_BUFETE` ya corregidas en código). | Suite automatizada: 156 pruebas en verde (`BUILD SUCCESS`); informes HU28/HU29. | Pendiente de validación final del PO |
| HU-32 | Documentación técnica y de usuario | Pendiente | Revisar `openapi.yaml` y `README.md` actualizados en revisión de cierre. | Ninguno confirmado tras corrección D-02/D-03. | `Backend/docs/openapi.yaml`, `README.md`, `Documentacion/`. | Pendiente |
| HU-33 | Instalación limpia y empaquetado | Pendiente | Falta validación final del paquete regenerado sin `Backend/target/`. | Ninguno confirmado tras corrección D-01. | `entregas/tramites-migratorios-sprint-7.tar.gz` y `Documentacion/sprint-7-task-33.3-paquete-entrega.md`. | Pendiente |
| HU-34 | Demostración y evaluación final | Pendiente | Falta ejecutar la demostración final con evidencias. | Ninguno confirmado en esta fecha. | Pendiente de DEMO-01…DEMO-04. | Pendiente |

## Registro detallado de incidencias

| ID | Historia/caso | Tipo | Descripción | Severidad | Responsable | Estado | Evidencia | Acción siguiente |
|---|---|---|---|---|---|---|---|---|
| INC-31-12-001 | CP-12 | Bloqueo de evidencia | La captura anterior mostraba `ERR_FILE_NOT_FOUND` porque el frontend no tenía conectado el endpoint real `GET /api/expedientes/{id}/documentos/{documentoId}/contenido`. | Media | Edwin (QA) | Corregido en código / pendiente re-prueba | Descarga conectada en `I-04`, `I-06` y `P-19`; validado en `DocumentoTest`. | Repetir CP-12 en navegador con documento persistido y captura de Network (`200`, `401`, `403`/`404`). |
| INC-31-04-001 | CP-04 | Validación de identidad | Solicitantes normales podían enviar datos personales inconsistentes y cuentas recién registradas quedaban bloqueadas en P-09 (`sexo`/`lugarNacimiento`). | Alta | Equipo Dev / QA | Corregido en código / pendiente re-prueba | `ExpedienteTest` y `P-09` corregidos (156 pruebas en verde). | Repetir CP-04 en navegador con solicitante normal y `PASANTE_BUFETE`. |

## Reglas de decisión

- **Aceptada:** todos los criterios aplicables tienen evidencia suficiente y no hay bloqueos abiertos.
- **Aceptada con observaciones:** la función cumple, pero quedan observaciones documentadas que no impiden el alcance acordado.
- **Bloqueada:** falta una dependencia o existe un fallo que impide validar la historia.
- **Rechazada:** la evidencia demuestra que no se cumple un criterio de aceptación.
- **Pendiente:** todavía no hay ejecución o revisión suficiente para decidir.

## Flujo de actualización

1. Edwin registra el resultado y la evidencia de cada caso de prueba.
2. Los fallos se agregan al registro detallado con severidad, responsable y acción.
3. Se repiten las pruebas después de cada corrección.
4. El Product Owner registra la decisión final por historia.
5. La aceptación general del Sprint 7 se registra solo cuando HU-31 a HU-34 tengan decisión y evidencia.

## Decisión del Product Owner

- **HU-31:** Pendiente de validación final del PO tras re-ejecutar CP-04 y CP-12 en navegador (suite automatizada en verde con 156 pruebas).
- **HU-32:** Pendiente.
- **HU-33:** Pendiente.
- **HU-34:** Pendiente.
- **Aceptación global del Sprint 7:** Pendiente de validación final del PO sobre HU-31 a HU-34.

> Este archivo es local y no se publicará hasta la validación del Product Owner.

## Actualización posterior a TASK-31.2 y TASK-31.3

- TASK-31.2 / TASK-31.3 (post-auditoría): 156 pruebas automatizadas, 0 fallos, 0 errores y 0 omitidas (`BUILD SUCCESS`).
- CP-10: evidencia existente en `QA/sprint-6/rendimiento/HU29-informe.md`; métricas dentro del umbral.
- CP-11: evidencia existente en `QA/sprint-6/seguridad/HU28-informe.md`; 0 críticos/altos abiertos.
- CP-12: descarga protegida `/contenido` conectada en `I-04`, `I-06` y `P-19`; pendiente de captura HTTP en navegador.
- Evidencia: `docs/evidencias/sprint-7-task-31.2-31.3-ejecucion.md`.
- Decisión HU-31: pendiente de completar la re-validación visual de CP-04/CP-12 y la revisión del Product Owner.

## Hallazgo de validación manual

La prueba HTTP local de `localhost:8080` no pudo ejecutarse porque el servicio frontend no quedó publicado durante la sesión. Las pruebas manuales de navegador, adjuntos, roles y recorrido completo quedan **Bloqueadas**, sin marcar HU-31 como aceptada. Acción: levantar frontend y repetir con evidencia QA.

## Incidencia INC-31-04-001

- **Caso:** CP-04 (durante la creación del trámite de un Migrante Independiente).
- **Tipo:** Fallo de validación de identidad y consistencia de datos.
- **Severidad:** Alta.
- **Estado:** Abierto / bloquea la aceptación de HU-31.
- **Cuenta autenticada:** Leonardo Liang, pasaporte `US-DEMO-1003`, nacionalidad Estados Unidos.
- **Resultado observado:** El formulario permitió registrar `Daniela` como primer apellido, `Daniela` como segundo apellido y `Daniela` como nombres, aunque la cuenta autenticada corresponde a Leonardo Liang.
- **Resultado esperado:** Para un solicitante autenticado, los datos personales identificatorios deben autocompletarse desde su cuenta y no deben poder sustituirse por datos incompatibles. Si el trámite admite una representación distinta, debe existir un flujo explícito de apoderado y autorización; no debe aceptarse silenciosamente desde el formulario del titular.
- **Impacto:** Se puede crear un trámite con identidad inconsistente respecto de la cuenta autenticada.
- **Evidencia:** Reporte manual del PO en la ejecución local de CP-04; completar con captura y/o identificador del trámite.
- **Acción siguiente:** Backend debe validar titularidad/coincidencia antes de guardar; frontend debe bloquear o deshabilitar los campos identificatorios del titular y mostrar un error claro. Repetir CP-04 y regresión después de la corrección.

## Evidencia adicional INC-31-04-001

- **Cuenta:** Turista Daniela Anaya, pasaporte `CO-DEMO-1001`.
- **Observación en interfaz:** los campos de datos personales permanecen editables y aceptan valores incompatibles como `hola`, aunque la cuenta autenticada tiene identidad definida.
- **Resultado:** CP-04 continúa fallido en la capa visual. La validación backend evita guardar la inconsistencia, pero el frontend debe bloquear o proteger esos campos para solicitantes normales.
- **Excepción:** el Pasante de Bufete puede mantener edición cuando activa `Datos de prueba · Solo demostración`.
- **Acción:** corregir la pantalla P-09/P-17 para diferenciar cuenta actual y modo de prueba; repetir la prueba con Turista y con Pasante.

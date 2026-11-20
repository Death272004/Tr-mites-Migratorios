# TASK-31.4 · Registro de aceptaciones, bloqueos y errores conocidos

**Sprint:** 7 · Aceptación, documentación y entrega
**Responsable:** Product Owner
**Fecha de apertura:** 2026-11-19
**Estado:** HU-31 aceptada con observación · pendiente de HU-32 a HU-34

## Propósito

Registrar la decisión del Product Owner sobre cada historia del Sprint 7 después de revisar sus criterios, resultados y evidencias. Este registro no marca historias como aceptadas antes de ejecutar las pruebas.

## Resumen por historia

| Historia | Alcance | Estado de aceptación | Bloqueo actual | Errores conocidos | Evidencia | Decisión del PO |
|---|---|---|---|---|---|---|
| HU-31 | Pruebas de aceptación y regresión | Aceptada con observación | CP-12 bloqueado por falta de endpoint real de descarga. | CP-12 sin evidencia HTTP del endpoint protegido. | Matriz TASK-31.1; ejecución TASK-31.2/31.3; informes HU28/HU29; capturas CP-12. | Aceptada con observación por el Product Owner |
| HU-32 | Documentación técnica y de usuario | Pendiente | Falta revisar la documentación final contra el código y los criterios. | Ninguno confirmado en esta fecha. | Pendiente de revisión DOC-01…DOC-04. | Pendiente |
| HU-33 | Instalación limpia y empaquetado | Pendiente | Falta verificar instalación limpia, semillas y paquete final. | Ninguno confirmado en esta fecha. | Pendiente de INST-01…INST-05. | Pendiente |
| HU-34 | Demostración y evaluación final | Pendiente | Falta preparar y ejecutar la demostración con evidencias. | Ninguno confirmado en esta fecha. | Pendiente de DEMO-01…DEMO-04. | Pendiente |

## Registro detallado de incidencias

| ID | Historia/caso | Tipo | Descripción | Severidad | Responsable | Estado | Evidencia | Acción siguiente |
|---|---|---|---|---|---|---|---|---|
| INC-31-12-001 | CP-12 | Bloqueo de evidencia | La captura muestra ERR_FILE_NOT_FOUND de un archivo local, no una respuesta HTTP del endpoint protegido. | Media | Edwin (QA) | Abierto | Capturas CP-12 del PO | Repetir con documento persistido y Network. |

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

- **HU-31:** Aceptada con observación. CP-01 a CP-09 consolidados; CP-10 y CP-11 aprobados mediante informes existentes; CP-12 permanece bloqueado por falta de endpoint real de descarga.
- **HU-32:** Pendiente.
- **HU-33:** Pendiente.
- **HU-34:** Pendiente.
- **Aceptación global del Sprint 7:** Pendiente de HU-32, HU-33 y HU-34.

> Este archivo es local y no se publicará hasta la validación del Product Owner.

## Actualización posterior a TASK-31.2 y TASK-31.3

- TASK-31.2: 152 pruebas automatizadas, 0 fallos, 0 errores y 0 omitidas.
- TASK-31.3: regresión automatizada completa en verde (`BUILD SUCCESS`).
- CP-10: evidencia existente en `QA/sprint-6/rendimiento/HU29-informe.md`; métricas dentro del umbral.
- CP-11: evidencia existente en `QA/sprint-6/seguridad/HU28-informe.md`; 0 críticos/altos abiertos.
- CP-12: bloqueado por falta de respuesta HTTP del endpoint protegido.
- Evidencia: `docs/evidencias/sprint-7-task-31.2-31.3-ejecucion.md`.
- Decisión HU-31: pendiente de completar las pruebas manuales y la revisión del Product Owner.

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

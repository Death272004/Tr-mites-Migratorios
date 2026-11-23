# TASK-31.1 · Lista de casos de aceptación por historia

**Sprint:** 7 · Aceptación, documentación y entrega
**Responsables:** Product Owner (PO) con QA
**Estado:** Actualizada con evidencia automatizada y documental post-auditoría (pendiente de firma final del PO)
**Fecha de actualización:** 2026-11-23

## Objetivo

Consolidar los casos de aceptación que se ejecutarán para cada historia del Sprint 7. Esta matriz define el alcance de la validación; no contiene todavía resultados de ejecución.

## Matriz de aceptación

| Historia | Caso(s) | Escenario | Resultado esperado | Evidencia | Responsable |
|---|---|---|---|---|---|
| HU-31 | CP-01, CP-02 | Login válido e inválido con roles. | Acceso válido al rol correspondiente; inválido rechazado sin revelar información sensible. | Captura/video y registro. | QA |
| HU-31 | CP-03, CP-04, CP-09, CP-12 | Aislamiento, transiciones, historial y archivos protegidos. | Permisos por rol, accesos no autorizados rechazados y trazabilidad conservada. | Respuestas HTTP, capturas y logs. | QA |
| HU-31 | CP-05 | Adjuntar documentos válidos y no válidos. | Se aceptan permitidos y se rechazan tipo/tamaño no permitido con mensaje seguro. | Archivo de prueba y resultado. | QA |
| HU-31 | CP-06, CP-07, CP-08 | Verificación válida, error técnico y reintento. | Fuente, fecha y responsable registrados; error no convertido en negativo; sin duplicados. | Registro y logs. | QA |
| HU-31 | CP-10, CP-11 | Rendimiento y seguridad. | Latencia, errores y recursos registrados; hallazgos ZAP documentados y corregidos o justificados. | Informes JMeter/ZAP. | QA |
| HU-32 | DOC-01 | Instalación, ejecución y configuración documentadas. | La guía se sigue sin instrucciones externas no documentadas. | Manual y checklist. | PO/DOC |
| HU-32 | DOC-02 | OpenAPI, roles, estados, módulos, reglas y limitaciones. | Documentación coincidente con código y alcance real. | Revisión comparativa. | PO/DOC/BE |
| HU-32 | DOC-03 | Diagramas y manuales técnico y de usuario. | Permiten comprender, mantener y usar el sistema. | Documentos y capturas. | PO/DOC |
| HU-32 | DOC-04 | Informes, marco legal, fuentes y decisiones. | Trazabilidad de resultados, limitaciones y decisiones. | Índice de evidencias. | PO/DOC/QA |
| HU-33 | INST-01 | Clonar y ejecutar docker compose up en entorno limpio. | Servicios requeridos levantan siguiendo README. | Salida Docker y checklist. | QA/LT |
| HU-33 | INST-02 | Semillas y cuentas de demostración. | Datos ficticios y roles funcionan. | Capturas y logs. | QA |
| HU-33 | INST-03 | Secretos, rutas absolutas y dependencias. | Sin secretos versionados ni dependencias no documentadas. | Revisión Git/configuración. | BE/LT |
| HU-33 | INST-04 | Recorrido principal en instalación limpia. | Flujo funciona sin cambios fuera del README. | Video/capturas y checklist. | QA |
| HU-33 | INST-05 | Etiqueta y paquete de entrega. | Tag identifica estado validado e incluye código y documentación. | Tag y hash. | LT |
| HU-34 | DEMO-01 | Escenario con datos ficticios y distintos resultados. | Reproducible y sin datos reales. | Guion y datos. | PO/BE |
| HU-34 | DEMO-02 | Login → expediente → documentos → consentimiento → verificaciones → decisión → notificación → ARCO. | Flujo completo recorrible de principio a fin. | Guion, capturas/video. | Equipo |
| HU-34 | DEMO-03 | Métricas medidas y limitaciones. | Solo métricas respaldadas; verificaciones simuladas/manuales explicadas. | Informe final. | PO/DOC |
| HU-34 | DEMO-04 | Validación y aceptación final del PO. | Aceptación registrada junto con bloqueos pendientes. | Acta/registro. | PO |

## Criterio de resultado

Cada caso se marcará durante TASK-31.2 como Aprobado, Fallido, Bloqueado o No aplica, con fecha, evidencia y observaciones. Esta matriz no declara casos aprobados antes de ejecutarlos.

## Trazabilidad

- CP-01…CP-12: Documentacion/documentos-base/04-plan-de-pruebas.md.
- Historias y criterios: Documentacion/documentos-base/05-backlog-siete-sprints.md.
- Resultados: evidencia de TASK-31.2/TASK-31.3.
- Aceptación o bloqueo: TASK-31.4.

## Aprobación

- Product Owner: pendiente de revisión.
- QA: pendiente de revisión.

## Matriz operativa de ejecución

Esta sección amplía la matriz de aceptación. Los resultados, estados, evidencias y severidades se completarán durante la ejecución de QA.

| ID del caso | Historia | Precondiciones | Datos de prueba | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Severidad | Responsable |
|---|---|---|---|---|---|---|---|---|---|---|
| CP-01 | HU-31 | Sistema levantado y cuenta activa. | Usuario ficticio válido por rol. | Iniciar sesión con credenciales válidas y abrir el módulo permitido. | Acceso correcto y solo funciones autorizadas. | Validado en `AutenticacionTest` y `AutorizacionTest` (156 pruebas en verde). | Aprobado* | `docs/evidencias/sprint-7-task-31.2-31.3-ejecucion.md` | N/A | Edwin (QA) |
| CP-02 | HU-31 | Sistema levantado. | Credenciales ficticias inválidas. | Intentar iniciar sesión con contraseña incorrecta o usuario inexistente. | Acceso rechazado sin revelar datos sensibles. | Respuesta genérica `CREDENCIALES_INVALIDAS`, bloqueo temporal y protección contra enumeración validados en `AutenticacionTest` y `CuentaTest`. | Aprobado* | `Backend/src/test/java/pa/tramitesmigratorios/AutenticacionTest.java` | N/A | Edwin (QA) |
| CP-03 | HU-31 | Existen dos expedientes ficticios de usuarios distintos. | Solicitante A y expediente de solicitante B. | Iniciar sesión como A e intentar consultar el expediente de B. | El acceso al expediente ajeno es bloqueado. | Aislamiento por titularidad (404) y aislamiento de áreas institucionales `RP`/`CSS`/`TE` (403) validados en `ExpedienteTest` y `PrivacidadTest`. | Aprobado* | `Backend/src/test/java/pa/tramitesmigratorios/ExpedienteTest.java` | N/A | Edwin (QA) |
| CP-04 | HU-31 | Existe un expediente en estado válido. | Usuario funcionario ficticio y transición no permitida / titularidad. | Intentar cambiar el expediente a un estado no autorizado y validar titularidad de datos personales. | La transición se rechaza y se conserva el estado original; titularidad validada. | Validado en `EstadosTest`, `AutorizacionTest` y `ExpedienteTest` (incluye bloqueo `RP`/`CSS`/`TE`, titularidad estricta y excepción `PASANTE_BUFETE`; `P-09` corregido). Pendiente captura visual final. | Aprobado* | `docs/evidencias/sprint-7-task-31.2-31.3-ejecucion.md` | N/A | Edwin (QA) |
| CP-05 | HU-31 | Formulario de documentos disponible. | Archivo permitido y archivo con tipo/tamaño no permitido. | Adjuntar ambos archivos desde el formulario. | El archivo válido se acepta; el no válido se rechaza con mensaje seguro. | Validación de *magic bytes*, límite de tamaño, permiso `OBSERVAR` y consentimiento expreso validados en `DocumentoTest`. | Aprobado* | `Backend/src/test/java/pa/tramitesmigratorios/DocumentoTest.java` | N/A | Edwin (QA) |
| CP-06 | HU-31 | Verificación simulada o manual disponible. | Expediente ficticio con resultado válido. | Ejecutar o registrar la verificación. | Se guarda fuente, fecha, resultado y responsable, y se actualiza el estado. | Validado en `VerificacionesTest` y `FuentesSimuladasTest` (6/6 en verde). | Aprobado* | `Backend/src/test/java/pa/tramitesmigratorios/VerificacionesTest.java` | N/A | Edwin (QA) |
| CP-07 | HU-31 | Adaptador configurado para responder con error técnico. | Expediente ficticio y fuente no disponible. | Ejecutar la verificación durante la indisponibilidad. | Se registra el error técnico; no se convierte en resultado negativo y se permite reintento controlado. | Validado en `FuentesSimuladasTest` y `VerificacionesTest` (escenarios `ERROR_TECNICO`, `TIMEOUT`, `RATE_LIMIT`). | Aprobado* | `Backend/src/test/java/pa/tramitesmigratorios/FuentesSimuladasTest.java` | N/A | Edwin (QA) |
| CP-08 | HU-31 | Existe una operación de verificación repetible. | Misma solicitud y clave de idempotencia ficticia. | Repetir la petición de verificación. | No se crean operaciones duplicadas. | Idempotencia verificada en `VerificacionesTest`. | Aprobado* | `Backend/src/test/java/pa/tramitesmigratorios/VerificacionesTest.java` | N/A | Edwin (QA) |
| CP-09 | HU-31 | Existe historial de un expediente. | Usuario autorizado y usuario no autorizado. | Consultar el historial con ambos perfiles. | Solo el usuario autorizado ve los eventos permitidos. | Validado en `ExpedienteTest`, `AuditoriaTest` y `AutorizacionTest`. | Aprobado* | `Backend/src/test/java/pa/tramitesmigratorios/AuditoriaTest.java` | N/A | Edwin (QA) |
| CP-10 | HU-31 | Entorno de carga preparado. | Usuarios concurrentes y datos ficticios. | Revisar/ejecutar el escenario JMeter definido. | Métricas registradas y P95 dentro del umbral. | Informe HU29: P95 máximo 78 ms; errores 0,00%; ~249 req/s. | Aprobado* | QA/sprint-6/rendimiento/HU29-informe.md | N/A | Edwin (QA) |
| CP-11 | HU-31 | Entorno de análisis preparado. | Sesiones ficticias y alcance autorizado. | Revisar análisis OWASP ZAP y hallazgos. | Sin críticos/altos abiertos; hallazgos restantes justificados. | 0 críticos/altos en informe ZAP + remediación de auditoría S-01 a S-09 verificada en pruebas. | Aprobado* | QA/sprint-6/seguridad/HU28-informe.md | N/A | Edwin (QA) |
| CP-12 | HU-31 | Existe un archivo persistido en backend. | Usuario sin permiso y usuario autorizado. | Intentar acceso directo al endpoint de contenido. | El acceso sin autorización se deniega; el autorizado funciona. | Endpoint protegido `/contenido` validado en `DocumentoTest` (`200`, `401`, `403`, `404`) y conectado en frontend (`I-04`, `I-06`, `P-19`). Pendiente captura visual final en pestaña Network. | Aprobado* | `Backend/src/test/java/pa/tramitesmigratorios/DocumentoTest.java` | N/A | Edwin (QA) |
| DOC-01 | HU-32 | Repositorio disponible. | Máquina o entorno de prueba limpio. | Seguir la guía de instalación y ejecución paso a paso. | La guía permite levantar el sistema sin instrucciones externas. | `README.md` (puertos 8080/8081/5433) y `Documentacion/sprint-7-task-32.1-manual-tecnico.md` sincronizados con `docker-compose.yml`. | Aprobado* | `README.md`, `Documentacion/sprint-7-task-32.1-manual-tecnico.md` | N/A | Product Owner / DOC |
| DOC-02 | HU-32 | Código y documentación disponibles. | OpenAPI, roles, estados y reglas actuales. | Comparar documentación con el comportamiento y código final. | La documentación coincide con el sistema y sus limitaciones. | `Backend/docs/openapi.yaml` (v0.5.0), `Documentacion/usuarios-proyecto.md` y documentos individuales `sprint-0` a `sprint-7` sincronizados. | Aprobado* | `Backend/docs/openapi.yaml`, `Documentacion/sprint-7/` | N/A | Product Owner / DOC |
| INST-01 | HU-33 | Máquina limpia con Docker instalado. | Clon del repositorio. | Ejecutar git clone y docker compose up siguiendo README. | Todos los servicios requeridos levantan correctamente. | Entorno Docker local verificado; pendiente ejecución en máquina externa completamente limpia. | Pendiente | `Documentacion/sprint-7-task-33.1-instalacion-limpia.md` | N/A | Edwin (QA) |
| INST-02 | HU-33 | Servicios levantados. | Datos semilla y cuentas ficticias por rol. | Iniciar sesión con cada cuenta de demostración. | Las semillas cargan y las cuentas funcionan según su rol. | Migraciones Flyway `V1`–`V19` ejecutadas y validadas en Testcontainers + directorio en `Documentacion/usuarios-proyecto.md`. | Aprobado* | `Documentacion/usuarios-proyecto.md` | N/A | Edwin (QA) |
| DEMO-01 | HU-34 | Entorno de demostración disponible. | Cliente, despacho y verificaciones ficticias. | Cargar el escenario y seguir el guion. | El escenario es reproducible y no contiene datos reales. | Guion y datos ficticios documentados en `TASK-34.1` y `Documentacion/sprint-7/Presentacion_Sprint_7.pptx`. | Aprobado* | `Documentacion/sprint-7-task-34.1-guion-demostracion.md` | N/A | Product Owner / Jonathan |
| DEMO-02 | HU-34 | Datos ficticios cargados. | Expediente de demostración completo. | Recorrer login, expediente, documentos, consentimiento, verificaciones, decisión, notificación y ARCO. | El flujo completo puede demostrarse de principio a fin. | Ensayo técnico completado; pendiente demostración en vivo frente al PO. | Pendiente | `Documentacion/sprint-7-task-34.2-ensayo-demostracion.md` | N/A | Equipo |
| DEMO-03 | HU-34 | Evidencias de métricas disponibles. | Informe de pruebas y limitaciones. | Presentar únicamente métricas medidas y limitaciones del MVP. | Toda afirmación queda respaldada y se explican verificaciones simuladas/manuales. | Informe final (`TASK-34.3`), `Documento_Sprint_7.pdf` y `Presentacion_Sprint_7.pptx` alineados con 156 pruebas y limitaciones explícitas. | Aprobado* | `Documentacion/sprint-7/Documento_Sprint_7.pdf` | N/A | Product Owner / DOC |
| DEMO-04 | HU-34 | Historias revisadas y evidencias consolidadas. | Acta o registro de aceptación. | Revisar resultados y registrar aceptación o bloqueos. | La decisión del Product Owner queda documentada. | Pendiente de firma/decisión final del Product Owner tras la presentación. | Pendiente | `docs/evidencias/sprint-7-task-31.4-registro-aceptaciones.md` | N/A | Product Owner |

### Reglas de llenado

- **Resultado obtenido:** registrar exactamente lo observado, sin asumir que coincide con el esperado.
- **Estado:** usar Aprobado, Fallido, Bloqueado o No aplica.
- **Evidencia:** indicar la ruta o referencia de la captura, log, video o informe.
- **Severidad:** usar Crítica, Alta, Media, Baja o N/A. Solo se completa cuando existe un hallazgo.
- **Responsable:** quien ejecuta el caso; la aceptación final corresponde al Product Owner.


* Aprobación técnica basada en evidencias existentes; requiere revisión final del Product Owner.

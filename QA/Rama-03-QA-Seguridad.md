# Rama QA y Seguridad — documento de trabajo

**Proyecto:** Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá
**Fuente:** `05-backlog-siete-sprints.md` (backlog maestro)
**Rol responsable:** QA (responsable de pruebas), con foco en seguridad y rendimiento

---

## 1. Objetivo de la rama

Garantizar la calidad del prototipo: pruebas funcionales, de autorización, de integración, de seguridad (**OWASP ZAP**), de rendimiento (**Apache JMeter**) y de usabilidad, dejando evidencias verificables y controlando las incidencias hasta su cierre.

## 2. Alcance de la rama por sprint

| Sprint | Qué hace esta rama |
| --- | --- |
| 1 | Apoya las pruebas de contrato de los mocks y el recorrido de integración frontend–mocks. |
| 2 | Verifica instalación limpia y construye la suite de pruebas de autorización y errores. |
| 3 | Pruebas de expedientes, documentos y notificaciones (permitido/denegado, rechazos). |
| 4 | Pruebas de transiciones, observaciones, historial y auditoría. |
| 5 | Pruebas de contrato de adaptadores, indisponibilidad, reintentos e idempotencia. |
| 6 | **Sprint clave de la rama:** suite automatizada, OWASP ZAP, JMeter y evaluación de usabilidad. |
| 7 | Aceptación, regresión e instalación limpia final. |

## 3. Con qué trabajas (herramientas)

### Obligatorias (definidas por el equipo)

| Herramienta | Uso obligatorio en esta rama |
| --- | --- |
| **OWASP ZAP** | Escaneo activo y pasivo de la aplicación y sus API (Sprint 6) + verificación final en Sprint 7. Es tu herramienta principal de seguridad. Produces el informe; CP-11 depende de ella. |
| **Apache JMeter** | Pruebas de carga: latencia, P95, solicitudes/s, % de errores, CPU/memoria, picos de concurrencia y comportamiento ante caída de dependencias (Sprint 6). CP-10 depende de ella. |
| **Docker** | Levantar el entorno de pruebas aislado, ejecutar pruebas de integración en contenedor y verificar la instalación limpia (`docker compose up`). |
| **Java** | Ejecutar y, si procede, corregir pruebas JUnit/Spring Boot Test; comprender el código del backend para diseñar casos de prueba efectivos. |

### Complementarias

| Herramienta | Uso |
| --- | --- |
| JUnit y Mockito | Pruebas unitarias y de servicio. |
| Spring Boot Test | Pruebas de integración con la base de datos y los mocks. |
| Postman o cliente HTTP | Pruebas manuales de API y verificación de códigos de estado. |
| Git | Versionado de scripts (JMeter), casos y reportes de prueba. |
| Navegador + DevTools | Pruebas manuales de interfaz y de usabilidad. |

## 4. Convenciones y Definition of Done de la rama

Una tarea de QA está terminada cuando:

1. El caso de prueba está documentado: ID, fecha, entorno, datos, resultado esperado, resultado obtenido y evidencia.
2. El resultado es reproducible por otra persona con la misma evidencia.
3. Las incidencias abiertas tienen severidad, responsable y estado; las corregidas se re-verifican.
4. Los CP asociados a la HU quedan en verde o con incidencia formalizada.
5. Los informes (seguridad, rendimiento, usabilidad) quedan en el repositorio y son enlazados desde la documentación.
6. No se usan datos personales reales en las pruebas.

**Reglas de la rama:**

* Toda prueba crítica pasa antes de aceptar la historia en el sprint.
* Sin evidencia de **OWASP ZAP** y **JMeter**, la entrega del Sprint 6/7 no se acepta.
* Un escaneo automatizado no sustituye las pruebas manuales ni la revisión de permisos por rol.
* Separar siempre: error técnico de integración ≠ resultado negativo de validación (verificarlo explícitamente en pruebas).

---

## 5. Sprints

# Sprint 1 (semanas 1–2) — Apoyo a contratos e integración

**Objetivo de la rama:** preparar la estrategia de pruebas del proyecto y verificar que los mocks cumplen contrato antes de que el frontend dependa de ellos.

**Tareas de esta rama:**

| TASK | HU | Descripción | Responsable | Estimación |
| --- | --- | --- | --- | --- |
| TASK-08.6 | HU-08 | Escribir pruebas de contrato de cada mock contra `openapi.yaml` (TE, CSS, Registro Público, SNM × 6 escenarios). | QA con BE | 5 h |
| TASK-09.5 | HU-09 | Recorrer el flujo completo con mocks (login → expediente → documentos → validaciones) y registrar incidencias de integración. | QA con FE | 4 h |
| — | — | Elaborar el plan de pruebas del proyecto: qué CP se ejecutan en cada sprint y con qué evidencia. | QA | 4 h |

**Criterios de aceptación del sprint para la rama:**

1. Los cuatro mocks pasan las pruebas de contrato con los 6 escenarios.
2. Existe un plan de pruebas que distribuye CP-01…CP-12 a lo largo de los 7 sprints.
3. El recorrido de integración no tiene bloqueos de contrato abiertos.

**DoD de la rama (Sprint 1):** informe de pruebas de contrato en verde + plan de pruebas publicado.

---

# Sprint 2 (semanas 3–4) — Entorno, autorización y errores

**Objetivo de la rama:** verificar que el entorno es reproducible y que la seguridad de acceso funciona desde el inicio.

**Tareas de esta rama:**

| TASK | HU | Descripción | Responsable | Estimación |
| --- | --- | --- | --- | --- |
| TASK-10.6 | HU-10 | Verificar arranque limpio en máquina nueva (con **Docker**) y registrar evidencia. | QA | 2 h |
| TASK-11.5 | HU-11 | Escribir pruebas de integridad del modelo y consultas de listado. | QA con BE | 5 h |
| TASK-13.4 | HU-13 | Escribir la suite de pruebas de autorización: acceso permitido y denegado por rol × endpoint. | QA con BE | 8 h |
| TASK-14.4 | HU-14 | Pruebas de cada código de error (400/401/403/404/409/5xx) y revisión de no exposición de datos. | QA | 5 h |
| TASK-12.6 | HU-12 | Pruebas de autenticación positivas y negativas (con BE). | QA con BE | Incluido en 12.6 |

**Criterios de aceptación del sprint para la rama:**

1. Instalación limpia verificada con evidencia (≤ 30 min siguiendo el `README`).
2. Matriz de autorización probada al 100 % en los casos críticos (CP-01, CP-03).
3. CP-02 en verde: acceso rechazado sin revelar detalles sensibles.
4. Ningún error expone datos personales ni trazas.

**DoD de la rama (Sprint 2):** suites de autorización y de errores en verde; evidencia de instalación limpia archivada.

---

# Sprint 3 (semanas 5–6) — Expedientes y documentos

**Objetivo de la rama:** probar el flujo principal del solicitante y la protección documental.

**Tareas de esta rama:**

| TASK | HU | Descripción | Responsable | Estimación |
| --- | --- | --- | --- | --- |
| TASK-15.5 | HU-15 | Pruebas de creación de expediente: éxito, datos inválidos y asociación indebida. | QA con BE | 6 h |
| TASK-16.4 | HU-16 | Pruebas de titularidad, paginación y rendimiento básico del listado (1.000 registros). | QA con BE | 5 h |
| TASK-17.5 | HU-17 | Pruebas documentales: archivo válido, tipo no permitido, tamaño excedido, descarga no autorizada. | QA con BE | 6 h |
| TASK-18.4 | HU-18 | Pruebas de generación de notificaciones y de contenido seguro. | QA | 4 h |

**Criterios de aceptación del sprint para la rama:**

1. CP-03 en verde: expediente ajeno bloqueado sin filtrar datos.
2. CP-05 en verde: archivo no permitido rechazado con mensaje seguro.
3. CP-12 en verde: archivo protegido deniega acceso no autorizado.
4. Pruebas de listado con 1.000 expedientes sin consultas N+1.

**DoD de la rama (Sprint 3):** CP-03, CP-05 y CP-12 verificadas con evidencia.

---

# Sprint 4 (semanas 7–8) — Estados, revisión y auditoría

**Objetivo de la rama:** probar la máquina de estados, los permisos de revisión y la cobertura de auditoría.

**Tareas de esta rama:**

| TASK | HU | Descripción | Responsable | Estimación |
| --- | --- | --- | --- | --- |
| TASK-19.5 | HU-19 | Pruebas de transiciones válidas, inválidas, concurrentes y de bloqueo por requisitos faltantes. | QA con BE | 8 h |
| TASK-20.3 | HU-20 | Pruebas de permisos y registro de observaciones con auditoría. | QA | 4 h |
| TASK-21.3 | HU-21 | Pruebas de autorización del historial (lectura autorizada y denegada). | QA | 3 h |
| TASK-22.5 | HU-22 | Pruebas de cobertura de eventos críticos (meta 100 %) y de no exposición de datos en logs. | QA con BE | 6 h |

**Criterios de aceptación del sprint para la rama:**

1. CP-04 en verde: transición no permitida rechazada, estado original conservado.
2. CP-09 en verde: historial y auditoría solo visibles para roles autorizados.
3. Cobertura del 100 % de operaciones críticas definidas en eventos de auditoría.
4. Logs auditados sin contraseñas ni datos sensibles.

**DoD de la rama (Sprint 4):** CP-04 y CP-09 en verde; informe de cobertura de auditoría archivado.

---

# Sprint 5 (semanas 9–10) — Interoperabilidad simulada

**Objetivo de la rama:** probar los adaptadores, los fallos de las instituciones y la idempotencia.

**Tareas de esta rama:**

| TASK | HU | Descripción | Responsable | Estimación |
| --- | --- | --- | --- | --- |
| TASK-23.5 | HU-23 | Pruebas de contrato por adaptador: respuesta válida, sin resultado, error técnico y timeout. | QA con BE | 6 h |
| TASK-24.4 | HU-24 | Pruebas de caída del mock, timeout, duplicación (idempotencia) y recuperación. | QA con BE | 6 h |
| TASK-25.4 | HU-25 | Verificar la trazabilidad completa de las consultas y el contenido mínimo de los logs. | QA | 4 h |
| TASK-26.4 | HU-26 | Ejecutar el recorrido completo con escenarios forzados (`X-Scenario`) y registrar incidencias. | QA con FE | 6 h |

**Criterios de aceptación del sprint para la rama:**

1. CP-06 en verde: respuesta válida registrada y estado de validación actualizado.
2. CP-07 en verde: caída de la institución → error técnico registrado y reintento permitido; **nunca** resultado negativo.
3. CP-08 en verde: petición repetida no crea operaciones duplicadas.
4. Trazabilidad verificada: finalidad, fecha, referencia y resultado mínimo de cada consulta.

**DoD de la rama (Sprint 5):** CP-06, CP-07 y CP-08 en verde con evidencia de los 6 escenarios.

---

# Sprint 6 (semanas 11–12) — Sprint clave: ZAP, JMeter y usabilidad

**Objetivo de la rama:** ejecutar toda la estrategia de calidad del Documento 4 y dejar las incidencias corregidas o documentadas.

### HU-27 — Pruebas automatizadas

**Prioridad:** Crítica · **8 PH** · **Responsable:** QA con BE

**Criterios de aceptación:**

1. Pruebas unitarias (JUnit/Mockito) de reglas de negocio, transiciones y validaciones con los casos críticos cubiertos.
2. Pruebas de API que verifican contratos, códigos de estado y errores.
3. Pruebas de integración con base de datos y mocks en contenedor (**Docker**).
4. Suite ejecutable con un comando documentado en menos de 10 minutos.
5. Cobertura ≥ 70 % en módulos críticos (estados, autorización, validaciones), medida y reportada.
6. Sin dependencia de datos externos ni de la red pública.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-27.2 | Completar pruebas de API de todos los endpoints con sus códigos esperados. | QA con BE | 8 h |
| TASK-27.3 | Completar pruebas de integración con contenedores (**Docker, obligatoria**). | QA | 8 h |
| TASK-27.1 y 27.4 | Con Backend (unitarias) y Líder técnico (CI). | Otras ramas | — |

---

### HU-28 — Validación de seguridad con OWASP ZAP

**Prioridad:** Crítica · **8 PH** · **Responsable:** QA con BE

**Criterios de aceptación:**

1. Escaneo activo y pasivo con **OWASP ZAP (herramienta obligatoria)** sobre el entorno de pruebas, con sesión autenticada por rol.
2. Revisión de cabeceras, control de acceso, validación de entradas, manejo de errores, sesiones y endpoints REST.
3. Cada hallazgo con ID, severidad, responsable, estado y fecha de corrección.
4. Todas las vulnerabilidades críticas y altas corregidas, con escaneo repetido tras las correcciones (CP-11).
5. Verificación de que respuestas, errores y logs no expongan datos personales.
6. Informe de seguridad con riesgos residuales y recomendaciones.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-28.1 | Preparar el entorno de análisis (datos, sesiones por rol, blacklist de acciones destructivas). | QA | 4 h |
| TASK-28.2 | Ejecutar escaneo automatizado con **OWASP ZAP (obligatoria)** y pruebas manuales (IDOR, BOLA, inyección, XSS, CSRF). | QA | 8 h |
| TASK-28.3 | Documentar y priorizar hallazgos en el registro de incidencias. | QA | 4 h |
| TASK-28.4 | Corregir hallazgos críticos/altos (ramas BE y FE). | Otras ramas | — |
| TASK-28.5 | Repetir escaneo, verificar y emitir el informe final. | QA | 4 h |

---

### HU-29 — Pruebas de rendimiento con Apache JMeter

**Prioridad:** Alta · **8 PH** · **Responsable:** QA con BE

**Criterios de aceptación:**

1. Escenario de carga documentado: equipo, usuarios concurrentes, duración, datos y operaciones.
2. Registro mínimo: tiempo medio, P95, solicitudes/segundo, % de errores HTTP, CPU/memoria y latencia de los mocks.
3. El P95 de operaciones principales se compara con el umbral acordado (referencia: ≤ 2 s bajo carga de referencia).
4. Prueba de indisponibilidad de una dependencia: el sistema la maneja sin caída.
5. Incidencias de rendimiento con plan de corrección y responsable.
6. Informe con métricas, conclusiones y umbrales confirmados.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-29.1 | Definir y documentar escenarios y perfiles de carga. | QA con PO | 4 h |
| TASK-29.2 | Preparar scripts y datos de **Apache JMeter (obligatoria)**: login, listado, creación, documentos, validaciones. | QA | 8 h |
| TASK-29.3 | Ejecutar pruebas de carga con **Apache JMeter** y recopilar métricas. | QA | 6 h |
| TASK-29.4 | Analizar cuellos de botella y corregir prioritarios (con Backend). | Otras ramas | — |
| TASK-29.5 | Repetir la medición y emitir el informe de rendimiento. | QA | 4 h |

---

### HU-30 — Evaluación de usabilidad (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-30.1 | Definir guion y tareas de evaluación con criterios de éxito (con PO). | QA con PO | 3 h |
| TASK-30.2 | Ejecutar sesiones con usuarios de prueba (mínimo 5) y registrar métricas. | QA | 8 h |
| TASK-30.5 | Documentar el informe de usabilidad con evidencias (con DOC). | QA con DOC | 3 h |

**Criterio de éxito:** al menos el 90 % de las tareas críticas completadas sin asistencia.

### Entregables del Sprint 6 (rama QA)

* Suite automatizada ejecutable en CI con cobertura.
* Informe de seguridad (OWASP ZAP) sin vulnerabilidades críticas/altas abiertas.
* Informe de rendimiento (JMeter) con métricas frente a umbrales.
* Informe de usabilidad con mejoras aplicadas.

### DoD del Sprint 6 (rama QA)

* CP-10, CP-11 y CP-12 verificadas con evidencia.
* Ninguna vulnerabilidad crítica o alta pendiente.
* Incidencias de rendimiento corregidas o documentadas con plan.
* Evidencias de ZAP y JMeter archivadas en el repositorio.

---

# Sprint 7 (semanas 13–14) — Aceptación, regresión e instalación final

**Objetivo de la rama:** ejecutar la aceptación completa y certificar la instalación limpia.

### HU-31 — Pruebas de aceptación y regresión

**Prioridad:** Crítica · **8 PH** · **Responsable:** QA con PO

**Criterios de aceptación:**

1. Lista de historias con estado y criterio de aceptación asociado.
2. Ejecución de los escenarios de aceptación acordados con el PO por historia cerrada.
3. Todas las pruebas críticas CP-01…CP-12 pasan con evidencia.
4. Regresión completa tras las últimas correcciones.
5. Limitaciones y errores conocidos documentados con severidad y justificación.
6. Aceptación o bloqueo por historia registrada por el PO.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-31.1 | Consolidar la lista de casos de aceptación por historia (con PO). | QA con PO | 4 h |
| TASK-31.2 | Ejecutar pruebas de aceptación de extremo a extremo con evidencia. | QA | 10 h |
| TASK-31.3 | Ejecutar la regresión completa y verificar correcciones. | QA | 6 h |
| TASK-31.4 | Registrar aceptaciones, bloqueos y errores conocidos (PO). | Otras ramas | — |

---

### HU-33 — Instalación limpia (participación)

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-33.1 | Instalación limpia en máquina nueva con **Docker** y registro de incidencias. | QA | 4 h |
| TASK-33.4 | Verificar de nuevo la instalación tras las correcciones. | QA | 3 h |

---

### HU-32 — Documentación (participación)

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-32.4 | Consolidar informes de pruebas (seguridad, rendimiento, usabilidad) y evidencias. | QA con DOC | 5 h |

### HU-28/HU-29 — Verificación final

* Re-ejecución de escaneo de **OWASP ZAP** y, si hubo cambios de peso, medición de regresión con **Apache JMeter** antes de la entrega.

### Entregables del Sprint 7 (rama QA)

* Aceptación y regresión documentadas.
* Instalación limpia verificada (2 pasadas).
* Informes de pruebas consolidados para la entrega final.

### DoD del Sprint 7 (rama QA)

* CP-01…CP-12 en verde con evidencia.
* Errores conocidos publicados con severidad.
* Instalación limpia reproducible certificada.

---

## 6. Resumen de carga de la rama QA y Seguridad

| Sprint | Tareas propias | Horas estimadas |
| --- | --- | --- |
| 1 | TASK-08.6, TASK-09.5, plan de pruebas | ~13 h |
| 2 | TASK-10.6, 11.5, 13.4, 14.4 | ~20 h |
| 3 | TASK-15.5, 16.4, 17.5, 18.4 | ~21 h |
| 4 | TASK-19.5, 20.3, 21.3, 22.5 | ~21 h |
| 5 | TASK-23.5, 24.4, 25.4, 26.4 | ~22 h |
| 6 | TASK-27.2, 27.3, 28.1–28.3, 28.5, 29.1–29.3, 29.5, 30.1, 30.2, 30.5 | ~65 h |
| 7 | TASK-31.1–31.3, 33.1, 33.4, 32.4, verificación final ZAP/JMeter | ~32 h |

**Nota:** el Sprint 6 concentra el trabajo pesado de la rama. ZAP y JMeter se ejecutan en la semana 11 para dejar la semana 12 solo de corrección y re-verificación.

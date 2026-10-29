# Rama Producto y Documentación — documento de trabajo

**Proyecto:** Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá
**Fuente:** `05-backlog-siete-sprints.md` (backlog maestro)
**Inventario oficial de pantallas:** 45 (portal P-01…P-27 + módulo interno I-01…I-18) adoptado vía registro de cambios del backlog.
**Roles responsables:** PO (Product Owner), DOC (responsable de documentación) y, en las tareas de decisión técnica, el líder técnico/arquitecto (LT)

---

## 1. Objetivo de la rama

Mantener el alcance, las prioridades y la calidad documental del producto: definir y aceptar las historias, coordinar las decisiones de diseño con el líder técnico, producir la documentación de entrega y conducir la demostración final. El **PO representa al despacho (bufete de abogados)**, cliente del producto y responsable del tratamiento de datos personales bajo la Ley 81 de 2019 y el Decreto Ejecutivo 285 de 2021: sus decisiones de alcance reflejan las necesidades del despacho (recepción, analista, resolutor, notificador, administrador y auditoría) y las de sus clientes titulares de los trámites.

## 2. Alcance de la rama por sprint

| Sprint | Qué hace esta rama |
| --- | --- |
| 1 | Viabilidad de APIs reales, criterios de aceptación de todas las pantallas y apoyo al `README` del frontend. |
| 2 | Guía de instalación (`.env.example`, `README` raíz) y aceptación de autenticación/autorización. |
| 3 | Catálogos y reglas de negocio (tipos documentales, plantillas de notificación) y aceptación de historias. |
| 4 | Matriz de transiciones por tipo de trámite (decisión de negocio clave). |
| 5 | Matriz de datos por fuente de verificación (minimización) y documentación del convenio automático futuro. |
| 6 | Guion de usabilidad, priorización de mejoras y recepción de informes. |
| 7 | Aceptación final, documentación de entrega, informe de resultados y demostración. |

## 3. Con qué trabajas (herramientas)

### Obligatorias (definidas por el equipo)

| Herramienta | Uso obligatorio en esta rama |
| --- | --- |
| **Docker** | Verificar personalmente que la instalación documentada funciona (`docker compose up`) antes de aceptar cada entrega y antes de la demostración final. |
| **OWASP ZAP** | Revisar el informe de seguridad que produce QA y no aceptar la entrega sin evidencia de ZAP (cero críticas/altas). |
| **Apache JMeter** | Revisar el informe de rendimiento que produce QA y validar los umbrales antes de aceptar el Sprint 6 y la entrega final. |
| **Java** | No escribes código Java, pero debes poder leer el contrato de la API y los informes técnicos para tomar decisiones de alcance. |

### Complementarias

| Herramienta | Uso |
| --- | --- |
| Git | Revisar cambios, aceptar historias y etiquetar la versión final. |
| OpenAPI (Swagger) | Revisar el contrato como fuente de verdad de la API. |
| Editor Markdown | Producción de la documentación del proyecto. |
| Herramientas de diagramas | Arquitectura lógica, modelo de datos y flujo de interoperabilidad. |
| Postman o cliente HTTP | Verificación puntual de funciones aceptadas. |

## 4. Convenciones y Definition of Done de la rama

Una tarea de esta rama está terminada cuando:

1. El artefacto está escrito, versionado en Git y enlazado desde el `README`.
2. Ha sido revisado por el rol afectado (PO ↔ LT ↔ DOC).
3. No afirma resultados no medidos ni integraciones reales no autorizadas (siempre con sus salvedades).
4. Refleja el estado real del proyecto al momento de escribirse.
5. El PO acepta la historia asociada.

**Reglas de la rama:**

* Todo documento distingue claramente: **MVP con fuentes de verificación simuladas / verificación manual asistida** vs. **convenio automático futuro pendiente de autorización**.
* Prohibido declarar reducciones de tiempos oficiales no medidas.
* Ningún documento contiene datos personales reales.
* Las decisiones de negocio (transiciones, catálogos, matrices) se toman con el PO y se documentan antes de programarse.

---

## 5. Sprints

# Sprint 1 (semanas 1–2) — Viabilidad, criterios y gobernanza del backlog

### HU-06 — Estudio de viabilidad de integración automática futura con fuentes de verificación

**Prioridad:** Crítica · **5 PH** · **Responsable:** LT con PO

**Como** líder técnico, **quiero** verificar si existen APIs o mecanismos de intercambio reales con cada fuente de verificación **para** decidir con evidencia que el producto se construye sobre **verificación manual asistida y fuentes de verificación simuladas**, y documentar los requisitos de un futuro convenio automático (p. ej. vía AIG).

**Criterios de aceptación:**

1. **Matriz de viabilidad de integración** con una fila por institución (SNM, TE, CSS, Registro Público, AIG).
2. Cada fila registra: canal de integración (API REST, web service, archivo, convenio, desconocido), fuente de la información, requisitos legales (Ley 81 de 2019, Decreto 285 de 2021, competencia institucional), dependencia, responsable y estado.
3. Estado explícito por fila: `VIABLE`, `PENDIENTE DE PERMISO`, `SIN INTERFAZ PUBLICADA` o `NO APLICABLE`.
4. Conclusión operativa: qué mocks se requieren y qué contrato mínimo deben cumplir.
5. Sin asumir ni declarar acceso real a datos gubernamentales; toda integración automática futura queda como pendiente de convenio y autorización (el modo actual es la verificación manual asistida).
6. Resultado revisado con el PO y enlazado desde la documentación del proyecto.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-06.1 | Definir la plantilla de la matriz de viabilidad y sus columnas obligatorias. | LT | 2 h |
| TASK-06.2 | Investigar canales públicos de SNM, TE, CSS, Registro Público y AIG. | LT | 8 h |
| TASK-06.3 | Registrar restricciones legales y de gobernanza por institución. | LT con PO | 4 h |
| TASK-06.4 | Derivar contratos y escenarios para los mocks (con Backend). | BE con LT | 3 h |
| TASK-06.5 | Socializar resultados con el PO y publicar la matriz en la documentación. | LT con DOC | 2 h |

**Entregable:** `docs/matriz-viabilidad-integracion.md`.

---

### Participación en HU-01 a HU-05 (aceptación de pantallas)

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-01.5 | Documentar el diseño base y convenciones del frontend (con FE). | DOC con FE | 2 h |
| — | Revisar y aceptar los criterios de aceptación de HU-01…HU-05 antes de que FE empiece cada HU (Definition of Ready). **Reparto:** Sprint 1 = portal (P-01…P-27); el módulo interno (I-01…I-18) se acepta en el Sprint 2. | PO | 6 h |
| — | Aceptar la etiqueta **POR CONFIRMAR** de las pantallas P-15 (pagos: captura simulada sin pasarela), P-18, P-24 y P-25, y registrar la decisión en el registro de cambios del backlog. | PO | Incluido en la aceptación |
| — | Resolver los **pendientes del inventario PEN-01…PEN-12** (backlog §5.5, detectados en el plan de ejecución del Frontend) antes de dar por aceptado el Sprint 1: visibilidad de `ARCHIVADO` (P-19), asociación de la ficha CSS (P-25), gate P-14/P-15/P-16, dueño de archivo/reactivación (I-13), SUPERVISOR, OTP de P-03, campos origen `S`, meta de tiempos, catálogos y vocabulario. Registrar cada cierre en el registro de cambios del backlog. | PO | 3 h |

**Criterio:** ninguna HU de frontend entra al sprint sin criterios de aceptación aprobados por el PO; el portal (P-01…P-27) se acepta en el Sprint 1 y el módulo interno (I-01…I-18) en el Sprint 2.

---

### Participación en HU-09 (validación del recorrido)

* El PO recorre el flujo completo con mocks (TASK-09.5) y da el visto bueno al cierre del Sprint 1.

### Entregable del Sprint 1 (rama Producto y Documentación)

* Matriz de viabilidad de integración publicada.
* Backlog priorizado con criterios de aceptación aprobados para el Sprint 2.

### DoD del Sprint 1 (rama Producto y Documentación)

* Matriz revisada por el PO con los 5 estados definidos.
* Todas las HU del Sprint 2 con criterios de aceptación aprobados (DoR cumplido).

---

# Sprint 2 (semanas 3–4) — Documentación de instalación y aceptación

**Tareas de esta rama:**

| TASK | HU | Descripción | Responsable | Estimación |
| --- | --- | --- | --- | --- |
| TASK-10.5 | HU-10 | Crear `.env.example`, `.gitignore` y la guía de instalación rápida (con BE/LT). | DOC con BE | 3 h |
| — | HU-12, HU-13, HU-14 | Revisar y aceptar autenticación, autorización y estándar de errores; verificar que la matriz rol × endpoint refleja las reglas de negocio. | PO con LT | 6 h |

**Criterios de aceptación del sprint para la rama:**

1. La guía de instalación permite a una persona nueva levantar el entorno en menos de 30 minutos.
2. `.env.example` no contiene secretos.
3. Las historias de autenticación y autorización están aceptadas por el PO.
4. La matriz de autorización está firmada por el PO (es una regla de negocio, no solo técnica).

**DoD de la rama (Sprint 2):** guía publicada + HU-12/13/14 aceptadas.

---

# Sprint 3 (semanas 5–6) — Reglas de negocio de expedientes

**Tareas de esta rama:**

| TASK | HU | Descripción | Responsable | Estimación |
| --- | --- | --- | --- | --- |
| TASK-17.1 | HU-17 | Definir el catálogo de tipos documentales permitidos, límites y reglas por trámite (con BE). | PO con BE | 4 h |
| TASK-18.2 | HU-18 | Definir plantillas de mensajes de notificación sin datos sensibles (con BE). | PO con BE | 4 h |
| — | HU-15 a HU-18 | Revisar y aceptar las historias de expedientes, documentos y notificaciones. | PO | 6 h |

**Criterios de aceptación del sprint para la rama:**

1. El catálogo de tipos documentales cubre todos los trámites del alcance, con límites de tamaño y formato.
2. Ninguna plantilla de notificación expone datos confidenciales.
3. Las 4 historias del sprint aceptadas con sus criterios verificados.

**DoD de la rama (Sprint 3):** catálogo y plantillas publicados; HU-15…HU-18 aceptadas.

---

# Sprint 4 (semanas 7–8) — Matriz de transiciones y auditoría

**Tareas de esta rama:**

| TASK | HU | Descripción | Responsable | Estimación |
| --- | --- | --- | --- | --- |
| TASK-19.1 | HU-19 | Definir con el líder técnico la **matriz de transiciones por tipo de trámite** (decisión de negocio clave, anterior a programar). | PO con LT | 4 h |
| — | HU-19 a HU-22 | Revisar y aceptar estados, observaciones, historial y auditoría. | PO | 6 h |

**Criterios de aceptación del sprint para la rama:**

1. La matriz de transiciones cubre todos los estados del alcance (incluida la decisión sobre `OBSERVADO`, `CANCELADO`, `CERRADO`, `ARCHIVADO`).
2. La matriz especifica los prerrequisitos de los estados finales (validaciones y requisitos obligatorios).
3. El PO valida que la auditoría cubre las operaciones críticas que le interesan al proyecto.
4. Las 4 historias aceptadas.

**DoD de la rama (Sprint 4):** matriz de transiciones publicada y aprobada; HU-19…HU-22 aceptadas.

---

# Sprint 5 (semanas 9–10) — Minimización de datos y documentación de integración

**Tareas de esta rama:**

| TASK | HU | Descripción | Responsable | Estimación |
| --- | --- | --- | --- | --- |
| TASK-25.1 | HU-25 | Formalizar la **matriz de datos por fuente de verificación** (campo → finalidad → base legal → responsable) con el líder técnico. | PO con LT | 4 h |
| TASK-23.6 | HU-23 | Documentar el procedimiento de sustitución de una fuente simulada por un convenio automático futuro autorizado (con LT). | DOC con LT | 3 h |
| — | HU-23 a HU-26 | Revisar y aceptar la verificación de fuentes (modo demostración y manual asistido); verificar la distinción error técnico vs. resultado negativo desde el negocio. | PO | 6 h |

**Criterios de aceptación del sprint para la rama:**

1. La matriz de datos cubre las tres fuentes de verificación simuladas con su base legal (Ley 81 de 2019 y Decreto Ejecutivo 285 de 2021).
2. La documentación del convenio automático futuro lista prerrequisitos: convenio, permiso, contrato, validación jurídica.
3. El PO confirma que ningún error técnico se presenta como resultado negativo en la experiencia de usuario.
4. Las 4 historias aceptadas.

**DoD de la rama (Sprint 5):** matriz de datos y guía de integración publicadas; HU-23…HU-26 aceptadas.

---

# Sprint 6 (semanas 11–12) — Usabilidad y recepción de informes

**Tareas de esta rama:**

| TASK | HU | Descripción | Responsable | Estimación |
| --- | --- | --- | --- | --- |
| TASK-30.1 | HU-30 | Definir guion y tareas de evaluación de usabilidad con criterios de éxito (con QA). | PO con QA | 3 h |
| TASK-30.3 | HU-30 | Clasificar dificultades y priorizar correcciones con el frontend. | PO con FE | 4 h |
| — | HU-27 a HU-30 | Recibir y revisar los informes de pruebas, seguridad (ZAP) y rendimiento (JMeter); decidir aceptación o correcciones. | PO con QA | 6 h |

**Criterios de aceptación del sprint para la rama:**

1. Tareas de usabilidad definidas con el PO antes de las sesiones.
2. Meta de usabilidad verificada: ≥ 90 % de tareas críticas sin asistencia.
3. Revisión formal del informe de **OWASP ZAP**: cero vulnerabilidades críticas/altas.
4. Revisión formal del informe de **Apache JMeter**: umbrales acordados cumplidos o plan de corrección aprobado.
5. HU-27…HU-30 aceptadas con las correcciones aplicadas.

**DoD de la rama (Sprint 6):** los dos informes obligatorios (ZAP y JMeter) revisados y aceptados por el PO.

---

# Sprint 7 (semanas 13–14) — Aceptación final, documentación de entrega y demostración

### HU-31 — Pruebas de aceptación y regresión (participación)

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-31.1 | Consolidar la lista de casos de aceptación por historia (con QA). | PO con QA | 4 h |
| TASK-31.4 | Registrar la aceptación o los bloqueos pendientes de cada historia. | PO | 4 h |

**Criterios:** escenarios de aceptación ejecutados, funciones críticas en verde (CP-01…CP-12), regresión realizada, limitaciones conocidas registradas.

---

### HU-32 — Documentación técnica y de usuario

**Prioridad:** Alta · **5 PH** · **Responsable:** DOC con LT

**Criterios de aceptación:**

1. Guía de instalación y ejecución paso a paso verificada en máquina nueva.
2. API documentada en OpenAPI actualizada al estado final.
3. Documentación de roles, estados, módulos, reglas de negocio y limitaciones.
4. Diagramas actualizados: arquitectura lógica, modelo de datos, flujo de interoperabilidad.
5. Manuales: técnico (mantenimiento) y de usuario (por rol) con capturas.
6. Resultados de pruebas: informes de seguridad, rendimiento y usabilidad consolidados.
7. Registro de decisiones técnicas y de la matriz de viabilidad de fuentes de verificación.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-32.1 | Redactar el manual técnico (arquitectura, entorno, base de datos, despliegue). | DOC con LT | 8 h |
| TASK-32.2 | Redactar el manual de usuario por rol con capturas (con FE). | DOC con FE | 8 h |
| TASK-32.4 | Consolidar informes de pruebas, matriz de viabilidad y registro de decisiones (con QA). | DOC con QA | 5 h |
| TASK-32.3 | Contrato, diagramas y modelo de datos al estado final (con BE/LT). | Otras ramas | — |

---

### HU-33 — Instalación limpia (participación)

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-33.3 | Etiquetar la versión final y preparar el paquete de entrega (código + docs). | LT | 3 h |

---

### HU-34 — Demostración y evaluación final

**Prioridad:** Alta · **6 PH** · **Responsable:** PO con equipo

**Criterios de aceptación:**

1. Escenario de demostración con datos ficticios preparado (titular, funcionario, verificaciones con distintos escenarios).
2. Flujo completo demostrado: login → creación → documentos → verificaciones (fuente simulada o resultado registrado en modo manual asistido) → observación → decisión → notificación.
3. Métricas **del despacho** medidas en el producto: preparación de expedientes, observaciones evitadas y documentos repetidos, **sin afirmar resultados no medidos ni tiempos oficiales** del proceso migratorio real (los 3–8 meses son solo referencia externa del proceso oficial).
4. Limitaciones expuestas explícitamente: **sin integraciones institucionales reales** (verificación manual asistida; capa de adaptadores preparada para un futuro convenio automático), convenios y permisos pendientes, alcance del MVP.
5. El Product Owner (que representa al despacho) valida los entregables finales y registra la aceptación.
6. Presentación final e informe de resultados en el repositorio.
7. **Validación jurídica** de la documentación de tratamiento de datos (Ley 81 de 2019 y Decreto Ejecutivo 285 de 2021: consentimiento informado, consentimiento expreso para datos sensibles, derechos ARCO, minimización) registrada como **entregable** o como **pendiente explícito**.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-34.1 | Preparar datos ficticios y guion del escenario de demostración (con BE). | PO con BE | 5 h |
| TASK-34.2 | Ensayar la demostración completa y corregir detalles. | Equipo | 4 h |
| TASK-34.3 | Elaborar el informe de resultados con métricas **del despacho** (preparación de expedientes, observaciones evitadas, documentos repetidos), limitaciones y recomendaciones. | DOC con PO | 8 h |
| TASK-34.4 | Preparar y ejecutar la presentación final; registrar la aceptación. | PO | 5 h |

### Entregables del Sprint 7 (rama Producto y Documentación)

* Documentación completa (técnica, de usuario, contratos, diagramas, informes).
* Aceptación final del proyecto registrada.
* Informe de resultados con métricas **del despacho** (preparación de expedientes, observaciones evitadas, documentos repetidos) y con las limitaciones explícitas (sin integraciones institucionales; verificación manual asistida).
* **Validación jurídica (Ley 81 de 2019)** registrada como entregable o como pendiente explícito.
* Presentación final.

### DoD de la rama (Sprint 7)

* Aceptación documentada por historia y del proyecto en general.
* Toda la documentación enlazada desde el `README` y verificada.
* Informe final con métricas del despacho (preparación de expedientes, observaciones evitadas, documentos repetidos), sin afirmar tiempos oficiales ni resultados no medidos, y con limitaciones explícitas (sin integraciones institucionales; verificación manual asistida).

---

## 6. Resumen de carga de la rama Producto y Documentación

| Sprint | Tareas propias | Horas estimadas |
| --- | --- | --- |
| 1 | TASK-06.1–06.5, TASK-01.5, aprobación de HU-01…HU-05 | ~25 h |
| 2 | TASK-10.5, aceptación de HU-12/13/14 | ~9 h |
| 3 | TASK-17.1, TASK-18.2, aceptación de HU-15…HU-18 | ~14 h |
| 4 | TASK-19.1, aceptación de HU-19…HU-22 | ~10 h |
| 5 | TASK-25.1, TASK-23.6, aceptación de HU-23…HU-26 | ~13 h |
| 6 | TASK-30.1, TASK-30.3, revisión de informes ZAP/JMeter | ~13 h |
| 7 | TASK-31.1, 31.4, 32.1, 32.2, 32.4, 33.3, 34.1–34.4 | ~46 h |

**Nota:** el rol de documentación se concentra en los Sprints 1 y 7; si el equipo es pequeño, DOC puede combinarse con PO, pero las tareas de aceptación (PO) y de redacción (DOC) deben planificarse por separado para no subestimar la carga.

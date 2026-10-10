# Rama Backend — documento de trabajo

**Proyecto:** Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá
**Fuente:** `05-backlog-siete-sprints.md` (backlog maestro)
**Rol responsable:** BE (desarrollador backend) con el líder técnico/arquitecto (LT) en las tareas de diseño y contratos

---

## 1. Objetivo de la rama

Implementar el servidor del prototipo en **Java**: API REST, reglas de negocio, persistencia, seguridad, auditoría y la capa de interoperabilidad con las instituciones (primero con APIs ficticias, después lista para sustituirlas por integraciones autorizadas).

## 2. Alcance de la rama por sprint

| Sprint | Qué hace esta rama |
| --- | --- |
| 1 | Contratos de API (OpenAPI) y **APIs ficticias** de TE, CSS, Registro Público y SNM. |
| 2 | Entorno reproducible (Docker + Java + PostgreSQL), modelo de datos, autenticación, autorización y manejo de errores. |
| 3 | Expedientes, documentos y notificaciones. |
| 4 | Máquina de estados, observaciones, historial y auditoría. |
| 5 | Adaptadores institucionales, orquestación de validaciones, reintentos, idempotencia y minimización. |
| 6 | Pruebas unitarias/API/integración y corrección de hallazgos de seguridad y rendimiento. |
| 7 | Correcciones finales, empaquetado y apoyo a documentación e instalación limpia. |

## 3. Con qué trabajas (herramientas)

### Obligatorias (definidas por el equipo)

| Herramienta | Uso obligatorio en esta rama |
| --- | --- |
| **Java** (JDK 17+) | Lenguaje de todo el backend (Spring Boot). Sin Java no hay backend: ninguna tarea de esta rama se da por hecha sin código Java que pase las pruebas. |
| **Docker** | Entorno reproducible (`docker compose up`: backend, PostgreSQL, frontend), pruebas de integración en contenedor e instalación limpia. |
| **Apache JMeter** | Sprint 6: analizas los cuellos de botella que arroja JMeter y aplicas las optimizaciones (índices, consultas N+1, caché). |
| **OWASP ZAP** | Sprint 6: corriges los hallazgos de ZAP atribuidos al servidor (autorización, validación de entrada, cabeceras, sesiones, exponer datos en errores/logs). |

### Complementarias

| Herramienta | Uso |
| --- | --- |
| Spring Boot | Framework del backend, seguridad y API REST. |
| PostgreSQL | Base de datos operativa. |
| Flyway o Liquibase | Migraciones versionadas del esquema. |
| JUnit y Mockito | Pruebas unitarias y de servicio. |
| Spring Boot Test + Docker | Pruebas de integración con contenedores. |
| Postman o cliente HTTP | Verificación manual de endpoints. |
| OpenAPI (Swagger) | Contrato y documentación de la API (fuente única). |
| Git | Versionado, revisión y trazabilidad. |

## 4. Convenciones y Definition of Done de la rama

Una tarea de backend está terminada cuando:

1. El código Java está implementado, revisado y fusionado en Git.
2. Cumple el contrato `openapi.yaml` (si el contrato cambia, se actualiza primero y se registra).
3. Las pruebas relevantes pasan: unitarias, de API e integración cuando aplique.
4. La autorización se verifica en el servidor (nunca solo en la interfaz).
5. Los errores responden los códigos acordados (400/401/403/404/409/5xx) sin exponer datos personales ni trazas.
6. Las operaciones críticas generan evento de auditoría.
7. No hay secretos en el código; la configuración vive en variables de entorno.
8. Documentación/OpenAPI actualizada; el PO acepta la historia.

**Reglas de la rama:**

* Todo funciona con **datos ficticios**; prohibido el uso de datos personales reales.
* Los mocks institucionales son sustituibles: la lógica de negocio habla con interfaces (puertos), nunca con los mocks directamente.
* Un error técnico de integración **jamás** se convierte en resultado negativo de una validación.
* Cada consulta a una institución guarda finalidad, fecha, referencia y resultado mínimo.

---

## 5. Sprints

# Sprint 1 (semanas 1–2) — APIs ficticias y contratos

**Objetivo de la rama:** dejar listos los contratos de la API y los mocks de las cuatro instituciones con sus escenarios de error, para que el frontend pueda integrar desde el día 1 del Sprint 2.

### HU-07 — Contratos de API (OpenAPI) del prototipo

**Prioridad:** Crítica · **3 PH** · **Responsable:** LT con BE

**Como** equipo técnico, **quiero** definir los contratos de la API antes de implementarlos **para** que frontend y backend trabajen en paralelo sobre un acuerdo verificable.

**Criterios de aceptación:**

1. `openapi.yaml` cubre autenticación, expedientes, documentos, estados, validaciones, auditoría y mocks.
2. Cada operación documenta método, ruta, parámetros, cuerpo, respuestas (2xx/4xx/5xx) y control de autorización.
3. Códigos y errores coherentes con el Documento 3 (400, 401, 403, 404, 409, 5xx).
4. Incluye los headers de escenario (`X-Scenario`) de los mocks.
5. Valida sin errores con linter de OpenAPI y se versiona en Git.
6. Procedimiento de cambios acordado: toda modificación se registra en el changelog antes de implementarse.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-07.1 | Definir esquemas de datos compartidos (Expediente, Documento, Validación, Evento de auditoría, Error). | LT | 4 h |
| TASK-07.2 | Escribir las operaciones de autenticación, expedientes y documentos. | BE | 4 h |
| TASK-07.3 | Escribir las operaciones de estados, validaciones, auditoría y mocks. | BE | 4 h |
| TASK-07.4 | Validar el archivo con linter, corregir y versionar. | BE | 2 h |

---

### HU-08 — APIs ficticias (mocks) de las instituciones

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE

**Como** equipo de desarrollo, **quiero** exponer APIs ficticias de TE, CSS, Registro Público y SNM **para** construir y probar el flujo completo sin depender de integraciones reales.

**Criterios de aceptación:**

1. Los cuatro endpoints implementados y respondiendo con datos ficticios coherentes, sin datos personales reales:
   * `GET /api/mock/te/personas/{tipoDoc}/{numero}`
   * `GET /api/mock/css/afiliaciones/{idPersona}`
   * `GET /api/mock/registro/consultas/{idPersona}`
   * `GET /api/mock/snm/expedientes/{numero}`
2. Cada mock soporta `X-Scenario`: `OK`, `SIN_RESULTADO`, `ERROR_TECNICO`, `TIMEOUT`, `RATE_LIMIT`, `DATOS_INCOMPLETOS`.
3. Respuestas conformes a `openapi.yaml` (pruebas de contrato).
4. Latencia simulada configurable para probar tiempos de espera.
5. Datos ficticios maestro (personas, afiliaciones, registros) en fixture versionado, coherente con las pantallas de demostración.
6. La capa de integración apunta a interfaces, no a los mocks (requisito de sustitución por integración autorizada).
7. El mock del SNM es coherente con los expedientes de la plataforma o explica su desfase.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-08.1 | Definir el modelo de datos ficticios maestro y su fuente única (fixture versionada). | BE | 4 h |
| TASK-08.2 | Implementar el mock del TE con sus escenarios. | BE | 6 h |
| TASK-08.3 | Implementar el mock de la CSS con sus escenarios. | BE | 5 h |
| TASK-08.4 | Implementar el mock del Registro Público con sus escenarios. | BE | 5 h |
| TASK-08.5 | Implementar el mock del SNM y la lógica de escenarios y latencia simulada. | BE | 5 h |
| TASK-08.6 | Escribir pruebas de contrato de cada mock contra `openapi.yaml`. | BE con QA | 5 h |
| TASK-08.7 | Documentar el uso de los mocks y de `X-Scenario` para el equipo. | BE con DOC | 2 h |

**Pruebas asociadas:** CP-06, CP-07.

---

### HU-06 — Estudio de viabilidad de APIs reales (participación técnica)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-06.4 | Derivar de la matriz de viabilidad los contratos y escenarios que deben cubrir los mocks. | BE con LT | 3 h |

**Dependencias:** matriz de viabilidad (HU-06, rama Producto y Documentación).

---

### HU-09 — Integración frontend–mocks (participación)

**Tareas de esta rama (apoyo):**

* Mantener los mocks y el contrato estables durante la integración del frontend.
* Resolver incidencias de contrato que aparezcan en el recorrido (TASK-09.5, con FE y QA).

### Entregables del Sprint 1 (rama Backend)

* `openapi.yaml` validado y versionado.
* Cuatro mocks operativos con seis escenarios y latencia simulada.
* Pruebas de contrato en verde.

### DoD del Sprint 1 (rama Backend)

* Contrato validado con linter; mocks conformes al contrato.
* Ningún dato personal real en fixtures.
* Documentación de uso de mocks publicada.

---

# Sprint 2 (semanas 3–4) — Entorno, datos y seguridad base

**Objetivo de la rama:** entorno reproducible en Docker, modelo de datos con integridad, autenticación y autorización reales, y estándar de errores API.

### HU-10 — Entorno reproducible

**Prioridad:** Crítica · **5 PH** · **Responsable:** LT con BE

**Como** desarrollador, **quiero** levantar backend, base de datos y frontend con un solo comando **para** eliminar diferencias entre entornos.

**Criterios de aceptación:**

1. `docker compose up` levanta backend, PostgreSQL y frontend sin pasos manuales.
2. El proyecto Java compila y arranca con el comando documentado en el `README` raíz.
3. Migraciones automáticas al arrancar (Flyway/Liquibase), reproducibles desde cero.
4. Configuración por variables de entorno con `.env.example` sin secretos.
5. `.gitignore` adecuado y sin credenciales en el historial.
6. Un integrante nuevo levanta el entorno en menos de 30 minutos siguiendo el `README`.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-10.1 | Inicializar el repositorio con estructura backend/frontend/docs y convenciones de ramas. | LT | 3 h |
| TASK-10.2 | Configurar Spring Boot con perfiles (`local`, `test`) y dependencias base — backend en **Java (obligatoria)**. | BE | 4 h |
| TASK-10.3 | Configurar PostgreSQL y migraciones del esquema inicial. | BE | 6 h |
| TASK-10.4 | Crear `Dockerfile` y `docker-compose.yml` (backend, db, frontend) con healthchecks — **Docker (obligatoria)**. | BE con FE | 6 h |
| TASK-10.5 | Crear `.env.example`, `.gitignore` y guía de instalación rápida. | BE con DOC | 3 h |
| TASK-10.6 | Verificar arranque limpio en máquina nueva y registrar evidencia. | QA | 2 h |

---

### HU-11 — Modelo de datos e infraestructura de persistencia

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE

**Como** equipo técnico, **quiero** implementar el modelo de datos con integridad y restricciones **para** que toda la aplicación se apoye en datos consistentes.

**Criterios de aceptación:**

1. Entidades implementadas: Usuario, Rol, Expediente, Documento, Validación, Resultado de validación, Historial de estados, Evento de auditoría, Notificación.
2. Claves primarias y foráneas con restricciones (no nulos, unicidad, eliminación restringida donde aplique).
3. Repositorios/mappers separados de los servicios de negocio.
4. Datos semilla: roles, tipos de trámite, tipos documentales y usuarios de demostración por rol.
5. Consultas de listado por titularidad e estado probadas con índices adecuados.
6. Minimización: no se almacena dato personal institucional cuando basta la referencia de consulta.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-11.1 | Implementar entidades y relaciones de usuarios, roles y permisos. | BE | 5 h |
| TASK-11.2 | Implementar entidades de expediente, documento e historial de estados. | BE | 6 h |
| TASK-11.3 | Implementar entidades de validación, resultado y evento de auditoría. | BE | 5 h |
| TASK-11.4 | Escribir migraciones y datos semilla por tipo de trámite. | BE | 5 h |
| TASK-11.5 | Escribir pruebas de integridad y consultas de listado. | BE con QA | 5 h |

---

### HU-12 — Autenticación real

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE

**Como** usuario, **quiero** autenticarme con credenciales reales protegidas **para** acceder al sistema de forma segura.

**Criterios de aceptación:**

1. `POST /api/auth/login` valida credenciales y devuelve token/sesión con expiración.
2. Contraseñas con hash adaptativo (BCrypt/Argon2); nunca en texto plano ni en logs.
3. Límite de intentos con bloqueo temporal y mensaje genérico (CP-02).
4. Cierre de sesión invalida el token/sesión.
5. Cambio de contraseña exige la actual y aplica la política de complejidad.
6. Endpoints protegidos rechazan sin credenciales con `401` (CP-01/CP-02).
7. Secretos de configuración fuera del código fuente.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-12.1 | Implementar entidades de usuario y hash de contraseñas con política de complejidad. | BE | 5 h |
| TASK-12.2 | Implementar `POST /api/auth/login`, emisión de token/sesión y expiración. | BE | 6 h |
| TASK-12.3 | Implementar límite de intentos, bloqueo temporal y mensajes genéricos. | BE | 4 h |
| TASK-12.4 | Implementar cierre de sesión y cambio de contraseña. | BE | 4 h |
| TASK-12.5 | Conectar el frontend de login (P-01, P-02, P-03) al backend real. | FE (rama Frontend) | 5 h |
| TASK-12.6 | Escribir pruebas de autenticación (positivas y negativas). | BE con QA | 5 h |

---

### HU-13 — Autorización por roles aplicada a los endpoints

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE

**Como** responsable de seguridad, **quiero** que cada endpoint verifique rol y titularidad **para** impedir accesos indebidos entre expedientes.

**Criterios de aceptación:**

1. Roles definidos: `SOLICITANTE`, `FUNCIONARIO`, `SUPERVISOR`, `AUDITOR`, `ADMIN`.
2. Regla de autorización documentada y aplicada en el backend por endpoint (no solo en la interfaz).
3. Un solicitante solo accede a sus expedientes; expediente ajeno responde `404`/`403` sin filtrar datos (CP-03).
4. El administrador técnico no obtiene permisos de lectura o decisión de expedientes por defecto.
5. Pruebas automatizadas de acceso permitido y denegado por rol y endpoint.
6. Los permisos denegados generan evento de auditoría.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-13.1 | Definir la matriz rol × endpoint × operación y documentarla. | LT con BE | 4 h |
| TASK-13.2 | Implementar el mecanismo de autorización (anotaciones/filtros) y la verificación de titularidad. | BE | 8 h |
| TASK-13.3 | Proteger todos los endpoints de la versión 1 según la matriz. | BE | 6 h |
| TASK-13.4 | Escribir la suite de pruebas de autorización (permitido/denegado por rol). | QA (rama QA) | 8 h |
| TASK-13.5 | Ajustar el frontend para mostrar/ocultar acciones según permisos reales. | FE (rama Frontend) | 4 h |

---

### HU-14 — Manejo de errores y respuestas HTTP coherentes

**Prioridad:** Alta · **5 PH** · **Responsable:** BE

**Como** consumidor de la API, **quiero** respuestas HTTP y mensajes de error consistentes y seguros **para** manejar fallos sin exponer información sensible.

**Criterios de aceptación:**

1. Manejador global de excepciones con cuerpo de error uniforme (código, mensaje seguro, correlación interna).
2. `400` entrada inválida, `401` no autenticado, `403` sin permiso, `404` inexistente/no revelable, `409` conflicto, `5xx` fallo interno.
3. Sin datos personales, pilas de trazas ni detalles de esquema en los mensajes.
4. Errores de integración técnica distinguibles de resultados de validación.
5. Cada error interno deja correlación (ID) en respuesta y logs.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-14.1 | Definir el estándar de cuerpo de error y documentarlo en OpenAPI. | LT | 3 h |
| TASK-14.2 | Implementar el manejador global de excepciones con mapeo de códigos. | BE | 6 h |
| TASK-14.3 | Aplicar el manejo de errores en servicios y adaptadores (timeouts, reintentos). | BE | 6 h |
| TASK-14.4 | Escribir pruebas de cada código de error y revisión de no exposición de datos. | QA (rama QA) | 5 h |

### Entregables del Sprint 2 (rama Backend)

* Entorno Docker reproducible con base de datos migrada.
* Modelo de datos implementado con semilla.
* Autenticación y autorización reales.
* Estándar de errores API documentado y probado.

### DoD del Sprint 2 (rama Backend)

* Arranque limpio verificado desde cero (con QA).
* Suite de autorización en verde.
* Ningún secreto en el repositorio; contraseñas con hash.
* `openapi.yaml` actualizado con lo implementado.

---

# Sprint 3 (semanas 5–6) — Expedientes y documentos

**Objetivo de la rama:** el flujo principal del solicitante y del funcionario funciona de extremo a extremo contra la base de datos real.

### HU-15 — Registro de expediente (backend)

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE con FE

**Criterios de aceptación:**

1. `POST /api/expedientes` crea el expediente con identificador único, solicitante autenticado, trámite, fecha de creación y estado inicial.
2. Validación de campos obligatorios y tipo de trámite **en el servidor** (`400` con detalle de campo).
3. No se pueden crear expedientes a nombre de otro usuario (CP-03).
4. El asistente P-05 consume el endpoint real y muestra éxito/error con el identificador generado.
5. Pruebas de creación exitosa, datos inválidos y tentativa de asociación indebida.
6. Cada creación genera evento de auditoría.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-15.1 | Implementar servicio y endpoint de creación con validaciones de dominio. | BE | 6 h |
| TASK-15.2 | Implementar la obtención del tipo de trámite y sus requisitos desde catálogos. | BE | 4 h |
| TASK-15.3 | Conectar P-05 al endpoint (rama Frontend). | FE | 6 h |
| TASK-15.4 | Emitir evento de auditoría en la creación. | BE | 3 h |
| TASK-15.5 | Escribir pruebas de creación, validación y autorización. | BE con QA | 6 h |

---

### HU-16 — Consulta y seguimiento (backend)

**Prioridad:** Crítica · **5 PH** · **Responsable:** BE con FE

**Criterios de aceptación:**

1. `GET /api/expedientes` devuelve solo los expedientes accesibles según rol y titularidad, con filtros y paginación.
2. `GET /api/expedientes/{id}` verifica acceso; id ajeno responde `404`/`403` sin datos (CP-03).
3. `GET /api/expedientes/{id}/historial` exige permiso específico de lectura.
4. P-04, P-06, P-09 y P-10 consumen estos endpoints con sus estados.
5. Rendimiento aceptable con 1.000 expedientes de prueba (sin N+1).
6. Consultas sensibles registradas en auditoría.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-16.1 | Implementar listado con filtros, paginación y proyección mínima de datos. | BE | 6 h |
| TASK-16.2 | Implementar detalle e historial con verificación de acceso. | BE | 5 h |
| TASK-16.3 | Conectar P-04, P-06, P-09 y P-10 (rama Frontend). | FE | 6 h |
| TASK-16.4 | Escribir pruebas de titularidad, paginación y rendimiento básico. | QA (rama QA) | 5 h |

---

### HU-17 — Gestión documental protegida (backend)

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE con FE

**Criterios de aceptación:**

1. `POST /api/expedientes/{id}/documentos` valida tipo MIME, tamaño máximo y firma/contenido; rechaza con mensaje seguro (CP-05).
2. Metadatos en PostgreSQL, archivo en almacenamiento protegido; sin enlaces públicos.
3. Descarga con verificación de permiso y registro en auditoría (CP-12).
4. Documento vinculado al expediente correcto con estado de revisión.
5. P-07 con progreso, éxito y error, e impedimento de envío de archivos no permitidos.
6. Pruebas de archivo válido, tipo no permitido, tamaño excedido y descarga no autorizada.
7. Prevención de duplicados: subir un tipo documental ya válido genera aviso de duplicado.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-17.1 | Definir catálogo de tipos documentales permitidos, límites y reglas por trámite. | BE con PO | 4 h |
| TASK-17.2 | Implementar carga con validación de MIME, tamaño e integridad. | BE | 8 h |
| TASK-17.3 | Implementar descarga protegida con verificación de permiso y auditoría. | BE | 5 h |
| TASK-17.4 | Conectar P-07 al backend (rama Frontend). | FE | 6 h |
| TASK-17.5 | Escribir pruebas de carga, rechazo, descarga y permisos. | QA (rama QA) | 6 h |

---

### HU-18 — Notificaciones (backend)

**Prioridad:** Alta · **5 PH** · **Responsable:** BE con FE

**Criterios de aceptación:**

1. Servicio desacoplado: la notificación se emite desde los servicios de negocio sin acoplarlos.
2. Eventos mínimos: cambio a `PENDIENTE DE DOCUMENTOS`, observación, resultado de validación, decisión final.
3. Mensajes sin datos confidenciales ni personales innecesarios.
4. P-08 lista notificaciones con fecha, tipo y estado de lectura.
5. Marcar como leída actualiza el estado sin duplicar eventos.
6. Pruebas de generación, contenido seguro y marcado de lectura.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-18.1 | Implementar entidad, endpoint y evento de notificaciones. | BE | 6 h |
| TASK-18.2 | Definir plantillas de mensajes por tipo de evento sin datos sensibles. | BE con PO | 4 h |
| TASK-18.3 | Conectar P-08 al backend (rama Frontend). | FE | 4 h |
| TASK-18.4 | Escribir pruebas de generación y de contenido seguro. | QA (rama QA) | 4 h |

### Entregables del Sprint 3 (rama Backend)

* Flujo completo del solicitante: crear → documentar → consultar.
* Almacenamiento documental protegido con descarga autorizada.
* Notificaciones operativas.

### DoD del Sprint 3 (rama Backend)

* Endpoints documentados en OpenAPI y probados.
* Suite de permisos en verde.
* Ningún archivo accesible sin autorización; auditoría de creación/consulta/descarga verificada.

---

# Sprint 4 (semanas 7–8) — Estados, revisión y auditoría

**Objetivo de la rama:** máquina de estados con transiciones controladas y auditoría completa de operaciones críticas.

### HU-19 — Máquina de estados y endpoint de transición

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE

**Criterios de aceptación:**

1. `PATCH /api/expedientes/{id}/estado` aplica la matriz de transiciones por tipo de trámite.
2. Transición no permitida responde `409`/`403` y conserva el estado original (CP-04).
3. Sin paso a estados finales sin validaciones respondidas y requisitos obligatorios completos.
4. Todo cambio registra estado anterior, nuevo, autor, fecha y motivo.
5. Transiciones concurrentes sin pérdida de actualización (control de versión optimista).
6. Estados mínimos: `BORRADOR`, `PRESENTADO`, `EN_REVISION`, `PENDIENTE_DOCUMENTOS`, `EN_VALIDACION`, `LISTO_DECISION`, `APROBADO`, `DENEGADO` (+ `OBSERVADO`, `CANCELADO`, `CERRADO` si el PO los habilita).
7. Pruebas de transiciones válidas, inválidas, concurrentes y de bloqueo.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-19.1 | Definir con el PO la matriz de transiciones por tipo de trámite. | PO con LT (rama Producto) | 4 h |
| TASK-19.2 | Implementar el servicio de dominio de transiciones con prerrequisitos. | BE | 8 h |
| TASK-19.3 | Implementar el endpoint con control de concurrencia y motivo obligatorio. | BE | 5 h |
| TASK-19.4 | Conectar P-11 (rama Frontend). | FE | 5 h |
| TASK-19.5 | Escribir pruebas de transiciones válidas, inválidas, concurrentes y bloqueo. | QA (rama QA) | 8 h |

---

### HU-20 — Observaciones (backend)

**Prioridad:** Alta · **5 PH** · **Responsable:** BE con FE

**Criterios de aceptación:**

1. Observaciones vinculadas al expediente con autor, fecha y texto obligatorio.
2. Funcionario solo registra observaciones en expedientes de su ámbito.
3. Solicitante consulta solo las observaciones de sus expedientes.
4. Una observación no equivale a decisión final ni cambia estado automáticamente.
5. P-12 y P-06 muestran el hilo.
6. Cada registro genera evento de auditoría.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-20.1 | Implementar entidad, endpoints y permisos de observaciones. | BE | 6 h |
| TASK-20.2 | Conectar P-12 y el bloque de P-06 (rama Frontend). | FE | 5 h |
| TASK-20.3 | Escribir pruebas de permisos y registro con auditoría. | QA (rama QA) | 4 h |

---

### HU-21 — Historial de estados (backend)

**Prioridad:** Crítica · **5 PH** · **Responsable:** BE con FE

**Criterios de aceptación:**

1. `GET /api/expedientes/{id}/historial` devuelve eventos en orden con autor, fecha, cambio y motivo.
2. Acceso con permiso específico; eventos no autorizados no se filtran ni revelan (CP-09).
3. P-06 y P-10 muestran la línea de tiempo.
4. Sin datos sensibles innecesarios en el historial.
5. Pruebas de lectura autorizada y denegada en verde.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-21.1 | Implementar el endpoint de historial con proyección por rol. | BE | 5 h |
| TASK-21.2 | Línea de tiempo en P-06/P-10 (rama Frontend). | FE | 5 h |
| TASK-21.3 | Escribir pruebas de autorización del historial. | QA (rama QA) | 3 h |

---

### HU-22 — Auditoría de operaciones

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE con FE

**Criterios de aceptación:**

1. Registrados: inicio/cierre de sesión, creación y cambio de estado, carga y descarga de documentos, consultas institucionales y operaciones administrativas.
2. Cada evento: actor, operación, recurso, fecha, resultado y correlación.
3. Registros protegidos: solo el rol auditor los consulta y no se modifican vía API.
4. Sin contraseñas, tokens ni datos personales innecesarios en logs (CP-11).
5. P-15 con filtros, paginación y exportación CSV.
6. Prueba de integridad: 100 % de operaciones críticas esperadas registradas.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-22.1 | Diseñar el modelo de eventos de auditoría y su política de retención. | LT con BE | 4 h |
| TASK-22.2 | Instrumentar los servicios críticos con registro de eventos (sin bloquear la operación). | BE | 8 h |
| TASK-22.3 | Implementar consulta con filtros, paginación y exportación, protegido por rol. | BE | 6 h |
| TASK-22.4 | Conectar P-15 (rama Frontend). | FE | 4 h |
| TASK-22.5 | Pruebas de cobertura de eventos críticos y de no exposición en logs. | QA (rama QA) | 6 h |

### Entregables del Sprint 4 (rama Backend)

* Máquina de estados operativa con transiciones controladas.
* Observaciones e historial con permisos.
* Auditoría consultable con cobertura del 100 % de eventos críticos.

### DoD del Sprint 4 (rama Backend)

* Ninguna transición no permitida posible vía API.
* Cobertura de eventos críticos verificada por pruebas.
* Logs sin secretos ni datos sensibles.

---

# Sprint 5 (semanas 9–10) — Interoperabilidad institucional simulada

**Objetivo de la rama:** adaptadores desacoplados, orquestación de validaciones con reintentos e idempotencia, y trazabilidad con minimización.

### HU-23 — Adaptadores institucionales

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE

**Criterios de aceptación:**

1. Interfaz (puerto) por institución: `TePort`, `CssPort`, `RegistroPublicoPort`, con implementación sobre los mocks.
2. Cada adaptador traduce la respuesta a un formato normalizado (resultado, referencia, fecha, estado técnico).
3. La lógica del expediente no importa clases de los mocks ni conoce rutas concretas (desacoplamiento verificable).
4. Configuración de timeout y reintentos por institución.
5. Pruebas de contrato por adaptador: válida, sin resultado, error técnico y timeout (CP-06, CP-07).
6. Documentado el procedimiento de sustitución por integración real autorizada.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-23.1 | Definir la interfaz común de adaptador y el DTO de respuesta normalizada. | LT | 4 h |
| TASK-23.2 | Implementar el adaptador del TE sobre su mock, con timeout y traducción. | BE | 6 h |
| TASK-23.3 | Implementar el adaptador de la CSS sobre su mock. | BE | 5 h |
| TASK-23.4 | Implementar el adaptador del Registro Público sobre su mock. | BE | 5 h |
| TASK-23.5 | Pruebas de contrato por adaptador (4 escenarios c/u). | QA (rama QA) | 6 h |
| TASK-23.6 | Documentar la sustitución por integración real autorizada. | DOC (rama Producto) | 3 h |

---

### HU-24 — Orquestación de validaciones con reintentos e idempotencia

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE

**Criterios de aceptación:**

1. El backend determina las validaciones según el trámite y las crea con estados propios: `PENDIENTE`, `ENVIADA`, `RESPONDIDA`, `SIN_RESULTADO`, `ERROR_TECNICO`, `REINTENTO_PROGRAMADO`.
2. Estados de la validación independientes del estado del expediente.
3. Un error técnico jamás se convierte en resultado negativo ni dispara aprobación/denegación (CP-07).
4. Reintentos limitados, programados, con idempotencia: la petición repetida no duplica operaciones (CP-08).
5. Cada consulta guarda finalidad, fecha, referencia de correlación, estado técnico y resultado mínimo.
6. Pruebas de indisponibilidad, timeout, respuesta inválida e idempotencia.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-24.1 | Implementar entidad y estados de validación con transiciones propias. | BE | 6 h |
| TASK-24.2 | Implementar el orquestador: determina y ejecuta las validaciones necesarias. | BE | 8 h |
| TASK-24.3 | Implementar timeout, reintentos con backoff y claves de idempotencia. | BE | 8 h |
| TASK-24.4 | Pruebas de caída del mock, timeout, duplicación y recuperación. | QA (rama QA) | 6 h |

---

### HU-25 — Minimización y trazabilidad de consultas

**Prioridad:** Crítica · **5 PH** · **Responsable:** BE con LT

**Criterios de aceptación:**

1. Matriz de datos por institución (campo → finalidad → base legal → responsable) formalizada.
2. Validación de permiso y finalidad **antes** de emitir la consulta.
3. Solicitudes solo con campos autorizados de la matriz.
4. Respuestas guardadas con el resultado mínimo; sin copias amplias de datos personales.
5. Logs de integración sin datos personales innecesarios.
6. Pruebas que verifican el contenido efectivo de la petición y la trazabilidad completa.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-25.1 | Formalizar la matriz de datos por institución y sus finalidades. | LT con PO (rama Producto) | 4 h |
| TASK-25.2 | Implementar la validación de permiso y finalidad previa a la consulta. | BE | 5 h |
| TASK-25.3 | Aplicar minimización en peticiones y almacenamiento de respuestas. | BE | 5 h |
| TASK-25.4 | Verificar trazabilidad y contenido mínimo de logs con pruebas. | QA (rama QA) | 4 h |

---

### HU-26 — Panel de validaciones (participación)

**Tareas de esta rama (apoyo):**

* Asegurar que `POST`/`GET /api/expedientes/{id}/validaciones` expone la semántica correcta por rol.
* Acompañar el recorrido con escenarios forzados (TASK-26.4, con FE y QA).

### Entregables del Sprint 5 (rama Backend)

* Tres adaptadores desacoplados y probados por contrato.
* Orquestación con reintentos e idempotencia.
* Trazabilidad y minimización verificadas.

### DoD del Sprint 5 (rama Backend)

* Adaptadores responden con los 6 escenarios.
* Ningún error técnico interpretado como resultado negativo en pruebas (CP-07).
* Idempotencia verificada (CP-08).
* Matriz de minimización aplicada y auditada.

---

# Sprint 6 (semanas 11–12) — Pruebas, seguridad y rendimiento

**Objetivo de la rama:** completar la suite automatizada y corregir los hallazgos de OWASP ZAP y JMeter **(herramientas obligatorias)**.

### HU-27 — Pruebas automatizadas (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-27.1 | Completar pruebas unitarias de dominio (estados, validaciones, permisos) con JUnit/Mockito. | BE | 8 h |
| TASK-27.2 | Completar pruebas de API de todos los endpoints con sus códigos esperados. | BE con QA | 8 h |
| TASK-27.3 | Pruebas de integración con contenedores — **Docker (obligatoria)**. | QA (rama QA) | 8 h |
| TASK-27.4 | Integrar la suite en CI (Git) con reporte de cobertura. | LT | 5 h |

**Criterios:** suite ejecutable en un comando, < 10 min, cobertura ≥ 70 % en módulos críticos, sin dependencia de red pública.

---

### HU-28 — Seguridad OWASP ZAP (participación en correcciones)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-28.4 (parte BE) | Corregir hallazgos críticos/altos de **OWASP ZAP (obligatoria)** del lado del servidor: autorización, validación de entrada, cabeceras, sesión, exposición en errores y logs. | BE | Estimar con QA |

**Criterio:** cero vulnerabilidades críticas o altas sin resolver; verificación con nuevo escaneo.

---

### HU-29 — Rendimiento con JMeter (participación en correcciones)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-29.4 | Analizar cuellos de botella detectados por **Apache JMeter (obligatoria)** y corregir los prioritarios (índices, consultas N+1, caché). | BE | 10 h |

**Criterio:** el P95 de las operaciones principales se acerca o cumple el umbral acordado (≤ 2 s bajo carga de referencia) y las incidencias tienen corrección documentada.

### Entregable del Sprint 6 (rama Backend)

* Suite automatizada en CI + correcciones de seguridad y rendimiento aplicadas.

### DoD del Sprint 6 (rama Backend)

* Pruebas críticas en verde en CI.
* Ninguna vulnerabilidad crítica/alta pendiente.
* Incidencias de rendimiento corregidas o documentadas con plan.

---

# Sprint 7 (semanas 13–14) — Aceptación, empaquetado y entrega

**Objetivo de la rama:** soportar la aceptación, dejar la entrega empaquetada y la instalación limpia verificada.

### HU-32 — Documentación técnica (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-32.3 | Actualizar `openapi.yaml`, diagramas y modelo de datos al estado final. | BE con LT | 5 h |

---

### HU-33 — Instalación limpia y empaquetado

**Prioridad:** Crítica · **5 PH** · **Responsable:** LT con BE

**Criterios de aceptación:**

1. `git clone` + `docker compose up` levanta el sistema completo en máquina limpia siguiendo solo el `README`.
2. Datos semilla cargan y permiten entrar con los usuarios de demostración por rol.
3. Sin secretos, rutas absolutas ni dependencias locales no documentadas.
4. Recorrido principal de demostración funcional en la instalación limpia.
5. Etiqueta (tag) de versión en Git con el estado de la entrega.
6. Pasos de verificación de instalación limpia documentados como evidencia.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-33.1 | Instalación limpia en máquina nueva y registro de incidencias. | QA (rama QA) | 4 h |
| TASK-33.2 | Corregir hallazgos de empaquetado (configuración, rutas, semillas). | BE con FE | 6 h |
| TASK-33.3 | Etiquetar la versión final y preparar el paquete de entrega (código + docs). | LT | 3 h |
| TASK-33.4 | Verificar de nuevo la instalación tras las correcciones. | QA (rama QA) | 3 h |

---

### HU-34 — Demostración (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-34.1 | Preparar datos ficticios y escenario de demostración. | BE con PO | 5 h |
| TASK-34.2 | Ensayo de la demostración completa y corrección de detalles. | Equipo | 4 h |

### HU-31 — Aceptación (participación)

* Soporte a las pruebas de aceptación y corrección de hallazgos que correspondan al backend (con QA y PO).

### Entregables del Sprint 7 (rama Backend)

* Versión etiquetada del prototipo.
* Contrato y diagramas actualizados.
* Instalación limpia verificada.

### DoD del Sprint 7 (rama Backend)

* Aceptación documentada por historia.
* Instalación limpia reproducible con evidencia.
* Todas las pruebas críticas aprobadas.

---

## 6. Resumen de carga de la rama Backend

| Sprint | HU en las que participa | Horas propias estimadas |
| --- | --- | --- |
| 1 | HU-07, HU-08, HU-09 (apoyo), HU-06 (TASK-06.4) | ~55 h |
| 2 | HU-10, HU-11, HU-12, HU-13, HU-14 | ~85 h |
| 3 | HU-15, HU-16, HU-17, HU-18 | ~65 h |
| 4 | HU-19, HU-20, HU-21, HU-22 | ~65 h |
| 5 | HU-23, HU-24, HU-25, HU-26 (apoyo) | ~60 h |
| 6 | HU-27 (27.1, 27.2), HU-28 (correcciones), HU-29 (29.4) | ~30 h + correcciones |
| 7 | HU-32 (32.3), HU-33, HU-34, HU-31 (apoyo) | ~30 h |

**Nota:** es la rama de mayor carga. Si la capacidad real no alcanza, prioriza en este orden: seguridad y datos (Sprint 2) → expedientes (Sprint 3) → estados/auditoría (Sprint 4) → interoperabilidad (Sprint 5). Las correcciones de ZAP/JMeter del Sprint 6 nunca se posponen.

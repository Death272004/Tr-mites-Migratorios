# Rama Frontend — documento de trabajo

**Proyecto:** Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá
**Fuente:** `05-backlog-siete-sprints.md` (backlog maestro)
**Rol responsable:** FE (desarrollador frontend)

---

## 1. Objetivo de la rama

Construir **todas las pantallas funcionales** del prototipo (inventario P-01 a P-21), conectarlas a la API del backend y garantizar que cada pantalla tenga estados de carga, éxito, vacío y error, con una experiencia coherente y comprensible para los cinco roles del sistema.

## 2. Alcance de la rama por sprint

| Sprint | Qué hace esta rama |
| --- | --- |
| 1 | Crea el andamiaje y **todas las pantallas funcionales**; las conecta a las APIs ficticias. |
| 2 | Conecta el login real (autenticación y roles) al backend. |
| 3 | Conecta expedientes, documentos y notificaciones al backend real. |
| 4 | Conecta estados, observaciones, historial y auditoría. |
| 5 | Conecta el panel de validaciones institucionales con su semántica de error. |
| 6 | Corrige hallazgos de seguridad y usabilidad; participa en la evaluación de usuarios. |
| 7 | Apoya la documentación de usuario (capturas) y la instalación limpia. |

## 3. Con qué trabajas (herramientas)

### Obligatorias (definidas por el equipo)

| Herramienta | Uso obligatorio en esta rama |
| --- | --- |
| **Docker** | Levantar el entorno completo (`docker compose up`) para desarrollar y verificar contra backend + base de datos reales. No se aprueba ninguna pantalla solo con datos locales. |
| **Java** | No implementas backend, pero **debes leer y probar las API Java** (contrato OpenAPI, respuestas HTTP, códigos 400/401/403/404/409/5xx) para integrarlas correctamente. |
| **Apache JMeter** | Participas en el Sprint 6: apoyas a QA en las métricas que afectan a la UI (carga de listados, subida de documentos) y aplicas las correcciones de frente. |
| **OWASP ZAP** | Participas en el Sprint 6: corriges los hallazgos que corresponden al cliente (XSS, cabeceras, gestión de sesión, exponer datos en la interfaz). |

### Complementarias

| Herramienta | Uso |
| --- | --- |
| HTML, CSS y JavaScript | Tecnología base de todas las pantallas. |
| Navegador + DevTools | Depuración, responsive (escritorio y tablet) y rendimiento. |
| Postman o cliente HTTP | Probar los endpoints contra el contrato antes de conectar la pantalla. |
| OpenAPI (Swagger) | Fuente única de contratos para generar o validar las llamadas. |
| Git | Versionado, revisión de código y trazabilidad. |

## 4. Convenciones y Definition of Done de la rama

Una tarea de frontend está terminada cuando:

1. La pantalla cubre todos los criterios de aceptación de la HU.
2. Tiene implementados los cuatro estados: **carga, éxito, vacío y error** (con reintento cuando aplique).
3. Funciona en escritorio y tablet, sin errores de consola en el recorrido principal.
4. Respeta los permisos del rol: acciones no permitidas no se muestran o están deshabilitadas con explicación.
5. Los mensajes de error son de lenguaje no técnico y no exponen datos personales.
6. El código está revisado y fusionado en Git; la documentación/capturas asociadas están actualizadas.
7. El Product Owner acepta la historia.

**Reglas de la rama:**

* Nada de credenciales, tokens ni datos reales en el código del frontend.
* Toda llamada pasa por el módulo único de servicios HTTP (TASK-09.1); no hay `fetch` sueltos en vistas.
* El contrato OpenAPI es la fuente única: si la API cambia, primero se actualiza el contrato.

---

## 5. Sprints

# Sprint 1 (semanas 1–2) — Todas las pantallas funcionales

**Objetivo de la rama:** tener el 100 % del inventario de pantallas (P-01 a P-21) creadas, navegables por rol y con diseño base consistente, funcionando con datos ficticios y, al cierre del sprint, conectadas a las APIs ficticias.

### HU-01 — Andamiaje del frontend y diseño base

**Prioridad:** Crítica · **5 PH** · **Responsable:** FE

**Como** desarrollador frontend, **quiero** contar con la estructura base del cliente (layout, navegación, estilos y componentes reutilizables) **para** que todas las pantallas se construyan sobre un patrón consistente y reutilizable.

**Criterios de aceptación:**

1. Estructura de carpetas documentada (vistas, componentes, servicios, estilos, utilidades).
2. Layout con encabezado, menú según rol, área de contenido y pie, adaptado a escritorio y tablet.
3. Navegación entre las 21 pantallas sin recargas completas, respetando el rol activo.
4. Biblioteca mínima de componentes: botones, campos, tablas, tarjetas de estado, modales, avisos y paginación.
5. Paleta, tipografía y espaciados en un único archivo de variables, documentado en el `README` del frontend.
6. Ejecución con un comando único documentado y sin credenciales ni secretos.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-01.1 | Crear la estructura de carpetas del frontend y el archivo de variables de diseño. | FE | 3 h |
| TASK-01.2 | Implementar el layout base: encabezado, menú por rol, área de contenido y pie. | FE | 5 h |
| TASK-01.3 | Implementar el enrutado y la protección de rutas por rol (redirect a `/login` o `/error/403`). | FE | 4 h |
| TASK-01.4 | Desarrollar la biblioteca de componentes reutilizables. | FE | 8 h |
| TASK-01.5 | Documentar el diseño base y las convenciones en el `README` del frontend. | FE con DOC | 2 h |

**Dependencias:** ninguna (es la primera tarea de la rama).

---

### HU-02 — Pantallas de autenticación y perfil

**Prioridad:** Crítica · **3 PH** · **Responsable:** FE

**Como** usuario, **quiero** iniciar sesión, recuperar mi contraseña y gestionar mi perfil **para** acceder al sistema de forma segura.

**Criterios de aceptación:**

1. P-01 valida campos obligatorios, formato de correo y muestra/oculta la contraseña.
2. El intento fallido muestra un mensaje genérico que no revela si el usuario existe (CP-02).
3. Bloqueo visual tras intentos repetidos, con contador y mensaje claro.
4. P-02 solicita correo y muestra confirmación neutra sin revelar existencia de cuentas.
5. P-03 permite cambiar la contraseña con verificación de la actual y política de complejidad.
6. Tras iniciar sesión, menú y ruta inicial cambian según el rol.
7. Cerrar sesión limpia el estado local y redirige a `/login`.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-02.1 | Construir la pantalla P-01 con validaciones de formulario en cliente. | FE | 4 h |
| TASK-02.2 | Construir las pantallas P-02 y P-03 con sus estados de carga, éxito y error. | FE | 4 h |
| TASK-02.3 | Implementar el gestor de sesión en el cliente (token, expiración, cierre de sesión). | FE | 4 h |
| TASK-02.4 | Adaptar el layout y el menú al rol autenticado. | FE | 3 h |

**Dependencias:** el backend real de login llega en el Sprint 2 (HU-12); en este sprint se trabaja contra datos ficticios.

---

### HU-03 — Pantallas del módulo de solicitante

**Prioridad:** Crítica · **8 PH** · **Responsable:** FE

**Como** solicitante, **quiero** crear, consultar y dar seguimiento a mis expedientes y documentos desde pantallas claras **para** evitar viajes repetidos y entregas duplicadas de documentación.

**Criterios de aceptación:**

1. P-05 es un asistente de pasos (datos → trámite → documentos → revisión) con validación por paso.
2. P-04 lista los expedientes del usuario con filtros por estado y fecha, paginación y estados vacío/carga/error.
3. P-06 muestra identificador, trámite, estado con línea de tiempo, fechas clave y responsable.
4. P-07 permite adjuntar documentos con tipo documental, validación de formato/tamaño en cliente, progreso y resultado.
5. P-07 lista documentos registrados con estado de revisión; la descarga está deshabilitada sin permiso.
6. P-08 lista notificaciones con fecha, tipo y lectura, sin datos confidenciales en el texto.
7. Todas las pantallas funcionan con datos ficticios locales y tienen estados de error y operación en curso.
8. Los mensajes de error explican la causa en lenguaje no técnico y sugieren la acción siguiente.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-03.1 | Construir P-05 (asistente de creación) con validaciones y revisión final. | FE | 8 h |
| TASK-03.2 | Construir P-04 con filtros, paginación y estados vacío/carga/error. | FE | 5 h |
| TASK-03.3 | Construir P-06 con línea de tiempo de estados y bloque de fechas. | FE | 6 h |
| TASK-03.4 | Construir P-07 con carga de archivos, validación de tipo/tamaño y listado. | FE | 8 h |
| TASK-03.5 | Construir P-08 de notificaciones con marcado de leídas. | FE | 3 h |
| TASK-03.6 | Definir los datos ficticios de demostración del solicitante (fixtures). | FE | 2 h |

**Dependencias:** catálogo de tipos documentales (TASK-17.1, Sprint 3, con PO).

---

### HU-04 — Pantallas del módulo de funcionario

**Prioridad:** Crítica · **8 PH** · **Responsable:** FE

**Como** funcionario, **quiero** revisar expedientes, registrar observaciones, cambiar estados y consultar validaciones desde mi bandeja **para** tramitar solicitudes sin herramientas externas.

**Criterios de aceptación:**

1. P-09 con colas de trabajo, filtros (estado, trámite, fecha, responsable), ordenación y paginación.
2. P-10 reutiliza la vista de detalle con información ampliada: documentos, historial y acciones.
3. P-11 muestra solo las transiciones disponibles; las no permitidas aparecen deshabilitadas con explicación.
4. P-11 exige motivo para estados finales y confirmación antes de enviar.
5. P-12 permite registrar observaciones con texto obligatorio; lista autor, fecha y respuesta.
6. P-13 muestra validaciones con su estado propio y distingue visualmente el error técnico del resultado negativo (CP-07).
7. P-13 ofrece "reintentar" solo cuando el estado lo permite, avisando que la operación es idempotente (CP-08).
8. Todas las pantallas del módulo tienen estados de carga, error y vacío.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-04.1 | Construir P-09 con colas, filtros y ordenación. | FE | 6 h |
| TASK-04.2 | Construir P-10 como vista ampliada reutilizando componentes. | FE | 5 h |
| TASK-04.3 | Construir P-11 con transiciones dinámicas, motivo obligatorio y confirmación. | FE | 6 h |
| TASK-04.4 | Construir P-12 de observaciones con hilo de comentarios. | FE | 5 h |
| TASK-04.5 | Construir P-13 con estados de validación, reintento y semántica de error. | FE | 6 h |

**Dependencias:** matriz de transiciones (TASK-19.1, Sprint 4, con PO/LT) para definir qué transiciones mostrar.

---

### HU-05 — Pantallas de supervisor, auditoría y administración

**Prioridad:** Alta · **5 PH** · **Responsable:** FE

**Como** supervisor, auditor y administrador, **quiero** contar con mis pantallas de reportes, auditoría, usuarios y catálogos **para** cumplir mis funciones sin acceso a expedientes que no me corresponden.

**Criterios de aceptación:**

1. P-14 con indicadores del plan de acción y periodo configurable.
2. P-15 con filtros de auditoría (fecha, actor, operación, recurso), paginación y exportación CSV.
3. P-16 listado, alta, deshabilitación de usuarios y asignación de rol, con confirmación.
4. P-17 consulta de roles y permisos en modo lectura.
5. P-18 administración de catálogos (trámites, tipos documentales, estados).
6. P-19 errores técnicos de integración, intentos fallidos y métricas, diferenciados de resultados de validación.
7. Ninguna pantalla muestra expedientes a usuarios sin permiso (CP-03, CP-09).

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-05.1 | Construir P-14 con tarjetas de indicadores y gráficos sencillos. | FE | 6 h |
| TASK-05.2 | Construir P-15 con filtros avanzados y exportación CSV. | FE | 5 h |
| TASK-05.3 | Construir P-16 y P-17 de gestión de usuarios y roles. | FE | 6 h |
| TASK-05.4 | Construir P-18 de catálogos con alta/baja simple. | FE | 4 h |
| TASK-05.5 | Construir P-19 de monitoreo técnico. | FE | 4 h |

**Nota de capacidad:** si el sprint no da abasto, esta HU se desplaza al inicio del Sprint 2 sin afectar la ruta crítica.

**Dependencias:** datos de reportes y auditoría (Sprints 4–5); en este sprint se usan fixtures.

---

### HU-09 — Integración del frontend con los mocks y estados de interfaz

**Prioridad:** Crítica · **5 PH** · **Responsable:** FE con BE

**Como** usuario, **quiero** que las pantallas se alimenten de las APIs ficticias y muestren correctamente carga, éxito, vacío y error **para** verificar el flujo real antes de construir la lógica de negocio.

**Criterios de aceptación:**

1. Un único módulo de servicios HTTP en el frontend (llamadas centralizadas, token, errores).
2. Cada pantalla implementa y muestra los cuatro estados con reintento.
3. P-13 muestra los escenarios `OK`, `SIN_RESULTADO`, `ERROR_TECNICO` y `TIMEOUT` usando los mocks, manteniendo la distinción visual entre error técnico y resultado negativo.
4. Los errores HTTP se traducen a mensajes de usuario por código (401, 403, 404, 409, 5xx) sin filtrar detalles técnicos.
5. Flujo navegable completo con mocks: login → crear expediente → adjuntar documentos → ver detalle → ver validaciones simuladas.
6. Sin llamadas a endpoints inexistentes ni errores de consola en el recorrido principal.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-09.1 | Implementar el módulo de servicios HTTP con manejo centralizado de errores y token. | FE | 5 h |
| TASK-09.2 | Sustituir fixtures por llamadas a los mocks en las pantallas del solicitante. | FE | 6 h |
| TASK-09.3 | Sustituir fixtures por llamadas a los mocks en las pantallas del funcionario. | FE | 6 h |
| TASK-09.4 | Implementar el selector de escenarios en la UI de demostración. | FE | 3 h |
| TASK-09.5 | Recorrer el flujo completo y corregir incidencias. | FE con QA | 4 h |

**Dependencias de otras ramas:** HU-08 (APIs ficticias, Backend) y HU-07 (contrato OpenAPI, Backend) deben estar listas antes de TASK-09.2.

### Entregables del Sprint 1 (rama Frontend)

* 21 pantallas navegables por rol con diseño base documentado.
* Flujo completo navegable con datos ficticios y con los mocks.
* `README` del frontend con estructura y convenciones.

### DoD del Sprint 1 (rama Frontend)

* Inventario completo P-01…P-21 verificado por rol.
* Cuatro estados de interfaz en todas las pantallas.
* Cero errores de consola en el recorrido principal.
* Sin credenciales ni datos reales en el código.

---

# Sprint 2 (semanas 3–4) — Conexión de autenticación real

**Objetivo de la rama:** sustituir el login simulado por el backend real (Java/Docker) y ajustar el frontend a permisos reales.

### HU-10 — Entorno reproducible (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-10.4 | Crear los `Dockerfile` del frontend y participar en el `docker-compose.yml` (backend, db, frontend) con healthchecks — **Docker (obligatoria)**. | FE con BE | 6 h |

**Criterio:** el frontend entra en el arranque único con Docker y sirve las pantallas desde el contenedor.

**Dependencias de otras ramas:** TASK-10.1 a TASK-10.3 y TASK-10.5 (Backend y Documentación), TASK-10.6 (QA).

---

### HU-12 — Autenticación real (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-12.5 | Conectar el frontend de login (P-01, P-02, P-03) al backend real (Java, endpoints `/api/auth/*`). | FE | 5 h |

**Criterios aplicables a esta tarea:**

* El token/sesión se guarda y expira correctamente; el cierre de sesión limpia el estado.
* Los mensajes de fallo son genéricos y no revelan existencia de usuarios (CP-02).
* Tras el login real, el menú refleja el rol devuelto por el backend.

**Dependencias de otras ramas:** TASK-12.1 a TASK-12.4 (Backend).

---

### HU-13 — Autorización (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-13.5 | Ajustar el frontend para mostrar/ocultar acciones según los permisos reales del rol. | FE | 4 h |

**Criterio:** la interfaz no ofrece acciones que el backend rechazará (pero la validación real sigue siendo del backend).

### Entregables del Sprint 2 (rama Frontend)

* Login, recuperación y perfil conectados al backend Java.
* Frontend empaquetado en Docker y arrancable con `docker compose up`.

### DoD del Sprint 2 (rama Frontend)

* Recorrido de autenticación real aprobado por QA (CP-01, CP-02).
* Interfaz coherente con la matriz de permisos (TASK-13.1).

---

# Sprint 3 (semanas 5–6) — Expedientes y documentos alineados al backend

**Objetivo de la rama:** conectar las pantallas de expedientes y documentos a los endpoints reales, con validación de errores campo a campo.

### HU-15 — Registro de expediente (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-15.3 | Conectar P-05 al endpoint `POST /api/expedientes`, incluyendo manejo de errores de validación campo a campo. | FE | 6 h |

**Criterio:** los errores `400` del servidor se muestran en el campo correspondiente del asistente; el éxito muestra el identificador generado.

**Dependencias:** TASK-15.1, 15.2, 15.4, 15.5 (Backend).

---

### HU-16 — Consulta y seguimiento (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-16.3 | Conectar P-04, P-06, P-09 y P-10 a los endpoints de listado, detalle e historial. | FE | 6 h |

**Criterios:** filtros y paginación funcionan contra el servidor; un expediente ajeno muestra pantalla de "no encontrado" sin datos (CP-03).

**Dependencias:** TASK-16.1, 16.2, 16.4 (Backend y QA).

---

### HU-17 — Gestión documental protegida (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-17.4 | Conectar P-07 al backend con progreso de carga y manejo de errores de archivo. | FE | 6 h |

**Criterios:** tipo no permitido y tamaño excedido se informan de forma segura (CP-05); la descarga solo se habilita con permiso (CP-12).

**Dependencias:** TASK-17.1 a TASK-17.3, 17.5 (Backend y QA).

---

### HU-18 — Notificaciones (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-18.3 | Conectar P-08 al backend con marcado de leídas. | FE | 4 h |

**Dependencias:** TASK-18.1, 18.2, 18.4 (Backend y PO).

### Entregables del Sprint 3 (rama Frontend)

* Flujo del solicitante completo contra backend real: crear → documentar → consultar.
* Bandeja del funcionario conectada.

### DoD del Sprint 3 (rama Frontend)

* Pruebas de permisos de interfaz en verde (CP-03, CP-05, CP-12).
* Sin enlaces públicos ni descargas sin autorización en la UI.

---

# Sprint 4 (semanas 7–8) — Estados, observaciones, historial y auditoría

**Objetivo de la rama:** conectar la gestión de estados y revisión respetando la máquina de transiciones del backend.

### HU-19 — Máquina de estados (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-19.4 | Conectar P-11 al backend con transiciones dinámicas, motivo obligatorio y confirmaciones. | FE | 5 h |

**Criterios:** solo se envían transiciones permitidas por la respuesta del servidor; un `409`/`403` conserva la vista con el estado original y explica el motivo (CP-04).

**Dependencias:** TASK-19.1 a TASK-19.3, 19.5 (PO, Backend, QA).

---

### HU-20 — Observaciones (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-20.2 | Conectar P-12 y el bloque de observaciones de P-06. | FE | 5 h |

**Criterio:** el solicitante solo ve observaciones propias; una observación no cambia el estado en la interfaz.

**Dependencias:** TASK-20.1, 20.3 (Backend y QA).

---

### HU-21 — Historial de estados (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-21.2 | Construir el componente de línea de tiempo y conectarlo a P-06/P-10. | FE | 5 h |

**Criterio:** la línea de tiempo muestra autor, fecha, cambio y motivo; sin datos sensibles innecesarios (CP-09).

**Dependencias:** TASK-21.1, 21.3 (Backend y QA).

---

### HU-22 — Auditoría (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-22.4 | Conectar P-15 y verificar la exportación CSV. | FE | 4 h |

**Criterio:** solo el rol auditor ve la pantalla; los filtros y la exportación funcionan contra el servidor.

**Dependencias:** TASK-22.1 a TASK-22.3, 22.5 (Backend y QA).

### Entregables del Sprint 4 (rama Frontend)

* P-11, P-12, P-06/P-10 y P-15 conectadas y respetando permisos.

### DoD del Sprint 4 (rama Frontend)

* CP-04 y CP-09 verificadas desde la interfaz.
* Sin posibilidad visual de forzar transiciones no permitidas.

---

# Sprint 5 (semanas 9–10) — Panel de validaciones conectado

**Objetivo de la rama:** dejar el panel de interoperabilidad listo para la demostración, con su semántica de error técnico vs. resultado negativo.

### HU-26 — Panel de validaciones conectado en el flujo real

**Prioridad:** Crítica · **8 PH** · **Responsable:** FE con BE

**Como** funcionario y solicitante, **quiero** ver el estado real de las validaciones en el expediente **para** saber qué falta y cuándo puedo decidir.

**Criterios de aceptación:**

1. `POST` y `GET /api/expedientes/{id}/validaciones` conectados a P-13 y al bloque de P-06.
2. Cada validación muestra institución, fecha, estado técnico y resultado cuando exista.
3. El error técnico se distingue visualmente del resultado negativo (color, icono, texto) — CP-07.
4. El reintento aparece solo en estados permitidos y muestra su resultado — CP-08.
5. El solicitante ve el estado agregado sin detalles internos innecesarios.
6. Recorrido completo de demostración: expediente → validaciones simuladas → decisión.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-26.1 | Conectar P-13 a los endpoints de validaciones con recarga y refresco. | FE | 6 h |
| TASK-26.2 | Implementar la distinción error técnico vs. resultado negativo y el botón de reintento. | FE | 5 h |
| TASK-26.3 | Mostrar el bloque de validaciones en P-06 con nivel de detalle por rol. | FE | 5 h |
| TASK-26.4 | Ejecutar el recorrido completo con escenarios forzados (`X-Scenario`) y corregir incidencias. | FE con QA | 6 h |

**Dependencias de otras ramas:** HU-23, HU-24 y HU-25 (adaptadores, orquestación y trazabilidad — Backend) deben estar operativas.

### Entregable del Sprint 5 (rama Frontend)

* Panel de validaciones operativo en el flujo real con escenarios de error demostrables.

### DoD del Sprint 5 (rama Frontend)

* CP-06, CP-07 y CP-08 verificadas desde la interfaz.
* La distinción error/negativo es evidente para un usuario no técnico.

---

# Sprint 6 (semanas 11–12) — Correcciones de seguridad y usabilidad

**Objetivo de la rama:** corregir los hallazgos que corresponden al cliente y mejorar la interfaz según la evaluación con usuarios.

### HU-28 — Validación de seguridad (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-28.4 (parte FE) | Corregir hallazgos de OWASP ZAP **(herramienta obligatoria)** atribuidos al frontend: XSS, cabeceras de seguridad, gestión de sesión, exponer datos en la interfaz o en errores. | FE | Estimar con QA |

**Dependencias:** informe de hallazgos de QA (TASK-28.3).

---

### HU-30 — Evaluación de usabilidad (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-30.3 | Clasificar dificultades y priorizar correcciones con el PO. | FE con PO | 4 h |
| TASK-30.4 | Corregir pantallas prioritarias y repetir las tareas críticas. | FE | 8 h |

**Criterio de éxito:** al menos el 90 % de las tareas críticas se completan sin asistencia.

**Dependencias:** guion y sesiones de prueba (TASK-30.1 y TASK-30.2, PO y QA).

### Entregable del Sprint 6 (rama Frontend)

* Versión de interfaz corregida tras seguridad y usabilidad.

### DoD del Sprint 6 (rama Frontend)

* Ningún hallazgo crítico/alto de ZAP pendiente del lado del cliente.
* Tareas críticas de usabilidad re-ejecutadas con la meta cumplida.

---

# Sprint 7 (semanas 13–14) — Documentación de usuario e instalación limpia

**Objetivo de la rama:** apoyar la entrega con capturas actualizadas y verificar la instalación desde el lado del cliente.

### HU-32 — Documentación técnica y de usuario (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-32.2 | Redactar el manual de usuario por rol con capturas actualizadas. | FE con DOC | 8 h |

---

### HU-33 — Instalación limpia (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-33.2 (parte FE) | Corregir hallazgos de empaquetado del frontend (rutas, assets, configuración) detectados en la instalación limpia. | FE | Estimar con QA |

**Dependencias:** ejecución de la instalación limpia (TASK-33.1 y TASK-33.4, QA).

### HU-34 — Demostración y evaluación final (participación)

* Apoyo en la preparación del escenario de demostración (TASK-34.1, con PO y Backend) y en el ensayo (TASK-34.2).

### Entregables del Sprint 7 (rama Frontend)

* Manual de usuario por rol con capturas.
* Interfaz corregida en la instalación limpia.

### DoD del Sprint 7 (rama Frontend)

* Recorrido de demostración completo sin incidencias en máquina nueva.
* Capturas del manual verificadas contra la versión final.

---

## 6. Resumen de carga de la rama Frontend

| Sprint | HU en las que participa | Horas propias estimadas |
| --- | --- | --- |
| 1 | HU-01, HU-02, HU-03, HU-04, HU-05, HU-09 | ~110 h |
| 2 | HU-10 (10.4), HU-12 (12.5), HU-13 (13.5) | ~15 h |
| 3 | HU-15, HU-16, HU-17, HU-18 | ~22 h |
| 4 | HU-19, HU-20, HU-21, HU-22 | ~20 h |
| 5 | HU-26 | ~22 h |
| 6 | HU-28 (parte), HU-30 | ~12 h + correcciones ZAP |
| 7 | HU-32 (32.2), HU-33 (parte), HU-34 | ~13 h |

**Nota:** el Sprint 1 concentra la carga pesada de la rama; si la capacidad real es menor, se aplaza HU-05 al inicio del Sprint 2 (decisión del PO registrada en el backlog).

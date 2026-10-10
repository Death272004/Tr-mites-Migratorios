# Documento 5. Backlog del proyecto: siete sprints (versión detallada)

## Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá

---

## 5.1. Cómo está organizado este backlog

### Objetivo general del backlog

Este backlog construye el **producto comercial destinado a bufetes de abogados** (MVP vendible): el despacho es el **responsable del tratamiento de datos** conforme a la Ley 81 de 2019 y al Decreto Ejecutivo 285 de 2021, y el sistema se construye para la operación diaria del despacho. Se mantiene el inventario oficial de **45 pantallas**: el portal **P-01…P-27** es el **portal del cliente del bufete** (titular del dato, representable por su abogado) y el módulo interno **I-01…I-18** es el **módulo interno del despacho** (recepción, analista, resolutor/director, notificador, administrador y auditoría). Las instituciones **no son socias con APIs**: son **fuentes externas de verificación**; la plataforma nunca recibe transferencias automáticas y la interoperabilidad se entrega como **verificación documental trazable en modo manual asistido**, con la **capa de adaptadores preparada** para una futura automatización sujeta a convenio (p. ej. vía AIG) sin rehacer el sistema.

## Registro de cambios del backlog

| # | Cambio | Motivo | Impacto | Estado |
| --- | --- | --- | --- | --- |
| RC-01 | Adopción del inventario oficial de **45 pantallas**: portal ciudadano **P-01…P-27** y módulo interno SNM **I-01…I-18** (fuente: `Pantallas_y_Datos_Migracion.md`), en sustitución del esquema anterior de 21 pantallas (P-01…P-21). | Fidelidad con el SNM real y cierre de la recomendación de `06-roles-y-accesos.md` §6.13.2. | Sprint 1 reorientado al portal (P-01…P-27); el módulo interno (I-01…I-18) inicia en el Sprint 2. | Aprobado por PO |
| RC-02 | **Reencuadre del alcance: producto comercial para bufetes de abogados bajo la Ley 81 de 2019.** | Venta a bufetes de abogados; las instituciones no transfieren datos por lo que la interoperabilidad se entrega como verificación documental trazable + capa de adaptadores preparada. | El portal P-01…P-27 es el portal del cliente del bufete y el módulo interno I-01…I-18 el despacho; las verificaciones quedan en modo manual asistido con adaptadores preparados; nuevos HU de consentimiento informado y derechos ARCO; indicadores medidos en el despacho. | Aprobado por PO |

### Jerarquía

* **Épica (EP):** agrupa funcionalidades relacionadas y atraviesa varios sprints.
* **Historia de usuario (HU):** necesidad concreta desde el punto de vista del usuario, con valor verificable.
* **Sufijo alfanumérico (p. ej. HU-18b):** historia incorporada al backlog después de la primera estimación; el sufijo permite agregarla **sin renumerar** las HU-01…HU-34 existentes.
* **Tarea (TASK):** actividad técnica, de diseño o de documentación necesaria para implementar la historia.
* **Criterios de aceptación (CA):** condiciones objetivas y verificables para dar por terminada una historia.
* **Caso de prueba (CP):** verificación asociada del plan de pruebas (Documento 4).

### Estados del backlog

`Por hacer` → `En curso` → `En revisión` → `Hecha` · `Bloqueada` (requiere decisión, permiso o dependencia externa)

### Roles asignados

| Código | Rol |
| --- | --- |
| PO | Product Owner |
| LT | Líder técnico / arquitecto |
| BE | Desarrollador backend |
| FE | Desarrollador frontend |
| QA | Responsable de pruebas |
| DOC | Responsable de documentación |

Una persona puede cubrir varios roles en el equipo; los códigos indican la responsabilidad, no necesariamente a una persona distinta.

### Estimación

* Puntos de historia (PH): escala Fibonacci (1, 2, 3, 5, 8, 13), orientativa.
* Horas (h): estimación por tarea, para planificación de capacidad.
* Capacidad de referencia asumida: equipo de 5 personas × 2 semanas × ~30 h productivas ≈ **150 h/sprint**. Debe recalibrarse con la velocidad real del equipo en el Sprint 1.

### Estado del documento

Este backlog reemplaza la versión inicial del Documento 5. La principal diferencia es que el **Sprint 1 se enfoca en el frontend (todas las pantallas funcionales) y, en paralelo, en el marco legal y la matriz de fuentes de verificación y en la implementación de fuentes de verificación simuladas (mocks)** que representan, durante todo el MVP, las integraciones futuras sujetas a convenio. El alcance comercial (RC-02) define el producto: se vende a bufetes de abogados y la verificación se entrega en modo manual asistido, con adaptadores preparados.

---

## 5.2. Épicas del proyecto

| Código | Épica | Objetivo | Prioridad |
| --- | --- | --- | --- |
| EP-01 | Análisis, arquitectura y contratos | Definir requisitos, alcance, arquitectura, contratos de API y reglas del sistema. | Crítica |
| EP-02 | Infraestructura y persistencia | Preparar el entorno reproducible, base de datos y migraciones. | Crítica |
| EP-03 | Autenticación y control de acceso | Proteger el sistema y separar permisos por rol. | Crítica |
| EP-04 | Gestión de expedientes y documentos | Registrar, consultar y organizar los expedientes migratorios. | Crítica |
| EP-05 | Flujo de estados y revisión | Controlar el ciclo de vida del expediente y las decisiones autorizadas. | Crítica |
| EP-06 | Verificación documental y fuentes externas | Definir qué fuentes de verificación aplica el despacho, simularlas para la demostración y normalizar resultados. | Crítica |
| EP-07 | Auditoría, seguridad y privacidad | Registrar operaciones y aplicar controles de protección de datos: consentimiento informado, minimización, finalidad y derechos ARCO. | Crítica |
| EP-08 | Pruebas, usabilidad y rendimiento | Verificar calidad funcional, seguridad y rendimiento. | Alta |
| EP-09 | Entrega y documentación | Preparar manuales, evidencias y demostración final. | Alta |
| **EP-10** | **Frontend y experiencia de usuario** | **Construir todas las pantallas funcionales, la navegación y los estados de interfaz.** | **Crítica** |

---

## 5.3. Mapa de sprints

| Sprint | Sem. | Tema principal | Épicas | HU | PH |
| --- | --- | --- | --- | --- | --- |
| **1** | 1–2 | **Frontend del portal (P-01…P-27) + marco legal de verificación + fuentes simuladas** | EP-10, EP-01, EP-06 | HU-01 … HU-09 | 50 |
| **2** | 3–4 | **Módulo interno (I-01…I-18)** + base del backend: entorno, modelo de datos, autenticación | EP-02, EP-03 | HU-10 … HU-14 (+ HU-05 si se desplaza) | 34 |
| **3** | 5–6 | Expedientes y documentos conectados extremo a extremo, consentimiento informado y derechos ARCO | EP-04, EP-07, EP-10 | HU-15 … HU-18 (+ HU-18b, HU-18c) | 36 |
| **4** | 7–8 | Estados, revisión, observaciones y auditoría | EP-05, EP-07 | HU-19 … HU-22 | 30 |
| **5** | 9–10 | Verificación documental: modo manual asistido, adaptadores y trazabilidad | EP-06, EP-07 | HU-23 … HU-26 | 34 |
| **6** | 11–12 | Seguridad, rendimiento y usabilidad | EP-08 | HU-27 … HU-30 | 30 |
| **7** | 13–14 | Aceptación, documentación y entrega | EP-08, EP-09 | HU-31 … HU-34 | 24 |

---

## 5.4. Herramientas del proyecto

### Herramientas obligatorias

Estas cuatro herramientas están **definidas como obligatorias** por el equipo y deben usarse en el desarrollo y en la verificación del producto:

| Herramienta | Tipo | Uso obligatorio en el proyecto | Sprints | HU / TASK principales |
| --- | --- | --- | --- | --- |
| **Java** (JDK 17 o superior) | Lenguaje y runtime | Todo el backend del producto se implementa en Java sobre Spring Boot; sin Java no hay backend. | 1–7 | HU-08, HU-10 a HU-14, HU-15 a HU-25 |
| **Docker** | Contenedores | Entorno reproducible (backend + PostgreSQL + frontend), aislamiento del entorno de pruebas y ejecución de las suites de prueba. | 1–7 | TASK-10.4, TASK-27.3, TASK-33.1 |
| **Apache JMeter** | Pruebas de rendimiento | Medición de latencia, P95, concurrencia, tasa de errores y comportamiento ante picos e indisponibilidad de dependencias. | 6 (y re-verificación en 7 si hay correcciones) | HU-29, TASK-29.1 a TASK-29.5, CP-10 |
| **OWASP ZAP** | Pruebas de seguridad | Escaneo activo y pasivo de la aplicación web y sus API, con corrección de hallazgos críticos y altos antes de la entrega. | 6 (y verificación final en 7) | HU-28, TASK-28.1 a TASK-28.5, CP-11 |

**Reglas de uso obligatorio:**

1. El backend se compila y ejecuta en Java en todos los sprints; ninguna tarea del backlog se da por hecha sin código Java que pase las pruebas.
2. Todo el entorno debe levantarse con Docker (`docker compose up`): las pruebas de integración y la instalación limpia se ejecutan sobre contenedores, no sobre instalaciones locales.
3. Las pruebas de rendimiento del Sprint 6 se realizan exclusivamente con Apache JMeter, dejando scripts y métricas como evidencia.
4. Las pruebas de seguridad del Sprint 6 se realizan con OWASP ZAP (escaneo automatizado) más las pruebas manuales complementarias, dejando el informe como evidencia.
5. Los resultados de JMeter y OWASP ZAP son obligatorios para el DoD de los Sprints 6 y 7: sin sus evidencias, la entrega no se acepta.

### Herramientas complementarias (derivadas de la documentación)

Complementan el trabajo, pero no sustituyen a las obligatorias:

| Herramienta | Uso | Sprints |
| --- | --- | --- |
| Spring Boot (sobre Java) | Framework del backend, seguridad y API REST. | 1–7 |
| PostgreSQL | Base de datos operativa del producto. | 1–7 |
| Git | Control de versiones, revisión y trazabilidad. | 1–7 |
| Flyway o Liquibase | Migraciones versionadas del esquema. | 2 en adelante |
| JUnit y Mockito | Pruebas unitarias y de servicio. | 2 en adelante |
| Spring Boot Test + Docker | Pruebas de integración con contenedores. | 2 en adelante |
| Postman o cliente HTTP equivalente | Pruebas manuales de API contra el contrato. | 1–7 |
| OpenAPI (Swagger) | Contrato y documentación de la API. | 1 y actualizaciones continuas |
| HTML, CSS y JavaScript | Frontend de todas las pantallas funcionales. | 1–7 |

### Asignación de herramientas por sprint

| Sprint | Java | Docker | JMeter | OWASP ZAP | Otras (complementarias) |
| --- | --- | --- | --- | --- | --- |
| 1 | ✔ mocks y contratos | ✔ estructura de contenedores | — | — | OpenAPI, HTML/CSS/JS |
| 2 | ✔ entorno, modelo, auth | ✔ obligatorio (entorno reproducible) | — | — | PostgreSQL, Flyway, Git |
| 3 | ✔ expedientes y documentos | ✔ pruebas de integración | — | — | JUnit, Postman |
| 4 | ✔ estados y auditoría | ✔ pruebas de integración | — | — | JUnit, Postman |
| 5 | ✔ adaptadores y orquestación | ✔ pruebas de contrato | — | — | JUnit, Postman |
| 6 | ✔ correcciones | ✔ suite en contenedores | **✔ obligatorio** | **✔ obligatorio** | JUnit, Mockito, CI |
| 7 | ✔ correcciones finales | ✔ instalación limpia | ✔ re-verificación si hubo cambios | ✔ verificación final | Git (etiqueta de versión) |

---

## 5.5. Inventario de pantallas del producto (frontend)

El inventario oficial adoptado para este backlog es el de **45 pantallas** definido en `Pantallas_y_Datos_Migracion.md` (secciones 2, 3 y 5): **27 pantallas del portal (P-01…P-27)** y **18 pantallas del módulo interno (I-01…I-18)**. Con el reencuadre comercial (RC-02), **P-01…P-27 es el portal del cliente del bufete** (titular, representable por su abogado) e **I-01…I-18 es el módulo interno del despacho** (recepción, analista, resolutor/director, notificador, administrador, auditoría); los nombres de las tablas se conservan tal como figuran en la fuente oficial. Este inventario sustituye al esquema anterior de 21 pantallas y es la referencia obligatoria del Sprint 1: todas las pantallas del portal deben quedar creadas y navegables antes de que termine la semana 2 y el módulo interno debe iniciar en el Sprint 2 (ver *Registro de cambios del backlog*, §5.1), aunque en esa etapa funcionen con datos ficticios locales o con las fuentes de verificación simuladas del backend.

### Portal del cliente del bufete — P-01…P-27

| ID | Pantalla | Ruta propuesta | Rol dueño |
| --- | --- | --- | --- |
| P-01 | Inicio de sesión | `/login` | Todos (portal) |
| P-02 | Registro de cuenta | `/registro` | Ciudadano |
| P-03 | Verificación de identidad (OTP) | `/verificacion-otp` | Ciudadano |
| P-04 | Recuperación de contraseña | `/recuperar-contrasena` | Todos (portal) |
| P-05 | Mi perfil / datos de contacto | `/perfil` | Todos (portal) |
| P-06 | Mis trámites (bandeja) | `/solicitante/tramites` | Ciudadano / apoderado / representante |
| P-07 | Nueva solicitud — selección de trámite | `/solicitante/solicitud/nueva` | Ciudadano / apoderado / representante |
| P-08 | Titularidad y representación | `/solicitante/solicitud/titularidad` | Apoderado / representante legal |
| P-09 | Paso 1 — Datos personales | `/solicitante/solicitud/paso-1` | Ciudadano / apoderado / representante |
| P-10 | Paso 2 — Pasaporte e historial migratorio | `/solicitante/solicitud/paso-2` | Ciudadano / apoderado / representante |
| P-11 | Paso 3 — Domicilio y notificaciones | `/solicitante/solicitud/paso-3` | Ciudadano / apoderado / representante |
| P-12 | Paso 4 — Situación laboral, económica o de vínculos | `/solicitante/solicitud/paso-4` | Ciudadano / apoderado / representante |
| P-13 | Paso 5 — Dependientes | `/solicitante/solicitud/paso-5` | Ciudadano / apoderado / representante |
| P-14 | Paso 6 — Requisitos y carga de documentos | `/solicitante/solicitud/paso-6` | Ciudadano / apoderado / representante |
| P-15 | Paso 7 — Pagos y tasas **(POR CONFIRMAR)** | `/solicitante/solicitud/paso-7` | Ciudadano |
| P-16 | Paso 8 — Declaración jurada y firma | `/solicitante/solicitud/paso-8` | Ciudadano |
| P-17 | Resumen y envío (número de expediente) | `/solicitante/solicitud/resumen` | Ciudadano / apoderado / representante |
| P-18 | Reserva de cita **(POR CONFIRMAR)** | `/solicitante/cita` | Ciudadano |
| P-19 | Estado del trámite (línea de tiempo) | `/solicitante/tramites/{id}` | Ciudadano / apoderado / representante |
| P-20 | Observaciones y notificaciones | `/solicitante/tramites/{id}/observaciones` | Ciudadano / apoderado / representante |
| P-21 | Subsanación (corrección del expediente) | `/solicitante/tramites/{id}/subsanacion` | Ciudadano / apoderado / representante |
| P-22 | Resultados: resoluciones, carné digital y certificados | `/solicitante/resultados` | Ciudadano |
| P-23 | Historial de pagos | `/solicitante/pagos` | Ciudadano |
| P-24 | Edictos y citaciones **(POR CONFIRMAR)** | `/solicitante/edictos` | Ciudadano |
| P-25 | Certificaciones en línea **(POR CONFIRMAR)** | `/solicitante/certificaciones` | Ciudadano |
| P-26 | Naturalización — flujo específico | `/solicitante/naturalizacion` | Ciudadano |
| P-27 | Ayuda, FAQ y peticiones | `/ayuda` | Todos (portal) |

### Módulo interno del despacho (I-01…I-18)

| ID | Pantalla | Ruta propuesta | Rol dueño |
| --- | --- | --- | --- |
| I-01 | Login institucional con MFA | `/snm/login` | Personal SNM |
| I-02 | Tablero de gestión | `/snm/tablero` | Todos los roles internos |
| I-03 | Bandeja de recepción (citas y turnos) | `/snm/recepcion/bandeja` | Recepcionista |
| I-04 | Recepción y verificación de completitud | `/snm/recepcion/atencion` | Recepcionista |
| I-05 | Asignación de analista | `/snm/asignacion` | Coordinador / resolutor |
| I-06 | Análisis del expediente (checklist) | `/snm/analisis/{id}` | Analista |
| I-07 | Panel de verificación interoperable | `/snm/analisis/{id}/verificaciones` | Analista |
| I-08 | Emisión y atención de observaciones | `/snm/observaciones` | Recepcionista / analista |
| I-09 | Edictos y publicaciones | `/snm/edictos` | Analista / notificador |
| I-10 | Resolución (aprobar / negar) | `/snm/resolucion/{id}` | Resolutor |
| I-11 | Notificación | `/snm/notificaciones` | Notificador |
| I-12 | Entrega en ventanilla | `/snm/entrega` | Notificador / ventanilla |
| I-13 | Expedientes archivados y reactivación | `/snm/archivados` | Analista / coordinador |
| I-14 | Catálogos: trámites, requisitos, tasas y vigencias | `/snm/admin/catalogos` | Administrador de catálogos |
| I-15 | Usuarios, roles y permisos | `/snm/admin/usuarios` | Administrador |
| I-16 | Bitácora de auditoría | `/snm/admin/auditoria` | Auditor |
| I-17 | Reportes y tiempos por etapa | `/snm/reportes` | Supervisor / directivo |
| I-18 | Salud de las conexiones de interoperabilidad | `/snm/admin/interoperabilidad` | Administrador |

### Vistas y componentes globales (sin ID de pantalla)

* **Vistas de error:** las páginas de error **403, 404, 500 y error técnico** (`/error/{tipo}`) se mantienen como vistas globales transversales **sin ID de pantalla** (en el esquema anterior ocupaban el ID P-20).
* **Modales de confirmación y avisos** (éxito, error, confirmación de acciones sensibles) se mantienen como **componentes globales sin ID de pantalla** (en el esquema anterior ocupaban el ID P-21).
* Ambos se construyen en la HU-01 y se reutilizan en todas las pantallas P- e I-.

### Pantallas con alcance POR CONFIRMAR (pendientes del §8 de `Pantallas_y_Datos_Migracion.md`)

| ID | Pantalla | Pendiente del §8 |
| --- | --- | --- |
| P-15 | Paso 7 — Pagos y tasas | Pagos en línea: captura simulada, sin pasarela real; definir si el SNM habilita pago electrónico o la validación sigue siendo por cheque certificado capturado (§8.3). |
| P-18 | Reserva de cita | Cobertura de ventanilla: confirmar qué trámites quedan 100 % en línea y cuáles requieren cita presencial (fotos, huella, firma de entrevista, retiro con identificación) (§8.4). |
| P-24 | Edictos y citaciones | Alcance, plazos y canal de publicación por confirmar con las fuentes oficiales (§8). |
| P-25 | Certificaciones en línea | Campos y disponibilidad de estatus y movimiento migratorio por confirmar con las fuentes oficiales (§8). |

> Estas cuatro pantallas se construyen y navegan en el Sprint 1, pero sus reglas de negocio quedan marcadas como **POR CONFIRMAR** hasta que el PO cierre los pendientes del §8; cualquier cambio se registra en el *Registro de cambios del backlog* (§5.1).

### Pendientes del PO sobre el inventario (PEN-01…PEN-12)

Inconsistencias detectadas al elaborar el plan de ejecución del Frontend (`Frontend/plan-de-ejecucion-frontend.md`, Anexo A). El PO debe resolverlas; mientras estén **ABIERTAS**, el Frontend aplica el tratamiento indicado en el plan (marcar como POR DEFINIR/PO en lugar de inventar):

| ID | Hallazgo | Dónde | Decisión requerida | Estado |
| --- | --- | --- | --- | --- |
| PEN-01 | La cadena visible en P-19 omite `ARCHIVADO`, que sí aparece en la cadena general §7.2 e I-08/I-13 | P-19 vs §7.2 | ¿`ARCHIVADO` es visible para el cliente? | ABIERTO |
| PEN-02 | §7.1 asocia la ficha CSS (90 días/9 cuotas) a P-25, pero P-25 no pide esa ficha | §7.1 vs P-25 | Corregir la asociación (la regla aplica en P-12/P-13/N-6) | ABIERTO |
| PEN-03 | P-14 exige completitud 100 % para habilitar P-16; P-15 (pagos) queda intermedio sin regla clara | P-14/P-15, HU-03 CA-4 | ¿El pago requiere completitud previa? | ABIERTO |
| PEN-04 | El backlog etiquetaba POR CONFIRMAR solo P-24/P-25; el §8 cuestiona también P-15 y P-18 | HU-04 CA-7 vs §8 | Confirmar las 4 pantallas POR CONFIRMAR (ya reflejadas arriba) | PENDIENTE DEL PO |
| PEN-05 | El entregable del Sprint 1 dice "portal completo P-01…P-27" pero la nota de capacidad permite recortar P-26/P-27 | Rama-01 (Sprint 1) | Confirmar el recorte como excepción registrable | ABIERTO |
| PEN-06 | I-13: la matriz de accesos da al notificador solo lectura, pero la fuente define acciones de archivo/reactivación sin dueño | `06-roles` §6.4 vs I-13 | Asignar rol dueño de la acción | ABIERTO |
| PEN-07 | ¿SUPERVISOR es rol separado o atribución de FUNCIONARIO con reportes? | `06-roles` §6.13 | Confirmar (se usa como rol técnico separado) | ABIERTO |
| PEN-08 | ¿El OTP de P-03 es solo verificación de identidad o también factor de autenticación obligatorio? | `06-roles` §6.13 | Confirmar alcance del OTP | ABIERTO |
| PEN-09 | Campos de origen `S` (RUEX, expedientes previos): no existen sistemas del SNM en el producto del bufete | §1.3 vs `06-roles` §6.9 | Confirmar que se tratan como derivados sellados con registro manual en I-07 | ABIERTO |
| PEN-10 | Sin datos oficiales de tiempos por etapa (línea base 3–8 meses) | §8.1 | Fijar meta de reducción medida en el despacho | ABIERTO |
| PEN-11 | Catálogos no enumerados en las fuentes: sedes, tipos de consulta, motivos de negación, tipos documentales, división política, países | Varios | Definir valores oficiales (hoy van en fixtures de ejemplo) | ABIERTO |
| PEN-12 | El documento fuente usa vocabulario de administración pública (ciudadano/SNM) y el producto es de bufetes | Inventario completo | Vocabulario ya traducido en los documentos del producto; validar que no se alteren campos ni numeración | EN CURSO |

*Fuente: `Frontend/plan-de-ejecucion-frontend.md` (Anexo A). El cierre de cada punto se registra en el *Registro de cambios del backlog* (§5.1). El PO gestiona estos pendientes en `Rama-04-Producto-Documentacion.md`.*

---

## 5.6. Fuentes de verificación simuladas requeridas (mocks, alcance del Sprint 1)

El backend expondrá un conjunto de endpoints simulados bajo el prefijo `/api/mock/`, con datos ficticios, que **representan fuentes de verificación externas** durante todo el MVP. Son el mecanismo de demostración y de conexión del frontend: el **modo de producción es la verificación manual asistida** (el abogado o analista registra el resultado con fuente, fecha y responsable), y estos mocks representan las **futuras integraciones automatizadas**, que solo existirán cuando haya convenio (ver HU-06 y HU-08):

| Fuente simulada (mock) | Endpoint propuesto | Consulta que representa |
| --- | --- | --- |
| Tribunal Electoral (TE) | `GET /api/mock/te/personas/{tipoDoc}/{numero}` | Verificación de identidad / Registro Civil |
| Caja de Seguro Social (CSS) | `GET /api/mock/css/afiliaciones/{idPersona}` | Condición de afiliado / asegurado |
| Registro Público | `GET /api/mock/registro/consultas/{idPersona}` | Información registral autorizada |
| SNM (referencia externa) | `GET /api/mock/snm/expedientes/{numero}` | Estado de un expediente en el sistema oficial |

**Mecanismo de escenarios:** cada mock acepta el header `X-Scenario` (o parámetro `?scenario=`) para forzar comportamientos de prueba:

`OK` · `SIN_RESULTADO` · `ERROR_TECNICO` (500) · `TIMEOUT` · `RATE_LIMIT` (429) · `DATOS_INCOMPLETOS` · `LLENO` (respuesta válida duplicada para probar idempotencia)

---

## 5.7. Detalle de sprints

---

# Sprint 1 — Frontend del portal (P-01…P-27), marco legal de verificación y fuentes simuladas

**Semanas:** 1–2
**Objetivo:** disponer del **portal completo (P-01…P-27)** navegable y con diseño terminado, iniciar el módulo interno (I-01…I-18) o dejarlo listo para el arranque del Sprint 2, y contar con un backend con los contratos de API definidos, las fuentes de verificación simuladas operativas y el **marco legal y la matriz de fuentes de verificación** documentados.
**Épicas:** EP-10, EP-01, EP-06.

### Resumen del sprint

| HU | Título | Prioridad | PH | Responsable |
| --- | --- | --- | --- | --- |
| HU-01 | Andamiaje del frontend y diseño base | Crítica | 5 | FE |
| HU-02 | Pantallas de acceso y cuenta (P-01…P-05) | Crítica | 3 | FE |
| HU-03 | Módulo de solicitante (P-06…P-18) | Crítica | 8 | FE |
| HU-04 | Seguimiento del solicitante (P-19…P-27) | Crítica | 8 | FE |
| HU-05 | Módulo interno del despacho (I-01…I-18) | Alta | 5 | FE |
| HU-06 | Estudio del marco legal y fuentes de verificación | Crítica | 5 | LT, PO |
| HU-07 | Contratos de API (OpenAPI) del producto | Crítica | 3 | LT, BE |
| HU-08 | Fuentes de verificación simuladas (modo manual asistido) | Crítica | 8 | BE |
| HU-09 | Integración del frontend con los mocks y estados de interfaz | Crítica | 5 | FE, BE |

**PH total del sprint: 50** · **Nota de capacidad:** es un sprint exigente; si la capacidad real es menor, la HU-05 (módulo interno I-01…I-18) se ejecuta al inicio del Sprint 2 (fase E/F) y el PO registra el desplazamiento en el *Registro de cambios del backlog* (§5.1), sin afectar la ruta crítica.

### HU-01 — Andamiaje del frontend y diseño base

**Prioridad:** Crítica · **5 PH** · **Responsable:** FE · **Estado:** Por hacer

**Como** desarrollador frontend, **quiero** contar con la estructura base del cliente (layout, navegación, estilos y componentes reutilizables) **para** que todas las pantallas se construyan sobre un patrón consistente y reutilizable.

**Criterios de aceptación:**

1. Existe una estructura de carpetas del frontend documentada en el repositorio (vistas, componentes, servicios, estilos, utilidades).
2. El layout incluye encabezado, menú de navegación según rol, área de contenido y pie, y se adapta a escritorio y tablet.
3. La navegación entre las **45 pantallas del inventario oficial** (portal P-01…P-27 e interno I-01…I-18, §5.5) funciona sin recargas completas, usa enrutado con hash y respeta el rol activo (un rol no ve enlaces de otros roles).
4. Están implementadas las vistas globales: el login (P-01) y las cuatro vistas de error (403, 404, 500 y error técnico), junto con los modales de confirmación y avisos, estos últimos como componentes globales sin ID de pantalla (§5.5), reutilizables desde cualquier pantalla.
5. Existe una biblioteca mínima de componentes: botones, campos de formulario, tablas, tarjetas de estado, modales, avisos (éxito/error/carga) y paginación.
6. La paleta de colores, tipografía y espaciados están definidos en un único archivo de variables y documentados en `README` del frontend.
7. El frontend se ejecuta con un comando único documentado y no contiene credenciales ni secretos.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-01.1 | Crear la estructura de carpetas del frontend (alineada al inventario P-01…P-27 e I-01…I-18) y el archivo de variables de diseño (colores, tipografía, espaciados). | FE | 3 h |
| TASK-01.2 | Implementar el layout base: encabezado, menú lateral/top por rol, área de contenido y pie. | FE | 5 h |
| TASK-01.3 | Implementar el enrutado con hash y la protección de rutas por rol (redirect a P-01 o a la vista de error 403), incluyendo las vistas globales: login (P-01) y errores (403, 404, 500 y error técnico). | FE | 4 h |
| TASK-01.4 | Desarrollar la biblioteca de componentes reutilizables (botones, inputs, tablas, modales de confirmación, avisos, paginación). | FE | 8 h |
| TASK-01.5 | Documentar el diseño base, las convenciones y la correspondencia rutas ↔ IDs del inventario en el `README` del frontend. | DOC, FE | 2 h |

**Pruebas asociadas:** navegación básica y bloqueo de rutas por rol (caso base previo a CP-01/CP-03).

---

### HU-02 — Pantallas de acceso y cuenta (P-01…P-05)

**Prioridad:** Crítica · **3 PH** · **Responsable:** FE · **Estado:** Por hacer

**Como** usuario, **quiero** registrarme, verificar mi identidad, iniciar sesión, recuperar mi contraseña y gestionar mi perfil **para** acceder al portal de forma segura.

**Criterios de aceptación:**

1. La pantalla P-01 (inicio de sesión) valida campos obligatorios, formato de correo y muestra/oculta la contraseña.
2. El intento fallido muestra un mensaje genérico que no revela si el usuario existe (compatible con CP-02).
3. Existe bloqueo visual tras intentos repetidos, con contador y mensaje claro.
4. La pantalla P-02 (registro de cuenta) solicita los datos obligatorios, incluye la autorización de tratamiento de datos (Ley 81) y envía código de verificación.
5. La pantalla P-03 (verificación de identidad) consume un **OTP simulado** (código de 6 dígitos con expiración y número de intentos) sin depender de un proveedor externo.
6. La pantalla P-04 (recuperación de contraseña) solicita correo y muestra confirmación neutra sin revelar existencia de cuentas.
7. La pantalla P-05 (mi perfil) permite actualizar datos de contacto y cambiar la contraseña con verificación de la actual y política de complejidad.
8. Tras iniciar sesión, el menú y la ruta inicial cambian según el rol (portal del cliente o módulo interno del despacho: recepción, analista, resolutor/director, notificador, administrador, auditoría).
9. Cerrar sesión limpia el estado local y redirige a P-01 (`/login`).

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-02.1 | Construir la pantalla P-01 con validaciones de formulario en cliente. | FE | 4 h |
| TASK-02.2 | Construir las pantallas P-02 (registro), P-03 (OTP simulado), P-04 (recuperación de contraseña) y P-05 (mi perfil) con sus estados de carga, éxito y error. | FE | 4 h |
| TASK-02.3 | Implementar el gestor de sesión en el cliente (almacenamiento del token, expiración, cierre de sesión). | FE | 4 h |
| TASK-02.4 | Adaptar el layout y el menú al rol autenticado y a los cambios de rol. | FE | 3 h |

**Pruebas asociadas:** CP-01, CP-02.

---

### HU-03 — Módulo de solicitante (P-06…P-18)

**Prioridad:** Crítica · **8 PH** · **Responsable:** FE · **Estado:** Por hacer

**Como** solicitante, **quiero** iniciar, completar y enviar mis solicitudes y documentos desde pantallas claras **para** evitar viajes repetidos y entregas duplicadas de documentación.

**Criterios de aceptación:**

1. P-07 permite seleccionar el tipo de trámite y P-08 registra la titularidad o la representación (poder notariado, parentesco o carácter jurídico), validando los campos obligatorios antes de entrar al asistente.
2. El asistente P-09…P-16 (pasos 1–8) valida campos obligatorios en cada paso, permite avanzar y retroceder sin perder datos y muestra el progreso; P-14 (paso 6) centraliza la carga de requisitos y documentos.
3. P-15 (paso 7, pagos y tasas) funciona con **captura simulada de pago y sin pasarela real**, y queda marcada como **POR CONFIRMAR** (§8 del documento de pantallas).
4. P-17 resume y envía la solicitud generando el número de expediente, y P-18 permite reservar la cita presencial, también marcada como **POR CONFIRMAR** (§8 del documento de pantallas).
5. P-06 (mis trámites) muestra el listado de solicitudes del usuario con filtros por estado y fecha, paginación y estados vacíos/carga/error.
6. P-14 permite adjuntar documentos con selección de tipo documental, validación de formato y tamaño en cliente, barra de progreso y resultado del alta; muestra los documentos ya registrados con estado de revisión y deshabilita la descarga cuando el usuario no tiene permiso.
7. Todas las pantallas del módulo funcionan con datos ficticios locales y tienen implementados los estados de error y de operación en curso.
8. Los mensajes de error explican la causa en lenguaje no técnico y sugieren la acción siguiente.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-03.1 | Construir el asistente P-09…P-16 (pasos 1–8) y P-17 (resumen y envío) con validaciones por paso y revisión final. | FE | 8 h |
| TASK-03.2 | Construir P-06 (mis trámites) con filtros, paginación y estados vacío/carga/error. | FE | 5 h |
| TASK-03.3 | Construir P-07 (selección de trámite) y P-08 (titularidad y representación) como puerta de entrada al asistente. | FE | 6 h |
| TASK-03.4 | Construir P-14 (paso 6: carga de documentos) con validación de tipo/tamaño y listado de documentos. | FE | 8 h |
| TASK-03.5 | Construir P-15 (pagos, captura simulada) y P-18 (reserva de cita), ambas marcadas POR CONFIRMAR según el §8 del documento de pantallas. | FE | 3 h |
| TASK-03.6 | Definir los datos ficticios de demostración del solicitante (fixtures) y su fuente única. | FE | 2 h |

**Pruebas asociadas:** CP-03, CP-05, CP-12 (interfaz).

---

### HU-04 — Seguimiento del solicitante (P-19…P-27)

**Prioridad:** Crítica · **8 PH** · **Responsable:** FE · **Estado:** Por hacer

**Como** solicitante, **quiero** consultar el estado de mis solicitudes, atender observaciones, recibir resultados y usar los servicios en línea **para** seguir mi trámite sin acudir a la ventanilla.

**Criterios de aceptación:**

1. P-19 muestra identificador, tipo de trámite, estado actual con línea de tiempo de avance, fechas clave y responsable asignado.
2. P-20 lista observaciones y notificaciones con fecha, tipo y estado de lectura, sin exponer datos confidenciales en el texto, y permite responder.
3. P-21 (subsanación) admite corregir documentos o datos observados dentro del plazo, con la misma validación de tipo/tamaño que P-14.
4. P-22 muestra los resultados (resoluciones, carné digital y certificados) descargables, con la descarga deshabilitada cuando el usuario no tiene permiso.
5. P-23 lista el historial de pagos con fecha, concepto, monto y estado.
6. P-24 (edictos y citaciones) y P-25 (certificaciones en línea) están navegables pero marcadas como **POR CONFIRMAR** (§8 del documento de pantallas).
7. P-26 (naturalización) presenta el flujo específico y P-27 (ayuda y FAQ) resuelve dudas y peticiones; ambas son navegables y coherentes con el diseño base.
8. Todas las pantallas del módulo funcionan con datos ficticios locales, tienen implementados los estados de error y de operación en curso, y sus mensajes explican la causa en lenguaje no técnico.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-04.1 | Construir P-19 con línea de tiempo de estados, bloque de fechas y responsable. | FE | 6 h |
| TASK-04.2 | Construir P-20 (observaciones y notificaciones) reutilizando el componente de detalle y con hilo de comentarios. | FE | 5 h |
| TASK-04.3 | Construir P-21 (subsanación) y P-22 (resultados: resoluciones, carné digital y certificados). | FE | 6 h |
| TASK-04.4 | Construir P-23 (historial de pagos) y P-24 (edictos y citaciones, POR CONFIRMAR). | FE | 5 h |
| TASK-04.5 | Construir P-25 (certificaciones en línea, POR CONFIRMAR), P-26 (naturalización) y P-27 (ayuda y FAQ). | FE | 6 h |

**Pruebas asociadas:** CP-04, CP-06, CP-07, CP-08, CP-09.

---

### HU-05 — Módulo interno del despacho (I-01…I-18)

**Prioridad:** Alta · **5 PH** · **Responsable:** FE · **Estado:** Por hacer

**Como** personal del despacho (recepción, analista, resolutor/director, notificador, administrador y auditoría), **quiero** contar con las pantallas del módulo interno **para** recibir, analizar, resolver, notificar y auditar expedientes sin salir del sistema.

**Nota de capacidad:** esta HU se ejecuta al inicio del Sprint 2 (fase E/F) si la capacidad del Sprint 1 no alcanza; el PO registra el desplazamiento en el *Registro de cambios del backlog* (§5.1).

**Criterios de aceptación:**

1. I-01 exige credenciales institucionales y segundo factor (MFA simulado) para analistas, resolutores y administradores, y registra estación/IP.
2. I-02 (tablero) muestra indicadores operativos y I-03 (bandeja de recepción) lista citas y turnos con filtros, estados de llegada y paginación.
3. I-04 permite verificar completitud con checklist (identidad, pagos, sello, RUEX) y I-05 permite asignar analista con confirmación de la acción sensible.
4. I-06 (análisis con checklist) e I-07 (panel de verificación interoperable) muestran cada verificación con su estado propio (pendiente, en atención manual o enviada, respondida, sin resultado, error técnico, reintento), distinguiendo visualmente el error técnico de un resultado negativo (compatible con CP-07).
5. I-07 ofrece la acción "reintentar" solo cuando el estado lo permite, y avisa que la operación es idempotente (compatible con CP-08).
6. I-08 (observaciones), I-09 (edictos), I-10 (resolución), I-11 (notificación), I-12 (entrega en ventanilla) e I-13 (archivados y reactivación) presentan solo las acciones autorizadas para el rol, exigen motivo en la resolución y piden confirmación antes de enviar.
7. I-14 (catálogos), I-15 (usuarios, roles y permisos) e I-16 (bitácora de auditoría) están restringidos a sus roles; la bitácora permite filtrar por fecha, actor, operación y recurso, con paginación y exportación a CSV.
8. I-17 (reportes y tiempos por etapa) e I-18 (salud de interoperabilidad) muestran indicadores, intentos fallidos y errores técnicos diferenciados de los resultados de verificación; ninguna pantalla del módulo muestra datos de expedientes a usuarios sin permiso (compatible con CP-03 y CP-09).

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-05.1 | Construir I-01 (login institucional con MFA simulado) e I-02 (tablero) con indicadores. | FE | 6 h |
| TASK-05.2 | Construir I-03 (bandeja de recepción), I-04 (recepción y completitud) e I-05 (asignación de analista). | FE | 5 h |
| TASK-05.3 | Construir I-06 (análisis con checklist) e I-07 (panel de verificación interoperable) con estados de verificación y reintento. | FE | 6 h |
| TASK-05.4 | Construir I-08 a I-13 (observaciones, edictos, resolución, notificación, entrega y archivados) con acciones por rol. | FE | 4 h |
| TASK-05.5 | Construir I-14 a I-18 (catálogos, usuarios/roles/permisos, bitácora, reportes y salud de interoperabilidad). | FE | 4 h |

**Pruebas asociadas:** CP-09, CP-12.

---

### HU-06 — Estudio del marco legal y fuentes de verificación

**Prioridad:** Crítica · **5 PH** · **Responsable:** LT con PO · **Estado:** Por hacer

**Como** líder técnico del despacho, **quiero** determinar qué puede verificar la plataforma legalmente hoy y con qué base, **para** construir el producto sobre verificaciones trazables, consentimiento informado y minimización de datos (Ley 81 de 2019 y Decreto Ejecutivo 285 de 2021).

**Criterios de aceptación:**

1. Existe una **Matriz de fuentes de verificación** con una fila por fuente (Tribunal Electoral/Registro Civil, Registro Público, CSS, SNM, documentos aportados por el cliente) y con las columnas obligatorias: **fuente → tipo (`PÚBLICA` / `AUTORIZADA` por el titular) → qué se guarda (solo resultado: fuente, fecha, resultado, responsable) → base legal**.
2. Queda mapeado qué puede verificar el despacho **legalmente hoy**: fuentes públicas (cédula del TE, Registro Público) y documentos aportados por el cliente u obtenidos por el despacho con consentimiento o autorización del titular.
3. Queda confirmado y documentado que **no hay convenios ni APIs disponibles**, y se deja trazado el camino futuro de automatización (convenio con la institución, p. ej. vía AIG) sin rehacer el sistema.
4. Está definido el **modelo de consentimiento informado** y de tratamiento de datos sensibles (consentimiento expreso), con validación jurídica, e incluye finalidad, alcance, vigencia y revocación (ver HU-18b).
5. La matriz registra para cada fuente: canal de consulta (fuente pública, documento autorizado, futuro convenio), responsable, requisitos legales (Ley 81 de 2019, Decreto 285 de 2021, competencia institucional), dependencia (`NINGUNA`, `AUTORIZACIÓN DEL TITULAR`, `CONVENIO PENDIENTE`) y estado (`VERIFICABLE HOY`, `REQUIERE AUTORIZACIÓN`, `PENDIENTE DE CONVENIO`, `NO APLICABLE`).
6. Se documenta la conclusión operativa: qué mocks se requieren, qué contrato mínimo deben cumplir para reflejar la verificación futura y que el modo de producción es la **verificación manual asistida**.
7. El estudio no asume ni declara acceso automático a datos institucionales; toda integración automatizada futura queda marcada como pendiente de convenio.
8. El resultado se revisa con el PO (y con asesoría jurídica del despacho) y se enlaza desde la documentación del proyecto.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-06.1 | Definir la plantilla de la matriz de fuentes de verificación y sus columnas obligatorias (fuente, tipo, qué se guarda, base legal). | LT | 2 h |
| TASK-06.2 | Mapear qué puede verificar el despacho hoy: fuentes públicas (cédula TE, Registro Público, consultas SNM) y documentos aportados u obtenidos con consentimiento o autorización del titular. | LT | 8 h |
| TASK-06.3 | Confirmar la inexistencia de convenios o APIs disponibles, documentar el camino futuro (AIG) y registrar las restricciones legales por fuente (finalidad, base legal, minimización). | LT, PO | 4 h |
| TASK-06.4 | Definir el modelo de consentimiento informado y de tratamiento de datos sensibles con validación jurídica, y derivar de la matriz los contratos y escenarios de las fuentes simuladas. | LT, BE | 3 h |
| TASK-06.5 | Socializar resultados con el PO y publicar el marco legal y la matriz en la documentación. | LT, DOC | 2 h |

**Entregable:** `07-marco-legal-y-matriz-fuentes-verificacion.md` (marco legal y matriz de fuentes de verificación, en `Documentacion/`).

---

### HU-07 — Contratos de API (OpenAPI) del producto

**Prioridad:** Crítica · **3 PH** · **Responsable:** LT con BE · **Estado:** Por hacer

**Como** equipo técnico, **quiero** definir los contratos de la API antes de implementarlos **para** que frontend y backend trabajen en paralelo sobre un acuerdo verificable.

**Criterios de aceptación:**

1. Existe un archivo `openapi.yaml` con al menos: autenticación, expedientes, documentos, estados, verificaciones, consentimiento, auditoría y las fuentes de verificación simuladas (mocks).
2. Cada operación documenta método, ruta, parámetros, cuerpo, respuestas (2xx, 4xx, 5xx) y control de autorización asociado.
3. Los nombres, códigos de estado y errores coinciden con las reglas del Documento 3 (400, 401, 403, 404, 409, 5xx).
4. El contrato incluye los headers de escenario (`X-Scenario`) de las fuentes simuladas.
5. El archivo valida sin errores con un linter de OpenAPI y se versiona en Git.
6. Se acuerda el procedimiento de cambios: toda modificación se registra en el changelog del contrato antes de implementarse.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-07.1 | Definir esquemas de datos compartidos (Expediente, Documento, Validación, Evento de auditoría, Error). | LT | 4 h |
| TASK-07.2 | Escribir las operaciones de autenticación, expedientes y documentos. | BE | 4 h |
| TASK-07.3 | Escribir las operaciones de estados, verificaciones, consentimiento, auditoría y mocks. | BE | 4 h |
| TASK-07.4 | Validar el archivo con linter, corregir y versionar. | BE | 2 h |

**Entregable:** `docs/openapi.yaml` + registro de cambios.

---

### HU-08 — Fuentes de verificación simuladas (modo manual asistido)

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE · **Estado:** Por hacer

**Como** equipo de desarrollo, **quiero** exponer fuentes de verificación simuladas de TE, CSS, Registro Público y SNM (mocks) **para** construir y probar el flujo completo y para que el frontend conecte, sin depender de integraciones reales.

**Nota de alcance (RC-02):** el **modo de producción es la verificación manual asistida**: el abogado o analista del despacho registra el resultado de la verificación con **fuente, fecha y responsable**. Los mocks de esta historia existen (a) para demostrar el flujo extremo a extremo y (b) para representar las **futuras integraciones automatizadas con las instituciones**, que solo se activarán cuando exista convenio; hasta entonces no hay transferencia automática de datos.

**Criterios de aceptación:**

1. Están implementados y responden los cuatro endpoints de la sección 5.6 (`/api/mock/*`) con datos ficticios coherentes y sin datos personales reales.
2. Cada mock soporta el header `X-Scenario` con, como mínimo, `OK`, `SIN_RESULTADO`, `ERROR_TECNICO`, `TIMEOUT`, `RATE_LIMIT` y `DATOS_INCOMPLETOS`.
3. Las respuestas cumplen el contrato `openapi.yaml` (validado por pruebas de contrato).
4. Los mocks incluyen latencia simulada configurable para poder probar tiempos de espera.
5. Existe un conjunto de datos ficticios maestro (personas, afiliaciones, registros) con identificadores usados por las pantallas de demostración.
6. Los mocks son reemplazables: la capa de integración del producto apunta a una interfaz, no a los mocks directamente (requisito de sustitución por una futura integración autorizada y convenida).
7. El endpoint de SNM simulado devuelve coherencia con los expedientes creados en la plataforma (o explica su desfase en la respuesta).
8. Queda documentado y probado que el registro manual asistido del resultado (fuente, fecha, responsable) produce la misma entidad de verificación que el modo simulado, de modo que la interfaz no cambia al alternar de modo.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-08.1 | Definir el modelo de datos ficticios maestro y su fuente única (fixture versionada). | BE | 4 h |
| TASK-08.2 | Implementar el mock del TE con sus escenarios. | BE | 6 h |
| TASK-08.3 | Implementar el mock de la CSS con sus escenarios. | BE | 5 h |
| TASK-08.4 | Implementar el mock del Registro Público con sus escenarios. | BE | 5 h |
| TASK-08.5 | Implementar el mock del SNM y la lógica de escenarios y latencia simulada. | BE | 5 h |
| TASK-08.6 | Escribir pruebas de contrato de cada mock contra `openapi.yaml`. | BE, QA | 5 h |
| TASK-08.7 | Documentar el uso de los mocks y de `X-Scenario` para el equipo, dejando explícito que el modo de producción es la verificación manual asistida y que los mocks representan futuras integraciones sujetas a convenio. | DOC | 2 h |

**Pruebas asociadas:** CP-06, CP-07.

---

### HU-09 — Integración del frontend con los mocks y estados de interfaz

**Prioridad:** Crítica · **5 PH** · **Responsable:** FE con BE · **Estado:** Por hacer

**Como** usuario, **quiero** que las pantallas se alimenten de las APIs ficticias y muestren correctamente carga, éxito, vacío y error **para** verificar el flujo real antes de construir la lógica de negocio.

**Criterios de aceptación:**

1. Existe un único módulo de servicios HTTP en el frontend (llamadas centralizadas, manejo de token, manejo de errores).
2. Cada pantalla implementa y muestra los cuatro estados: carga, éxito, vacío y error con reintento.
3. I-07 (panel de verificación interoperable) y el bloque de estado de P-19 pueden mostrar los escenarios `OK`, `SIN_RESULTADO`, `ERROR_TECNICO` y `TIMEOUT` usando los mocks, manteniendo la distinción visual entre error técnico y resultado negativo.
4. Los errores HTTP se traducen a mensajes de usuario según el código (401, 403, 404, 409, 5xx) sin filtrar detalles técnicos.
5. El flujo completo navegable con mocks funciona: P-01 (login) → P-07…P-17 (crear solicitud) → P-14 (adjuntar documentos) → P-19 (ver estado) → I-07 (ver verificaciones simuladas).
6. No hay llamadas a endpoints inexistentes ni errores de consola en el recorrido principal.
7. Los fixtures locales comparten el mismo esquema JSON que los mocks del HU-08, de modo que conectar es cambiar la fuente de datos sin reescribir pantallas.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-09.1 | Implementar el módulo de servicios HTTP con manejo centralizado de errores y token. | FE | 5 h |
| TASK-09.2 | Sustituir los fixtures locales por llamadas a los mocks en las pantallas del solicitante. | FE | 6 h |
| TASK-09.3 | Sustituir los fixtures locales por llamadas a los mocks en las pantallas del módulo interno (I-01…I-18). | FE | 6 h |
| TASK-09.4 | Implementar el selector de escenarios en la UI de demostración para forzar errores de los mocks. | FE | 3 h |
| TASK-09.5 | Recorrer el flujo completo y corregir incidencias (errores de consola, estados faltantes). | FE, QA | 4 h |

**Pruebas asociadas:** CP-06, CP-07, CP-11 (recorrido base).

### Entregables del Sprint 1

* Frontend con el portal del cliente (P-01…P-27) navegable y diseño base documentado.
* Módulo interno del despacho (I-01…I-18) navegable, terminado al inicio del Sprint 2 si la capacidad del Sprint 1 no alcanza (ver registro de cambios, §5.1).
* `openapi.yaml` con los contratos del producto.
* Fuentes de verificación simuladas (mocks) de TE, CSS, Registro Público y SNM operativas con escenarios de error.
* **Marco legal y matriz de fuentes de verificación** (fuente → tipo → qué se guarda → base legal).
* Flujo navegable de extremo a extremo con datos ficticios.

### DoD del Sprint 1

* Las 45 pantallas del inventario (P-01…P-27 e I-01…I-18) existen y son navegables por rol, con las cuatro vistas de error y los modales globales reutilizables (el módulo interno puede cerrarse al inicio del Sprint 2, según el registro de cambios).
* El contrato OpenAPI valida sin errores y está versionado.
* Los mocks responden según contrato, con al menos seis escenarios cada uno.
* El marco legal y la matriz de fuentes de verificación están revisados por el PO.
* No hay credenciales ni datos reales en el repositorio.

### Riesgos y bloqueos del Sprint 1

| Riesgo | Señal de alerta | Acción |
| --- | --- | --- |
| Alcance de frontend demasiado amplio | Pantallas incompletas al final de la semana 1 | Priorizar el portal P-01…P-27; desplazar el módulo interno I-01…I-18 al inicio del Sprint 2 y registrarlo en el §5.1 |
| Contrato de API inestable | Cambios diarios en `openapi.yaml` | Congelar contrato al final de la semana 1; cambios vía registro |
| Mapeo de fuentes sin evidencia | Filas de la matriz sin base legal identificada | Marcar `PENDIENTE DE CONVENIO` y continuar con verificación manual asistida y fuentes simuladas |

---

# Sprint 2 — Base del backend: entorno, modelo de datos y autenticación

**Semanas:** 3–4
**Objetivo:** construir el entorno reproducible, el modelo de datos persistente y la autenticación/autorización reales, sustituyendo el login simulado del Sprint 1. **Nota:** si la HU-05 (módulo interno I-01…I-18) se desplazó del Sprint 1, se completa al inicio de este sprint (fase E/F) antes que las HU-10…HU-14, quedando registrada en el *Registro de cambios del backlog* (§5.1).
**Épicas:** EP-02, EP-03.

### Resumen del sprint

| HU | Título | Prioridad | PH | Responsable |
| --- | --- | --- | --- | --- |
| HU-10 | Entorno reproducible (Docker, Spring Boot, PostgreSQL) | Crítica | 5 | LT, BE |
| HU-11 | Modelo de datos e infraestructura de persistencia | Crítica | 8 | BE |
| HU-12 | Autenticación real (login, sesiones/token, contraseñas) | Crítica | 8 | BE |
| HU-13 | Autorización por roles aplicada a los endpoints | Crítica | 8 | BE |
| HU-14 | Manejo de errores y respuestas HTTP coherentes | Alta | 5 | BE |

**PH total del sprint: 34**

### HU-10 — Entorno reproducible

**Prioridad:** Crítica · **5 PH** · **Responsable:** LT con BE · **Estado:** Por hacer

**Como** desarrollador, **quiero** levantar backend, base de datos y frontend con un solo comando **para** eliminar diferencias entre entornos y facilitar las pruebas.

**Criterios de aceptación:**

1. `docker compose up` levanta backend, PostgreSQL y frontend sin pasos manuales adicionales.
2. El proyecto Java compila y arranca con el comando documentado en el `README` raíz.
3. Las migraciones del esquema se ejecutan automáticamente al arrancar (Flyway o Liquibase) y son reproducibles desde cero.
4. La configuración usa variables de entorno; existe un archivo `.env.example` sin secretos reales.
5. El repositorio contiene `.gitignore` adecuado (secretos, `target/`, node_modules, volúmenes) y no expone credenciales en el historial.
6. Un integrante nuevo del equipo sigue el `README` y consigue el entorno funcionando en menos de 30 minutos.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-10.1 | Inicializar el repositorio con estructura backend/frontend/docs y convenciones de ramas. | LT | 3 h |
| TASK-10.2 | Configurar Spring Boot con perfiles (`local`, `test`) y dependencias base — backend en **Java** (herramienta obligatoria). | BE | 4 h |
| TASK-10.3 | Configurar PostgreSQL y guiones/migraciones del esquema inicial. | BE | 6 h |
| TASK-10.4 | Crear los `Dockerfile` y el `docker-compose.yml` (backend, db, frontend) con healthchecks — **Docker** (herramienta obligatoria). | BE, FE | 6 h |
| TASK-10.5 | Crear `.env.example`, `.gitignore` y redactar la guía de instalación rápida. | DOC, LT | 3 h |
| TASK-10.6 | Verificar arranque limpio en una máquina nueva y registrar evidencia. | QA | 2 h |

**Pruebas asociadas:** verificación de instalación limpia (previa a CP-10, entorno).

---

### HU-11 — Modelo de datos e infraestructura de persistencia

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE · **Estado:** Por hacer

**Como** equipo técnico, **quiero** implementar el modelo de datos con integridad y restricciones **para** que toda la aplicación se apoye en datos consistentes.

**Criterios de aceptación:**

1. Están implementadas las entidades del Documento 3.4: Usuario, Rol, Expediente, Documento, Verificación y resultado de verificación, Consentimiento informado, Solicitud ARCO, Historial de estados, Evento de auditoría, Notificación.
2. Las relaciones usan claves primarias y foráneas con restricciones de integridad (no nulos, unicidad, eliminación restringida donde aplique).
3. Los repositorios o mappers están separados de los servicios de negocio.
4. Existen datos semilla (seed) para roles, tipos de trámite, tipos documentales y usuarios de demostración por rol.
5. Las consultas de listado por titularidad y estado están probadas con índices adecuados.
6. Ningún dato personal devuelto por una fuente de verificación se almacena cuando basta con el resultado mínimo (fuente, fecha, resultado, responsable); no se conservan copias institucionales (regla de minimización del Documento 3.4, ver HU-25).

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-11.1 | Implementar entidades y relaciones de usuarios, roles y permisos. | BE | 5 h |
| TASK-11.2 | Implementar entidades de expediente, documento e historial de estados. | BE | 6 h |
| TASK-11.3 | Implementar entidades de verificación y resultado de verificación (resultado mínimo), consentimiento informado, solicitud ARCO y evento de auditoría. | BE | 5 h |
| TASK-11.4 | Escribir migraciones y datos semilla por tipo de trámite. | BE | 5 h |
| TASK-11.5 | Escribir pruebas de integridad y consultas de listado. | BE, QA | 5 h |

**Pruebas asociadas:** pruebas de integración de la sección 4.2.

---

### HU-12 — Autenticación real

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE · **Estado:** Por hacer

**Como** usuario, **quiero** autenticarme con credenciales reales protegidas **para** acceder al sistema de forma segura.

**Criterios de aceptación:**

1. `POST /api/auth/login` valida credenciales y devuelve token (o sesión) con expiración definida.
2. Las contraseñas se almacenan con hash adaptativo (BCrypt/Argon2) y nunca en texto plano ni en logs.
3. Existe límite de intentos con bloqueo temporal y mensaje genérico de fallo (compatible con CP-02).
4. El cierre de sesión invalida el token o la sesión (compatible con la limpieza del cliente).
5. El cambio de contraseña exige la contraseña actual y aplica la política de complejidad.
6. Los endpoints protegidos rechazan peticiones sin credenciales con `401` (compatible con CP-01/CP-02).
7. Los secretos de configuración viven fuera del código fuente.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-12.1 | Implementar entidades de usuario y hash de contraseñas con política de complejidad. | BE | 5 h |
| TASK-12.2 | Implementar `POST /api/auth/login`, emisión de token/sesión y expiración. | BE | 6 h |
| TASK-12.3 | Implementar límite de intentos, bloqueo temporal y mensajes genéricos. | BE | 4 h |
| TASK-12.4 | Implementar cierre de sesión y cambio de contraseña. | BE | 4 h |
| TASK-12.5 | Conectar las pantallas de acceso y cuenta (P-01, P-02, P-04 y P-05) al backend real. | FE | 5 h |
| TASK-12.6 | Escribir pruebas de autenticación (positivas y negativas). | BE, QA | 5 h |

**Pruebas asociadas:** CP-01, CP-02.

---

### HU-13 — Autorización por roles aplicada a los endpoints

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE · **Estado:** Por hacer

**Como** responsable de seguridad, **quiero** que cada endpoint verifique rol y titularidad **para** impedir accesos indebidos entre expedientes.

**Criterios de aceptación:**

1. Están definidos los roles: `SOLICITANTE`, `FUNCIONARIO`, `SUPERVISOR`, `AUDITOR`, `ADMIN`.
2. Cada endpoint tiene una regla de autorización documentada y aplicada en el backend (no solo en la interfaz).
3. Un solicitante solo accede a sus propios expedientes; consultar un expediente ajeno devuelve `404` o `403` sin filtrar datos (compatible con CP-03).
4. Un administrador técnico no obtiene permisos de lectura o decisión de expedientes por defecto.
5. Existen pruebas automatizadas de acceso permitido y denegado por rol y endpoint (matriz de autorización).
6. Los permisos denegados generan evento de auditoría.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-13.1 | Definir la matriz rol × endpoint × operación y documentarla. | LT, BE | 4 h |
| TASK-13.2 | Implementar el mecanismo de autorización (anotaciones/filtros) y la verificación de titularidad. | BE | 8 h |
| TASK-13.3 | Proteger todos los endpoints de la versión 1 según la matriz. | BE | 6 h |
| TASK-13.4 | Escribir la suite de pruebas de autorización (permitido/denegado por rol). | QA, BE | 8 h |
| TASK-13.5 | Ajustar el frontend para mostrar/ocultar acciones según permisos reales. | FE | 4 h |

**Pruebas asociadas:** CP-01, CP-03, CP-09, CP-12.

---

### HU-14 — Manejo de errores y respuestas HTTP coherentes

**Prioridad:** Alta · **5 PH** · **Responsable:** BE · **Estado:** Por hacer

**Como** consumidor de la API, **quiero** respuestas HTTP y mensajes de error consistentes y seguros **para** manejar fallos sin exponer información sensible.

**Criterios de aceptación:**

1. Existe un manejador global de excepciones que produce un cuerpo de error uniforme (código, mensaje seguro, trazabilidad interna).
2. Se aplican: `400` entrada inválida, `401` no autenticado, `403` sin permiso, `404` inexistente o no revelable, `409` conflicto de estado, `5xx` fallo interno.
3. Los mensajes no incluyen datos personales, pilas de trazas ni detalles de esquema.
4. Los errores de integración técnica se distinguen de los resultados de validación en el modelo y en la respuesta.
5. Cada error interno deja correlación (ID) que aparece en la respuesta y en los logs para diagnóstico.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-14.1 | Definir el estándar de cuerpo de error y documentarlo en OpenAPI. | LT | 3 h |
| TASK-14.2 | Implementar el manejador global de excepciones con mapeo de códigos. | BE | 6 h |
| TASK-14.3 | Aplicar el manejo de errores en servicios y adaptadores (timeouts, reintentos). | BE | 6 h |
| TASK-14.4 | Escribir pruebas de cada código de error y revisión de no exposición de datos. | QA | 5 h |

**Pruebas asociadas:** CP-02, CP-07, CP-11.

### Entregables del Sprint 2

* Entorno Docker reproducible con base de datos migrada.
* Modelo de datos implementado con semilla de datos de demostración.
* Autenticación y autorización reales conectadas al frontend.
* Estándar de errores API documentado y probado.

### DoD del Sprint 2

* Arranque limpio verificado desde cero con evidencia.
* Suite de autorización (permitido/denegado) en verde.
* Ningún secreto en el repositorio; contraseñas con hash.
* Contrato OpenAPI actualizado con lo implementado.

### Riesgos y bloqueos del Sprint 2

| Riesgo | Señal de alerta | Acción |
| --- | --- | --- |
| Migraciones incompletas | Errores al arrancar desde cero | Congelar esquema a mitad de semana 1 del sprint; cambios controlados |
| Decisiones de autorización ambiguas | Dudas recurrentes sobre permisos | Reunión de 1 h con PO para cerrar la matriz rol × endpoint |
| Frontend desincronizado del contrato | Errores 404/405 frecuentes | Revisar `openapi.yaml` como fuente única y regenerar clientes |

---

# Sprint 3 — Expedientes, documentos, consentimiento y derechos ARCO

**Semanas:** 5–6
**Objetivo:** conectar las pantallas de expedientes y documentos con el backend real, cerrando el flujo principal del solicitante y del funcionario, y dejar registrado el **consentimiento informado** y los **derechos ARCO** del cliente conforme a la Ley 81 de 2019 y al Decreto Ejecutivo 285 de 2021.
**Épicas:** EP-04, EP-07, EP-10.

### Resumen del sprint

| HU | Título | Prioridad | PH | Responsable |
| --- | --- | --- | --- | --- |
| HU-15 | Registro de expediente (backend + frontend) | Crítica | 8 | BE, FE |
| HU-16 | Consulta y seguimiento con filtrado por titularidad | Crítica | 5 | BE, FE |
| HU-17 | Gestión documental protegida | Crítica | 8 | BE, FE |
| HU-18 | Notificaciones del expediente | Alta | 5 | BE, FE |
| HU-18b | Consentimiento informado de tratamiento de datos | Crítica | 5 | BE, FE |
| HU-18c | Derechos ARCO desde el portal del cliente | Alta | 5 | BE, FE |

**PH total del sprint: 36** · *Margen disponible para retrasos del Sprint 1 o refactors. Las HU-18b y HU-18c se añadieron con el reencuadre RC-02 y se numeran con sufijo para no renumerar HU-01…HU-34.*

### HU-15 — Registro de expediente

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE con FE · **Estado:** Por hacer

**Como** solicitante, **quiero** registrar una solicitud migratoria que quede asociada a mi cuenta **para** iniciar el seguimiento de mi caso dentro del producto.

**Criterios de aceptación:**

1. `POST /api/expedientes` crea el expediente con identificador único, solicitante autenticado, tipo de trámite, fecha de creación y estado inicial `BORRADOR` o `PRESENTADO` según la regla acordada.
2. Los campos obligatorios y el tipo de trámite se validan en el servidor (no solo en el cliente), devolviendo `400` con detalle de campo.
3. Un usuario no puede crear expedientes a nombre de otro (compatible con CP-03).
4. El asistente P-09…P-16 con el envío P-17 consume el endpoint real y muestra éxito/error con el identificador generado.
5. Existen pruebas de creación exitosa, datos inválidos y tentativa de asociación indebida.
6. Cada creación genera evento de auditoría.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-15.1 | Implementar servicio y endpoint de creación con validaciones de dominio. | BE | 6 h |
| TASK-15.2 | Implementar la obtención del tipo de trámite y sus requisitos desde catálogos. | BE | 4 h |
| TASK-15.3 | Conectar el asistente P-09…P-16 y el envío P-17 al endpoint, incluyendo manejo de errores de validación campo a campo. | FE | 6 h |
| TASK-15.4 | Emitir evento de auditoría en la creación. | BE | 3 h |
| TASK-15.5 | Escribir pruebas de creación, validación y autorización. | BE, QA | 6 h |

**Pruebas asociadas:** CP-03, CP-05 (validación de entrada).

---

### HU-16 — Consulta y seguimiento con filtrado por titularidad

**Prioridad:** Crítica · **5 PH** · **Responsable:** BE con FE · **Estado:** Por hacer

**Como** solicitante y funcionario, **quiero** consultar mis expedientes y su detalle con los permisos que me corresponden **para** seguir el avance sin exponer información ajena.

**Criterios de aceptación:**

1. `GET /api/expedientes` devuelve solo los expedientes accesibles al usuario según rol y titularidad, con filtros por estado, tipo y fecha, y paginación.
2. `GET /api/expedientes/{id}` verifica acceso; un id ajeno responde `404`/`403` sin datos (compatible con CP-03).
3. `GET /api/expedientes/{id}/historial` exige permiso específico de lectura.
4. Las pantallas P-06, P-19, I-03/I-02 e I-06 consumen estos endpoints y mantienen los estados de carga/vacío/error.
5. El rendimiento de listado es aceptable con 1.000 expedientes de prueba (sin N+1 consultas).
6. Las consultas sensibles quedan registradas en auditoría.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-16.1 | Implementar listado con filtros, paginación y proyección mínima de datos. | BE | 6 h |
| TASK-16.2 | Implementar detalle e historial con verificación de acceso. | BE | 5 h |
| TASK-16.3 | Conectar P-06, P-19, I-03/I-02 e I-06 a los endpoints reales. | FE | 6 h |
| TASK-16.4 | Escribir pruebas de titularidad, paginación y rendimiento básico del listado. | QA, BE | 5 h |

**Pruebas asociadas:** CP-03, CP-09.

---

### HU-17 — Gestión documental protegida

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE con FE · **Estado:** Por hacer

**Como** solicitante, **quiero** adjuntar y consultar documentos con validación de tipo, tamaño y permisos **para** evitar entregas repetidas y accesos indebidos a archivos.

**Criterios de aceptación:**

1. `POST /api/expedientes/{id}/documentos` acepta archivos validando tipo MIME, tamaño máximo y firma/contenido, rechazando con mensaje seguro (compatible con CP-05).
2. Los metadatos quedan en PostgreSQL y el archivo en almacenamiento protegido; la referencia al archivo no es un enlace público.
3. La descarga exige autorización y está registrada en auditoría (compatible con CP-12).
4. Cada documento queda vinculado al expediente correcto y muestra estado de revisión.
5. El frontend P-14 (paso 6) muestra progreso, éxito y error, e impide el envío de archivos no permitidos.
6. Existen pruebas de archivo válido, tipo no permitido, tamaño excedido y descarga no autorizada.
7. La duplicación se previene: subir un documento tipo ya válido genera aviso de duplicado.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-17.1 | Definir catálogo de tipos documentales permitidos, límites y reglas por trámite. | BE, PO | 4 h |
| TASK-17.2 | Implementar carga con validación de MIME, tamaño e integridad. | BE | 8 h |
| TASK-17.3 | Implementar descarga protegida con verificación de permiso y auditoría. | BE | 5 h |
| TASK-17.4 | Conectar P-14 al backend con progreso y manejo de errores. | FE | 6 h |
| TASK-17.5 | Escribir pruebas de carga, rechazo, descarga y permisos. | QA, BE | 6 h |

**Pruebas asociadas:** CP-05, CP-12.

---

### HU-18 — Notificaciones del expediente

**Prioridad:** Alta · **5 PH** · **Responsable:** BE con FE · **Estado:** Por hacer

**Como** solicitante, **quiero** recibir avisos sobre cambios relevantes de mi expediente **para** actuar a tiempo cuando algo depende de mí.

**Criterios de aceptación:**

1. El servicio de notificaciones es desacoplado: se emite desde los servicios de negocio sin acoplar la lógica.
2. Se generan notificaciones como mínimo ante: cambio a `PENDIENTE DE DOCUMENTOS`, observación del funcionario, resultado de verificación y decisión final.
3. El mensaje no contiene datos confidenciales ni información personal innecesaria.
4. P-20 lista las observaciones y notificaciones del usuario con fecha, tipo y estado de lectura.
5. Marcar como leída actualiza el estado y no duplica eventos.
6. Existen pruebas de generación, contenido seguro y marcado de lectura.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-18.1 | Implementar entidad, endpoint y evento de notificaciones. | BE | 6 h |
| TASK-18.2 | Definir plantillas de mensajes por tipo de evento sin datos sensibles. | PO, BE | 4 h |
| TASK-18.3 | Conectar P-20 al backend con marcado de leídas. | FE | 4 h |
| TASK-18.4 | Escribir pruebas de generación y de contenido seguro. | QA | 4 h |

**Pruebas asociadas:** CP-09 (visibilidad), verificación de no exposición de datos.

---

### HU-18b — Consentimiento informado de tratamiento de datos

**Prioridad:** Crítica · **5 PH** · **Responsable:** BE con FE · **Estado:** Por hacer

**Como** bufete de abogados (responsable del tratamiento), **quiero** registrar el consentimiento informado del cliente antes de tratar sus datos **para** cumplir con la Ley 81 de 2019 y el Decreto Ejecutivo 285 de 2021 y poder acreditarlo ante una revisión.

**Nota de alcance (RC-02):** las pantallas nuevas se habilitan **dentro del inventario de 45 pantallas** (sección de consentimiento en P-05 *Mi perfil* y bloque de consentimiento en el módulo interno), sin añadir IDs al inventario.

**Criterios de aceptación:**

1. `POST /api/consentimientos` registra el consentimiento con: titular, responsable (despacho), finalidad, alcance de los datos, base legal, fecha, vigencia y estado (`VIGENTE` o `REVOCADO`).
2. Sin un consentimiento vigente, el sistema **limita el tratamiento de los datos del cliente a lo estrictamente contractual** (minimización y finalidad): no se usan para otras finalidades ni se comparten.
3. Los **datos sensibles exigen consentimiento expreso** y quedan marcados como tales; sin él, no se tratan y la operación se rechaza con mensaje claro.
4. El cliente puede **ver y revocar su consentimiento desde el portal** (P-05): la revocación deja el consentimiento en `REVOCADO`, conserva la evidencia histórica y notifica al despacho.
5. El módulo interno muestra el estado del consentimiento por cliente y por expediente antes de tratar datos o adjuntar documentos sensibles.
6. Todo alta, consulta y revocación genera **evento de auditoría** con actor, fecha, finalidad, alcance y resultado.
7. Existen pruebas de: alta correcta, tratamiento sin consentimiento vigente (limitado), datos sensibles sin consentimiento expreso (bloqueado), revocación y auditoría.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-18b.1 | Implementar la entidad de consentimiento (titular, responsable, finalidad, alcance, base legal, fecha, vigencia, estado) y su endpoint con validaciones. | BE | 5 h |
| TASK-18b.2 | Implementar la regla de limitación del tratamiento sin consentimiento vigente y la exigencia de consentimiento expreso para datos sensibles. | BE | 5 h |
| TASK-18b.3 | Construir en el portal del cliente (P-05) la consulta y la revocación del consentimiento, con confirmación de la acción sensible. | FE | 4 h |
| TASK-18b.4 | Construir el bloque de consentimiento en el módulo interno (recepción y analista) con estado por cliente y expediente. | FE | 3 h |
| TASK-18b.5 | Escribir pruebas de alta, revocación, limitación del tratamiento y auditoría. | QA, BE | 4 h |

**Pruebas asociadas:** CP-09 (trazabilidad), CP-11 (no exposición de datos), verificación de limitación del tratamiento.

---

### HU-18c — Derechos ARCO desde el portal del cliente

**Prioridad:** Alta · **5 PH** · **Responsable:** BE con FE · **Estado:** Por hacer

**Como** cliente del despacho, **quiero** ejercer mis derechos de **acceso, rectificación, cancelación y oposición (ARCO)** desde el portal **para** controlar mis datos personales conforme a la Ley 81 de 2019.

**Criterios de aceptación:**

1. El portal permite crear una solicitud ARCO con tipo (`ACCESO`, `RECTIFICACIÓN`, `CANCELACIÓN`, `OPPOSICIÓN`), descripción/motivo, fecha de creación y estado inicial `RECIBIDA`.
2. La solicitud queda **registrada con tipo, fecha y estado**, y el cliente solo puede consultar las suyas (titularidad, compatible con CP-03), con historial de estados `RECIBIDA → EN_ATENCION → ATENDIDA` o `RECHAZADA` (con motivo).
3. El despacho **recibe la solicitud en el módulo interno** (bandeja de atención), con responsable y **plazo de atención**; el vencimiento se marca con la alerta `FUERA_DE_PLAZO` sobre la solicitud, sin alterar su estado de atención.
4. Las notificaciones asociadas **no exponen datos personales del contenido**: solo identificador de la solicitud, tipo, estado y fecha.
5. Toda solicitud y cada cambio de estado generan **evento de auditoría** (actor, fecha, tipo, estado, resultado).
6. Existen pruebas de registro, consulta por titularidad, cambio de estado, control de plazo y no exposición de datos en notificaciones.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-18c.1 | Implementar la entidad de solicitud ARCO (tipo, fecha, estado, plazo, responsable) y sus endpoints con permisos por titularidad. | BE | 5 h |
| TASK-18c.2 | Construir en el portal del cliente la pantalla de creación y seguimiento de la solicitud ARCO. | FE | 4 h |
| TASK-18c.3 | Construir la bandeja del despacho (recepción/analista) con asignación, plazos y alerta de vencimiento. | FE | 4 h |
| TASK-18c.4 | Definir plantillas de notificación sin datos personales y registrar la auditoría de cada evento. | PO, BE | 3 h |
| TASK-18c.5 | Escribir pruebas de registro, titularidad, plazos, auditoría y no exposición de datos. | QA, BE | 4 h |

**Pruebas asociadas:** CP-03 (titularidad), CP-09 (visibilidad), CP-11 (no exposición de datos).

### Entregables del Sprint 3

* Flujo completo del solicitante: crear → documentar → consultar.
* Bandeja del funcionario conectada a datos reales.
* Almacenamiento documental protegido con descarga autorizada.
* Notificaciones operativas.
* Consentimiento informado registrado, visible y revocable (HU-18b) y derechos ARCO atendidos con plazos (HU-18c).

### DoD del Sprint 3

* Endpoints documentados en OpenAPI y probados.
* Suite de permisos en verde (accesos permitidos y denegados).
* Ningún archivo accesible sin autorización.
* Auditoría de creación, consulta y descarga verificada.
* Consentimiento informado y solicitudes ARCO registrados, auditados y sin exposición de datos en notificaciones.

### Riesgos y bloqueos del Sprint 3

| Riesgo | Señal de alerta | Acción |
| --- | --- | --- |
| Almacenamiento de archivos mal definido | Dudas sobre dónde guardar binarios | Decidir en la semana 1 (volumen local vs. interfaz de objeto) y documentar |
| Reglas de tipos documentales incompletas | Rechazos incorrectos de archivos | Cerrar catálogo con el PO antes de programar validaciones |

---

# Sprint 4 — Flujo de estados, revisión y auditoría

**Semanas:** 7–8
**Objetivo:** garantizar que cada expediente avance solo mediante transiciones válidas y que toda operación crítica quede registrada y sea consultable.
**Épicas:** EP-05, EP-07.

### Resumen del sprint

| HU | Título | Prioridad | PH | Responsable |
| --- | --- | --- | --- | --- |
| HU-19 | Máquina de estados y endpoint de transición | Crítica | 8 | BE |
| HU-20 | Observaciones y solicitudes de corrección | Alta | 5 | BE, FE |
| HU-21 | Historial de estados visible | Crítica | 5 | BE, FE |
| HU-22 | Auditoría de operaciones (registro, protección y consulta) | Crítica | 8 | BE, FE |

**PH total del sprint: 26**

### HU-19 — Máquina de estados y endpoint de transición

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE · **Estado:** Por hacer

**Como** funcionario autorizado, **quiero** cambiar el estado de un expediente según las reglas del trámite **para** mantener un proceso consistente y verificable.

**Criterios de aceptación:**

1. `PATCH /api/expedientes/{id}/estado` aplica la matriz de transiciones permitidas por tipo de trámite.
2. Las transiciones se validan en el backend; una transición no permitida responde `409` o `403` y conserva el estado original (compatible con CP-04).
3. No se permite llegar a estados finales (`APROBADO`/`DENEGADO`) sin que se cumplan los controles previos: verificaciones respondidas y requisitos obligatorios completos.
4. Todo cambio registra estado anterior, nuevo, autor, fecha y motivo en el historial.
5. Las transiciones concurrentes sobre el mismo expediente no producen pérdida de actualización (control de versión optimista o bloqueo).
6. Los estados implementados incluyen como mínimo: `BORRADOR`, `PRESENTADO`, `EN_REVISION`, `PENDIENTE_DOCUMENTOS`, `EN_VALIDACION`, `LISTO_DECISION`, `APROBADO`, `DENEGADO`, más los complementarios (`OBSERVADO`, `CANCELADO`, `CERRADO`) si el PO los habilita.
7. Existen pruebas de transiciones válidas, inválidas, concurrentes y de bloqueo por requisitos faltantes.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-19.1 | Definir con el PO la matriz de transiciones por tipo de trámite. | PO, LT | 4 h |
| TASK-19.2 | Implementar el servicio de dominio de transiciones con validación de prerrequisitos. | BE | 8 h |
| TASK-19.3 | Implementar el endpoint con control de concurrencia y motivo obligatorio. | BE | 5 h |
| TASK-19.4 | Conectar I-10 (y I-04) al backend con transiciones dinámicas y confirmaciones. | FE | 5 h |
| TASK-19.5 | Escribir pruebas de transiciones válidas, inválidas, concurrentes y de bloqueo. | QA, BE | 8 h |

**Pruebas asociadas:** CP-04, CP-09.

---

### HU-20 — Observaciones y solicitudes de corrección

**Prioridad:** Alta · **5 PH** · **Responsable:** BE con FE · **Estado:** Por hacer

**Como** funcionario, **quiero** registrar observaciones para indicar al solicitante qué debe corregir **para** reducir idas y vueltas.

**Criterios de aceptación:**

1. Las observaciones se vinculan al expediente, registran autor, fecha y texto obligatorio.
2. Un funcionario solo registra observaciones en expedientes de su ámbito.
3. El solicitante consulta únicamente las observaciones de sus expedientes.
4. Una observación no equivale a decisión final ni cambia de estado automáticamente.
5. I-08 y P-20 muestran el hilo de observaciones y la respuesta del solicitante.
6. Cada registro genera evento de auditoría.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-20.1 | Implementar entidad, endpoints y permisos de observaciones. | BE | 6 h |
| TASK-20.2 | Conectar I-08 y el bloque de observaciones de P-20. | FE | 5 h |
| TASK-20.3 | Escribir pruebas de permisos y registro con auditoría. | QA | 4 h |

**Pruebas asociadas:** CP-09, CP-04.

---

### HU-21 — Historial de estados visible

**Prioridad:** Crítica · **5 PH** · **Responsable:** BE con FE · **Estado:** Por hacer

**Como** solicitante y funcionario, **quiero** ver la trazabilidad de cambios del expediente **para** entender quién hizo qué y cuándo.

**Criterios de aceptación:**

1. `GET /api/expedientes/{id}/historial` devuelve los eventos en orden con autor, fecha, estado anterior/nuevo y motivo.
2. El acceso exige permiso específico; los eventos no autorizados no se filtran ni se revelan (compatible con CP-09).
3. P-19 y I-06 muestran la línea de tiempo con formato claro.
4. El historial no expone datos sensibles innecesarios (por ejemplo, no muestra documentos completos ni notas internas restringidas).
5. Pruebas de lectura autorizada y denegada en verde.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-21.1 | Implementar el endpoint de historial con proyección por rol. | BE | 5 h |
| TASK-21.2 | Construir el componente de línea de tiempo y conectarlo a P-19/I-06. | FE | 5 h |
| TASK-21.3 | Escribir pruebas de autorización del historial. | QA | 3 h |

**Pruebas asociadas:** CP-09.

---

### HU-22 — Auditoría de operaciones

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE con FE · **Estado:** Por hacer

**Como** auditor autorizado, **quiero** consultar los eventos críticos del sistema **para** verificar quién realizó cada operación y cuándo.

**Criterios de aceptación:**

1. Quedan registrados como mínimo: inicio y cierre de sesión, creación y cambio de estado de expedientes, carga y descarga de documentos, registro y consulta de verificaciones (manual asistido o simuladas), eventos de consentimiento y solicitudes ARCO, y operaciones administrativas.
2. Cada evento contiene actor, operación, recurso, fecha, resultado y datos técnicos de correlación.
3. Los registros están protegidos: solo el rol auditor los consulta y no pueden modificarse desde la API.
4. Los logs no contienen contraseñas, tokens ni datos personales innecesarios (compatible con CP-11).
5. I-16 permite filtrar por fecha, actor, operación y recurso con paginación y exportación CSV.
6. Existe prueba de integridad: las operaciones críticas esperadas aparecen registradas (meta: 100 %).

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-22.1 | Diseñar el modelo de eventos de auditoría y su política de retención. | LT, BE | 4 h |
| TASK-22.2 | Instrumentar los servicios críticos con registro de eventos (sin bloquear la operación principal). | BE | 8 h |
| TASK-22.3 | Implementar el endpoint de consulta con filtros, paginación y exportación, protegido por rol. | BE | 6 h |
| TASK-22.4 | Conectar I-16 y verificar la exportación CSV. | FE | 4 h |
| TASK-22.5 | Escribir pruebas de cobertura de eventos críticos y de no exposición de datos en logs. | QA, BE | 6 h |

**Pruebas asociadas:** CP-09, CP-11, indicador de trazabilidad (100 %).

### Entregables del Sprint 4

* Máquina de estados operativa con transiciones controladas.
* Observaciones e historial visibles para los roles correctos.
* Auditoría consultable con cobertura de operaciones críticas.

### DoD del Sprint 4

* Ninguna transición no permitida es posible vía API.
* Cobertura del 100 % de eventos críticos definidos en pruebas.
* Logs auditados: sin secretos ni datos sensibles.
* Suite de autorización de historial y auditoría en verde.

### Riesgos y bloqueos del Sprint 4

| Riesgo | Señal de alerta | Acción |
| --- | --- | --- |
| Matriz de transiciones discutida a mitad de sprint | Rechazos y rechazos de reglas | Cerrar matriz con PO en la semana 1 (TASK-19.1) antes de codificar |
| Auditoría demasiado verbosa | Logs gigantes o latencia | Definir política de eventos y retención; escribir en segundo plano |

---

# Sprint 5 — Verificación documental: modo manual asistido, adaptadores y trazabilidad

**Semanas:** 9–10
**Objetivo:** demostrar la verificación documental controlada del expediente en **modo manual asistido** (con responsable humano que registra fuente, fecha y resultado) y en modo simulado con las fuentes del Sprint 1: adaptadores, orquestación de verificaciones, manejo de errores y trazabilidad. La capa de adaptadores queda **preparada** para una futura automatización sujeta a convenio, sin rehacer el sistema.
**Épicas:** EP-06, EP-07.

### Resumen del sprint

| HU | Título | Prioridad | PH | Responsable |
| --- | --- | --- | --- | --- |
| HU-23 | Adaptadores de fuentes de verificación (TE, CSS, Registro Público) | Crítica | 8 | BE |
| HU-24 | Orquestación de verificaciones con reintentos e idempotencia | Crítica | 8 | BE |
| HU-25 | Minimización y trazabilidad de verificaciones | Crítica | 5 | BE, LT |
| HU-26 | Panel de verificaciones conectado en el flujo real | Crítica | 8 | FE, BE |

**PH total del sprint: 29**

### HU-23 — Adaptadores de fuentes de verificación

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE · **Estado:** Por hacer

**Como** sistema, **quiero** acceder a las fuentes de verificación mediante adaptadores independientes **para** poder sustituir una fuente simulada por una futura integración autorizada y convenida (p. ej. vía AIG) sin tocar la lógica del expediente, y para registrar hoy las verificaciones en modo manual asistido.

**Criterios de aceptación:**

1. Existe una interfaz (puerto) por fuente de verificación: `TePort`, `CssPort`, `RegistroPublicoPort`, con implementación sobre los mocks del Sprint 1 **y** una implementación de registro manual asistido (responsable humano).
2. Cada adaptador traduce la respuesta o el registro manual a un formato normalizado compartido (fuente, resultado, referencia, fecha, responsable, estado técnico).
3. La lógica de negocio del expediente no importa clases de los mocks ni conoce rutas concretas (desacoplamiento verificable en el código).
4. Cada adaptador tiene configuración de timeout y reintentos por fuente, que solo aplica al modo simulado.
5. Existen pruebas de contrato por adaptador: respuesta válida, sin resultado, error técnico y timeout (compatible con CP-06 y CP-07), más una prueba del registro manual asistido.
6. Está documentado cómo sustituir el modo simulado por una futura integración automática autorizada y convenida (requisitos, configuración y contratos), dejando constancia de que hoy no existe convenio ni API disponible.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-23.1 | Definir la interfaz común de adaptador y el DTO de respuesta normalizada. | LT | 4 h |
| TASK-23.2 | Implementar el adaptador del TE sobre su mock, con timeout y traducción. | BE | 6 h |
| TASK-23.3 | Implementar el adaptador de la CSS sobre su mock. | BE | 5 h |
| TASK-23.4 | Implementar el adaptador del Registro Público sobre su mock. | BE | 5 h |
| TASK-23.5 | Escribir pruebas de contrato por adaptador (4 escenarios c/u) y del registro manual asistido. | QA, BE | 6 h |
| TASK-23.6 | Documentar el procedimiento de sustitución por una futura integración automática sujeta a convenio. | DOC, LT | 3 h |

**Pruebas asociadas:** CP-06, CP-07.

---

### HU-24 — Orquestación de verificaciones con reintentos e idempotencia

**Prioridad:** Crítica · **8 PH** · **Responsable:** BE · **Estado:** Por hacer

**Como** analista del despacho, **quiero** que el sistema determine qué verificaciones documentales aplican y gestione su registro y sus fallos sin duplicar operaciones **para** confiar en los resultados y no repetir trabajo.

**Criterios de aceptación:**

1. El backend determina qué verificaciones aplican según el tipo de trámite y las crea como entidades con estados propios: `PENDIENTE`, `EN_ATENCION` (manual asistido), `ENVIADA` (modo simulado), `RESPONDIDA`, `SIN_RESULTADO`, `ERROR_TECNICO`, `REINTENTO_PROGRAMADO`.
2. Cada verificación puede crearse en **modo manual asistido** (con **responsable humano** que registra fuente, fecha y resultado) o en **modo simulado** (fuentes simuladas del Sprint 1); el modo queda registrado en la entidad.
3. Los estados de la verificación son independientes del estado del expediente.
4. Un error técnico jamás se convierte en resultado negativo ni dispara aprobación/denegación (compatible con CP-07).
5. Los reintentos son limitados, programados y usan idempotencia: una petición repetida no crea operaciones duplicadas (compatible con CP-08); el reintento solo aplica al modo simulado.
6. Cada verificación guarda fuente, finalidad, fecha, responsable, referencia de correlación, estado técnico y resultado mínimo.
7. Existen pruebas de indisponibilidad, timeout, respuesta inválida, idempotencia y registro manual asistido con responsable.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-24.1 | Implementar entidad y estados de verificación con transiciones propias y registro del modo (manual asistido o simulado). | BE | 6 h |
| TASK-24.2 | Implementar el orquestador: determina las verificaciones necesarias y las crea en modo manual asistido (con responsable humano) o simulado. | BE | 8 h |
| TASK-24.3 | Implementar timeout, reintentos limitados con backoff y claves de idempotencia (modo simulado). | BE | 8 h |
| TASK-24.4 | Escribir pruebas de caída de la fuente simulada, timeout, duplicación, recuperación y registro manual. | QA, BE | 6 h |

**Pruebas asociadas:** CP-06, CP-07, CP-08.

---

### HU-25 — Minimización y trazabilidad de verificaciones

**Prioridad:** Crítica · **5 PH** · **Responsable:** BE con LT · **Estado:** Por hacer

**Como** responsable de protección de datos del despacho, **quiero** limitar los datos que se envían o se registran y dejar la finalidad de cada verificación **para** reducir la exposición de información personal (Ley 81 de 2019 y Decreto 285 de 2021).

**Criterios de aceptación:**

1. Existe una **matriz de fuentes y finalidad** (fuente → finalidad → base legal → responsable → qué se guarda) derivada del marco legal del Sprint 1 (HU-06).
2. Antes de emitir o registrar una verificación se valida permiso y finalidad; sin ellos, la verificación no se realiza.
3. Las solicitudes o registros contienen únicamente los campos autorizados en la matriz.
4. Las respuestas se guardan con el **resultado mínimo** (fuente, fecha, resultado, responsable); **no se almacenan copias de la información institucional ni bloques completos de datos personales**.
5. Los registros de integración y los logs no incluyen datos personales innecesarios.
6. Pruebas que verifican el contenido efectivo de la petición o del registro manual y la trazabilidad completa de la verificación.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-25.1 | Formalizar la matriz de fuentes y finalidad (fuente → finalidad → base legal → responsable → qué se guarda). | LT, PO | 4 h |
| TASK-25.2 | Implementar la validación de permiso y finalidad previa a emitir o registrar la verificación. | BE | 5 h |
| TASK-25.3 | Aplicar minimización en el armado de peticiones y en el almacenamiento de resultados (sin copias institucionales). | BE | 5 h |
| TASK-25.4 | Verificar con pruebas la trazabilidad y el contenido mínimo de logs. | QA | 4 h |

**Pruebas asociadas:** CP-11, indicador de trazabilidad.

---

### HU-26 — Panel de verificaciones conectado en el flujo real

**Prioridad:** Crítica · **8 PH** · **Responsable:** FE con BE · **Estado:** Por hacer

**Como** analista del despacho y cliente, **quiero** ver el estado real de las verificaciones en el expediente **para** saber qué falta y cuándo se puede decidir.

**Criterios de aceptación:**

1. `POST` y `GET /api/expedientes/{id}/validaciones` quedan conectados a I-07 y al bloque correspondiente de P-19.
2. La UI muestra cada verificación con su fuente, modo (manual asistido o simulado), fecha, responsable, estado técnico y resultado cuando exista.
3. El error técnico se distingue visualmente del resultado negativo (color, icono y texto explicativo) — compatible con CP-07.
4. La acción de reintento aparece solo en estados permitidos y muestra el resultado del reintento (compatible con CP-08).
5. El cliente ve el estado agregado sin exponer detalles internos innecesarios.
6. Recorrido completo de demostración: expediente → verificaciones (manual asistido y simuladas) → decisión del responsable.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-26.1 | Conectar I-07 a los endpoints de verificaciones (`/api/expedientes/{id}/validaciones`) con recarga y refresco. | FE | 6 h |
| TASK-26.2 | Implementar la distinción error técnico vs. resultado negativo y el botón de reintento. | FE | 5 h |
| TASK-26.3 | Mostrar el bloque de verificaciones en P-19 con nivel de detalle por rol. | FE | 5 h |
| TASK-26.4 | Ejecutar el recorrido completo con escenarios forzados (`X-Scenario`) y con registro manual, y corregir incidencias. | FE, QA | 6 h |

**Pruebas asociadas:** CP-06, CP-07, CP-08.

### Entregables del Sprint 5

* Adaptadores de fuentes de verificación desacoplados y probados por contrato (modo manual asistido y modo simulado).
* Orquestación de verificaciones con reintentos e idempotencia, con responsable humano en el modo manual.
* Trazabilidad y minimización verificadas (matriz de fuentes y finalidad, solo resultado mínimo).
* Panel de verificaciones operativo en el flujo real.

### DoD del Sprint 5

* Los tres adaptadores responden según contrato con los 6 escenarios, y el registro manual asistido produce la misma entidad de verificación.
* Ningún error técnico se interpreta como resultado negativo en pruebas.
* Idempotencia verificada (CP-08 en verde).
* Matriz de fuentes y finalidad aplicada y auditada; sin copias institucionales almacenadas.

### Riesgos y bloqueos del Sprint 5

| Riesgo | Señal de alerta | Acción |
| --- | --- | --- |
| Reintentos mal configurados | Bucles o duplicados en pruebas | Definir política (intentos, backoff, tope) antes de implementar |
| Contrato de mocks cambiado desde el Sprint 1 | Fallos de contrato | Regenerar pruebas de contrato al inicio del sprint |

---

# Sprint 6 — Seguridad, rendimiento y usabilidad

**Semanas:** 11–12
**Objetivo:** verificar la calidad del producto completo, detectar y corregir vulnerabilidades, cuellos de botella y problemas de uso antes de la aceptación.
**Épica:** EP-08.

### Resumen del sprint

| HU | Título | Prioridad | PH | Responsable |
| --- | --- | --- | --- | --- |
| HU-27 | Pruebas automatizadas (unitarias, API, integración) | Crítica | 8 | QA, BE |
| HU-28 | Validación de seguridad con OWASP ZAP y correcciones | Crítica | 8 | QA, BE |
| HU-29 | Pruebas de rendimiento con JMeter y optimizaciones | Alta | 8 | QA, BE |
| HU-30 | Evaluación de usabilidad y mejoras de interfaz | Alta | 6 | FE, QA |

**PH total del sprint: 30**

### HU-27 — Pruebas automatizadas

**Prioridad:** Crítica · **8 PH** · **Responsable:** QA con BE · **Estado:** Por hacer

**Como** equipo, **quiero** contar con una suite automatizada ejecutable en un comando **para** detectar regresiones antes de cada entrega.

**Criterios de aceptación:**

1. Existen pruebas unitarias (JUnit/Mockito) de reglas de negocio, transiciones y verificaciones, con los casos críticos cubiertos.
2. Existen pruebas de API que verifican contratos, códigos de estado y errores de la sección 3.6.
3. Existen pruebas de integración con base de datos y mocks en contenedor (Docker).
4. La suite completa se ejecuta con un comando documentado y termina en menos de 10 minutos.
5. La cobertura de los módulos críticos (estados, autorización, verificaciones) es al menos del 70 %, medida y reportada.
6. Las pruebas no dependen de datos externos ni de la red pública.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-27.1 | Completar pruebas unitarias de dominio (estados, verificaciones, permisos). | BE | 8 h |
| TASK-27.2 | Completar pruebas de API de todos los endpoints con sus códigos esperados. | QA, BE | 8 h |
| TASK-27.3 | Completar pruebas de integración con contenedores (DB + mocks). | QA | 8 h |
| TASK-27.4 | Integrar la ejecución de la suite en CI (Git) con reporte de cobertura. | LT | 5 h |

**Pruebas asociadas:** CP-01…CP-09, CP-12.

---

### HU-28 — Validación de seguridad con OWASP ZAP

**Prioridad:** Crítica · **8 PH** · **Responsable:** QA con BE · **Estado:** Por hacer

**Como** responsable de seguridad, **quiero** analizar la aplicación y corregir hallazgos **para** entregar sin vulnerabilidades críticas o altas.

**Criterios de aceptación:**

1. Se ejecuta un escaneo activo y pasivo de OWASP ZAP sobre el entorno de pruebas con la sesión autenticada por rol.
2. Se revisan cabeceras de seguridad, control de acceso, validación de entradas, manejo de errores, sesiones y endpoints REST.
3. Cada hallazgo tiene ID, severidad, responsable, estado y fecha de corrección.
4. Se corrigen todas las vulnerabilidades críticas y altas, y se repite el escaneo tras las correcciones (compatible con CP-11).
5. Se verifica que las respuestas, errores y logs no expongan datos personales.
6. Se emite un informe de seguridad con riesgos residuales y recomendaciones.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-28.1 | Preparar el entorno de análisis (datos, sesiones por rol, blacklist de acciones destructivas). | QA | 4 h |
| TASK-28.2 | Ejecutar escaneo automatizado con **OWASP ZAP** (herramienta obligatoria) y pruebas manuales (IDOR, BOLA, inyección, XSS, CSRF). | QA | 8 h |
| TASK-28.3 | Documentar y priorizar hallazgos en el registro de incidencias. | QA | 4 h |
| TASK-28.4 | Corregir hallazgos críticos/altos en backend y frontend. | BE, FE | 12 h |
| TASK-28.5 | Repetir escaneo, verificar y emitir el informe final. | QA | 4 h |

**Pruebas asociadas:** CP-11, CP-03, CP-12.

---

### HU-29 — Pruebas de rendimiento con JMeter

**Prioridad:** Alta · **8 PH** · **Responsable:** QA con BE · **Estado:** Por hacer

**Como** responsable de QA, **quiero** medir el comportamiento bajo carga **para** detectar cuellos de botella antes de la entrega.

**Criterios de aceptación:**

1. Existe un escenario de carga documentado: equipo, usuarios concurrentes, duración, datos y operaciones.
2. Se registran como mínimo: tiempo medio, P95, solicitudes/segundo, % de errores HTTP, CPU/memoria y latencia de los mocks.
3. El P95 de las operaciones principales se compara con el umbral acordado (referencia: ≤ 2 s bajo carga de referencia).
4. Se prueba la indisponibilidad de una dependencia y se verifica que el sistema la maneje sin caída.
5. Las incidencias de rendimiento tienen plan de corrección con responsable.
6. Se emite un informe con métricas, conclusiones y umbrales confirmados.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-29.1 | Definir y documentar escenarios y perfiles de carga. | QA, PO | 4 h |
| TASK-29.2 | Preparar scripts y datos de **Apache JMeter** (herramienta obligatoria): login, listado, creación, documentos, verificaciones. | QA | 8 h |
| TASK-29.3 | Ejecutar las pruebas de carga con **Apache JMeter** y recopilar métricas en el entorno de pruebas. | QA | 6 h |
| TASK-29.4 | Analizar cuellos de botella y corregir los prioritarios (índices, consultas, caché). | BE | 10 h |
| TASK-29.5 | Repetir la medición y emitir el informe de rendimiento. | QA | 4 h |

**Pruebas asociadas:** CP-10.

---

### HU-30 — Evaluación de usabilidad y mejoras de interfaz

**Prioridad:** Alta · **6 PH** · **Responsable:** FE con QA · **Estado:** Por hacer

**Como** usuario, **quiero** completar las tareas principales sin ayuda **para** que el producto sea comprensible y eficiente.

**Criterios de accesibilidad y uso:**

1. Existen tareas de evaluación definidas con el PO: crear expediente, adjuntar documento, consultar estado, revisar y decidir.
2. Se realizan sesiones con usuarios de prueba (mínimo 5) registrando tiempo, errores y dificultades.
3. Meta: al menos el 90 % de las tareas críticas se completan sin asistencia en el escenario evaluado.
4. Los formularios explican campos obligatorios y errores con mensajes claros.
5. Se corrigen los problemas prioritarios identificados y se repiten las tareas críticas.
6. Se verifica uso en escritorio y tablet, y coherencia de mensajes entre pantallas.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-30.1 | Definir guion y tareas de evaluación con criterios de éxito. | PO, QA | 3 h |
| TASK-30.2 | Ejecutar sesiones con usuarios de prueba y registrar métricas. | QA | 8 h |
| TASK-30.3 | Clasificar dificultades y priorizar correcciones con el PO. | PO, FE | 4 h |
| TASK-30.4 | Corregir pantallas prioritarias y repetir las tareas críticas. | FE | 8 h |
| TASK-30.5 | Documentar el informe de usabilidad con evidencias. | DOC, QA | 3 h |

**Pruebas asociadas:** indicador de usabilidad del Documento 2.

### Entregables del Sprint 6

* Suite automatizada ejecutable en CI con cobertura.
* Informe de seguridad sin vulnerabilidades críticas/altas abiertas.
* Informe de rendimiento con métricas frente a umbrales.
* Informe de usabilidad con mejoras aplicadas.

### DoD del Sprint 6

* Pruebas críticas en verde en CI.
* CP-10, CP-11 y CP-12 verificadas con evidencia.
* Ninguna vulnerabilidad crítica o alta pendiente.
* Incidencias de rendimiento corregidas o documentadas con plan.

### Riesgos y bloqueos del Sprint 6

| Riesgo | Señal de alerta | Acción |
| --- | --- | --- |
| Hallazgos de seguridad de severidad alta cerca del cierre | Escaneo inicial muy negativo | Dedicar la semana 1 solo a detección; corrección en la 2 |
| Sin usuarios de prueba disponibles | Sesiones no agendadas | Agendar en el Sprint 5; alternativa: equipo externo al proyecto |

---

# Sprint 7 — Aceptación, documentación y entrega

**Semanas:** 13–14
**Objetivo:** cerrar el alcance acordado, validar cada historia, dejar documentación reproducible y presentar el producto.
**Épicas:** EP-08, EP-09.

### Resumen del sprint

| HU | Título | Prioridad | PH | Responsable |
| --- | --- | --- | --- | --- |
| HU-31 | Pruebas de aceptación y regresión | Crítica | 8 | PO, QA |
| HU-32 | Documentación técnica y de usuario | Alta | 5 | DOC, LT |
| HU-33 | Instalación limpia y empaquetado de la entrega | Crítica | 5 | LT, BE |
| HU-34 | Demostración y evaluación final | Alta | 6 | PO, equipo |

**PH total del sprint: 24** · *Deja margen para correcciones de hallazgos de aceptación.*

### HU-31 — Pruebas de aceptación y regresión

**Prioridad:** Crítica · **8 PH** · **Responsable:** PO con QA · **Estado:** Por hacer

**Como** Product Owner, **quiero** verificar cada historia y las funciones críticas **para** aceptar una versión que cumpla el alcance acordado.

**Criterios de aceptación:**

1. Existe la lista de historias del proyecto con su estado y su criterio de aceptación asociado.
2. Se ejecutan los escenarios de aceptación acordados con el PO para cada historia cerrada.
3. Todas las pruebas críticas del plan de pruebas (CP-01…CP-12) pasan con evidencia.
4. Se ejecuta una regresión completa tras las últimas correcciones.
5. Las limitaciones y errores conocidos quedan documentados con severidad y justificación.
6. El PO registra la aceptación o el bloqueo de cada historia, y la aceptación final queda documentada.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-31.1 | Consolidar la lista de casos de aceptación por historia. | PO, QA | 4 h |
| TASK-31.2 | Ejecutar las pruebas de aceptación de extremo a extremo con evidencia. | QA | 10 h |
| TASK-31.3 | Ejecutar la regresión completa y verificar las correcciones. | QA | 6 h |
| TASK-31.4 | Registrar aceptaciones, bloqueos y errores conocidos. | PO | 4 h |

**Pruebas asociadas:** CP-01…CP-12 (regresión integral).

---

### HU-32 — Documentación técnica y de usuario

**Prioridad:** Alta · **5 PH** · **Responsable:** DOC con LT · **Estado:** Por hacer

**Como** integrante del equipo, **quiero** documentación clara para instalar, ejecutar, probar y comprender el sistema **para** que la entrega sea sostenible y auditable.

**Criterios de aceptación:**

1. Guía de instalación y ejecución paso a paso verificada en una máquina nueva.
2. API documentada en OpenAPI actualizada al estado final del código.
3. Documentación de roles, estados, módulos, reglas de negocio y limitaciones del producto.
4. Diagramas actualizados: arquitectura lógica, modelo de datos, flujo de verificación documental.
5. Manuales: técnico (para mantenimiento) y de usuario (por rol) con capturas.
6. Resultados de pruebas: informes de seguridad, rendimiento y usabilidad consolidados.
7. Registro de decisiones técnicas y del marco legal y la matriz de fuentes de verificación.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-32.1 | Redactar el manual técnico (arquitectura, entorno, base de datos, despliegue). | DOC, LT | 8 h |
| TASK-32.2 | Redactar el manual de usuario por rol con capturas actualizadas. | DOC, FE | 8 h |
| TASK-32.3 | Actualizar `openapi.yaml`, diagramas y modelo de datos al estado final. | BE, LT | 5 h |
| TASK-32.4 | Consolidar informes de pruebas, marco legal y matriz de fuentes de verificación, y registro de decisiones. | DOC, QA | 5 h |

**Pruebas asociadas:** verificación de documentación (revisión del PO).

---

### HU-33 — Instalación limpia y empaquetado de la entrega

**Prioridad:** Crítica · **5 PH** · **Responsable:** LT con BE · **Estado:** Por hacer

**Como** evaluador, **quiero** instalar el proyecto desde cero siguiendo la documentación **para** comprobar que la entrega es reproducible.

**Criterios de aceptación:**

1. `git clone` + `docker compose up` levanta el sistema completo en una máquina limpia siguiendo solo el `README`.
2. Los datos semilla cargan correctamente y permiten entrar con los usuarios de demostración de cada rol.
3. No hay secretos, rutas absolutas ni dependencias locales no documentadas.
4. El recorrido principal de demostración funciona en la instalación limpia.
5. Se genera una etiqueta (tag) de versión en Git con el estado de la entrega.
6. Se documentan los pasos de verificación de la instalación limpia como evidencia.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-33.1 | Realizar instalación limpia en máquina nueva y registrar incidencias. | QA | 4 h |
| TASK-33.2 | Corregir hallazgos de empaquetado (configuración, rutas, semillas). | BE, FE | 6 h |
| TASK-33.3 | Etiquetar la versión final y preparar el paquete de entrega (código + docs). | LT | 3 h |
| TASK-33.4 | Verificar de nuevo la instalación tras las correcciones. | QA | 3 h |

**Pruebas asociadas:** verificación de instalación limpia.

---

### HU-34 — Demostración y evaluación final

**Prioridad:** Alta · **6 PH** · **Responsable:** PO con equipo · **Estado:** Por hacer

**Como** equipo de proyecto, **quiero** demostrar el producto y presentar los resultados frente a los objetivos **para** cerrar la entrega con evidencias.

**Criterios de aceptación:**

1. Existe un escenario de demostración con datos ficticios preparado (cliente, despacho, verificaciones con distintos escenarios).
2. Se demuestra el flujo completo: login → creación de expediente → documentos → consentimiento → verificaciones (manual asistido y simuladas) → observación → decisión → notificación → derechos ARCO.
3. Se presentan las métricas del plan de acción medidas en el producto y **en el despacho**, sin afirmar resultados no medidos sobre el proceso migratorio oficial (los plazos oficiales, del orden de 3–8 meses, son referencia externa del proceso, no meta del producto).
4. Se exponen explícitamente las limitaciones: verificación en modo manual asistido, ausencia de convenios y APIs con instituciones (la integración automática es evolución futura sujeta a convenio), alcance del MVP y datos de demostración ficticios.
5. El Product Owner valida los entregables finales y firma (o registra) la aceptación de la entrega.
6. La presentación final y el informe de resultados quedan en el repositorio.

**Tareas:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-34.1 | Preparar datos ficticios y guion del escenario de demostración. | PO, BE | 5 h |
| TASK-34.2 | Ensayar la demostración completa y corregir detalles. | Equipo | 4 h |
| TASK-34.3 | Elaborar el informe de resultados, métricas, limitaciones y recomendaciones. | DOC, PO | 8 h |
| TASK-34.4 | Preparar y ejecutar la presentación final; registrar la aceptación. | PO | 5 h |

**Pruebas asociadas:** validación de indicadores del Documento 2.

### Entregables del Sprint 7

* Versión aceptada del producto con etiqueta de versión.
* Documentación técnica y de usuario completa.
* Informes de pruebas consolidados.
* Instalación limpia verificada.
* Demostración e informe final con métricas y limitaciones.

### DoD del Sprint 7

* Aceptación del PO documentada por historia y del proyecto en general.
* Instalación limpia reproducible con evidencia.
* Todas las pruebas críticas aprobadas.
* Limitaciones y errores conocidos publicados.

### Riesgos y bloqueos del Sprint 7

| Riesgo | Señal de alerta | Acción |
| --- | --- | --- |
| Hallazgos de aceptación en el día 12 | Historias reabiertas | Reservar 40 % del sprint para correcciones |
| Instalación limpia falla | Dependencias no documentadas | Ejecutar TASK-33.1 al inicio del sprint, no al final |

---

## 5.8. Reglas de trabajo del backlog

Cada historia de usuario debe cumplir estas condiciones:

* Tener objetivo claro y criterios de aceptación verificables.
* Estar asociada a una épica y a un sprint.
* Tener prioridad, estimación y responsable asignado por el equipo.
* Incluir las pruebas relacionadas con la funcionalidad desarrollada.
* No considerarse terminada solo porque el código compila.
* Mantener la documentación y el contrato OpenAPI actualizados.
* No utilizar datos personales reales ni de clientes en pruebas ni en demostraciones sin autorización expresa.
* Registrar los bloqueos, especialmente los relacionados con consentimiento, permisos y acuerdos con fuentes externas.

**Definition of Ready (una historia está lista para entrar al sprint cuando):**

1. Criterios de aceptación escritos y aprobados por el PO.
2. Dependencias identificadas (contrato de API, datos ficticios, decisiones previas).
3. Estimación realizada por el equipo.
4. Diseño o mockup disponible cuando la historia sea de frontend.

## 5.9. Definición general de terminado (Definition of Done)

Una historia se considera terminada cuando:

1. El código está implementado y revisado por otra persona del equipo.
2. Cumple todos sus criterios de aceptación.
3. Las pruebas relevantes pasan (unitarias, de API e integración cuando aplique).
4. La autorización y el tratamiento de datos se verifican cuando corresponda.
5. La historia respeta la Ley 81 de 2019: consentimiento registrado cuando aplique, minimización de datos y trazabilidad de verificaciones.
6. La API o interfaz está documentada en OpenAPI o en el manual correspondiente.
7. No existen defectos críticos conocidos asociados a la historia.
8. Los cambios están integrados en la rama principal del repositorio.
9. El Product Owner acepta el resultado.

En los sprints que apliquen, se suma el uso obligatorio de las herramientas definidas en la sección 5.4: **Java** para el backend, **Docker** para el entorno y las pruebas de integración, **Apache JMeter** para las pruebas de rendimiento (Sprint 6) y **OWASP ZAP** para las pruebas de seguridad (Sprint 6), dejando sus resultados como evidencia.

## 5.10. Resumen de entregables al finalizar los siete sprints

| Entregable | Resultado esperado | Sprint en que queda listo |
| --- | --- | --- |
| Frontend completo | Portal del cliente P-01…P-27 y módulo interno del despacho I-01…I-18 navegables por rol (45 pantallas). | Sprint 1 (módulo interno al inicio del Sprint 2 si hay desplazamiento; mejoras en 3, 4, 5, 6) |
| Marco legal y fuentes de verificación | Matriz fuente → tipo (pública/autorizada) → qué se guarda (solo resultado) → base legal, con consentimiento informado definido y camino futuro (AIG) documentado. | Sprint 1 |
| Fuentes de verificación simuladas | Mocks de TE, CSS, Registro Público y SNM con escenarios, representando integraciones futuras sujetas a convenio. | Sprint 1 |
| Entorno técnico | Java, PostgreSQL y Docker configurados y reproducibles. | Sprint 2 |
| Autenticación y autorización | Acceso protegido y permisos por rol aplicados. | Sprint 2 |
| Gestión de expedientes | Creación, consulta, documentos, notificaciones, consentimiento informado y derechos ARCO. | Sprint 3 |
| Flujo de revisión | Estados, observaciones, historial y auditoría. | Sprint 4 |
| Verificación documental (modo manual asistido + adaptadores preparados) | Verificaciones con fuente, fecha y responsable, adaptadores desacoplados, orquestación con idempotencia y matriz de fuentes y finalidad. | Sprint 5 |
| Calidad | Informes de pruebas automatizadas, OWASP ZAP, JMeter y usabilidad. | Sprint 6 |
| Documentación final | Manuales, contratos API, diagramas, evidencias y limitaciones. | Sprint 7 |

**Resultado esperado:** un **producto funcional para bufetes de abogados** que elimina la duplicación documental y el retrabajo del despacho, con **consentimiento informado registrado, trazabilidad de verificaciones, control de acceso por rol y protección de datos** conforme a la Ley 81 de 2019 y al Decreto Ejecutivo 285 de 2021; los indicadores se miden en el despacho. La verificación se realiza hoy en modo manual asistido sobre fuentes públicas y documentos aportados con autorización; **la integración automática con las instituciones queda como evolución futura sujeta a convenios** (p. ej. vía AIG) y no forma parte del alcance de esta entrega.

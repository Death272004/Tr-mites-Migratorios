# Rama Frontend — documento de trabajo

**Proyecto:** Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá
**Fuente:** `05-backlog-siete-sprints.md` (backlog maestro)
**Rol responsable:** FE (desarrollador frontend)

---

## 1. Objetivo de la rama

Construir **todas las pantallas funcionales** del producto según el inventario oficial adoptado de **45 pantallas** (**portal del cliente del bufete P-01 a P-27** + **módulo interno del despacho I-01 a I-18**, según `Pantallas_y_Datos_Migracion.md`), conectarlas a la API del backend cuando exista y garantizar que cada pantalla tenga estados de carga, éxito, vacío y error, con una experiencia coherente y comprensible para los cinco roles del sistema (SOLICITANTE, FUNCIONARIO, SUPERVISOR, AUDITOR, ADMIN).

El **portal P-01…P-27 es el portal del cliente del bufete** (titular del trámite): sube documentos, consulta el estado y las vigencias, ejerce sus derechos ARCO y registra su consentimiento informado. El **módulo interno I-01…I-18 es el despacho** (recepción, analista, resolutor, notificador, administrador y auditoría). El bufete de abogados es el **responsable del tratamiento de datos personales** (Ley 81 de 2019 y Decreto Ejecutivo 285 de 2021).

Por capacidad, la construcción se entrega en **dos fases**: el **portal del cliente del bufete (P-01…P-27) en el Sprint 1** y el **módulo interno del despacho (I-01…I-18) al inicio del Sprint 2** (fases E y F). Mientras el backend no exista, las pantallas trabajan sobre **fixtures locales con el mismo esquema JSON que los mocks de la HU-08**, de modo que la conexión posterior no exige reescribir vistas.

## 2. Alcance de la rama por sprint

| Sprint | Qué hace esta rama |
| --- | --- |
| 1 | Crea el andamiaje y el **portal del cliente del bufete (P-01…P-27)** en cuatro fases (A–D); funciona con fixtures locales del mismo esquema JSON que los mocks. |
| 2 | **Al inicio: módulo interno del despacho I-01…I-18** (fases E y F de la HU-05); después conecta el login real (autenticación y roles) al backend. |
| 3 | Conecta expedientes, documentos y notificaciones al backend real; añade al portal del cliente el **consentimiento informado** y el **formulario de derechos ARCO** (HU nueva del backlog). |
| 4 | Conecta estados, observaciones, historial y auditoría (P-19, P-20, I-06, I-08, I-10, I-16). |
| 5 | Conecta el panel de verificación interoperable (I-07) con su semántica de error técnico vs. resultado negativo. |
| 6 | Corrige hallazgos de seguridad y usabilidad; participa en la evaluación de usuarios. |
| 7 | Apoya la documentación de usuario (capturas) y la instalación limpia. |

## 3. Con qué trabajas (herramientas)

### Obligatorias (definidas por el equipo)

| Herramienta | Uso obligatorio en esta rama |
| --- | --- |
| **Docker** | Levantar el entorno completo (`docker compose up`) para desarrollar y verificar contra backend + base de datos reales. No se aprueba ninguna pantalla solo con datos locales. **Nota (Sprint 1):** el backend aún no existe; en el Sprint 1 las pantallas se validan con fixtures locales del mismo esquema JSON que los mocks (HU-08) y la verificación contra contenedor comienza en el Sprint 2. |
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
* Enrutado por **hash** (`#/ruta`) con **guards por rol** (SOLICITANTE, FUNCIONARIO, SUPERVISOR, AUDITOR, ADMIN): una ruta no permitida redirige a `#/login` o a la vista global 403; las vistas globales 403, 404 y 500 y los modales son componentes compartidos.
* Mientras no exista backend, los datos vienen de **fixtures locales** (`js/fixtures/`) con **el mismo esquema JSON** que los mocks de la HU-08: pasar de fixtures a mocks no debe exigir reescribir vistas.
* Los campos de origen **"A"** se muestran como **verificación automática simulada (futuro convenio)**: *"verificado automáticamente · fuente TE/CSS/Registro Público · fecha"*, y **bloquean la carga manual** en la pantalla. El modo de producción actual es la **verificación manual asistida**: el abogado del despacho registra el resultado de la verificación en **I-07** (fuente, fecha, resultado, responsable) y el portal refleja ese resultado.
* **Ley 81 (y Decreto 285 de 2021):** minimización de datos solicitados, sin secretos en el cliente, OTP de P-03 y MFA de I-01 **simulados** en el MVP, autorización de tratamiento de datos explícita en P-02 y P-16, **consentimiento informado** y **ejercicio de derechos ARCO** en el portal del cliente del bufete.

---

## 5. Sprints

# Sprint 1 (semanas 1–2) — Portal del cliente del bufete completo (P-01…P-27)

**Objetivo de la rama:** tener el **portal del cliente del bufete completo (P-01 a P-27)** creado, navegable por los cinco roles y con diseño base consistente, funcionando con **fixtures locales** con el mismo esquema JSON que los mocks de la HU-08, listo para el cambio a mocks al cierre del sprint.

> **Nota de alcance (cambio aprobado):** por capacidad, este sprint construye **solo el portal del cliente del bufete (P-01…P-27)**; el **módulo interno del despacho (I-01…I-18)** se construye al **inicio del Sprint 2** con las fases E y F de la HU-05. En el Sprint 1 **no existe backend**: no hay credenciales ni secretos en el cliente, el OTP de P-03 y el MFA de I-01 están simulados, y los campos de origen "A" se muestran como **verificación automática simulada (futuro convenio)** (*"verificado automáticamente · fuente TE/CSS/Registro Público · fecha"*); el modo real es la **verificación manual asistida**, registrada por el despacho en I-07.

### Fases del sprint

| Fase | Alcance | Pantallas | Horas estimadas |
| --- | --- | --- | --- |
| **A** | Estructura, diseño base, componentes, enrutado con guards y vistas globales | — (transversal) | ~15 h |
| **B** | Acceso y cuenta (OTP simulado) | P-01…P-05 | ~20 h |
| **C** | Bandeja, asistente de solicitud y cita | P-06…P-18 | ~60 h |
| **D** | Seguimiento y servicios | P-19…P-27 | ~35 h |
| | **Total Sprint 1** | | **≈ 130 h** |

**Nota de capacidad:** total Sprint 1 ≈ **130 h**; si no alcanza, la **fase D se recorta priorizando P-19, P-20, P-21 y P-22** (P-26 y P-27 quedan para el inicio del Sprint 2) y se registra el ajuste en el backlog (decisión del PO).

> **Nota (consentimiento y ARCO):** el **consentimiento informado** (Ley 81 de 2019 + Decreto 285 de 2021) y el **formulario de derechos ARCO** forman parte del **portal del cliente del bufete** y se añaden en el **Sprint 3** con la HU nueva del backlog; las fases C/D dejan reservado su espacio (P-02/P-16 y pantalla de seguimiento/servicios).

#### Fase A — Estructura, diseño base y componentes (~15 h) · HU-01

- [ ] Estructura de carpetas: `css/`, `js/views/`, `js/components/`, `js/services/`, `js/fixtures/` y `js/utils/`.
- [ ] Diseño base: paleta, tipografía, espaciados y breakpoints (escritorio y tablet) en un único archivo de variables.
- [ ] Layout con encabezado, menú según rol, área de contenido y pie.
- [ ] Componentes reutilizables: botones, campos, tablas, tarjetas de estado, modales, avisos, paginación, stepper del asistente y línea de tiempo.
- [ ] Enrutado **hash** (`#/ruta`) con **guards por rol** (SOLICITANTE, FUNCIONARIO, SUPERVISOR, AUDITOR, ADMIN) y redirección a `#/login` o `#/error/403`.
- [ ] Vistas globales: error **403, 404 y 500** con reintento, spinner de carga y modales de confirmación.
- [ ] Fixtures base (`js/fixtures/`) con el **mismo esquema JSON** que los mocks de la HU-08 y selector de escenarios locales (carga, éxito, vacío, error).
- [ ] `README` del frontend con estructura, convenciones y comando único de ejecución, sin credenciales ni secretos.

#### Fase B — Acceso y cuenta: P-01…P-05 (~20 h) · HU-02

- [ ] **P-01** Inicio de sesión: validaciones, mostrar/oculta contraseña, fallo genérico (CP-02) y bloqueo tras intentos.
- [ ] **P-02** Registro de cuenta: catálogos, unicidad de correo y aceptación obligatoria de términos + autorización de tratamiento de datos (Ley 81).
- [ ] **P-03** Verificación de identidad **(OTP simulado)**: código de 6 dígitos, expira en 10 minutos, 3 intentos; sin envío real de correo/SMS.
- [ ] **P-04** Recuperación de contraseña: confirmación neutra y enlace temporal simulado (1 hora).
- [ ] **P-05** Mi perfil / datos de contacto: datos de solo lectura, cambio de correo con re-verificación OTP simulada.
- [ ] Gestor de sesión en cliente (token ficticio, expiración, cierre) y menú/ruta inicial por rol.
- [ ] Los cuatro estados (carga, éxito, vacío, error con reintento) en cada pantalla.

#### Fase C — Bandeja y asistente de solicitud: P-06…P-18 (~60 h) · HU-03

- [ ] **P-06** Mis trámites: tarjetas con expediente, trámite, fecha, estado, vigencias y pendiente del titular.
- [ ] **P-07** Nueva solicitud: categoría, trámite, motivo y modalidad de presentación; carga la ficha de requisitos por trámite.
- [ ] **P-08** Titularidad y representación: condición del presentante, documento acreditativo y validación en cliente.
- [ ] **P-09…P-16** Asistente de **8 pasos** con stepper, validación por paso y guardado de borrador: datos personales · pasaporte e historial · domicilio · situación laboral/económica · dependientes · requisitos y carga de documentos · pagos y tasas · declaración jurada y firma.
- [ ] Campos de origen **"A"** sellados como **verificación automática simulada (futuro convenio)** — *"verificado automáticamente · fuente TE/CSS/Registro Público · fecha"* — y **bloqueados** para carga manual (minimización, Ley 81); el resultado real proviene del registro del despacho en modo **verificación manual asistida** (I-07).
- [ ] **P-14** exige completitud al 100 % para habilitar P-16; validación de formato/tamaño en cliente con progreso y resultado.
- [ ] **P-15** Pagos y tasas: **captura simulada sin pasarela** (tasas de solo lectura, comprobante opcional, constancia generada).
- [ ] **P-16** Declaración jurada: autorización Ley 81 y firma simulada con sello de tiempo.
- [ ] **P-17** Resumen y envío: número de expediente, QR y estado inicial `RECIBIDO – EN PREPARACIÓN`.
- [ ] **P-18** Reserva de cita: calendario con cupo por ventanilla y turno/tiquete asignado.
- [ ] Fixtures del asistente y los cuatro estados en todas las pantallas del flujo.

#### Fase D — Seguimiento y servicios: P-19…P-27 (~35 h) · HU-04

- [ ] **P-19** Estado del trámite: línea de tiempo, etapa actual, días transcurridos, requisitos faltantes y acción pendiente.
- [ ] **P-20** Observaciones y notificaciones: emisor, fecha, plazo y acceso a la subsanación (→ P-21).
- [ ] **P-21** Subsanación: archivo corregido, justificación y confirmación de atender todas las observaciones.
- [ ] **P-22** Resultados: resolución, carné digital, constancias, motivos de negación y vía de impugnación.
- [ ] **P-23** Historial de pagos: tabla con recibo descargable; **misma captura simulada sin pasarela de P-15**.
- [ ] **P-24** Edictos y citaciones y **P-25** Certificaciones en línea: marcadas **POR CONFIRMAR**, entregadas en **modo consulta mínimo**.
- [ ] **P-26** Naturalización: flujo específico N-1 a N-13.
- [ ] **P-27** Ayuda, FAQ y peticiones.
- [ ] Los cuatro estados en cada pantalla y recorrido completo por rol SOLICITANTE.

### HU-01 — Andamiaje del frontend y diseño base (Fase A)

**Prioridad:** Crítica · **5 PH** · **Responsable:** FE

**Como** desarrollador frontend, **quiero** contar con la estructura base del cliente (layout, navegación, estilos, componentes reutilizables, vistas globales y fixtures base) **para** que todas las pantallas se construyan sobre un patrón consistente y reutilizable.

**Criterios de aceptación:**

1. Estructura de carpetas documentada: `css/`, `js/views/`, `js/components/`, `js/services/`, `js/fixtures/` y `js/utils/`.
2. Layout con encabezado, menú según rol, área de contenido y pie, adaptado a escritorio y tablet.
3. Enrutado **hash** con guards por rol (SOLICITANTE, FUNCIONARIO, SUPERVISOR, AUDITOR, ADMIN); navegación entre las **45 pantallas del inventario (P-01…P-27 e I-01…I-18)** sin recargas completas, respetando el rol activo.
4. Vistas globales compartidas: error **403, 404 y 500** con reintento, spinner de carga y modales de confirmación.
5. Biblioteca mínima de componentes: botones, campos, tablas, tarjetas de estado, modales, avisos, paginación, stepper y línea de tiempo.
6. Fixtures base versionados en `js/fixtures/` con **el mismo esquema JSON** que los mocks de la HU-08, y selector de escenarios locales (carga, éxito, vacío, error).
7. Paleta, tipografía y espaciados en un único archivo de variables, documentado en el `README` del frontend.
8. Ejecución con un comando único documentado y sin credenciales ni secretos.

**Tareas de esta rama (Fase A ≈ 15 h):**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-01.1 | Crear la estructura de carpetas (`css/`, `js/views/`, `js/components/`, `js/services/`, `js/fixtures/`, `js/utils/`), el archivo de variables de diseño y los fixtures base con el esquema de la HU-08. | FE | 3 h |
| TASK-01.2 | Implementar el layout base: encabezado, menú por rol, área de contenido y pie. | FE | 4 h |
| TASK-01.3 | Implementar el enrutado hash y la protección por rol (redirect a `#/login` o `#/error/403`) junto con las vistas globales 403/404/500 y los modales. | FE | 3 h |
| TASK-01.4 | Desarrollar la biblioteca de componentes reutilizables (incluidos stepper y línea de tiempo). | FE | 3 h |
| TASK-01.5 | Documentar el diseño base y las convenciones en el `README` del frontend. | FE con DOC | 2 h |

**Dependencias:** ninguna (es la primera tarea de la rama).

---

### HU-02 — Acceso y cuenta: P-01…P-05 (Fase B)

**Prioridad:** Crítica · **3 PH** · **Responsable:** FE

**Como** usuario, **quiero** iniciar sesión, registrarme, verificar mi identidad, recuperar mi contraseña y gestionar mi perfil **para** acceder al sistema de forma segura.

**Criterios de aceptación:**

1. **P-01** valida campos obligatorios, formato de correo y muestra/oculta la contraseña.
2. El intento fallido muestra un mensaje genérico que no revela si el usuario existe (CP-02).
3. Bloqueo visual tras intentos repetidos, con contador y mensaje claro.
4. **P-02** registra documento, nacionalidad, correo, teléfono y contraseña, con aceptación obligatoria de términos y de autorización de tratamiento de datos (Ley 81).
5. **P-03** verifica la identidad con **OTP simulado** (código de 6 dígitos, expira en 10 minutos, 3 intentos) sin envío real de correo/SMS.
6. **P-04** solicita correo y muestra confirmación neutra sin revelar existencia de cuentas, con enlace temporal simulado; **P-05** muestra datos de solo lectura y permite cambiar el correo con re-verificación OTP simulada.
7. Tras iniciar sesión, menú y ruta inicial cambian según el rol (SOLICITANTE, FUNCIONARIO, SUPERVISOR, AUDITOR, ADMIN).
8. Cerrar sesión limpia el estado local y redirige a `#/login`.
9. Las cinco pantallas implementan los cuatro estados: carga, éxito, vacío y error con reintento.

**Tareas de esta rama (Fase B ≈ 20 h):**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-02.1 | Construir la pantalla P-01 con validaciones de formulario en cliente, mensaje genérico de fallo (CP-02) y bloqueo por intentos. | FE | 4 h |
| TASK-02.2 | Construir P-02 (registro con aceptación Ley 81) y P-03 con OTP simulado y sus estados de carga, éxito y error. | FE | 6 h |
| TASK-02.3 | Construir P-04 (recuperación) y P-05 (perfil y datos de contacto) con re-verificación OTP simulada. | FE | 5 h |
| TASK-02.4 | Implementar el gestor de sesión en el cliente (token, expiración, cierre de sesión) y adaptar el layout y el menú al rol autenticado. | FE | 5 h |

**Dependencias:** el backend real de login llega en el Sprint 2 (HU-12); en este sprint se trabaja contra fixtures locales con el esquema de los mocks.

---

### HU-03 — Bandeja y asistente de solicitud: P-06…P-18 (Fase C)

**Prioridad:** Crítica · **8 PH** · **Responsable:** FE

**Como** solicitante, **quiero** crear, consultar y dar seguimiento a mis solicitudes desde una bandeja y un asistente de 8 pasos claros **para** evitar viajes repetidos y entregas duplicadas de documentación.

**Criterios de aceptación:**

1. **P-06** lista los trámites del usuario en tarjetas (número de expediente, trámite, fecha de envío, estado, vigencias y pendiente del titular) con estados vacío/carga/error.
2. **P-07** selecciona categoría y trámite, carga la ficha de requisitos del trámite y deriva a **P-08** según presente por cuenta propia o mediante apoderado.
3. **P-08** registra titularidad y representación con documento acreditativo (archivo) y validación en cliente.
4. **P-09 a P-16** forman el **asistente de 8 pasos** con stepper, validación por paso, guardado de borrador y avance bloqueado hasta cumplir el paso; **P-14** exige completitud al 100 % para habilitar **P-16**.
5. Los campos de origen **"A"** se muestran como **verificación automática simulada (futuro convenio)** (*"verificado automáticamente · fuente TE/CSS/Registro Público · fecha"*) y **bloquean la carga manual** (minimización de datos, Ley 81); el resultado real lo registra el despacho en modo **verificación manual asistida** (I-07).
6. **P-15** captura pagos en modo **simulado, sin pasarela**: tasas de solo lectura, comprobante opcional y constancia de pago generada.
7. **P-16** exige declaración de veracidad, autorización de tratamiento de datos (Ley 81) y firma simulada con sello de tiempo.
8. **P-17** muestra el resumen, genera el número de expediente con QR/código y el estado inicial `RECIBIDO – EN PREPARACIÓN`; **P-18** reserva cita con calendario, cupo por ventanilla y turno asignado.
9. Todas las pantallas funcionan con fixtures locales y tienen los cuatro estados (carga, éxito, vacío, error con reintento).
10. Los mensajes de error explican la causa en lenguaje no técnico y sugieren la acción siguiente.

**Tareas de esta rama (Fase C ≈ 60 h):**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-03.1 | Construir P-06 (bandeja de trámites) y P-07 (selección de trámite con ficha de requisitos) con filtros, paginación y estados vacío/carga/error. | FE | 8 h |
| TASK-03.2 | Construir P-08 (titularidad y representación) y el bloque de campos de origen "A" (verificación automática simulada — futuro convenio) con carga manual bloqueada. | FE | 6 h |
| TASK-03.3 | Construir el asistente P-09…P-16 con stepper, validaciones por paso, carga de documentos, P-15 (captura de pago simulada sin pasarela) y P-16 (declaración y firma simulada). | FE | 24 h |
| TASK-03.4 | Construir P-17 (resumen y envío con número de expediente y QR) con validación de campos del servidor cuando exista. | FE | 8 h |
| TASK-03.5 | Construir P-18 (reserva de cita) con calendario, cupo y turno asignado. | FE | 6 h |
| TASK-03.6 | Definir los fixtures de demostración del solicitante (mismo esquema JSON que los mocks) y los cuatro estados en todo el flujo. | FE | 8 h |

**Dependencias:** catálogo de tipos documentales (TASK-17.1, Sprint 3, con PO); mientras no exista, se usa un catálogo en fixtures.

---

### HU-04 — Seguimiento y servicios del portal: P-19…P-27 (Fase D)

**Prioridad:** Crítica · **8 PH** · **Responsable:** FE

**Como** solicitante, **quiero** seguir el estado de mi trámite, atender observaciones, descargar resultados y usar los servicios en línea **para** completar mi gestión sin ventanilla ni papel.

**Criterios de aceptación:**

1. **P-19** muestra la línea de tiempo con etapa actual, fecha de cada etapa, días transcurridos, requisitos faltantes y acción pendiente, usando los estados visibles para el titular.
2. **P-20** lista observaciones y notificaciones con emisor, fecha, plazo de atención y botón para atender (→ **P-21**), sin datos confidenciales en el texto.
3. **P-21** permite subsanar el ítem observado con archivo corregido, justificación y confirmación de atender **todas** las observaciones.
4. **P-22** muestra resolución (PDF), carné digital, constancias, estado del permiso y motivos de negación con vía de impugnación; la descarga está deshabilitada sin permiso.
5. **P-23** lista el historial de pagos con recibo descargable, con la **misma captura simulada sin pasarela** del paso P-15.
6. **P-26** despliega el flujo específico de naturalización (N-1 a N-13) cuando el trámite es Carta de Naturaleza.
7. **P-24** (edictos y citaciones) y **P-25** (certificaciones en línea) están marcadas **POR CONFIRMAR** y se entregan en **modo consulta mínimo**.
8. **P-27** permite enviar ayuda/FAQ y peticiones con campos obligatorios y adjunto opcional.
9. Todas las pantallas tienen los cuatro estados (carga, éxito, vacío, error con reintento) y funcionan con fixtures locales.

**Tareas de esta rama (Fase D ≈ 35 h):**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-04.1 | Construir P-19 (línea de tiempo de estados) y P-20 (observaciones y notificaciones) con nivel de detalle por rol. | FE | 8 h |
| TASK-04.2 | Construir P-21 (subsanación) con carga de archivos y confirmación de atención completa. | FE | 5 h |
| TASK-04.3 | Construir P-22 (resultados: resolución, carné digital, certificados) y P-23 (historial de pagos, captura simulada). | FE | 7 h |
| TASK-04.4 | Construir P-26 (flujo de naturalización N-1 a N-13) reutilizando componentes del asistente. | FE | 8 h |
| TASK-04.5 | Construir P-24 y P-25 en modo consulta mínimo (marcadas POR CONFIRMAR) y P-27 (ayuda, FAQ y peticiones). | FE | 7 h |

**Nota de capacidad:** la fase D es la recortable; si el sprint no da abasto, se conservan **P-19, P-20, P-21 y P-22** y P-26/P-27 se desplazan al inicio del Sprint 2, registrando el ajuste en el backlog.

**Dependencias:** datos de seguimiento y resoluciones (Sprints 4–5); en este sprint se usan fixtures.

---

### HU-05 — Módulo interno: I-01…I-18 (fases E y F)

**Prioridad:** Alta · **5 PH** · **Responsable:** FE

> **Nota:** esta historia **se ejecuta al inicio del Sprint 2** (fases E y F); en el Sprint 1 queda planificada para no comprometer la capacidad del portal.

**Como** funcionario, supervisor, auditor y administrador del despacho, **quiero** contar con el módulo interno completo (recepción, análisis, verificación de fuentes, resolución, catálogos, usuarios, bitácora, reportes y salud de conexiones) **para** tramitar solicitudes sin herramientas externas y cumplir mis funciones sin acceso a expedientes que no me corresponden.

**Criterios de aceptación:**

1. **I-01** es el login del despacho (módulo interno) con **MFA simulado** (código de un solo uso) y timeout de sesión; sin credenciales ni secretos en el cliente.
2. **I-02 a I-13** (Fase E, ~60 h): tablero, bandeja de recepción con colas y filtros (estado, trámite, fecha, responsable), recepción y verificación de completitud, asignación de analista y análisis del expediente con checklist.
3. **I-06** reutiliza la vista de detalle con información ampliada: documentos, historial, requisitos del catálogo (I-14) y bloque de verificaciones.
4. **I-10** muestra solo las transiciones disponibles; las no permitidas aparecen deshabilitadas con explicación, exige motivo para estados finales y confirmación antes de enviar.
5. **I-08** permite registrar observaciones con texto obligatorio; lista autor, fecha y respuesta.
6. **I-07** (panel de verificación interoperable) muestra las verificaciones con su estado propio y distingue visualmente el error técnico del resultado negativo (CP-07).
7. **I-07** ofrece "reintentar" solo cuando el estado lo permite, avisando que la operación es idempotente (CP-08); es además la pantalla del despacho del **modo de verificación manual asistida**, donde el abogado registra el resultado de la verificación (**fuente, fecha, resultado, responsable**). Los campos de origen "A" aparecen en el portal como **verificación automática simulada (futuro convenio)** y bloquean la carga manual.
8. **I-14 a I-18** (Fase F, ~25 h): catálogos, usuarios/roles/permisos con confirmación, consulta de roles en modo lectura, bitácora de auditoría con filtros y exportación CSV, reportes con indicadores por periodo y salud de las conexiones de interoperabilidad (errores técnicos e intentos fallidos diferenciados de resultados de validación).
9. Ninguna pantalla muestra expedientes a usuarios sin permiso (CP-03, CP-09) y ninguna ofrece acciones que el backend rechazará.
10. Todas las pantallas implementan los cuatro estados (carga, éxito, vacío, error con reintento).

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación | Fase |
| --- | --- | --- | --- | --- |
| TASK-05.1 | Construir I-01 (login del despacho con MFA simulado) y el layout interno con menú por rol. | FE | 10 h | E |
| TASK-05.2 | Construir I-02…I-06 (tablero, recepción, verificación de completitud, asignación de analista y análisis con checklist). | FE | 20 h | E |
| TASK-05.3 | Construir I-07…I-13 (panel de verificación interoperable con semántica de error, observaciones, edictos, resolución, notificación, entrega y archivo/reactivación). | FE | 30 h | E |
| TASK-05.4 | Construir I-14…I-17 (catálogos, usuarios/roles/permisos, bitácora de auditoría y reportes por etapa). | FE | 18 h | F |
| TASK-05.5 | Construir I-18 (salud de las conexiones de interoperabilidad) con métricas e intentos fallidos. | FE | 7 h | F |

**Dependencias:** datos de reportes y auditoría (Sprints 4–5) y matriz de transiciones (TASK-19.1, Sprint 4, con PO/LT); mientras no existan, se usan fixtures con el esquema de los mocks.

---

### HU-09 — Integración del frontend: fixtures → mocks y estados de interfaz

**Prioridad:** Crítica · **5 PH** · **Responsable:** FE con BE

**Como** usuario, **quiero** que las pantallas se alimenten de fixtures locales y después de las APIs ficticias (mocks) sin cambios de vista, y que muestren correctamente carga, éxito, vacío y error **para** verificar el flujo real antes de construir la lógica de negocio.

**Criterios de aceptación:**

1. Un único módulo de servicios HTTP en el frontend (llamadas centralizadas, token, errores); sin `fetch` sueltos en vistas.
2. Cada pantalla implementa y muestra los cuatro estados con reintento.
3. Los **fixtures locales** de `js/fixtures/` y los **mocks** de la HU-08 comparten **el mismo esquema JSON**: el paso de fixtures a mocks no exige reescribir vistas.
4. **I-07** (y el estado agregado en **P-19**) muestran los escenarios `OK`, `SIN_RESULTADO`, `ERROR_TECNICO` y `TIMEOUT` usando los mocks, manteniendo la distinción visual entre error técnico y resultado negativo.
5. Los errores HTTP se traducen a mensajes de usuario por código (401, 403, 404, 409, 5xx) sin filtrar detalles técnicos.
6. Flujo navegable completo con mocks: login → crear solicitud (P-07…P-17) → adjuntar documentos (P-14) → ver seguimiento (P-19) → ver las verificaciones en I-07 (simulación demostrativa o registro manual asistido).
7. Sin llamadas a endpoints inexistentes ni errores de consola en el recorrido principal.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-09.1 | Implementar el módulo de servicios HTTP con manejo centralizado de errores y token (leído desde fixtures locales al inicio). | FE | 5 h |
| TASK-09.2 | Sustituir fixtures por llamadas a los mocks en las pantallas del portal del solicitante (P-06…P-18), sin reescribir vistas. | FE | 6 h |
| TASK-09.3 | Sustituir fixtures por llamadas a los mocks en seguimiento y servicios (P-19…P-27) y, al construirlo, en el módulo interno (I-01…I-18). | FE | 6 h |
| TASK-09.4 | Implementar el selector de escenarios en la UI de demostración. | FE | 3 h |
| TASK-09.5 | Recorrer el flujo completo y corregir incidencias. | FE con QA | 4 h |

**Nota de capacidad:** estas tareas se ejecutan como **cierre de las fases B, C y D** reutilizando los fixtures ya construidos (mismo esquema JSON), por lo que están consideradas dentro de las ≈ 130 h del sprint; si los mocks de la HU-08 no están al cierre del Sprint 1, el pase a mocks se hace al inicio del Sprint 2 sin reprogramar pantallas.

**Dependencias de otras ramas:** HU-08 (APIs ficticias, Backend) y HU-07 (contrato OpenAPI, Backend) deben estar listas antes de TASK-09.2.

### Entregables del Sprint 1 (rama Frontend)

* Portal del cliente del bufete completo: **27 pantallas (P-01…P-27)** navegables por rol con diseño base documentado.
* Andamiaje con enrutado hash, guards por rol, vistas globales (403/404/500, modales) y fixtures base con el esquema de la HU-08.
* Fases E y F del módulo interno (I-01…I-18) planificadas y listas para ejecutarse al inicio del Sprint 2.
* Flujo completo navegable con fixtures locales y con los mocks (mismo esquema JSON).
* `README` del frontend con estructura y convenciones.

### DoD del Sprint 1 (rama Frontend)

* Inventario del portal **P-01…P-27** verificado por rol (SOLICITANTE en las cuatro fases; vistas globales para todos).
* Cuatro estados de interfaz en todas las pantallas del portal.
* Cero errores de consola en el recorrido principal.
* Sin credenciales ni datos reales en el código.

---

# Sprint 2 (semanas 3–4) — Módulo interno I-01…I-18 y autenticación real

**Objetivo de la rama:** construir el **módulo interno (I-01…I-18)** al inicio del sprint con las **fases E y F** de la HU-05, y sustituir el login simulado por el backend real (Java/Docker) ajustando el frontend a permisos reales.

### Módulo interno I-01…I-18 — fases E y F (HU-05, al inicio del sprint)

**Fase E (~60 h) — I-01…I-13 (operación de expedientes):**

- [ ] **I-01** Login del despacho (módulo interno) con **MFA simulado** (código de un solo uso), timeout de sesión y bitácora de intentos; sin credenciales en el cliente.
- [ ] **I-02** Tablero de gestión con indicadores por rol.
- [ ] **I-03** Bandeja de recepción (citas y turnos) con colas, filtros (estado, trámite, fecha, responsable), ordenación y paginación.
- [ ] **I-04** Recepción y verificación de completitud (checklist igual al de P-14).
- [ ] **I-05** Asignación de analista con confirmación.
- [ ] **I-06** Análisis del expediente: checklist de requisitos, verificaciones requeridas y decisión de conformidad.
- [ ] **I-07** Panel de verificación interoperable: estado propio por verificación, distinción **error técnico vs. resultado negativo** (CP-07) e reintento solo cuando el estado lo permite (CP-08); en **modo verificación manual asistida** el abogado registra aquí el resultado (**fuente, fecha, resultado, responsable**) y los campos de origen "A" se muestran en el portal como verificación automática simulada (futuro convenio), sellados y bloqueados.
- [ ] **I-08** Emisión y atención de observaciones (texto obligatorio, autor, fecha, respuesta).
- [ ] **I-09** Edictos y publicaciones.
- [ ] **I-10** Resolución (aprobar/negar): solo transiciones permitidas, motivo obligatorio en estados finales y confirmación previa.
- [ ] **I-11** Notificación al titular.
- [ ] **I-12** Entrega en ventanilla.
- [ ] **I-13** Expedientes archivados y reactivación.
- [ ] Los cuatro estados (carga, éxito, vacío, error con reintento) en todas las pantallas de la fase.

**Fase F (~25 h) — I-14…I-18 (administración, supervisión y salud):**

- [ ] **I-14** Catálogos: trámites, requisitos, tasas y vigencias (alta/baja simple).
- [ ] **I-15** Usuarios, roles y permisos: listado, alta, deshabilitación y asignación de rol, con confirmación.
- [ ] **I-16** Bitácora de auditoría con filtros (fecha, actor, operación, recurso), paginación y exportación CSV; **solo lectura** para AUDITOR.
- [ ] **I-17** Reportes y tiempos por etapa: indicadores con periodo configurable y gráficos sencillos (SUPERVISOR y AUDITOR).
- [ ] **I-18** Salud de las conexiones de interoperabilidad: errores técnicos, intentos fallidos y métricas diferenciados de los resultados de validación.
- [ ] Los cuatro estados y verificación de permisos por rol (CP-03, CP-09) en toda la fase.

**Nota:** la HU-05 (≈ 85 h entre fases E y F) se ejecuta **al inicio del Sprint 2**; si hay retraso, se mantiene primero E (operación) y F queda para la primera mitad del Sprint 3, registrando el ajuste.

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
| TASK-12.5 | Conectar el frontend de acceso (P-01 inicio de sesión, P-02 registro, P-04 recuperación y P-05 perfil) al backend real (Java, endpoints `/api/auth/*`); P-03 (OTP) sigue simulado hasta que exista envío real. | FE | 5 h |

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

* Módulo interno **I-01…I-18** (fases E y F) navegable por rol con sus cuatro estados.
* Login, registro, recuperación y perfil conectados al backend Java.
* Frontend empaquetado en Docker y arrancable con `docker compose up`.

### DoD del Sprint 2 (rama Frontend)

* Inventario del módulo interno **I-01…I-18** verificado por rol (FUNCIONARIO, SUPERVISOR, AUDITOR, ADMIN).
* Recorrido de autenticación real aprobado por QA (CP-01, CP-02).
* Interfaz coherente con la matriz de permisos (TASK-13.1).

---

# Sprint 3 (semanas 5–6) — Expedientes y documentos alineados al backend

**Objetivo de la rama:** conectar las pantallas de expedientes y documentos a los endpoints reales, con validación de errores campo a campo.

> **Nota (Sprint 3 — consentimiento y ARCO):** según la HU nueva del backlog, en este sprint se añaden al **portal del cliente del bufete** el **consentimiento informado** (Ley 81 de 2019 + Decreto 285 de 2021, con consentimiento expreso para datos sensibles) y el **formulario de derechos ARCO**; se conectan a los endpoints de consentimiento y de solicitud ARCO del backend (HU-11).

### HU-15 — Registro de expediente (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-15.3 | Conectar el asistente (P-07…P-17) al endpoint `POST /api/expedientes`, incluyendo manejo de errores de validación campo a campo. | FE | 6 h |

**Criterio:** los errores `400` del servidor se muestran en el campo correspondiente del asistente; el éxito muestra el identificador generado.

**Dependencias:** TASK-15.1, 15.2, 15.4, 15.5 (Backend).

---

### HU-16 — Consulta y seguimiento (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-16.3 | Conectar P-06 (bandeja), P-19 (estado y detalle) y las pantallas internas I-03/I-06 a los endpoints de listado, detalle e historial. | FE | 6 h |

**Criterios:** filtros y paginación funcionan contra el servidor; un expediente ajeno muestra pantalla de "no encontrado" sin datos (CP-03).

**Dependencias:** TASK-16.1, 16.2, 16.4 (Backend y QA).

---

### HU-17 — Gestión documental protegida (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-17.4 | Conectar P-14 (requisitos y carga de documentos) al backend con progreso de carga y manejo de errores de archivo. | FE | 6 h |

**Criterios:** tipo no permitido y tamaño excedido se informan de forma segura (CP-05); la descarga solo se habilita con permiso (CP-12).

**Dependencias:** TASK-17.1 a TASK-17.3, 17.5 (Backend y QA).

---

### HU-18 — Notificaciones (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-18.3 | Conectar P-20 (observaciones y notificaciones) al backend con marcado de leídas. | FE | 4 h |

**Dependencias:** TASK-18.1, 18.2, 18.4 (Backend y PO).

### Entregables del Sprint 3 (rama Frontend)

* Flujo del titular completo contra backend real: crear → documentar → consultar.
* **Consentimiento informado** y **formulario de derechos ARCO** en el portal del cliente del bufete (HU nueva del backlog).
* Bandeja del despacho conectada.

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
| TASK-19.4 | Conectar I-10 (resolución) al backend con transiciones dinámicas, motivo obligatorio y confirmaciones. | FE | 5 h |

**Criterios:** solo se envían transiciones permitidas por la respuesta del servidor; un `409`/`403` conserva la vista con el estado original y explica el motivo (CP-04).

**Dependencias:** TASK-19.1 a TASK-19.3, 19.5 (PO, Backend, QA).

---

### HU-20 — Observaciones (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-20.2 | Conectar I-08 (observaciones internas) y el bloque de observaciones de P-19. | FE | 5 h |

**Criterio:** el solicitante solo ve observaciones propias; una observación no cambia el estado en la interfaz.

**Dependencias:** TASK-20.1, 20.3 (Backend y QA).

---

### HU-21 — Historial de estados (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-21.2 | Construir el componente de línea de tiempo y conectarlo a P-19 (titular) e I-06 (análisis interno). | FE | 5 h |

**Criterio:** la línea de tiempo muestra autor, fecha, cambio y motivo; sin datos sensibles innecesarios (CP-09).

**Dependencias:** TASK-21.1, 21.3 (Backend y QA).

---

### HU-22 — Auditoría (participación)

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-22.4 | Conectar I-16 (bitácora de auditoría) y verificar la exportación CSV. | FE | 4 h |

**Criterio:** solo el rol auditor ve la pantalla; los filtros y la exportación funcionan contra el servidor.

**Dependencias:** TASK-22.1 a TASK-22.3, 22.5 (Backend y QA).

### Entregables del Sprint 4 (rama Frontend)

* I-10 (resolución), I-08 (observaciones), P-19/I-06 (historial) e I-16 (auditoría) conectadas y respetando permisos.

### DoD del Sprint 4 (rama Frontend)

* CP-04 y CP-09 verificadas desde la interfaz.
* Sin posibilidad visual de forzar transiciones no permitidas.

---

# Sprint 5 (semanas 9–10) — Panel de verificación interoperable (I-07) conectado

**Objetivo de la rama:** dejar el panel de verificación interoperable (I-07) listo para la demostración, con su semántica de error técnico vs. resultado negativo.

### HU-26 — Panel de verificación interoperable conectado en el flujo real

**Prioridad:** Crítica · **8 PH** · **Responsable:** FE con BE

**Como** funcionario y solicitante, **quiero** ver el estado real de las validaciones en el expediente **para** saber qué falta y cuándo puedo decidir.

**Criterios de aceptación:**

1. `POST` y `GET /api/expedientes/{id}/validaciones` conectados a **I-07** y al bloque de **P-19**.
2. Cada verificación muestra la **fuente de verificación**, fecha, estado técnico y resultado cuando exista.
3. El error técnico se distingue visualmente del resultado negativo (color, icono, texto) — CP-07.
4. El reintento aparece solo en estados permitidos y muestra su resultado — CP-08.
5. El solicitante ve el estado agregado en P-19 sin detalles internos innecesarios (el detalle fino vive en I-07).
6. Recorrido completo de demostración: expediente → verificaciones (fuente simulada en demostración o resultado registrado en modo manual asistido) → decisión (I-10).

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-26.1 | Conectar I-07 a los endpoints de validaciones con recarga y refresco. | FE | 6 h |
| TASK-26.2 | Implementar la distinción error técnico vs. resultado negativo y el botón de reintento. | FE | 5 h |
| TASK-26.3 | Mostrar el bloque de validaciones en P-19 con nivel de detalle por rol. | FE | 5 h |
| TASK-26.4 | Ejecutar el recorrido completo con escenarios forzados (`X-Scenario`) y corregir incidencias. | FE con QA | 6 h |

**Dependencias de otras ramas:** HU-23, HU-24 y HU-25 (adaptadores, orquestación y trazabilidad — Backend) deben estar operativas.

### Entregable del Sprint 5 (rama Frontend)

* Panel de verificación interoperable (I-07) operativo en el flujo real con escenarios de error demostrables.

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
| 1 | HU-01 (A), HU-02 (B), HU-03 (C), HU-04 (D), HU-09 (cierre de fases) | **≈ 130 h** de frontend (A 15 h + B 20 h + C 60 h + D 35 h) |
| 2 | **HU-05 (fases E y F: arranque del módulo interno I-01…I-18)**, HU-10 (10.4), HU-12 (12.5), HU-13 (13.5) | ≈ 85 h de módulo interno (E 60 h + F 25 h) + ≈ 15 h de participación |
| 3 | HU-15, HU-16, HU-17, HU-18 | ~22 h |
| 4 | HU-19, HU-20, HU-21, HU-22 | ~20 h |
| 5 | HU-26 | ~22 h |
| 6 | HU-28 (parte), HU-30 | ~12 h + correcciones ZAP |
| 7 | HU-32 (32.2), HU-33 (parte), HU-34 | ~13 h |

**Nota:** el Sprint 1 concentra la carga pesada de la rama (**≈ 130 h**: portal P-01…P-27 en las fases A–D); si la capacidad real es menor, se recorta la **fase D** priorizando P-19, P-20, P-21 y P-22 (decisión del PO registrada en el backlog). El **módulo interno I-01…I-18 (HU-05, ≈ 85 h)** se ejecuta al **inicio del Sprint 2** (fases E y F), junto con la participación en HU-10, HU-12 y HU-13 (~15 h).

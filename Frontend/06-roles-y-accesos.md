# Documento 6. Roles y accesos

## Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá

---

## 6.1. Objetivo

Definir quién accede al sistema, a qué puede acceder y bajo qué reglas: roles de usuario, permisos por pantalla, por API y por tipo de dato, junto con las reglas de autenticación, auditoría y prohibiciones aplicables.

El sistema pertenece al **bufete de abogados**: el despacho adquiere el producto y es el **responsable del tratamiento** de los datos personales de sus clientes (Ley 81 de 2019 y Decreto Ejecutivo 285 de 2021). El portal `P-*` es el canal del **cliente del bufete** (titular), que puede actuar por sí mismo o mediante representación acreditada por su abogado; el módulo interno `I-*` es el entorno de trabajo del despacho.

Este documento es la referencia de implementación de la autorización (HU-13, `TASK-13.1`: *matriz rol × endpoint × operación*) y de las pruebas de acceso permitido y denegado (CP-01, CP-02, CP-03, CP-04, CP-09, CP-12, CP-13, CP-14).

### Fuentes de este documento

| Fuente                                                      | Aporta                                                                                                                                                   |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `03-plan-de-desarrollo.md` (3.6, 3.7)                       | Endpoints, controles por endpoint y reglas de negocio de acceso.                                                                                         |
| `01-propuesta-de-arquitectura.md` (1.6)                     | Controles mínimos de seguridad y protección de datos (Ley 81 de 2019).                                                                                   |
| `05-backlog-siete-sprints.md` (HU-12, HU-13, HU-22)         | Roles técnicos del sistema, pruebas de autorización y auditoría.                                                                                         |
| `04-plan-de-pruebas.md` (CP-01…CP-14)                       | Casos de prueba asociados al control de acceso.                                                                                                          |
| `Ley 81 de 2019`                                            | Base legal del modelo de acceso y tratamiento: consentimiento informado, derechos ARCO, finalidad, minimización, conservación, seguridad y bitácora.     |
| `Decreto Ejecutivo 285 de 2021`                             | Consentimiento informado y **consentimiento expreso** para datos sensibles; reglamenta la Ley 81 de 2019.                                                |
| `Pantallas_y_Datos_Migracion.md` (1.2, I-15, I-16, 7.3)     | Roles de negocio, permisos granulares, bitácora y reglas de seguridad.                                                                                   |

**Inventario oficial de pantallas adoptado:** 45 pantallas (portal `P-01` … `P-27`, canal del **cliente del bufete**, + módulo interno `I-01` … `I-18`, módulo interno del despacho) según `Pantallas_y_Datos_Migracion.md`; adopción registrada en el backlog (registro de cambios).

---

## 6.2. Principios de acceso

1. **Mínimo privilegio:** cada rol recibe solo los permisos estrictamente necesarios para su función.
2. **Titularidad:** el cliente (titular) solo accede a sus propios expedientes y documentos; su abogado opera con representación acreditada.
3. **Verificación en el servidor:** toda regla de acceso se valida en el backend; la interfaz solo oculta lo que el servidor rechazará (nunca es la única barrera).
4. **Separación técnico–funcional:** el administrador técnico de la plataforma no obtiene por ello permisos para consultar o decidir expedientes (Documento 3.7, regla 4).
5. **Finalidad y minimización:** las verificaciones sobre fuentes externas solo se realizan con consentimiento o autorización del titular, finalidad declarada y datos mínimos; la plataforma guarda únicamente el resultado de la verificación (fuente, fecha, resultado y responsable).
6. **Trazabilidad:** todo acceso y operación crítica genera evento de auditoría; la propia consulta de auditoría también queda registrada.
7. **Sin acceso masivo:** el sistema no permite consultar datos de personas sin un expediente asociado.
8. **Protección de datos personales:** diseño conforme a la Ley 81 de 2019 y el Decreto Ejecutivo 285 de 2021, con validación jurídica según finalidad y competencia institucional.

---

## 6.3. Roles del sistema

### 6.3.1. Roles técnicos (backlog)

| Código            | Rol                                                                           | Módulo principal                        | Descripción                                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `SOLICITANTE`     | Cliente del bufete (titular)                                                  | Portal del cliente del bufete (P-*)     | Crea, documenta y consulta sus propios expedientes; opera con consentimiento informado vigente o mediante representación acreditada.     |
| `FUNCIONARIO`     | Personal del bufete (recepción, abogado analista, asistente, notificador)     | Módulo interno (I-*)                    | Tramita expedientes dentro de su ámbito y permisos granulares.                                                                           |
| `SUPERVISOR`      | Socio director / coordinador (supervisión y reportes)                         | Módulo interno (I-*)                    | Supervisa tiempos, volúmenes y estados; lectura amplia y reportes.                                                                       |
| `AUDITOR`         | Auditoría del despacho (interna o externa)                                    | Bitácora y reportes                     | Consulta eventos y reportes en modo solo lectura; no edita expedientes.                                                                  |
| `ADMIN`           | Administrador del bufete (catálogos, usuarios y permisos)                     | Administración (I-14, I-15, I-18)       | Mantiene catálogos, usuarios y permisos; sin acceso a decidir expedientes.                                                               |

### 6.3.2. Correspondencia con los roles de negocio

Los roles de `Pantallas_y_Datos_Migracion.md` (sección 1.2) se agrupan en los cinco roles técnicos, traducidos al contexto del bufete:

| Rol de negocio                                                       | Rol técnico                                       | Permiso granular típico (I-15)                                |
| -------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| Cliente del bufete (titular)                                         | `SOLICITANTE`                                     | Crear y consultar sus solicitudes                             |
| Abogado del despacho que representa al cliente en el sistema         | `SOLICITANTE` (con representación acreditada)     | Presenta en nombre de un titular con poder notariado          |
| Representante legal (padre/madre, empleador, entidad)                | `SOLICITANTE` (con representación acreditada)     | Presenta por menores o personas jurídicas                     |
| Recepción del bufete                                                 | `FUNCIONARIO`                                     | `consultar`, `verificar`, `observar`                          |
| Abogado analista del bufete                                          | `FUNCIONARIO`                                     | `consultar`, `verificar`, `observar`, proponer resolución     |
| Abogado resolutor (socio / coordinador del despacho)                 | `FUNCIONARIO` (permiso `resolver`)                | `consultar`, `resolver`                                       |
| Notificador / ventanilla del bufete                                  | `FUNCIONARIO` (permiso `notificar`)               | `consultar`, `notificar`                                      |
| Administrador del bufete (catálogos y usuarios)                      | `ADMIN`                                           | Administrar catálogos y usuarios                              |
| Auditoría del despacho (interna o externa)                           | `AUDITOR`                                         | `consultar` bitácoras y reportes (solo lectura)               |
| Socio director / coordinador (supervisión de tiempos y reportes)     | `SUPERVISOR`                                      | `consultar` reportes y estadísticas                           |

**Regla de consentimiento:** el cliente del bufete solo puede operar en el sistema con **consentimiento informado vigente** (Ley 81 de 2019 y Decreto Ejecutivo 285 de 2021); para datos sensibles (salud, antecedentes) se exige **consentimiento expreso** registrado. El abogado con **representación acreditada** opera en nombre del titular y queda registrado como responsable de la operación.

**Regla de composición:** un `FUNCIONARIO` solo tiene los permisos granulares que `ADMIN` (o el responsable autorizado) le asigne en I-15, además de las fuentes de verificación habilitadas para consultar (mínimo necesario por finalidad).

---

## 6.4. Acceso a pantallas

El acceso se describe sobre el inventario oficial de 45 pantallas (portal `P-01` … `P-27`, canal del cliente del bufete, + módulo interno `I-01` … `I-18`, módulo del despacho); las matrices por rol que siguen son la referencia para los *guards* de interfaz, siendo el backend la validación real de autorización.

### Portal del cliente del bufete (`P-01` … `P-27`)

| Rol                                  | Pantallas                                         | Condición                                                                                                                                  |
| ------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `SOLICITANTE`                        | Todas las `P-*`                                   | Siempre limitado a **sus** solicitudes y datos; las pantallas de servicios (P-25, P-27) son consultivas.                                   |
| `SOLICITANTE` con representación     | `P-01` … `P-27` en nombre del titular             | Solo con poder/representación acreditada (P-08) por el abogado del despacho; el titular ve también lo presentado por su representante.     |
| `FUNCIONARIO`                        | Sin acceso al portal como usuario del cliente     | Su acceso es al módulo interno del despacho (`I-*`).                                                                                       |
| `SUPERVISOR`, `AUDITOR`, `ADMIN`     | Sin acceso al portal como usuario del cliente     | Excepción: vistas de consulta interna equivalente, no como cliente.                                                                        |

### Módulo interno (`I-01` … `I-18`)

| Rol técnico                               | Pantallas internas                                                                                                | Permiso                                                                |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `FUNCIONARIO` — Recepción                 | I-01, I-02, I-03, I-04, I-05, I-08 (emisión), I-11                                                                | Según granularidad asignada                                            |
| `FUNCIONARIO` — Abogado analista          | I-01, I-02, I-03–I-10 (análisis, verificación interoperable, observaciones, edictos, propuesta de resolución)     | `consultar`, `verificar`, `observar`                                   |
| `FUNCIONARIO` — Abogado resolutor         | I-01, I-02, I-06, I-07, I-10 (aprobar/negar)                                                                      | `resolver` (único rol que decide)                                      |
| `FUNCIONARIO` — Notificador               | I-01, I-02, I-11, I-12, I-13 (lectura)                                                                            | `notificar`                                                            |
| `SUPERVISOR`                              | I-01, I-02, I-17 (reportes), I-18 (salud de conexiones), lectura de expedientes de su ámbito                      | Solo lectura + supervisión                                             |
| `AUDITOR`                                 | I-01, I-16 (bitácora), I-17 (reportes), I-18 (lectura)                                                            | **Solo lectura**; explícitamente sin edición de expedientes            |
| `ADMIN`                                   | I-01, I-14 (catálogos), I-15 (usuarios, roles y permisos), I-18 (conexiones)                                      | Administración; **sin acceso a resolver ni a decidir expedientes**     |

**Detalle de la pantalla de administración de accesos (I-15):** cada usuario interno tiene nombre, cédula, cargo y sección; rol; permisos granulares (consultar, verificar, observar, resolver, notificar); fuentes de verificación habilitadas para consultar; vigencia y estado de la cuenta; último acceso automático.

---

## 6.5. Acceso a la API REST

Matriz de referencia (Documento 3.6). `✔` permitido · `✗` denegado · `◐` condicionado (titularidad, permiso granular o transición válida).

| Método y endpoint                               | SOLICITANTE             | FUNCIONARIO                                    | SUPERVISOR        | AUDITOR                        | ADMIN     | Control principal                                                     |
| ----------------------------------------------- | ----------------------- | ---------------------------------------------- | ----------------- | ------------------------------ | --------- | --------------------------------------------------------------------- |
| `POST /api/auth/login`                          | ✔                       | ✔                                              | ✔                 | ✔                              | ✔         | Credenciales + límite de intentos (CP-01, CP-02)                      |
| `GET /api/expedientes`                          | ◐ (suyos)               | ◐ (su ámbito)                                  | ◐ (su ámbito)     | ◐ (lectura para auditoría)     | ✗         | Filtrado por rol y titularidad                                        |
| `POST /api/expedientes`                         | ✔                       | ✗                                              | ✗                 | ✗                              | ✗         | Campos obligatorios y permiso de creación                             |
| `GET /api/expedientes/{id}`                     | ◐ (propios)             | ◐ (ámbito)                                     | ◐ (ámbito)        | ◐ (lectura)                    | ✗         | Verificación de acceso; ajeno → 404/403 (CP-03)                       |
| `PATCH /api/expedientes/{id}/estado`            | ✗                       | ◐ (permiso `resolver` + transición válida)     | ✗                 | ✗                              | ✗         | Matriz de transiciones y prerrequisitos (CP-04)                       |
| `GET /api/expedientes/{id}/documentos`          | ◐ (propios)             | ◐ (ámbito)                                     | ◐ (ámbito)        | ◐ (metadatos)                  | ✗         | Permisos del expediente                                               |
| `POST /api/expedientes/{id}/documentos`         | ✔ (propios)             | ◐ (si su función lo requiere)                  | ✗                 | ✗                              | ✗         | Tipo, tamaño, contenido y autorización (CP-05)                        |
| `POST /api/expedientes/{id}/verificaciones`     | ✗                       | ◐ (permiso `verificar`)                        | ✗                 | ✗                              | ✗         | Finalidad, consentimiento del titular y permiso de verificación       |
| `GET /api/expedientes/{id}/verificaciones`      | ◐ (estado agregado)     | ✔ (ámbito)                                     | ✔ (ámbito)        | ✔ (trazabilidad)               | ✗         | Acceso restringido y minimización; solo resultado de verificación     |
| `GET /api/expedientes/{id}/historial`           | ◐ (suyos)               | ✔ (ámbito)                                     | ✔ (ámbito)        | ✔                              | ✗         | Permiso específico de lectura (CP-09)                                 |

**Notas:**

* `ADMIN` no tiene acceso por defecto a expedientes; si una función de administración lo requiere, debe ser un permiso explícito, temporizado y auditado.
* El estado inicial del expediente se produce en la creación/envío (`POST`); el cliente (titular) no cambia estados vía `PATCH`.
* Toda denegación genera evento de auditoría (HU-22).
* Las verificaciones se ejecutan en **modo manual asistido** sobre fuentes externas; no existe integración automática con instituciones en el alcance actual (la capa de adaptadores queda preparada para un futuro convenio autorizado).

### Códigos de respuesta asociados

| Código     | Significado en control de acceso                                         |
| ---------- | ------------------------------------------------------------------------ |
| `400`      | Entrada inválida (campos obligatorios, formato).                         |
| `401`      | Sin autenticación o credenciales inválidas.                              |
| `403`      | Autenticado pero sin permiso para la operación.                          |
| `404`      | Recurso inexistente **o que no debe revelarse** (expediente ajeno).      |
| `409`      | Conflicto de estado (transición no válida).                              |
| `5xx`      | Fallo interno o de dependencia (nunca un resultado de verificación).     |

---

## 6.6. Acceso a datos y documentos

| Dato / recurso                                                                                          | Quién accede                                                                                                                       | Límite                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Datos personales del titular (cliente del bufete)                                                       | El titular y su abogado con representación acreditada; personal del bufete con `verificar`/`resolver` en ese expediente            | Solo los campos necesarios para el trámite (minimización)                                                                                                               |
| Documentos adjuntos                                                                                     | Titular, representante acreditado, personal del ámbito, auditoría (metadatos)                                                      | Descarga solo autenticada; **sin enlaces públicos** (Documento 3.7, regla 9); descarga auditada (CP-12)                                                                 |
| Resultados de verificación externa                                                                      | Personal del bufete con `verificar`/`resolver`, supervisor y auditoría del expediente                                              | Solo se conserva el resultado mínimo (fuente, fecha, resultado y responsable); **sin copias de documentos ni datos de la fuente**; el cliente ve el estado agregado     |
| Consentimientos del titular                                                                             | El cliente ve los suyos; el personal del bufete los gestiona (registro, vigencia y revocación); la auditoría consulta              | Solo el consentimiento vigente habilita el tratamiento; expreso para datos sensibles (Ley 81 y DE 285 de 2021)                                                          |
| Solicitudes ARCO                                                                                        | El cliente las crea; el personal del bufete las atiende en plazo; la auditoría consulta                                            | Registro, trazabilidad y cierre de cada solicitud de acceso, rectificación o supresión                                                                                  |
| Historial y observaciones                                                                               | Titular (las suyas), personal del ámbito, auditoría                                                                                | Proyección por rol; sin notas internas restringidas                                                                                                                     |
| Bitácora de auditoría (I-16)                                                                            | `AUDITOR` (solo lectura); consulta de reportes para `SUPERVISOR`                                                                   | Inmutable; la consulta de la bitácora también se registla                                                                                                               |
| Catálogos y usuarios (I-14, I-15)                                                                       | `ADMIN`                                                                                                                            | Alta/baja y vigencia; conservando versiones anteriores de requisitos                                                                                                    |
| Datos de fuentes externas (cédula TE, Registro Público; datos sensibles con consentimiento expreso)     | Verificación manual asistida por el personal del bufete, con consentimiento o autorización del titular, expediente y finalidad     | Sin integración automática en el MVP; sin consulta masiva; cada verificación registrada (fuente, dato, usuario, expediente, fecha y responsable)                        |
| Configuración y secretos                                                                                | `ADMIN`/DevOps por variables de entorno                                                                                            | Nunca en el código ni en la interfaz                                                                                                                                    |

---

## 6.7. Reglas de autenticación

| Regla                                                                   | Aplicación                       | Referencia            |
| ----------------------------------------------------------------------- | -------------------------------- | --------------------- |
| Autenticación con credenciales y hash adaptativo (BCrypt/Argon2)        | Todos los roles                  | HU-12                 |
| Límite de intentos con bloqueo temporal y mensaje genérico              | Todos                            | CP-02                 |
| MFA obligatorio en el módulo interno (I-01)                             | Roles internos                   | `Pantallas…` 7.3      |
| Verificación de identidad por OTP en el portal (P-03)                   | Cliente del bufete (titular)     | `Pantallas…` P-03     |
| Recuperación de contraseña con mensaje neutro (P-04)                    | Todos                            | HU-02                 |
| Sesiones con expiración; cierre de sesión que invalida token/sesión     | Todos                            | HU-12                 |
| Política de complejidad y cambio obligatorio de contraseña              | Todos                            | HU-12                 |
| Gestión de vigencia, estado y último acceso de cuentas (I-15)           | `ADMIN`                          | `Pantallas…` I-15     |
| Secretos de configuración fuera del código fuente                       | Entorno                          | Documento 3.8         |

---

## 6.8. Auditoría de accesos

Quedan registrados (HU-22, I-16), como mínimo:

1. Inicio y cierre de sesión, intentos fallidos y bloqueos.
2. Alta, modificación y baja de usuarios, roles y permisos (I-15).
3. Creación, consulta sensible, cambio de estado y eliminación de expedientes.
4. Carga, consulta y descarga de documentos.
5. Verificaciones sobre fuentes externas: fuente, dato verificado, usuario, expediente, fecha, finalidad y responsable.
6. Exportaciones de reportes y de bitácora.
7. Operaciones administrativas (catálogos, conexiones, usuarios).
8. Toda denegación de acceso (`403`/`404` por autorización).
9. Registro, modificación y revocación de **consentimientos** (consentimiento informado y consentimiento expreso para datos sensibles): titular, finalidad, fecha, responsable y estado de vigencia.
10. Ejercicio de **derechos ARCO** (acceso, rectificación, cancelación/supresión y oposición): solicitud, fechas de apertura y cierre, responsable y resolución aplicada.
11. **Tratamiento de datos sensibles** (salud, antecedentes): registro del consentimiento expreso previo, finalidad declarada y responsable del tratamiento.

**Protección:** registros inmutables, accesibles solo en lectura por `AUDITOR`; sin contraseñas, tokens ni datos personales innecesarios en los logs; retención según obligaciones legales.

---

## 6.9. Prohibiciones explícitas

1. **No** otorgar permisos de consulta o decisión de expedientes al rol `ADMIN` por ser administrador técnico.
2. **No** publicar documentos mediante enlaces públicos sin protección.
3. **No** permitir consultas de personas sin expediente asociado (sin consulta masiva).
4. **No** almacenar contraseñas, tokens ni datos personales innecesarios en logs.
5. **No** editar ni eliminar registros de la bitácora de auditoría desde la aplicación.
6. **No** usar datos personales reales en pruebas sin autorización y medidas de protección adecuadas.
7. **No** interpretar un error técnico de integración como un resultado negativo de una verificación.
8. **No** conceder permisos granulares permanentes a fuentes de verificación: se asignan por finalidad y se revisan periódicamente (mínimo necesario).
9. **No** prometer ni simular acceso automático a datos de instituciones: mientras no exista convenio autorizado, la verificación es manual asistida y las instituciones no son socios con APIs.
10. **No** tratar datos sensibles (salud, antecedentes) sin **consentimiento expreso** registrado previamente (Ley 81 de 2019 y DE 285 de 2021).

---

## 6.10. Ciclo de vida y revisión de los accesos

| Momento                                               | Acción                                                               | Responsable                              |
| ----------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| Alta de usuario                                       | Asignación de rol y permisos granulares con vigencia                 | `ADMIN`                                  |
| Cambio de función                                     | Revisión inmediata de permisos (alta y baja en el mismo proceso)     | `ADMIN`                                  |
| Periodo definido (p. ej. trimestral)                  | Revisión de permisos vigentes y cuentas inactivas                    | `ADMIN` con `AUDITOR`                    |
| Baja o inactividad                                    | Deshabilitación de cuenta conservando la auditoría                   | `ADMIN`                                  |
| Asignación de fuentes de verificación habilitadas     | Solo por finalidad y con base legal verificada                       | `ADMIN` con responsable de seguridad     |

---

## 6.11. Pruebas asociadas

| Caso      | Qué verifica                                                                          | Rol relevante                               |
| --------- | ------------------------------------------------------------------------------------- | ------------------------------------------- |
| CP-01     | Credenciales válidas → acceso solo a las funciones del rol                            | Todos                                       |
| CP-02     | Credenciales inválidas → rechazo sin revelar detalles                                 | Todos                                       |
| CP-03     | Expediente ajeno → acceso bloqueado                                                   | `SOLICITANTE`                               |
| CP-04     | Transición no permitida → rechazo con estado conservado                               | `FUNCIONARIO`                               |
| CP-09     | Historial/auditoría → solo roles autorizados ven los eventos permitidos               | `AUDITOR`, `SUPERVISOR`                     |
| CP-12     | Archivo protegido → descarga denegada sin autorización                                | Todos                                       |
| CP-13     | Cliente sin consentimiento vigente → se aplica la regla legal y queda evidenciado     | `SOLICITANTE`, `AUDITOR`                    |
| CP-14     | Derecho ARCO → solicitud registrada, atendida en plazo y trazada                      | `SOLICITANTE`, `FUNCIONARIO`, `AUDITOR`     |

**Suite de referencia:** `TASK-13.4` (pruebas de autorización permitido/denegado por rol × endpoint) y `TASK-22.5` (cobertura de auditoría de accesos).

---

## 6.12. Roles del equipo de proyecto (accesos técnicos)

No confundir con los roles del sistema. Este es el acceso del equipo al repositorio y a los entornos. El **Product Owner** representa las necesidades del despacho (cliente del producto):

| Rol del equipo                 | Repositorio (Git)               | Entorno de desarrollo     | Entorno de pruebas                | Datos         | Aceptación de historias     |
| ------------------------------ | ------------------------------- | ------------------------- | --------------------------------- | ------------- | --------------------------- |
| Product Owner (PO)             | Lectura                         | Demostración              | Consulta                          | Ficticios     | **Acepta o rechaza**        |
| Líder técnico / arquitecto     | Escritura + revisión            | Total                     | Total                             | Ficticios     | Revisión técnica            |
| Desarrollador backend          | Escritura + revisión            | Total (backend/DB)        | Total                             | Ficticios     | —                           |
| Desarrollador frontend         | Escritura + revisión            | Total (frontend)          | Total                             | Ficticios     | —                           |
| QA / seguridad                 | Escritura (scripts y casos)     | Total                     | **Total (dueño del entorno)**     | Ficticios     | Verifica CP                 |
| DevOps                         | Escritura (infra/CI)            | Total                     | Total                             | Ficticios     | —                           |
| Documentación                  | Escritura (docs)                | Consulta                  | Consulta                          | Ficticios     | —                           |

**Reglas comunes del equipo:** sin credenciales compartidas; acceso por cuenta individual; los datos personales reales están prohibidos en todos los entornos de prueba; no existe entorno de producción en el alcance del MVP (Documento 3.8).

---

## 6.13. Pendientes por confirmar

**Resuelto:** el inventario oficial adoptado es el de 45 pantallas (portal `P-01` … `P-27` + módulo interno `I-01` … `I-18`, esquema `P-`/`I-`); el backlog fue actualizado (registro de cambios). Mantener este documento alineado si el inventario cambia.

1. **Correspondencia final de roles de negocio → roles técnicos:** confirmar con el PO si `SUPERVISOR` es un rol separado o una attribución de `FUNCIONARIO` con reportes.
2. **MFA en el portal:** definir si OTP (P-03) es solo verificación de identidad o también factor de autenticación obligatorio.
3. **Permisos granulares permanentes:** definir plazos de revisión de las fuentes de verificación habilitadas para consultar (I-15).
4. **Validación jurídica:** la aplicación concreta de estos accesos debe validarse según finalidad, tipo de dato y competencia institucional (Ley 81 de 2019 y su reglamentación).
5. **Consentimiento y ARCO:** validación jurídica del modelo de consentimiento (informado y expreso) y del flujo de derechos ARCO con abogado local.
6. **Alojamiento de datos:** definir la jurisdicción de alojamiento (preferiblemente panameña) y el acuerdo de tratamiento de datos con el proveedor de hosting.

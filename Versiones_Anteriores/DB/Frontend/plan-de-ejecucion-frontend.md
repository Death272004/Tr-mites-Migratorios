# PLAN DE EJECUCIÓN FRONTEND — CHECKLIST POR PANTALLA

**Proyecto:** Producto comercial de gestión de expedientes migratorios para **bufetes de abogados** (Panamá, Ley 81 de 2019)
**Rama:** Frontend (HTML / CSS / JavaScript puro)
**Inventario oficial:** 45 pantallas — portal del cliente del bufete **P-01…P-27** + módulo interno del despacho **I-01…I-18**
**Sprint 1:** portal en 4 fases (A–D, ≈ 130 h, sin backend: fixtures locales) · **Sprint 2:** módulo interno en fases E y F
**Documentos fuente:** `Pantallas_y_Datos_Migracion.md` (campos), `Rama-01-Frontend.md` (fases, convenciones, DoD), `Documentacion/06-roles-y-accesos.md` (roles y acceso)

---

## §1. Propósito

Este documento es un **checklist ejecutable por pantalla**: cada una de las 45 pantallas del inventario tiene una subsección con objetivo, rol dueño, campos exactos clasificados, reglas aplicables, estados visibles, fixture y nota de integración. Un programador debe poder construir la pantalla directamente a partir de aquí, sin inventar campos ni decisiones.

Reglas de lectura:

1. **Fuente de verdad de los campos:** `Pantallas_y_Datos_Migracion.md`. Si un dato no aparece allí, este plan escribe **POR DEFINIR (PO)** en lugar de inventarlo. Nunca se agregan campos que la fuente no pide (minimización, Ley 81).
2. **Numeración exacta:** se conserva `P-01…P-27` e `I-01…I-18` tal como los fija el inventario adoptado (45 pantallas).
3. **Vocabulario del bufete** (el documento fuente usa vocabulario de la administración pública; aquí se traduce sin alterar los campos):

| Vocabulario de la fuente | Vocabulario del producto (bufete) |
|---|---|
| Ciudadano / extranjero titular | **Cliente del bufete** (titular del trámite) |
| Portal ciudadano | **Portal del cliente del bufete** (`P-*`) |
| SNM / funcionario / ventanilla | **Despacho** / personal del despacho / **módulo interno** (`I-*`) |
| Verificación interinstitucional (TE, CSS, Registro Público, MITRADEL/DGI) | **Verificación externa** (fuente externa) |
| Apoderado / representante legal | Abogado del despacho o tercero con **representación acreditada** (P-08) |
| Expediente / trámite del SNM | **Expediente del bufete** (mismos estados y campos) |

4. **Etiquetas de campos** (usadas en todos los checklists):

| Etiqueta | Significado | Comportamiento en el MVP (Sprint 1) |
|---|---|---|
| **[C]** | Captura manual del cliente (origen `D` de la fuente) o archivo subido (origen `U`) | Se digita / se sube; validación en cliente |
| **[V]** | Verificación automática (origen `A` de la fuente) — **futuro convenio** | **Bloqueada para carga manual**; se muestra sellada: *verificado automáticamente · fuente · fecha · estado*; en el MVP el estado es **"pendiente de verificación automática (futuro convenio)"** y el resultado lo registra el abogado en **I-07 (modo manual asistido)** |
| **[D]** | Derivado: viene de otra pantalla, de una entidad/ente o se autogenera | Solo lectura; se hereda o se calcula |

---

## §2. Convenciones comunes a TODAS las pantallas

### §2.1 Enrutado hash y guards por rol

* Rutas con **hash** (`#/ruta`), sin recargas completas; ninguna vista llama a `fetch` suelto: todo pasa por el módulo único de servicios HTTP (TASK-09.1).
* **Guard por rol** en cada ruta con los cinco roles técnicos: `SOLICITANTE` (cliente del bufete), `FUNCIONARIO` (personal del despacho), `SUPERVISOR` (socio director / coordinador), `AUDITOR`, `ADMIN`.
* Sin sesión válida → redirige a `#/login` (portal) o `#/interno/login` (módulo interno).
* Sesión válida sin permiso → vista global `#/error/403`.
* Ruta inexistente → `#/error/404`; fallo de servicio → `#/error/500`.
* Acciones no permitidas por el rol: **no se muestran** o se muestran deshabilitadas con explicación (la validación real siempre es del backend).
* Rutas iniciales por rol (propuesta, POR DEFINIR (PO) si el PO desea otra):

| Rol | Ruta inicial propuesta | Pantalla |
|---|---|---|
| `SOLICITANTE` | `#/mis-tramites` | P-06 |
| `FUNCIONARIO` | `#/interno/tablero` | I-02 |
| `SUPERVISOR` | `#/interno/reportes` | I-17 |
| `AUDITOR` | `#/interno/bitacora` | I-16 |
| `ADMIN` | `#/interno/catalogos` | I-14 |

* Acceso según `06-roles-y-accesos.md` §6.4: el `SOLICITANTE` solo ve **sus** expedientes (expediente ajeno → 404/403, CP-03); `FUNCIONARIO`, `SUPERVISOR`, `AUDITOR` y `ADMIN` **no** operan el portal como clientes (excepción: vistas de consulta interna equivalente); `ADMIN` no decide expedientes.

### §2.2 Los 4 estados obligatorios por pantalla

Toda pantalla implementa y muestra los cuatro estados, con selector de escenarios locales en la demostración:

1. **Carga** — spinner / bloque de esqueleto.
2. **Éxito** — contenido con datos del fixture.
3. **Vacío** — mensaje accionable (p. ej. "aún no tiene solicitudes" + botón Nueva solicitud).
4. **Error** — mensaje en lenguaje no técnico, **sin datos personales**, con botón **Reintentar** y sin exponer detalles técnicos (traducción de 401/403/404/409/5xx a texto de usuario).

### §2.3 Campos de verificación automática (futuro convenio)

* Todo campo etiquetado **[V]** se renderiza **bloqueado**: el cliente no puede escribirlo ni subir ese documento.
* Sello visible: `verificado automáticamente · fuente {TE | CSS | Registro Público | SNM | MITRADEL/DGI} · fecha AAAA-MM-DD · estado`.
* En el MVP el estado mostrado es **"pendiente de verificación automática (futuro convenio)"**; el despacho registra el resultado real en **I-07** (fuente, tipo, modo, fecha, resultado, referencia, responsable — modo manual asistido) y el portal solo refleja ese resultado.
* Única acción del cliente: **pedir forzar la revisión manual** (regla de P-14).
* Si la fuente no responde, el requisito vuelve al checklist del cliente como carga manual, con aviso y reintentos (regla 2 de interoperabilidad de la fuente).

### §2.4 Seguridad y Ley 81 de 2019

* **Sin credenciales, tokens ni secretos en el cliente**; datos reales prohibidos; solo fixtures ficticios.
* **OTP de P-03 y MFA de I-01 simulados** en el MVP (sin envío real de correo/SMS).
* Minimización: solo los campos que el trámite exige legalmente.
* Autorización de tratamiento de datos explícita en **P-02** y **P-16**; consentimiento informado y formulario de derechos ARCO se añaden en el Sprint 3 (espacio reservado en P-02/P-16 y en servicios); ejercicio de ARCO canalizado desde **P-27**.
* Bitácora (I-16): toda verificación externa y toda denegación quedan registradas; los mensajes de la UI no filtran datos personales.

### §2.5 Fixtures locales

* Una fixture por pantalla en `js/fixtures/`, con **el mismo esquema JSON que los mocks de la HU-08** (pasar de fixtures a mocks no debe exigir reescribir vistas).
* Nomenclatura propuesta: `js/fixtures/<id-en-minúsculas>-<slug>.json`, con variantes de escenario `<id>-<slug>.carga.json`, `.exito.json`, `.vacio.json`, `.error.json` (selector de escenarios de la Fase A).
* Si el esquema exacto de los mocks de la HU-08 aún no está publicado: **POR DEFINIR (PO / HU-08)** — se toma el esquema publicado sin desviarlo.

---

## §3. Tabla-resumen maestra (45 pantallas)

**Fase** = fase de construcción; **todas descansan sobre la Fase A** (transversal, HU-01). Fases: A = andamiaje · B = acceso P-01…P-05 · C = bandeja/asistente P-06…P-18 · D = seguimiento/servicios P-19…P-27 · E = operación I-01…I-13 · F = administración I-14…I-18.
**Estado:** `CONSTRUIR` · `POR CONFIRMAR` (P-15 pagos sin pasarela, P-18 cita, P-24 edictos, P-25 certificaciones — pendientes §8 de la fuente; se construyen en modo mínimo según HU-03/HU-04).

| ID | Pantalla | Fase | Ruta hash propuesta | Rol dueño | Estado |
|---|---|---|---|---|---|
| P-01 | Inicio de sesión | B | `#/login` | SOLICITANTE (público) | CONSTRUIR |
| P-02 | Registro de cuenta | B | `#/registro` | SOLICITANTE (público) | CONSTRUIR |
| P-03 | Verificación de identidad (OTP) | B | `#/identidad/otp` | SOLICITANTE (público) | CONSTRUIR |
| P-04 | Recuperación de contraseña | B | `#/recuperar-clave` | SOLICITANTE (público) | CONSTRUIR |
| P-05 | Mi perfil / datos de contacto | B | `#/perfil` | SOLICITANTE | CONSTRUIR |
| P-06 | Mis trámites (bandeja) | C | `#/mis-tramites` | SOLICITANTE | CONSTRUIR |
| P-07 | Nueva solicitud — selección de trámite | C | `#/solicitud/tramite` | SOLICITANTE | CONSTRUIR |
| P-08 | Titularidad y representación | C | `#/solicitud/titularidad` | SOLICITANTE | CONSTRUIR |
| P-09 | Paso 1 — Datos personales | C | `#/solicitud/paso-1` | SOLICITANTE | CONSTRUIR |
| P-10 | Paso 2 — Pasaporte e historial migratorio | C | `#/solicitud/paso-2` | SOLICITANTE | CONSTRUIR |
| P-11 | Paso 3 — Domicilio y notificaciones | C | `#/solicitud/paso-3` | SOLICITANTE | CONSTRUIR |
| P-12 | Paso 4 — Situación laboral, económica o de vínculos | C | `#/solicitud/paso-4` | SOLICITANTE | CONSTRUIR |
| P-13 | Paso 5 — Dependientes | C | `#/solicitud/paso-5` | SOLICITANTE | CONSTRUIR |
| P-14 | Paso 6 — Requisitos y carga de documentos | C | `#/solicitud/paso-6` | SOLICITANTE | CONSTRUIR |
| P-15 | Paso 7 — Pagos y tasas | C | `#/solicitud/paso-7` | SOLICITANTE | **POR CONFIRMAR** (§8.3: ¿pago en línea o cheque?) |
| P-16 | Paso 8 — Declaración jurada y firma | C | `#/solicitud/paso-8` | SOLICITANTE | CONSTRUIR |
| P-17 | Resumen y envío | C | `#/solicitud/resumen` | SOLICITANTE | CONSTRUIR |
| P-18 | Reserva de cita | C | `#/solicitud/cita` | SOLICITANTE | **POR CONFIRMAR** (§8.4: cobertura de ventanilla) |
| P-19 | Estado del trámite (línea de tiempo) | D | `#/seguimiento/estado` | SOLICITANTE | CONSTRUIR |
| P-20 | Observaciones y notificaciones | D | `#/seguimiento/observaciones` | SOLICITANTE | CONSTRUIR |
| P-21 | Subsanación (corrección del expediente) | D | `#/seguimiento/subsanacion` | SOLICITANTE | CONSTRUIR |
| P-22 | Resultados: resoluciones, carné digital, certificados | D | `#/seguimiento/resultados` | SOLICITANTE | CONSTRUIR |
| P-23 | Historial de pagos | D | `#/seguimiento/pagos` | SOLICITANTE | CONSTRUIR |
| P-24 | Edictos y citaciones | D | `#/seguimiento/edictos` | SOLICITANTE | **POR CONFIRMAR** (HU-04 CA-7: modo consulta mínimo) |
| P-25 | Certificaciones en línea | D | `#/servicios/certificaciones` | SOLICITANTE | **POR CONFIRMAR** (HU-04 CA-7: modo consulta mínimo) |
| P-26 | Naturalización — flujo específico (N-1…N-13) | D | `#/servicios/naturalizacion` | SOLICITANTE (con abogado) | CONSTRUIR |
| P-27 | Ayuda, FAQ y peticiones | D | `#/servicios/ayuda` | SOLICITANTE | CONSTRUIR |
| I-01 | Login institucional con MFA | E | `#/interno/login` | Todos los roles internos (público) | CONSTRUIR |
| I-02 | Tablero de gestión | E | `#/interno/tablero` | FUNCIONARIO (SUPERVISOR/AUDITOR en lectura) | CONSTRUIR |
| I-03 | Bandeja de recepción (citas y turnos) | E | `#/interno/recepcion` | FUNCIONARIO (recepción) | CONSTRUIR |
| I-04 | Recepción y verificación de completitud | E | `#/interno/completitud` | FUNCIONARIO (recepción) | CONSTRUIR |
| I-05 | Asignación de analista | E | `#/interno/asignacion` | FUNCIONARIO (recepción / supervisor de mesa) | CONSTRUIR |
| I-06 | Análisis del expediente (checklist) | E | `#/interno/analisis` | FUNCIONARIO (abogado analista) | CONSTRUIR |
| I-07 | Panel de verificación interoperable | E | `#/interno/verificaciones` | FUNCIONARIO con permiso `verificar` | CONSTRUIR |
| I-08 | Emisión y atención de observaciones | E | `#/interno/observaciones` | FUNCIONARIO (recepción y analista) | CONSTRUIR |
| I-09 | Edictos y publicaciones | E | `#/interno/edictos` | FUNCIONARIO (analista) | CONSTRUIR |
| I-10 | Resolución (aprobar / negar) | E | `#/interno/resolucion` | FUNCIONARIO con permiso `resolver` | CONSTRUIR |
| I-11 | Notificación | E | `#/interno/notificacion` | FUNCIONARIO (notificador) | CONSTRUIR |
| I-12 | Entrega en ventanilla | E | `#/interno/entrega` | FUNCIONARIO (notificador / ventanilla) | CONSTRUIR |
| I-13 | Expedientes archivados y reactivación | E | `#/interno/archivo` | FUNCIONARIO (notificador, lectura); ver detalle I-13 | CONSTRUIR |
| I-14 | Catálogos: trámites, requisitos, tasas y vigencias | F | `#/interno/catalogos` | ADMIN | CONSTRUIR |
| I-15 | Usuarios, roles y permisos | F | `#/interno/usuarios` | ADMIN | CONSTRUIR |
| I-16 | Bitácora de auditoría | F | `#/interno/bitacora` | AUDITOR (solo lectura) | CONSTRUIR |
| I-17 | Reportes y tiempos por etapa | F | `#/interno/reportes` | SUPERVISOR y AUDITOR | CONSTRUIR |
| I-18 | Salud de las conexiones de interoperabilidad | F | `#/interno/conexiones` | ADMIN (SUPERVISOR/AUDITOR en lectura) | CONSTRUIR |

**Total: 27 + 18 = 45 pantallas.** · `POR CONFIRMAR`: 4 (P-15, P-18, P-24, P-25).

---

## §4. Portal del cliente del bufete (P-01 … P-27) — Fases B, C y D

> Todas las pantallas del portal son del rol `SOLICITANTE` (titular o con representación acreditada — P-08) y están limitadas a **sus** expedientes (CP-03). Salvo indicación, aplican también: 4 estados (§2.2), sello [V] (§2.3), Ley 81 (§2.4) y fixture por pantalla (§2.5).

### P-01 Inicio de sesión — Fase B · `#/login`

* **(a) Objetivo:** autenticar al cliente del bufete para acceder a su portal.
* **(b) Rol dueño y acceso:** `SOLICITANTE` — pantalla pública. `FUNCIONARIO`/`SUPERVISOR`/`AUDITOR`/`ADMIN` no usan el portal como clientes (van a `#/interno/login`).
* **(c) Checklist de campos (exactos de la fuente):**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Correo electrónico | texto/email | S | [C] | Coincide con el registrado en P-02 |
| Contraseña | contraseña | S | [C] | Mínimo 8, mayúscula, número y símbolo |
| Recordarme | booleano | N | [C] | — |

*Acciones (fuente):* Iniciar sesión · Registrarse (P-02) · Entrar con clave de un ente interviniente (si aplica — **POR DEFINIR (PO)**).
* **(d) Validaciones y reglas (§7.1):** validación en cliente de formato de correo y complejidad de contraseña; mostrar/ocultar contraseña; mensaje de fallo **genérico** que no revela si la cuenta existe (CP-02); bloqueo visual tras intentos repetidos, con contador y mensaje claro (límite de intentos: **POR DEFINIR (PO)**).
* **(e) Estados de trámite visibles:** no aplica (previa al expediente). Tras el éxito, redirige a la ruta inicial del rol (§2.1).
* **(f) Fixture sugerida:** `js/fixtures/p-01-login.json` (+ escenarios `.carga/.exito/.vacio/.error`).
* **(g) Nota de integración:** entregada por HU-02 (Sprint 1); conexión real al backend en HU-12 / TASK-12.5 (Sprint 2, `/api/auth/*`). CP-01, CP-02.

---

### P-02 Registro de cuenta — Fase B · `#/registro`

* **(a) Objetivo:** crear la cuenta del cliente del bufete con los datos de identificación y su autorización de tratamiento de datos.
* **(b) Rol dueño y acceso:** `SOLICITANTE` — pantalla pública.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Tipo de documento (pasaporte / cédula E / carné) | select | S | [C] | Catálogo SNM — catálogo en fixtures hasta la TASK-17.1 (**POR DEFINIR (PO)**) |
| Número de documento | texto | S | [C] | Formato según tipo; la fuente marca origen `S` de consulta RUEX/TE — en MVP **[D] simulada**: campo bloqueado sellado como verificación externa pendiente (§2.3) o captura con aviso, **POR DEFINIR (PO)** |
| Nombres y apellidos | texto | S | [C] | Debe coincidir con el documento |
| Nacionalidad | select | S | [C] | Catálogo de países |
| Correo electrónico | email | S | [C] | Único; envía código de verificación (→ P-03) |
| Teléfono (código de país + número) | teléfono | S | [C] | Unicidad opcional |
| País de residencia actual | select | S | [C] | — |
| Usuario (sugerido) | texto | S | [D] | Autogenerado = correo |
| Contraseña / confirmación | contraseña | S | [C] | Reglas de P-01 |
| Aceptación de términos y autorización de tratamiento de datos (Ley 81) | checkbox | S | [C] | Obligatorio; se registra fecha e IP |

*Reserva (Sprint 3):* espacio para **consentimiento informado** (Ley 81 + DE 285/2021).
* **(d) Validaciones y reglas (§7.1):** unicidad de correo; aceptación obligatoria de términos + autorización Ley 81; registro de fecha e IP de la aceptación (auditoría, I-16).
* **(e) Estados de trámite visibles:** no aplica. Al completar → P-03.
* **(f) Fixture sugerida:** `js/fixtures/p-02-registro.json`.
* **(g) Nota de integración:** HU-02 (Sprint 1); backend HU-12/TASK-12.5; consentimiento/ARCO → HU nueva del backlog (Sprint 3, endpoints HU-11). CP-13 (consentimiento).

---

### P-03 Verificación de identidad (OTP) — Fase B · `#/identidad/otp`

* **(a) Objetivo:** verificar la identidad del cliente con un código de un solo uso.
* **(b) Rol dueño y acceso:** `SOLICITANTE` — pantalla pública (tras P-02 o como refuerzo).
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Código de 6 dígitos enviado al correo | numérico | S | [C] | Expira en 10 minutos, 3 intentos — **OTP simulado** en el MVP (sin envío real) |
| Código SMS (opcional por seguridad) | numérico | N | [C] | Refuerzo para resoluciones y descargas — simulado |
| Verificación facial / cotejo de foto (opcional) | archivo/imagen | N | [C] | Solo para carné digital |

* **(d) Validaciones y reglas (§7.1):** expiración 10 min; máximo 3 intentos; mensaje genérico (CP-02). Pendiente del doc de roles §6.13-2: si el OTP es solo verificación de identidad o también factor de autenticación — **POR DEFINIR (PO)**.
* **(e) Estados de trámite visibles:** no aplica.
* **(f) Fixture sugerida:** `js/fixtures/p-03-otp.json`.
* **(g) Nota de integración:** HU-02 (Sprint 1); permanece **simulado** hasta existir envío real (HU-12: "P-03 sigue simulado").

---

### P-04 Recuperación de contraseña — Fase B · `#/recuperar-clave`

* **(a) Objetivo:** permitir restablecer la contraseña sin revelar si la cuenta existe.
* **(b) Rol dueño y acceso:** `SOLICITANTE` — pantalla pública.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Correo registrado | email | S | [C] | Enlace temporal de 1 hora (simulado en MVP) |
| Nueva contraseña / confirmación | contraseña | S | [C] | No puede ser las últimas 3 usadas (historial **POR DEFINIR (PO)** en MVP sin backend) |

* **(d) Validaciones y reglas (§7.1):** confirmación neutra que **no revela existencia de cuentas**; enlace temporal simulado de 1 hora.
* **(e) Estados de trámite visibles:** no aplica.
* **(f) Fixture sugerida:** `js/fixtures/p-04-recuperar-clave.json`.
* **(g) Nota de integración:** HU-02 (Sprint 1); backend HU-12/TASK-12.5. CP-02.

---

### P-05 Mi perfil / datos de contacto — Fase B · `#/perfil`

* **(a) Objetivo:** mostrar y actualizar los datos de contacto del cliente con mínima superficie de edición.
* **(b) Rol dueño y acceso:** `SOLICITANTE` — solo su propio perfil.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Nombre completo | texto | S | [D] | Solo lectura salvo corrección notariada |
| Documento de identidad | texto | S | [D] | Solo lectura |
| Correo electrónico | email | S | [C] | Cambio con re-verificación OTP (P-03 simulado) |
| Teléfono | teléfono | S | [C] | — |
| Dirección de notificación (país, provincia, distrito, corregimiento, detalle) | select/texto | N | [C] | Heredada por defecto en P-11 |
| Idioma de notificación (español / inglés) | select | N | [C] | — |
| Medio de notificación preferido (correo, SMS, push) | select | S | [C] | — |

* **(d) Validaciones y reglas (§7.1):** minimización (Ley 81): no se habilitan ediciones no contempladas; el cambio de correo exige re-verificación OTP simulada.
* **(e) Estados de trámite visibles:** no aplica.
* **(f) Fixture sugerida:** `js/fixtures/p-05-perfil.json`.
* **(g) Nota de integración:** HU-02 + TASK-02.4 (gestor de sesión: token ficticio, expiración, cierre); backend HU-12/TASK-12.5.

---

### P-06 Mis trámites (bandeja) — Fase C · `#/mis-tramites`

* **(a) Objetivo:** centralizar en tarjetas todas las solicitudes del cliente y sus acciones pendientes.
* **(b) Rol dueño y acceso:** `SOLICITANTE` — solo sus expedientes (expediente ajeno → 404/403, CP-03). El representante acreditado ve también lo presentado por su titular.
* **(c) Checklist de campos (no pide datos; muestra):**

| Elemento mostrado (fuente) | Tipo | Etiqueta |
|---|---|---|
| Número de expediente | texto | [D] |
| Tipo de trámite | texto | [D] |
| Fecha de envío | fecha | [D] |
| Estado | texto/etiqueta | [D] |
| Vencimiento de vigencias | fecha/alerta | [D] |
| Pendiente del ciudadano (cliente) | texto/etiqueta | [D] |

*Botones (fuente):* Nueva solicitud (P-07) · Continuar borrador · Ver observación (P-20) · Descargar (P-22). Paginación y filtros (HU-03 TASK-03.1); diseño de filtros **POR DEFINIR (PO)** — propuesta: estado y tipo de trámite.
* **(d) Validaciones y reglas (§7.1):** alerta de vigencias próximas a vencer (30/90 días, ver §2 de P-14); "Continuar borrador" retoma el asistente en el paso guardado.
* **(e) Estados de trámite visibles:** tarjeta con el estado del expediente según §7.2 (EN PREPARACIÓN … ARCHIVADO).
* **(f) Fixture sugerida:** `js/fixtures/p-06-mis-tramites.json` (incluir escenarios con y sin vigencias vencidas).
* **(g) Nota de integración:** HU-03 (Sprint 1); backend HU-16/TASK-16.3 (Sprint 3, listado/detalle). CP-03.

---

### P-07 Nueva solicitud — selección de trámite — Fase C · `#/solicitud/tramite`

* **(a) Objetivo:** elegir el trámite que determina todo el asistente restante (pasos, requisitos, tasas y verificaciones externas).
* **(b) Rol dueño y acceso:** `SOLICITANTE` (propios); representación acreditada → deriva a P-08.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Categoría del trámite | select | S | [C] | Registro de Extranjería · Visas no residente · Residente temporal · Residente permanente · Procesos especiales · Certificaciones · Naturalización |
| Trámite específico | select | S | [C] | Se filtra por categoría; carga su ficha de requisitos (sección 4 de la fuente — PM1–PM18, RUEX, residencias, etc.) |
| Motivo de la solicitud | select | S | [C] | Trabajo, inversión, familia, estudios, religión, humanitario, etc. |
| ¿Presenta por cuenta propia o mediante apoderado? | radio | S | [C] | Deriva a P-08 |
| País de origen del trámite | select | S | [C] | En Panamá / en consulado en el exterior |

*Acción derivada (fuente):* el trámite elegido determina el wizard restante, la lista de requisitos, las tasas (P-15) y qué verificaciones externas se disparan (I-07).
* **(d) Validaciones y reglas (§7.1):** catálogo de trámites en fixtures hasta I-14/TASK-17.1 (**POR DEFINIR (PO)**); las fichas de la sección 4 de la fuente (requisitos comunes Art. 28: poder y solicitud notariados, 3 fotos carné, pasaporte cotejado, antecedentes, certificado de salud, cheque B/.250.00 Tesoro Nacional, B/.800.00 SNM y declaración jurada de antecedentes) se cargan como datos del fixture del trámite.
* **(e) Estados de trámite visibles:** no aplica (creación); al enviar el wizard final → P-17 con `RECIBIDO – EN PREPARACIÓN`.
* **(f) Fixture sugerida:** `js/fixtures/p-07-nueva-solicitud.json` (+ `catalogo-tramites.json` como catálogo compartido).
* **(g) Nota de integración:** HU-03 (Sprint 1); backend HU-15/TASK-15.3 (`POST /api/expedientes`, Sprint 3).

---

### P-08 Titularidad y representación — Fase C · `#/solicitud/titularidad`

* **(a) Objetivo:** acreditar quién presenta la solicitud y en nombre de quién.
* **(b) Rol dueño y acceso:** `SOLICITANTE` — titular directo o con representación acreditada (abogado del despacho, padre/madre, representante de persona jurídica). `FUNCIONARIO` valida en recepción (I-04).
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Condición del presentante | select | S | [C] | Titular · Apoderado · Padre/Madre · Representante de persona jurídica |
| Tipo y número de documento del titular | texto | S | [D] sellado | Origen `S` (consulta RUEX): en MVP es bloqueado sellado como verificación externa pendiente (§2.3) |
| Nombre completo del titular | texto | S | [C] | Coincide con pasaporte |
| Tipo de representación | select | S | [C] | Poder notariado · Patria potestad · Tutela · Representación legal de empresa |
| Documento que acredita la representación | archivo | S (si no es titular) | [C] | Poder notariado, acta de nacimiento, resolución de tutela, certificado de Registro Público |
| Número de cédula e idoneidad del abogado | texto | S (apoderado) | [C] | Validación de vigencia ante el colegio de abogados (validación automática **POR DEFINIR (PO)**; en MVP captura con aviso) |
| Cédula del pasante (si aplica) | texto | N | [C] | Con autorización del abogado |
| Datos del representante: nombre, documento, teléfono, correo | texto | S | [C] | — |

* **(d) Validaciones y reglas (§7.1):** validación en cliente del documento acreditativo (tipo/tamaño); un expediente incompleto no se admite (P-17/I-04); el titular ve también lo presentado por su representante (doc de roles §6.4).
* **(e) Estados de trámite visibles:** no aplica (paso del asistente).
* **(f) Fixture sugerida:** `js/fixtures/p-08-titularidad.json`.
* **(g) Nota de integración:** HU-03 / TASK-03.2 (bloque [V] con carga manual bloqueada); backend HU-15.

---

### P-09 Paso 1 — Datos personales — Fase C · `#/solicitud/paso-1`

* **(a) Objetivo:** capturar la identidad civil del titular tal como consta en el pasaporte.
* **(b) Rol dueño y acceso:** `SOLICITANTE` (titular o su representante acreditado en el asistente).
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Primer apellido / Segundo apellido / Nombres | texto | S | [C] | Tal como aparece en el pasaporte |
| Apellidos y nombres en el pasaporte (si difieren) | texto | N | [C] | Para cotejo |
| Fecha de nacimiento | fecha | S | [C] | ≤ fecha actual; calcula edad |
| País de nacimiento | select | S | [C] | — |
| Ciudad / lugar de nacimiento | texto | S | [C] | — |
| Nacionalidad (de origen) | select | S | [C] | Si tiene doble nacionalidad: segundo campo |
| Sexo | select | S | [C] | — |
| Estado civil | select | S | [C] | Soltero(a) · Casado(a) · Divorciado(a) · Viudo(a) |
| Nombre y nacionalidad del padre | texto/select | S | [C] + sellado | Origen `S`: cotejo con Registro Civil (TE) cuando hay datos inscritos → sello [V] (§2.3) |
| Nombre y nacionalidad de la madre | texto/select | S | [C] + sellado | Ídem |
| Nombre del cónyuge y nacionalidad | texto/select | Cond. | [C] + sellado | Obligatorio si estado civil = casado(a); cotejo Registro Civil (TE) |
| Fecha y lugar de matrimonio | fecha/texto | Cond. | [V] sellado | Certificado de matrimonio en Registro Civil (TE) — bloqueado en MVP (§2.3) |
| Documento de identidad del exterior (si tiene) | texto | N | [C] | Pasaporte, cédula o carné extranjero |
| Foto tamaño carné (3.5 × 4.5 cm) | imagen | S | [C] | JPG/PNG ≤ 2 MB; sin lentes, gorros, escote ni mangas |
| Huella digital (opcional para carné digital) | dato biométrico | N | [C] | Solo si el trámite genera carné; en MVP **POR DEFINIR (PO)** (captura simulada o se omite) |

* **(d) Validaciones y reglas (§7.1):** foto carné 3.5 × 4.5 cm sin lentes/gorros/escotes (P-09); fecha de nacimiento ≤ hoy; estado civil casado(a) exige datos del cónyuge.
* **(e) Estados de trámite visibles:** no aplica (paso del asistente).
* **(f) Fixture sugerida:** `js/fixtures/p-09-datos-personales.json`.
* **(g) Nota de integración:** HU-03 / TASK-03.3 (asistente de 8 pasos); backend HU-15.

---

### P-10 Paso 2 — Pasaporte e historial migratorio — Fase C · `#/solicitud/paso-2`

* **(a) Objetivo:** recoger el documento de viaje y el historial migratorio, sustituyendo por verificación externa lo que el SNM ya registra.
* **(b) Rol dueño y acceso:** `SOLICITANTE`.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Número de pasaporte vigente | texto | S | [C] | Validación de formato por país emisor |
| País emisor del pasaporte | select | S | [C] | — |
| Fecha de expedición / Fecha de vencimiento | fecha | S | [C] | Vigencia mínima habitual: **3 meses** (bloquea si no cumple) |
| Lugar de expedición | texto | N | [C] | — |
| Sello de ingreso: fecha, puesto fronterizo, clase de admisión | fecha/select | S | [D] sellado | Cotejo con el registro de entradas y salidas (origen `S/A`) → sello [V] (§2.3) |
| Número de Registro de Filiación (RUEX) | texto | S (si aplica) | [D] sellado | Consulta RUEX; muestra estado vigente / vencido / multa — en MVP estado **POR DEFINIR (PO)** en el fixture |
| Último permiso migratorio: número, tipo, fecha de vencimiento | texto/select | S (si aplica) | [D] sellado | Expediente SNM → sello [V] |
| Número de carné migratorio (trámite, provisional o permanente) | texto | Cond. | [D] sellado | Expediente SNM → sello [V] |
| Carné de Residente Permanente "E" (número y fecha) | texto | Cond. | [V] sellado | Emitido por el Tribunal Electoral — bloqueado en MVP (§2.3) |
| Pasaportes anteriores: números | texto repetible | Cond. | [C] | Obligatorio en Movimiento Migratorio |
| Motivo del cambio de pasaporte | texto/archivo | Cond. | [C] | Si perdió el pasaporte: denuncia o reporte (archivo) |
| ¿Ha salido del país en los últimos 5 años? / fuera más de 3 meses | radio | N | [C] | Relevante en naturalización (numerales 2 y 3 del Art. 10) |
| Historial de entradas y salidas | tabla solo lectura | — | [V] sellado | Cargado desde el SNM; el cliente no lo digita — bloqueado (§2.3) |

* **(d) Validaciones y reglas (§7.1):** pasaporte con vigencia mínima de **3 meses** (bloqueante en P-10); "si no responde la fuente, el requisito vuelve como carga manual" (regla 2 de interoperabilidad).
* **(e) Estados de trámite visibles:** no aplica (paso del asistente); el estado del RUEX mostrado (vigente/vencido/multa) es dato del fixture.
* **(f) Fixture sugerida:** `js/fixtures/p-10-pasaporte-historial.json` (+ `historial-entradas-salidas.json` para la tabla [V]).
* **(g) Nota de integración:** HU-03 / TASK-03.3; bloque [V] → registro manual asistido en I-07; backend HU-15 y HU-26 (validaciones, Sprint 5).

---

### P-11 Paso 3 — Domicilio y notificaciones — Fase C · `#/solicitud/paso-3`

* **(a) Objetivo:** fijar el domicilio y los canales de notificación del cliente.
* **(b) Rol dueño y acceso:** `SOLICITANTE`.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| País de domicilio | select | S | [C] | — |
| Provincia / Distrito / Corregimiento | select en cascada | S | [C] | Catálogo oficial (catálogo en fixtures, **POR DEFINIR (PO)**) |
| Dirección completa (calle, casa/apto, referencia) | texto | S | [C] | — |
| Tipo de tenencia | select | S | [C] | Propia · Alquiler · Con el empleador · Familiares |
| Comprobante de domicilio | archivo | Cond. | [C] | Escritura, contrato de arrendamiento notariado, carta de responsabilidad notariada o certificación de juez de paz |
| Titular del recibo de servicios públicos | texto | N | [C] | Cotejo con el comprobante |
| Número de recibo de luz/agua/teléfono | texto | Cond. | [C] | — |
| Dirección de notificación (si difiere del domicilio) | texto | N | [C] | — |
| Correo y teléfono de notificación | email/teléfono | S | [D] | Heredados de P-05 |

* **(d) Validaciones y reglas (§7.1):** validación de formato/tamaño del comprobante (CP-05); herencia de P-05 y reutilización como valor por defecto.
* **(e) Estados de trámite visibles:** no aplica (paso del asistente).
* **(f) Fixture sugerida:** `js/fixtures/p-11-domicilio-notificaciones.json` (+ `catalogo-division-politica.json`).
* **(g) Nota de integración:** HU-03 / TASK-03.3; backend HU-15.

---

### P-12 Paso 4 — Situación laboral, económica o de vínculos — Fase C · `#/solicitud/paso-4`

* **(a) Objetivo:** capturar el bloque de datos que el trámite exige (laboral, económico, educativo, actividad especial o vínculos familiares), dinámicamente según P-07.
* **(b) Rol dueño y acceso:** `SOLICITANTE`. Pantalla **dinámica**: los campos cambian según el trámite elegido en P-07 (detalle en la sección 4 de la fuente); el despacho los revisa en I-06.
* **(c) Checklist de campos (bloques posibles de la fuente; se muestra solo el/los bloque(s) del trámite):**

**Bloque laboral (trabajo, MITRADEL, contratos):**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Empleador / entidad contratante | texto | S | [C] + sellado | Origen `A`: registro en Registro Público o MITRADEL → sello [V] (§2.3) |
| Número de RUC | texto | S | [C] + sellado | Origen `A`: consulta DGI/Registro Público → sello [V] |
| Cargo y funciones | texto | S | [C] | — |
| Fecha de inicio y tipo de contrato | fecha/select | S | [C] | — |
| Salario mensual y moneda | numérico | S | [C] | — |
| Número y vigencia del permiso de trabajo | texto | S | [C] + sellado | Origen `A`: MITRADEL / SNM → sello [V] |
| Paz y salvo de la empresa (renta) | archivo | Cond. | [C] o [V] | `U` o validación automática DGI "si está disponible" → en MVP carga manual; sello [V] si DGI habilita (**POR DEFINIR (PO)** §8.2) |
| Paz y salvo de la CSS de la empresa | archivo | Cond. | [V] sellado | Origen `A`: consulta a la CSS — bloqueado (§2.3) |
| Planilla con mano de obra panameña (porcentaje) | archivo | Cond. | [V] sellado | Origen `A`: CSS/MITRADEL — bloqueado (§2.3) |

**Bloque económico / inversión:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Tipo de inversión | select | S | [C] | Depósito a plazo fijo · Inmueble · Inversión forestal · Macro-empresa · Mixta |
| Monto invertido | numérico | S | [C] | Validación contra el mínimo legal del permiso (p. ej. B/.300,000.00 — mínimos por trámite en la sección 4 de la fuente) |
| Banco o entidad financiera | select | S | [C] | — |
| Número de cuenta / certificado de plazo fijo | texto | S | [C] + sellado | Origen `A`: certificación bancaria → sello [V] |
| ¿Libre de gravamen? | radio | S | [C] | — |
| Finca / registro de propiedad (número) | texto | Cond. | [C] + sellado | Origen `A`: Registro Público → sello [V] |
| Sociedad / acciones: razón social, número de acciones, capital | texto/numérico | Cond. | [C] + sellado | Origen `A`: Registro Público + certificación del CPA → sello [V] |
| Certificación de Contador Público Autorizado | archivo | Cond. | [C] | — |
| Paz y salvo de la DGI | archivo/consulta | Cond. | [V] sellado | Origen `A` "si el servicio está habilitado" — en MVP pendiente (§2.3, §8.2) |
| Actividad económica declarada (declaración de renta) | archivo | Cond. | [C] | Últimas declaraciones |

**Bloque educativo:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Institución educativa | texto | S | [C] | — |
| Nivel y modalidad | select | S | [C] | — |
| Carrera / programa y jornada | texto/select | S | [C] | Tiempo completo obligatorio |
| Matrícula vigente y fechas | texto/fecha | S | [C] | — |
| Certificación de centro educativo | archivo | S | [C] | `U` "o validación con la institución" → validación automática con la institución: **POR DEFINIR (PO)** |
| Beca (entidad otorgante) | texto | Cond. | [C] | Certificación de la entidad |

**Bloque de actividad especial (religiosa, deportiva, humanitaria, periodística, investigación):**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Institución o entidad | texto | S | [C] + sellado | Origen `A`: existencia en Registro Público / MINGOB → sello [V] |
| Cargo o actividad | texto | S | [C] | — |
| Duración autorizada (desde / hasta) | fechas | S | [C] | — |
| Carta o certificación de la entidad | archivo | S | [C] | — |
| Registro de la asociación / ONG | archivo | Cond. | [V] sellado | Origen `A`: Registro Público — bloqueado (§2.3) |
| Convenio con el Estado (si aplica) | archivo | N | [C] | — |

**Bloque de vínculos familiares:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Parentesco alegado | select | S | [C] | Cónyuge · Hijo(a) · Padre/Madre · Dependiente |
| Nombre del pariente y su nacionalidad | texto/select | S | [C] | — |
| Número de cédula o carné del pariente | texto | S | [C] + sellado | Origen `A`: Registro Civil del Tribunal Electoral → sello [V] |
| Tipo de vínculo documental | archivo | S | [V] sellado | Origen `A`: certificado de matrimonio o de nacimiento inscrito en el Registro Civil — bloqueado (§2.3) |
| Hijos panameños (cantidad y datos) | repetible | Cond. | [C] + sellado | Origen `A`: Registro Civil (TE) → sello [V] |

* **(d) Validaciones y reglas (§7.1):** los mínimos de monto se toman de la sección 4 de la fuente (p. ej. inversión forestal ≥ B/.100,000.00 — B/.350,000.00 para permanencia automática; macro-empresa capital ≥ B/.160,000.00; DPF B/.300,000.00 con plazo ≥ 3 años; rentista ≥ B/.850.00/mes por ≥ 5 años; pensionado ≥ B/.1,000.00/mes; nómada digital ≥ B/.36,000.00/año); bloques [V] sellados y bloqueados (§2.3); minimización (Ley 81): no se muestran bloques ajenos al trámite.
* **(e) Estados de trámite visibles:** no aplica (paso del asistente).
* **(f) Fixture sugerida:** `js/fixtures/p-12-situacion.json` (un escenario por bloque; los bloques por trámite salen del catálogo `catalogo-tramites.json`).
* **(g) Nota de integración:** HU-03 / TASK-03.2–03.3; bloque [V] → I-07 (modo manual asistido); backend HU-15 y HU-26.

---

### P-13 Paso 5 — Dependientes — Fase C · `#/solicitud/paso-5`

* **(a) Objetivo:** registrar cada dependiente (cónyuge, hijos, padres u otros) con su prueba de solvencia.
* **(b) Rol dueño y acceso:** `SOLICITANTE`; pantalla **repetible** (un bloque por dependiente).
* **(c) Checklist de campos (se repite por cada dependiente):**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Parentesco con el solicitante | select | S | [C] | — |
| Nombres y apellidos completos | texto | S | [C] | — |
| Fecha de nacimiento | fecha | S | [C] | Calcula si es mayor de 18 |
| Nacionalidad | select | S | [C] | — |
| Tipo y número de documento | texto | S | [C] | — |
| Sexo y estado civil | select | S | [C] | — |
| Certificado de matrimonio / nacimiento / tutela | archivo | S | [V] sellado | Origen `A`: Registro Civil (TE) — bloqueado (§2.3) |
| Prueba de domicilio del dependiente | archivo | Cond. | [C] | — |
| Estudios a tiempo completo (18–25 años) | texto/archivo | Cond. | [C] | Certificación del centro educativo |
| Declaración jurada de soltería (18–25 años) | archivo | Cond. | [C] | — |
| Solvencia económica del responsable | select/archivo | S | [C] | Declaración de renta con paz y salvo (**B/.1,000.00** + **B/.100.00** por dependiente) · Carta de trabajo con ficha CSS · Carta bancaria |
| Carta de responsabilidad y repatriación notariada | archivo | S | [C] | Del residente o nacional |

* **(d) Validaciones y reglas (§7.1):** solvencia de dependientes **B/.1,000.00 + B/.100.00 por dependiente**; si elige carta de trabajo con ficha CSS aplica la vigencia de ficha CSS (**90 días y 9 cuotas**, notariada); cálculo automático de mayoría de edad y de los tramos 18–25 años.
* **(e) Estados de trámite visibles:** no aplica (paso del asistente).
* **(f) Fixture sugerida:** `js/fixtures/p-13-dependientes.json` (con 0, 1 y 2 dependientes para cubrir el vacío y el cálculo).
* **(g) Nota de integración:** HU-03 / TASK-03.3; backend HU-15 y HU-26 (verificaciones de Registro Civil vía I-07).

---

### P-14 Paso 6 — Requisitos y carga de documentos — Fase C · `#/solicitud/paso-6`

* **(a) Objetivo:** cumplir el checklist dinámico de requisitos del trámite subiendo los documentos exigidos, con los ya verificados externamente sellados.
* **(b) Rol dueño y acceso:** `SOLICITANTE`; la misma casilla usa el analista en I-06 y la recepción en I-04; descarga protegida (CP-12).
* **(c) Checklist de campos (pantalla de checklist dinámico: se genera de la ficha del trámite — sección 4 de la fuente — y de los datos ya digitados):**

| Campo / elemento (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Lista de requisitos con casilla cumplida/no cumplida | checklist | S | [C]/[V] | Cada casilla es la misma que usa el analista en I-06; las de origen `A` aparecen selladas (§2.3) |
| Documento requerido | control de carga | S | [C] | PDF/JPG/PNG; nombre sugerido automático |
| Fecha de emisión del documento | fecha | S | [C] | Calcula vigencia: antecedentes **30 días**, salud/estatus/bancario **90 días**, ficha CSS **90 días y 9 cuotas** |
| Emisor del documento | texto/select | S | [C] | — |
| Número de sello/timbre (si aplica) | texto | N | [C] | Constancia de timbres |
| Traducción / apostilla / legalización | checkbox + archivo | Cond. | [C] | Documentos del exterior: apostilla o certificación de Relaciones Exteriores |
| Requisitos obtenidos por interoperabilidad | estado | — | [V] sellado | Marcados *verificado automáticamente* (no se suben); en MVP: "pendiente de verificación automática (futuro convenio)" |
| Observación del ciudadano (cliente) | texto largo | N | [C] | — |
| Completitud del expediente | barra de progreso | — | [D] | 100 % para habilitar P-16 |

*Regla de la fuente:* un requisito ya verificado por interoperabilidad aparece **bloqueado** y anotado con la fuente y la fecha de la consulta; el cliente solo puede pedir **forzar la revisión manual**.
* **(d) Validaciones y reglas (§7.1):** antecedentes penales 30 días; salud, estatus migratorio y carta bancaria 90 días; ficha CSS 90 días y 9 cuotas notariada; documentos del exterior: apostilla/legalización y Relaciones Exteriores; formato y tamaño de archivo en cliente con progreso y resultado (CP-05); descarga solo con permiso (CP-12); catálogo de tipos documentales **POR DEFINIR (PO)** (TASK-17.1, Sprint 3; mientras tanto, catálogo en fixtures).
* **(e) Estados de trámite visibles:** no aplica directamente; los requisitos observados aparecen después en P-20/P-21 (CON OBSERVACIONES).
* **(f) Fixture sugerida:** `js/fixtures/p-14-requisitos.json` (incluye requisitos [V] sellados y vigencias vencidas para probar la barra de completitud).
* **(g) Nota de integración:** HU-03 / TASK-03.3 (el más pesado del asistente); backend HU-17/TASK-17.4 (Sprint 3, carga con progreso) y HU-26 (verificaciones). CP-05, CP-12.

---

### P-15 Paso 7 — Pagos y tasas — Fase C · `#/solicitud/paso-7` — **POR CONFIRMAR (§8.3)**

* **(a) Objetivo:** mostrar el desglose de tasas y registrar el pago en **modo simulado, sin pasarela**.
* **(b) Rol dueño y acceso:** `SOLICITANTE`; recepción verifica el pago en I-04.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Desglose de tasas del trámite | tabla solo lectura | — | [D] | Calculado desde el catálogo I-14 (ej.: Tesoro Nacional **B/.250.00**, SNM **B/.800.00**) |
| Modalidad de pago | radio | S | [C] | En línea (tarjeta/transferencia) · Cheque certificado presencial · Exoneración — el pago electrónico está **POR CONFIRMAR** (§8.3): en el MVP la captura es simulada |
| Número, banco y fecha del cheque | texto/fecha | Cond. | [C] | Verificación de cheques certificados o de gerencia (origen `S`: simulada en MVP) |
| Comprobante de pago | archivo | Cond. | [C] | Escaneo del cheque o recibo — opcional en el MVP |
| Concepto de pago (repatriación, carné, trámite, timbres) | select | S | [C] | — |
| Timbres digitales (naturalización) | numérico | Cond. | [C] | B/.8.00 declaración jurada, B/.8.00 estatus, B/.2.00 carné E |
| Constancia de pago generada | documento | — | [D] | Descargable; validada luego en I-04 |

* **(d) Validaciones y reglas (§7.1):** montos **B/.250.00** Tesoro Nacional y **B/.800.00** SNM (mismos que I-04) más tasas específicas por trámite (sección 4 de la fuente); garantías y depósitos según trámite (p. ej. B/.500.00 de cambio de categoría, visible en P-23).
* **(e) Estados de trámite visibles:** no aplica (paso del asistente); el pago pendiente puede mostrarse como "pendiente del cliente" en P-06.
* **(f) Fixture sugerida:** `js/fixtures/p-15-pagos.json` (con desglose por trámite y constancia generada).
* **(g) Nota de integración:** HU-03 / TASK-03.3 y TASK-03.4; **captura simulada sin pasarela** repetida en P-23; backend HU-15 y, si el PO confirma pagos en línea, HU/endpoint de pagos **POR DEFINIR (PO)**.

---

### P-16 Paso 8 — Declaración jurada y firma — Fase C · `#/solicitud/paso-8`

* **(a) Objetivo:** cerrar el asistente con la declaración de veracidad, la autorización Ley 81 y la firma simulada.
* **(b) Rol dueño y acceso:** `SOLICITANTE`; habilitado solo con P-14 al 100 %.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Declaración de veracidad de los datos y documentos | checkbox | S | [C] | Texto legal; no se puede avanzar sin marcarlo |
| Autorización de tratamiento de datos personales (Ley 81) | checkbox | S | [C] | Finalidad, destinatarios (TE, CSS, Registro Público), plazo de conservación y derechos ARCO |
| Declaración de no tener impedimentos / antecedentes | checkbox | Cond. | [C] | Según trámite |
| Renuncia a la nacionalidad (solo naturalización) | checkbox | S | [C] | Art. 10 numerales 1 y 2 de la Constitución |
| Lugar y fecha | select/fecha | S | [D] | Autogenerados |
| Firma manuscrita digital o huella | firma | S | [C] | Se guarda con sello de tiempo — **firma simulada** en el MVP |
| Nombre del firmante | texto | S | [D] | Coincide con P-08 |

*Reserva (Sprint 3):* espacio para **consentimiento informado** (Ley 81 + DE 285/2021, con consentimiento expreso para datos sensibles).
* **(d) Validaciones y reglas (§7.1):** no se permite avanzar sin las casillas obligatorias; firma simulada con sello de tiempo; minimización: el texto legal no pide datos adicionales.
* **(e) Estados de trámite visibles:** no aplica (paso del asistente); al firmar → P-17.
* **(f) Fixture sugerida:** `js/fixtures/p-16-declaracion-firma.json`.
* **(g) Nota de integración:** HU-03 / TASK-03.3; backend HU-15; consentimiento → HU nueva del Sprint 3 (HU-11). CP-13.

---

### P-17 Resumen y envío — Fase C · `#/solicitud/resumen`

* **(a) Objetivo:** resumir el expediente completo, generar el número de expediente y enviarlo.
* **(b) Rol dueño y acceso:** `SOLICITANTE`; el envío dispara el estado inicial y la recepción del despacho (I-04).
* **(c) Checklist de campos (pantalla de solo lectura con datos mostrados):**

| Dato mostrado (fuente) | Origen | Etiqueta |
|---|---|---|
| Número de expediente / trámite / registro (QR y código) | Generado al enviar | [D] |
| Resumen de datos del solicitante y dependientes | P-09 a P-13 | [D] |
| Requisitos cumplidos, automáticos y pendientes | P-14 | [D] |
| Total pagado y saldo | P-15 | [D] |
| Estado inicial: RECIBIDO – EN PREPARACIÓN | — | [D] |
| Siguiente paso: cita (P-18) o espera de revisión | — | [D] |
| Aviso: "No se recibirán solicitudes incompletas" | Formulario oficial SNM | [D] |

* **(d) Validaciones y reglas (§7.1):** **un expediente incompleto no se admite**; envío bloqueado si P-14 < 100 % o P-16 sin firmar; validación de campos del servidor cuando exista (TASK-03.4).
* **(e) Estados de trámite visibles:** `RECIBIDO – EN PREPARACIÓN` (estado inicial); cadena completa visible en P-19.
* **(f) Fixture sugerida:** `js/fixtures/p-17-resumen-envio.json` (incluye expediente con QR/código).
* **(g) Nota de integración:** HU-03 / TASK-03.4; backend HU-15 (`POST /api/expedientes`, errores 400 campo a campo).

---

### P-18 Reserva de cita — Fase C · `#/solicitud/cita` — **POR CONFIRMAR (§8.4)**

* **(a) Objetivo:** reservar fecha, ventanilla y turno para los trámites que requieren cita presencial.
* **(b) Rol dueño y acceso:** `SOLICITANTE`; recepción ve la cita en I-03.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Trámite | select | S | [D] | Prellenado desde la solicitud |
| Oficina / ventanilla | select | S | [C] | Catálogo de sedes — listado de sedes **POR DEFINIR (PO)** |
| Fecha y hora disponibles | calendario | S | [C] | Cupo por ventanilla y tipo de trámite |
| Turno/tiquete asignado (letra) | — | — | [D] | Ej.: "B" para Registro de Extranjería; corrección y cambio de nacionalidad **no requieren turno** |
| Nombre del asistente | texto | N | [C] | — |

* **(d) Validaciones y reglas (§7.1):** cupo por ventanilla y tipo de trámite; trámites sin turno (corrección, cambio de nacionalidad) no muestran calendario; cobertura de ventanilla pendiente de confirmar (§8.4): qué trámites quedan 100 % en línea y cuáles exigen cita (fotos, huella, firma de entrevista, retiro con identificación).
* **(e) Estados de trámite visibles:** no aplica directamente; la cita alimenta `RECIBIDO`/recepción (I-03).
* **(f) Fixture sugerida:** `js/fixtures/p-18-reserva-cita.json` (con calendario con y sin cupos).
* **(g) Nota de integración:** HU-03 / TASK-03.5; backend HU-15 y catálogo de sedes **POR DEFINIR (PO)**; el turno/tiquete se consume en I-03.

---

### P-19 Estado del trámite (línea de tiempo) — Fase D · `#/seguimiento/estado`

* **(a) Objetivo:** mostrar al cliente dónde está su expediente, cuánto lleva y qué debe hacer.
* **(b) Rol dueño y acceso:** `SOLICITANTE` (solo sus expedientes — CP-03); el despacho ve el detalle ampliado en I-06; nivel de detalle por rol (TASK-04.1).
* **(c) Checklist de campos (no pide datos; muestra):**

| Elemento mostrado (fuente) | Tipo | Etiqueta |
|---|---|---|
| Expediente | texto | [D] |
| Trámite | texto | [D] |
| Etapa actual | texto/etiqueta | [D] |
| Fecha de cada etapa | fechas | [D] |
| Días transcurridos | numérico | [D] |
| Requisitos faltantes | lista | [D] |
| Acción pendiente | botón/enlace | [D] |
| Estado agregado de verificaciones externas (HU-26, Sprint 5) | bloque | [D] — sin detalles internos (el detalle fino vive en I-07) |

* **(d) Validaciones y reglas (§7.1):** alertas de vigencias (30/90 días); un expediente ajeno muestra "no encontrado" sin datos (CP-03).
* **(e) Estados de trámite visibles (exactos de la fuente):** `EN PREPARACIÓN → RECIBIDO → CON OBSERVACIONES (cliente) → EN ANÁLISIS → CON OBSERVACIONES (analista) → ADMITIDO → EN RESOLUCIÓN → RESUELTO (APROBADA | NEGADA) → NOTIFICADO → ENTREGADO`. La cadena general de la fuente añade `ARCHIVADO` (§7.2) — ver inconsistencia en el Anexo A.
* **(f) Fixture sugerida:** `js/fixtures/p-19-estado-tramite.json` (una tarjeta por cada estado del flujo).
* **(g) Nota de integración:** HU-04 / TASK-04.1; backend HU-16/TASK-16.3 (Sprint 3), HU-21 (línea de tiempo, Sprint 4) y HU-26/TASK-26.3 (bloque de verificaciones, Sprint 5). CP-03, CP-09.

---

### P-20 Observaciones y notificaciones — Fase D · `#/seguimiento/observaciones`

* **(a) Objetivo:** listar las observaciones/notificaciones del expediente con su plazo y la vía para atenderlas.
* **(b) Rol dueño y acceso:** `SOLICITANTE` (solo observaciones propias; sin datos confidenciales ni notas internas); emisor interno en I-04/I-08.
* **(c) Checklist de campos (datos mostrados / pedidos):**

| Dato mostrado / pedido (fuente) | Tipo | Etiqueta | Origen en la fuente |
|---|---|---|---|
| Quién emitió la observación (recepcionista / analista) | — | [D] | I-04 / I-08 |
| Fecha y plazo de atención | — | [D] | — |
| Lista de ítems observados con su detalle | — | [D] | — |
| Acción: atender observación | botón → P-21 | [D] | — |
| Nueva fecha de vigencia de documentos vencidos | — | [D] | Alerta |

* **(d) Validaciones y reglas (§7.1):** una observación no cambia el estado por sí sola en la interfaz (HU-20); marcado de leídas al conectar backend.
* **(e) Estados de trámite visibles:** `CON OBSERVACIONES (cliente)` — la observación del analista deriva de `EN ANÁLISIS`.
* **(f) Fixture sugerida:** `js/fixtures/p-20-observaciones.json` (con y sin observaciones → estado vacío).
* **(g) Nota de integración:** HU-04 / TASK-04.1; backend HU-18/TASK-18.3 (Sprint 3) y HU-20/TASK-20.2 (Sprint 4). CP-09.

---

### P-21 Subsanación (corrección del expediente) — Fase D · `#/seguimiento/subsanacion`

* **(a) Objetivo:** permitir corregir el expediente en un solo reingreso que atienda todas las observaciones.
* **(b) Rol dueño y acceso:** `SOLICITANTE`; el despacho revisa la atención en I-08.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Ítem observado (fila) | — | S | [D] | Prellenado |
| Documento corregido / completado | archivo | S | [C] | Debe respetar vigencias |
| Justificación de la corrección | texto | N | [C] | — |
| Sustitución de dato digitalizado | texto | Cond. | [C] | Solo campos corregibles (p. ej. error de digitación) |
| Confirmación de que se atienden todas las observaciones | checkbox | S | [C] | Regla oficial: solo se reingresa completo |

* **(d) Validaciones y reglas (§7.1):** **un solo reingreso con todas las observaciones atendidas**; el documento corregido debe respetar vigencias (30/90 días); formato/tamaño en cliente (CP-05).
* **(e) Estados de trámite visibles:** `CON OBSERVACIONES` → al reingresar vuelve a `EN ANÁLISIS`; si vence el plazo → `ARCHIVADO` (I-13).
* **(f) Fixture sugerida:** `js/fixtures/p-21-subsanacion.json` (1 ítem observado y varios ítems para la confirmación total).
* **(g) Nota de integración:** HU-04 / TASK-04.2; backend HU-15, HU-17 y HU-20. CP-05, CP-09.

---

### P-22 Resultados: resoluciones, carné digital y certificados — Fase D · `#/seguimiento/resultados`

* **(a) Objetivo:** entregar al cliente los resultados del expediente (resolución, carné digital, constancias) y, si es negada, los motivos y la vía de impugnación.
* **(b) Rol dueño y acceso:** `SOLICITANTE`; descarga deshabilitada sin permiso (CP-12); la resolución la emite el despacho en I-10.
* **(c) Checklist de campos (datos mostrados):**

| Dato (fuente) | Tipo | Origen en la fuente | Etiqueta |
|---|---|---|---|
| Resolución (PDF, número, fecha) | descarga | I-10 | [D] |
| Carné digital (imagen/QR con verificación) | descarga | Datos biométricos + TE (origen `A`) | [V] sellado (§2.3) |
| Constancia de permiso vigente / prórroga | descarga | Expediente (origen `S`) | [D] |
| Estado del permiso: VIGENTE / EN PRÓRROGA / VENCIDO / INDEFINIDO / CANCELADO OFICIOSO | — | — | [D] |
| Fecha límite de prórroga o renovación | — | Genera recordatorio | [D] |
| Motivos de negación y vía de impugnación | texto | I-10 | [D] |

* **(d) Validaciones y reglas (§7.1):** estado del permiso finalizado: `VIGENTE → EN PRÓRROGA → VIGENTE` o `VENCIDO`; `INDEFINIDO`; `CANCELADO OFICIOSO`; descarga solo autenticada y auditada (CP-12); sin enlaces públicos.
* **(e) Estados de trámite visibles:** `RESUELTO (APROBADA | NEGADA) → NOTIFICADO → ENTREGADO`; estados del permiso listados arriba.
* **(f) Fixture sugerida:** `js/fixtures/p-22-resultados.json` (aprobada, negada y sin resultados → vacío).
* **(g) Nota de integración:** HU-04 / TASK-04.3; backend HU-15/HU-19 (resoluciones) y HU-12; descargas → HU-17. CP-12.

---

### P-23 Historial de pagos — Fase D · `#/seguimiento/pagos`

* **(a) Objetivo:** consultar todos los pagos del cliente, incluidos depósitos de garantía devueltos, con recibo descargable.
* **(b) Rol dueño y acceso:** `SOLICITANTE` (solo sus pagos); descarga auditada (CP-12).
* **(c) Checklist de campos (tabla):**

| Columna (fuente) | Tipo | Etiqueta |
|---|---|---|
| Fecha | fecha | [D] |
| Concepto | texto | [D] |
| Monto | numérico | [D] |
| Medio | texto | [D] |
| Número de comprobante | texto | [D] |
| Estado (pagado / pendiente / devuelto) | etiqueta | [D] |
| Recibo | descarga | [D] |

*Incluye (fuente):* depósitos de garantía devueltos (p. ej. **B/.500.00** de cambio de categoría).
* **(d) Validaciones y reglas (§7.1):** misma **captura simulada sin pasarela** que P-15; montos de garantías según trámite (sección 4 de la fuente).
* **(e) Estados de trámite visibles:** no aplica (pantalla de consulta); estados de pago: pagado / pendiente / devuelto.
* **(f) Fixture sugerida:** `js/fixtures/p-23-historial-pagos.json` (con pago devuelto).
* **(g) Nota de integración:** HU-04 / TASK-04.3; backend HU-15 y endpoint de pagos **POR DEFINIR (PO)**. CP-12.

---

### P-24 Edictos y citaciones — Fase D · `#/seguimiento/edictos` — **POR CONFIRMAR (HU-04 CA-7)**

* **(a) Objetivo:** consultar por expediente los edictos publicados, oposiciones, citas de retiro y notificaciones.
* **(b) Rol dueño y acceso:** `SOLICITANTE` — **modo consulta mínimo** (HU-04); el despacho publica en I-09.
* **(c) Checklist de campos (la fuente no da tabla de campos; consulta por):**

| Elemento (fuente) | Tipo | Obl. | Etiqueta |
|---|---|---|---|
| Número de expediente (para consultar) | texto | S | [C] |
| Apellidos (para consultar) | texto | S | [C] |
| Edictos publicados | lista | — | [D] |
| Oposiciones | lista | — | [D] |
| Citas de retiro | lista | — | [D] |
| Notificaciones con fecha de publicación | lista | — | [D] |

*Campos exactos de la respuesta: **POR DEFINIR (PO)** (la fuente solo describe la consulta); en modo consulta mínimo se muestran los listados anteriores con fecha de publicación.*
* **(d) Validaciones y reglas (§7.1):** solo edictos propios; sin datos de terceros opositores (minimización, Ley 81).
* **(e) Estados de trámite visibles:** edicto de admisión / oposición / notificación (catálogo de I-09); `ADMITIDO` y `NOTIFICADO`.
* **(f) Fixture sugerida:** `js/fixtures/p-24-edictos.json` (con y sin edictos → vacío).
* **(g) Nota de integración:** HU-04 / TASK-04.5 (modo consulta mínimo); backend HU-15/HU-19 + publicaciones de I-09 **POR DEFINIR (PO)**.

---

### P-25 Certificaciones en línea — Fase D · `#/servicios/certificaciones` — **POR CONFIRMAR (HU-04 CA-7)**

* **(a) Objetivo:** solicitar en 3 pasos la certificación de **Estatus Migratorio** o **Movimiento Migratorio**.
* **(b) Rol dueño y acceso:** `SOLICITANTE` — pantalla de servicios **consultiva** (doc de roles §6.4); emisión y entrega en I-11/I-12; verificación de estatus contra el expediente (origen `S`).
* **(c) Checklist de campos (flujo corto de 3 pasos):**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Trámite solicitado | radio | S | [C] | Estatus migratorio · Movimiento migratorio |
| Número de pasaporte y carné | texto | S | [D] sellado | Origen `S` (expediente SNM) → sello [V] (§2.3) |
| Entidad a la que se presenta el certificado | select | S | [C] | DGI · MITRADEL · SNM · Otro |
| ¿Para uso de Naturalización? | checkbox | N | [C] | Cambia el timbre a **B/.8.00** y la leyenda |
| Copia de generales del pasaporte y sello | archivo | S (estatus) | [C] o [V] | Origen `A`: sustituible por lectura del sello digital → en MVP carga manual con aviso (§2.3) |
| Copia de todo el pasaporte vigente (todas las páginas) | archivo | S (movimiento) | [C] | Escaneo; las entradas/salidas se cruzan con la BD del SNM (origen `A` → sello [V]) |
| Pasaportes anteriores (números) | texto | Cond. | [C] | — |
| Acta de nacimiento del menor y documento del representante | archivo | S (menor) | [V] sellado | Origen `A`: Registro Civil (TE) — bloqueado (§2.3) |
| Tipo de retiro | radio | S | [C] | Personal · Por apoderado (poder notariado + cédula e idoneidad) |
| Pago | select | S | [C] | **B/.10.00** estatus (o timbres de naturalización) |

* **(d) Validaciones y reglas (§7.1):** ficha CSS **90 días y 9 cuotas** (§7.1 la asocia a P-25, aunque la fuente no pide ficha CSS en esta pantalla — ver Anexo A); timbre de naturalización B/.8.00; retiro por apoderado exige poder notariado + cédula e idoneidad; modo **consulta mínimo** hasta que el PO confirme la emisión en línea.
* **(e) Estados de trámite visibles:** no aplica (servicio); el certificado se entrega tras `NOTIFICADO → ENTREGADO`.
* **(f) Fixture sugerida:** `js/fixtures/p-25-certificaciones.json` (estatus y movimiento; menor con representante).
* **(g) Nota de integración:** HU-04 / TASK-04.5 (modo consulta mínimo); backend HU-15 + catálogo de certificados **POR DEFINIR (PO)**.

---

### P-26 Naturalización — flujo específico — Fase D · `#/servicios/naturalizacion`

* **(a) Objetivo:** desplegar el flujo específico de la Carta de Naturaleza (N-1 a N-13) cuando el trámite es Naturalización; **requiere abogado**.
* **(b) Rol dueño y acceso:** `SOLICITANTE` con abogado del despacho (apoderado con cédula e idoneidad, P-08); el entrevista/examen los valida el despacho (I-06/I-10).
* **(c) Checklist de campos (pasos exactos de la fuente; se reutiliza el stepper del asistente):**

| Paso (fuente) | Campos / documentos pedidos | Etiquetas |
|---|---|---|
| **N-1 Apoderado** | Nombre, dirección, teléfonos y correo del abogado; cédula e idoneidad; autorización notariada del pasante | [C] |
| **N-2 Poder y solicitud** | Datos del peticionario (nombre como en pasaporte, estatus y carné E; domicilio; sexo; edad; estado civil; lugar y nacionalidad de nacimiento; carné E y pasaporte; correo y teléfonos; nombres y nacionalidad de los padres); fundamento de derecho (numeral 1, 2 o 3 del Art. 10); constancia de servicio público | [C] la captura; [D] sellados carné E/estatus (origen `A`/`S`) |
| **N-3 Datos migratorios** | Carné E (autenticado, B/.2.00); certificación de estatus migratorio "para uso de Naturalización" (B/.8.00, 90 días); copia completa del pasaporte con sello de registro (apostillado/consular y con Relaciones Exteriores) | [C] archivos; [V] sellado carné E (TE) |
| **N-4 Antecedentes penales** | Antecedentes del país de residencia de los últimos 5 años o de origen (30 días de vigencia) y de Panamá; declaración jurada de no salida del país por más de 3 meses si aplica | [C] |
| **N-5 Vínculos familiares** | Certificado de matrimonio (B/.3.00), de nacimiento del cónyuge, de hijos panameños, de padre/madre panameño, de inscripción de naturalización (B/.3.00) — Registro Civil (TE) | [V] sellados (§2.3) |
| **N-6 Solvencia económica (2 de 5 opciones)** | Declaración de renta de 2 años con recibo · Carta bancaria de 4 cifras medias (30 días) · Carta de trabajo + ficha CSS de 9 cuotas notariada (90 días) · Certificación de jubilación · Inversión (constancia de propiedad o acciones) | [C]; la certificación bancaria y la propiedad admiten sello [V] (origen `A`) |
| **N-7 Dependiente (ama de casa / estudiante)** | Carta de responsabilidad, copia autenticada y timbrada (B/.2.00) del responsable, paz y salvo de la DGI del responsable, comprobación de vínculos | [C]; paz y salvo DGI [V] pendiente (§2.3) |
| **N-8 Entrevista (8 páginas)** | Datos personales; estructura familiar y condiciones de vida; historial laboral, ingresos y educación; situación legal migratoria; relación con el país de origen; conocimientos culturales y cívicos; razones migratorias; antecedentes y redes sociales. **Adjunto:** formato escaneado completado con bolígrafo azul y letra imprenta | [C] |
| **N-9 Paz y salvo DGI** | Número de confirmación, nombre y firma | [C]; [V] pendiente si DGI habilita servicio (§8.2) |
| **N-10 Salud y fotos** | Certificado médico general de buena salud (90 días, con carné E, sello y firma); 3 fotos carné (3.5 × 4.5 cm, vestimenta formal) | [C] (dato sensible: consentimiento expreso, Ley 81/DE 285) |
| **N-11 Ley de Reciprocidad** | Fotocopia autenticada en consulado + certificación de Relaciones Exteriores, o certificación de existencia y vigencia de la ley (según numeral 3) | [C] |
| **N-12 Examen de conocimientos del TE** | Registro del resultado o de la exoneración (reciprocidad España/América Latina, estudios en Panamá, discapacidad con certificación médica) | [C] (registro del resultado) |
| **N-13 Declaración jurada y firma** | Ante notario, B/.8.00 en timbres, vigencia 1 año; motivos, renuncia a la nacionalidad, huella; advertencia del Art. 385 del Código Penal | [C] |

* **(d) Validaciones y reglas (§7.1):** antecedentes 30 días; salud, estatus y carta bancaria 90 días; ficha CSS 90 días y 9 cuotas notariada; documentos del exterior: apostilla/legalización y Relaciones Exteriores; reglas de naturalización de P-10 (salida > 3 meses en los últimos 5 años) y P-16 (renuncia a la nacionalidad); solvencia 2 de 5 opciones en N-6.
* **(e) Estados de trámite visibles:** aplica el flujo general (P-19); la naturalización concluye en `RESUELTO` y, si procede, inscripción.
* **(f) Fixture sugerida:** `js/fixtures/p-26-naturalizacion.json` (flujo completo N-1…N-13 y escenario con exoneración en N-12).
* **(g) Nota de integración:** HU-04 / TASK-04.4 (reutiliza componentes del asistente); backend HU-15, HU-17 y HU-19.

---

### P-27 Ayuda, FAQ y peticiones — Fase D · `#/servicios/ayuda`

* **(a) Objetivo:** recibir consultas, peticiones y el canal de ejercicio de derechos ARCO.
* **(b) Rol dueño y acceso:** `SOLICITANTE` — pantalla consultiva del portal; el despacho atiende las peticiones internamente (**pantalla interna de atención: POR DEFINIR (PO)**; la fuente no incluye pantalla I- para peticiones).
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta |
|---|---|---|---|
| Tipo de consulta | select | S | [C] (catálogo de tipos **POR DEFINIR (PO)**) |
| Número de expediente (si tiene) | texto | N | [C] |
| Descripción | texto largo | S | [C] |
| Adjunto | archivo | N | [C] |
| Correo de respuesta | email | S | [C] |

* **(d) Validaciones y reglas (§7.1):** Ley 81: el ejercicio de **derechos ARCO** se canaliza desde P-27 (Sprint 3, formulario ARCO); notificación de brechas también por este canal; formato/tamaño del adjunto (CP-05).
* **(e) Estados de trámite visibles:** no aplica.
* **(f) Fixture sugerida:** `js/fixtures/p-27-ayuda.json`.
* **(g) Nota de integración:** HU-04 / TASK-04.5; formulario de derechos ARCO y consentimiento → HU nueva del backlog (Sprint 3, endpoints HU-11). CP-14 (ARCO), CP-05.

---

## §5. Módulo interno del despacho (I-01 … I-18) — Fases E y F (inicio del Sprint 2)

> **Planificado en el Sprint 1, construido al inicio del Sprint 2** (HU-05, fases E ≈ 60 h y F ≈ 25 h). Mismo formato que §4. Acceso por rol según `06-roles-y-accesos.md` §6.4; la UI solo oculta lo que el backend rechaza. Los campos de origen `A`/`S` que en el portal aparecen sellados aquí se **registran** en modo manual asistido.

### I-01 Login institucional con MFA — Fase E · `#/interno/login`

* **(a) Objetivo:** autenticar al personal del despacho con segundo factor obligatorio.
* **(b) Rol dueño y acceso:** todos los roles internos (`FUNCIONARIO`, `SUPERVISOR`, `AUDITOR`, `ADMIN`) — pantalla pública del módulo interno.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Usuario corporativo | texto | S | [C] | Directorio institucional (en MVP, usuarios de fixture) |
| Contraseña | contraseña | S | [C] | Política de dominio |
| Segundo factor (token/SMS) | numérico | S | [C] | Obligatorio para analistas, resolutores y administradores — **MFA simulado** (código de un solo uso) |
| Estación / IP | automático | — | [D] | Se registra en la bitácora (I-16) |

* **(d) Validaciones y reglas (§7.1):** timeout de sesión y bitácora de intentos (HU-05); sin credenciales ni secretos en el cliente; mensaje genérico de fallo (CP-02).
* **(e) Estados de trámite visibles:** no aplica; al autenticar → ruta inicial del rol (§2.1).
* **(f) Fixture sugerida:** `js/fixtures/i-01-login-interno.json` (usuarios de prueba por rol).
* **(g) Nota de integración:** HU-05 / TASK-05.1 (Sprint 2); backend HU-12 (autenticación real, Sprint 2). CP-01, CP-02.

---

### I-02 Tablero de gestión — Fase E · `#/interno/tablero`

* **(a) Objetivo:** resumir la carga de trabajo del despacho y sus alertas operativas.
* **(b) Rol dueño y acceso:** `FUNCIONARIO`; `SUPERVISOR` y `AUDITOR` en lectura; indicadores **por rol** (HU-05).
* **(c) Checklist de campos (sin campos de entrada; indicadores de la fuente):**

| Indicador (fuente) | Tipo | Etiqueta |
|---|---|---|
| Solicitudes recibidas hoy | numérico | [D] |
| En análisis | numérico | [D] |
| Con observaciones pendientes | numérico | [D] |
| En resolución | numérico | [D] |
| Tiempo promedio por etapa (base de la meta de reducción del rango actual de 3–8 meses) | numérico | [D] |
| Verificaciones externas fallidas | numérico | [D] |

* **(d) Validaciones y reglas (§7.1):** los tiempos por etapa sin datos oficiales usan la línea base **3–8 meses** (§8.1); meta de reducción: **POR DEFINIR (PO)**.
* **(e) Estados de trámite visibles:** contadores por estado del flujo §7.2 (EN ANÁLISIS, CON OBSERVACIONES, EN RESOLUCIÓN…).
* **(f) Fixture sugerida:** `js/fixtures/i-02-tablero.json`.
* **(g) Nota de integración:** HU-05 / TASK-05.2 (Sprint 2); backend HU-16 y HU-22 (auditoría) más HU-26 (verificaciones). CP-09.

---

### I-03 Bandeja de recepción (citas y turnos) — Fase E · `#/interno/recepcion`

* **(a) Objetivo:** gestionar la cola de citas y turnos del día con filtros, ordenación y paginación.
* **(b) Rol dueño y acceso:** `FUNCIONARIO` de recepción (permisos `consultar`, `verificar`, `observar`).
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Origen en la fuente |
|---|---|---|---|---|
| Turno / tiquete (letra y número) | — | S | [D] | P-18 |
| Fecha y hora de la cita | — | S | [D] | P-18 |
| Titular y tipo de trámite | — | S | [D] | P-07 |
| Número de expediente / QR | texto/escáner | S | [D] | P-17 |
| Estado de llegada | select | S | [C] | En espera · Atendido · No asistió |

*Colas y filtros (HU-05):* estado, trámite, fecha, responsable.
* **(d) Validaciones y reglas (§7.1):** lectura del QR como atajo al expediente; expediente ajeno/inalcanzable → 404 sin datos (CP-03).
* **(e) Estados de trámite visibles:** estado de llegada (En espera · Atendido · No asistió) y el estado del expediente al abrirlo.
* **(f) Fixture sugerida:** `js/fixtures/i-03-bandeja-recepcion.json`.
* **(g) Nota de integración:** HU-05 / TASK-05.2; backend HU-16/TASK-16.3 (Sprint 3). CP-03.

---

### I-04 Recepción y verificación de completitud — Fase E · `#/interno/completitud`

* **(a) Objetivo:** recepcionar el expediente verificando identidad, pagos, sello de ingreso, RUEX y completitud, y emitir observaciones si está incompleto.
* **(b) Rol dueño y acceso:** `FUNCIONARIO` de recepción (`verificar`, `observar`).
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Identidad del presentante | consulta | S | [D] sellado | RUEX, carné o cédula; si es apoderado: poder (archivo [C]) |
| Verificación de pagos (cheques/recibos) | checklist | S | [C] | Monto, concepto, banco y estado del cheque |
| Verificación del sello de ingreso | consulta | S | [D] sellado | Registro de entradas (origen `S`) |
| Estado del RUEX | consulta | S | [D] sellado | vigente / vencido / con multa |
| Revisión casilla por casilla (igual que P-14) | checklist | S | [C]/[V] | Completa e incompleta; mismas casillas que P-14 |
| Observaciones del Recepcionista | texto largo | Cond. | [C] | **Obligatorio** si el expediente está incompleto ("No se recibirán solicitudes incompletas") |
| Recibo de expediente | botón | — | [D] | Genera Registro N.º / Trámite N.º / Expediente N.º |
| Fecha y hora de recibido | automático | — | [D] | Inicia el conteo del tiempo de atención |

* **(d) Validaciones y reglas (§7.1):** montos B/.250.00 Tesoro Nacional y B/.800.00 SNM en la verificación de pagos; un expediente incompleto no se admite; las consultas a fuentes externas quedan registradas (I-16) y, en el MVP, se registran manualmente desde I-07.
* **(e) Estados de trámite visibles:** `RECIBIDO` (al recibo) o `CON OBSERVACIONES` (si está incompleto).
* **(f) Fixture sugerida:** `js/fixtures/i-04-completitud.json` (completo e incompleto).
* **(g) Nota de integración:** HU-05 / TASK-05.2; backend HU-16 (Sprint 3), HU-20 (observaciones, Sprint 4). CP-06.

---

### I-05 Asignación de analista — Fase E · `#/interno/asignacion`

* **(a) Objetivo:** asignar el expediente al analista adecuado con prioridad y fecha límite.
* **(b) Rol dueño y acceso:** `FUNCIONARIO` de recepción / coordinación de mesa (`consultar`, `observar`).
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Analista asignado | select | S | [C] | Disponibilidad y especialidad (visas, residencias, naturalización) |
| Prioridad | select | N | [C] | Ordinaria · Plazo legal (p. ej. cambio de nacionalidad 48 h) |
| Fecha límite sugerida | fecha | — | [D] | Calculada por tipo de trámite |
| Observación de asignación | texto | N | [C] | — |

* **(d) Validaciones y reglas (§7.1):** plazos oficiales del catálogo I-14 (cambio de nacionalidad **48 h**; corrección de filiación **mismo día**); confirmación antes de asignar (HU-05).
* **(e) Estados de trámite visibles:** el expediente pasa a `EN ANÁLISIS` tras la asignación.
* **(f) Fixture sugerida:** `js/fixtures/i-05-asignacion.json` (analistas por especialidad).
* **(g) Nota de integración:** HU-05 / TASK-05.2; backend HU-16 y HU-13 (permisos reales). CP-04.

---

### I-06 Análisis del expediente (checklist) — Fase E · `#/interno/analisis`

* **(a) Objetivo:** revisar requisitos y vigencias, pedir verificaciones externas y decidir la conformidad del expediente.
* **(b) Rol dueño y acceso:** `FUNCIONARIO` abogado analista (`consultar`, `verificar`, `observar`, proponer resolución); también accede el resolutor; vista ampliada con documentos, historial y requisitos del catálogo I-14 (HU-05 CA-3); línea de tiempo del expediente (HU-21).
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Requisitos comunes (Art. 28) | checklist | S | [C]/[V] | Cada casilla con estado y motivo |
| Requisitos específicos del permiso | checklist | S | [C]/[V] | Cargados desde el catálogo (I-14) |
| Vigencias de los documentos | cálculo automático | — | [D] | 30/90 días; marca "vencido" |
| ¿Solicitud conforme? | radio SÍ / NO | S | [C] | SÍ → admisión (I-09/I-10) · NO → observación (I-08) |
| Observación del Analista | texto largo | Cond. | [C] | Ítems observados con plazo de atención |
| Verificaciones externas requeridas | multiselección | S | [C] | TE · CSS · Registro Público · SNM (abre I-07) |
| Dictamen técnico preliminar | texto | N | [C] | — |

* **(d) Validaciones y reglas (§7.1):** antecedentes **30 días**; salud, estatus migratorio y carta bancaria **90 días**; ficha CSS **90 días y 9 cuotas**; la casilla es la misma que en P-14; sin inconsistencias abiertas para pasar a I-10.
* **(e) Estados de trámite visibles:** `EN ANÁLISIS` → `ADMITIDO` (conforme) o `CON OBSERVACIONES` (no conforme).
* **(f) Fixture sugerida:** `js/fixtures/i-06-analisis.json` (conforme, no conforme y con vigencias vencidas).
* **(g) Nota de integración:** HU-05 / TASK-05.2–05.3; backend HU-16 (Sprint 3), HU-21 (línea de tiempo, Sprint 4), HU-26 (verificaciones, Sprint 5). CP-04, CP-06.

---

### I-07 Panel de verificación interoperable — Fase E · `#/interno/verificaciones`

> **Pantalla estrella del modo manual asistido.** En el MVP no hay convenios con las instituciones: la verificación es **manual asistida** y el abogado del despacho registra aquí el resultado de cada verificación externa, que el portal refleja sellado en los campos [V].

* **(a) Objetivo:** mostrar y registrar el resultado de cada consulta/verificación externa del expediente, distinguiendo el error técnico del resultado negativo.
* **(b) Rol dueño y acceso:** `FUNCIONARIO` con permiso `verificar` (analista, resolutor); `SUPERVISOR`/`AUDITOR` en lectura (trazabilidad); `ADMIN` y `SOLICITANTE` sin acceso (el cliente solo ve el estado agregado en P-19). Todo acceso queda en I-16.
* **(c) Checklist de campos (elementos de la fuente + registro manual asistido):**

| Elemento (fuente / HU-05) | Contenido | Etiqueta |
|---|---|---|
| Institución consultada | TE · CSS · Registro Público · SNM (y MITRADEL/DGI si habilita) | [C] |
| Dato solicitado | Ej.: identidad, matrimonio, afiliación, propiedad, RUEX | [C] |
| **Modo** de verificación | En el MVP: **manual asistido**; futuro convenio: automática | [C] (en MVP, solo modo manual) |
| Resultado | Coincide · No coincide · Sin dato · Error de servicio (escenarios `OK`, `SIN_RESULTADO`, `ERROR_TECNICO`, `TIMEOUT`) | [C] registro manual en MVP |
| Fecha de la verificación | Fecha en que el despacho realizó/registró la consulta | [C] |
| Valor retornado | Solo los campos autorizados para la finalidad del trámite (minimización) | [D] en convenio futuro; en MVP el despacho registra el resultado mínimo |
| Identificador de la consulta y marca de tiempo | Sello de la respuesta | [D] |
| Fuente y responsable | Institución origen + responsable del registro | [C] (responsable) / [D] |
| Evidencia descargable | Oficio/constancia electrónica para el expediente | [C] (archivo de evidencia) |
| Acción | Registrar como verificado · Marcar inconsistencia (→ observación en I-08) · Repetir consulta | — |

*Campos del registro manual asistido (HU-05 CA-7 + doc de roles §6.6): **fuente, tipo, modo, fecha, resultado, referencia y responsable**.*
* **(d) Validaciones y reglas (§7.1):** distinción visual **error técnico vs. resultado negativo** (CP-07: el error técnico nunca se convierte en resultado negativo); reintento solo cuando el estado lo permite, avisando que la operación es **idempotente** (CP-08); discrepancia ⇒ observación automática en I-08/P-20 (regla 4); sin consulta masiva: solo con expediente asociado (regla 5); toda consulta registrada en I-16 (regla 3); si la fuente no responde, el requisito vuelve al checklist del cliente como carga manual (regla 2).
* **(e) Estados de trámite visibles:** estados propios de verificación (`OK`/pendiente/`SIN_RESULTADO`/`ERROR_TECNICO`/`TIMEOUT`); una inconsistencia abierta bloquea `EN RESOLUCIÓN` (I-10).
* **(f) Fixture sugerida:** `js/fixtures/i-07-verificaciones.json` (un registro por institución y por escenario: `OK`, `SIN_RESULTADO`, `ERROR_TECNICO`, `TIMEOUT`, más registros manuales).
* **(g) Nota de integración:** HU-05 / TASK-05.3 (Sprint 2); backend `POST`/`GET /api/expedientes/{id}/validaciones` en HU-26/TASK-26.1–26.2 (Sprint 5). CP-06, CP-07, CP-08.

---

### I-08 Emisión y atención de observaciones — Fase E · `#/interno/observaciones`

* **(a) Objetivo:** emitir observaciones con plazo y dar seguimiento a la atención del cliente (P-21).
* **(b) Rol dueño y acceso:** `FUNCIONARIO` — recepción (emisión) y analista (emisión); `SOLICITANTE` solo ve las propias en P-20; `AUDITOR` en lectura.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Tipo de observación | select | S | [C] | Recepción · Analista |
| Ítems observados (checklist) | multiselección | S | [C] | Vinculados a P-20/P-21 |
| Descripción y plazo | texto/fecha | S | [C] | Texto obligatorio (HU-05 CA-5); lista autor, fecha y respuesta |
| Medio de notificación | select | S | [C] | Portal · correo · SMS |
| Atención recibida | archivo/dato | S | [D] | Lo carga el cliente en P-21 |
| Reingreso completo | checkbox | S | [C] | Regla: todas las observaciones en un solo reingreso |
| Estado resultante | — | — | [D] | Vuelve a `EN ANÁLISIS` o `ARCHIVADO` si vence el plazo |

* **(d) Validaciones y reglas (§7.1):** un solo reingreso con todas las observaciones atendidas; una observación no cambia el estado en la interfaz del cliente (HU-20); sin datos confidenciales en los textos visibles al cliente.
* **(e) Estados de trámite visibles:** `CON OBSERVACIONES` → `EN ANÁLISIS` (tras reingreso) o `ARCHIVADO` (plazo vencido).
* **(f) Fixture sugerida:** `js/fixtures/i-08-observaciones.json` (emitida, atendida y vencida).
* **(g) Nota de integración:** HU-05 / TASK-05.3; backend HU-20/TASK-20.2 (Sprint 4) y HU-18 (notificaciones). CP-04, CP-09.

---

### I-09 Edictos y publicaciones — Fase E · `#/interno/edictos`

* **(a) Objetivo:** publicar y retirar edictos con historial inmutable.
* **(b) Rol dueño y acceso:** `FUNCIONARIO` abogado analista; el cliente los consulta en P-24.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Número de edicto / expediente | texto | S | [D] | Generado en la admisión |
| Titular | texto | S | [D] | P-09 |
| Tipo de publicación | select | S | [C] | Edicto de admisión · Oposición · Notificación |
| Fecha de publicación y de vencimiento | fechas | S | [C] | — |
| Texto del edicto | texto largo | S | [C] | — |
| Publicar / retirar | botón | S | [C] | Historial inmutable |

* **(d) Validaciones y reglas (§7.1):** el retiro no borra: el historial es inmutable (auditoría I-16); minimización: el texto del edicto no expone datos innecesarios del titular (visible al cliente en P-24).
* **(e) Estados de trámite visibles:** publicación asociada a `ADMITIDO` (edicto de admisión) y `NOTIFICADO`.
* **(f) Fixture sugerida:** `js/fixtures/i-09-edictos.json`.
* **(g) Nota de integración:** HU-05 / TASK-05.3; backend HU-19 (máquina de estados) y HU-22 (auditoría). CP-04.

---

### I-10 Resolución (aprobar / negar) — Fase E · `#/interno/resolucion`

* **(a) Objetivo:** decidir el expediente (aprobar o negar) con todas las precondiciones cumplidas.
* **(b) Rol dueño y acceso:** `FUNCIONARIO` con permiso **`resolver`** (abogado resolutor — único rol que decide); el `ADMIN` no tiene acceso a decidir expedientes.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Expediente y trámite | — | S | [D] | Prellenado |
| Verificaciones concluidas (I-07) | resumen | — | [D] | Ninguna inconsistencia abierta |
| Resultado | radio | S | [C] | APROBADA / NEGADA |
| Motivo de negación (catálogo + detalle) | select/texto | Cond. | [C] | Obligatorio si es NEGADA (catálogo de motivos **POR DEFINIR (PO)**) |
| Condiciones de la resolución | texto | N | [C] | Vigencia, limitaciones, obligaciones |
| Fecha de resolución y número de resolución | fecha/texto | S | [D] | Autogenerados |
| Saldo por cancelar | numérico | N | [D] | Validado antes de la entrega |
| Vigencia del permiso (desde / hasta) | fechas | S | [C] | Alimenta P-22 y alertas de prórroga |
| Firma digital del resolutor | firma | S | [C] | Firma simulada en el MVP |

* **(d) Validaciones y reglas (§7.1):** mostrar **solo las transiciones disponibles**; las no permitidas aparecen deshabilitadas con explicación; motivo obligatorio en estados finales; confirmación antes de enviar; un `409`/`403` conserva la vista con el estado original y explica el motivo (CP-04); matriz de transiciones **POR DEFINIR (PO)** (TASK-19.1, Sprint 4).
* **(e) Estados de trámite visibles:** `EN RESOLUCIÓN` → `RESUELTO (APROBADA | NEGADA)`; la vigencia del permiso alimenta `VIGENTE / EN PRÓRROGA / VENCIDO / INDEFINIDO / CANCELADO OFICIOSO` (P-22).
* **(f) Fixture sugerida:** `js/fixtures/i-10-resolucion.json` (aprobada, negada y transición no permitida).
* **(g) Nota de integración:** HU-05 / TASK-05.3; backend HU-19/TASK-19.4 (Sprint 4, transiciones dinámicas). CP-04.

---

### I-11 Notificación — Fase E · `#/interno/notificacion`

* **(a) Objetivo:** notificar la resolución al cliente y generar la constancia.
* **(b) Rol dueño y acceso:** `FUNCIONARIO` notificador (permiso `notificar`); el cliente la ve en P-19/P-20/P-22.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Medio de notificación | select | S | [C] | Portal · correo · edicto · cita |
| Plazo de retiro | fecha | S | [C] | — |
| Texto de la comunicación | texto largo | S | [C] | — |
| Constancia de notificación | documento | — | [D] | Con fecha y medio; archivada en el expediente |

* **(d) Validaciones y reglas (§7.1):** medio preferido heredado de P-05 como sugerencia; la notificación por edicto se materializa en I-09/P-24.
* **(e) Estados de trámite visibles:** `NOTIFICADO`.
* **(f) Fixture sugerida:** `js/fixtures/i-11-notificacion.json`.
* **(g) Nota de integración:** HU-05 / TASK-05.3; backend HU-18 (notificaciones) y HU-19. CP-04.

---

### I-12 Entrega en ventanilla — Fase E · `#/interno/entrega`

* **(a) Objetivo:** entregar resolución, carné y certificaciones con verificación de identidad del retirador.
* **(b) Rol dueño y acceso:** `FUNCIONARIO` notificador / ventanilla (permiso `notificar`).
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Identidad de quien retira | consulta | S | [D] sellado | Documento de identidad original |
| Si es apoderado | checklist | S | [C] | Poder notariado + idoneidad + cédula |
| Documentos a entregar | multiselección | S | [C] | Resolución · carné · certificación |
| Estampado / carné digital emitido | acción | S | [V] sellado | Origen `A`: datos biométricos; carné E → Tribunal Electoral (bloqueado en MVP, §2.3) |
| Saldos pendientes cancelados | checkbox | S | [C] | Validado contra el saldo de I-10 |
| Fecha de entrega y firma de recibido | — | S | [D] | Estado → ENTREGADO |

* **(d) Validaciones y reglas (§7.1):** descarga/entrega solo con autorización (CP-12); no se entrega con saldos pendientes; identidad original obligatoria (§8.4: trámites que exigen retiro con identificación).
* **(e) Estados de trámite visibles:** `ENTREGADO`.
* **(f) Fixture sugerida:** `js/fixtures/i-12-entrega.json`.
* **(g) Nota de integración:** HU-05 / TASK-05.3; backend HU-19, HU-17 (documentos). CP-12.

---

### I-13 Expedientes archivados y reactivación — Fase E · `#/interno/archivo`

* **(a) Objetivo:** archivar expedientes con motivo y reactivarlos con nuevo turno y pago.
* **(b) Rol dueño y acceso:** `FUNCIONARIO` notificador en **lectura** (doc de roles §6.4); quién ejecuta el archivo y la reactivación: **POR DEFINIR (PO)** (la matriz de accesos no asigna la acción a un rol concreto).
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Motivo de archivo | select | S | [C] | Observaciones no atendidas · No retiro en plazo · Desistimiento |
| Fecha de archivo | fecha | S | [D] | — |
| Reactivación: nuevo turno y pago | acción/checkbox | S | [C] | Reinicia en RECIBIDO |
| Nota de archivo | texto | N | [C] | — |

* **(d) Validaciones y reglas (§7.1):** la reactivación reinicia en `RECIBIDO` y exige nuevo turno (P-18/I-03) y pago (P-15/P-23); el archivo se produce por plazo vencido de observaciones (I-08).
* **(e) Estados de trámite visibles:** `ARCHIVADO` → reactivado: `RECIBIDO`.
* **(f) Fixture sugerida:** `js/fixtures/i-13-archivo.json` (archivado por cada motivo y expediente reactivado).
* **(g) Nota de integración:** HU-05 / TASK-05.3; backend HU-19 (transición a ARCHIVADO) y HU-16. CP-04.

---

### I-14 Catálogos: trámites, requisitos, tasas y vigencias — Fase F · `#/interno/catalogos`

* **(a) Objetivo:** mantener los catálogos que gobiernan todo el producto (trámites, requisitos, tasas, vigencias y verificaciones asociadas), con versionado.
* **(b) Rol dueño y acceso:** `ADMIN` (el único que administra catálogos; sin acceso a decidir expedientes).
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Código y nombre del trámite | texto | S | [C] | PM1–PM18, RP, RT, RUEX, certificados, naturalización |
| Categoría y estado legal | select | S | [C] | Fundamento (D.L. 3/2008, D.E. 320/2008, decretos vigentes) |
| Requisitos (lista editable) | filas | S | [C] | Coincide con el PDF oficial y con P-14 / I-06 |
| Vigencia por documento | numérico (días) | S | [C] | 30 / 90 días según requisito |
| Tasas y conceptos | filas | S | [C] | Tesoro Nacional, SNM, timbres, garantías |
| Verificaciones externas asociadas | multiselección | S | [C] | TE, CSS, Registro Público |
| Plazos oficiales | numérico | N | [C] | Ej.: cambio de nacionalidad 48 h; corrección mismo día |
| Versión y fecha de vigencia | automático | — | [D] | Toda modificación conserva la versión anterior (trámites ya presentados) |

* **(d) Validaciones y reglas (§7.1):** toda modificación conserva la versión anterior — los expedientes presentados se resuelven contra la versión vigente al envío (§8.5); alta/baja simple (HU-05 CA-8); los valores por defecto de este catálogo alimentan los fixtures del portal (P-07, P-14, P-15, P-19).
* **(e) Estados de trámite visibles:** no aplica (administración); el estado legal del trámite es dato del catálogo.
* **(f) Fixture sugerida:** `js/fixtures/i-14-catalogos.json` (es el mismo catálogo base que usa el portal: `catalogo-tramites.json`).
* **(g) Nota de integración:** HU-05 / TASK-05.4; backend HU-13 (permisos) y catálogo de tipos documentales TASK-17.1 (Sprint 3). CP-01, CP-03.

---

### I-15 Usuarios, roles y permisos — Fase F · `#/interno/usuarios`

* **(a) Objetivo:** administrar las cuentas del despacho con permisos granulares y fuentes de verificación habilitadas por finalidad.
* **(b) Rol dueño y acceso:** `ADMIN`; la consulta de roles en modo lectura es para `AUDITOR` (HU-05 CA-8).
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Obl. | Etiqueta | Nota de la fuente |
|---|---|---|---|---|
| Nombre, cédula, cargo y sección | texto/select | S | [C] | — |
| Rol | select | S | [C] | Roles de la sección 1.2 de la fuente (agrupados en SOLICITANTE/FUNCIONARIO/SUPERVISOR/AUDITOR/ADMIN) |
| Permisos granulares | multiselección | S | [C] | consultar, verificar, observar, resolver, notificar |
| Instituciones habilitadas para consultar | multiselección | S | [C] | Mínimo necesario por finalidad |
| Vigencia de la cuenta y estado | fecha/select | S | [C] | — |
| Último acceso | automático | — | [D] | — |

* **(d) Validaciones y reglas (§7.1):** confirmación antes de asignar/quitar permisos; deshabilitación de cuenta conservando la auditoría; separación técnico–funcional (el `ADMIN` no obtiene permisos de consulta/decisión de expedientes); permisos de fuentes por finalidad y con revisión periódica (**plazo de revisión POR DEFINIR (PO)**, §6.13-3 del doc de roles).
* **(e) Estados de trámite visibles:** no aplica (administración); estado de la cuenta (activa/inactiva).
* **(f) Fixture sugerida:** `js/fixtures/i-15-usuarios.json` (un usuario por cada rol y granularidad).
* **(g) Nota de integración:** HU-05 / TASK-05.4; backend HU-13 (matriz de permisos TASK-13.1, Sprint 2) y HU-22 (auditoría de cambios). CP-01, CP-09.

---

### I-16 Bitácora de auditoría — Fase F · `#/interno/bitacora`

* **(a) Objetivo:** consultar la bitácora inmutable de accesos y operaciones (obligación de la Ley 81).
* **(b) Rol dueño y acceso:** `AUDITOR` — **solo lectura**; `SUPERVISOR` consulta reportes derivados; la propia consulta de la bitácora queda registrada.
* **(c) Checklist de campos (solo lectura; registros inmutables de la fuente):**

| Registro (fuente) | Tipo | Etiqueta |
|---|---|---|
| Usuario | texto | [D] |
| Fecha / hora | fecha-hora | [D] |
| IP | texto | [D] |
| Pantalla | texto | [D] |
| Acción | texto | [D] |
| Expediente afectado | texto | [D] |
| Dato consultado (verificación externa) | texto | [D] |
| Creación / modificación / eliminación | texto | [D] |
| Exportación | texto | [D] |
| Fallos de autenticación | texto | [D] |

*Filtros (fuente):* fecha, usuario, expediente, institución y tipo de acción · Exportación CSV (HU-05 CA-8).
* **(d) Validaciones y reglas (§7.1):** sin edición ni borrado desde la aplicación; sin contraseñas, tokens ni datos personales innecesarios en los eventos; toda denegación (403/404) genera evento.
* **(e) Estados de trámite visibles:** no aplica (consulta); los eventos reflejan los cambios de estado del §7.2.
* **(f) Fixture sugerida:** `js/fixtures/i-16-bitacora.json` (eventos por tipo: sesión, expediente, documento, verificación, exportación, denegación).
* **(g) Nota de integración:** HU-05 / TASK-05.4; backend HU-22/TASK-22.4 (Sprint 4). CP-09, CP-01.

---

### I-17 Reportes y tiempos por etapa — Fase F · `#/interno/reportes`

* **(a) Objetivo:** medir tiempos, volúmenes y cumplimiento de plazos, con periodo configurable y exportación.
* **(b) Rol dueño y acceso:** `SUPERVISOR` y `AUDITOR` (HU-05 CA-8); gráficos sencillos.
* **(c) Checklist de campos (reportes de la fuente):**

| Reporte (fuente) | Contenido | Etiqueta |
|---|---|---|
| Tiempo por etapa | Recepción → análisis → resolución → entrega (promedio, mediana, máximo) | [D] |
| Tiempo total por trámite | Base para comparar contra el rango actual de **3–8 meses** | [D] |
| Motivos de demora | Expedientes incompletos, observaciones, verificaciones fallidas | [D] |
| Volumen por trámite, oficina y analista | — | [D] |
| Cumplimiento de plazos legales | Alertas de vencimiento | [D] |
| Verificaciones externas | Volumen y tasa de éxito por institución | [D] |
| Exportación | CSV/PDF con fecha de corte | [D] |

* **(d) Validaciones y reglas (§7.1):** la línea base de tiempos es **3–8 meses**; la meta de reducción y los desgloses oficiales por etapa son **POR DEFINIR (PO)** (§8.1: medir antes de fijar la meta); exportación auditada.
* **(e) Estados de trámite visibles:** agregados por estado del §7.2.
* **(f) Fixture sugerida:** `js/fixtures/i-17-reportes.json` (con periodo configurable y exportación simulada).
* **(g) Nota de integración:** HU-05 / TASK-05.4; backend HU-22 (auditoría) y HU-26 (métricas de verificación, Sprint 5). CP-09.

---

### I-18 Salud de las conexiones de interoperabilidad — Fase F · `#/interno/conexiones`

* **(a) Objetivo:** supervisar el estado de las conexiones externas y activar el modo de contingencia.
* **(b) Rol dueño y acceso:** `ADMIN`; `SUPERVISOR` y `AUDITOR` en lectura.
* **(c) Checklist de campos:**

| Campo (fuente) | Tipo | Etiqueta | Nota de la fuente |
|---|---|---|---|
| Institución y endpoint | — | [D] | Catálogo de conexiones |
| Estado | semáforo verde / ámbar / rojo | [D] | Monitoreo continuo |
| Última respuesta y tiempo de latencia | — | [D] | — |
| Tasa de error últimas 24 h | % | [D] | — |
| Modo de contingencia | select | [C] | Operación manual con verificación diferida |

* **(d) Validaciones y reglas (§7.1):** los errores técnicos y los intentos fallidos se muestran **diferenciados** de los resultados de validación (nunca presentar un fallo de conexión como resultado negativo, CP-07); en el MVP (sin convenios) el catálogo de conexiones y sus métricas vienen del fixture y el modo vigente es **operación manual con verificación diferida**.
* **(e) Estados de trámite visibles:** no aplica (salud de conexiones); el modo de contingencia se refleja en I-07 como modo manual asistido.
* **(f) Fixture sugerida:** `js/fixtures/i-18-conexiones.json` (una institución por estado del semáforo).
* **(g) Nota de integración:** HU-05 / TASK-05.5; backend HU-26 (Sprint 5) y adaptadores HU-23/HU-24. CP-07.

---

## §6. Componentes globales sin ID (transversales)

Pantallas compartidas que no llevan identificador `P-`/`I-` pero que se construyen en la **Fase A (HU-01)** y usan todas las demás:

| Componente | Contenido mínimo | Uso |
|---|---|---|
| Vista de error **403** | "No tiene permiso para acceder a esta pantalla", sin datos del recurso; enlace a la ruta inicial del rol | Guard de rol (§2.1); toda denegación queda en I-16 |
| Vista de error **404** | "No encontramos lo que busca" (también para expedientes ajenos, sin revelar que existen — CP-03) | Ruta desconocida o recurso ajeno |
| Vista de error **500** / error técnico | Mensaje no técnico + botón **Reintento**; nunca muestra detalles del servidor ni un resultado de verificación como fallo ni viceversa (CP-07) | Fallo de servicio/fixture |
| Spinner / bloque de carga | Indicador de carga y esqueleto de listado | Estado "carga" de §2.2 |
| **Modal de confirmación** | Título, texto de la acción irreversible y botones Cancelar/Aceptar | Envíos, resoluciones (I-10), permisos (I-15), cierre de sesión |
| **Cabecera por rol** | Logo/producto, menú según rol (§2.1), identificador del usuario activo, botón cerrar sesión (limpia estado local → `#/login`) | Todas las pantallas autenticadas |
| **Notificaciones / avisos** | Bloques de éxito, aviso e información (no confidenciales), tipo "toast" o banda | Confirmaciones de guardado, alertas de vigencias, resultados de verificación |
| Stepper del asistente | 8 pasos (P-09…P-16) con validación por paso y borrador; se reutiliza en P-26 (N-1…N-13) | Fase C y P-26 |
| Línea de tiempo | Etapas con autor, fecha, cambio y motivo; nivel de detalle por rol | P-19, I-06 (HU-21) |
| Selector de escenarios locales | Cambia el fixture entre carga, éxito, vacío y error | Demostración Sprint 1 (Fase A) |

---

## §7. Reglas de trazabilidad pantalla → HU → CP

Cada pantalla se construye con la HU del backlog que la entrega en el Sprint 1 y se valida con los CP del plan de pruebas (`04-plan-de-pruebas.md`).

| Pantalla(s) | HU de construcción (Sprint 1) | HU de integración posterior | CP relevantes |
|---|---|---|---|
| Todas (transversal, Fase A) | **HU-01** andamiaje, guards, vistas globales, fixtures base | HU-09 (fixtures → mocks), HU-13 (autorización) | CP-03, CP-11, CP-12 |
| P-01 | **HU-02** | HU-12 (TASK-12.5) | CP-01, CP-02 |
| P-02 | **HU-02** | HU-12; HU nueva consentimiento/ARCO (Sprint 3) | CP-01, CP-13 |
| P-03 | **HU-02** | Sigue simulado hasta envío real (HU-12) | CP-02 |
| P-04 | **HU-02** | HU-12 | CP-02 |
| P-05 | **HU-02** | HU-12 | CP-01 |
| P-06 | **HU-03** | HU-16 (TASK-16.3) | CP-03 |
| P-07 | **HU-03** | HU-15 (TASK-15.3) | CP-13 |
| P-08 | **HU-03** | HU-15 | CP-12, CP-13 |
| P-09 … P-13 | **HU-03** (TASK-03.3) | HU-15, HU-26 (bloques [V]) | CP-13 |
| P-14 | **HU-03** | HU-17 (TASK-17.4), HU-26 | CP-05, CP-12 |
| P-15 | **HU-03** (captura simulada sin pasarela) | HU-15; endpoint de pagos POR DEFINIR (PO) | CP-05 |
| P-16 | **HU-03** | HU-15; HU nueva consentimiento (Sprint 3) | CP-13 |
| P-17 | **HU-03** (TASK-03.4) | HU-15 | CP-03 |
| P-18 | **HU-03** (TASK-03.5) | HU-15; catálogo de sedes POR DEFINIR (PO) | — |
| P-19 | **HU-04** (TASK-04.1) | HU-16, HU-21 (TASK-21.2), HU-26 (TASK-26.3) | CP-03, CP-09 |
| P-20 | **HU-04** | HU-18 (TASK-18.3), HU-20 (TASK-20.2) | CP-09 |
| P-21 | **HU-04** (TASK-04.2) | HU-17, HU-20 | CP-05, CP-09 |
| P-22 | **HU-04** (TASK-04.3) | HU-19 (resoluciones), HU-17 (descargas) | CP-12 |
| P-23 | **HU-04** | HU-15; pagos POR DEFINIR (PO) | CP-12 |
| P-24 | **HU-04** (TASK-04.5, modo consulta mínimo) | Publicaciones de I-09 / HU-19 POR DEFINIR (PO) | — |
| P-25 | **HU-04** (TASK-04.5, modo consulta mínimo) | HU-15; catálogo de certificados POR DEFINIR (PO) | CP-12 |
| P-26 | **HU-04** (TASK-04.4) | HU-15, HU-17, HU-19 | CP-05, CP-13 |
| P-27 | **HU-04** | HU nueva ARCO (Sprint 3, HU-11) | CP-05, CP-14 |
| I-01 | **HU-05** (TASK-05.1) | HU-12 (autenticación real) | CP-01, CP-02 |
| I-02 | **HU-05** (TASK-05.2) | HU-16, HU-26 | CP-09 |
| I-03 | **HU-05** | HU-16 | CP-03 |
| I-04 | **HU-05** | HU-16, HU-20 | CP-06 |
| I-05 | **HU-05** | HU-16 | CP-04 |
| I-06 | **HU-05** | HU-16, HU-21, HU-26 | CP-04, CP-06 |
| I-07 | **HU-05** (TASK-05.3) | HU-26 (TASK-26.1, 26.2, 26.4) | CP-06, CP-07, CP-08 |
| I-08 | **HU-05** | HU-20 (TASK-20.2), HU-18 | CP-04, CP-09 |
| I-09 | **HU-05** | HU-19, HU-22 | CP-04 |
| I-10 | **HU-05** | HU-19 (TASK-19.4) | CP-04 |
| I-11 | **HU-05** | HU-18, HU-19 | CP-04 |
| I-12 | **HU-05** | HU-17, HU-19 | CP-12 |
| I-13 | **HU-05** | HU-19 | CP-04 |
| I-14 | **HU-05** (TASK-05.4) | HU-13; catálogo documental TASK-17.1 | CP-01 |
| I-15 | **HU-05** | HU-13 (TASK-13.1), HU-22 | CP-01, CP-09 |
| I-16 | **HU-05** | HU-22 (TASK-22.4) | CP-09 |
| I-17 | **HU-05** | HU-22, HU-26 | CP-09 |
| I-18 | **HU-05** (TASK-05.5) | HU-26; adaptadores HU-23/HU-24 | CP-07 |

**CP transversales** de la rama: **CP-10** (carga: listados y subida de archivos, Sprint 6 con QA) y **CP-11** (OWASP ZAP: XSS, cabeceras, sesión, datos expuestos, Sprint 6).

---

## §8. Definición de terminado (DoD) y capacidad

### §8.1 DoD de pantalla (aplica a las 45)

Una pantalla está terminada cuando:

1. **Campos:** implementa exactamente los campos de `Pantallas_y_Datos_Migracion.md` de su ID — ni más (minimización, Ley 81) ni menos; lo no documentado figura como **POR DEFINIR (PO)** y no se inventa.
2. **Estados:** implementa y muestra los **4 estados** (carga, éxito, vacío, error con reintento) — §2.2.
3. **Permisos:** respeta el guard por rol; las acciones no permitidas no se muestran o están deshabilitadas con explicación (§2.1) — la validación real sigue siendo del backend.
4. **Campos [V]:** sellados como *verificado automáticamente · fuente · fecha · estado* con estado **"pendiente de verificación automática (futuro convenio)"** y **bloqueados** para carga manual (§2.3).
5. **Datos:** funciona con su fixture local en `js/fixtures/` con el **mismo esquema JSON que los mocks de la HU-08** (§2.5).
6. **Responsive y calidad:** funciona en escritorio y tablet, sin errores de consola en el recorrido principal.
7. **Mensajes:** en lenguaje no técnico, sin exponer datos personales ni detalles del servidor.
8. **Ley 81:** sin credenciales, tokens ni datos reales en el cliente; OTP (P-03) y MFA (I-01) simulados; autorización de tratamiento explícita donde la fuente lo exige (P-02, P-16).
9. **Revisión y entrega:** código revisado y fusionado en Git, capturas/documentación actualizadas y **aceptación del PO**.

*DoD adicional del módulo interno (HU-05):* ninguna pantalla muestra expedientes a usuarios sin permiso (CP-03, CP-09) ni ofrece acciones que el backend rechazará; en I-07 el error técnico se distingue visualmente del resultado negativo (CP-07) y el reintento solo aparece cuando el estado lo permite (CP-08).

### §8.2 Nota de capacidad (Sprint 1)

* **Capacidad Sprint 1 ≈ 130 h:** Fase A ~15 h + Fase B ~20 h + Fase C ~60 h + Fase D ~35 h (más el cierre de fases con HU-09, ya contenido en esas horas).
* **Si no alcanza, se recorta la Fase D** priorizando **P-19, P-20, P-21 y P-22**; **P-26 y P-27 quedan para el inicio del Sprint 2**.
* Todo recorte es **decisión del PO** y debe **registrarse en el registro de cambios del backlog** (`05-backlog-siete-sprints.md`), manteniendo actualizado el inventario adoptado de 45 pantallas.
* El **módulo interno I-01…I-18** (HU-05, ≈ 85 h: E 60 h + F 25 h) se ejecuta **al inicio del Sprint 2**; si hay retraso, se mantiene primero la fase E (operación) y la fase F pasa a la primera mitad del Sprint 3, registrando el ajuste.

---

## Anexo A — Inconsistencias y pendientes detectados en las fuentes

> **Registro oficial:** estos 12 hallazgos están registrados como pendientes del PO **PEN-01…PEN-12** en el backlog (`Documentacion/05-backlog-siete-sprints.md`, §5.5) y los gestiona el PO en `Rama-04-Producto-Documentacion.md` (Sprint 1). La tabla siguiente es la referencia detallada.

| # | Hallazgo | Dónde | Tratamiento en este plan |
|---|---|---|---|
| 1 | La cadena de estados visible para el cliente (P-19) **omite `ARCHIVADO`** (y la corrección), que sí aparece en la cadena general §7.2 e I-08/I-13 | `Pantallas…` P-19 vs §7.2 | Se listan ambas cadenas; confirmar con el PO si `ARCHIVADO` es visible para el cliente → **POR DEFINIR (PO)** |
| 2 | §7.1 asocia la regla de **ficha CSS (90 días / 9 cuotas)** a **P-25**, pero P-25 no pide ficha CSS en sus campos | `Pantallas…` §7.1 vs P-25 | Se anota la regla en P-25 sin agregar el campo (no se inventa); aplica realmente en P-12/P-13/N-6 |
| 3 | **P-14 exige 100 % de completitud para habilitar P-16**, pero el paso 7 (**P-15**, pagos) queda intermedio: no se aclara si el pago requiere completitud previa | `Pantallas…` P-14 / P-15; HU-03 CA-4 | Se implementa el gate exacto de la fuente (habilita P-16); secuencia con P-15 → **POR DEFINIR (PO)** |
| 4 | El backlog solo etiqueta **POR CONFIRMAR** a P-24 y P-25 (HU-04 CA-7), aunque el §8 de la fuente cuestiona también los pagos en línea (§8.3 → P-15) y la cobertura de ventanilla (§8.4 → P-18) | `Rama-01` HU-03/HU-04 vs `Pantallas…` §8 | Este plan marca **P-15, P-18, P-24 y P-25** como POR CONFIRMAR; se confirma con el PO |
| 5 | El entregable del Sprint 1 dice "portal completo P-01…P-27", pero la nota de capacidad permite recortar **P-26 y P-27** al inicio del Sprint 2 | `Rama-01` (entregables vs nota de capacidad) | Se mantiene la nota de recorte con registro en el backlog (§8.2) |
| 6 | **I-13**: la matriz de accesos da al notificador I-13 en **lectura**, pero la fuente define acciones de **archivo y reactivación** sin asignarlas a un rol | `06-roles` §6.4 vs `Pantallas…` I-13 | Acción asignada como **POR DEFINIR (PO)** |
| 7 | **SUPERVISOR** ¿rol separado o atribución de `FUNCIONARIO` con reportes? | `06-roles` §6.13-1 | Se usa como rol técnico separado (backlog); confirmar con el PO |
| 8 | ¿El **OTP de P-03** es solo verificación de identidad o también factor de autenticación obligatorio? | `06-roles` §6.13-2 | Se construye como verificación de identidad simulada; **POR DEFINIR (PO)** |
| 9 | Campos de origen `S` (RUEX, expedientes previos, registro de entradas): en el producto del bufete **no existen sistemas previos del SNM**; tampoco convenios con TE/CSS/Registro Público (§8.2, prohibición 9 de `06-roles`) | `Pantallas…` §1.3 vs `06-roles` §6.9 | Se tratan como **[D] sellados** con datos del fixture y resultado manual en I-07; convenios → **POR DEFINIR (PO)** |
| 10 | Sin datos oficiales de tiempos por etapa (línea base 3–8 meses; meta de reducción) | `Pantallas…` §8.1 | I-17 muestra la línea base; meta → **POR DEFINIR (PO)** |
| 11 | Catálogos no enumerados en las fuentes: sedes/ventanillas (P-18), tipos de consulta (P-27), motivos de negación (I-10), tipos documentales (P-14, TASK-17.1), división política (P-11), catálogo de países (P-02/P-09) | Varios | En fixtures con contenido de ejemplo; valores oficiales → **POR DEFINIR (PO)** |
| 12 | El documento fuente usa vocabulario de administración pública (ciudadano/SNM) y el producto es de bufetes | Todo el inventario | Traducción de vocabulario en §1.3 **sin alterar campos ni numeración** |

**Resumen de conteo:** 45 pantallas cubiertas (27 portal + 18 módulo interno) · 4 pantallas `POR CONFIRMAR` (P-15, P-18, P-24, P-25) · campos y datos **POR DEFINIR (PO)** señalados en: P-01 (acción "ente interviniente", límite de intentos), P-02 (catálogo de documentos, modo de verificación RUEX/TE), P-03 (naturaleza del OTP), P-04 (historial de contraseñas), P-09 (huella digital), P-10 (estado del RUEX en fixtures), P-11 (catálogo divisional), P-12 (bloques y validaciones con instituciones), P-14 (catálogo de tipos documentales), P-15/P-23 (pasarela de pago), P-18 (catálogo de sedes), P-24/P-25 (respuesta y catálogo en modo mínimo), P-27 (catálogo de consultas y pantalla interna de atención), I-02 (meta de tiempos), I-07 (matriz de convenios), I-10 (catálogo de motivos y matriz de transiciones), I-13 (rol de la acción), I-15 (plazo de revisión de fuentes habilitadas).

---

*Fuentes: `Pantallas_y_Datos_Migracion.md` · `Rama-01-Frontend.md` · `Documentacion/06-roles-y-accesos.md` · `Documentacion/04-plan-de-pruebas.md` (CP-01…CP-14). Este plan no modifica ningún otro archivo.*


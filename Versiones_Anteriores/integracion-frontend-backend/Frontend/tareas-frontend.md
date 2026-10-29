# Tareas del Frontend — documento de trabajo del encargado

**Para:** encargado de la rama Frontend · **Fuente detallada:** [Rama-01-Frontend.md](Rama-01-Frontend.md) · **Producto:** gestión de expedientes migratorios para bufetes de abogados (Ley 81 de 2019).

> **Alcance del trabajo Frontend (acordado con el encargado):** se ejecuta **hasta el Sprint 4 inclusive**. Los **Sprint 5, 6 y 7 quedan FUERA DE ALCANCE** por ahora; no se abordan salvo indicación posterior.

> **Cómo usar este documento:** marca cada tarea con ☑ cuando esté terminada y cumpla su criterio. Si una tarea cambia de alcance, regístralo con el PO en el *Registro de cambios del backlog*. Ante cualquier duda de campo o regla, manda "POR DEFINIR (PO)" en lugar de inventar.

---

## 0. Reglas rápidas (aplican a todas las tareas)

1. HTML/CSS/JS puro; sin frameworks; sin credenciales ni secretos en el cliente.
2. Cada pantalla usa **fixtures locales** en `js/fixtures/` con el **mismo esquema JSON** que los mocks del backend (HU-08) — así se conecta después sin reescribir vistas.
3. Toda pantalla entrega sus **4 estados**: carga, éxito, vacío y error con reintento.
4. Los campos de origen **"A"** (verificación automática, futuro convenio) se muestran sellados con fuente/fecha/estado y **con la carga manual bloqueada** en el MVP.
5. OTP (P-03) y MFA (I-01) van **simulados**; sin datos reales de clientes en ningún entorno.
6. Protección por rol en el enrutado hash: cliente del bufete (SOLICITANTE) vs. despacho (FUNCIONARIO/SUPERVISOR/AUDITOR/ADMIN); acceso denegado → vista 403.

> **Dudas de alcance:** si un campo o regla no está claro, márcalo "POR DEFINIR (PO)" y revísalo con el PO. Las inconsistencias ya detectadas del inventario están registradas como pendientes **PEN-01…PEN-12** (backlog §5.5) y las resuelve el PO antes del cierre del Sprint 1.

---

## 1. Sprint 1 — Portal completo del cliente (P-01…P-27) ≈ 130 h

### Fase A — Estructura y diseño base ≈ 15 h (HU-01)

| ☐ | Tarea | Horas |
| --- | --- | --- |
| ☑ | TASK-01.1 — Carpetas (`css/`, `js/views/`, `js/components/`, `js/services/`, `js/fixtures/`, `js/utils/`), variables de diseño y fixtures base | 3 h |
| ☑ | TASK-01.2 — Layout base: encabezado, menú por rol, área de contenido y pie | 4 h |
| ☑ | TASK-01.3 — Enrutado hash + protección por rol + vistas globales 403/404/500 + modales | 3 h |
| ☑ | TASK-01.4 — Componentes reutilizables (incluidos stepper y línea de tiempo) | 3 h |
| ☑ | TASK-01.5 — README del frontend con diseño base y convenciones | 2 h |

### Fase B — Acceso y cuenta: P-01…P-05 ≈ 20 h (HU-02)

| ☐ | Tarea | Horas |
| --- | --- | --- |
| ☑ | TASK-02.1 — P-01 inicio de sesión (validaciones en cliente, mensaje genérico de fallo CP-02, bloqueo por intentos) | 4 h |
| ☑ | TASK-02.2 — P-02 registro con aceptación de Ley 81 + P-03 OTP simulado (estados carga/éxito/error) | 6 h |
| ☑ | TASK-02.3 — P-04 recuperación de contraseña + P-05 perfil con re-verificación OTP simulada | 5 h |
| ☑ | TASK-02.4 — Gestor de sesión (token, expiración, cierre) y menú adaptado al rol | 5 h |

### Fase C — Bandeja y asistente: P-06…P-18 ≈ 60 h (HU-03)

| ☐ | Tarea | Horas |
| --- | --- | --- |
| ☑ | TASK-03.1 — P-06 bandeja de trámites + P-07 selección de trámite con ficha de requisitos | 8 h |
| ☑ | TASK-03.2 — P-08 titularidad/representación + bloque de campos origen "A" (carga manual bloqueada) | 6 h |
| ☑ | TASK-03.3 — Asistente P-09…P-16: stepper, validaciones por paso, carga de documentos, P-15 pago simulado sin pasarela, P-16 declaración y firma simulada | 24 h |
| ☑ | TASK-03.4 — P-17 resumen y envío (número de expediente y QR) | 8 h |
| ☑ | TASK-03.5 — P-18 reserva de cita (calendario, cupo, turno) — *POR CONFIRMAR según §8* | 6 h |
| ☑ | TASK-03.6 — Fixtures del flujo del solicitante y los 4 estados en todo el flujo | 8 h |

### Fase D — Seguimiento y servicios: P-19…P-27 ≈ 35 h (HU-04)

| ☐ | Tarea | Horas |
| --- | --- | --- |
| ☑ | TASK-04.1 — P-19 línea de tiempo de estados + P-20 observaciones y notificaciones | 8 h |
| ☑ | TASK-04.2 — P-21 subsanación (carga de archivos y confirmación de atención completa) | 5 h |
| ☑ | TASK-04.3 — P-22 resultados (resolución, carné digital, certificados) + P-23 historial de pagos | 7 h |
| ☑ | TASK-04.4 — P-26 naturalización (N-1 a N-13) reutilizando componentes del asistente | 8 h |
| ☑ | TASK-04.5 — P-24 edictos y P-25 certificados en modo consulta mínimo (*POR CONFIRMAR*) + P-27 ayuda/FAQ/peticiones | 7 h |

> **Regla de capacidad:** si la fase D no cabe en las 2 semanas, prioriza P-19, P-20, P-21 y P-22 y avisa al PO para registrar el ajuste.

### Integración fixtures → mocks ≈ 24 h (HU-09)

| ☐ | Tarea | Horas |
| --- | --- | --- |
| ☑ | TASK-09.1 — Módulo de servicios HTTP con manejo centralizado de errores y token (lee fixtures locales al inicio) | 5 h |
| ☑ | TASK-09.2 — Sustituir fixtures por mocks en P-06…P-18, sin reescribir vistas | 6 h |
| ☑ | TASK-09.3 — Sustituir fixtures por mocks en P-19…P-27 (y al construirlo, en I-01…I-18) | 6 h |
| ☑ | TASK-09.4 — Selector de escenarios (`X-Scenario`) en la UI de demostración | 3 h |
| ☑ | TASK-09.5 — Recorrido completo del flujo y corrección de incidencias (con QA) | 4 h |

**Entregables del Sprint 1:** las 27 pantallas del portal navegables con fixtures; selector de escenarios; README del frontend actualizado.
**DoD:** ✅ las 45 rutas del inventario resuelven (portal completo); ✅ protección por rol probada; ✅ sin credenciales; ✅ fixtures con el esquema de los mocks; ✅ sin referencias al esquema viejo de 21 pantallas.

> **Cierre (Frontend):** las tareas de Sprint 1 (Fases A–D, TASK-01.1…04.5, TASK-03.6, HU-09 TASK-09.1…09.5) y del módulo interno (TASK-05.1…05.5) están **terminadas y verificadas** con Edge headless (45/45 pantallas; P-06…P-27 e I-02…I-18 pasan los 4 estados). El servicio HTTP central `tm.api` y el selector global de escenarios (`X-Scenario`) quedan listos para conectar el backend (`tm.api.setBaseUrl(...)`) sin reescribir vistas.

---

## 2. Módulo interno del despacho — I-01…I-18 ≈ 85 h (HU-05, inicio del Sprint 2)

| ☐ | Tarea | Fase | Horas |
| --- | --- | --- | --- |
| ☑ | TASK-05.1 — I-01 login del despacho con MFA simulado + layout interno con menú por rol | E | 10 h |
| ☑ | TASK-05.2 — I-02…I-06: tablero, bandeja de recepción, completitud, asignación de analista, análisis con checklist | E | 20 h |
| ☑ | TASK-05.3 — I-07…I-13: panel de verificación (modo manual asistido: fuente/fecha/resultado/responsable; error técnico ≠ negativo), observaciones, edictos, resolución, notificación, entrega, archivados y reactivación | E | 30 h |
| ☑ | TASK-05.4 — I-14…I-17: catálogos, usuarios/roles/permisos, bitácora de auditoría, reportes por etapa | F | 18 h |
| ☑ | TASK-05.5 — I-18 salud de las conexiones con métricas e intentos fallidos | F | 7 h |

---

## 3. Sprint 2 — conexión al backend real

| ☐ | Tarea | Horas |
| --- | --- | --- |
| ☐ | TASK-10.4 — Dockerfiles del frontend y `docker-compose.yml` con healthchecks (con Backend) | 6 h |
| ☐ | TASK-12.5 — Conectar P-01, P-02, P-04, P-05 a `/api/auth/*` (P-03 OTP sigue simulado) | 5 h |
| ☑ | TASK-13.5 — Mostrar/ocultar acciones según permisos reales del rol | 4 h |

## 4. Sprint 3 — expediente y consentimiento

| ☐ | Tarea | Horas |
| --- | --- | --- |
| ☐ | TASK-15.3 — Conectar el asistente P-07…P-17 a `POST /api/expedientes` con errores de validación campo a campo | 6 h |
| ☐ | TASK-16.3 — Conectar P-06, P-19 e I-03/I-06 a los endpoints de listado, detalle e historial | 6 h |
| ☐ | TASK-17.4 — Conectar P-14 (carga de documentos) con progreso y manejo de errores | 6 h |
| ☐ | TASK-18.3 — Conectar P-20 (observaciones y notificaciones) con marcado de leídas | 4 h |
| ☑ | Pantallas de **consentimiento informado** (ver/revocar en P-05, panel del despacho I-19) — HU-18b | Estimar con PO |
| ☑ | Formulario de **derechos ARCO** en el portal (HU-18c) | Estimar con PO |

## 5. Sprint 4 — máquina de estados y auditoría

| ☐ | Tarea | Horas |
| --- | --- | --- |
| ☐ | TASK-19.4 — Conectar I-10 (resolución) con transiciones dinámicas y motivo obligatorio | 5 h |
| ☐ | TASK-20.2 — Conectar I-08 y el bloque de observaciones de P-19 | 5 h |
| ☑ | TASK-21.2 — Componente de línea de tiempo conectado a P-19 e I-06 | 5 h |
| ☐ | TASK-22.4 — Conectar I-16 (bitácora) y verificar exportación CSV | 4 h |

## 6. Sprint 5 — panel de verificaciones conectado **(FUERA DE ALCANCE)**

| ☐ | Tarea | Horas |
| --- | --- | --- |
| ☐ | TASK-26.1 — Conectar I-07 a los endpoints de verificaciones con recarga y refresco | 6 h |
| ☐ | TASK-26.2 — Distinción error técnico vs. resultado negativo + botón de reintento | 5 h |
| ☐ | TASK-26.3 — Bloque de verificaciones en P-19 con detalle por rol | 5 h |
| ☐ | TASK-26.4 — Recorrido completo con escenarios forzados (`X-Scenario`) y corrección de incidencias (con QA) | 6 h |

## 7. Sprint 6 — seguridad y usabilidad **(FUERA DE ALCANCE)**

| ☐ | Tarea | Horas |
| --- | --- | --- |
| ☐ | TASK-28.4 (parte FE) — Corregir hallazgos de OWASP ZAP (XSS, cabeceras, sesión, datos en errores) | Estimar con QA |
| ☐ | TASK-30.3 — Clasificar dificultades y priorizar correcciones con el PO | 4 h |
| ☐ | TASK-30.4 — Corregir pantallas prioritarias y repetir tareas críticas | 8 h |

## 8. Sprint 7 — documentación, empaquetado y demo **(FUERA DE ALCANCE)**

| ☐ | Tarea | Horas |
| --- | --- | --- |
| ☐ | TASK-32.2 — Manual de usuario por rol con capturas actualizadas | 8 h |
| ☐ | TASK-33.2 (parte FE) — Corregir hallazgos de empaquetado (rutas, assets, configuración) | Estimar con QA |
| ☐ | HU-34 — Demostración del flujo completo (cliente y despacho) con métricas del bufete | — |

---

## 9. Resumen de carga

| Sprint | Trabajo Frontend | Horas aprox. |
| --- | --- | --- |
| 1 | Portal P-01…P-27 (fases A–D) + integración fixtures→mocks | ≈ 130 + 24 |
| 2 | Módulo interno I-01…I-18 (fases E/F) + conexión auth | ≈ 85 + 15 |
| 3 | Conexión de expediente + consentimiento y ARCO | ≈ 22 + estimar |
| 4 | Máquina de estados, observaciones, historial, auditoría | ≈ 19 |
| 5 | Panel de verificaciones conectado | ≈ 22 |
| 6 | Correcciones de seguridad y usabilidad | ≈ 12 + QA |
| 7 | Manual, empaquetado y demostración | ≈ 8 + QA |

*Para el detalle de cada tarea (criterios de aceptación y dependencias), consulta `Rama-01-Frontend.md`; para los campos exactos de cada pantalla, `Pantallas_y_Datos_Migracion.md`.*

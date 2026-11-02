# 🧭 Frontend · Trámites Migratorios

<p align="center">
  <img src="../docs/assets/project-status.svg" alt="Estado del frontend y del proyecto" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/46%20pantallas-implementadas-56C596?style=for-the-badge" alt="46 pantallas implementadas">
  <img src="https://img.shields.io/badge/HTML-CSS-JavaScript-F28C28?style=for-the-badge&logo=javascript&logoColor=white" alt="HTML CSS JavaScript">
  <img src="https://img.shields.io/badge/Nginx-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Nginx y Docker">
  <img src="https://img.shields.io/badge/QA-Usabilidad%20y%20accesibilidad-8B5CF6?style=for-the-badge" alt="QA de usabilidad y accesibilidad">
</p>

<p align="center">
  <a href="#-qué-resuelve">🎯 Qué resuelve</a> ·
  <a href="#-estructura">🧱 Estructura</a> ·
  <a href="#-ejecución-rápida">▶ Ejecución</a> ·
  <a href="#-rutas-principales">🗺️ Rutas</a>
</p>

<p align="center"><strong>Portal del cliente + módulo interno del bufete</strong><br>Expedientes · documentos · verificaciones · trazabilidad</p>

**Proyecto:** Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá (producto para bufetes de abogados). Enfoque a Ley 81 de 2019 y Decreto Ejecutivo 285 de 2021.

## 🎯 Qué resuelve

Este frontend construye el **portal del cliente del bufete (P-01…P-27)** y el **módulo interno del despacho (I-01…I-18, más I-19 añadida por HU-18b)** — total 46 pantallas. Implementación con HTML, CSS y JavaScript puro, sin frameworks.

| Área | Resultado |
| --- | --- |
| Portal del cliente | Registro, solicitudes, documentos, pagos y seguimiento. |
| Módulo del despacho | Expedientes, verificaciones, observaciones, resolución y auditoría. |
| Integración | Cliente HTTP único con backend Java y modo offline con fixtures. |
| Calidad | Estados de carga, éxito, vacío y error en las vistas principales. |

> El MVP utiliza datos ficticios y servicios simulados. No consulta APIs reales de instituciones públicas.

## 🧱 Estructura

```
Frontend/
├── css/                    ← base, layout, variables
│   ├── base.css
│   ├── layout.css
│   └── variables.css
├── html/                   ← punto de entrada
│   └── index.html
└── js/
    ├── app.js              ← arranque (hash routing + layout)
    ├── components/         ← componentes reutilizables
    │   ├── button.js
    │   ├── errors.js
    │   ├── field.js
    │   ├── layout.js
    │   ├── modal.js
    │   ├── stepper.js
    │   ├── table.js
    │   └── timeline.js
    ├── fixtures/           ← fixtures locales (mismo esquema HU-08)
    ├── services/           ← servicios: session.js y api.js (módulo único HTTP, TASK-09.1)
    ├── utils/              ← utilidades (roles, nav, router, data, draft, wizard, fixtures, expediente)
    │   ├── nav.js
    │   ├── roles.js
    │   └── router.js
    └── views/              ← vistas por pantalla (P-01…P-27 e I-01…I-19)
```

La documentación general del proyecto se mantiene en `Documentacion/` y las evidencias de calidad en `QA/`. Este módulo conserva únicamente la información mínima necesaria para ejecutar y entender el frontend.

## ⚙️ Convenciones de la interfaz

- Enrutado por **hash** (`#/ruta`). Guards por rol: `SOLICITANTE`, `FUNCIONARIO`, `SUPERVISOR`, `AUDITOR`, `ADMIN`.
- **Cuatro estados** obligatorios por pantalla: carga, éxito, vacío, error con reintento.
- Sin credenciales, tokens ni secretos en el cliente; solo fixtures ficticios.
- Todo campo **[V]** (verificación automática, futuro convenio) se muestra bloqueado con sello `verificado automáticamente · fuente · fecha · estado`. En MVP, el resultado lo registra el despacho en **I-07 (modo manual asistido)**.
- OTP (P-03) y MFA (I-01) **simulados** en el MVP (Ley 81).
- Minimización de datos: solo lo requerido por trámite.
- Mensajes de error en lenguaje no técnico y **sin datos personales**.

## ▶ Ejecución rápida

### Opción recomendada: Docker

Desde la raíz del repositorio:

```bash
docker compose up --build
```

Luego abre `http://localhost:8081/html/index.html#/login`.

### Opción offline

También puedes abrir `html/index.html` directamente en un navegador moderno. En este modo se utilizan fixtures locales y no se conecta al backend.

```text
file:///C:/Users/Jonathan/Desktop/Repo/Tr-mites-Migratorios/Frontend/html/index.html
```

> **Importante:** el frontend usa **scripts clásicos** (`<script src>`), **no** módulos ES.
> Los módulos ES (`type="module"`) quedan bloqueados por CORS al abrirse con `file://`,
> por lo que toda la lógica se expone en el espacio de nombres `window.tm`
> (`tm.roles`, `tm.nav`, `tm.router`, `tm.layout`, `tm.ui`, `tm.session`, `tm.views`).

## 🗺️ Rutas principales

| Ruta | Descripción |
|---|---|
| `#/login` | Inicio de sesión (portal) |
| `#/registro` | Registro de cuenta (portal) |
| `#/mis-tramites` | Bandeja del cliente (P-06) |
| `#/solicitud/*` | Asistente de solicitud (P-07…P-18) |
| `#/seguimiento/*` | Seguimiento y servicios (P-19…P-25) |
| `#/perfil` | Perfil (P-05) |
| `#/interno/login` | Login del despacho (I-01) |
| `#/interno/tablero` | Tablero interno (I-02) |
| `#/interno/consentimientos` | Consentimientos del titular (I-19) |
| `#/error/403`, `#/error/404`, `#/error/500` | Vistas globales |

## 📈 Estado del avance

- **Fase A (HU-01):** armazón, router con guards, vistas globales, componentes base. ✔
- **Fase B (HU-02, P-01…P-05):** acceso y cuenta (login, registro, OTP, recuperación, perfil) + gestor de sesión. ✔
- **Fase C (HU-03, P-06…P-18):** bandeja + asistente de solicitud + fixtures y 4 estados. ✔
- **Fase D (HU-04, P-19…P-27):** seguimiento y servicios. ✔
- **Módulo interno (Fases E–F, I-01…I-18):** operación y administración del despacho. ✔
- **HU-09 (integración fixtures → mocks):** módulo único de servicios HTTP `tm.api`, cabecera `X-Scenario` y selector global de escenarios. ✔
- **HU-18b (consentimiento informado):** pantalla interna **I-19** (`#/interno/consentimientos`, ver/revocar) y sección de consentimiento en **P-05**. ✔
- **HU-18c (derechos ARCO):** formulario dedicado en **P-27** (acceso, rectificación, cancelación y oposición) con plazos de la Ley 81 y seguimiento de solicitudes. ✔
- **HU-13 / TASK-13.5 (permisos de interfaz):** módulo `tm.perms` (`js/utils/perms.js`) con la matriz mock rol × permiso; las acciones internas se muestran u ocultan según el permiso del rol (con aviso "Sin permiso «…»" cuando no aplica). ✔
- **TASK-21.2 (línea de tiempo):** componente reutilizable `js/components/timeline.js` usado por **P-19** (etapas del trámite) e **I-06** (historial del expediente, se actualiza al guardar dictamen); acepta `done`/`active`/`estado`. ✔
- **Inventario completo:** 46/46 pantallas (P-01…P-27 + I-01…I-19), todas con vista, fixtures y ruta.
- **Sprint 3:** P-05, P-06, P-07, P-14, P-17, P-19, P-20, P-27 e I-02/I-03/I-06/I-19 consumen los contratos reales del backend cuando la aplicación se sirve por HTTP; se conserva el modo offline con fixtures para pruebas locales.
- **Validación de integración:** expedientes, documentos, historial, notificaciones, consentimiento y solicitudes ARCO se prueban mediante el cliente `tm.api`, sin llamadas HTTP directas desde las vistas.
- **Alcance:** el Frontend se trabaja **hasta el Sprint 4 inclusive**; los Sprints 5–7 quedan fuera de alcance por ahora.

## Notas

- Los fixtures de `js/fixtures/` usan un **sobre provisional** `{ meta, data, error }` mientras no se publique el esquema definitivo de HU-08. Cuando se publique, **reemplazar sin desviarlo**.
- **Módulo único de servicios HTTP** (`js/services/api.js`, `tm.api`): ninguna vista llama a `fetch`/`XHR` por su cuenta. Sin backend, lee los fixtures locales; para conectar, `tm.api.setBaseUrl("http(s)://host/api")` **sin reescribir vistas** (`tm.fixtures.data()/message()` delegan en `tm.api`).
- Cada vista de bandeja/asistente/operación incluye un **selector “Vista (demo)”** para alternar los 4 estados (carga, éxito, vacío, error) sin depender del backend.
- Selector de **rol (demo)** y selector de **escenario (demo)** (`X-Scenario`) en la cabecera: temporales para probar guards/menú y los 4 estados mientras no exista backend real.
- HTML/CSS/JS puro. Sin build, sin frameworks. 46 pantallas implementadas.

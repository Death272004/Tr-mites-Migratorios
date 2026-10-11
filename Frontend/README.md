# Frontend (HTML + CSS + JavaScript puro)

**Proyecto:** Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá (producto para bufetes de abogados). Enfoque a Ley 81 de 2019 y Decreto Ejecutivo 285 de 2021.

## Alcance

Este frontend construye el **portal del cliente del bufete (P-01…P-27)** y el **módulo interno del despacho (I-01…I-18, más I-19 añadida por HU-18b)** — total 46 pantallas. Implementación con HTML, CSS y JavaScript puro, sin frameworks.

- **Sprint 1:** portal completo funcionando con **fixtures locales** del mismo esquema JSON que los mocks (HU-08).
- **Sprint 2+:** conexión al backend real (Java) vía módulo único de servicios HTTP.

## Estructura de carpetas

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
    ├── utils/              ← utilidades (roles, nav, router, data, draft, wizard, fixtures)
    │   ├── nav.js
    │   ├── roles.js
    │   └── router.js
    └── views/              ← vistas por pantalla (P-01…P-27 e I-01…I-19)
```

## Convenciones

- Enrutado por **hash** (`#/ruta`). Guards por rol: `SOLICITANTE`, `FUNCIONARIO`, `SUPERVISOR`, `AUDITOR`, `ADMIN`.
- **Cuatro estados** obligatorios por pantalla: carga, éxito, vacío, error con reintento.
- Sin credenciales, tokens ni secretos en el cliente; solo fixtures ficticios.
- Todo campo **[V]** (verificación automática, futuro convenio) se muestra bloqueado con sello `verificado automáticamente · fuente · fecha · estado`. En MVP, el resultado lo registra el despacho en **I-07 (modo manual asistido)**.
- OTP (P-03) y MFA (I-01) **simulados** en el MVP (Ley 81).
- Minimización de datos: solo lo requerido por trámite.
- Mensajes de error en lenguaje no técnico y **sin datos personales**.

## Cómo ejecutar (local, sin servidor)

Simplemente abre `html/index.html` con un navegador moderno (doble clic):

```text
file:///C:/Users/Jonathan/Desktop/Repo/Tr-mites-Migratorios/Frontend/html/index.html
```

> **Importante:** el frontend usa **scripts clásicos** (`<script src>`), **no** módulos ES.
> Los módulos ES (`type="module"`) quedan bloqueados por CORS al abrirse con `file://`,
> por lo que toda la lógica se expone en el espacio de nombres `window.tm`
> (`tm.roles`, `tm.nav`, `tm.router`, `tm.layout`, `tm.ui`, `tm.session`, `tm.views`).

## Navegación (rutas principales)

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

## Estado del avance (rama `Frontend`)

- **Fase A (HU-01):** armazón, router con guards, vistas globales, componentes base. ✔
- **Fase B (HU-02, P-01…P-05):** acceso y cuenta (login, registro, OTP, recuperación, perfil) + gestor de sesión. ✔
- **Fase C (HU-03, P-06…P-18):** bandeja + asistente de solicitud + fixtures y 4 estados. ✔
- **Fase D (HU-04, P-19…P-27):** seguimiento y servicios. ✔
- **Módulo interno (Fases E–F, I-01…I-18):** operación y administración del despacho. ✔
- **HU-09 (integración fixtures → mocks):** módulo único de servicios HTTP `tm.api`, cabecera `X-Scenario` y selector global de escenarios. ✔
- **HU-18b (consentimiento informado):** pantalla interna **I-19** (`#/interno/consentimientos`, ver/revocar) y sección de consentimiento en **P-05**. ✔
- **HU-18c (derechos ARCO):** formulario dedicado en **P-27** (acceso, rectificación, cancelación y oposición) con plazos de la Ley 81 y seguimiento de solicitudes. ✔
- **HU-13 / TASK-13.5 (permisos de interfaz):** módulo `tm.perms` (`js/utils/perms.js`) con la matriz mock rol × permiso; las acciones internas se muestran u ocultan según el permiso del rol (con aviso "Sin permiso «…»" cuando no aplica). ✔
- **Inventario completo:** 46/46 pantallas (P-01…P-27 + I-01…I-19), todas con vista, fixtures y ruta.
- **Pendiente (Sprint 2+):** conectar al backend real (`tm.api.setBaseUrl(...)`), Docker y validación real de permisos por rol en el servidor.
- **Alcance:** el Frontend se trabaja **hasta el Sprint 4 inclusive**; los Sprints 5–7 quedan fuera de alcance por ahora.

## Notas

- Los fixtures de `js/fixtures/` usan un **sobre provisional** `{ meta, data, error }` mientras no se publique el esquema definitivo de HU-08. Cuando se publique, **reemplazar sin desviarlo**.
- **Módulo único de servicios HTTP** (`js/services/api.js`, `tm.api`): ninguna vista llama a `fetch`/`XHR` por su cuenta. Sin backend, lee los fixtures locales; para conectar, `tm.api.setBaseUrl("http(s)://host/api")` **sin reescribir vistas** (`tm.fixtures.data()/message()` delegan en `tm.api`).
- Cada vista de bandeja/asistente/operación incluye un **selector “Vista (demo)”** para alternar los 4 estados (carga, éxito, vacío, error) sin depender del backend.
- Selector de **rol (demo)** y selector de **escenario (demo)** (`X-Scenario`) en la cabecera: temporales para probar guards/menú y los 4 estados mientras no exista backend real.
- HTML/CSS/JS puro. Sin build, sin frameworks. 46 pantallas implementadas.

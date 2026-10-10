# Frontend (HTML + CSS + JavaScript puro)

**Proyecto:** Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá (producto para bufetes de abogados). Enfoque a Ley 81 de 2019 y Decreto Ejecutivo 285 de 2021.

## Alcance

Este frontend construye el **portal del cliente del bufete (P-01…P-27)** y el **módulo interno del despacho (I-01…I-18)** — total 45 pantallas. Implementación con HTML, CSS y JavaScript puro, sin frameworks.

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
    ├── services/           ← módulo de servicios HTTP (TASK-09.1)
    ├── utils/              ← utilidades (roles, nav, router)
    │   ├── nav.js
    │   ├── roles.js
    │   └── router.js
    └── views/              ← vistas por pantalla (se construyen por fases)
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

Simplemente abre `html/index.html` con un navegador moderno:

```text
file:///C:/Users/Jonathan/Desktop/Repo/Tr-mites-Migratorios/Frontend/html/index.html
```

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
| `#/error/403`, `#/error/404`, `#/error/500` | Vistas globales |

## Próximos pasos (según fases)

- **TASK-01.5** (actual): README documentado.
- **Fase B (Sprint 1):** vistas P-01…P-05 (acceso y cuenta).
- **Fase C:** P-06…P-18 (bandeja + asistente).
- **Fase D:** P-19…P-27 (seguimiento y servicios).
- **Sprint 2:** módulo interno I-01…I-18 (fases E–F) + conexión backend (TASK-09, TASK-12, TASK-13).

## Notas

- Los fixtures de `js/fixtures/` usan un **sobre provisional** `{ meta, data, error }` mientras no se publique el esquema definitivo de HU-08. Cuando se publique, **reemplazar sin desviarlo**.
- Selector de **rol (demo)** en la cabecera: temporal para probar guards/menú mientras no exista login real.
- HTML/CSS/JS puro. Sin build, sin frameworks. 45 pantallas a construir.

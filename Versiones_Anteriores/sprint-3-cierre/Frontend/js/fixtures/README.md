# Fixtures locales del Frontend

Fixtures de demostración que alimentan las pantallas **mientras no exista backend**
(Sprint 1). Deben compartir **el mismo esquema JSON que los mocks de la HU-08** para
que el paso de *fixtures → mocks* no exija reescribir vistas
(`Rama-01-Frontend.md:68`, `plan-de-ejecucion-frontend.md` §2.5).

## Cómo se cargan (`file://`)

La aplicación abre con doble clic y **no puede usar `fetch`/JSON en `file://`**,
por lo que el loader `js/utils/fixtures.js` (expone `tm.fixtures`) registra el
envelope desde scripts clásicos. Cada fixture es un `.js` que llama a:

```js
global.tm.fixtures.register("P-06", "exito", { meta, data, error });
```

`tm.fixtures` expone: `envelope(pantalla, escenario)`, `data(pantalla, escenario)`,
`message(pantalla, escenario, fallback)`, `has(...)`, `register(...)`,
`scenario()`/`setScenario(...)` (escenario actual del flujo demo, en
sessionStorage) y `load(...)` (para cuando haya servidor: sirve el mismo envelope
como `.json`; se registra automáticamente si responde 200).

Las vistas leen con `tm.fixtures.data("P-0X", escenario)` y, ante estados de
error, `tm.fixtures.message("P-0X", "error", fallback)`. Si una vista se abre sin
su fixture registrado cae a un demo inline definido en la propia vista
(retrocompatibilidad).

## Nomenclatura

```
js/fixtures/<id-en-minúsculas>-<slug>.js              # estado base (equivale a éxito)
js/fixtures/<id>-<slug>.carga.js                      # estado de carga
js/fixtures/<id>-<slug>.exito.js                      # estado de éxito
js/fixtures/<id>-<slug>.vacio.js                      # estado vacío
js/fixtures/<id>-<slug>.error.js                      # estado de error
```

Ejemplo: `p-06-mis-tramites.js`, `p-06-mis-tramites.error.js`.
Los `id-slug` deben registrarse en `html/index.html` **antes** de las vistas
(¶ `js/fixtures/...`).

## Esquema (POR DEFINIR (PO / HU-08))

> El esquema exacto de los mocks de la HU-08 aún **no está publicado**.
> Este sobre (`envelope`) es provisional y se reemplazará por el publicado
> **sin desviarlo**. No inventar campos que la fuente no pida (minimización, Ley 81).

```jsonc
{
  "meta": {
    "pantalla": "P-01",           // identificador del inventario
    "titulo": "Inicio de sesión", // nombre legible
    "escenario": "exito",         // carga | exito | vacio | error
    "esquema": "hu-08/v1",        // versión del esquema (provisional)
    "nota": "..."                 // observaciones de alcance / POR DEFINIR
  },
  "data": { /* datos de la pantalla según el contrato */ },
  "error": null                   // { codigo, mensajeUsuario } cuando escenario = "error"
}
```

## Reglas

- Sin datos reales de clientes: solo datos ficticios (`tareas-frontend.md` §0.5).
- Sin credenciales, tokens ni secretos.
- Los mensajes de `error` van en lenguaje no técnico y **sin datos personales** (§2.2).

# Fixtures locales del Frontend

Fixtures de demostración que alimentan las pantallas **mientras no exista backend**
(Sprint 1). Deben compartir **el mismo esquema JSON que los mocks de la HU-08** para
que el paso de *fixtures → mocks* no exija reescribir vistas
(`Rama-01-Frontend.md:68`, `plan-de-ejecucion-frontend.md` §2.5).

## Nomenclatura

```
js/fixtures/<id-en-minúsculas>-<slug>.json          # estado base (equivalente a éxito)
js/fixtures/<id>-<slug>.carga.json                  # estado de carga
js/fixtures/<id>-<slug>.exito.json                  # estado de éxito
js/fixtures/<id>-<slug>.vacio.json                  # estado vacío
js/fixtures/<id>-<slug>.error.json                  # estado de error
```

Ejemplo: `p-01-login.exito.json`.

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

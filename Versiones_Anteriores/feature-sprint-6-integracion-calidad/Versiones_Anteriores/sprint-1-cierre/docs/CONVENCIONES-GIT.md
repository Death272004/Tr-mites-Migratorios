# Convenciones de Git

## Objetivo

Mantener cambios pequeños, rastreables y fáciles de revisar. Toda integración
debe poder relacionarse con una historia de usuario, tarea o corrección concreta.

## Ramas

`main` representa la línea estable y solo recibe cambios revisados.

Para trabajo nuevo se usarán estos formatos:

```text
feature/hu-<numero>-<descripcion-corta>
fix/<descripcion-corta>
docs/<descripcion-corta>
chore/<descripcion-corta>
devops/<descripcion-corta>
```

Ejemplos:

```text
feature/hu-10-entorno
devops/sprint-1-controles
fix/login-token
```

La rama `feature/hu-08-22-backend-sprints-1-4` es la base temporal de integración
acordada para las pruebas actuales. No se debe trabajar directamente sobre ella
si el cambio pertenece a una rama individual.

## Commits

Los mensajes siguen esta forma:

```text
tipo(alcance): descripción breve en imperativo
```

Tipos permitidos: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`, `build` y
`ci`.

Ejemplos:

```text
docs(devops): documentar estrategia de ambientes
chore(repo): agregar reglas de archivos locales
test(integration): validar arranque del entorno
```

Cada commit debe representar un cambio coherente. No se deben subir contraseñas,
tokens, archivos `.env`, `node_modules`, compilaciones ni datos personales.

## Pull Requests

Antes de solicitar revisión:

1. Actualizar la rama con la base de integración acordada.
2. Ejecutar las validaciones relacionadas con el cambio.
3. Describir qué se cambió, cómo se probó y qué queda pendiente.
4. Adjuntar evidencias sin secretos ni datos personales.
5. Solicitar al menos una revisión de otro integrante.

No se debe aprobar un Pull Request con conflictos sin resolver, pruebas fallidas
o cambios no relacionados con la tarea.

## Integración

La integración se hace mediante Pull Request. Los conflictos se resuelven en la
rama de trabajo y se vuelven a ejecutar las pruebas antes de solicitar una nueva
revisión. La rama `main` no se usa como base de pruebas mientras permanezca
atrasada respecto de la integración acordada.

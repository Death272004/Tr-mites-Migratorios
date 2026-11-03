# Estrategia de ambientes y secretos

**Estado:** propuesta del Sprint 1, pendiente de aprobación del líder técnico.

## Ambientes

| Ambiente | Propósito | Datos permitidos | Configuración |
| --- | --- | --- | --- |
| Desarrollo | Trabajo diario de cada integrante | Datos ficticios | `.env` local a partir de `.env.example` |
| Pruebas | Validación reproducible e integración | Datos ficticios y fixtures versionados | Variables controladas por la ejecución de pruebas |
| Demostración | Presentación del MVP | Datos ficticios | Valores documentados y separados de las credenciales personales |

El MVP no contempla un ambiente de producción dentro del alcance actual. Cualquier
decisión de producción debe aprobarse por separado, incluyendo requisitos legales,
de seguridad y alojamiento de datos.

## Reglas de configuración

1. `.env.example` contiene nombres y valores de ejemplo no sensibles y sí se
   versiona.
2. `.env` contiene la configuración local y nunca se versiona.
3. Los secretos reales se inyectan mediante variables de entorno o el mecanismo
   seguro que defina la CI; no se escriben en código, documentación, imágenes,
   volúmenes ni evidencias.
4. Las credenciales de demostración son únicamente ficticias y deben cambiarse si
   dejan de ser apropiadas para una demostración.
5. Los valores de puertos, nombres de base de datos y rutas locales se pueden
   cambiar sin editar la lógica de la aplicación.

## Variables iniciales

La plantilla actual define, entre otras, estas variables:

- `DB_NAME`, `DB_USER`, `DB_PASSWORD` y `DB_PORT`.
- `BACKEND_PORT` y `FRONTEND_PORT`.
- `DEMO_USUARIOS` y `DEMO_CONTRASENA`.

La lista debe ampliarse mediante Pull Request cuando backend, frontend o pruebas
agreguen una nueva configuración. Toda variable nueva debe indicar su propósito,
ambiente y si es sensible.

## Datos y evidencias

Las pruebas usan datos ficticios. Antes de publicar logs, capturas o informes se
deben retirar tokens, contraseñas, correos reales, documentos y cualquier dato
personal. La ubicación y el formato de las evidencias están definidos en
[`docs/evidencias/README.md`](evidencias/README.md).

## Aprobación

| Responsable | Estado | Fecha | Observación |
| --- | --- | --- | --- |
| DevOps | Propuesto | 2026-10-12 | Publicado para revisión del equipo |
| Líder técnico | Pendiente | — | Debe confirmar la estrategia antes de cerrar Sprint 1 |

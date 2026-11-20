# TASK-34.2 · Ensayo de demostración

## Ensayo técnico

Se verificó el entorno local antes del recorrido:

- Backend: activo y saludable.
- PostgreSQL: activo y saludable.
- Frontend: activo y saludable.
- Servicios de correo: activos y saludables.
- Frontend local: responde HTTP 302 y redirige a su entrada inicial.
- Catálogo protegido: responde HTTP 401 sin autenticación.
- Guion de TASK-34.1: disponible.

## Resultado del ensayo

El entorno está listo para ejecutar manualmente el recorrido del guion: login, creación del expediente, documentos, consentimiento, verificaciones, observación, decisión y notificación.

El ensayo técnico no sustituye la interacción visual del navegador. Deben comprobarse manualmente los botones, formularios, adjuntos y cambios de vista durante la presentación.

## Detalles a cuidar

1. Usar únicamente cuentas y documentos ficticios.
2. Mantener abierta la sesión correcta antes de probar cada rol.
3. Registrar consentimiento antes de ejecutar verificaciones.
4. Mostrar que un error técnico no equivale a resultado negativo.
5. No presentar CP-12 como aprobado; permanece bloqueado por falta de respuesta HTTP de descarga protegida.
6. Mostrar las limitaciones del MVP al finalizar.

## Estado

**Ensayo técnico completado; ensayo visual pendiente de ejecutar en navegador.** No se modificó código ni se hizo commit o push.

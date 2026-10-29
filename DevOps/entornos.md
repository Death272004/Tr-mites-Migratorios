# Entornos y variables

## Desarrollo local

Se levanta con `docker compose up --build`. Usa PostgreSQL, backend y frontend en contenedores. Los datos son ficticios y los volúmenes pueden eliminarse con `docker compose down -v`.

## Pruebas

Las pruebas del backend se ejecutan con `Backend/mvnw test`. Testcontainers crea una base PostgreSQL aislada para evitar depender de la base local.

## Demostración

Usa el mismo Compose con datos ficticios. El frontend se publica en el puerto 8081, el backend en 8080 y PostgreSQL en 5433, salvo que se cambien las variables en `.env`.

## Variables principales

| Variable | Uso |
|---|---|
| `DB_NAME` | Nombre de la base de datos. |
| `DB_USER` | Usuario local de PostgreSQL. |
| `DB_PASSWORD` | Contraseña local; nunca usar secretos reales. |
| `BACKEND_PORT` | Puerto publicado del backend. |
| `FRONTEND_PORT` | Puerto publicado del frontend. |
| `DEMO_USUARIOS` | Activa usuarios ficticios. |
| `DEMO_CONTRASENA` | Contraseña de demostración. |
| `CORREO_SIMULADO` | Evita depender de un proveedor de correo real. |

El archivo `.env` no se versiona. Solo se versiona `.env.example`.

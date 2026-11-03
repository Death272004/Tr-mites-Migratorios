# Trámites Migratorios — Panamá

Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá. La descripción del producto y el backlog están en [`Documentacion/`](Documentacion/README.md).

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) en ejecución.
- Para desarrollar el backend fuera de Docker: JDK 17 o superior. Maven no hace falta; el proyecto trae su propio lanzador (`mvnw`).

## Levantar todo

```bash
git clone https://github.com/Death272004/Tr-mites-Migratorios.git
cd Tr-mites-Migratorios
docker compose up --build
```

La primera vez tarda varios minutos porque descarga las dependencias. Cuando termina:

| Servicio | Dirección | Comprobación |
| --- | --- | --- |
| Backend (API) | http://localhost:8080 | http://localhost:8080/actuator/health responde `"status":"UP"` |
| Frontend | http://localhost:8081 | Abre el portal |
| PostgreSQL | `localhost:5433` | Usuario y base `tramites` |

La base de datos se crea sola: las migraciones de `Backend/src/main/resources/db/migration` se aplican al arrancar el backend.

Para detener: `docker compose down`. Para borrar también los datos: `docker compose down -v`.

## Configuración

Funciona sin configurar nada, con valores por defecto pensados solo para desarrollo local. Para cambiarlos, copia `.env.example` como `.env` y edítalo. El archivo `.env` no se sube al repositorio.

| Variable | Por defecto | Para qué |
| --- | --- | --- |
| `DB_NAME` | `tramites` | Nombre de la base de datos |
| `DB_USER` | `tramites` | Usuario de la base de datos |
| `DB_PASSWORD` | `tramites_local` | Contraseña de la base de datos |
| `DB_PORT` | `5433` | Puerto de PostgreSQL en tu máquina |
| `BACKEND_PORT` | `8080` | Puerto del backend en tu máquina |
| `FRONTEND_PORT` | `8081` | Puerto del frontend en tu máquina |

Si un puerto ya está ocupado en tu máquina, cámbialo en `.env`.

## Desarrollar el backend

Con la base de datos en Docker y el backend en tu máquina:

```bash
docker compose up -d db
cd Backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Pruebas (necesitan Docker en ejecución, porque levantan su propia base de datos):

```bash
cd Backend
./mvnw test
```

En Windows usa `mvnw.cmd` en lugar de `./mvnw`.

## Estructura

| Carpeta | Contenido |
| --- | --- |
| `Backend/` | Servidor Java (Spring Boot), contrato de la API en `Backend/docs/openapi.yaml` |
| `Frontend/` | Portal y módulo interno (HTML, CSS y JavaScript) |
| `Documentacion/` | Arquitectura, planes, backlog, roles y marco legal |
| `QA/`, `DevOps/`, `DB/` | Documentos de trabajo de cada rama |
| `docker/` | Configuración de los contenedores |

## Reglas

- Solo datos ficticios en desarrollo y pruebas.
- Ningún secreto en el código ni en el repositorio.
- Todo cambio a la API se anota primero en `Backend/docs/CHANGELOG-api.md`.

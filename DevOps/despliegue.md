# Despliegue local y verificación

## Requisitos

- Docker Engine o Docker Desktop.
- Git.
- Un terminal Bash para usar los scripts.

## Arranque

`cp .env.example .env` seguido de `docker compose up --build -d` levanta el sistema.

## Verificación rápida

Ejecuta `./scripts/smoke-test.sh` para comprobar el health check del backend y la carga del frontend.

## Detención

`docker compose down` detiene el entorno. `docker compose down -v` también elimina los volúmenes de demostración.

No se deben usar datos reales en ningún volumen, imagen, prueba o evidencia.

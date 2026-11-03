# DevOps - Plataforma Interoperable

Esta carpeta documenta la responsabilidad de DevOps del proyecto: entornos reproducibles, Docker, configuración, integración continua, despliegue local y evidencias técnicas.

## Archivos principales

- `Rama-05-DevOps.md`: alcance y tareas de la rama.
- `entornos.md`: desarrollo, pruebas y demostración.
- `pipeline.md`: flujo de integración continua.
- `despliegue.md`: pasos para levantar y detener el sistema.
- `evidencias/`: registro de verificaciones de infraestructura.

## Comandos principales

`cp .env.example .env` y luego `docker compose up --build` levantan el entorno.

Para detenerlo se utiliza `docker compose down`. Para reiniciar los datos ficticios se utiliza `docker compose down -v` seguido de `docker compose up --build`.

El entorno usa PostgreSQL, un backend Java/Spring Boot y un frontend servido por Nginx. Las credenciales del archivo `.env.example` son únicamente de demostración.

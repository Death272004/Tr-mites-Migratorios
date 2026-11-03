#  DevOps · Plataforma Interoperable

<p align="center">
  <img src="../recursos-proyecto/assets/readme-hero.svg" alt="Sistema Interoperable de Trámites Migratorios" width="100%">
</p>


<p align="center">
  <img src="../recursos-proyecto/assets/project-status.svg" alt="Estado del proyecto" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose">
  <img src="https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions">
  <img src="https://img.shields.io/badge/Nginx-Proxy-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx">
  <img src="https://img.shields.io/badge/Entorno-Reproducible-56C596?style=for-the-badge" alt="Entorno reproducible">
</p>

<p align="center">
  <a href="#-propósito"> Propósito</a> ·
  <a href="#-ejecución-rápida"> Ejecución</a> ·
  <a href="#-archivos-operativos"> Archivos</a> ·
  <a href="#-documentación"> Documentación</a>
</p>

<p align="center"><strong>Entornos reproducibles, integración continua y despliegue local</strong><br>Backend Java · PostgreSQL · Frontend Nginx · datos ficticios</p>

##  Propósito

DevOps mantiene el entorno técnico para que el equipo pueda levantar, probar y demostrar la plataforma de forma reproducible. La configuración utiliza Docker Compose, un backend Java/Spring Boot, PostgreSQL y un frontend servido por Nginx.

> El proyecto es académico: utiliza datos ficticios y servicios simulados. No se conectan APIs institucionales reales.

##  Ejecución rápida

Desde la raíz del repositorio:

```bash
docker compose up --build
```

Servicios principales:

| Servicio | Dirección local |
| --- | --- |
| Frontend | `http://localhost:8081/html/index.html#/login` |
| Backend | `http://localhost:8080` |
| PostgreSQL | `localhost:5433` |

Para detener el entorno:

```bash
docker compose down
```

Para reiniciar también los datos ficticios:

```bash
docker compose down -v
docker compose up --build
```

##  Archivos operativos

| Archivo | Función |
| --- | --- |
| `ci.yml` | Configuración del flujo de integración continua. |
| `../docker-compose.yml` | Orquestación del frontend, backend y base de datos. |
| `../docker/nginx.conf` | Proxy `/api` y cabeceras de seguridad. |
| `.env.example` | Variables de demostración, cuando estén disponibles. |

##  Flujo DevOps

```mermaid
flowchart LR
    A[Cambio en rama] --> B[Pull Request]
    B --> C[CI: compilación y pruebas]
    C --> D[Docker Compose]
    D --> E[Smoke test]
    E --> F[Entorno demostrable]
```

##  Documentación

La documentación técnica y las evidencias de esta responsabilidad se encuentran en la rama [`Documentacion`](https://github.com/Death272004/Tr-mites-Migratorios/tree/Documentacion/DevOps):

- Entornos y variables.
- Pipeline de integración continua.
- Despliegue local.
- Alcance de la rama DevOps por sprint.
- Evidencias de ejecución, CI y validaciones técnicas.
- Marco legal y análisis del problema.

##  Definition of Done

- El entorno levanta con `docker compose up --build`.
- Backend y frontend permanecen saludables.
- Las pruebas automatizadas se ejecutan en CI.
- El frontend puede consumir `/api` mediante Nginx.
- Las evidencias se registran en la documentación central.
- No se incluyen secretos ni datos personales reales.

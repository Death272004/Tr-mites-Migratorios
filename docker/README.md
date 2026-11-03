#  Docker · Plataforma Interoperable

<p align="center">
  <img src="../recursos-proyecto/assets/readme-hero.svg" alt="Sistema Interoperable de Trámites Migratorios" width="100%">
</p>


<p align="center">
  <img src="../recursos-proyecto/assets/readme-app-status.svg" alt="Estado del proyecto" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Nginx-proxy%20seguro-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx">
  <img src="https://img.shields.io/badge/Docker-entorno%20local-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/CSP-y%20cabeceras%20de%20seguridad-8B5CF6?style=for-the-badge" alt="Seguridad web">
</p>

<p align="center">
  <a href="#-qué-hace"> Qué hace</a> ·
  <a href="#-rutas-principales"> Rutas</a> ·
  <a href="#-ejecución"> Ejecución</a> ·
  <a href="#-alcance"> Alcance</a>
</p>

<p align="center"><strong>Puerta de entrada del frontend y la API</strong><br>Contenido estático · proxy interno · cabeceras de seguridad · healthcheck</p>

##  Qué hace

Esta carpeta contiene la configuración de **Nginx** utilizada por el contenedor del frontend. Nginx sirve las pantallas HTML, CSS y JavaScript, redirige las solicitudes de la API hacia el backend y aplica controles básicos de seguridad al entorno local.

El archivo principal es [`nginx.conf`](nginx.conf).

##  Rutas principales

| Ruta | Función |
| --- | --- |
| `/` | Redirige al punto de entrada `html/index.html`. |
| `/html/index.html` | Sirve la aplicación web del frontend. |
| `/api/` | Envía las solicitudes al servicio `backend:8080` dentro de Docker. |
| `/salud` | Devuelve `ok` para comprobar que Nginx está disponible. |
| Otros archivos | Se sirven como recursos estáticos; las rutas inexistentes devuelven `404`. |

##  Seguridad aplicada

La configuración incluye Content Security Policy, protección contra iframes, prevención de MIME sniffing, política de referencias, permisos del navegador y aislamiento entre orígenes. También oculta la versión de Nginx y limita el tamaño de carga a 16 MB.

El proxy mantiene frontend y backend bajo el mismo origen. De esta manera, el navegador utiliza `/api` sin exponer puertos internos ni depender de CORS para la demostración local.

##  Ejecución

Desde la raíz del repositorio:

```bash
docker compose up --build
```

Después abre:

```text
http://localhost:8081/html/index.html#/login
```

Para comprobar Nginx directamente:

```bash
curl http://localhost:8081/salud
```

El resultado esperado es `ok`.

##  Alcance

- La configuración está pensada para el MVP académico y el entorno local.
- El backend y las instituciones externas utilizan datos ficticios y servicios simulados.
- No se almacenan credenciales ni secretos en este directorio.
- Los cambios de seguridad se validan con las pruebas de QA y los análisis de OWASP ZAP del proyecto.

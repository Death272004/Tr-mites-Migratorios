# TASK-33.1 · Instalación limpia y registro de incidencias

## Alcance

La instalación limpia debe poder reproducirse con el README y `docker compose up`. Esta ejecución se realizó sobre el equipo local de desarrollo; por ello valida la composición y salud del entorno, pero no sustituye todavía una máquina completamente nueva.

## Comprobaciones realizadas

Desde la raíz del proyecto:

```bash
docker compose ps --format json
```

Resultado observado:

- `backend`: running, healthy.
- `db`: running, healthy.
- `frontend`: running, healthy, publicado en `localhost:8080`.
- `mail-provisioner`: running, healthy.
- `mailserver`: running, healthy.
- `webmail`: running.

También se confirmó la existencia de `README.md` y `docker-compose.yml`.

## Incidencias y límites

1. La prueba se ejecutó en un equipo que ya tenía imágenes y volúmenes Docker; no es una instalación desde una máquina vacía.
2. La verificación de `git clone` desde un repositorio remoto y la carga de semillas desde cero quedan pendientes de una ejecución aislada.
3. No se modificaron archivos de configuración ni se eliminaron volúmenes para evitar afectar el entorno de trabajo actual.

## Estado

**Parcialmente verificada / pendiente de máquina limpia.** La composición local está saludable, pero TASK-33.1 no se marca como completa hasta repetirla en un entorno sin imágenes ni volúmenes previos.

## Siguiente tarea

Revisar hallazgos de empaquetado, configuración, rutas y semillas en TASK-33.2 antes de preparar el paquete final.

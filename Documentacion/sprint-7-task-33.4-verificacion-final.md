# TASK-33.4 · Verificación posterior de la instalación

## Comprobaciones

Se ejecutaron desde la raíz del proyecto:

```bash
docker compose config --quiet
docker compose ps
curl http://localhost:8080
curl http://localhost:8080/api/catalogos/tipos-tramite
```

Resultados:

- La configuración de Compose es válida.
- Backend, base de datos, frontend, mail-provisioner y mailserver aparecen activos y saludables.
- El frontend responde con HTTP 302, compatible con su redirección inicial.
- El endpoint de catálogo responde HTTP 401 sin autenticación; esto confirma que la ruta está protegida y no se interpreta como fallo de instalación.

## Limitación

Esta verificación se ejecutó en el entorno local existente. No reemplaza una instalación desde una máquina sin imágenes ni volúmenes previos, que sigue siendo la evidencia pendiente de TASK-33.1.

## Estado

**Verificada en el entorno local; pendiente de instalación aislada para cierre completo de HU-33.** No se modificó código ni se hizo commit o push.

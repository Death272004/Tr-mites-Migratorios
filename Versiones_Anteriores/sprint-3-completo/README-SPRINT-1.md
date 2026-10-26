# Revisión DevOps — Sprint 1

Este documento resume el trabajo realizado en la rama DevOps durante el Sprint 1
para que el equipo lo revise antes de darlo por cerrado.

## Información del cambio

- **Rama publicada:** `DevOps`
- **Responsable:** Kenneth Carter
- **Base temporal de integración:** `feature/hu-08-22-backend-sprints-1-4`
- **Commit:** `019c1d4`
- **Nombre del commit:** `docs(devops): completar controles del sprint 1`

## Objetivo del Sprint 1

Preparar la organización y las reglas básicas del repositorio para que el equipo
pueda trabajar e integrar cambios sin subir secretos, archivos temporales ni datos
personales.

Este sprint no incluye nuevas pantallas, endpoints, Docker completo ni CI/CD.

## Qué se realizó

### 1. Protección del repositorio

Se agregó `.gitignore` para evitar que se suban:

- archivos `.env` y secretos locales;
- `node_modules`;
- compilaciones y cobertura;
- archivos `target` de Java/Maven;
- datos y almacenamiento local;
- reportes temporales.

También se agregó `.env.example` como plantilla de configuración. Esta plantilla
se puede versionar porque contiene valores de ejemplo y no secretos reales.

### 2. Organización del trabajo

Se documentaron las reglas para:

- nombrar ramas;
- escribir commits;
- crear Pull Requests;
- solicitar revisión a otro integrante;
- resolver conflictos antes de integrar.

La documentación está en [`docs/CONVENCIONES-GIT.md`](docs/CONVENCIONES-GIT.md).

### 3. Ambientes y secretos

Se definieron tres ambientes:

- **Desarrollo:** trabajo local de cada integrante.
- **Pruebas:** validación reproducible con datos ficticios.
- **Demostración:** presentación del MVP con datos ficticios.

También se documentó que los archivos `.env` y las credenciales reales nunca deben
subirse al repositorio. La estrategia completa está en
[`docs/ENTORNOS-Y-SECRETOS.md`](docs/ENTORNOS-Y-SECRETOS.md).

### 4. Evidencias

Se creó `docs/evidencias/` para guardar capturas, informes y resultados de pruebas
sin secretos ni datos personales. Las reglas están en
[`docs/evidencias/README.md`](docs/evidencias/README.md).

### 5. Verificación

Se verificó lo siguiente:

- el formato del cambio no presenta errores;
- `.env`, `node_modules`, `target`, builds y datos locales quedan ignorados;
- `.env.example` permanece versionable;
- no se encontraron claves privadas ni tokens reales en los archivos revisados;
- Frontend y Backend pueden coexistir en una copia de integración sin conflictos;
- la copia integrada levantó frontend, backend y base de datos correctamente.

El detalle de la verificación está en
[`docs/evidencias/sprint-1-verificacion-2026-10-12.md`](docs/evidencias/sprint-1-verificacion-2026-10-12.md).

## Archivos principales agregados

```text
.env.example
.gitignore
README.md
docs/CONVENCIONES-GIT.md
docs/ENTORNOS-Y-SECRETOS.md
docs/evidencias/README.md
docs/evidencias/sprint-1-verificacion-2026-10-12.md
scripts/README.md
```

## Revisión solicitada al equipo

Por favor confirmar:

1. Si están de acuerdo con usar `feature/hu-08-22-backend-sprints-1-4` como base
   temporal de integración.
2. Si las convenciones de ramas, commits y Pull Requests son correctas.
3. Si la estrategia de ambientes y secretos puede aprobarse.
4. Si la carpeta `docs/evidencias/` será la ubicación oficial para las evidencias.

Con la aprobación del líder técnico y la revisión de otro integrante, el Sprint 1
puede considerarse listo para integración. El siguiente trabajo de DevOps será el
Sprint 2: Docker, healthchecks y arranque reproducible.

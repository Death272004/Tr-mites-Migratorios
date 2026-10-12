# Sistema de Trámites Migratorios

Proyecto MVP para la gestión de expedientes migratorios de bufetes de abogados.
El desarrollo usa datos ficticios y debe respetar la política de protección de datos
definida por el equipo.

## Rama base de integración

Mientras el equipo no actualice `main`, la base técnica acordada para integrar y
probar el trabajo es:

```text
feature/hu-08-22-backend-sprints-1-4
```

El frontend se mantiene en la rama `Frontend` hasta que el equipo lo integre.
Las pruebas completas deben ejecutarse sobre una copia local que combine ambas
ramas. Esta rama `DevOps` contiene las reglas, configuración y documentación de
infraestructura; no reemplaza el trabajo del backend ni del frontend.

## Estructura del repositorio

Las carpetas existentes del proyecto conservan sus nombres actuales:

- `Backend/`: API y pruebas del backend.
- `Frontend/`: portal web.
- `DB/`: material relacionado con base de datos.
- `DevOps/`: alcance y documentación de infraestructura.
- `Documentacion/`: documentación funcional y técnica.
- `QA/`: criterios y documentación de calidad.
- `docs/`: convenciones, estrategias y evidencias operativas.
- `scripts/`: scripts reproducibles de validación y soporte.

No se deben crear carpetas paralelas en minúsculas (`backend/`, `frontend/` o
`docs/`) para duplicar contenido. Si se decide normalizar los nombres, debe
aprobarse como una tarea independiente para evitar conflictos entre ramas.

## Primer arranque local

En la rama de integración que ya contiene el backend, frontend y Docker:

```bash
cp .env.example .env
docker compose up --build
```

Los valores del `.env.example` son únicamente de desarrollo y demostración.
Nunca sustituyas esos valores por credenciales reales dentro del repositorio.

## Documentación DevOps

- [Seguimiento de los Sprints DevOps](README-DEVOPS.md)
- [Convenciones de Git](docs/CONVENCIONES-GIT.md)
- [Estrategia de ambientes y secretos](docs/ENTORNOS-Y-SECRETOS.md)
- [Política de evidencias](docs/evidencias/README.md)
- [Plan y alcance de la rama DevOps](DevOps/Rama-05-DevOps.md)

## Estado del Sprint 1

La estructura, las convenciones y la estrategia de ambientes están documentadas.
La aprobación final de la estrategia por parte del líder técnico debe registrarse
en [ENTORNOS-Y-SECRETOS.md](docs/ENTORNOS-Y-SECRETOS.md) antes de cerrar el sprint.

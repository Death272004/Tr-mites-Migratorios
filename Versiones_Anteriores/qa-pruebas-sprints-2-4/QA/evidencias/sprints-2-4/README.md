# Evidencias de QA · Sprints 2 a 4

**Fecha de ejecución:** 2026-10-18 · **Ejecutó:** Edgar Rosario (cubriendo las tareas de QA asignadas a Vivian Paris) · **Rama:** `qa/pruebas-sprints-2-4`

**Entorno:** Windows 11, Docker Desktop, JDK 21, PostgreSQL 16 (Testcontainers para las pruebas; `postgres:16-alpine` en el arranque limpio). Solo datos ficticios.

## Resultado

| TeamTrack | Tarea | Casos | Resultado | Documento |
| --- | --- | --- | --- | --- |
| #98 | TASK-10.6 · Arranque limpio en máquina nueva | 1 recorrido manual | ✔ 127 s, 3/3 servicios healthy | `TASK-10.6-evidencia.docx` |
| #113 | TASK-13.4 · Autorización por rol | 11 | ✔ 11/11 | `TASK-13.4-evidencia.docx` |
| #118 | TASK-14.4 · Códigos de error y no exposición | 10 | ✔ 10/10 | `TASK-14.4-evidencia.docx` |
| #127 | TASK-16.4 · Titularidad, paginación y rendimiento | 12 | ✔ 12/12 (P95 30 ms) | `TASK-16.4-evidencia.docx` |
| #132 | TASK-17.5 · Documentos: carga, rechazo, descarga | 11 | ✔ 11/11 | `TASK-17.5-evidencia.docx` |
| #136 | TASK-18.4 · Notificaciones seguras | 4 | ✔ 4/4 | `TASK-18.4-evidencia.docx` |
| #141 | TASK-18b.5 · Consentimiento informado | 8 | ✔ 8/8 | `TASK-18b.5-evidencia.docx` |
| #146 | TASK-18c.5 · Derechos ARCO | 6 | ✔ 6/6 | `TASK-18c.5-evidencia.docx` |
| #151 | TASK-19.5 · Transiciones de estado | 10 | ✔ 10/10 (100 pares de estados) | `TASK-19.5-evidencia.docx` |
| #154 | TASK-20.3 · Observaciones: permisos y auditoría | 5 | ✔ 5/5 | `TASK-20.3-evidencia.docx` |
| #157 | TASK-21.3 · Autorización del historial | 4 | ✔ 4/4 | `TASK-21.3-evidencia.docx` |
| #162 | TASK-22.5 · Eventos críticos y logs sin secretos | 6 | ✔ 6/6 | `TASK-22.5-evidencia.docx` |

Suite completa del backend: **111 pruebas, 0 fallas** (68 existentes + 43 nuevas de QA, clases `Qa*Test`). Se comprobó que las pruebas nuevas detectan errores: al alterar a propósito la matriz esperada de transiciones, la prueba falló señalando el par exacto.

## Cómo reproducir

```bash
cd Backend
./mvnw test                 # toda la suite (necesita Docker)
./mvnw test -Dtest='Qa*'    # solo las pruebas de QA
```

Arranque limpio: clonar el repositorio en una carpeta vacía y ejecutar `docker compose build --no-cache && docker compose up -d` (ver `arranque-*.txt`).

## Hallazgos (no bloquean las tareas, se reportan a sus responsables)

1. **Limitación del tratamiento sin consentimiento (HU-18b CA-2).** La regla existe (`ConsentimientoServicio.exigirVigente`) y se probó, pero todavía ningún endpoint la invoca: en la versión actual no hay operaciones que vayan más allá de lo contractual. Las verificaciones con fuentes externas del Sprint 5 deben llamarla. Responsable: Backend.
2. **Correlación en los registros del servidor.** El encabezado y el cuerpo de error llevan `X-Correlation-Id`, pero las líneas del log no lo muestran porque el patrón de log no incluye `%X{correlacionId}`. Afecta a "Validar los identificadores de correlación" (Kenneth y Edgar).
3. **Portal · Mis trámites.** Tras el login del usuario demo se ve un bloque "Cargando sus trámites…" duplicado y tarjetas de ejemplo en lugar de los expedientes reales; corresponde a TASK-16.3 (conectar P-06 al backend), pendiente. Responsable: Frontend.
4. **Correo simulado.** Con `CORREO_SIMULADO=true` (valor por defecto del compose) el token de recuperación se escribe en el log del backend. Es lo esperado en desarrollo, pero debe quedar en `false` fuera de él.
5. **OWASP ZAP y JMeter** figuran en el Sprint 6 de TeamTrack (HU-28, HU-29), no en el Sprint 4; no se ejecutaron en esta entrega.

## Contenido

* `capturas/` — capturas del arranque (health, login demo, portal) y de los resultados de JUnit por tarea.
* `surefire/` — resumen de Surefire por clase de prueba.
* `resultados.json` — cada caso de prueba con su tarea, estado y tiempo.
* `listado-1000.txt` — métricas de rendimiento del listado (TASK-16.4).
* `arranque-*.txt`, `backend-arranque.txt` — evidencia del arranque limpio (TASK-10.6).
* `TASK-*.docx` — documento de evidencia por tarea (caso, fecha, entorno, datos, resultado esperado y obtenido, capturas).

## Flujos disponibles (recorrido manual contra el sistema en Docker)

`flujos/Flujos-disponibles-tramites-migratorios.xlsx` documenta los **41 flujos** que el sistema ofrece hoy, con hojas Resumen, Flujos, Pasos (cada petición HTTP con su código y correlación) y Capturas (imagen incrustada de cada flujo):

* **35 flujos de la API** (F-01 a F-35), ejecutados con los usuarios ficticios de demostración contra `http://localhost:8080`: 35/35 correctos, 131/131 peticiones con el código esperado.
* **6 flujos del portal** (U-01 a U-06) en `http://localhost:8081`: login, perfil, registro y recuperación funcionan contra el backend; "Mis trámites" pasa con observación (TASK-16.3) y el acceso institucional (I-01) todavía usa datos ficticios del frontend (no conectado).

Las capturas están en `flujos/capturas/`, el detalle de cada petición en `flujos/flujos.json` (tokens y contraseñas enmascarados) y el script que recorre los flujos en `flujos/recorrer-flujos.mjs` (`node recorrer-flujos.mjs` con el sistema levantado).

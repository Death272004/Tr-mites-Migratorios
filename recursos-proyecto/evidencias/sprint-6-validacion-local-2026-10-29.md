# Sprint 6 — Validación técnica local

Fecha de ejecución: 29 de octubre de 2026  
Rama revisada: `DevOps`  
Propósito: reunir la evidencia reproducible del Review #2 sin presentar como terminadas las actividades que requieren participantes reales.

## Resultado de la revisión

| Área | Evidencia verificable | Resultado |
|---|---|---|
| Backend | `Backend/./mvnw -q test` | Suite ejecutada localmente; el resumen final se conserva en los reportes de Surefire generados en `Backend/target/surefire-reports/`. |
| Cobertura | `Backend/target/site/jacoco/` | JaCoCo genera cobertura de instrucciones, líneas, ramas, métodos y complejidad. |
| Frontend | `node --check` sobre los archivos JavaScript de `Frontend/js` | Sintaxis válida para los archivos revisados. |
| Contenedores | `docker compose config --quiet` | Configuración válida. |
| Salud del backend | `GET /actuator/health` | Responde con estado `UP` en el entorno local activo. |
| Interfaz | `Frontend/qa/usabilidad-sprint6.md` | Mejoras de foco, navegación por teclado, mensajes `aria-live`, menú móvil y controles táctiles documentadas. |
| CI/CD | `.github/workflows/backend-tests.yml` | Workflow configurado para ejecutar Maven, publicar Surefire y JaCoCo en cada `push` y `pull_request`. |

## Smoke test automatizado de la interfaz

Se ejecutó una comprobación manual automatizada sobre el entorno local activo usando únicamente datos ficticios:

1. Se abrió el portal del cliente.
2. Se inició sesión con la cuenta de demostración documentada por la aplicación.
3. El sistema mostró el portal de cliente y la pantalla de trámites sin error de carga.
4. Se navegó a «Nueva solicitud» y se mostró el paso 1 de 11 con sus validaciones y controles.
5. La página mantuvo un elemento `main` y una región `[aria-live]` para anunciar cambios de navegación.

Esta comprobación confirma el flujo básico de interfaz y los puntos técnicos de accesibilidad. No sustituye una sesión con una persona, porque no mide tiempo de aprendizaje, errores humanos ni necesidad de asistencia.

## Medidas técnicas registradas

En la ejecución anterior de la suite del backend se registraron 139 pruebas, sin fallos, errores ni pruebas omitidas. La cobertura JaCoCo registrada fue:

- Instrucciones: 93.90 %.
- Líneas: 92.32 %.
- Ramas: 80.97 %.
- Complejidad: 86.06 %.
- Métodos: 95.74 %.

Estas cifras describen la ejecución automatizada del backend; no equivalen por sí solas a una prueba de usabilidad con personas.

## Trazabilidad del incremento

- HU-27: integración del flujo de calidad y cobertura en CI.
- HU-28: pruebas y validaciones del producto.
- HU-29: controles de seguridad, errores y trazabilidad.
- HU-30: mejoras de interfaz y protocolo de usabilidad.

La evidencia de código se encuentra en los módulos de `Backend`, `Frontend` y `.github/workflows`. Las pruebas automatizadas se reportan mediante Surefire y JaCoCo.

## Alcance de usabilidad y pendiente real

El archivo `Frontend/qa/usabilidad-sprint6.md` define las tareas críticas, los criterios de observación y el procedimiento de registro. También deja explícito que todavía se deben ejecutar sesiones con participantes reales y registrar, como mínimo, tiempo, errores, solicitudes de ayuda y observaciones.

Por esta razón, no se deben inventar participantes ni resultados. Las tareas que exigen sesiones reales —en particular `TASK-30.2`, `TASK-30.3`, `TASK-30.4`, `TASK-30.5` y el cierre de `HU-30`— solo pueden cerrarse después de ejecutar y adjuntar ese registro.

## Conclusión

El incremento técnico es reproducible y tiene evidencia para backend, frontend, CI/CD y accesibilidad. El Sprint 6 no debe declararse completamente cerrado mientras falte la validación con usuarios reales y su informe final. Esta separación permite presentar resultados honestos y facilita cerrar las tareas restantes cuando QA incorpore las sesiones.

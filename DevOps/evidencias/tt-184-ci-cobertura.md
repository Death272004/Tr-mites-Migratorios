# TT-184 — Suite en CI con reporte de cobertura

## Objetivo

Ejecutar automáticamente las pruebas del backend en cada `push` y `pull request`, generando un reporte de cobertura para revisar el resultado del incremento de Sprint 6.

## Implementación

- Workflow: `.github/workflows/backend-tests.yml`.
- Comando ejecutado: `./mvnw -B verify`.
- Plataforma: GitHub Actions sobre Ubuntu.
- Runtime: Java 17.
- Cobertura: JaCoCo en `Backend/target/site/jacoco/`.
- Evidencias de pruebas: `Backend/target/surefire-reports/`.
- Artefacto publicado: `backend-coverage`.

## Criterio de aceptación

La suite se considera integrada cuando GitHub Actions ejecuta el ciclo Maven y deja disponibles el reporte HTML de JaCoCo y los resultados de Surefire como artefactos del workflow.

## Validación local

Desde la raíz del repositorio:

```bash
cd Backend
./mvnw -B verify
```

El reporte se genera en `Backend/target/site/jacoco/index.html` después de una ejecución exitosa.

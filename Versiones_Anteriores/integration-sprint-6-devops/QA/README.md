# Rama QA y Seguridad

Esta rama concentra la planificación, ejecución y evidencia de calidad del Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá.

## Organización por sprint

- [Sprint 0](sprint-0/README.md): análisis inicial, riesgos y estrategia de calidad.
- [Sprint 1](sprint-1/README.md): plan de pruebas, contratos y primera integración.
- [Sprint 2](sprint-2/README.md): entorno reproducible, autenticación, roles y errores.
- [Sprint 3](sprint-3/README.md): expedientes, documentos, permisos y auditoría.
- [Sprint 4](sprint-4/README.md): indicadores QA, seguridad, rendimiento y reporte técnico.

## Herramientas

Se utilizan Docker para el entorno reproducible, Java/JUnit para pruebas automatizadas, Postman para API, OWASP ZAP para seguridad y Apache JMeter para rendimiento.

## Criterio de evidencia

Una prueba solo se considera cerrada cuando tiene caso, entorno, datos ficticios, resultado esperado, resultado obtenido, evidencia y estado. No se utilizan datos reales de personas.

# QA – Sprint 4: Indicadores, seguridad y rendimiento

## Objetivo

Aplicar indicadores de calidad y reunir evidencia técnica de seguridad, rendimiento, funcionalidad y trazabilidad para el proyecto.

## Indicadores

- LOC/ELOC y esfuerzo.
- Número y edad de defectos.
- Productividad y casos ejecutados.
- Adecuación funcional y usabilidad.
- Seguridad y confiabilidad.
- Mantenibilidad y compatibilidad.
- Eficiencia de rendimiento.

## Herramientas y actividades

- **OWASP ZAP:** escaneo pasivo y activo, revisión de sesiones, cabeceras, autorización, entradas y exposición de información.
- **Apache JMeter:** carga concurrente, tiempo medio, P95, solicitudes por segundo, errores HTTP y comportamiento ante una dependencia no disponible.
- **Docker:** entorno de prueba reproducible.
- **Java/JUnit/Postman:** pruebas unitarias, de integración y de API.

## Evidencia disponible

El informe `Informe_QA_JMeter_OWASP_ZAP_Tramites_Migratorios.pdf` contiene el reporte técnico de QA asociado a este sprint.

La verificación de humo del entorno está documentada en [Resultado_Verificacion_Entorno.md](Resultado_Verificacion_Entorno.md).

## Criterio de aceptación

Cada hallazgo debe tener severidad, responsable, estado y fecha. Las vulnerabilidades críticas y altas deben corregirse o quedar justificadas como riesgo residual. Las métricas deben interpretarse y relacionarse con decisiones del proyecto.

## Pendientes de control

- Enlazar capturas o archivos de resultados de cada ejecución.
- Registrar defectos abiertos y cerrados.
- Repetir las pruebas después de cada corrección.
- Confirmar los umbrales de rendimiento con el equipo.

## Estado

La estructura de QA y el informe técnico están incorporados. Los resultados adicionales deben agregarse como evidencia conforme se ejecuten nuevas pruebas.

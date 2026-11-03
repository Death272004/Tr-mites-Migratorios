#  QA · Calidad, seguridad y rendimiento

<p align="center">
  <img src="../recursos-proyecto/assets/readme-hero.svg" alt="Sistema Interoperable de Trámites Migratorios" width="100%">
</p>


<p align="center">
  <img src="../recursos-proyecto/assets/project-status.svg" alt="Estado del proyecto" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Pruebas-JUnit%20%7C%20Postman-56C596?style=for-the-badge" alt="Pruebas automatizadas y API">
  <img src="https://img.shields.io/badge/Seguridad-OWASP%20ZAP-8B5CF6?style=for-the-badge" alt="OWASP ZAP">
  <img src="https://img.shields.io/badge/Rendimiento-JMeter-F28C28?style=for-the-badge" alt="Apache JMeter">
</p>

<p align="center"><strong>Evidencias reproducibles para validar el MVP</strong><br>Funcionalidad · autorización · seguridad · rendimiento · usabilidad</p>

Esta rama concentra la planificación, ejecución y evidencia de calidad del Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá.

## Organización por sprint

- [Sprint 0](sprint-0/README.md): análisis inicial, riesgos y estrategia de calidad.
- [Sprint 1](sprint-1/README.md): plan de pruebas, contratos y primera integración.
- [Sprint 2](sprint-2/README.md): entorno reproducible, autenticación, roles y errores.
- [Sprint 3](sprint-3/README.md): expedientes, documentos, permisos y auditoría.
- [Sprint 4](sprint-4/README.md): indicadores QA, seguridad, rendimiento y reporte técnico.
- [Sprint 5](sprint-5/README.md): adaptadores, reintentos, idempotencia y trazabilidad.
- [Sprint 6](sprint-6/README.md): integración, cobertura, ZAP, JMeter y usabilidad.

## Documentación general

Los documentos que describen el problema, los roles, el marco legal y la estrategia general del proyecto se mantienen en [`Documentacion/documentos-base`](../Documentacion/documentos-base/):

- [Problema del caso](../Documentacion/documentos-base/Problematica.md)
- [Roles y accesos](../Documentacion/documentos-base/06-roles-y-accesos.md)
- [Marco legal y protección de datos](../Documentacion/documentos-base/ley-81-de-26-de-marzo-de-2019-sobre-proteccion-de-datos-personales.md)
- [Guía de la rama QA](../Documentacion/documentos-base/Rama-03-QA-Seguridad.md)

La carpeta `QA/` conserva los casos, scripts, informes y resultados necesarios para ejecutar o comprobar las pruebas; no duplica la documentación general.

## Herramientas

Se utilizan Docker para el entorno reproducible, Java/JUnit para pruebas automatizadas, Postman para API, OWASP ZAP para seguridad y Apache JMeter para rendimiento.

## Criterio de evidencia

Una prueba solo se considera cerrada cuando tiene caso, entorno, datos ficticios, resultado esperado, resultado obtenido, evidencia y estado. No se utilizan datos reales de personas.

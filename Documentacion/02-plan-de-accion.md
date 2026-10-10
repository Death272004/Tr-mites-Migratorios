# Documento 2. Plan de acción

## Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá

## 2.1. Objetivo del plan

Organizar las actividades necesarias para analizar, diseñar, desarrollar, probar y evaluar el prototipo interoperable, indicando el orden de ejecución, los responsables, los recursos, los entregables y los criterios de aceptación.

## 2.2. Plan por fases

Las duraciones son estimaciones iniciales para un proyecto académico. Deben ajustarse al tamaño del equipo, al alcance definitivo y a la disponibilidad de los integrantes. La propuesta contempla siete sprints de dos semanas, equivalentes a catorce semanas de trabajo.

| Fase                          | Actividades principales                                                                                          | Responsable principal                        | Recursos                                                       | Entregable                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------- | --------------------------------- |
| 1. Análisis y requisitos      | Identificar trámites, actores, requisitos, restricciones legales y problemas del proceso actual.                 | Product Owner y analista                     | Entrevistas, documentación institucional, matriz de requisitos | Documento de requisitos y alcance |
| 2. Diseño técnico             | Definir arquitectura, modelo de datos, API, roles, estados y mecanismos de seguridad.                            | Arquitecto o líder técnico y desarrolladores | Java, PostgreSQL, diagramas, Git                               | Arquitectura y diseño técnico     |
| 3. Preparación del entorno    | Configurar repositorio, contenedores, backend, base de datos y ambiente de pruebas.                              | Líder técnico y equipo de desarrollo         | Docker, Git, Java, PostgreSQL                                  | Entorno reproducible              |
| 4. Construcción del prototipo | Desarrollar autenticación, expedientes, documentos, flujo de estados y servicios simulados de interoperabilidad. | Equipo de desarrollo                         | Spring Boot, frontend, API REST                                | Prototipo funcional               |
| 5. Pruebas y seguridad        | Ejecutar pruebas funcionales, integración, permisos, vulnerabilidades y rendimiento.                             | QA y responsable de seguridad                | JMeter, OWASP ZAP, casos de prueba                             | Informe de pruebas                |
| 6. Evaluación y correcciones  | Corregir incidencias, evaluar facilidad de uso, verificar trazabilidad y medir tiempos del prototipo.            | QA, Product Owner y desarrollo               | Métricas, pruebas de aceptación                                | Informe de evaluación             |
| 7. Entrega y documentación    | Preparar manuales, evidencias, configuración, limitaciones y presentación final.                                 | Equipo completo                              | Repositorio, documentación, entorno de demostración            | Entrega final del proyecto        |

## 2.3. Responsabilidades del equipo

* Product Owner: define prioridades, aclara reglas del negocio, mantiene el backlog y acepta o rechaza historias de usuario según los criterios acordados.

* Líder técnico o arquitecto: define las decisiones técnicas, revisa la arquitectura y mantiene la coherencia de las integraciones.

* Desarrollador backend: implementa API, reglas de negocio, persistencia, autenticación y autorizaciones.

* Desarrollador frontend: implementa formularios, paneles, validaciones visuales y seguimiento de expedientes.

* QA o responsable de pruebas: diseña y ejecuta pruebas funcionales, de integración, seguridad y rendimiento.

* Responsable de documentación: mantiene los manuales, diagramas, evidencias y registro de decisiones. Esta función puede combinarse con otra en un equipo pequeño.

En un equipo académico, una persona puede desempeñar más de una función. Las responsabilidades deben asignarse a integrantes concretos cuando se conozca la composición del equipo.

## 2.4. Gestión de riesgos

| Riesgo                                          | Impacto                                      | Mitigación                                                                                                        |
| ----------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| No disponer de acceso a las API institucionales | No se pueden validar integraciones reales    | Implementar adaptadores y simuladores con datos ficticios; documentar los requisitos para una integración futura. |
| Acceso excesivo a datos personales              | Riesgo legal y de privacidad                 | Aplicar mínimo privilegio, revisión de permisos, minimización de datos y auditoría.                               |
| Respuestas lentas o fallos institucionales      | Retrasos en validaciones                     | Establecer tiempos de espera, reintentos controlados y estados de error técnico.                                  |
| Cambios en los requisitos                       | Retrabajo y demoras                          | Priorizar el backlog y registrar cambios aprobados.                                                               |
| Vulnerabilidades en las API                     | Exposición o modificación indebida de datos  | Pruebas de seguridad, revisión de código y corrección de hallazgos antes de la entrega.                           |
| Datos duplicados o inconsistentes               | Decisiones basadas en información incorrecta | Validaciones, identificadores de correlación, trazabilidad y revisión humana de inconsistencias.                  |
| Retrasos del equipo                             | Incumplimiento del cronograma                | Estimar capacidad por sprint, revisar bloqueos y reducir primero funciones no esenciales.                         |

## 2.5. Indicadores para medir el resultado

| Indicador                               | Método de medición                                                              | Meta inicial propuesta                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Tiempo de procesamiento del prototipo   | Medir desde la presentación hasta completar las validaciones simuladas          | Reducir al menos un 30 % frente a una línea base comparable del mismo escenario de prueba. |
| Duplicación de solicitudes documentales | Contar cuántas veces se solicita nuevamente un documento ya registrado y válido | Reducir solicitudes repetidas evitables en el flujo probado.                               |
| Trazabilidad                            | Comparar operaciones realizadas con los eventos de auditoría esperados          | 100 % de las operaciones críticas definidas quedan registradas.                            |
| Control de acceso                       | Ejecutar pruebas de acceso permitido y denegado por rol                         | 100 % de los casos críticos de autorización pasan las pruebas.                             |
| Rendimiento                             | Medir latencia y tasa de errores con JMeter                                     | Cumplir los umbrales acordados antes de ejecutar las pruebas.                              |
| Vulnerabilidades                        | Analizar la aplicación con OWASP ZAP y revisar los hallazgos                    | Cero vulnerabilidades críticas o altas sin resolver en la versión entregada.               |
| Usabilidad                              | Pruebas de tareas con usuarios de prueba                                        | Al menos 90 % de las tareas críticas se completan sin asistencia en el escenario evaluado. |

Las metas son objetivos de diseño para el prototipo, no resultados ya demostrados ni garantías sobre el proceso migratorio real. El tiempo de 3–8 meses del caso debe tratarse como referencia inicial hasta que se confirme con datos oficiales y se definan los trámites comparables.

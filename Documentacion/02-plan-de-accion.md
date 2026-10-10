# Documento 2. Plan de acción

## Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá

## 2.1. Objetivo del plan

Organizar las actividades necesarias para analizar, diseñar, construir y validar el producto interoperable destinado a bufetes de abogados, indicando el orden de ejecución, los responsables, los recursos, los entregables y los criterios de aceptación.

Los responsables corresponden al equipo del producto, con el Product Owner representando las necesidades del despacho: sus usuarios son el cliente del bufete (titular, portal), los abogados, analistas y asistentes del despacho, el socio director (resolución y supervisión), el administrador del despacho y la función de auditoría. El PO contrasta cada decisión con la operación real del bufete antes de aceptar el trabajo.

## 2.2. Plan por fases

Las duraciones son estimaciones iniciales para el desarrollo del producto. Deben ajustarse al tamaño del equipo, al alcance definitivo y a la disponibilidad de los integrantes. La propuesta contempla siete sprints de dos semanas, equivalentes a catorce semanas de trabajo.

| Fase                          | Actividades principales                                                                                          | Responsable principal                        | Recursos                                                       | Entregable                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------- |
| 1. Análisis y requisitos      | Identificar trámites, actores, requisitos, restricciones legales (Ley 81 de 2019 y Decreto Ejecutivo 285 de 2021) y el modelo de verificación sin transferencia institucional, desde el alcance real del bufete. | Product Owner y analista                     | Entrevistas con el despacho, marco legal, matriz de requisitos | Documento de requisitos, alcance y modelo legal |
| 2. Diseño técnico             | Definir arquitectura, modelo de datos, API, roles, estados, consentimientos y mecanismos de seguridad.             | Arquitecto o líder técnico y desarrolladores | Java, PostgreSQL, diagramas, Git                               | Arquitectura y diseño técnico             |
| 3. Preparación del entorno    | Configurar repositorio, contenedores, backend, base de datos y ambiente de pruebas.                              | Líder técnico y equipo de desarrollo         | Docker, Git, Java, PostgreSQL                                  | Entorno reproducible                      |
| 4. Construcción del MVP       | Desarrollar autenticación, expedientes, documentos, flujo de estados, consentimientos y ARCO, verificaciones documentales y la capa de adaptadores preparada. | Equipo de desarrollo                         | Spring Boot, frontend, API REST                                | MVP funcional                             |
| 5. Pruebas y seguridad        | Ejecutar pruebas funcionales, integración, permisos, vulnerabilidades y rendimiento.                             | QA y responsable de seguridad                | JMeter, OWASP ZAP, casos de prueba                             | Informe de pruebas                        |
| 6. Evaluación y correcciones  | Corregir incidencias, evaluar facilidad de uso, verificar trazabilidad y medir los tiempos del despacho con el producto. | QA, Product Owner y desarrollo               | Métricas, pruebas de aceptación                                | Informe de evaluación                     |
| 7. Entrega y documentación    | Preparar manuales, evidencias, configuración, limitaciones y presentación final.                                 | Equipo completo                              | Repositorio, documentación, entorno de demostración            | Entrega final del producto                |

## 2.3. Responsabilidades del equipo

* Product Owner: define prioridades, aclara reglas del negocio, representa las necesidades del despacho, mantiene el backlog y acepta o rechaza historias de usuario según los criterios acordados.

* Líder técnico o arquitecto: define las decisiones técnicas, revisa la arquitectura y mantiene la coherencia entre los módulos y la capa de adaptadores.

* Desarrollador backend: implementa API, reglas de negocio, persistencia, autenticación, autorizaciones y registro de verificaciones.

* Desarrollador frontend: implementa formularios, paneles, validaciones visuales y seguimiento de expedientes.

* QA o responsable de pruebas: diseña y ejecuta pruebas funcionales, de integración, seguridad y rendimiento.

* Responsable de documentación: mantiene los manuales, diagramas, evidencias y registro de decisiones. Esta función puede combinarse con otra en un equipo pequeño.

En un equipo reducido, una persona puede desempeñar más de una función. Las responsabilidades deben asignarse a integrantes concretos cuando se conozca la composición del equipo, y el Product Owner debe confirmar con el despacho que el alcance refleja su operación real.

## 2.4. Gestión de riesgos

| Riesgo                                          | Impacto                                            | Mitigación                                                                                                        |
| ----------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Asumir o prometer integraciones institucionales sin convenio | Expectativas incumplidas y riesgo reputacional     | Comunicar siempre el modelo de verificación manual asistida con fuentes públicas o documentos obtenidos con autorización; mantener la capa de adaptadores preparada para un futuro convenio (p. ej. vía AIG); nunca prometer acceso automático a sistemas institucionales. |
| Incumplimiento de la Ley 81 de 2019 y del Decreto Ejecutivo 285 de 2021 | Multas administrativas y daño reputacional del despacho | Consentimiento informado, consentimiento expreso para datos sensibles, minimización, finalidad declarada, bitácora de auditoría y validación jurídica antes de cada entrega. |
| Custodia de datos sensibles del cliente         | Acceso indebido o fuga de información del expediente | Cifrado en tránsito y en reposo, control por roles y por expediente, bitácora de accesos y acuerdo de tratamiento de datos con el proveedor de hosting. |
| Confidencialidad profesional y secreto profesional del abogado | Vulneración del deber de secreto del despacho       | Control de acceso por expediente, separación de ámbitos entre clientes, acuerdos de confidencialidad (NDA) con el personal y auditoría de consultas. |
| Acceso excesivo a datos personales              | Riesgo legal y de privacidad                       | Aplicar mínimo privilegio, revisión de permisos, minimización de datos y auditoría.                               |
| Indisponibilidad o lentitud de las fuentes externas de verificación | Retrasos en la verificación documental             | Tolerancia a fallos con estados de error técnico, reintentos controlados y ejecución manual asistida del cotejo.  |
| Cambios en los requisitos                       | Retrabajo y demoras                                | Priorizar el backlog y registrar cambios aprobados.                                                               |
| Vulnerabilidades en las API                     | Exposición o modificación indebida de datos        | Pruebas de seguridad, revisión de código y corrección de hallazgos antes de la entrega.                           |
| Datos duplicados o inconsistentes               | Decisiones basadas en información incorrecta       | Validaciones, identificadores de correlación, trazabilidad y revisión humana de inconsistencias.                  |
| Retrasos del equipo                             | Incumplimiento del cronograma                      | Estimar capacidad por sprint, revisar bloqueos y reducir primero funciones no esenciales.                         |

## 2.5. Indicadores para medir el resultado

| Indicador                               | Método de medición                                                              | Meta inicial propuesta                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Tiempo de preparación de un expediente  | Medir desde la apertura del expediente hasta dejarlo listo para presentar, en el flujo real del despacho | Reducir al menos un 30 % frente a la línea base medida en el propio despacho.              |
| Expedientes presentados sin observaciones por documentación | Contar expedientes presentados y observaciones de documentación recibidas      | Al menos el 90 % de los expedientes se presentan sin observaciones por documentación.      |
| Documentos repetidos solicitados al cliente | Contar documentos ya registrados y vigentes que vuelven a solicitarse al titular | Cero solicitudes repetidas evitables.                                                      |
| Tiempo de respuesta al cliente           | Medir el intervalo entre la consulta del cliente y la respuesta del despacho     | Responder el 90 % de las consultas dentro del plazo acordado por el despacho.              |
| Vigencias detectadas a tiempo            | Contar documentos con vigencia cuya expiración se detecta antes de la presentación | 100 % de las vigencias críticas se detectan antes de su vencimiento.                       |
| Trazabilidad                            | Comparar operaciones realizadas con los eventos de auditoría esperados          | 100 % de las operaciones críticas definidas quedan registradas.                            |
| Control de acceso                       | Ejecutar pruebas de acceso permitido y denegado por rol                         | 100 % de los casos críticos de autorización pasan las pruebas.                             |
| Rendimiento                             | Medir latencia y tasa de errores con JMeter                                     | Cumplir los umbrales acordados antes de ejecutar las pruebas.                              |
| Vulnerabilidades                        | Analizar la aplicación con OWASP ZAP y revisar los hallazgos                    | Cero vulnerabilidades críticas o altas sin resolver en la versión entregada.               |
| Usabilidad                              | Pruebas de tareas con usuarios de prueba                                        | Al menos 90 % de las tareas críticas se completan sin asistencia en el escenario evaluado. |

Las metas son objetivos de diseño y de operación del producto en el despacho, no resultados ya demostrados ni garantías sobre el proceso migratorio real. El tiempo oficial de 3–8 meses del trámite queda como referencia externa: corresponde a la autoridad competente, la plataforma no interviene en esa resolución y el tiempo no es atribuible al producto; solo se registra su efecto sobre los tiempos de preparación y respuesta medidos en el despacho.

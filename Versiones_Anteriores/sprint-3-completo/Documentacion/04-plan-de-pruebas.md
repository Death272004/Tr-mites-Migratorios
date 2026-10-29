# Documento 4. Plan de pruebas

## Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá

## 4.1. Objetivo

Comprobar que el sistema cumple los requisitos funcionales, protege los datos personales, mantiene la integridad de los expedientes, responde adecuadamente ante fallos y ofrece un uso comprensible para los actores previstos.

## 4.2. Estrategia de pruebas

| Tipo de prueba                         | Qué se comprueba                                                                                                                                                                                                                                   | Herramientas o método                     | Criterio de aceptación                                                                            |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Pruebas unitarias                      | Reglas de negocio, validaciones y transiciones                                                                                                                                                                                                     | JUnit y Mockito                           | Todos los casos críticos definidos pasan.                                                         |
| Pruebas de API                         | Métodos, contratos, respuestas y errores                                                                                                                                                                                                           | Postman o pruebas automatizadas           | Las respuestas coinciden con el contrato y las reglas esperadas.                                  |
| Pruebas de integración                 | API, PostgreSQL, documentos y fuentes de verificación simuladas / adaptadores en modo manual asistido                                                                                                                                              | Spring Boot Test y Docker                 | Los componentes intercambian información sin perder integridad.                                   |
| Pruebas de autorización                | Acceso según rol, titularidad y permisos                                                                                                                                                                                                           | Casos positivos y negativos               | No hay accesos indebidos en los casos críticos.                                                   |
| Pruebas de seguridad                   | Vulnerabilidades web y de API                                                                                                                                                                                                                      | OWASP ZAP y revisión manual               | No quedan vulnerabilidades críticas o altas sin resolver en la entrega.                           |
| Pruebas de rendimiento                 | Latencia, concurrencia, errores y estabilidad                                                                                                                                                                                                      | Apache JMeter                             | Se cumplen los umbrales acordados antes de la ejecución.                                          |
| Pruebas de usabilidad                  | Facilidad para completar tareas frecuentes                                                                                                                                                                                                         | Sesiones con usuarios de prueba           | Se cumple la meta de éxito de tareas definida en el plan de acción.                               |
| Pruebas de recuperación                | Caídas de fuentes externas de verificación (simuladas)                                                                                                                                                                                             | Fallos inducidos y pruebas de integración | Se registra el error, se conserva el expediente y se permite reintentar sin duplicar operaciones. |
| Pruebas de regresión                   | Que una corrección no rompa funciones existentes                                                                                                                                                                                                   | Suite automatizada                        | Todas las pruebas críticas existentes continúan pasando.                                          |
| Pruebas de aceptación                  | Cumplimiento de historias de usuario                                                                                                                                                                                                               | Escenarios acordados con el Product Owner | Cada historia cumple sus criterios de aceptación.                                                 |
| Pruebas de cumplimiento legal (Ley 81) | Consentimiento informado registrado antes del tratamiento, consentimiento expreso para datos sensibles, ejercicio de derechos ARCO (acceso, rectificación y supresión), minimización de datos en respuestas y logs, conservación y baja de cuentas | Casos manuales y revisión                 | Todos los casos críticos pasan y quedan evidenciados.                                             |

## 4.3. Casos de prueba prioritarios

| ID    | Escenario                                                                 | Resultado esperado                                                                                        |
| ----- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| CP-01 | Un usuario inicia sesión con credenciales válidas.                        | Accede únicamente a las funciones de su rol.                                                              |
| CP-02 | Un usuario intenta iniciar sesión con credenciales inválidas.             | Se rechaza el acceso sin revelar detalles sensibles.                                                      |
| CP-03 | Un solicitante intenta consultar un expediente ajeno.                     | El sistema bloquea el acceso.                                                                             |
| CP-04 | Un funcionario intenta cambiar un estado no permitido.                    | Se rechaza la transición y se conserva el estado original.                                                |
| CP-05 | Se adjunta un documento de tipo o tamaño no permitido.                    | Se rechaza el archivo y se informa el motivo de forma segura.                                             |
| CP-06 | Una fuente de verificación devuelve un resultado válido.                  | Se registra con fuente, fecha y responsable, y se actualiza el estado de la verificación.                 |
| CP-07 | Una fuente de verificación no responde (error técnico).                   | Se registra el error técnico, no se convierte en resultado negativo y se permite un reintento controlado. |
| CP-08 | Se repite una petición de verificación por un reintento.                  | No se crean operaciones duplicadas cuando la operación requiere idempotencia.                             |
| CP-09 | Se consulta el historial de un expediente.                                | Solo usuarios autorizados ven los eventos permitidos.                                                     |
| CP-10 | Se ejecuta una prueba de carga con usuarios concurrentes.                 | Se registran latencia, tasa de error y uso de recursos frente al umbral definido.                         |
| CP-11 | OWASP ZAP detecta una vulnerabilidad.                                     | Se documenta, se evalúa el riesgo, se corrige y se repite el análisis.                                    |
| CP-12 | Se intenta acceder directamente a un archivo protegido.                   | El acceso se deniega si el usuario no tiene autorización.                                                 |
| CP-13 | Un cliente sin consentimiento vigente solicita acceso o uso de sus datos. | El sistema aplica la regla legal correspondiente y lo deja evidenciado.                                   |
| CP-14 | El titular ejerce un derecho ARCO (acceso, rectificación o supresión).    | La solicitud queda registrada, atendida en plazo y trazada.                                               |

## 4.4. Pruebas de rendimiento con JMeter

Antes de medir se deben establecer las condiciones de prueba: configuración del equipo, cantidad de usuarios concurrentes, duración, datos utilizados y operaciones ejecutadas.

Se registrarán como mínimo:

* Tiempo medio y percentiles de respuesta, especialmente P95.

* Solicitudes por segundo.

* Porcentaje de errores HTTP.

* Uso de CPU y memoria.

* Comportamiento durante picos de concurrencia.

* Tiempo de respuesta de las fuentes de verificación (adaptadores en modo manual asistido).

* Comportamiento ante indisponibilidad de una dependencia.

La meta inicial puede ser que el P95 de las operaciones principales no supere dos segundos bajo una carga de referencia acordada, excluyendo esperas externas que deban medirse por separado. Este umbral deberá confirmarse mediante pruebas y ajustarse al entorno de ejecución.

## 4.5. Seguridad con OWASP ZAP

El análisis debe incluir, según la configuración del entorno:

* Detección de vulnerabilidades comunes en aplicaciones web.

* Revisión de cabeceras y configuración de seguridad.

* Pruebas de autorización y control de acceso.

* Validación de entradas y manejo de errores.

* Revisión de sesiones y autenticación.

* Pruebas sobre endpoints REST.

* Verificación de que no se expongan datos personales en respuestas, errores o registros.

Un escaneo automatizado no garantiza que la aplicación sea segura. Debe complementarse con pruebas manuales, revisión de código y validación de los permisos de cada rol.

## 4.6. Evidencias y cierre de incidencias

Cada ejecución debe documentar el identificador del caso, fecha, entorno, datos utilizados, resultado esperado, resultado obtenido y evidencia relevante. Las incidencias se clasificarán por severidad, se asignarán a un responsable y se volverán a probar después de corregirse.

La entrega se aceptará cuando las funciones críticas pasen las pruebas, los controles de acceso funcionen correctamente, los errores conocidos estén documentados y no queden vulnerabilidades críticas o altas sin resolver.

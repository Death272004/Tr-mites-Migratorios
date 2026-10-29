# Documento 3. Plan de desarrollo

## Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá

## 3.1. Objetivo

Definir el orden técnico y los criterios de implementación de los módulos del sistema, incluyendo base de datos, API REST, reglas de negocio, seguridad, verificación documental y pruebas automatizadas.

## 3.2. Alcance funcional del MVP

La primera versión incluirá:

1. Autenticación y autorización por roles.

2. Registro y consulta de expedientes migratorios.

3. Adjuntar y consultar documentos.

4. Gestión controlada de estados del expediente.

5. Gestión de verificaciones documentales: fuentes públicas y documentos obtenidos con autorización, con registro trazable del resultado (modo manual asistido) y adaptadores preparados para futura automatización.

6. Historial de eventos y auditoría.

7. Panel de seguimiento para el cliente del bufete y para el abogado o analista del despacho.

8. Pruebas funcionales, de seguridad y rendimiento.

9. Documentación técnica y manual de usuario.

10. Consentimiento informado y derechos ARCO: alta, consulta y revocación del consentimiento del titular, y recepción y seguimiento de las solicitudes ARCO del cliente del bufete.

No se contempla conectarse directamente a bases de datos gubernamentales ni emitir decisiones migratorias oficiales: sin convenio ni autorización vigente de la institución correspondiente, y sin consentimiento del titular, la plataforma no accede a sistemas gubernamentales, no recibe transferencias automáticas ni sustituye la resolución oficial, que corresponde a la autoridad competente.

## 3.3. Módulos y reglas de implementación

| Módulo                 | Implementación                                                      | Regla de negocio principal                                                                           |
| ---------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Autenticación          | Spring Security y gestión segura de contraseñas y sesiones o tokens | Solo usuarios autenticados pueden acceder a funciones protegidas.                                    |
| Usuarios y roles       | Entidades y servicios de autorización                               | Cada usuario solo ejecuta las operaciones permitidas para su rol y ámbito.                           |
| Consentimientos y ARCO | Entidades y servicios de consentimiento informado y solicitudes ARCO | Sin consentimiento informado vigente no se tratan datos más allá de lo necesario para la relación contractual; los datos sensibles exigen consentimiento expreso registrado. |
| Expedientes            | API REST y persistencia en PostgreSQL                               | Cada expediente tiene identificador, solicitante, tipo de trámite, fechas y estado.                  |
| Documentos             | Metadatos en PostgreSQL y archivos en almacenamiento protegido      | Validar tipo, tamaño, integridad y permisos antes de aceptar o entregar un archivo.                  |
| Flujo de estados       | Servicio de dominio con transiciones permitidas                     | No se puede pasar directamente a un estado final si faltan verificaciones o requisitos obligatorios. |
| Verificación y adaptadores | Interfaces independientes por fuente; modo manual asistido y capa de adaptadores preparada | Solo se registran resultados de verificación con fuente, fecha y responsable; la plataforma no almacena copias de datos institucionales. |
| Auditoría              | Registro de eventos y consultas relevantes                          | Las operaciones críticas dejan evidencia sin almacenar innecesariamente datos sensibles en los logs. |
| Notificaciones         | Servicio desacoplado de notificación                                | Informar al usuario sin exponer información confidencial en el mensaje.                              |
| Monitoreo              | Métricas, logs técnicos y seguimiento de errores                    | Diferenciar fallos técnicos, datos incompletos y resultados de verificación.                         |

## 3.4. Modelo de datos inicial

El modelo conceptual puede contener las siguientes entidades:

* Usuario: identificador, nombre, correo, credenciales protegidas y estado de la cuenta.

* Rol: nombre y permisos asociados.

* Expediente: identificador, solicitante, tipo de trámite, estado, fecha de creación y fecha de actualización.

* Documento: identificador, expediente, tipo, referencia segura al archivo, fecha de carga y estado de revisión.

* Verificación: expediente, fuente externa consultada, tipo de verificación, modo (manual asistido o automático), estado, fechas y referencia de correlación.

* Resultado de verificación: resultado mínimo necesario, referencia de origen, fecha y responsable del cotejo.

* Consentimiento del titular: tipo, finalidad, fecha, alcance y revocación.

* Solicitud ARCO: identificador, titular, derecho solicitado, alcance, fecha de recepción, plazo de respuesta y estado.

* Historial de estados: estado anterior, estado nuevo, usuario responsable, fecha y motivo.

* Evento de auditoría: actor, operación, recurso afectado, fecha, resultado y datos técnicos pertinentes.

* Notificación: destinatario, tipo, fecha y estado de entrega.

Las entidades deben relacionarse mediante claves primarias y foráneas, con restricciones de integridad y validaciones en la capa de negocio. La plataforma no almacena copias de datos de instituciones: cuando sea suficiente, se guarda la referencia de la fuente consultada y el resultado mínimo de verificación, con su fecha y responsable.

## 3.5. Estados del expediente

BORRADOR

PRESENTADO

EN REVISIÓN

PENDIENTE DE DOCUMENTOS

Requiere completar o corregir requisitos.

EN VERIFICACIÓN

Se esperan o se ejecutan verificaciones documentales (fuentes públicas u obtenidas con autorización).

LISTO PARA DECISIÓN

APROBADO

DENEGADO

El diagrama es ilustrativo; el orden exacto debe ajustarse al procedimiento migratorio seleccionado. Los estados complementarios pueden incluir `OBSERVADO`, `CANCELADO`, `CERRADO` y `ARCHIVADO` si las reglas del trámite lo justifican.

Las verificaciones tendrán estados propios, independientes del expediente:

* `PENDIENTE`

* `ENVIADA`

* `RESPONDIDA`

* `SIN_RESULTADO`

* `ERROR_TECNICO`

* `REINTENTO_PROGRAMADO`

En modo manual asistido, el paso a `RESPONDIDA` registra obligatoriamente la persona que verificó, la fuente consultada y la fecha del cotejo; en modo automático, cuando exista convenio o autorización, lo registra el adaptador responsable.

Un error de conexión no puede convertirse automáticamente en una verificación negativa ni provocar la aprobación o denegación del expediente.

## 3.6. Diseño inicial de API REST

| Método | Endpoint propuesto                            | Función                          | Control principal                                   |
| ------ | --------------------------------------------- | -------------------------------- | --------------------------------------------------- |
| POST   | `/api/auth/login`                             | Iniciar sesión                   | Validación de credenciales y limitación de intentos |
| GET    | `/api/expedientes`                            | Consultar expedientes accesibles | Filtrado según rol y titularidad                    |
| POST   | `/api/expedientes`                            | Crear expediente                 | Campos obligatorios y permiso de creación           |
| GET    | `/api/expedientes/{id}`                       | Consultar detalle                | Comprobar acceso al expediente                      |
| PATCH  | `/api/expedientes/{id}/estado`                | Solicitar cambio de estado       | Rol autorizado y transición válida                  |
| GET    | `/api/expedientes/{id}/documentos`            | Consultar documentos             | Permisos del expediente                             |
| POST   | `/api/expedientes/{id}/documentos`            | Adjuntar documento               | Tipo, tamaño, contenido y autorización              |
| POST   | `/api/expedientes/{id}/verificaciones`        | Registrar verificación           | Finalidad, consentimiento y permiso de verificación |
| GET    | `/api/expedientes/{id}/verificaciones`        | Consultar verificaciones         | Acceso restringido y minimización de datos          |
| GET    | `/api/expedientes/{id}/historial`             | Consultar historial              | Permiso específico de lectura                       |
| POST   | `/api/clientes/{id}/consentimientos`          | Registrar consentimiento informado | Consentimiento vigente, finalidad declarada y consentimiento expreso para datos sensibles |
| PATCH  | `/api/clientes/{id}/consentimientos/{cid}`    | Revocar consentimiento           | Titular o rol autorizado y efecto sobre tratamientos posteriores |
| GET    | `/api/clientes/{id}/consentimientos`          | Consultar consentimientos        | Titularidad del cliente o rol autorizado            |
| POST   | `/api/solicitudes-arco`                       | Registrar solicitud ARCO         | Identidad del solicitante, alcance y plazo de respuesta |
| GET    | `/api/solicitudes-arco/{id}`                  | Consultar solicitud ARCO         | Acceso restringido al titular y al personal autorizado |

Estos endpoints son una propuesta inicial; sus nombres, métodos y contratos deben documentarse mediante OpenAPI y validarse con los requisitos funcionales.

Las respuestas HTTP deberán ser coherentes: `400` para solicitudes inválidas, `401` para falta de autenticación, `403` para permisos insuficientes, `404` para recursos inexistentes o que no deban revelarse, `409` para conflictos de estado y códigos `5xx` para fallos internos o de dependencias, según el caso.

## 3.7. Reglas de negocio esenciales

1. Cada expediente tiene un identificador único y un solicitante asociado.

2. El solicitante solo puede consultar sus propios expedientes.

3. Un funcionario solo puede realizar las operaciones permitidas por sus atribuciones.

4. Un administrador técnico no obtiene automáticamente permisos para consultar o decidir expedientes.

5. Una transición de estado debe validarse en el backend, no solo en la interfaz.

6. Las verificaciones guardan su fuente, modo, fecha, resultado, referencia técnica y responsable del cotejo.

7. Las operaciones de verificación y de los adaptadores deben soportar errores, tiempos de espera y reintentos controlados.

8. Las operaciones críticas deben generar registros de auditoría.

9. Los documentos no deben ser accesibles mediante enlaces públicos sin protección.

10. Los errores de verificación técnica deben ser distintos de los resultados sustantivos del trámite.

11. Sin consentimiento informado vigente no se tratan datos del cliente más allá de lo necesario para la relación contractual.

12. Los datos sensibles (salud y antecedentes) requieren consentimiento expreso registrado.

13. La plataforma no almacena copias de datos de instituciones: solo resultados de verificación con fuente, fecha y responsable.

## 3.8. Entornos de desarrollo

* Desarrollo: trabajo cotidiano con datos ficticios.

* Pruebas: ejecución de pruebas automatizadas y manuales en un entorno aislado.

* Demostración: versión estable para presentar el producto.

* Producción: fuera del alcance del MVP, salvo que se aprueben los requisitos institucionales, legales, operativos y de seguridad correspondientes.

Docker se utilizará para reproducir los servicios del producto. Las variables de configuración y secretos se gestionarán fuera del código fuente.

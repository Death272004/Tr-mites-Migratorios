# Documento 3. Plan de desarrollo

## Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá

## 3.1. Objetivo

Definir el orden técnico y los criterios de implementación de los módulos del sistema, incluyendo base de datos, API REST, reglas de negocio, seguridad, interoperabilidad y pruebas automatizadas.

## 3.2. Alcance funcional del prototipo

La primera versión incluirá:

1. Autenticación y autorización por roles.

2. Registro y consulta de expedientes migratorios.

3. Adjuntar y consultar documentos.

4. Gestión controlada de estados del expediente.

5. Solicitudes de validación a instituciones simuladas.

6. Historial de eventos y auditoría.

7. Panel de seguimiento para el solicitante y el funcionario.

8. Pruebas funcionales, de seguridad y rendimiento.

9. Documentación técnica y manual de usuario.

No se contempla, sin autorización y acuerdos institucionales, conectarse directamente a bases de datos gubernamentales ni emitir decisiones migratorias oficiales.

## 3.3. Módulos y reglas de implementación

| Módulo            | Implementación                                                      | Regla de negocio principal                                                                           |
| ----------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Autenticación     | Spring Security y gestión segura de contraseñas y sesiones o tokens | Solo usuarios autenticados pueden acceder a funciones protegidas.                                    |
| Usuarios y roles  | Entidades y servicios de autorización                               | Cada usuario solo ejecuta las operaciones permitidas para su rol y ámbito.                           |
| Expedientes       | API REST y persistencia en PostgreSQL                               | Cada expediente tiene identificador, solicitante, tipo de trámite, fechas y estado.                  |
| Documentos        | Metadatos en PostgreSQL y archivos en almacenamiento protegido      | Validar tipo, tamaño, integridad y permisos antes de aceptar o entregar un archivo.                  |
| Flujo de estados  | Servicio de dominio con transiciones permitidas                     | No se puede pasar directamente a un estado final si faltan validaciones o requisitos obligatorios.   |
| Interoperabilidad | Interfaces independientes por institución                           | Solo se consultan campos autorizados y necesarios para la finalidad declarada.                       |
| Auditoría         | Registro de eventos y consultas relevantes                          | Las operaciones críticas dejan evidencia sin almacenar innecesariamente datos sensibles en los logs. |
| Notificaciones    | Servicio desacoplado de notificación                                | Informar al usuario sin exponer información confidencial en el mensaje.                              |
| Monitoreo         | Métricas, logs técnicos y seguimiento de errores                    | Diferenciar fallos técnicos, datos incompletos y resultados de validación.                           |

## 3.4. Modelo de datos inicial

El modelo conceptual puede contener las siguientes entidades:

* Usuario: identificador, nombre, correo, credenciales protegidas y estado de la cuenta.

* Rol: nombre y permisos asociados.

* Expediente: identificador, solicitante, tipo de trámite, estado, fecha de creación y fecha de actualización.

* Documento: identificador, expediente, tipo, referencia segura al archivo, fecha de carga y estado de revisión.

* Validación: expediente, institución consultada, tipo de consulta, estado, fechas y referencia de correlación.

* Resultado de validación: resultado mínimo necesario, referencia de origen y fecha de respuesta.

* Historial de estados: estado anterior, estado nuevo, usuario responsable, fecha y motivo.

* Evento de auditoría: actor, operación, recurso afectado, fecha, resultado y datos técnicos pertinentes.

* Notificación: destinatario, tipo, fecha y estado de entrega.

Las entidades deben relacionarse mediante claves primarias y foráneas, con restricciones de integridad y validaciones en la capa de negocio. No se deben copiar indiscriminadamente datos personales de otras instituciones: cuando sea suficiente, se guardará la referencia de consulta y el resultado mínimo permitido.

## 3.5. Estados del expediente

BORRADOR

PRESENTADO

EN REVISIÓN

PENDIENTE DE DOCUMENTOS

Requiere completar o corregir requisitos.

EN VALIDACIÓN

Se esperan verificaciones institucionales.

LISTO PARA DECISIÓN

APROBADO

DENEGADO

El diagrama es ilustrativo; el orden exacto debe ajustarse al procedimiento migratorio seleccionado. Los estados complementarios pueden incluir `OBSERVADO`, `CANCELADO`, `CERRADO` y `ARCHIVADO` si las reglas del trámite lo justifican.

Las validaciones institucionales tendrán estados propios, independientes del expediente:

* `PENDIENTE`

* `ENVIADA`

* `RESPONDIDA`

* `SIN_RESULTADO`

* `ERROR_TECNICO`

* `REINTENTO_PROGRAMADO`

Un error de conexión no puede convertirse automáticamente en una verificación negativa ni provocar la aprobación o denegación del expediente.

## 3.6. Diseño inicial de API REST

| Método | Endpoint propuesto                   | Función                          | Control principal                                   |
| ------ | ------------------------------------ | -------------------------------- | --------------------------------------------------- |
| POST   | `/api/auth/login`                    | Iniciar sesión                   | Validación de credenciales y limitación de intentos |
| GET    | `/api/expedientes`                   | Consultar expedientes accesibles | Filtrado según rol y titularidad                    |
| POST   | `/api/expedientes`                   | Crear expediente                 | Campos obligatorios y permiso de creación           |
| GET    | `/api/expedientes/{id}`              | Consultar detalle                | Comprobar acceso al expediente                      |
| PATCH  | `/api/expedientes/{id}/estado`       | Solicitar cambio de estado       | Rol autorizado y transición válida                  |
| GET    | `/api/expedientes/{id}/documentos`   | Consultar documentos             | Permisos del expediente                             |
| POST   | `/api/expedientes/{id}/documentos`   | Adjuntar documento               | Tipo, tamaño, contenido y autorización              |
| POST   | `/api/expedientes/{id}/validaciones` | Solicitar validación             | Finalidad y permiso de consulta                     |
| GET    | `/api/expedientes/{id}/validaciones` | Consultar verificaciones         | Acceso restringido y minimización de datos          |
| GET    | `/api/expedientes/{id}/historial`    | Consultar historial              | Permiso específico de lectura                       |

Estos endpoints son una propuesta inicial; sus nombres, métodos y contratos deben documentarse mediante OpenAPI y validarse con los requisitos funcionales.

Las respuestas HTTP deberán ser coherentes: `400` para solicitudes inválidas, `401` para falta de autenticación, `403` para permisos insuficientes, `404` para recursos inexistentes o que no deban revelarse, `409` para conflictos de estado y códigos `5xx` para fallos internos o de dependencias, según el caso.

## 3.7. Reglas de negocio esenciales

1. Cada expediente tiene un identificador único y un solicitante asociado.

2. El solicitante solo puede consultar sus propios expedientes.

3. Un funcionario solo puede realizar las operaciones permitidas por sus atribuciones.

4. Un administrador técnico no obtiene automáticamente permisos para consultar o decidir expedientes.

5. Una transición de estado debe validarse en el backend, no solo en la interfaz.

6. Las consultas institucionales deben guardar su finalidad, fecha, resultado y referencia técnica.

7. Las operaciones de integración deben soportar errores, tiempos de espera y reintentos controlados.

8. Las operaciones críticas deben generar registros de auditoría.

9. Los documentos no deben ser accesibles mediante enlaces públicos sin protección.

10. Los errores de validación técnica deben ser distintos de los resultados sustantivos del trámite.

## 3.8. Entornos de desarrollo

* Desarrollo: trabajo cotidiano con datos ficticios.

* Pruebas: ejecución de pruebas automatizadas y manuales en un entorno aislado.

* Demostración: versión estable para presentar el proyecto.

* Producción: fuera del alcance del prototipo, salvo que se aprueben los requisitos institucionales, legales, operativos y de seguridad correspondientes.

Docker se utilizará para reproducir los servicios del prototipo. Las variables de configuración y secretos se gestionarán fuera del código fuente.

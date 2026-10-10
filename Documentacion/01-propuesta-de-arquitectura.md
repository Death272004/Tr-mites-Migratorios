# Documento 1. Propuesta de arquitectura

## Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá

La propuesta parte del problema identificado: los trámites migratorios pueden tardar entre 3 y 8 meses, según el caso planteado, debido a la entrega repetida de documentos y a las validaciones manuales. La solución busca reducir tareas redundantes mediante intercambios de información autorizados entre el Servicio Nacional de Migración (SNM), el Tribunal Electoral (TE), la Caja de Seguro Social (CSS) y el Registro Público de Panamá, con la posible participación de la Autoridad Nacional para la Innovación Gubernamental (AIG) en la coordinación tecnológica.

Alcance importante: la integración real con los sistemas institucionales dependerá de los permisos, convenios, interfaces disponibles y validaciones jurídicas correspondientes. Por ello, el prototipo académico debe poder funcionar con datos ficticios y servicios simulados, sin asumir acceso directo a bases de datos gubernamentales.

## 1.1. Objetivo

Diseñar una plataforma web interoperable que centralice el seguimiento de los expedientes migratorios y permita consultar información pertinente de otras instituciones mediante interfaces seguras, reduciendo la duplicación documental y las validaciones manuales sin comprometer la confidencialidad, integridad y disponibilidad de los datos personales.

## 1.2. Instituciones y responsabilidades

| Institución                          | Función prevista en la solución                                                                                             |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Servicio Nacional de Migración (SNM) | Gestionar expedientes, revisar requisitos y registrar decisiones migratorias.                                               |
| Tribunal Electoral (TE)              | Proporcionar las verificaciones de identidad o datos del Registro Civil que estén autorizadas y disponibles.                |
| Caja de Seguro Social (CSS)          | Facilitar las verificaciones de afiliación o condición de asegurado cuando sean pertinentes al trámite y exista base legal. |
| Registro Público de Panamá           | Proporcionar información registral autorizada que resulte necesaria para el trámite.                                        |
| AIG                                  | Posible coordinación o apoyo tecnológico de interoperabilidad, según sus competencias y los acuerdos vigentes.              |

Estas responsabilidades describen el modelo propuesto. Antes de desarrollar integraciones reales, se debe confirmar qué institución participa en cada tipo de trámite, qué datos puede entregar y qué mecanismos de intercambio están disponibles.

## 1.3. Arquitectura lógica

1. Interfaz web

Solicitantes · Funcionarios · Supervisores · Administración técnica · Auditoría autorizada

HTTPS

2. Backend Java / API REST

Autenticación · Autorización · Expedientes · Documentos · Estados · Validaciones · Auditoría

Capa de integración controlada

Adaptador TE

Consultas autorizadas

Adaptador CSS

Consultas autorizadas

Adaptador Registro Público

Consultas registrales

SNM

Gestión del expediente

3. Persistencia y observabilidad

Base operativa · Repositorio documental protegido · Registros de auditoría · Métricas técnicas

El diagrama representa una arquitectura lógica, no una infraestructura gubernamental existente confirmada. Los adaptadores desacoplan la aplicación de cada institución y permiten reemplazar una simulación por una integración autorizada sin rehacer todo el sistema.

## 1.4. Componentes tecnológicos

| Componente               | Tecnología propuesta                                        | Responsabilidad                                                              |
| ------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Frontend                 | HTML, CSS y JavaScript                                      | Formularios, paneles y seguimiento del expediente.                           |
| Backend                  | Java con Spring Boot                                        | Reglas de negocio, seguridad, expedientes y API REST.                        |
| Base de datos operativa  | PostgreSQL                                                  | Usuarios de la plataforma, expedientes, estados y referencias de validación. |
| Persistencia documental  | Almacenamiento protegido                                    | Archivos necesarios para el trámite, con controles de acceso.                |
| Auditoría                | Registros protegidos y consultables por personal autorizado | Registrar accesos y operaciones relevantes.                                  |
| Contenedores             | Docker                                                      | Reproducir entornos de desarrollo y pruebas.                                 |
| Pruebas de rendimiento   | Apache JMeter                                               | Medir concurrencia, latencia y errores.                                      |
| Pruebas de seguridad web | OWASP ZAP                                                   | Detectar vulnerabilidades comunes en la aplicación y sus API.                |
| Control de versiones     | Git                                                         | Historial, revisión y trazabilidad del código.                               |

## 1.5. Bases de datos y almacenamiento

Para el modelo conceptual se consideran siete almacenes lógicos:

1. Base de datos operativa de la plataforma: usuarios locales, expedientes, estados, asignaciones y referencias a validaciones.

2. Fuente institucional del SNM: sistema de expedientes migratorios oficial.

3. Fuente institucional del TE: datos de identidad o registro civil autorizados.

4. Fuente institucional de la CSS: información de afiliación autorizada.

5. Fuente institucional del Registro Público: información registral autorizada.

6. Almacén de auditoría: registros protegidos de accesos, consultas, modificaciones y errores.

7. Almacén documental: archivos aportados por los solicitantes y otros documentos necesarios.

Las seis últimas fuentes institucionales o especializadas no tienen que ser bases de datos creadas por el proyecto. Las fuentes gubernamentales deben permanecer bajo el control de sus respectivas entidades. En el prototipo se pueden simular las respuestas de las instituciones con datos ficticios. El diseño físico final determinará si la auditoría y los documentos requieren bases separadas o servicios de almacenamiento específicos.

## 1.6. Seguridad y protección de datos

El sistema deberá diseñarse considerando la Ley 81 de 2019 sobre Protección de Datos Personales de Panamá y su reglamentación aplicable, incluido el Decreto Ejecutivo 285 de 2021. La aplicación concreta debe validarse jurídicamente según la finalidad, el tipo de dato y las competencias institucionales.

Controles mínimos propuestos:

* Autenticación segura y autorización por roles.

* Acceso limitado al expediente y a los datos estrictamente necesarios para cada función.

* Cifrado de las comunicaciones y protección del almacenamiento.

* Registro de consultas, accesos, cambios de estado y operaciones administrativas.

* Gestión segura de sesiones, contraseñas y secretos de configuración.

* Validación de archivos, entradas y solicitudes API.

* Políticas de conservación, eliminación y atención de derechos de los titulares, según la normativa aplicable.

* Manejo de errores sin exponer información personal.

* Separación entre errores técnicos de integración y resultados negativos de una verificación.

* Prohibición de usar datos reales en pruebas sin autorización y medidas de protección adecuadas.

## 1.7. Flujo general de interoperabilidad

1. El solicitante presenta la solicitud y adjunta los documentos exigidos.

2. El sistema registra el expediente y verifica los campos obligatorios.

3. El backend determina qué verificaciones son necesarias para el trámite seleccionado.

4. La capa de integración envía únicamente las consultas autorizadas.

5. Cada institución responde por su interfaz oficial o, durante el prototipo, mediante un servicio simulado.

6. El sistema registra el resultado, la fecha, el estado técnico y la referencia de la consulta.

7. Si existe una inconsistencia, un dato pendiente o un error de conexión, se genera una tarea de revisión o reintento.

8. El funcionario autorizado evalúa el expediente y toma las decisiones que le correspondan.

9. El solicitante consulta el estado y recibe las notificaciones previstas.

La automatización debe reducir trabajo repetitivo, no reemplazar automáticamente las decisiones administrativas que correspondan a un funcionario competente.

# Documento 1. Propuesta de arquitectura

## Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá

Este documento describe la propuesta de arquitectura de una **plataforma de gestión de expedientes migratorios para bufetes de abogados**, construida bajo la Ley 81 de 2019 de Panamá y su reglamentación (Decreto Ejecutivo 285 de 2021). El despacho de abogados es quien adquiere el software, controla su expediente y es responsable del tratamiento de los datos personales de sus clientes. La plataforma elimina la duplicación documental y el retrabajo del bufete sin depender de integraciones con instituciones gubernamentales: opera con los documentos que el cliente aporta o que el despacho obtiene por canales oficiales, más el resultado mínimo de cada verificación. La capa de adaptadores queda preparada de modo que, si en el futuro existe un convenio (p. ej. vía AIG / Plataforma de Interoperabilidad Estatal), pueda activarse el modo automático sin rehacer el sistema.

El plazo oficial de referencia para la resolución de los trámites migratorios oscila entre 3 y 8 meses, según el caso planteado. Ese plazo es una referencia externa del procedimiento administrativo, no una meta ni una promesa del producto: lo que el producto reduce es el tiempo de preparación del expediente, los rechazos por documentos faltantes o vencidos y el retrabajo interno del despacho, causado hoy por la entrega repetida de documentos y por las validaciones manuales.

Alcance importante: la plataforma nunca recibe transferencias automáticas de datos de instituciones gubernamentales. Las instituciones (SNM, TE, CSS y Registro Público) se usan hoy como fuentes externas de verificación en modo manual asistido: el despacho realiza la verificación o obtiene el documento por canales oficiales con consentimiento o autorización del titular, y la plataforma guarda únicamente el resultado de la verificación con trazabilidad. Una eventual conexión automática depende de permisos, convenios, interfaces disponibles y validaciones jurídicas correspondientes.

## 1.1. Objetivo

Diseñar una plataforma web para bufetes de abogados que centralice el seguimiento de los expedientes migratorios del despacho, detecte faltantes y vencimientos documentales y registre el resultado mínimo de cada verificación con trazabilidad, reduciendo la duplicación documental y el retrabajo del bufete sin comprometer la confidencialidad, integridad y disponibilidad de los datos personales tratados conforme a la Ley 81 de 2019.

## 1.2. Fuentes externas de verificación y responsabilidades

| Fuente externa de verificación      | Función en la solución                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Servicio Nacional de Migración (SNM) | Fuente de los trámites y decisiones oficiales: el despacho sigue sus procedimientos y registra en el expediente los documentos y resultados que obtiene por canales oficiales. |
| Tribunal Electoral (TE)              | Fuente pública de identidad: cédula y certificados del Registro Civil que el despacho obtiene y registra en el expediente. |
| Caja de Seguro Social (CSS)          | Documentos de afiliación que el cliente aporta o que el despacho obtiene con autorización expresa del titular.        |
| Registro Público de Panamá           | Consultas públicas registrales que el despacho realiza y cuyo resultado se registra en el expediente.                 |
| AIG                                  | Posible vía futura de interoperabilidad estatal si se formaliza un convenio; hoy no existe conexión automática.       |

Qué se verifica hoy, en modo manual asistido: identidad y datos del Registro Civil a partir de la cédula y los certificados del TE; búsquedas públicas del Registro Público; documentos de afiliación de la CSS que el cliente aporta o que el despacho obtiene con autorización; y el estado del trámite según los procedimientos y decisiones publicados o comunicados oficialmente por el SNM. En todos los casos, el despacho realiza la verificación y la plataforma guarda solo el resultado (fuente, fecha, resultado y responsable).

Qué no se hace y por qué: la plataforma no establece conexiones automáticas con sistemas institucionales ni recibe transferencias de datos de las instituciones. La conexión automática exige permisos, convenios, interfaces disponibles y validación jurídica que hoy no existen; mientras eso ocurre, el diseño mantiene la capa de adaptadores preparada para activar el modo automático sin rehacer el sistema si en el futuro se formaliza un convenio.

## 1.3. Arquitectura lógica

1. Interfaz web

Clientes (titulares del trámite, directamente o representados por su abogado) · Abogados y personal del despacho · Administración técnica · Auditoría autorizada

HTTPS

2. Backend Java / API REST

Autenticación · Autorización · Expedientes · Documentos · Estados · Validaciones · Auditoría

Capa de verificación y adaptadores

Adaptador/fuente TE (verificación pública o manual)

Verificación pública o manual asistida

Adaptador/fuente CSS

Documentos obtenidos con autorización del titular

Adaptador/fuente Registro Público

Consultas públicas registrales

Gestión del expediente del bufete

Expediente, documentos, estados y decisiones del despacho

3. Persistencia y observabilidad

Base operativa · Repositorio documental protegido del despacho · Registros de auditoría · Métricas técnicas

El diagrama representa una arquitectura lógica. Los adaptadores desacoplan la aplicación de cada fuente externa y operan hoy en modo manual asistido, con el despacho como responsable de la verificación; quedan preparados para el modo automático si en el futuro existe un convenio de interoperabilidad, de forma que una simulación o una verificación manual pueda dar paso a una integración autorizada sin rehacer todo el sistema.

## 1.4. Componentes tecnológicos

| Componente               | Tecnología propuesta                                        | Responsabilidad                                                              |
| ------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Frontend                 | HTML, CSS y JavaScript                                      | Formularios, paneles y seguimiento del expediente del despacho.              |
| Backend                  | Java con Spring Boot                                        | Reglas de negocio, seguridad, expedientes y API REST.                        |
| Base de datos operativa  | PostgreSQL                                                  | Usuarios de la plataforma, expedientes, estados y resultados de verificación. |
| Persistencia documental  | Almacenamiento protegido                                    | Archivos del expediente, con controles de acceso.                            |
| Auditoría                | Registros protegidos y consultables por personal autorizado | Registrar accesos, verificaciones y operaciones relevantes.                  |
| Contenedores             | Docker                                                      | Reproducir entornos de desarrollo y pruebas.                                 |
| Pruebas de rendimiento   | Apache JMeter                                               | Medir concurrencia, latencia y errores.                                      |
| Pruebas de seguridad web | OWASP ZAP                                                   | Detectar vulnerabilidades comunes en la aplicación y sus API.                |
| Control de versiones     | Git                                                         | Historial, revisión y trazabilidad del código.                               |

## 1.5. Bases de datos y almacenamiento

Para el modelo conceptual se consideran siete almacenes lógicos:

1. Base de datos operativa de la plataforma: usuarios locales, expedientes, estados, asignaciones y resultados de verificación.

2. Fuente externa de verificación SNM: procedimientos y decisiones oficiales de los que el despacho obtiene los documentos que registra en el expediente.

3. Fuente externa de verificación TE: cédula y certificados del Registro Civil obtenidos públicamente por el despacho.

4. Fuente externa de verificación CSS: documentos de afiliación aportados u obtenidos con autorización expresa del titular.

5. Fuente externa de verificación Registro Público: consultas públicas registrales realizadas por el despacho.

6. Almacén de auditoría: registros protegidos de accesos, consultas, verificaciones, modificaciones y errores (bitácora).

7. Almacén documental del despacho: archivos aportados por el cliente u otros documentos que el despacho obtiene por canales oficiales con consentimiento o autorización del titular.

Las cinco fuentes externas de verificación no son bases de datos creadas por el proyecto y permanecen bajo el control de sus respectivas entidades: la plataforma no almacena datos institucionales, sino únicamente el resultado mínimo de la verificación realizada (fuente, fecha, resultado y responsable), junto con los documentos aportados u obtenidos legalmente. En los entornos de desarrollo y pruebas se pueden simular las respuestas de las fuentes con datos ficticios. El diseño físico final determinará si la auditoría y los documentos requieren bases separadas o servicios de almacenamiento específicos.

## 1.6. Seguridad y protección de datos

El sistema deberá diseñarse considerando la Ley 81 de 2019 sobre Protección de Datos Personales de Panamá y su reglamentación aplicable, incluido el Decreto Ejecutivo 285 de 2021. El responsable del tratamiento de los datos personales es el bufete de abogados que adquiere el software; el proveedor del software actúa como apoyo tecnológico y, junto con el proveedor de alojamiento de datos, debe mantener un acuerdo de tratamiento que defina finalidades, medidas de seguridad, confidencialidad y atención de derechos. La aplicación concreta debe validarse jurídicamente en el ámbito local, según la finalidad, el tipo de dato y las competencias de cada parte.

Base jurídica: consentimiento informado del titular otorgado junto con el contrato de servicios del despacho, que informa finalidad, destinatarios, plazos y medios para ejercer los derechos. Para datos sensibles —como los de salud o la ficha de la CSS y los antecedentes penales— se requiere consentimiento expreso, específico e informado, y su tratamiento queda limitado a lo estrictamente necesario para el trámite. Los derechos ARCO (acceso, rectificación, cancelación y oposición) se canalizan desde el portal del cliente del bufete hacia el despacho responsable, que atiende las solicitudes en los plazos legales.

Controles mínimos propuestos:

* Autenticación segura y autorización por roles.

* Acceso limitado al expediente y a los datos estrictamente necesarios para cada función (minimización y finalidad).

* Cifrado de las comunicaciones y protección del almacenamiento.

* Registro de consultas, accesos, cambios de estado, verificaciones y operaciones administrativas (bitácora).

* Gestión segura de sesiones, contraseñas y secretos de configuración.

* Validación de archivos, entradas y solicitudes API.

* Políticas de conservación y eliminación por plazo legal, y atención de los derechos de los titulares a través del canal previsto en el portal del cliente.

* Manejo de errores sin exponer información personal.

* Separación entre errores técnicos de verificación y resultados negativos de una verificación.

* Prohibición de usar datos reales en pruebas sin autorización y medidas de protección adecuadas.

* Acuerdo de tratamiento con el proveedor de la plataforma y con el proveedor de alojamiento de datos.

* Verificación jurídica local previa a cualquier tratamiento nuevo o eventual activación automática de un adaptador.

## 1.7. Flujo de verificación documental

1. El cliente del bufete (titular del trámite, directamente o representado por su abogado) presenta la solicitud y adjunta los documentos exigidos, por el portal del bufete o de manera asistida por el despacho.

2. El sistema registra el expediente, verifica los campos obligatorios y detecta documentos faltantes y vencimientos.

3. El backend determina qué verificaciones son necesarias para el trámite seleccionado y qué fuente externa corresponde consultar.

4. El despacho realiza la verificación contra fuentes públicas (cédula y certificados del TE, búsquedas públicas del Registro Público) o obtiene los documentos por canales oficiales con consentimiento o autorización del titular.

5. La plataforma registra el resultado mínimo de la verificación con trazabilidad: fuente, fecha, resultado y responsable, junto con el documento correspondiente.

6. Si existe una inconsistencia, un dato o documento pendiente o un error técnico, se genera una tarea de revisión o reintento; el error técnico no constituye un resultado negativo de la verificación.

7. El abogado revisa el expediente y toma la decisión profesional que le corresponda; el sistema no sustituye ese juicio.

8. El cliente consulta el estado desde el portal del bufete y recibe las notificaciones previstas.

La automatización debe reducir el trabajo repetitivo del despacho, no reemplazar las decisiones del abogado ni las decisiones administrativas que correspondan a un funcionario competente.

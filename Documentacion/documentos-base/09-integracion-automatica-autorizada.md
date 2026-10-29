# Sustitución futura por integración automática autorizada

## Propósito

La aplicación utiliza actualmente adaptadores y fuentes simuladas para demostrar el flujo de verificación documental. Esta decisión corresponde al alcance académico del proyecto: no se solicitan ni se consumen APIs reales del Tribunal Electoral, la CSS o el Registro Público.

En una futura puesta en producción, las fuentes simuladas se sustituirán únicamente mediante convenios y autorizaciones formales con cada institución.

## Condiciones previas

La integración automática solo podrá habilitarse cuando exista:

1. Convenio escrito con la institución correspondiente.
2. Autorización legal para consultar los datos y una finalidad definida.
3. Especificación técnica oficial del servicio, versión del contrato y ambiente de pruebas.
4. Credenciales institucionales administradas como secretos, nunca dentro del código.
5. Acuerdo sobre disponibilidad, tiempos de respuesta, límites de consulta y soporte.
6. Revisión de seguridad, protección de datos y trazabilidad antes de producción.

## Estrategia técnica

La sustitución se realizará detrás de los puertos existentes del backend. El orquestador continuará trabajando con el DTO normalizado de verificación, sin modificar el flujo de las pantallas ni el modelo interno.

El adaptador autorizado deberá traducir la respuesta institucional a los campos comunes:

- fuente;
- tipo de verificación;
- resultado mínimo;
- referencia de correlación;
- fecha de consulta y respuesta;
- responsable técnico;
- estado técnico;
- código de error, cuando corresponda.

El adaptador simulado permanecerá disponible para desarrollo, pruebas y demostraciones. La selección entre simulación e integración autorizada se hará mediante configuración por ambiente, sin cambiar el código del dominio.

## Seguridad y privacidad

- Se enviarán únicamente los datos mínimos permitidos por la finalidad.
- Se validarán rol, permiso, consentimiento y fuente antes de consultar.
- Las credenciales se almacenarán en el gestor de secretos del ambiente.
- Se aplicarán TLS, control de certificados, límites de tiempo, reintentos limitados y protección contra duplicados.
- Los logs conservarán usuario, fuente, fecha, correlación y estado, pero no documentos ni datos personales innecesarios.
- Se registrarán las consultas exitosas, rechazadas y fallidas para auditoría.

## Plan de sustitución

1. Obtener convenio, documentación y acceso al ambiente de pruebas.
2. Implementar el adaptador de la institución respetando el puerto y DTO común.
3. Crear pruebas de contrato para respuestas correctas, vacías, inválidas, timeout y límite de solicitudes.
4. Comparar resultados del adaptador autorizado con los escenarios simulados.
5. Ejecutar pruebas de seguridad, autorización, minimización, trazabilidad y rendimiento.
6. Realizar una prueba piloto con datos ficticios o autorizados.
7. Obtener aprobación técnica y legal para producción.
8. Habilitar la fuente mediante configuración y conservar un mecanismo de reversión al adaptador simulado.

## Criterios de aceptación

- El dominio y las pantallas funcionan igual con el adaptador simulado o autorizado.
- La respuesta institucional se normaliza al DTO común.
- Los errores técnicos no se convierten en resultados negativos.
- Los reintentos son limitados, idempotentes y auditables.
- No se almacenan datos fuera de la finalidad autorizada.
- Las credenciales no aparecen en el repositorio ni en los logs.
- Existen pruebas automatizadas y evidencia de aprobación antes del cambio a producción.

## Estado actual

Para este proyecto universitario se mantiene el modo simulado y manual asistido. La integración automática queda documentada como una evolución condicionada a convenios autorizados, sin afirmar que exista una conexión real con las instituciones.

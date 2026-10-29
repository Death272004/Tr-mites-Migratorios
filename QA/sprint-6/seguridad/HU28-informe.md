# HU-28 — Validación de seguridad del Sprint 6

Fecha: 2026-10-29. Responsable de esta revisión: Vento, por solicitud del propietario.
Rama: `integration/sprint-6-devops`. `main` no se modifica.

## Alcance y método

Entorno Docker Compose aislado, PostgreSQL limpio, backend y nginx construidos desde la rama; exclusivamente cuentas y datos ficticios. No se escanea TeamTrack ni Vercel.

Se escanean operaciones GET sin identificadores dinámicos, autorizadas para SOLICITANTE (7), FUNCIONARIO (8), SUPERVISOR (5), AUDITOR (9) y ADMIN (3). ZAP ejecuta escaneo activo y pasivo de la API; el frontend recibe spider y análisis pasivo. El hook `auth-hook.py` exige un GET de perfil 200 con el rol correcto desde el historial del propio ZAP antes y después de cada análisis. Los tokens se mantienen en memoria y variables de proceso; las evidencias de autenticación no contienen tokens.

Exclusiones automáticas: registro, cierre de sesión, cambios y recuperación de contraseña, métodos de escritura y rutas con identificadores dinámicos. Estas exclusiones evitan modificaciones automáticas indiscriminadas; no se presentan como cobertura de ZAP. Se complementan con pruebas de integración y comprobaciones explícitas de IDOR/BOLA, autorización, validación de entradas y sesiones. No se afirma que cada endpoint y cada método haya recibido un escaneo activo.

## Correcciones verificadas

| ID | Hallazgo | Severidad | Responsable | Estado / fecha | Evidencia |
|---|---|---|---|---|---|
| HU28-01 | Integración descartaba el token real del login interno y generaba una sesión demo | Media | Vento | Corregido 2026-10-29 | `494ff8d`; prueba de sesión Node y Firefox: login real, perfil 200 y recarga |
| HU28-02 | Correo simulado registraba destinatario y token de recuperación | Alta: exposición de credencial de recuperación en logs | Vento | Corregido 2026-10-29 | `fc4eb28`; dos pruebas de regresión de privacidad |
| Z-01 | CSP no definida | Media | Edgar Rosario | Corregido 2026-10-28 | nginx, reportes ZAP antes/después originales |
| Z-02 | Falta protección anti-clickjacking | Media | Edgar Rosario | Corregido 2026-10-28 | nginx, reportes ZAP antes/después originales |
| Z-03 | Falta X-Content-Type-Options | Baja | Edgar Rosario | Corregido 2026-10-28 | nginx |
| Z-04 | Versión de nginx en cabecera Server | Baja | Edgar Rosario | Corregido 2026-10-28 | server_tokens off |
| Z-05 | Falta Permissions-Policy | Baja | Edgar Rosario | Corregido 2026-10-28 | nginx |
| Z-06 | Faltan políticas COOP/COEP/CORP | Baja | Edgar Rosario | Corregido 2026-10-28 | nginx |
| Z-07 | Banner de versión en páginas | Baja | Edgar Rosario | Corregido 2026-10-28 | reportes originales |
| Z-08 | IP privada ficticia en fixtures | Baja | QA / propietario | Residual documentado | No es una dirección de infraestructura real; retirar fixtures en una entrega de producción |
| Z-09 | Content-Type de páginas 404 fuera de la API | Baja | QA / propietario | Residual documentado | Respuestas fuera de contrato; no equivalen a ejecución de código |

## Pruebas complementarias

En PC: 23 comprobaciones iniciales y 28 adicionales aprobadas, más prueba de navegador Firefox. Incluyen perfiles autenticados, acceso por rol, 401 sin token o con token inválido, 404 al acceder a expedientes ajenos, 403 al cambiar estados sin permiso, entradas inválidas, JSON malformado sin trazas, tratamiento de observaciones como texto, minimización de notificaciones, bloqueo tras intentos fallidos, cookies que no sustituyen Bearer y ausencia de secretos de sesión/correos de prueba en los logs revisados.

La prueba Firefox confirmó el login real y persistencia tras recargar. El componente utilizado para observaciones mostró literalmente el marcador HTML, sin crear un elemento `img` ni ejecutar el evento. El segundo factor existente continúa siendo simulado.

La suite backend posterior a la corrección de privacidad ejecutó **150 pruebas, 0 fallos, 0 errores y 0 omitidas**, incluidas las dos pruebas de CorreoSimulado. Evidencia: [ejecución 40952660100](https://github.com/Death272004/Tr-mites-Migratorios/actions/runs/40952660100).

CSRF: la configuración es stateless y autentica con Bearer; una cookie de sesión inventada no permite acceso. El intento de cambiar estado desde otro origen sin Bearer devuelve 401. Esta conclusión debe revisarse si se incorpora autenticación con cookies.

## Límites y recomendaciones

- Los antiguos reportes con muchas respuestas 401 no bastaban para acreditar sesiones de escaneo. Los nuevos requieren prueba explícita desde ZAP; una respuesta 401 aislada durante fuzzing no demuestra por sí sola un fallo de autenticación.
- El MVP no tiene MFA verificado por servidor. Esta revisión no certifica MFA ni autorización para un despliegue de producción.
- El correo simulado ya no revela enlaces o tokens y no entrega correos. La recuperación real necesita un proveedor privado que implemente `Correo`.
- Los resultados se limitan a las versiones, operaciones y entorno indicados. Cambios posteriores de seguridad o autenticación requieren nueva validación.
- Los reportes antiguos que afirman 191 pruebas no corresponden a las 148 verificadas antes de esta corrección ni a las 150 posteriores.

## Reescaneo y decisión

[Validación de seguridad aprobada: ejecución 40953412989](https://github.com/Death272004/Tr-mites-Migratorios/actions/runs/40953412989). Commit probado: `21a413b993d6f88c4f50557eca78035463f2717e`. Artefacto: `hu28-security-evidence`.

| Perfil | Autenticación antes/después desde ZAP | Alertas altas | Alertas medias | Tipos de alerta baja |
|---|---|---:|---:|---:|
| SOLICITANTE | 200 / 200 | 0 | 0 | 2 |
| FUNCIONARIO | 200 / 200 | 0 | 0 | 2 |
| SUPERVISOR | 200 / 200 | 0 | 0 | 1 |
| AUDITOR | 200 / 200 | 0 | 0 | 2 |
| ADMIN | 200 / 200 | 0 | 0 | 1 |
| Frontend pasivo | Sin sesión requerida | 0 | 0 | 1 |

Cada perfil tuvo 120 reglas PASS y cero FAIL en el resumen del escáner; el frontend tuvo 65 PASS y cero FAIL. Hay advertencias bajas e informativas: cero FAIL no significa ausencia de hallazgos. Los recuentos de la tabla son tipos de alerta por reporte, no vulnerabilidades únicas ni número de peticiones.

El flujo aislado ejecutó 33 comprobaciones HTTP en `manual.json` (incluidas las diez comprobaciones de sesión antes/después) y 28 en `manual-extra.json`: **61 comprobaciones, cero discrepancias**.

Nuevos riesgos residuales:

| ID | Hallazgo | Severidad | Responsable de seguimiento | Estado y recomendación |
|---|---|---|---|---|
| HU28-03 | Parámetros malformados con `&=` provocan 500 en notificaciones y solicitudes ARCO | Baja según ZAP | BE, seguimiento propuesto | Abierto: devolver 400 ante entradas inválidas y añadir regresiones; no se clasifica como falso positivo |
| HU28-04 | Content-Type inesperado en redirecciones y rutas 404 generadas por el escáner | Baja | BE/DevOps, seguimiento propuesto | Residual: revisar respuestas fuera del contrato; no se detectó ejecución de código |
| HU28-05 | Comentarios de desarrollo y políticas de caché señalados por análisis pasivo | Informativa | FE/DevOps, seguimiento propuesto | Revisar antes de producción; no se detectaron secretos en las evidencias publicadas |

**HU-28 y TASK-28.1 a TASK-28.5 tienen evidencia para cierre en el alcance de pruebas descrito**, con los riesgos bajos e informativos abiertos expresamente documentados. No se certifica seguridad absoluta ni un despliegue de producción. El cierre no elimina el trabajo de seguimiento ni los límites señalados.

No se modificaron estados en TeamTrack. Este informe y la ejecución enlazada permiten al equipo registrar el cierre sin presentar los riesgos bajos como corregidos.


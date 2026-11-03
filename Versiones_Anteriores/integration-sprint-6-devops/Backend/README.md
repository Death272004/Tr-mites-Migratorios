# Backend

Servidor Java 17 con Spring Boot y PostgreSQL. El contrato de la API está en [`docs/openapi.yaml`](docs/openapi.yaml), la matriz de autorización en [`docs/matriz-autorizacion.md`](docs/matriz-autorizacion.md) y el estándar de errores en [`docs/estandar-errores.md`](docs/estandar-errores.md). Sus cambios se registran en [`docs/CHANGELOG-api.md`](docs/CHANGELOG-api.md). Cómo levantarlo y probarlo: [README de la raíz](../README.md).

## Qué hay implementado

| Paquete | Contenido | Historias |
| --- | --- | --- |
| `comun` | Cuerpo de error uniforme, correlación por petición, paginación, eventos de dominio | HU-14 |
| `seguridad` | Usuarios, sesiones por token, bloqueo por intentos, registro, recuperación de contraseña, perfil, roles, permisos y matriz de autorización | HU-12, HU-13 |
| `catalogo` | Tipos de trámite, tipos documentales y requisitos | HU-11, HU-15, HU-17 |
| `expediente` | Registro, consulta, historial, observaciones y máquina de estados | HU-15, HU-16, HU-19, HU-20, HU-21 |
| `documento` | Carga validada, almacén protegido y descarga con permiso | HU-17 |
| `privacidad` | Consentimiento informado y solicitudes ARCO | HU-18b, HU-18c |
| `notificacion` | Avisos generados a partir de eventos de negocio | HU-18 |
| `auditoria` | Bitácora inmutable, consulta con filtros y exportación CSV | HU-22 |
| `verificacion` | Entidad de verificación (los endpoints llegan con la HU-24) | HU-11, HU-08 |
| `fuentes` | Interfaces de las fuentes externas y sus simuladores `/api/mock/*` | HU-08 |

El modelo de datos está en `src/main/resources/db/migration` (Flyway).

## Usuarios de demostración

Con `docker compose up` se crea un usuario ficticio por rol. Todos usan la contraseña de `DEMO_CONTRASENA` (por defecto `Demo-Tramites-2026`, solo para desarrollo local).

| Correo | Rol | Permisos |
| --- | --- | --- |
| `cliente@demo.pa`, `cliente2@demo.pa` | SOLICITANTE | PORTAL |
| `abogado@demo.pa` | SOLICITANTE | PORTAL, con representación acreditada de `cliente@demo.pa` |
| `recepcion@demo.pa`, `analista@demo.pa` | FUNCIONARIO | CONSULTAR, VERIFICAR, OBSERVAR |
| `resolutor@demo.pa` | FUNCIONARIO | CONSULTAR, VERIFICAR, RESOLVER, NOTIFICAR |
| `supervisor@demo.pa` | SUPERVISOR | CONSULTAR, REPORTAR |
| `auditor@demo.pa` | AUDITOR | CONSULTAR, AUDITAR, REPORTAR |
| `admin@demo.pa` | ADMIN | CONSULTAR, ADMINISTRAR |

Los permisos son los mismos nueve del frontend (`js/utils/perms.js`) y llegan en `usuario.permisos` al iniciar sesión. Los del FUNCIONARIO se asignan por cuenta; los demás roles llevan siempre los de su rol.

## Cuenta del portal

Servicios para las pantallas de acceso y cuenta (TASK-12.5). Los tres primeros son públicos; el perfil es siempre el del usuario de la sesión.

| Pantalla | Servicio | Respuesta |
| --- | --- | --- |
| P-02 Registro | `POST /api/auth/registro` | 201 con la cuenta `SOLICITANTE`; 409 `CORREO_YA_REGISTRADO` o `DOCUMENTO_YA_REGISTRADO` |
| P-04 Recuperación | `POST /api/auth/recuperacion` con `correo` | 202 sin cuerpo, exista o no la cuenta |
| P-04 Recuperación | `POST /api/auth/recuperacion/confirmacion` con `token` y `contrasenaNueva` | 204; 400 `ENLACE_INVALIDO` si el enlace no existe, venció o ya se usó |
| P-05 Perfil | `GET /api/perfil` | 200 con los datos de la cuenta |
| P-05 Perfil | `PATCH /api/perfil` con `telefono`, `idiomaNotificacion`, `medioNotificacion` | 200 con el perfil actualizado |
| P-05 Perfil | `PUT /api/auth/contrasena` | 204 (ya existía) |

```bash
curl -s http://localhost:8080/api/auth/registro -H "Content-Type: application/json" -d '{
  "tipoDocumento":"PASAPORTE","numeroDocumento":"PA1234567","nombre":"Persona Ficticia",
  "nacionalidad":"CO","correo":"persona@ejemplo.test","telefono":"+507 6000-0000","paisResidencia":"PA",
  "contrasena":"Clave-Segura-2026","aceptaTratamientoDatos":true}'
```

La contraseña sigue la política del backend: 10 a 72 caracteres, con mayúscula, minúscula, número y símbolo, y sin el correo. El formulario de P-02 hoy acepta 8.

No hay proveedor de correo. Con `CORREO_SIMULADO=true` solo se registra un aviso genérico: no se entrega el enlace ni se muestran destinatarios o tokens en los logs. La recuperación real requiere implementar `Correo` con un proveedor que entregue el enlace de forma privada. El token dura `RECUPERACION_MINUTOS` (60), sirve una vez y, al usarlo, se cierran todas las sesiones de la cuenta. Las pruebas usan un buzón en memoria.

## Estados del expediente

La cadena es la de `Pantallas_y_Datos_Migracion.md`, la misma que muestra el frontend. Cada cambio exige el permiso de su etapa:

| Estado de destino | Permiso | Pantalla |
| --- | --- | --- |
| `CON_OBSERVACIONES`, `EN_ANALISIS`, `ADMITIDO` | OBSERVAR | I-04, I-06, I-08 |
| `EN_RESOLUCION`, `RESUELTO` (con `resultado` `APROBADA` o `NEGADA`) | RESOLVER | I-10 |
| `NOTIFICADO`, `ENTREGADO`, `ARCHIVADO` | NOTIFICAR | I-11, I-12, I-13 |

```bash
curl -s http://localhost:8080/api/auth/login -H "Content-Type: application/json" \
  -d '{"correo":"cliente@demo.pa","contrasena":"Demo-Tramites-2026"}'
# Las demás llamadas llevan el token:  -H "Authorization: Bearer <token>"
```

Desde el frontend (puerto 8081) la API responde en la misma dirección, bajo `/api/`.

## Fuentes simuladas

`GET /api/mock/te/personas/{tipoDoc}/{numero}`, `/api/mock/css/afiliaciones/{idPersona}`, `/api/mock/registro/consultas/{idPersona}` y `/api/mock/snm/expedientes/{numero}`, solo para el rol FUNCIONARIO. Los datos ficticios salen de `src/main/resources/fixtures/fuentes-simuladas.json` (personas `P-0001` a `P-0003`).

El encabezado `X-Scenario` (o `?scenario=`) fuerza el comportamiento:

| Escenario | Respuesta |
| --- | --- |
| `OK` (por defecto) | 200 con el dato; 404 `SIN_RESULTADO` si la persona no está en el fixture |
| `SIN_RESULTADO` | 404 `SIN_RESULTADO` |
| `ERROR_TECNICO` | 500 `ERROR_TECNICO` |
| `TIMEOUT` | 504 `TIEMPO_AGOTADO` |
| `RATE_LIMIT` | 429 `LIMITE_EXCEDIDO` |
| `DATOS_INCOMPLETOS` | 200 con campos faltantes |
| `LLENO` | 200 con la misma respuesta y la misma `referencia` en cada llamada |

`MOCK_LATENCIA_MS` agrega una espera a cada respuesta. El modo de producción es la verificación manual asistida; los simuladores representan integraciones futuras, sujetas a convenio.

### Verificaciones del expediente (Sprint 5)

`/api/expedientes/{id}/verificaciones` registra verificaciones en modo manual asistido o las envía a las fuentes simuladas a través de adaptadores (`verificacion/adaptadores`). El mismo `X-Scenario` fuerza el comportamiento de la fuente en modo simulado. Un fallo técnico programa un reintento con espera exponencial; agotado el tope queda en `ERROR_TECNICO` y se coteja a mano. Timeout y reintentos por fuente en `app.verificaciones.fuentes.*`; `VERIFICACION_REINTENTOS_AUTOMATICOS=false` apaga los reintentos programados. Ver `docs/matriz-fuentes-finalidad.md` y `docs/sustitucion-adaptadores.md`.

## Decisiones tomadas que el PO debe confirmar

- **Registro sin verificación de correo:** la cuenta nace `ACTIVA`, porque el código de P-03 sigue simulado en el frontend. Por eso el registro sí informa cuando el correo o el documento ya existen.
- **Perfil:** nombre, documento y correo son de solo lectura. Faltan el cambio de correo con código, la dirección de notificación y la regla de no repetir las últimas tres contraseñas (P-04).
- **Aceptación de la Ley 81 en el registro:** se guarda la fecha y la IP en la cuenta; no crea un consentimiento informado (HU-18b).
- **Estado inicial:** el expediente nace en `RECIBIDO`, porque la solicitud se envía al final del asistente (P-17). `EN_PREPARACION` existe pero no se usa: el borrador vive en el navegador.
- **Matriz de transiciones:** el MVP registra explícitamente la matriz común por cada tipo de trámite activo en `expediente/Transiciones.java`; sus reglas y restricciones están documentadas en [`Documentacion/matriz-transiciones-sprint4.md`](../Documentacion/matriz-transiciones-sprint4.md).
- **Ámbito del personal:** FUNCIONARIO (con permiso CONSULTAR) y SUPERVISOR ven todos los expedientes del despacho.
- **Resolución:** para pasar a `EN_RESOLUCION` o `RESUELTO` deben estar los documentos obligatorios y no puede haber verificaciones sin respuesta. No se exige una cantidad mínima de verificaciones hasta que exista su registro (HU-24).
- **Archivo:** `ARCHIVADO` es definitivo; la reactivación que muestra I-13 no está implementada.
- **ADMIN:** tiene el permiso CONSULTAR como en el frontend, pero sigue sin leer ni decidir expedientes (la matriz por rol lo impide).
- **Catálogos:** los cuatro trámites y ocho tipos documentales son de ejemplo (PEN-11).
- **Plazo ARCO:** 10 días calendario (`ARCO_PLAZO_DIAS`).
- **Consentimiento:** hoy bloquea adjuntar documentos sensibles sin consentimiento expreso vigente. La regla general de consentimiento vigente queda lista para aplicarse al registrar verificaciones (HU-24).

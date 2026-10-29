# Backend

Servidor Java 17 con Spring Boot y PostgreSQL. El contrato de la API está en [`docs/openapi.yaml`](docs/openapi.yaml) y sus cambios en [`docs/CHANGELOG-api.md`](docs/CHANGELOG-api.md). Cómo levantarlo y probarlo: [README de la raíz](../README.md).

## Qué hay implementado

| Paquete | Contenido | Historias |
| --- | --- | --- |
| `comun` | Cuerpo de error uniforme, correlación por petición, paginación, eventos de dominio | HU-14 |
| `seguridad` | Usuarios, sesiones por token, bloqueo por intentos, roles, permisos y matriz de autorización | HU-12, HU-13 |
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

## Decisiones tomadas que el PO debe confirmar

- **Estado inicial:** el expediente nace en `RECIBIDO`, porque la solicitud se envía al final del asistente (P-17). `EN_PREPARACION` existe pero no se usa: el borrador vive en el navegador.
- **Matriz de transiciones:** hay una sola matriz para todos los trámites (`expediente/Transiciones.java`). La definitiva por tipo de trámite es la TASK-19.1.
- **Ámbito del personal:** FUNCIONARIO (con permiso CONSULTAR) y SUPERVISOR ven todos los expedientes del despacho.
- **Resolución:** para pasar a `EN_RESOLUCION` o `RESUELTO` deben estar los documentos obligatorios y no puede haber verificaciones sin respuesta. No se exige una cantidad mínima de verificaciones hasta que exista su registro (HU-24).
- **Archivo:** `ARCHIVADO` es definitivo; la reactivación que muestra I-13 no está implementada.
- **ADMIN:** tiene el permiso CONSULTAR como en el frontend, pero sigue sin leer ni decidir expedientes (la matriz por rol lo impide).
- **Catálogos:** los cuatro trámites y ocho tipos documentales son de ejemplo (PEN-11).
- **Plazo ARCO:** 10 días calendario (`ARCO_PLAZO_DIAS`).
- **Consentimiento:** hoy bloquea adjuntar documentos sensibles sin consentimiento expreso vigente. La regla general de consentimiento vigente queda lista para aplicarse al registrar verificaciones (HU-24).

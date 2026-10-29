# Sprint 6 · Evidencias de calidad (BE)

Fecha de ejecución: 2026-10-28 · Responsable: Edgar Rosario (BE) · Entorno: `docker compose up --build` local
(PostgreSQL 16, backend Spring Boot, nginx), solo usuarios ficticios `@demo.pa`.
Rama: `feature/sprint-6-integracion-calidad`.

| Tarea | Resultado |
| --- | --- |
| Integración FE↔BE (I-01) | Login interno real contra `POST /api/auth/login`; 6 cuentas internas × todas sus pantallas sin errores de API |
| TASK-27.1 (TT-181) | 52 pruebas unitarias nuevas de dominio; suite completa 191/191; cobertura ≥ 92 % en módulos críticos |
| TASK-28.4 (TT-188) | ZAP: 0 críticos/altos; 2 medios y 7 bajos corregidos en nginx; re-escaneo sin medios |
| TASK-29.4 (TT-193) | Cuello de botella en la bandeja de expedientes corregido con índice (V6): consulta 10,4 ms → 0,10 ms |

## 1. Integración frontend ↔ backend

Antes: el login institucional (I-01) validaba contra un fixture y guardaba un token `demo.*`; desde el
commit 6e5874b todas las vistas internas detectaban la sesión demo y mostraban datos de fixtures.

Cambio: con backend (página servida por http/https) I-01 llama a `POST /api/auth/login` con
`<usuario>@demo.pa`, rechaza cuentas `SOLICITANTE`, guarda el token real y el rol/permisos que devuelve
el backend. El segundo factor sigue siendo simulado (el backend no tiene MFA). Sin backend (`file://`)
el modo demo se conserva.

Recorrido real (login por la UI, captura de cada XHR):

| Cuenta | Pantallas | Resultado |
| --- | --- | --- |
| recepcion, analista, resolutor (FUNCIONARIO) | 13 c/u | 13/13 sin errores HTTP |
| supervisor | 3 | 3/3 |
| auditor | 3 | 3/3 |
| admin | 3 | 3/3 |
| carga / cliente (SOLICITANTE) | 12 + "Ver estado" | 12/12; estado carga expediente, historial y verificaciones reales |

Correcciones encontradas en el recorrido:

* I-08 Observaciones e I-10 Resolución mostraban "Ocurrió un problema temporal" cuando no había
  expedientes en ese estado; ahora muestran el estado vacío.
* El menú de ADMIN ofrecía Consentimientos, pero el backend (mínimo privilegio, 06-roles-y-accesos §6.5)
  responde 403; se quitó del menú (la ruta directa da 404).
* Versiones de caché (`?v=20261028a`) en los scripts modificados.

**Pantallas que siguen con fixtures porque el backend no tiene endpoint** (no es el cambio de emergencia,
nunca se conectaron): I-05 Asignación, I-09 Edictos, I-11 Notificación, I-12 Entrega, I-13 Archivo,
I-14 Catálogos, I-15 Usuarios, I-17 Reportes, I-18 Conexiones; portal P-21 Subsanación, P-22 Resultados,
P-23 Pagos, P-24 Edictos, P-25 Certificaciones, P-26 Naturalización.

## 2. Pruebas unitarias de dominio (TASK-27.1)

Nuevas clases (sin Spring ni base de datos, JUnit 5 + Mockito + AssertJ):

* `expediente/TransicionesUnitTest` (24): matriz completa, saltos prohibidos, permiso por etapa,
  versión desactualizada, resultado obligatorio, prerrequisitos de resolución, acceso por rol, IDOR → 404.
* `verificacion/VerificacionDominioTest` (17): estados finales, reintentos con espera exponencial,
  fallo técnico ≠ resultado (CP-07), registro manual tras agotar reintentos, matriz de fuentes.
* `seguridad/PermisosDominioTest` (11): matriz rol × endpoint, ADMIN sin expedientes, bitácora solo
  auditor, política de contraseñas.

Comando: `cd Backend && ./mvnw test` (Docker requerido para Testcontainers). Resultado: **191 pruebas,
0 fallos**. JaCoCo 0.8.13 deja el informe en `Backend/target/site/jacoco/index.html`.

| Módulo | Cobertura de instrucciones | Ramas |
| --- | --- | --- |
| expediente (estados) | 98,2 % | 95,5 % |
| seguridad (autorización) | 92,3 % | 83,5 % |
| verificacion | 94,4 % | 78,8 % |
| verificacion.adaptadores | 89,8 % | 70,0 % |
| Total backend | 94,0 % | — |

## 3. Seguridad con OWASP ZAP (TASK-28.4)

ZAP `ghcr.io/zaproxy/zaproxy:stable` en la red Docker del proyecto:

* `zap-baseline.py` sobre el frontend (pasivo + spider).
* `zap-api-scan.py` (activo) sobre `Backend/docs/openapi.yaml`, 165 URLs, con sesión de FUNCIONARIO
  (`analista`) y de SOLICITANTE (`carga`) inyectada en `Authorization`.

| ID | Hallazgo | Severidad | Dónde | Estado |
| --- | --- | --- | --- | --- |
| Z-01 | CSP no definida (10038) | Media | nginx | Corregido 2026-10-28 |
| Z-02 | Falta anti-clickjacking (10020) | Media | nginx | Corregido 2026-10-28 |
| Z-03 | Falta X-Content-Type-Options (10021) | Baja | nginx | Corregido |
| Z-04 | Versión de nginx en `Server` (10036) | Baja | nginx | Corregido (`server_tokens off`) |
| Z-05 | Falta Permissions-Policy (10063) | Baja | nginx | Corregido |
| Z-06 | Faltan COOP/COEP/CORP (90004) | Baja | nginx | Corregido |
| Z-07 | Banner de versión en página (10009) | Baja | nginx | Corregido |
| Z-08 | IP privada en el contenido (2) | Baja | fixture I-01/I-18 (`10.0.0.24`, ficticia) | Riesgo residual aceptado |
| Z-09 | Content-Type inesperado (100001) | Baja | páginas 404 HTML de nginx fuera de `/api` | Riesgo residual aceptado |

**Críticos y altos: 0 antes y 0 después.** Reglas activas superadas: SQL Injection (varias variantes),
XSS reflejado y persistente, Path Traversal, Remote Code Execution, entre otras (120 PASS por rol).

Pruebas manuales complementarias (16/16 conformes):

| Prueba | Esperado | Obtenido |
| --- | --- | --- |
| Sin token / token inventado | 401 | 401 |
| IDOR: cliente lee expediente y documentos ajenos | 404 | 404 |
| BOLA: cliente cambia estado | 403 | 403 |
| ADMIN lista expedientes; analista lee bitácora; auditor crea verificación | 403 | 403 |
| SQLi en `estado` / `tipoTramite` | 400 / lista vacía | 400 / lista vacía |
| XSS en observación | se guarda como texto; la UI usa `textContent` + CSP | conforme |
| Path traversal en id | 404 | 404 |
| Archivo no PDF con extensión .pdf | 400 | 400 (firma de contenido) |
| 6 intentos fallidos de login | bloqueo, mensaje genérico | 401 genérico; clave correcta también rechazada durante el bloqueo |
| JSON malformado | 400 sin traza | 400 sin traza |

CSRF: no aplica, la API usa token Bearer y no cookies de sesión.
La aplicación se volvió a recorrer completa con la CSP activa: 0 violaciones.

Archivos: `seguridad/antes/` y `seguridad/despues/` (HTML + JSON de cada escaneo).

## 4. Rendimiento con Apache JMeter (TASK-29.4)

Plan `rendimiento/carga-tramites.jmx` (JMeter 5.6.3): clientes (login, listar, crear expediente,
adjuntar PDF, estado, verificaciones) y despacho (login, bandeja, documentos, verificación TE simulada,
verificaciones, historial), pausa 500 ms. Datos: `rendimiento/preparar-datos.sh`.

```
jmeter -n -t carga-tramites.jmx -l resultados.jtl -e -o informe -JCLIENTES=100 -JDESPACHO=50 -JDURACION=120
```

| Escenario | Usuarios | Muestras | Error | P95 máx. (op.) | Rendimiento |
| --- | --- | --- | --- | --- | --- |
| Línea base | 20 + 10 | 6 334 | 0,11 % (7 × 409 de negocio*) | 63 ms (login) | 52,8 req/s |
| Estrés antes, 55 000 expedientes | 100 + 50 | 29 793 | 0,00 % (1 error de socket del cliente JMeter) | 77 ms (login) | ~248 req/s |
| Estrés después del índice | 100 + 50 | 29 929 | 0,00 % (1 error de socket del cliente JMeter) | 78 ms (login) | ~249 req/s |

\* Verificación TE sobre expedientes del cliente demo sin documento de identidad: regla de negocio, no falla.

Cuello de botella encontrado: `GET /api/expedientes` (bandeja del despacho y "mis expedientes") ordena
por `fecha_creacion DESC`, pero ningún índice empezaba por esa columna, así que cada consulta recorría y
ordenaba toda la tabla (13 595 seq scans y 33 M filas leídas en una corrida de 2 minutos).

Corrección: `V6__indice_bandeja_expedientes.sql` → `CREATE INDEX expediente_fecha_creacion ON expediente (fecha_creacion DESC)`.

| Medida | Antes | Después |
| --- | --- | --- |
| `EXPLAIN ANALYZE` bandeja (58 k filas) | 10,4 ms, Seq Scan + Sort | 0,10 ms, Index Scan |
| Bandeja del despacho, media / P95 | 27,8 / 38 ms | 11,7 / 16 ms |
| Mis expedientes, media / P95 | 28,5 / 40 ms | 11,7 / 17 ms |
| CPU máx. PostgreSQL | 168 % | 70 % |

Todas las operaciones quedan muy por debajo del umbral de referencia (P95 ≤ 2 s).

Incidencias abiertas con plan (responsable BE):

1. El login (~68 ms) es la operación más costosa por diseño (BCrypt coste 10); no se reduce.
2. Lo que queda de la bandeja (~11 ms) es el `count(*)` de la paginación sobre toda la tabla; si el volumen
   real lo exige, cambiar a paginación por cursor o a un total aproximado.
3. La tabla `sesion` crece con cada login (7 000+ filas en una corrida) y no hay limpieza de sesiones
   vencidas; programar una purga periódica en el Sprint 7.

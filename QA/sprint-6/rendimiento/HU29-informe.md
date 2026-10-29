# HU-29 — Revalidación de rendimiento de la rama integrada

Fecha: 2026-10-29. Rama: integration/sprint-6-devops. Código probado: 07b6b1c (ajuste de concurrencia); ejecución anterior conservada sobre f3a15f2.

## Resultado y límites

La revisión registra todas las muestras, incluidos errores y conflictos. El umbral técnico usado es la referencia del backlog: P95 de cada operación principal ≤ 2000 ms bajo carga de referencia. No se encontró constancia de ratificación del umbral por el PO; esa confirmación queda pendiente y no se sustituye por este informe.

No hay un requisito de cero errores en HU-29. No se ocultan errores por redondear su porcentaje. La carga de estrés es una prueba adicional; los timeouts de fuente se evalúan por su manejo y disponibilidad, no por el umbral de operaciones normales.

## Entorno y escenarios

Docker Compose aislado hu29validacion; PostgreSQL 16, backend Java 17, frontend nginx, JMeter 5.6.3 no GUI. HP / AMD Ryzen 7 5700U, 16 CPU lógicas, RAM aproximada 7 GiB. Ver entorno.json, docker-stats.jsonl y volumen-final.json.

Pausa entre operaciones: 500 ms; rampa: 20 s. Referencia: 20 clientes + 10 analistas durante 120 s. Estrés: 100 + 50 durante 120 s. Dependencia en ERROR_TECNICO: 20 + 10 durante 60 s. Calentamiento: 1 cliente, 10 s.

Usuarios y documentos ficticios demo.pa; creación de expedientes, subida de PDF, login, bandeja, estado, documentos, verificaciones e historial. Se preparan registro y consentimiento con preparar-datos.sh. El mismo cliente se reutiliza para generar carga; no representa 150 identidades distintas.

Base de datos de validación creada aislada y acumulada entre corridas; no es una reproducción del volumen histórico de 55000 expedientes. Las comparaciones absolutas con el informe anterior no son un benchmark controlado. Otras aplicaciones y el entorno anterior HU28 compartieron el equipo; las cifras son de este entorno MVP.

## Métricas posteriores al ajuste

| Escenario | Muestras | Media ms | P95 global ms | Máx. P95 por operación ms | req/s | Errores | Error % |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| referencia | 6135 | 39.39 | 161 | 189 | 51.36 | 0 | 0.0 |
| estres | 30087 | 47.47 | 196 | 348 | 251.46 | 0 | 0.0 |
| dependencia-error | 2795 | 40.71 | 186 | 201 | 46.96 | 31 | 1.10912 |

Los P95 anteriores incluyen muestras fallidas. Ver resumen.json para cada operación, errores HTTP/no HTTP y CPU/memoria observada por contenedor. Los porcentajes de CPU Docker pueden superar 100 % por el uso de varios núcleos.

### Detalle de errores

- referencia: {}
- estres: {}
- dependencia-error: {"14 Registrar verificación TE (simulada) | 409 | ": 31}

Los 409 en verificación pueden producirse al seleccionar repetidamente el mismo expediente con una verificación pendiente. El JTL no contiene el cuerpo de estos errores: no se afirma que cada 409 individual haya sido atribuido inequívocamente. Se conservan como errores observados; el plan de corrección es usar expedientes exclusivos por hilo y añadir aserciones del código de negocio (QA).

## Indisponibilidad de dependencia

El plan de JMeter parametriza X-Scenario=ERROR_TECNICO sobre el adaptador TE simulado. Sus 31 errores observados son respuestas HTTP 409; no se excluyen del porcentaje. No hubo timeouts de cliente ni respuestas 5xx en esta corrida. No existe una dependencia gubernamental real conectada en este MVP. Las comprobaciones complementarias sobre expedientes nuevos verifican los estados y la disponibilidad:

| Escenario | HTTP | Estado | Último fallo | Latencia ms | Salud | Listado | Cumple |
| --- | ---: | --- | --- | ---: | --- | ---: | --- |
| ERROR_TECNICO | 201 | REINTENTO_PROGRAMADO | ERROR_TECNICO | 20.46 | UP | 200 | True |
| TIMEOUT | 201 | REINTENTO_PROGRAMADO | TIEMPO_AGOTADO | 3013.76 | UP | 200 | True |

No se devuelve un resultado de identidad cuando falla la fuente. El timeout real del adaptador es 3000 ms y se limita antes de programar el reintento. Las latencias de los endpoints mock se miden por separado, 10 muestras por escenario; no equivalen al tiempo interno del adaptador. Ver dependencia-comprobaciones.json.

## Cuello de botella y corrección

La primera revalidación con 150 usuarios produjo 910 errores de 13954 muestras (6,52143 %), con SocketTimeoutException y errores encadenados de autenticación/identificadores. Hikari reportó pool de 10 conexiones activas y hasta 199 solicitudes esperando. Se conservan JTL y mensajes seleccionados en revalidacion-antes-ajuste/. Aunque su P95 global era 405 ms, eso no bastaba para aprobar la corrida: había timeouts y degradación significativa.

Auditoria usa PROPAGATION_REQUIRES_NEW y necesita una conexión adicional mientras otra operación puede retener la suya. La configuración permitía por defecto 200 hilos HTTP frente a solo 10 conexiones; era susceptible de agotamiento bajo concurrencia.

Corrección 07b6b1c: 32 hilos HTTP y pool máximo de 40, dejando margen para transacciones de auditoría y tareas programadas. Se mantiene la auditoría independiente y el índice V6 existente. HTTP_MAX_THREADS y DB_POOL_MAX permiten ajustar la capacidad; deben dimensionarse juntos y con max_connections de PostgreSQL. No basta aumentar uno sin revisar el otro.

Mensajes de agotamiento del pool después de reconstruir el backend: 0. La comparación debe leerse con la tabla de errores y P95, no solo con el rendimiento total.

El índice V6 ya estaba incorporado. Los JTL históricos antes/después respaldan la caída del P95 de bandeja 38→16 ms y mis expedientes 40→17 ms. La comparación de EXPLAIN 10,4→0,10 ms pertenece al informe histórico; no se presenta como una nueva medición.

## Incidencias y responsables

| ID | Hallazgo | Responsable | Estado / plan |
| --- | --- | --- | --- |
| PERF-01 | Saturación de conexiones con 150 usuarios | BE | Corregida y verificada: referencia y estrés sin errores ni agotamiento del pool |
| PERF-02 | Sesiones crecen con cada login | BE | Pendiente: purga de sesiones vencidas, Sprint 7 |
| PERF-03 | 409 y selección compartida de expedientes en carga | QA | Pendiente: datos exclusivos por hilo y aserciones del error de negocio |
| PERF-04 | Error BindException en JTL históricos | QA | Error del generador local; conservar evidencia y vigilar en repetición |
| PERF-05 | Umbral acordado por PO sin constancia | PO, QA | Confirmar referencia P95 ≤ 2000 ms y registrar aceptación |

## Pruebas de regresión

150 pruebas, 0 fallos, 0 errores, 0 omitidas. Maven verify local exitoso y GitHub Actions exitoso sobre 07b6b1c: https://github.com/Death272004/Tr-mites-Migratorios/actions/runs/40961554979 .

## Estado para TeamTrack

Las tareas se evalúan con los resultados completos; no se modifica TeamTrack desde este informe. TASK-29.1 y TASK-29.5 quedan En revisión hasta confirmar el umbral con el PO. TASK-29.2 y TASK-29.3 cuentan con scripts y ejecución documentada. TASK-29.4 puede cerrarse: la segunda corrida finalizó sin errores ni agotamiento del pool. HU-29 permanece En revisión únicamente por la confirmación del umbral.

## Reproducción

En una copia de la rama con Docker, Java y Apache JMeter 5.6.3, levantar Compose con puertos aislados: DB_PORT=55439 BACKEND_PORT=8180 FRONTEND_PORT=8181 docker compose -p hu29validacion up -d --build --wait.

Configurar JMETER_BIN con la ruta al ejecutable, HU29_ROOT con el repositorio (opcional), HU29_OUTPUT con una carpeta nueva. Ejecutar python QA/sprint-6/rendimiento/tools/ejecutar.py. La salida no puede existir previamente para evitar sobrescribir/mezclar evidencia.

Al terminar, usando el mismo HU29_OUTPUT, ejecutar comprobar-dependencia.py y analizar.py desde esa carpeta tools. La comprobación de dependencia usa el backend directo en 8180 para health y el proxy en 8181 para API. Requiere cuentas demo. Antes del calentamiento verificar que no haya verificaciones pendientes heredadas de otra corrida.

JMeter comprueba los códigos HTTP de manera predeterminada; la validación de estados de error se realiza con las comprobaciones complementarias. No se interpreta HTTP 201 por sí solo como prueba de que la fuente respondió.


## Recursos por escenario

| Escenario | Contenedor | CPU máxima % | Memoria máxima observada |
| --- | --- | ---: | --- |
| referencia | hu29validacion-backend-1 | 314.04 | 405.1MiB / 7.078GiB |
| referencia | hu29validacion-db-1 | 65.86 | 107MiB / 7.078GiB |
| referencia | hu29validacion-frontend-1 | 4.72 | 17.55MiB / 7.078GiB |
| estres | hu29validacion-backend-1 | 987.71 | 420.9MiB / 7.078GiB |
| estres | hu29validacion-db-1 | 150.02 | 181.2MiB / 7.078GiB |
| estres | hu29validacion-frontend-1 | 16.47 | 18.87MiB / 7.078GiB |
| dependencia-error | hu29validacion-backend-1 | 231.21 | 402.3MiB / 7.078GiB |
| dependencia-error | hu29validacion-db-1 | 43.09 | 182.1MiB / 7.078GiB |
| dependencia-error | hu29validacion-frontend-1 | 13.95 | 17.63MiB / 7.078GiB |

## Latencia de mocks (muestras complementarias)

| Escenario | Muestras | Media ms | P95 ms | Códigos HTTP |
| --- | ---: | ---: | ---: | --- |
| OK | 10 | 6.04 | 12.07 | [200] |
| ERROR_TECNICO | 10 | 6.11 | 6.91 | [500] |
| TIMEOUT | 10 | 5.71 | 7.35 | [504] |

## Dictamen técnico final

Referencia y estrés sin errores, sin agotamiento del pool y con todos los P95 dentro de la referencia de 2000 ms: True.

TASK-29.2, TASK-29.3 y TASK-29.4 pueden cerrarse técnicamente. La corrección PERF-01 queda verificada en los escenarios y duración indicados. TASK-29.1, TASK-29.5 y HU-29 se mantienen En revisión únicamente por la confirmación del umbral acordado con PO. Los pendientes PERF-02 y PERF-03 quedan con plan explícito; no se consideran resueltos.

Los JTL se publican comprimidos sin pérdida (.jtl.gz); analizar.py admite ambos formatos. SHA256SUMS permite verificar las evidencias. Los datos sin comprimir permanecen en la copia local de pruebas.

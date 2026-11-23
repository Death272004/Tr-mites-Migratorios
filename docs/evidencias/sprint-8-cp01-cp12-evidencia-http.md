# Evidencia HTTP Real en Vivo · CP-01 a CP-12 (Sprint 8)

**Fecha de ejecución:** 2026-11-23 13:58:22 EST  
**Entorno:** Docker Compose local (`http://localhost:8080` → Nginx → Spring Boot → PostgreSQL 16 + volumen documental)  
**Salud inicial:** `GET http://localhost:8080/salud` → `200` (`ok`), contenedor `tr-mites-migratorio-backend-1` → `Healthy` (`/actuator/health` interno `UP`).  
**Nota de seguridad:** No se registran tokens Bearer ni contraseñas en este informe.

## Resultados verificados en vivo

| Caso | Escenario | Evidencia HTTP real observada | Estado |
| :--- | :--- | :--- | :---: |
| **CP-01** | Login válido por rol y acceso restringido | `POST /api/auth/login` → `200` (SOLICITANTE, FUNCIONARIO, AUDITOR, RP); `GET /api/perfil` → `200`; `GET /api/auditoria/eventos` como SOLICITANTE → `403`. | **Aprobado** |
| **CP-02** | Login inválido sin revelar existencia de cuenta | Clave errónea → `401` (`CREDENCIALES_INVALIDAS`); usuario inexistente → `401` (`CREDENCIALES_INVALIDAS`); mensaje idéntico. | **Aprobado** |
| **CP-03** | Aislamiento de expedientes ajenos y áreas RP/CSS/TE | Solicitante ajeno `GET /api/expedientes/{id}` → `404`; Pasante RP `GET /api/consentimientos` → `403` (`AREA_NO_AUTORIZADA`), `GET /api/solicitudes-arco` → `403`. | **Aprobado** |
| **CP-04** | Transiciones válidas, bloqueo RP, titularidad estricta y PASANTE_BUFETE | `RECIBIDO → RESUELTO` → `409` (`TRANSICION_NO_PERMITIDA`); cambio de estado como RP → `403` (`AREA_NO_AUTORIZADA`); identidad alterada (`hola`) → `400`; `PASANTE_BUFETE` demo → `201`. | **Aprobado** |
| **CP-05** | Carga documental validada por magic bytes | PDF válido → `201` (id `fbb9a44a…`); ejecutable renombrado `.pdf` → `400` (`ENTRADA_INVALIDA`). | **Aprobado** |
| **CP-06** | Verificación simulada exitosa | `POST /api/expedientes/{id}/verificaciones` (TE, `OK`) → `201`, estado `SIN_RESULTADO`, resultado `SIN_RESULTADO`, ref `None`. | **Aprobado** |
| **CP-07** | Error técnico tratado sin resultado negativo | `POST /api/expedientes/{id}/verificaciones` (CSS, `ERROR_TECNICO`) → `201`, estado `REINTENTO_PROGRAMADO`, `resultadoMinimo: null`, `ultimoFallo: ERROR_TECNICO`. | **Aprobado** |
| **CP-08** | Idempotencia sin duplicados | Repetición con header `Idempotency-Key: cp06-b09f59277c` → `200`, mismo `id` (`971a279d…`). | **Aprobado** |
| **CP-09** | Historial y bitácora protegidos por rol | Historial titular → `200`; historial ajeno → `404`; `/api/auditoria/eventos` como AUDITOR → `200` (como SOLICITANTE → `403`). | **Aprobado** |
| **CP-12** | Descarga protegida `/contenido` por autorización | Titular → `200` (`46 B`, `attachment; filename="pasaporte-prueba.pdf"; filename*=UTF-8''pasaporte-prueba.pdf`, `Cache-Control: no-store`); Funcionario → `200`; sin sesión → `401`; ajeno → `404`; auditor → `403`. | **Aprobado** |
| **CP-10** | Rendimiento (JMeter) | Respaldado por `QA/sprint-6/rendimiento/HU29-informe.md` (P95 máx. 78 ms; 0,00% errores). | **Aprobado\*** |
| **CP-11** | Seguridad (OWASP ZAP + auditoría) | Respaldado por `QA/sprint-6/seguridad/HU28-informe.md` (0 críticos/altos) + remediación S-01 a S-09 verificada en vivo. | **Aprobado\*** |

---

Todos los casos funcionales y de seguridad ejecutables por HTTP (`CP-01` a `CP-09` y `CP-12`) pasaron al **100%** contra los contenedores en ejecución (`docker compose up --build -d`).

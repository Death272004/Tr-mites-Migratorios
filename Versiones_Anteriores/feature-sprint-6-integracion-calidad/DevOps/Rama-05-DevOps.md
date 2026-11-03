# Rama DevOps — documento de trabajo

**Proyecto:** Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá
**Fuente:** `05-backlog-siete-sprints.md` (backlog maestro)
**Inventario oficial de pantallas:** 45 (portal P-01…P-27 + módulo interno I-01…I-18) adoptado vía registro de cambios del backlog.
**Rol responsable:** DevOps (infraestructura, entornos y despliegue) — en un equipo pequeño puede cubrirse con el líder técnico (LT) y el desarrollador backend (BE)

---

## 1. Objetivo de la rama

Garantizar que el producto (MVP) sea **reproducible, aislado y verificable**: repositorio bien estructurado, entornos definidos, contenedores Docker, configuración y secretos fuera del código, integración continua y una instalación limpia que funcione en una máquina nueva.

## 2. Alcance de la rama por sprint

| Sprint | Qué hace esta rama |
| --- | --- |
| 1 | Estructura del repositorio, convenciones de Git y estrategia de entornos y secretos. |
| 2 | **Sprint clave:** Dockerfiles, `docker-compose`, base de datos en contenedor, healthchecks y verificación de arranque limpio. |
| 3 | Volúmenes de almacenamiento documental protegido y entorno de pruebas aislado. |
| 4 | Persistencia de auditoría y logs técnicos en contenedores, sin exposición de datos. |
| 5 | Configuración de escenarios y latencia de los mocks por variable de entorno. |
| 6 | **CI con reporte de cobertura**, entorno de pruebas para ZAP/JMeter y métricas de infraestructura. |
| 7 | Instalación limpia, empaquetado, etiqueta de versión y entorno de demostración. |

## 3. Con qué trabajas (herramientas)

### Obligatorias (definidas por el equipo)

| Herramienta | Uso obligatorio en esta rama |
| --- | --- |
| **Docker** | Herramienta central de la rama: `Dockerfile`, `docker-compose.yml`, healthchecks, volúmenes, perfiles y entornos aislados. Todo el proyecto debe levantarse con un único `docker compose up`. |
| **Java** | Cadena de compilación del backend: verificar que el artefacto Java se construye en el contenedor y en la CI (`mvn/gradle package`), sin dependencias locales. |
| **Apache JMeter** | Preparar el entorno donde JMeter ejecuta las pruebas de carga (entorno aislado, datos de prueba, recolección de CPU/memoria) y conservar sus resultados como evidencia. |
| **OWASP ZAP** | Preparar el entorno de análisis de ZAP (sesiones por rol, datos ficticios, blacklist de acciones destructivas) y conservar el informe como evidencia de entrega. |

### Complementarias

| Herramienta | Uso |
| --- | --- |
| Git | Convenciones de ramas, revisiones, etiquetas (tags) de versión y trazabilidad. |
| PostgreSQL (en contenedor) | Base de datos del entorno, migraciones automáticas al arrancar. |
| Flyway o Liquibase | Migraciones versionadas del esquema. |
| Herramienta de CI (GitHub Actions, GitLab CI u otra disponible) | Ejecutar la suite de pruebas y el reporte de cobertura en cada integración. |
| Variables de entorno (`.env`) | Configuración y secretos fuera del código fuente. |

## 4. Convenciones y Definition of Done de la rama

Una tarea de esta rama está terminada cuando:

1. El resultado es **reproducible desde cero**: borrar contenedores y volúmenes y volver a levantar funciona igual.
2. No hay secretos, credenciales ni rutas absolutas en el repositorio (ni en el historial de Git).
3. Los contenedores tienen healthchecks y los servicios esperan a sus dependencias antes de arrancar.
4. La configuración de cada entorno (desarrollo, pruebas, demostración) está documentada y es cambiable por variables de entorno.
5. La instalación limpia en una máquina nueva se verifica y deja evidencia.
6. El `README` de instalación refleja exactamente lo que funciona.

**Reglas de la rama:**

* Fuera del alcance del MVP: **entorno de producción** (Documento 3.8), salvo aprobación expresa de requisitos legales y de seguridad.
* Ningún volumen ni base de datos del producto (MVP) contiene datos personales reales.
* **Los datos de clientes están prohibidos en las pruebas:** todos los entornos (desarrollo, pruebas, demostración) funcionan solo con **datos ficticios**; ningún dato de clientes del bufete puede entrar en repositorios, volúmenes, imágenes, CI ni evidencias.
* **Alojamiento de datos (nota breve, pendiente de validación):** considerar que los datos se alojen bajo **jurisdicción preferiblemente panameña**, en línea con la Ley 81 de 2019; decisión pendiente de validación jurídica.
* Los datos de demostración (fixtures) se versionan; los secretos, nunca.
* Si algo solo funciona "en la máquina de alguien", es un incidente de la rama, no un detalle.

---

## 5. Sprints

# Sprint 1 (semanas 1–2) — Estructura, convenciones y estrategia de entornos

**Objetivo de la rama:** dejar el repositorio y las reglas de trabajo listas para que las cuatro ramas produzcan código integrable desde el primer día.

**Tareas de esta rama:**

| TASK | HU | Descripción | Responsable | Estimación |
| --- | --- | --- | --- | --- |
| TASK-10.1 (adelanto) | HU-10 | Crear la estructura del repositorio (`backend/`, `frontend/`, `docs/`, `scripts/`) con convenciones de ramas, nombres de commit y revisión por pares. | DevOps con LT | 3 h |
| — | HU-01 | Verificar que el andamiaje del frontend entra en la estructura del repositorio y se versiona sin artefactos (`node_modules`, builds). | DevOps con FE | 2 h |
| — | Documento 3.8 | Definir la estrategia de **entornos** (desarrollo, pruebas, demostración) y de **secretos** (variables de entorno, `.env` nunca commiteado, `.env.example` como plantilla). | DevOps con LT | 4 h |
| — | — | Definir la política de evidencias: dónde se guardan informes de ZAP/JMeter, capturas y matrices (`docs/evidencias/`). | DevOps con DOC | 2 h |

**Criterios de aceptación del sprint para la rama:**

1. Repositorio con estructura limpia, `.gitignore` completo y sin artefactos ni secretos en el historial.
2. Documento breve de convenciones Git (ramas, commits, revisión) enlazado desde el `README`.
3. Estrategia de entornos y secretos escrita y aprobada por el líder técnico.
4. El frontend y los mocks del Sprint 1 conviven en el repositorio sin conflictos de estructura.

**DoD de la rama (Sprint 1):** estructura + convenciones + estrategia de entornos publicadas.

---

# Sprint 2 (semanas 3–4) — Entorno reproducible con Docker

**Objetivo de la rama:** un solo comando levanta backend (Java), base de datos (PostgreSQL) y frontend, con migraciones automáticas y arranque verificado en máquina nueva.

### HU-10 — Entorno reproducible (rama principal de esta HU)

**Prioridad:** Crítica · **5 PH** · **Responsable:** DevOps con LT

**Como** desarrollador, **quiero** levantar backend, base de datos y frontend con un solo comando **para** eliminar diferencias entre entornos y facilitar las pruebas.

**Criterios de aceptación:**

1. `docker compose up` levanta backend, PostgreSQL y frontend sin pasos manuales adicionales.
2. El proyecto Java compila y arranca con el comando documentado en el `README` raíz.
3. Las migraciones del esquema se ejecutan automáticamente al arrancar y son reproducibles desde cero.
4. La configuración usa variables de entorno; existe `.env.example` sin secretos reales.
5. `.gitignore` adecuado (secretos, `target/`, `node_modules`, volúmenes) y sin credenciales en el historial.
6. Un integrante nuevo sigue el `README` y consigue el entorno funcionando en menos de 30 minutos.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-10.1 | Inicializar repositorio con estructura backend/frontend/docs y convenciones de ramas (completar el adelanto del Sprint 1). | DevOps con LT | 3 h |
| TASK-10.3 | Configurar PostgreSQL en contenedor con migraciones automáticas (Flyway/Liquibase) al arrancar. | DevOps con BE | 6 h |
| TASK-10.4 | Crear `Dockerfile` (backend, frontend) y `docker-compose.yml` con healthchecks y dependencias ordenadas — **Docker (obligatoria)**. | DevOps con BE/FE | 6 h |
| TASK-10.5 | Crear `.env.example`, `.gitignore` y la guía de instalación rápida. | DevOps con DOC | 3 h |
| TASK-10.6 | Verificar arranque limpio en una máquina nueva y registrar evidencia (con QA). | DevOps con QA | 2 h |

**Criterios adicionales de la rama:**

* Los servicios esperan a sus dependencias (healthcheck + `depends_with_condition`); no hay carreras de arranque.
* Los perfiles de Spring (`local`, `test`) y los del frontend se cambian por variable de entorno, no por código.
* Los volúmenes de la base de datos están definidos y documentados (cómo persistir, cómo reiniciar limpio).

**Dependencias de otras ramas:** TASK-10.2 (Spring Boot — Backend), TASK-12.x (autenticación — Backend).

### Entregable del Sprint 2 (rama DevOps)

* Entorno Docker reproducible con base de datos migrada y guía de instalación.

### DoD de la rama (Sprint 2)

* Arranque limpio verificado desde cero con evidencia (TASK-10.6).
* Cero secretos en el repositorio.
* `docker compose down -v && docker compose up` deja el entorno como nuevo (prueba de reproducibilidad).

---

# Sprint 3 (semanas 5–6) — Volúmenes documentales y entorno de pruebas

**Objetivo de la rama:** proteger el almacenamiento de archivos y aislar el entorno de pruebas del de desarrollo.

**Tareas de esta rama:**

| TASK | HU | Descripción | Responsable | Estimación |
| --- | --- | --- | --- | --- |
| — | HU-17 | Definir el volumen/ubicación del **almacenamiento documental protegido** en el contenedor, con acceso restringido y sin servirse como archivos públicos. | DevOps con BE | 5 h |
| — | HU-17 | Documentar el respaldo y la eliminación de archivos de demostración (política de conservación del producto / MVP). | DevOps con DOC | 2 h |
| — | HU-15 a HU-18 | Preparar el **entorno de pruebas aislado** (datos semilla, base de datos reiniciable, sin datos del entorno de desarrollo). | DevOps con QA | 5 h |
| — | HU-16 | Verificar que las consultas de listado con 1.000 expedientes de prueba rinden aceptablemente en el entorno contenedor (sin N+1). | DevOps con BE/QA | 3 h |

**Criterios de aceptación del sprint para la rama:**

1. Los archivos subidos viven en un volumen con permisos de sistema operativo restringidos; no hay ruta pública.
2. El entorno de pruebas se levanta, reinicia y limpia de forma independiente al de desarrollo.
3. Los datos de prueba se generan con un comando documentado y son **siempre ficticios** (datos de clientes prohibidos en pruebas).
4. La instalación y el volumen documental quedan reflejados en la guía de instalación.

**DoD de la rama (Sprint 3):** volumen documental protegido + entorno de pruebas aislado verificado.

---

# Sprint 4 (semanas 7–8) — Persistencia de auditoría y logs

**Objetivo de la rama:** asegurar que la auditoría y los logs técnicos se persisten correctamente y no exponen datos.

**Tareas de esta rama:**

| TASK | HU | Descripción | Responsable | Estimación |
| --- | --- | --- | --- | --- |
| — | HU-22 | Definir volúmenes y política de retención de la **auditoría** (persistencia separada, sin rotura accidental). | DevOps con BE/LT | 4 h |
| — | HU-22 | Configurar la rotación y el nivel de los **logs técnicos** en contenedor, verificando que no contengan contraseñas, tokens ni datos personales. | DevOps con QA | 4 h |
| — | HU-14 | Verificar que los identificadores de correlación de error llegan a los logs y son consultables sin exponer el detalle sensible. | DevOps con BE | 2 h |
| — | — | Preparar I-18 (salud de las conexiones de interoperabilidad, antiguo monitoreo técnico) con los datos de infraestructura disponibles (errores, intentos fallidos, estado de servicios). | DevOps con FE/BE | 4 h |

**Criterios de aceptación del sprint para la rama:**

1. La auditoría sobrevive al reinicio de contenedores (volumen correcto).
2. Rotación de logs configurada y tamaño acotado.
3. Revisión de logs sin datos sensibles (apoyo a CP-11).
4. El estado de salud de los servicios es visible para el monitoreo.

**DoD de la rama (Sprint 4):** auditoría persistente verificada tras reinicio + logs revisados sin exposición.

---

# Sprint 5 (semanas 9–10) — Configuración de escenarios de interoperabilidad

**Objetivo de la rama:** que los mocks y sus escenarios se controlen por configuración, no por código.

**Tareas de esta rama:**

| TASK | HU | Descripción | Responsable | Estimación |
| --- | --- | --- | --- | --- |
| — | HU-08 | Parametrizar los mocks por variable de entorno: escenario activo (`X-Scenario` por defecto), latencia simulada y modo "lento/caído". | DevOps con BE | 5 h |
| — | HU-24 | Configurar por entorno los tiempos de espera, intentos de reintento y backoff de la orquestación de validaciones. | DevOps con BE | 3 h |
| — | HU-26 | Preparar el **entorno de demostración** con los escenarios necesarios para la ruta: `OK`, `SIN_RESULTADO`, `ERROR_TECNICO`, `TIMEOUT`. | DevOps con PO | 4 h |

**Criterios de aceptación del sprint para la rama:**

1. Cambiar de escenario de los mocks no requiere recompilar: solo configuración.
2. Las credenciales y claves de los mocks (si las hay) viven en variables de entorno.
3. Existe un perfil `demo` del `docker-compose` documentado, con los escenarios precargados.
4. El mismo perfil funciona en una máquina nueva.

**DoD de la rama (Sprint 5):** perfil de demostración documentado y verificado; escenarios conmutables por configuración.

---

# Sprint 6 (semanas 11–12) — Integración continua y entornos de calidad

**Objetivo de la rama:** automatizar la verificación y sostener las pruebas de **OWASP ZAP** y **Apache JMeter** con entornos estables.

**Tareas de esta rama:**

| TASK | HU | Descripción | Responsable | Estimación |
| --- | --- | --- | --- | --- |
| TASK-27.4 | HU-27 | Integrar la suite de pruebas en CI (Git) con **reporte de cobertura** y ejecución en contenedor — **Docker (obligatoria)**. | DevOps con LT | 5 h |
| — | HU-27 | Garantizar que la suite corre en menos de 10 minutos y sin dependencia de la red pública. | DevOps con QA | 3 h |
| — | HU-28 | Preparar el **entorno de análisis de OWASP ZAP**: datos, sesiones por rol, blacklist de acciones destructivas, servicios levantados y estables — **ZAP (obligatoria)**. | DevOps con QA | 4 h |
| — | HU-29 | Preparar el **entorno de pruebas de rendimiento**: datos de prueba volumétricos, recolección de CPU/memoria y **scripts de JMeter** — **JMeter (obligatoria)**. | DevOps con QA | 6 h |
| — | HU-29 | Ejecutar la prueba de indisponibilidad de una dependencia (detener un contenedor) y verificar que el sistema lo maneja sin caída. | DevOps con QA | 3 h |
| — | HU-27 a HU-30 | Conservar evidencias (informes ZAP/JMeter, cobertura) en `docs/evidencias/` versionado. | DevOps con DOC | 2 h |

**Criterios de aceptación del sprint para la rama:**

1. La CI ejecuta pruebas en cada integración y publica la cobertura; una rama roja bloquea la fusión.
2. El entorno de ZAP es reproducible: mismos datos y sesiones en cada escaneo.
3. El entorno de JMeter produce métricas de CPU/memoria además de latencia.
4. La caída de un contenedor no tumba el sistema completo y queda registrado.

**DoD de la rama (Sprint 6):** CI en verde con cobertura + entornos de ZAP y JMeter documentados y usados por QA.

---

# Sprint 7 (semanas 13–14) — Instalación limpia, empaquetado y demostración

**Objetivo de la rama:** certificar que la entrega funciona desde cero y dejarla empaquetada con su versión.

### HU-33 — Instalación limpia y empaquetado (rama principal de esta HU)

**Prioridad:** Crítica · **5 PH** · **Responsable:** LT con DevOps

**Como** evaluador, **quiero** instalar el proyecto desde cero siguiendo la documentación **para** comprobar que la entrega es reproducible.

**Criterios de aceptación:**

1. `git clone` + `docker compose up` levanta el sistema completo en una máquina limpia siguiendo solo el `README`.
2. Los datos semilla cargan correctamente y permiten entrar con los usuarios de demostración de cada rol.
3. No hay secretos, rutas absolutas ni dependencias locales no documentadas.
4. El recorrido principal de demostración funciona en la instalación limpia.
5. Se genera una etiqueta (tag) de versión en Git con el estado de la entrega.
6. Los pasos de verificación de la instalación limpia quedan documentados como evidencia.

**Tareas de esta rama:**

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-33.1 | Instalación limpia en máquina nueva con **Docker (obligatoria)** y registro de incidencias. | DevOps con QA | 4 h |
| TASK-33.2 | Corregir hallazgos de empaquetado: configuración, rutas, volúmenes, semillas, assets del frontend. | DevOps con BE/FE | 6 h |
| TASK-33.3 | Etiquetar la versión final (`git tag`) y preparar el paquete de entrega (código + documentación). | DevOps con LT | 3 h |
| TASK-33.4 | Verificar de nuevo la instalación tras las correcciones. | DevOps con QA | 3 h |

---

### Participación en HU-34 — Demostración y evaluación final

| TASK | Descripción | Responsable | Estimación |
| --- | --- | --- | --- |
| TASK-34.1 (parte infra) | Levantar y estabilizar el entorno de demostración con los datos ficticios y escenarios acordados. | DevOps con PO/BE | Incluido en 34.1 |
| TASK-34.2 | Apoyo en el ensayo: garantizar arranque, rendimiento y respaldo del entorno durante la presentación. | DevOps | 2 h |

### Entregables del Sprint 7 (rama DevOps)

* Instalación limpia certificada en dos pasadas.
* Versión etiquetada en Git y paquete de entrega preparado.
* Entorno de demostración estable.

### DoD de la rama (Sprint 7)

* Instalación limpia reproducible con evidencia (TASK-33.1 y TASK-33.4).
* Tag de versión creado y documentado.
* Ningún secreto ni ruta local no documentada en la entrega.

---

## 6. Resumen de carga de la rama DevOps

| Sprint | Tareas propias | Horas estimadas |
| --- | --- | --- |
| 1 | Estructura del repo, convenciones Git, estrategia de entornos/secretos, política de evidencias | ~11 h |
| 2 | TASK-10.1, 10.3, 10.4, 10.5, 10.6 | ~20 h |
| 3 | Volumen documental, entorno de pruebas aislado, verificación de listados | ~10 h |
| 4 | Auditoría persistente, rotación de logs, correlación, monitoreo | ~14 h |
| 5 | Escenarios de mocks por configuración, reintentos, perfil `demo` | ~12 h |
| 6 | CI con cobertura, entornos de ZAP y JMeter, prueba de caída, evidencias | ~23 h |
| 7 | TASK-33.1–33.4, apoyo a la demostración | ~18 h |

**Nota:** el trabajo de la rama se concentra en el Sprint 2 (contenedores) y el Sprint 6 (CI y entornos de calidad). En el resto de sprints es de soporte: si la capacidad escasea, las tareas de soporte pueden moverse dentro del mismo sprint, pero **nunca** las de instalación limpia ni las de preparación de ZAP/JMeter, porque bloquean la entrega.

---

## 7. Relación con las otras ramas

| Rama | Dependencia cruzada |
| --- | --- |
| Frontend | Los `Dockerfile` del frontend y su inclusión en el `docker-compose`; assets en la instalación limpia. |
| Backend | Compilación Java en contenedor, migraciones, volúmenes de datos y configuración de los mocks. |
| QA y Seguridad | Entornos estables y reproducibles para ZAP y JMeter; evidencias versionadas; CI con cobertura. |
| Producto y Documentación | Guía de instalación verificada, entorno de demostración y paquete de entrega final. |

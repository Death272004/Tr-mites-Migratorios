# Entrega Sprint 4 — Gestión avanzada del proyecto

**Curso:** Tópicos Especiales I — Ingeniería de Software IV · **Docente:** María Félix Mosquera
**Proyecto:** Plataforma de gestión de expedientes migratorios para bufetes de abogados (Panamá, Ley 81 de 2019)
**Ciclo del Sprint 4 (curso):** 9 – 18 de octubre de 2026 · **Fecha de entrega:** 18 de octubre de 2026, 23:59

> Corresponde a la sección **Sprint X** de la plantilla del Proyecto Integrador, completada con los seis bloques obligatorios del Sprint 4: Daily Scrum, mejora de historias, triple restricción, indicadores QA, impacto de la triple restricción y factura Neuronix.

---

## 1. Información del Equipo

**Caso asignado:** Integración de sistemas migratorios — gestión de trámites para bufetes de abogados.

| Integrante | Rol Scrum / rama | Evidencia en el repositorio |
| --- | --- | --- |
| Richard Rodriguez | Scrum Master (asistido por OpenCode) y Product Owner / Documentación | 6 commits: documentación de producto, HU-18c (ARCO), línea de tiempo TASK-21.2; registro de cambios del backlog |
| Jonath González (ionathh) | Dev Lead — Frontend/Full Stack | 27 commits: portal completo (fases A–D), integración frontend |
| Edgar Rosario | Dev Backend / Integración | 9 commits: HU-07/08/10/11–22, contrato OpenAPI, unión frontend–backend |
| Vivian Paris | QA Lead | Plan de pruebas (CP-01…CP-14), rama QA, seguimiento de defectos e indicadores |
| Kenneth Carter | DevOps / CI-CD Lead | Documentación de seguimiento, controles del repositorio y evidencia de integración |

**Ramas del repositorio:** `main`, `Frontend`, `Backend`, `QA`, `DevOps`, `DB`, `Documentacion` + ramas `feature/*` de integración.

---

## 2. Objetivo e incremento del Sprint 4

- **Objetivo del Sprint:** demostrar control del proyecto real: refinar historias de usuario, medir la calidad con indicadores y ajustar alcance, tiempo y recursos con criterio de ingeniería.
- **Incremento entregado en el ciclo:** portal ciudadano completo (27 pantallas navegables con fixtures y 4 estados), backend con autenticación, catálogos, expediente y auditoría (Spring Boot + PostgreSQL), contrato OpenAPI 0.2.0 y **entorno integrado frontend–backend en Docker con healthchecks en estado saludable**.
- **Evidencia de calidad:** 15 clases de prueba en el backend ejecutadas con resultado PASS; contrato de API versionado; 4 estados de interfaz por pantalla (carga, éxito, vacío, error con reintento).
- **Evidencia de seguridad:** 0 claves, tokens o credenciales reales en el repositorio (búsqueda automatizada en la revisión); datos únicamente ficticios; OTP (P-03) y MFA (I-01) simulados; sin enlaces públicos a documentos.
- **Evidencia de DevOps:** `docker compose config` PASS, construcción y healthchecks de los tres servicios (PostgreSQL, backend, frontend) PASS — *`docs/evidencias/sprint-1-verificacion-2026-10-12.md`*; `.gitignore` con protección de secretos y artefactos.
- **Métricas:** ver §5 y §6 (LOC/ELOC, defectos, esfuerzo, productividad, ISO/IEC 25010).
- **Retrospectiva (breve):** bien → integración verde y portal completo en 4 días hábiles; mal → el Review formal (Parcial 1) quedó programado para el 22 de octubre y la rama `main` desactualizada; mejorar → ejecutar ZAP/JMeter en cada ciclo y abrir PR hacia `main`.

---

## 3. Daily Scrum — las 3 preguntas (≈1 min)

**¿Qué hicimos?**
Cerramos el portal completo (fases A–D, P-01…P-27), la HU-18c de derechos ARCO en P-27 y la línea de tiempo (TASK-21.2); en backend entregamos HU-07 (contrato OpenAPI 0.1.0 → 0.2.0), HU-10 (entorno reproducible con Docker) y las HU-08 y HU-11 a HU-22; unimos frontend y backend en la rama de integración y verificamos healthchecks y pruebas PASS.

**¿Qué haremos?**
Conectar el asistente y el seguimiento a los endpoints (`TASK-15.3`, `TASK-16.3`, `TASK-17.4`), ejecutar las primeras mediciones de OWASP ZAP y Apache JMeter para consolidar los indicadores del Sprint 4 y cerrar la factura del sprint.

**¿Qué problemas tuvimos?**
Los módulos ES bloqueaban el frontend en `file://` (migrados a scripts clásicos, commit `ebdd27a`); permiso de ejecución de `mvnw` faltante (corregido `b8a1b91`); dependencia entre ramas por el contrato de API (mitigada con OpenAPI versionado); el Review formal (Parcial 1, Sprint 3) está pendiente para el 22 de octubre, por lo que trabajamos con revisión interna.

---

## 4. Mejora de Historias de Usuario (correcciones del Review)

> **Nota de proceso:** el **Sprint Review formal (Parcial 1, Sprint 3)** está programado con entrega hasta el 22 de octubre. Por ello, las correcciones de este Sprint 4 provienen de la **revisión interna del Sprint** (PO + equipo) aplicando los criterios de la plantilla: claridad de rol, necesidad y beneficio; criterios de aceptación más precisos; validaciones claras; reglas de negocio completas; trazabilidad y métricas. Las observaciones formales del Review se incorporarán en el **Sprint 5 (post Review #1)**, tal como lo requiere la profesora.

| HU | Corrección aplicada (antes → después) | Criterios de aceptación mejorados | Relación con la pregunta cuestionadora |
| --- | --- | --- | --- |
| **HU-06** | "Estudio de viabilidad de APIs institucionales" → **"Estudio del marco legal y fuentes de verificación"** | Matriz *fuente → tipo (PÚBLICA/AUTORIZADA) → qué se guarda (solo resultado) → base legal*; estados `VERIFICABLE HOY / REQUIERE AUTORIZACIÓN / PENDIENTE DE CONVENIO / NO APLICABLE`; validación de que no existen convenios ni APIs disponibles | Reduce documentos repetidos: define qué puede verificar el bufete sin pedir dos veces al cliente lo que ya es verificable |
| **HU-08** | "APIs ficticias (mocks)" → **"Fuentes de verificación simuladas (modo manual asistido)"** con CA-8 nueva | El registro manual produce la misma entidad que el modo simulado (mismo esquema JSON); cada verificación guarda **fuente, fecha, resultado y responsable**; error técnico ≠ resultado negativo | Trazabilidad del expediente: cada acción queda registrada con timestamp y responsable, evitando repeticiones y pérdidas de información |
| **HU-05** | Módulo interno **desplazado al inicio del Sprint 2** (registro de cambios RC-01) por capacidad del equipo | CA intactos; estados de verificación con modo manual asistido; responsable de cada verificación | Prioriza el portal del cliente para atacar primero el punto crítico: el cliente no repite información ya aportada |
| **HU-18b (nueva)** | Historia añadida para cumplir la Ley 81 de 2019 | Sin consentimiento vigente el tratamiento se limita a lo contractual; datos sensibles con **consentimiento expreso**; ver/revocar desde el portal; auditoría del evento | Evita rechazos y reprocesos por incumplimiento legal; el expediente avanza sin trabas de conformidad |
| **HU-18c (nueva)** | Historia de derechos ARCO con ciclo y plazos | Solicitud `RECIBIDA → EN_ATENCION → ATENDIDA/RECHAZADA` con alerta `FUERA_DE_PLAZO`; notificaciones sin datos del contenido; trazabilidad completa | El cliente confía y usa el canal propio: menos llamadas, correos y visitas repetidas al bufete |

**Componentes de CA presentes en todas las correcciones:** validaciones funcionales (vigencias 30/90 días, gate de completitud), reglas de seguridad (Ley 81, sin secretos, minimización), trazabilidad (HU → CP-01…CP-14 → pantalla P-/I-), métricas asociadas (100 % de verificaciones con fuente/fecha/responsable; 0 copias institucionales) y condiciones de éxito medibles (todas las rutas del inventario navegar; 0 defectos críticos abiertos).

---

## 5. Triple Restricción (Alcance – Tiempo – Recursos – Calidad)

| Dimensión | Compromiso del Sprint | Realidad del ciclo | Ajuste / decisión |
| --- | --- | --- | --- |
| **Alcance** | Portal P-01…P-27 + marco legal + mocks (HU-01…HU-09) | Portal completo (27 pantallas), backend HU-07/08/10/11–22, integración Docker | **Historias incluidas:** HU-01…HU-04, HU-06…HU-09, HU-18b/18c. **Postergadas:** HU-05 (módulo interno al inicio del Sprint 2), fase D con prioridad P-19/P-20/P-21/P-22 si no alcanza el tiempo, P-15/P-18/P-24/P-25 con reglas POR CONFIRMAR. **Justificación:** capacidad limitada y prioridad al problema crítico del cliente; cambios registrados en el *Registro de cambios del backlog* (RC-01, RC-02) |
| **Tiempo** | Capacidad del equipo: **≈150 h/sprint** (5 integrantes × 2 semanas × ~30 h productivas) | Ciclo real de desarrollo: **4 días hábiles (10–13 oct)**; 36 commits en la rama de integración (≈9 commits/día) | **Velocidad:** portal completo en 4 días + backend en paralelo. **Ajustes:** se descartó el Parcial 1 (carga académica) y la ejecución de JMeter/ZAP quedó para el inicio del siguiente ciclo; horas ejecutadas consolidadas en la factura (§9) |
| **Recursos** | 5 roles activos: PO/Frontend, 2 desarrolladores, DevOps, QA | **4 integrantes activos** en el ciclo (Jonath 25 commits, Edgar 9, Richard 2); QA con tareas programadas | **Herramientas:** JMeter, OWASP ZAP, Docker y Java (obligatorias del proyecto — con derechos de uso contratados en Neuronix, 200.000); OpenAPI, Postman, Git/GitHub. **Limitaciones:** sin convenios con instituciones (se trabaja con mocks y modo manual asistido); sin CI/CD aún; rama `main` desactualizada (base temporal `feature/hu-08-22-backend-sprints-1-4`). **Dependencias externas:** contrato de API entre frontend y backend; validación jurídica (Ley 81) pendiente |
| **Calidad (QA)** | Indicadores GQM + ISO/IEC 25010 aplicados al incremento | LOC/ELOC, defectos y pruebas medidos (§6); ZAP/JMeter programados | Decisiones: DoD con 4 estados por pantalla, pruebas backend antes de integrar, revisión de secretos en cada merge — ver §6–§8 |

---

## 6. Indicadores QA seleccionados (GQM + ISO/IEC 25010)

### 6.1 Enfoque GQM (Meta – Pregunta – Métrica)

| Meta | Pregunta | Métrica | Resultado inicial del Sprint 4 | Herramienta |
| --- | --- | --- | --- | --- |
| Medir el tamaño del incremento | ¿Cuánto código entregamos y qué proporción es ejecutable? | **LOC / ELOC** | **24.771 LOC** (Java 7.091 · JS 15.696 · HTML 256 · CSS 1.728) y **≈20.383 ELOC** (82,3 %) | Conteo de líneas (`find`/`wc`) con filtro de comentarios y vacías sobre la rama de integración |
| Evaluar la corrección | ¿Cuántos defectos aparecen y cuánto viven? | **Nº de defectos y edad** | **5 correcciones** en 45 commits (11 % de los commits fueron fix); **0 defectos abiertos**; edad ≤ 1 día (cierre el mismo día de detección según fechas de commits) | `git log` (commits `fix/*`) + seguimiento en GitHub |
| Conocer el esfuerzo | ¿Cuánto trabajo implica cada entrega? | **Esfuerzo (horas)** | Capacidad planificada 150 h; horas ejecutadas por tarea → **consolidadas en la factura (§9)** | Backlog (estimación por TASK) + factura del sprint |
| Evaluar la productividad | ¿Cuánto entregamos por unidad de tiempo? | Commits/día y HU cerradas | **36 commits en 4 días (≈9/día)**; portal completo (HU-01…HU-04, HU-09) + backend HU-07/08/10/11–22 | Git |
| Calidad de la integración | ¿El incremento funciona integrado? | Pruebas y healthchecks | **15 clases de prueba PASS**; 3 servicios Docker con healthcheck saludable; `docker compose config` PASS | JUnit + Docker (evidencia 2026-10-12) |
| Puntos de función | — | OFPUG | **No aplica en este ciclo:** no se cuentan transacciones funcionales completas (frontend estático + API); se evaluará con SonarQube si la docente lo requiere | — |

### 6.2 Indicadores ISO/IEC 25010 seleccionados y justificación

| Característica | ¿Por qué aplica a nuestro caso? | Cómo se mide en el Sprint 4 |
| --- | --- | --- |
| **Seguridad** | El sistema trata datos personales y sensibles de clientes de bufetes bajo la **Ley 81 de 2019** (consentimiento, minimización, bitácora) | Búsqueda de secretos en el repo (0 hallazgos); control por rol en rutas; OTP/MFA simulados; **OWASP ZAP** (programado) |
| **Adecuación funcional** | El incremento debe cubrir el inventario oficial de **45 pantallas** y los flujos del bufete | 27/27 pantallas del portal navegables con sus 4 estados; trazabilidad HU → CP → pantalla |
| **Compatibilidad** | El producto debe integrar frontend y backend hoy y **conectar con TE, CSS y Registro Público en el futuro** (capa de adaptadores) | Contrato **OpenAPI 0.2.0** versionado; integración FE–BE verificada con Postman y healthchecks |
| **Eficiencia de rendimiento** | La demostración al cliente exige respuestas fluidas en el portal y en I-07 | **Apache JMeter** (obligatorio): plan de pruebas de carga definido, primera corrida al inicio del siguiente ciclo |
| *No seleccionadas aún:* **Usabilidad** (evaluación con usuarios reales en el Sprint 6, guion TASK-30.2), **Mantenibilidad** (análisis estático con SonarQube cuando exista CI), **Confiabilidad** (parcialmente cubierta por healthchecks; métrica completa con cobertura de pruebas) | | |

*Justificación tipo del curso: "Para este proyecto usamos **Seguridad, Adecuación funcional, Compatibilidad y Eficiencia de rendimiento** porque el sistema gestiona datos sensibles de clientes bajo Ley 81, debe cubrir 45 pantallas del inventario y está previsto para interoperar con TE, CSS y Registro Público cuando exista convenio."*

---

## 7. Aplicación de los indicadores QA al Sprint 4

| Indicador | Cómo se mide | Herramienta | Resultado inicial (Sprint 4) | Interpretación técnica |
| --- | --- | --- | --- | --- |
| LOC / ELOC | Conteo de líneas totales y ejecutables por lenguaje | `find`/`wc` + filtro de comentarios | 24.771 LOC / 20.383 ELOC | El 82 % de líneas son ejecutables: buena densidad; el JS (63 % del total) refleja el peso del frontend sin frameworks — riesgo de mantenibilidad a vigilar con SonarQube |
| Defectos | Commits con prefijo `fix`/`correc` sobre el total | `git log --all` | 5 de 45 commits (11 %); 0 abiertos | Correcciones puntuales y tempranas (migración de ES modules, tablas, permisos); al no existir aún pruebas automatizadas del frontend, este conteo es una aproximación y se reforzará con Cypress en QA |
| Edad de los defectos | Detección → cierre | Fechas de commits | ≤ 1 día; 0 con antigüedad mayor a un sprint | Los defectos no se acumulan entre ciclos: factor positivo para la confiabilidad |
| Esfuerzo | Horas estimadas vs. ejecutadas por tarea | Backlog + factura | Capacidad 150 h; ejecutado → factura §9 | Permite calcular velocidad real para planificar el siguiente sprint |
| Productividad | Commits/día y HU cerradas por ciclo | Git | ≈9 commits/día en 4 días; 5 HU grandes cerradas | Ritmo alto por trabajo en paralelo (frontend + backend); sostenibilidad a vigilar en sprints siguientes |
| Integridad/pruebas | Suites de prueba y healthchecks | JUnit + Docker | 15 clases de prueba PASS; 3 servicios saludables | El incremento integrado funciona: base para conectar el asistente en el siguiente ciclo |
| Seguridad (inicial) | Búsqueda de claves/secretos + control de acceso | Scripts de revisión + reglas del repositorio | 0 secretos; rutas protegidas por rol | Higiene inicial correcta; el resultado real de OWASP ZAP (Top 10) queda para el siguiente ciclo |
| Rendimiento (inicial) | Tiempos de respuesta bajo carga | **Apache JMeter** | En ejecución (plan definido) | Sin números aún: se reporta en el siguiente sprint frente a los umbrales del plan de pruebas |

---

## 8. Impacto de la Triple Restricción en el Sprint 4

- **¿Qué historias se ajustaron por tiempo?** HU-05 (módulo interno I-01…I-18) movida al inicio del Sprint 2; en la fase D del portal se estableció la prioridad P-19 → P-22 con regla de recorte para P-26/P-27. Todo registrado en el *Registro de cambios del backlog* (RC-01).
- **¿Qué tareas se movieron por recursos?** El backend agrupó HU-08 y HU-11…HU-22 en un solo lote de entrega (`e6818d3`) para desbloquear la integración con el frontend; las tareas de QA de seguridad (ZAP/JMeter, TASK-28.x/29.x) se programaron para el inicio del siguiente ciclo al no haber QA activo en el ciclo.
- **¿Qué decisiones se tomaron para proteger la calidad?** Base temporal de integración con controles verificados antes de merge (evidencia del 2026-10-12: formato, secretos, sintaxis, pruebas y docker PASS); DoD que exige los 4 estados por pantalla; contrato de API versionado (0.1.0 → 0.2.0) en lugar de acoplamiento improvisado.
- **¿Qué riesgos se mitigaron?** (1) Frontend que no abría en `file://` → migración a scripts clásicos; (2) entorno no reproducible → Docker con healthchecks; (3) subida de secretos → `.gitignore` + búsqueda automatizada; (4) promesa de integración institucional sin convenio → modelo de verificación manual asistida (RC-02). **Riesgo abierto:** `main` desactualizada → pendiente el PR con revisión entre pares.

---

## 9. Factura Sprint 4 — Pago en Neuronix

| Campo | Contenido |
| --- | --- |
| **Sprint trabajado** | Sprint 4 del curso — "Mejora de historias + triple restricción + indicadores QA" (9–18 oct 2026) |
| **Historias corregidas** | HU-05, HU-06, HU-08 (correcciones de alcance y CA) + HU-18b y HU-18c (nuevas: consentimiento informado y derechos ARCO) |
| **Indicadores QA aplicados** | GQM: LOC/ELOC (24.771/20.383), defectos (5, 0 abiertos, edad ≤1 día), esfuerzo, productividad (≈9 commits/día), integridad. ISO/IEC 25010: Seguridad, Adecuación funcional, Compatibilidad, Eficiencia de rendimiento |
| **Triple restricción presentada** | §5 — alcance ajustado con RC-01/RC-02, capacidad 150 h/sprint, 4 roles activos, calidad vía DoD + pruebas + revisión de secretos |
| **Evidencias técnicas** | Commits `19bd5a2` (integración FE–BE), `e6818d3` (HU backend 1–4), `d1ebb21`/`2bfd558` (TASK-21.2), `8a970fa` (HU-18c), evidencia `docs/evidencias/sprint-1-verificacion-2026-10-12.md`, contrato `openapi.yaml` 0.2.0 |
| **Roles involucrados** | Scrum Master (asistido por IA), Product Owner, Dev Lead, Dev Backend/Integración, QA Lead, DevOps/CI-CD Lead |
| **Presupuesto del grupo (Neuronix)** | 1.000.000 disponibles |
| **Ejecutado — compra del proyecto (Sprints 0–3)** | 350.000 |
| **Ejecutado — derechos de uso de herramientas** | 200.000 (Apache JMeter, OWASP ZAP, Docker, Java) |
| **Total ejecutado** | 550.000 |
| **Saldo disponible antes de este sprint** | 450.000 |
| **Horas estimadas** | 48 h (equipo de 5 integrantes en el ciclo 10–18 oct) |
| **Valor del Sprint 4 en Neuronix** | **150.000** (saldo restante para los sprints 5 y 6: 300.000) |

*Sin factura no hay pago; los campos marcados POR CONFIRMAR deben completarse antes de subirla.*

---

## 10. Coherencia con la pregunta cuestionadora del cliente

> *"Los clientes repiten documentos y los trámites tardan de 3 a 8 meses."*

- **HU-06/HU-08** mejoradas → cada verificación queda registrada con **fuente, fecha, resultado y responsable**: el bufete nunca vuelve a pedir algo ya verificado (anti-duplicación con trazabilidad).
- **HU-18b** → sin consentimiento no hay reprocesos legales: el expediente avanza sin rechazos por conformidad.
- **HU-18c** → el cliente resuelve sus solicitudes por el portal: menos idas y vueltas.
- **HU-05 postergada** → decisión de triple restricción: primero el cliente (portal), después el despacho, sin perder calidad (DoD intacto).

---

*Fuentes: `05-backlog-siete-sprints.md` (registro de cambios, HU, capacidad), `07-marco-legal-y-matriz-fuentes-verificacion.md`, `Rama-04-Producto-Documentacion.md`, `docs/evidencias/sprint-1-verificacion-2026-10-12.md`, historial de Git (ramas `Frontend`, `Backend`, `integracion/frontend-backend`). Métricas calculadas sobre el árbol de `origin/integracion/frontend-backend` (2026-10-18).*

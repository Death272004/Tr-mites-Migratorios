# Guion Comercial y Storytelling en Vivo — Sustentación Final (15 Minutos)

- **Formato:** Examen Final / Cierre Comercial Semestral (Martes 1 y Jueves 3 de diciembre de 2026)
- **Duración estricta:** `15:00 minutos` (`3 láminas` de apoyo en [`Presentacion_Sprint_Final.pptx`](Presentacion_Sprint_Final.pptx) + demostración en vivo sobre `http://tramites.tr-utp.com` y `http://correo.tr-utp.com`)
- **Objetivo:** Demostrar que la **Plataforma Interoperable de Trámites Migratorios** resuelve el caso *Trámites Migratorios Lentos* y está lista para producción, operación institucional y venta comercial por **946,948 Neuronix**.

---

## 0. Checklist Técnico Pre-Presentación (5 minutos antes de exponer)

1. Confirmar los 6 contenedores arriba con `docker ps` (o `./configurarDominioLocal.sh`):
   - `frontend` en `http://tramites.tr-utp.com` (respaldo `http://localhost:8080`) saludable.
   - `webmail` (Roundcube) en `http://correo.tr-utp.com` (respaldo `http://localhost:8081`).
   - `backend`, `db` (`5433`), `mailserver` y `mail-provisioner` saludables.
2. Verificar que en `docker-compose.yml` estén activos `SPRING_PROFILES_ACTIVE=demo` y `DEMO_AUTOCOMPLETAR=true` para disponer del autocompletado rápido de roles en vivo (ver referencia de cuentas en [`../usuarios-proyecto.md`](../usuarios-proyecto.md)).
3. Abrir únicamente **3 pestañas** en el navegador a pantalla completa:
   - Pestaña 1: `http://tramites.tr-utp.com` (Portal Ciudadano / Acceso).
   - Pestaña 2: `http://correo.tr-utp.com` (Webmail Roundcube para mostrar correo SMTP real en vivo).
   - Pestaña 3: `http://tramites.tr-utp.com/#/verificar` (o acceso directo al verificador público de expedientes).
4. Tener abierto [`Presentacion_Sprint_Final.pptx`](Presentacion_Sprint_Final.pptx) en las **3 únicas diapositivas** permitidas:
   - **Diapositiva 1:** Portada Semestral.
   - **Diapositiva 2:** Triple Restricción Global (Alcance, Tiempo, Recursos, Calidad).
   - **Diapositiva 3:** Factura Consolidada Sprint Final (Sprints 8, 9 y 10) y Total General.

---

## 1. Distribución de Tiempo y Participación (5 Integrantes)

| Bloque | Tiempo | Responsable | Recurso Visual | Foco del Relato (*Storytelling*) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Apertura y Problema Real** | `0:00 – 2:00` (2 min) | **Richard Rodríguez (PO)** | **Diapositiva 1** | Historia de "Carlos", solicitante afectado por trámites lentos, filas y pérdida documental; propuesta de valor y continuidad del equipo. |
| **2. Experiencia Ciudadana en Vivo** | `2:00 – 5:30` (3.5 min) | **Daniela Anaya (Frontend/UX)** | **App `:8080` + Webmail `:8081`** | Login ciudadano 1 clic (`DEMO_AUTOCOMPLETAR`), creación de trámite digital, carga documental, agenda de cita y correo real recibido en Roundcube. |
| **3. Operación del Funcionario y Verificación** | `5:30 – 9:00` (3.5 min) | **Jonathan Quinto (Backend/Sec)** | **App `:8080`** | Consola del funcionario, interoperabilidad con fuentes externas simuladas, máquina de 12 estados, transición protegida JWT/RBAC y verificación pública por código sin exponer datos personales. |
| **4. Administración, Calidad QA y DevOps** | `9:00 – 12:00` (3 min) | **Edwin Cisnero (QA) & Javier Pravia (DevOps)** | **App `:8080` + Diapositiva 2** | Auditoría Ley 81 en panel Admin, métricas reales (`38,570 LOC / 32,089 ELOC`, `156/156` pruebas Maven, `10/10` flujos live HTTP), arquitectura Docker 6 servicios y Triple Restricción Global. |
| **5. Modelo Comercial, Factura y Cierre** | `12:00 – 15:00` (3 min) | **Richard Rodríguez (PO)** | **Diapositiva 3** | Retorno de inversión institucional, desglose transparente de **73,272 Neuronix** (Sprint Final S8–10), **396,948 N** consultoría S0–10 y cierre de venta por **946,948 Neuronix**. |

---

## 2. Guion Detallado Minuto a Minuto

### Bloque 1 · Apertura Comercial y Storytelling del Problema (`0:00 – 2:00`) — Richard Rodríguez (PO)
- **En pantalla:** **Diapositiva 1 (Portada)** — máximo 2 minutos en total para contexto + hook comercial.
- **Discurso guía:**
  > *"Buenas tardes. Hoy no venimos solo a presentar código de diez sprints; venimos a cerrar la entrega comercial de una solución para un problema que cuesta millones en horas perdidas: **los trámites migratorios lentos**.*
  >
  > *Imaginen a un ciudadano solicitando un permiso migratorio bajo el esquema tradicional: tres filas presenciales, copias en papel que se extravían entre oficinas, incertidumbre total sobre el estado de su expediente y cero trazabilidad cuando alguien pregunta quién tocó un documento.*
  >
  > *Durante 11 iteraciones continuas (Sprints 0 al 10, manteniendo continuidad total de PO y equipo consultor hasta este examen final), transformamos ese cuello de botella en una **Plataforma Interoperable de Trámites Migratorios** lista para operar hoy mismo en cualquier entidad pública o privada."*

---

### Bloque 2 · El Viaje del Ciudadano en Vivo (`2:00 – 5:30`) — Daniela Anaya (Frontend & UX)
- **En pantalla:** **Navegador en `http://tramites.tr-utp.com`** (o `:8080`) -> luego **`http://correo.tr-utp.com`** (o `:8081`).
- **Pasos en vivo:**
  1. Mostrar la pantalla de acceso y usar la ayuda del perfil demo (`DEMO_AUTOCOMPLETAR` para rol **Ciudadano**) destacando que en producción esta ayuda se desactiva mediante variable de entorno sin cambiar código.
  2. Crear una solicitud migratoria en vivo completando los campos obligatorios y adjuntar un documento de prueba.
  3. Mostrar el folio generado al instante y agendar una cita presencial seleccionando oficina y franja horaria disponible (mostrando cómo la plataforma bloquea sobrecupos).
  4. Cambiar a la **Pestaña 2 (`http://correo.tr-utp.com`, Roundcube)** y refrescar la bandeja para evidenciar en vivo que el backend emitió una **notificación SMTP real** con el comprobante del trámite/cita.
- **Frase clave de cierre del bloque:**
  > *"En menos de tres minutos, lo que antes tomaba dos visitas presenciales quedó registrado, validado y notificado por correo electrónico real con comprobante único para el ciudadano."*

---

### Bloque 3 · Control Operativo del Funcionario, Seguridad e Interoperabilidad (`5:30 – 9:00`) — Jonathan Quinto (Backend & Seguridad)
- **En pantalla:** **Navegador en `http://localhost:8080`** (cerrar sesión ciudadano e iniciar con rol **Funcionario** vía `DEMO_AUTOCOMPLETAR`).
- **Pasos en vivo:**
  1. Abrir la bandeja del funcionario y localizar el expediente recién creado en el Bloque 2.
  2. Ejecutar la consulta de interoperabilidad contra fuentes externas simuladas (verificada contractualmente bajo **OpenAPI v0.5.0**: `35` rutas y `43` operaciones).
  3. Avanzar el expediente dentro de la **máquina de 12 estados** (por ejemplo, de recepción/revisión hacia aprobación o emisión), explicando brevemente cómo el backend impide saltos inválidos de estado y valida permisos JWT/RBAC en cada petición.
  4. Abrir el módulo de **Verificación Pública** e ingresar el código de verificación del trámite: demostrar que un tercero o empleador puede confirmar autenticidad y vigencia del trámite **sin exponer datos personales sensibles** (cumplimiento **Ley 81**).
- **Frase clave de cierre del bloque:**
  > *"Cada cambio de estado queda protegido por firma JWT, segregado por rol y respaldado por una arquitectura de puertos desacoplada: reemplazar una fuente simulada por un registro civil o migratorio real no requiere reescribir el sistema."*

---

### Bloque 4 · Gobierno Técnico, QA y Triple Restricción (`9:00 – 12:00`) — Edwin Cisnero (QA) & Javier Pravia (DevOps)
- **En pantalla:** **Vista Administrador en `http://localhost:8080` (30 s)** -> **Diapositiva 2 (Triple Restricción)**.
- **Pasos en vivo y defensa de ingeniería:**
  1. **Edwin Cisnero (QA — 1.5 min):**
     - Mostrar rápidamente el panel de **Auditoría (Ley 81)** con la bitácora del trámite ejecutado minutos antes (quién consultó, cuándo y qué estado cambió).
     - En **Diapositiva 2**, explicar **Calidad** y **Alcance** con métricas reales medidas: base de **`38,570 LOC` / `32,089 ELOC`** en `333` archivos, **`15` hallazgos corregidos** en la recta final (`S-01..S-09` de seguridad y `F-01..F-06` funcionales), **`156/156` pruebas backend Maven en verde**, **`6/6` pruebas contractuales OpenAPI** y **`10/10` casos críticos HTTP** (`CP-01..CP-09, CP-12`) comprobados directamente contra el entorno en vivo.
  2. **Javier Pravia (DevOps — 1.5 min):**
     - Explicar **Tiempo** y **Recursos** en **Diapositiva 2**: consolidación de Sprints 8, 9 y 10 en el Sprint Final (`130 h` de consultoría), anulación de cambio de PO para sostener velocidad y operación completa autocontenida en **6 contenedores Docker Compose** (`frontend`, `backend`, `db PostgreSQL` con **19 migraciones Flyway `V1–V19`**, `mailserver`, `mail-provisioner` y `webmail`).
     - Destacar riesgos mitigados: cero drift entre esquema SQL, OpenAPI y frontend; aislamiento de credenciales demo por perfil.

---

### Bloque 5 · Facturación Consolidada, Retorno y Cierre de Venta (`12:00 – 15:00`) — Richard Rodríguez (PO)
- **En pantalla:** **Diapositiva 3 (Factura Consolidada Sprint Final y Total General)**.
- **Discurso guía:**
  > *"Para cerrar la propuesta comercial, presentamos la estructura financiera transparente de todo el ciclo de vida del proyecto:*
  > 1. *En este **Sprint Final (Sprints 8, 9 y 10 consolidados)** ejecutamos **130 horas** a tarifa de `412 N/h` (`53,560 N`), más `7,500 N` de gastos operativos (`61,060 N` base) y un margen empresarial del `20%` (`12,212 N`), dando una factura de cierre de **73,272 Neuronix** (`S8: 25,248 N + S9: 22,776 N + S10: 25,248 N`).*
  > 2. *Sumando los **Sprints 0–6** (`268,414 N` según factura histórica consolidada) y el **Sprint 7** (`55,262 N`), la consultoría completa de los 11 sprints totaliza **396,948 Neuronix**.*
  > 3. *Agregando la adquisición inicial del proyecto (`350,000 N`) y herramientas (`200,000 N`), el **Total General de Venta es 946,948 Neuronix**.*
  > *Por ese monto el cliente no adquiere un prototipo: adquiere una plataforma interoperable empaquetada en Docker, con `38,570` líneas auditadas, correo SMTP real, `156` pruebas automatizadas y lista para ponerse en producción hoy mismo. Estamos atentos a sus preguntas."*

---

## 3. Plan de Contingencia Durante los 15 Minutos (Si ocurre algún imprevisto)

- **Si demora en cargar Roundcube (`:8081`):** No esperar más de 10 segundos; mostrar el código de verificación emitido directamente en pantalla del ciudadano/funcionario y continuar con el Bloque 3 mientras termina de refrescar.
- **Si un dato ya existía en demo:** Cambiar el número de documento o correo de prueba (o utilizar el botón `DEMO_AUTOCOMPLETAR` de respaldo) para crear un expediente limpio en menos de 15 segundos.
- **Regla de oro de tiempo:** Si el Bloque 2 o 3 supera los `9:30 minutos` del reloj global, **Edwin y Javier resumen Diapositiva 2 en 2 minutos** para garantizar que Richard disponga de al menos **2:30 minutos completos** en **Diapositiva 3 (Factura y Cierre)**, que es requisito obligatorio del Examen Final.

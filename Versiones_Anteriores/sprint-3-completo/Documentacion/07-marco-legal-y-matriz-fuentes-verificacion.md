# Marco legal y matriz de fuentes de verificación

**Entregable de la HU-06 (Sprint 1)** — *Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá* — producto de gestión de expedientes migratorios para **bufetes de abogados**.

| Campo | Valor |
| --- | --- |
| Historia asociada | HU-06 — *Estudio del marco legal y fuentes de verificación* (`05-backlog-siete-sprints.md`) |
| Responsable | Product Owner con apoyo jurídico externo (validación pendiente, §13) |
| Estado | BORRADOR PARA VALIDACIÓN JURÍDICA |
| Fuentes | `Pantallas_y_Datos_Migracion.md` (§1, §7, §8), `Intercambio_Informacion_Instituciones_Migratorias.md`, `ley-81-de-26-de-marzo-de-2019-sobre-proteccion-de-datos-personales.md`, `03-plan-de-desarrollo.md` (§3.6–3.7), `06-roles-y-accesos.md` |

> **Aviso:** este documento es técnico-funcional y no constituye asesoría jurídica. Las decisiones marcadas como *pendiente de validación jurídica* (§13) deben confirmarse con un abogado local antes del primer despliegue.

---

## 1. Propósito y alcance

Este documento define **cómo verifica el bufete la información de un expediente sin depender de integraciones institucionales**, cumpliendo la Ley 81 de 2019 de protección de datos personales. Es la referencia obligatoria para:

1. El diseño de las pantallas y la capa de verificación (HU-08, HU-23, HU-24, HU-26).
2. El modelo de datos de *Verificación*, *Resultado de verificación*, *Consentimiento* y *Solicitud ARCO* (HU-11, HU-18b, HU-18c).
3. Las pruebas de cumplimiento legal (CP-13 y CP-14 del `04-plan-de-pruebas.md`).
4. Las prohibiciones y eventos de auditoría de `06-roles-y-accesos.md` (§6.8 y §6.9).

**Regla central:** la plataforma **nunca recibe transferencias automáticas de datos de instituciones gubernamentales**. Registra (a) los documentos aportados por el cliente u obtenidos por el despacho con autorización, y (b) el **resultado mínimo de cada verificación** (fuente, fecha, resultado, responsable). La automatización futura queda como evolución sujeta a convenios (§10).

---

## 2. Marco legal aplicable

| Norma | Aplicación al producto |
| --- | --- |
| **Ley 81 de 2019** (protección de datos personales) | Principios de licitud, finalidad, proporcionalidad, calidad, seguridad, confidencialidad y transparencia; derechos ARCO; consentimiento como base jurídica; tratamiento reforzado de datos sensibles; conservación y eliminación por plazo legal. |
| **Decreto Ejecutivo 285 de 2021** | Reglamentación de la Ley 81: requisitos operativos del consentimiento, seguridad y ejercicio de derechos. |
| **ANTAI** | Orientación sobre principios y obligaciones de finalidad, seguridad y confidencialidad (fuente: `Intercambio_Informacion_Instituciones_Migratorias.md` §5). |
| **Secreto profesional del abogado** | El expediente del cliente está amparado por el deber de confidencialidad del despacho: acceso por expediente, acuerdos de confidencialidad y control de terceros. *Pendiente de validación jurídica (§13.2).* |
| **Alojamiento de datos** | Preferiblemente bajo jurisdicción panameña o con garantías equivalentes; acuerdo de tratamiento de datos con el proveedor de plataforma y de hosting (§13.4). |

---

## 3. Principios operativos del producto

1. **Sin transferencias automáticas.** La plataforma no consulta, recibe ni almacena flujos electrónicos de instituciones mientras no exista convenio y autorización.
2. **Resultado mínimo.** De cada verificación solo se guarda: fuente, tipo, modo, fecha, resultado, referencia técnica y responsable. **Nunca una copia del dato institucional.**
3. **Consentimiento informado.** Sin consentimiento vigente del titular, el tratamiento se limita a lo estrictamente necesario para la relación contractual (regla 11, `03-plan-de-desarrollo.md` §3.7).
4. **Finalidad determinada.** Los datos se usan solo para el trámite en curso; ninguna reutilización para otra finalidad.
5. **Minimización.** Los formularios solo piden los campos que el trámite exige legalmente (Pantallas §7.3).
6. **Trazabilidad.** Toda verificación, consentimiento y ejercicio de ARCO queda en bitácora inmutable (I-16).
7. **Decisión humana.** El sistema nunca sustituye la evaluación ni la resolución del profesional (Pantallas §7.3, flujo de verificación).

---

## 4. Matriz de fuentes de verificación

Estados posibles: `VERIFICABLE HOY` · `REQUIERE AUTORIZACIÓN` · `PENDIENTE DE CONVENIO` · `NO APLICABLE`.

| # | Fuente | Tipo de acceso | Modo actual (MVP) | Qué se guarda en la plataforma | Base legal | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **Tribunal Electoral — verificación de cédula** | Público (servicio de verificación de identidad) | Manual asistido: el despacho verifica y registra resultado | Resultado (coincide/no coincide), fuente, fecha, responsable | Verificación de dato público; consentimiento para el resto del expediente | `VERIFICABLE HOY` |
| 2 | **Tribunal Electoral — Registro Civil (certificados)** | Con autorización del titular | El cliente aporta el certificado; el despacho registra recepción y vigencia | Documento en el expediente + estado de verificación | Consentimiento informado + autorización expresa | `REQUIERE AUTORIZACIÓN` |
| 3 | **Registro Público — consultas públicas registrales** (sociedades, representantes legales, gravámenes) | Público | Manual asistido: el despacho consulta y registra referencia | Referencia de la consulta, fuente, fecha, resultado, responsable | Dato de acceso público | `VERIFICABLE HOY` |
| 4 | **Caja de Seguro Social — ficha de afiliación / cuenta** | Con autorización del titular | El cliente obtiene la ficha; el despacho registra recepción y vigencia (90 días, 9 cuotas, notariada) | Documento en el expediente + estado | Consentimiento **expreso** (dato de salud/afiliación) | `REQUIERE AUTORIZACIÓN` |
| 5 | **Servicio Nacional de Migración — procedimientos oficiales** (presentación, carnés, resoluciones) | El despacho sigue el procedimiento oficial del SNM | Gestión del expediente y registro de actos del trámite | Documentos del trámite y estados del expediente | Ejecución del trámite; ningún dato se obtiene vía integración | `NO APLICABLE` (sin integración; el SNM es fuente de las decisiones, no de datos electrónicos para el bufete) |
| 6 | **Documentos del exterior** (antecedentes penales, partidas, cartas) — apostilla/legalización y tránsito por Relaciones Exteriores | Con autorización del titular | El cliente los obtiene y aporta; el despacho registra vigencia y legalización | Documento en el expediente + estado + vigencia | Consentimiento informado | `REQUIERE AUTORIZACIÓN` |
| 7 | **AIG — Plataforma de Interoperabilidad Estatal** (acuerdo de 2012: SNM, TE, Registro Público) | Solo con convenio y autorización | **No se usa.** Los mocks del HU-08 representan esta vía futura | Nada en el MVP | Convenio institucional + autorización expresa | `PENDIENTE DE CONVENIO` |
| 8 | **Cualquier otra institución** | — | — | — | — | `NO APLICABLE` |

**Reglas de la matriz:**

- Cada fila se implementa hoy como **verificación manual asistida** (§6): un humano del despacho hace la consulta/obtención y registra el resultado con su identidad.
- El modo simulado de los mocks (HU-08) corresponde únicamente a la fila 7, para demostración y conexión del frontend hasta que exista convenio.
- Si una fuente cambia de estado, el cambio se registra en el *Registro de cambios del backlog* y se actualiza este documento.

---

## 5. Flujo de verificación manual asistida

```
Expediente con requisitos del trámite (P-14 / I-04)
        │
        ▼
El sistema lista verificaciones pendientes por tipo de documento y vigencia
        │
        ▼
El despacho realiza la consulta/obtención por la vía oficial correspondiente
        │
        ▼
Registro del resultado (I-07): fuente · tipo · modo=MANUAL · fecha · resultado mínimo · referencia · responsable
        │
        ├── resultado positivo → requisito verificado en el expediente
        ├── inconsistencia → observación al cliente (P-20 / I-08)
        └── error técnico → estado ERROR_TECNICO (no es resultado negativo; reintento)
```

**Campos del registro de verificación** (entidad *Verificación*, HU-11/HU-24): `expediente`, `fuente`, `tipo_de_verificacion`, `modo` (`MANUAL_ASISTIDO` | `SIMULADO`), `estado` (`PENDIENTE`, `EN_ATENCION`, `ENVIADA`, `RESPONDIDA`, `SIN_RESULTADO`, `ERROR_TECNICO`, `REINTENTO_PROGRAMADO`), `fecha_solicitud`, `fecha_resultado`, `resultado_minimo`, `referencia_origen`, `responsable`, `nota`.

---

## 6. Modelo de consentimiento informado (HU-18b)

Contenido mínimo del registro de consentimiento:

1. Identidad del titular y del representante (cuando aplique, con autorización acreditada).
2. **Finalidad determinada** (el trámite concreto; una finalidad por consentimiento).
3. **Alcance**: listado de categorías de datos y documentos cubiertos.
4. **Base legal**: consentimiento informado + contrato de servicios.
5. Vigencia y condiciones de revocación (el titular puede revocar desde el portal, P-05).
6. **Consentimiento expreso separado** para datos sensibles: datos de salud (ficha CSS) y antecedentes penales.
7. Trazabilidad: fecha, canal y responsable de la captura; evento en bitácora (§6.8 de `06-roles-y-accesos.md`).

Regla operativa: **sin consentimiento vigente, el sistema limita el tratamiento a lo estrictamente contractual** y bloquea la carga de documentos fuera de alcance.

---

## 7. Datos sensibles

| Categoría | Ejemplos en el producto | Control adicional |
| --- | --- | --- |
| Salud | Ficha CSS, exámenes médicos | Consentimiento expreso, cifrado en reposo, acceso restringido por expediente, bitácora de consulta |
| Antecedentes penales | Certificados de antecedentes | Consentimiento expreso, vigencia 30 días, cifrado, acceso por función |
| Datos de menores (dependientes) | Hijos en P-13 | Representación legal del titular, minimización estricta |

---

## 8. Derechos ARCO (HU-18c)

- Canal de entrada: portal del cliente (P-27) → entidad *Solicitud ARCO* (`tipo`: acceso, rectificación, actualización, supresión, oposición).
- Ciclo: `RECIBIDA → EN_ATENCION → ATENDIDA | RECHAZADA` con **plazo legal** y alerta `FUERA_DE_PLAZO`.
- El despacho atiende; la auditoría del despacho (AUDITOR) revisa; los eventos quedan en bitácora.
- Las notificaciones al cliente **no exponen el contenido** de los datos (solo estado de la solicitud).

---

## 9. Conservación y baja

- Los datos del expediente se conservan según las obligaciones legales del trámite y luego se eliminan (Pantallas §7.3).
- La baja de cuentas conserva la bitácora de auditoría sin datos personales identificables más allá de lo exigido.
- Los entornos de pruebas y CI usan **solo datos ficticios** (`Rama-05-DevOps.md`).

---

## 10. Camino futuro de interoperabilidad (fila 7 de la matriz)

Antecedente: en 2012, SNM, Tribunal Electoral y Registro Público firmaron un acuerdo con la AIG para impulsar el intercambio vía la Plataforma de Interoperabilidad Estatal (`Intercambio_Informacion_Instituciones_Migratorias.md` §1). **Ese es el único camino legítimo a la automatización** y no depende del bufete.

Requisitos para activar el modo automático (sin rehacer el sistema — HU-23/HU-24/HU-26):

1. Convenio o autorización institucional que cubra al despacho y a la plataforma.
2. Definición de interfaz (servicio web/API autenticada, respuesta estructurada).
3. Medidas de seguridad: cifrado en tránsito, autenticación, permisos por función y registro de consultas (Pantallas §7.3).
4. Minimización: solo los campos autorizados por finalidad.
5. Actualización de este documento y registro de cambios en el backlog.

Hasta entonces, **está prohibido prometer, simular públicamente como real o declarar acceso automático a datos institucionales** (`06-roles-y-accesos.md` §6.9, prohibición 9).

---

## 11. Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Prometer integraciones sin convenio | Venta y documentación basadas en verificación manual asistida + capa preparada; prohibición §6.9(9) |
| Incumplimiento de la Ley 81 | Consentimiento registrado, minimización, bitácora, validación jurídica antes del primer cliente |
| Custodia de datos sensibles | Cifrado en tránsito y reposo, MFA (I-01), acceso por función, bitácora inmutable |
| Confidencialidad profesional | Acceso por expediente, acuerdos de confidencialidad del personal, sin exportaciones masivas |
| Vigencias vencidas usadas por error | Control de vigencia automático (§7.1 de Pantallas: 30/90 días, 9 cuotas) |

---

## 12. Indicadores de cumplimiento

| Indicador | Meta |
| --- | --- |
| Verificaciones registradas con fuente, fecha y responsable | 100 % |
| Expedientes con consentimiento vigente antes del tratamiento | 100 % |
| Solicitudes ARCO atendidas dentro del plazo legal | 100 % |
| Copias de datos institucionales almacenadas | 0 |
| Incidentes de protección de datos | 0 (y notificados si ocurren) |

---

## 13. Pendientes de validación jurídica

1. Formulario y textos del consentimiento informado (incluido el expreso para sensibles).
2. Alcance del secreto profesional y su reflejo en controles técnicos.
3. Plazos exactos de atención de ARCO y de conservación por tipo de expediente.
4. Alojamiento de datos (jurisdicción preferiblemente panameña) y acuerdo de tratamiento con el proveedor de hosting.
5. Reglas de publicidad vs. confidencialidad de los resultados de búsquedas públicas del Registro Público.

*Cada punto cerrado se registra en §13 y en el registro de cambios del backlog.*

---

## 14. Trazabilidad con otros documentos

| Elemento | Documento |
| --- | --- |
| HU-06 (este entregable), HU-08 (fuentes simuladas), HU-18b/18c (consentimiento y ARCO), HU-23…HU-26 (adaptadores y panel) | `05-backlog-siete-sprints.md` |
| Entidades y endpoints `/verificaciones`, `/consentimientos`, `/solicitudes-arco`, reglas 11–13 | `03-plan-de-desarrollo.md` §3.4–3.7 |
| CP-06…CP-08, CP-13, CP-14 y fila de cumplimiento legal | `04-plan-de-pruebas.md` |
| Roles del bufete/cliente, prohibiciones 9–10, eventos de auditoría 9–11, pendientes 5–6 | `06-roles-y-accesos.md` |
| I-07 (registro de verificación), campos origen "A" (futuro convenio) | `Frontend/Rama-01-Frontend.md`, `Pantallas_y_Datos_Migracion.md` §1.3 |

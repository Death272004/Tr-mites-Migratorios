# DOCUMENTACIÓN DE PANTALLAS Y DATOS

## Plataforma Interoperable de Trámites Migratorios — Servicio Nacional de Migración (SNM)

> **Alcance:** documentación de **todas las pantallas** del sistema (portal del ciudadano y módulo interno del funcionario) y de **qué datos se piden en cada pantalla**, para **todos los trámites** de la guía oficial de procesos migratorios (`Procesos_Migratorios_Panama.md`).
>
> **Base normativa y de requisitos:** Decreto Ley 3 de 22 de febrero de 2008 (Art. 28), Decreto Ejecutivo 320 de 2008, guía oficial de procesos del SNM y Ley 81 de 2019 (protección de datos personales).
>
> **Naturaleza del documento:** diseño funcional de la plataforma propuesta. Los requisitos documentales provienen de los PDFs oficiales del SNM; los campos digitales y su validación automática son la propuesta del proyecto.

---

## ÍNDICE

1. [Convenciones y roles](#1-convenciones-y-roles)
2. [Mapa general de pantallas](#2-mapa-general-de-pantallas)
3. [Portal ciudadano — pantallas y datos](#3-portal-ciudadano--pantallas-y-datos)
4. [Datos específicos por trámite](#4-datos-específicos-por-trámite)
5. [Módulo interno SNM — pantallas y datos](#5-módulo-interno-snm--pantallas-y-datos)
6. [Datos validados por interoperabilidad (TE, CSS, Registro Público)](#6-datos-validados-por-interoperabilidad-te-css-registro-público)
7. [Reglas transversales: validaciones, estados y seguridad](#7-reglas-transversales-validaciones-estados-y-seguridad)
8. [Pendientes y datos a confirmar](#8-pendientes-y-datos-a-confirmar)

---

## 1. Convenciones y roles

### 1.1 Identificadores de pantalla

| Prefijo | Módulo | Ejemplo |
|---|---|---|
| `P-` | Portal ciudadano (extranjero, apoderado, padre/madre) | P-09 |
| `I-` | Módulo interno SNM (recepcionista, analista, director, admin) | I-06 |

### 1.2 Roles

| Rol | Módulo | Acceso |
|---|---|---|
| **Ciudadano** (extranjero titular) | Portal | Crea y consulta sus solicitudes |
| **Apoderado / abogado** | Portal | Presenta en nombre de un titular (poder notariado) |
| **Representante legal** (padre/madre, empleador, entidad) | Portal | Presenta por menores o por personas jurídicas |
| **Recepcionista** | Interno | Recibe expedientes, verifica pagos y completitud, emite observaciones |
| **Analista** | Interno | Revisa requisitos, solicita verificaciones interinstitucionales, propone resolución |
| **Resolutor** (Director General / coordinador) | Interno | Aprueba o niega |
| **Notificador / ventanilla de entrega** | Interno | Notifica, entrega carnés y certificaciones |
| **Administrador de catálogos** | Interno | Mantiene trámites, requisitos, tasas y vigencias |
| **Auditor / seguridad** | Interno | Consulta bitácoras, sin acceso a editar expedientes |

### 1.3 Notación de los campos

* **Obl.** = obligatorio para poder guardar y avanzar de paso.
* **Origen:** `D` = lo digita el ciudadano · `A` = se obtiene automáticamente por interoperabilidad · `S` = se obtiene de sistemas previos del SNM (RUEX, expedientes) · `U` = se sube como archivo.
* Los campos marcados **A** son los que sustituyen documentos repetidos: si la fuente oficial responde, el ciudadano **no** vuelve a subir ese documento.

---

## 2. Mapa general de pantallas

```
PORTAL CIUDADANO (P)
├── Acceso
│   ├── P-01 Inicio de sesión
│   ├── P-02 Registro de cuenta
│   ├── P-03 Verificación de identidad (OTP)
│   ├── P-04 Recuperación de contraseña
│   └── P-05 Mi perfil / datos de contacto
├── Gestión de solicitudes
│   ├── P-06 Mis trámites (bandeja)
│   ├── P-07 Nueva solicitud — selección de trámite
│   ├── P-08 Titularidad y representación
│   ├── P-09 Paso 1 — Datos personales
│   ├── P-10 Paso 2 — Pasaporte e historial migratorio
│   ├── P-11 Paso 3 — Domicilio y notificaciones
│   ├── P-12 Paso 4 — Situación laboral, económica o de vínculos
│   ├── P-13 Paso 5 — Dependientes
│   ├── P-14 Paso 6 — Requisitos y carga de documentos
│   ├── P-15 Paso 7 — Pagos y tasas
│   ├── P-16 Paso 8 — Declaración jurada y firma
│   ├── P-17 Resumen y envío (número de expediente)
│   └── P-18 Reserva de cita
├── Seguimiento
│   ├── P-19 Estado del trámite (línea de tiempo)
│   ├── P-20 Observaciones y notificaciones
│   ├── P-21 Subsanación (corrección del expediente)
│   ├── P-22 Resultados: resoluciones, carné digital, certificados
│   ├── P-23 Historial de pagos
│   └── P-24 Edictos y citaciones
└── Servicios
    ├── P-25 Certificaciones en línea (estatus y movimiento migratorio)
    ├── P-26 Naturalización — flujo específico
    └── P-27 Ayuda, FAQ y peticiones

MÓDULO INTERNO SNM (I)
├── Acceso
│   ├── I-01 Login institucional con MFA
│   └── I-02 Tablero de gestión
├── Flujo del expediente
│   ├── I-03 Bandeja de recepción (citas y turnos)
│   ├── I-04 Recepción y verificación de completitud
│   ├── I-05 Asignación de analista
│   ├── I-06 Análisis del expediente (checklist)
│   ├── I-07 Panel de verificación interoperable
│   ├── I-08 Emisión y atención de observaciones
│   ├── I-09 Edictos y publicaciones
│   ├── I-10 Resolución (aprobar / negar)
│   ├── I-11 Notificación
│   ├── I-12 Entrega en ventanilla
│   └── I-13 Expedientes archivados y reactivación
└── Administración
    ├── I-14 Catálogos: trámites, requisitos, tasas y vigencias
    ├── I-15 Usuarios, roles y permisos
    ├── I-16 Bitácora de auditoría
    ├── I-17 Reportes y tiempos por etapa
    └── I-18 Salud de las conexiones de interoperabilidad
```

---

## 3. Portal ciudadano — pantallas y datos

### P-01 Inicio de sesión

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Correo electrónico | texto/email | S | Coincide con el registrado en P-02 |
| Contraseña | contraseña | S | Mínimo 8, mayúscula, número y símbolo |
| Recordarme | booleano | N | — |
| ¿Olvidó su contraseña? | enlace | — | Deriva a P-04 |

*Acciones:* Iniciar sesión · Registrarse (P-02) · Entrar con clave de un ente interviniente (si aplica).

---

### P-02 Registro de cuenta

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Tipo de documento (pasaporte / cédula E / carné) | select | S | Catálogo SNM |
| Número de documento | texto | S | Formato según tipo; **S** consulta RUEX/TE para verificar existencia |
| Nombres y apellidos | texto | S | Debe coincidir con el documento |
| Nacionalidad | select | S | Catálogo de países |
| Correo electrónico | email | S | Único; envía código de verificación |
| Teléfono (código de país + número) | teléfono | S | Unicidad opcional |
| País de residencia actual | select | S | — |
| Usuario (sugerido) | texto | S | Autogenerado = correo |
| Contraseña / confirmación | contraseña | S | Reglas de P-01 |
| Aceptación de términos y **autorización de tratamiento de datos (Ley 81)** | checkbox | S | Obligatorio; se registra fecha e IP |

---

### P-03 Verificación de identidad (OTP)

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Código de 6 dígitos enviado al correo | numérico | S | Expira en 10 minutos, 3 intentos |
| Código SMS (opcional por seguridad) | numérico | N | Refuerzo para resoluciones y descargas |
| Verificación facial / cotejo de foto (opcional) | archivo/imagen | N | Solo para carné digital |

---

### P-04 Recuperación de contraseña

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Correo registrado | email | S | Enlace temporal de 1 hora |
| Nueva contraseña / confirmación | contraseña | S | No puede ser las últimas 3 usadas |

---

### P-05 Mi perfil / datos de contacto

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Nombre completo | texto | S | Solo lectura salvo corrección notariada |
| Documento de identidad | texto | S | Solo lectura |
| Correo electrónico | email | S | Cambio con re-verificación OTP |
| Teléfono | teléfono | S | — |
| Dirección de notificación (país, provincia, distrito, corregimiento, detalle) | select/texto | N | Heredada por defecto en P-11 |
| Idioma de notificación (español / inglés) | select | N | — |
| Medio de notificación preferido (correo, SMS, push) | select | S | — |

---

### P-06 Mis trámites (bandeja)

No pide datos: muestra tarjetas con **número de expediente, tipo de trámite, fecha de envío, estado, vencimiento de vigencias y pendiente del ciudadano**. Botones: Nueva solicitud (P-07) · Continuar borrador · Ver observación (P-20) · Descargar (P-22).

---

### P-07 Nueva solicitud — selección de trámite

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Categoría del trámite | select | S | Registro de Extranjería · Visas no residente · Residente temporal · Residente permanente · Procesos especiales · Certificaciones · Naturalización |
| Trámite específico | select | S | Se filtra por categoría; carga su ficha de requisitos (sección 4) |
| Motivo de la solicitud | select | S | Trabajo, inversión, familia, estudios, religión, humanitario, etc. |
| ¿Presenta por cuenta propia o mediante apoderado? | radio | S | Deriva a P-08 |
| País de origen del trámite | select | S | En Panamá / en consulado en el exterior |

*El trámite elegido determina:* el wizard restante, la lista de requisitos, las tasas (P-15) y qué verificaciones interinstitucionales se disparan (I-07).

---

### P-08 Titularidad y representación

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Condición del presentante | select | S | Titular · Apoderado · Padre/Madre · Representante de persona jurídica |
| Tipo y número de documento del titular | texto | S | **S** consulta RUEX |
| Nombre completo del titular | texto | S | Coincide con pasaporte |
| Tipo de representación | select | S | Poder notariado · Patria potestad · Tutela · Representación legal de empresa |
| Documento que acredita la representación | archivo | S (si no es titular) | **U** poder notariado, acta de nacimiento, resolución de tutela, certificado de Registro Público |
| Número de cédula e idoneidad del abogado | texto | S (apoderado) | Validación de vigencia ante el colegio de abogados |
| Cédula del pasante (si aplica) | texto | N | Con autorización del abogado |
| Datos del representante: nombre, documento, teléfono, correo | texto | S | — |

---

### P-09 Paso 1 — Datos personales

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Primer apellido / Segundo apellido / Nombres | texto | S | Tal como aparece en el pasaporte |
| Apellidos y nombres en el pasaporte (si difieren) | texto | N | Para cotejo |
| Fecha de nacimiento | fecha | S | ≤ fecha actual; calcula edad |
| País de nacimiento | select | S | — |
| Ciudad / lugar de nacimiento | texto | S | — |
| Nacionalidad (de origen) | select | S | Si tiene doble nacionalidad: segundo campo |
| Sexo | select | S | — |
| Estado civil | select | S | Soltero(a) · Casado(a) · Divorciado(a) · Viudo(a) |
| Nombre y nacionalidad del padre | texto/select | S | **S** coincide con Registro Civil (TE) cuando hay datos inscritos |
| Nombre y nacionalidad de la madre | texto/select | S | **S** ídem |
| Nombre del cónyuge y nacionalidad | texto/select | Cond. | Obligatorio si estado civil = casado(a) |
| Fecha y lugar de matrimonio | fecha/texto | Cond. | **A** certificado de matrimonio en Registro Civil (TE) |
| Documento de identidad del exterior (si tiene) | texto | N | Pasaporte, cédula o carné extranjero |
| Foto tamaño carné (3.5 × 4.5 cm) | imagen | S | Formato JPG/PNG ≤ 2 MB; validación de que no lleve lentes, gorros, escote ni mangas |
| Huella digital (opcional para carné digital) | dato biométrico | N | Solo si el trámite genera carné |

---

### P-10 Paso 2 — Pasaporte e historial migratorio

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Número de pasaporte vigente | texto | S | Validación de formato por país emisor |
| País emisor del pasaporte | select | S | — |
| Fecha de expedición / Fecha de vencimiento | fecha | S | Vigencia mínima habitual: **3 meses** (bloquea si no cumple) |
| Lugar de expedición | texto | N | — |
| **Sello de ingreso**: fecha, puesto fronterizo, clase de admisión | fecha/select | S | **S/A** cotejo con el registro de entradas y salidas del SNM |
| Número de Registro de Filiación (RUEX) | texto | S (si aplica) | **S** consulta RUEX; muestra estado **vigente / vencido / multa** |
| Último permiso migratorio: número, tipo, fecha de vencimiento | texto/select | S (si aplica) | **S** expediente SNM |
| Número de carné migratorio (trámite, provisional o permanente) | texto | Cond. | **S** expediente SNM |
| Carné de Residente Permanente "E" (número y fecha) | texto | Cond. | **A** emitido por el Tribunal Electoral |
| Pasaportes anteriores: números | texto repetible | Cond. | Obligatorio en Movimiento Migratorio |
| Motivo del cambio de pasaporte | texto/archivo | Cond. | Si perdió el pasaporte: **U** denuncia o reporte |
| ¿Ha salido del país en los últimos 5 años? / fuera más de 3 meses | radio | N | Relevante en naturalización (numerales 2 y 3 del Art. 10) |
| Historial de entradas y salidas | tabla solo lectura | — | **A** cargado desde el SNM; el ciudadano no lo digita |

---

### P-11 Paso 3 — Domicilio y notificaciones

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| País de domicilio | select | S | — |
| Provincia / Distrito / Corregimiento | select en cascada | S | Catálogo oficial |
| Dirección completa (calle, casa/apto, referencia) | texto | S | — |
| Tipo de tenencia | select | S | Propia · Alquiler · Con el empleador · Familiares |
| Comprobante de domicilio | archivo | Cond. | **U** escritura, contrato de arrendamiento notariado, carta de responsabilidad notariada o certificación de juez de paz |
| Titular del recibo de servicios públicos | texto | N | Cotejo con el comprobante |
| Número de recibo de luz/agua/teléfono | texto | Cond. | — |
| Dirección de notificación (si difiere del domicilio) | texto | N | — |
| Correo y teléfono de notificación | email/teléfono | S | Heredados de P-05 |

---

### P-12 Paso 4 — Situación laboral, económica o de vínculos

Pantalla **dinámica**: los campos cambian según el trámite elegido en P-07 (ver detalle en la sección 4). Bloques posibles:

**Bloque laboral (trabajo, MITRADEL, contratos):**

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Empleador / entidad contratante | texto | S | **A** registro en Registro Público o MITRADEL |
| Número de RUC | texto | S | **A** consulta a la DGI/Registro Público |
| Cargo y funciones | texto | S | — |
| Fecha de inicio y tipo de contrato | fecha/select | S | — |
| Salario mensual y moneda | numérico | S | — |
| Número y vigencia del permiso de trabajo | texto | S | **A** MITRADEL / SNM |
| Paz y salvo de la empresa (renta) | archivo | Cond. | **U** o validación automática DGI si está disponible |
| Paz y salvo de la CSS de la empresa | archivo | Cond. | **A** consulta a la CSS |
| Planilla con mano de obra panameña (porcentaje) | archivo | Cond. | **A** CSS/MITRADEL |

**Bloque económico / inversión:**

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Tipo de inversión | select | S | Depósito a plazo fijo · Inmueble · Inversión forestal · Macro-empresa · Mixta |
| Monto invertido | numérico | S | Validación contra el mínimo legal del permiso (p. ej. B/.300,000.00) |
| Banco o entidad financiera | select | S | — |
| Número de cuenta / certificado de plazo fijo | texto | S | **A** certificación bancaria |
| ¿Libre de gravamen? | radio | S | — |
| Finca / registro de propiedad (número) | texto | Cond. | **A** Registro Público |
| Sociedad / acciones: razón social, número de acciones, capital | texto/numérico | Cond. | **A** Registro Público + certificación del CPA |
| Certificación de Contador Público Autorizado | archivo | Cond. | **U** |
| Paz y salvo de la DGI | archivo/consulta | Cond. | **A** si el servicio está habilitado |
| Actividad económica declarada (declaración de renta) | archivo | Cond. | **U** últimas declaraciones |

**Bloque educativo:**

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Institución educativa | texto | S | — |
| Nivel y modalidad | select | S | — |
| Carrera / programa y jornada | texto/select | S | Tiempo completo obligatorio |
| Matrícula vigente y fechas | texto/fecha | S | — |
| Certificación de centro educativo | archivo | S | **U** o validación con la institución |
| Beca (entidad otorgante) | texto | Cond. | Certificación de la entidad |

**Bloque de actividad especial (religiosa, deportiva, humanitaria, periodística, investigación):**

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Institución o entidad | texto | S | **A** existencia en Registro Público / MINGOB |
| Cargo o actividad | texto | S | — |
| Duración autorizada (desde / hasta) | fechas | S | — |
| Carta o certificación de la entidad | archivo | S | **U** |
| Registro de la asociación / ONG | archivo | Cond. | **A** Registro Público |
| Convenio con el Estado (si aplica) | archivo | N | — |

**Bloque de vínculos familiares:**

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Parentesco alegado | select | S | Cónyuge · Hijo(a) · Padre/Madre · Dependiente |
| Nombre del pariente y su nacionalidad | texto/select | S | — |
| Número de cédula o carné del pariente | texto | S | **A** Registro Civil del Tribunal Electoral |
| Tipo de vínculo documental | archivo | S | **A** certificado de matrimonio o de nacimiento inscrito en el Registro Civil |
| Hijos panameños (cantidad y datos) | repetible | Cond. | **A** Registro Civil (TE) |

---

### P-13 Paso 5 — Dependientes

Se repite por cada dependiente (cónyuge, hijos, padres u otros):

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Parentesco con el solicitante | select | S | — |
| Nombres y apellidos completos | texto | S | — |
| Fecha de nacimiento | fecha | S | Calcula si es mayor de 18 |
| Nacionalidad | select | S | — |
| Tipo y número de documento | texto | S | — |
| Sexo y estado civil | select | S | — |
| Certificado de matrimonio / nacimiento / tutela | archivo | S | **A** Registro Civil (TE) |
| Prueba de domicilio del dependiente | archivo | Cond. | — |
| Estudios a tiempo completo (18–25 años) | texto/archivo | Cond. | Certificación del centro educativo |
| Declaración jurada de soltería (18–25 años) | archivo | Cond. | — |
| **Solvencia económica del responsable** | select/archivo | S | Declaración de renta con paz y salvo (**B/.1,000.00** + **B/.100.00** por dependiente) · Carta de trabajo con ficha CSS · Carta bancaria |
| Carta de responsabilidad y repatriación notariada | archivo | S | Del residente o nacional |

---

### P-14 Paso 6 — Requisitos y carga de documentos

Pantalla de **checklist dinámico**: se genera a partir de la ficha del trámite (sección 4) y de los datos ya digitados.

| Campo / elemento | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Lista de requisitos con casilla cumplida/no cumplida | checklist | S | Cada casilla es la misma que usa el analista en I-06 |
| Documento requerido | control de carga | S | PDF/JPG/PNG; nombre sugerido automático |
| Fecha de emisión del documento | fecha | S | Calcula vigencia: antecedentes **30 días**, salud/estatus/bancario **90 días**, ficha CSS **90 días y 9 cuotas** |
| Emisor del documento | texto/select | S | — |
| Número de sello/timbre (si aplica) | texto | N | Constancia de timbres |
| Traducción / apostilla / legalización | checkbox + archivo | Cond. | Documentos del exterior: **U** apostilla o certificación de Relaciones Exteriores |
| Requisitos obtenidos por interoperabilidad | estado | — | **A** marcados como *verificado automáticamente* (no se suben) |
| Observación del ciudadano | texto largo | N | — |
| Completitud del expediente | barra de progreso | — | 100 % para habilitar P-16 |

*Regla:* un requisito ya **verificado por interoperabilidad** aparece bloqueado y anotado con la fuente y la fecha de la consulta; el ciudadano solo puede pedir forzar la revisión manual.

---

### P-15 Paso 7 — Pagos y tasas

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Desglose de tasas del trámite | tabla solo lectura | — | Calculado desde el catálogo I-14 (ej.: Tesoro Nacional **B/.250.00**, SNM **B/.800.00**) |
| Modalidad de pago | radio | S | En línea (tarjeta/transferencia) · Cheque certificado presencial · Exoneración |
| Número, banco y fecha del cheque | texto/fecha | Cond. | **S** verificación de cheques certificados o de gerencia |
| Comprobante de pago | archivo | Cond. | **U** escaneo del cheque o recibo |
| Concepto de pago (repatriación, carné, trámite, timbres) | select | S | — |
| Timbres digitales (naturalización) | numérico | Cond. | B/.8.00 declaración jurada, B/.8.00 estatus, B/.2.00 carné E |
| Constancia de pago generada | documento | — | Descargable; validada luego en I-04 |

---

### P-16 Paso 8 — Declaración jurada y firma

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Declaración de veracidad de los datos y documentos | checkbox | S | Texto legal; imposibilidad de avanzar si no se marca |
| **Autorización de tratamiento de datos personales (Ley 81)** | checkbox | S | Finalidad, destinatarios (TE, CSS, Registro Público), plazo de conservación y derechos ARCO |
| Declaración de no tener impedimentos / antecedentes | checkbox | Cond. | Según trámite |
| Renuncia a la nacionalidad (solo naturalización) | checkbox | S | Art. 10 numeral 1 y 2 de la Constitución |
| Lugar y fecha | select/fecha | S | Autogenerados |
| Firma manuscrita digital o huella | firma | S | Se guarda con sello de tiempo |
| Nombre del firmante | texto | S | Coincide con P-08 |

---

### P-17 Resumen y envío

| Dato mostrado | Origen |
|---|---|
| Número de expediente / trámite / registro (QR y código) | Generado al enviar |
| Resumen de datos del solicitante y dependientes | P-09 a P-13 |
| Requisitos cumplidos, automáticos y pendientes | P-14 |
| Total pagado y saldo | P-15 |
| Estado inicial: **RECIBIDO – EN PREPARACIÓN** | — |
| Siguiente paso: cita (P-18) o espera de revisión | — |
| Aviso: *"No se recibirán solicitudes incompletas"* | Formulario oficial SNM |

---

### P-18 Reserva de cita

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Trámite | select | S | Prellenado desde la solicitud |
| Oficina / ventanilla | select | S | Catálogo de sedes |
| Fecha y hora disponibles | calendario | S | Cupo por ventanilla y tipo de trámite |
| Turno/tiquete asignado (letra) | — | — | Ej.: **"B"** para Registro de Extranjería; corrección y cambio de nacionalidad **no requieren turno** |
| Nombre del asistente | texto | N | — |

---

### P-19 Estado del trámite (línea de tiempo)

No pide datos. Muestra: expediente, trámite, etapa actual, fecha de cada etapa, **días transcurridos**, requisitos faltantes y acción pendiente. Estados visibles para el ciudadano:

```
EN PREPARACIÓN → RECIBIDO → CON OBSERVACIONES (ciudadano) → EN ANÁLISIS
→ CON OBSERVACIONES (analista) → ADMITIDO → EN RESOLUCIÓN
→ RESUELTO (APROBADA / NEGADA) → NOTIFICADO → ENTREGADO
```

---

### P-20 Observaciones y notificaciones

| Dato mostrado / pedido | Tipo | Origen |
|---|---|---|
| Quién emitió la observación (recepcionista / analista) | — | I-04 / I-08 |
| Fecha y plazo de atención | — | — |
| Lista de ítems observados con su detalle | — | — |
| Acción: atender observación | botón → P-21 | — |
| Nueva fecha de vigencia de documentos vencidos | — | Alerta |

---

### P-21 Subsanación (corrección del expediente)

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Ítem observado (fila) | — | S | Prellenado |
| Documento corregido / completado | archivo | S | Debe respetar vigencias |
| Justificación de la corrección | texto | N | — |
| Sustitución de dato digitalizado | texto | Cond. | Solo campos corregibles (p. ej. error de digitación) |
| Confirmación de que se atienden **todas** las observaciones | checkbox | S | Regla oficial: solo se reingresa completo |

---

### P-22 Resultados: resoluciones, carné digital y certificados

| Dato | Tipo | Origen |
|---|---|---|
| Resolución (PDF, número, fecha) | descarga | I-10 |
| Carné digital (imagen/QR con verificación) | descarga | **A** datos biométricos + TE |
| Constancia de permiso vigente / prórroga | descarga | **S** expediente |
| Estado del permiso: **VIGENTE / EN PRÓRROGA / VENCIDO / INDEFINIDO / CANCELADO OFICIOSO** | — | — |
| Fecha límite de prórroga o renovación | — | Genera recordatorio |
| Motivos de negación y vía de impugnación | texto | I-10 |

---

### P-23 Historial de pagos

Tabla de: fecha, concepto, monto, medio, número de comprobante, estado (pagado / pendiente / devuelto), y descarga del recibo. Incluye depósitos de garantía devueltos (p. ej. **B/.500.00** de cambio de categoría).

---

### P-24 Edictos y citaciones

Consulta por número de expediente y apellidos: edictos publicados, oposiciones, citas de retiro y notificaciones con fecha de publicación.

---

### P-25 Certificaciones en línea

Flujo corto (3 pasos) para **Estatus Migratorio** y **Movimiento Migratorio**:

| Campo | Tipo | Obl. | Origen / validación |
|---|---|---|---|
| Trámite solicitado | radio | S | Estatus migratorio · Movimiento migratorio |
| Número de pasaporte y carné | texto | S | **S** expediente SNM |
| Entidad a la que se presenta el certificado | select | S | DGI · MITRADEL · SNM · Otro |
| ¿Para uso de Naturalización? | checkbox | N | Cambia el timbre a **B/.8.00** y la leyenda |
| Copia de generales del pasaporte y sello | archivo | S (estatus) | **A** sustituible por lectura del sello digital |
| Copia de todo el pasaporte vigente (todas las páginas) | archivo | S (movimiento) | Escaneo; las entradas/salidas se cruzan **A** con la BD del SNM |
| Pasaportes anteriores (números) | texto | Cond. | — |
| Acta de nacimiento del menor y documento del representante | archivo | S (menor) | **A** Registro Civil (TE) |
| Tipo de retiro | radio | S | Personal · Por apoderado (poder notariado + cédula e idoneidad) |
| Pago | select | S | **B/.10.00** estatus (o timbres de naturalización) |

---

### P-26 Naturalización — flujo específico

Pantalla adicional que se abre cuando el trámite = Carta de Naturaleza. Requiere abogado.

| Paso de pantalla | Campos / documentos pedidos |
|---|---|
| **N-1 Apoderado** | Nombre, dirección, teléfonos y correo del abogado; cédula e idoneidad; autorización notariada del pasante |
| **N-2 Poder y solicitud** | Datos del peticionario (nombre como en pasaporte, estatus y carné E; domicilio; sexo; edad; estado civil; lugar y nacionalidad de nacimiento; carné E y pasaporte; correo y teléfonos; nombres y nacionalidad de los padres); fundamento de derecho (numeral 1, 2 o 3 del Art. 10); constancia de servicio público |
| **N-3 Datos migratorios** | Carné E (autenticado, B/.2.00), certificación de estatus migratorio "para uso de Naturalización" (B/.8.00, 90 días), copia completa del pasaporte con sello de registro (apostillado/consular y con Relaciones Exteriores) |
| **N-4 Antecedentes penales** | Antecedentes del país de residencia de los últimos 5 años o de origen (30 días de vigencia) y de Panamá; declaración jurada de no salida del país por más de 3 meses si aplica |
| **N-5 Vínculos familiares** | Certificado de matrimonio (B/.3.00), de nacimiento del cónyuge, de hijos panameños, de padre/madre panameño, de inscripción de naturalización (B/.3.00) — **A** Registro Civil |
| **N-6 Solvencia económica (2 de 5 opciones)** | Declaración de renta de 2 años con recibo · Carta bancaria de 4 cifras medias (30 días) · Carta de trabajo + ficha CSS de 9 cuotas notariada (90 días) · Certificación de jubilación · Inversión (constancia de propiedad o acciones) |
| **N-7 Dependiente (ama de casa / estudiante)** | Carta de responsabilidad, copia autenticada y timbrada (B/.2.00) del responsable, paz y salvo de la DGI del responsable, comprobación de vínculos |
| **N-8 Entrevista (8 páginas)** | Datos personales; estructura familiar y condiciones de vida; historial laboral, ingresos y educación; situación legal migratoria; relación con el país de origen; conocimientos culturales y cívicos; razones migratorias; antecedentes y redes sociales. **Adjunto:** formato escaneado completado con bolígrafo azul y letra imprenta |
| **N-9 Paz y salvo DGI** | Número de confirmación, nombre y firma |
| **N-10 Salud y fotos** | Certificado médico general de buena salud (90 días, con carné E, sello y firma); 3 fotos carné (3.5 × 4.5 cm, vestimenta formal) |
| **N-11 Ley de Reciprocidad** | Fotocopia autenticada en consulado + certificación de Relaciones Exteriores, o certificación de existencia y vigencia de la ley (según numeral 3) |
| **N-12 Examen de conocimientos del TE** | Registro del resultado o de la **exoneración** (reciprocidad España/América Latina, estudios en Panamá, discapacidad con certificación médica) |
| **N-13 Declaración jurada y firma** | Ante notario, B/.8.00 en timbres, vigencia 1 año; motivos, renuncia a la nacionalidad, huella; advertencia del Art. 385 del Código Penal |

---

### P-27 Ayuda, FAQ y peticiones

| Campo | Tipo | Obl. |
|---|---|---|
| Tipo de consulta | select | S |
| Número de expediente (si tiene) | texto | N |
| Descripción | texto largo | S |
| Adjunto | archivo | N |
| Correo de respuesta | email | S |

---

## 4. Datos específicos por trámite

> Tablas que definen el contenido de **P-07 (ficha), P-12 (bloques), P-14 (checklist) y P-15 (tasas)** para cada trámite.
> Todos los permisos de residencia agregan además los **requisitos comunes del Art. 28**: poder y solicitud notariados, 3 fotos carné, pasaporte cotejado, antecedentes penales, certificado de salud, cheque **B/.250.00** Tesoro Nacional, cheque **B/.800.00** SNM y declaración jurada de antecedentes.
> **Adj.** = documento adicional específico (subido en P-14). **Campo** = dato adicional que se digita (P-12). **A** = se puede obtener por interoperabilidad.

### 4.1 Registro de Extranjería (RUEX)

| Trámite | Campos adicionales | Adjuntos / notas |
|---|---|---|
| **3.1 Confección de Registro de Filiación** | Puesto y fecha del sello de ingreso; número de pasaporte | Generales del pasaporte; copia del sello de ingreso; 2 fotos carné; tiquete **"B"**; **B/.5.00** |
| **3.2 Filiación con pre-registro en línea** | Datos del pre-registro (folio) | Ídem 3.1 + copia de la visa de entrada si procede |
| **3.3 Cambio de residencia** | Nuevo país/provincia/distrito/corregimiento/dirección; tipo de tenencia | Escritura pública notariada **o** contrato de arrendamiento notariado **o** carta de responsabilidad notariada/certificación de juez de paz; recibo de servicios públicos; copia de carné o cédula |
| **3.4 Traspaso de sello (cambio de pasaporte)** | Número de pasaporte anterior y actual | Generales de ambos pasaportes; copia del sello de registro anterior; copia de carné/cédula; si perdió: denuncia; tiquete **"X"** |
| **3.5 Cambio de nacionalidad** | Nacionalidad anterior y nueva; motivo | Nota formal al Director General (original y copia, Ventanilla 42); generales de pasaporte actual y anterior; sello del pasaporte anterior; **plazo 48 h**; sin tiquete |
| **3.6 Correcciones a filiación** | Dato erróneo: valor actual y valor correcto, campo afectado | Copia simple de generales del pasaporte y del sello, o copia de los documentos de Certificaciones; **se resuelve el mismo día** |

### 4.2 Visas — categoría no residente (PM1–PM18)

| Trámite | Campos adicionales | Adjuntos / notas |
|---|---|---|
| **4.1 Visa de Turista (PM1)** | Motivo; fechas de viaje; solvencia declarada (≥ **B/.500.00**) | Pasaporte ≥ 3 meses; reservación o tiquete; identificación del país de domicilio; 3 fotos; **B/.50.00**; prueba de solvencia; carta de invitación (con cédula del invitante, pasaporte y servicios públicos) |
| **4.2 Turista en tránsito (PM2)** | País de destino; fecha del vuelo | 2 fotos; pasaporte ≥ 3 meses; itinerario de continuación; identidad del país de domicilio; pago consular; carta de invitación; **mínimo 15 días hábiles antes** |
| **4.3 Extensión de visa de turista (PM3)** | Fechas de la extensión; motivo | Copia del pasaporte; tiquete pagado; reservación de hotel; justificación; solvencia ≥ **B/.500.00**; declaración notarial del invitante; **antes del vencimiento** |
| **4.4 Extensión por cambio de categoría (PM4)** | Categoría destino solicitada | Documentos de la residencia solicitada; **B/.250.00** + garantía **B/.500.00**; apoderado; **10 días hábiles antes del vencimiento** |
| **4.5 Visa múltiple no residente (PM5)** | Condición de comerciante/empresario; motivo | Pasaporte notariado; solvencia; carta de la empresa con Registro Público y carta bancaria; reserva aérea y de hotel; identidad del país de domicilio; idoneidad del abogado |
| **4.6 Visa de marino (PM6)** | Embarcación; compañía contratante | Carta/garantía de la compañía; libreta de embarque; licencia de marino; pasaporte |
| **4.7 Trabajadores de espectáculos (PM7)** | Duración (máx. 9 meses); empleador | Salud con pruebas VIH/VDRL y exámenes; afiliación CSS; depósito **B/.1,000.00**; permiso de trabajo; paz y salvo de renta y CSS de la empresa; **B/.250.00** |
| **4.8 Trabajadores eventuales y técnicos (V-TET, PM8)** | Obra/proyecto; vigencia (1 año, 5 prórrogas) | Permisos de trabajo; depósito **B/.100.00**; Tesoro **B/.100.00**; paz y salvo de la empresa; tiquete de regreso; hotel |
| **4.9 Trabajadores domésticos (PM9)** | Empleador; domicilio de prestación | Contrato de trabajo; depósito **B/.500.00**; **B/.100.00**; servicios públicos del domicilio; afiliación y ficha CSS; carta de responsabilidad; solvencia del empleador |
| **4.10 Artistas / transeúntes (PM10)** | Fecha, lugar y hora del evento | Permiso de trabajo; pasajes; hotel; paz y salvo de renta y CSS de la empresa; depósito **B/.100.00** + Tesoro **B/.100.00**; nota al Director General con **10 días de anticipación** |
| **4.11 Corta estancia por negocios (PM11)** | Entidad que invita / beca | Formulario de visa; **B/.100.00**; itinerario; hotel; constancia de expedientes judiciales (mayores de 18); certificación de ONG si aplica |
| **4.12 Visitar familiares (PM12)** | Parentesco y datos del familiar | Certificado de parentesco (**A** Registro Civil); **B/.100.00**; depósito **B/.500.00**; itinerario; hotel |
| **4.13 Investigadores y científicos (PM13)** | Actividad, institución y duración | Carta de la institución; certificación de beca; registro de la ONG; **B/.100.00**; itinerario; hotel |
| **4.14 Tratamiento médico (PM14)** | Diagnóstico; centro médico; duración (≤ 9 meses); costo estimado | Certificación médica del país de origen; carta del centro médico en Panamá; solvencia; **B/.100.00**; itinerario; hotel |
| **4.15 Comerciantes e inversionistas (PM15)** | Operación o inversión a analizar | Referencia bancaria o solvencia ≥ **B/.1,000.00** mensuales; boleto de regreso válido 1 año |
| **4.16 Asistencia humanitaria (PM16)** | Organismo y tipo de ayuda | **Requisito único:** carta del Ministerio de Relaciones Exteriores |
| **4.17 Sector bancario (PM17)** | Actividad y duración en la entidad | Carta del banco; Registro Público; licencia de la Superintendencia de Bancos; diploma/idoneidad; **B/.250.00** + depósito **B/.500.00**; itinerario; hotel |
| **4.18 Trabajador remoto / nómada digital (PM18)** | Empleador extranjero; ingreso anual ≥ **B/.36,000.00**; modalidad (asalariado/autónomo) | Póliza de seguro médico con cobertura en Panamá; certificación de existencia de la empresa; carta de la empresa (ingreso ≥ **B/.3,000.00**); declaración de no trabajar para clientes locales; **B/.250.00**; carné **B/.50.00** |

### 4.3 Residente permanente

| Trámite | Campos adicionales | Adjuntos / notas |
|---|---|---|
| **5.1.1 Regularización general "235" (PRP-RMG)** | Motivo de arraigo: familiar / laboral / fiscal | Carné original de 6 años; antecedentes apostillados; cheques **250 + 800 + 900**; prueba de domicilio; documento de arraigo (actas **A**, permiso de trabajo **A**, declaraciones y paz y salvo DGI) |
| **5.1.2 Inversión forestal (PRP-FOR)** | Monto (≥ **B/.100,000.00**; **B/.350,000.00** para permanencia automática) | Certificación CPA; certificado de acciones; resolución del Ministerio de Ambiente; Registro Público de la empresa y del inmueble; **A** certificación bancaria |
| **5.1.3 Macro-empresa (PRP-IME)** | Capital (≥ **B/.160,000.00**) y cargo | Certificado de Registro Público; certificación del secretario/tesorero; libro de acciones; CPA; declaración de renta; planilla de 5 panameños (**A** CSS); paz y salvo CSS; aviso de operación; prueba de inversión y del local |
| **5.1.4 Depósito a plazo fijo (PRP-SEP-DPF)** | Monto (**B/.300,000.00**), banco, plazo (≥ 3 años) | Certificación bancaria del depósito libre de gravamen; copia autenticada del certificado |
| **5.1.5 Bienes inmuebles (PRP-SEP-IBM)** | Valor (**B/.300,000.00**), número de finca | **A** certificación del Registro Público de propiedad a título personal, libre de gravámenes |
| **5.1.6 Inversión mixta (PRP-SEP-IM)** | Suma de DPF + inmueble = **B/.300,000.00** | Certificación bancaria **A** + certificación del Registro Público **A** |
| **5.2.1 Rentista retirado (PRP-RR)** | Renta mensual (≥ **B/.850.00**), duración (≥ 5 años) | Certificación bancaria del BNP o Caja de Ahorros libre de gravamen; copia autenticada del plazo fijo |
| **5.2.2 Jubilado o pensionado (PRP-JP)** | Pensión (≥ **B/.1,000.00** mensuales), entidad que paga | Certificación de pensión vitalicia; permiso **indefinido** |
| **5.2.3 Inversionista Panamá-Pacífico (PPRT-PEI-APP)** | Inversión y condición de inversionista | Certificación del Área Económica Especial; Registro Público |
| **5.2.4 Inversionista zona procesadora (PRP-IZOP)** | Inversión y empresa | Registro Público; certificación de la zona |
| **5.2.5 Inversionista call center (PRP-IZOP)** | Inversión y empresa | Ídem |
| **5.2.6 Industria cinematográfica** | Producción y montos | Contrato de la producción; Registro Público |
| **5.3.1 Personal de aviación (PRP-EA)** | Empleador aéreo y cargo | Permiso de trabajo; contrato; certificados de vuelo / licencias |
| **5.3.2 Empresas privadas ≤ 10 % (PRP-6)** | Puesto, salario y antigüedad | Contrato refrendado; permiso de trabajo **A**; planilla de personal **A** CSS |
| **5.4.1 Casado con panameño(a) (PRP-2/3)** | Fecha y lugar del matrimonio; datos del cónyuge | **A** certificado de matrimonio inscrito; cédula del cónyuge **A**; si < 2 años: entrevista |
| **5.4.2 Dependiente de residente permanente (PPT-7)** | Parentesco y datos del residente responsable | Carta de responsabilidad; **A** actas de parentesco; prueba de domicilio |
| **5.4.3 Extranjeros con hijos panameños (PRP-FEHP)** | Datos de los hijos | **A** certificados de nacimiento de hijos panameños |
| **5.5.1 Ley de Amistad con Italia (PRP-CPI)** | Nacionalidad italiana acreditada | Documentos de identidad italiana; certificados de estado civil |
| **5.5.2 Países con relaciones amistosas (PPT/PPP-PE)** | País y condición | Certificación de la entidad correspondiente |
| **5.5.3 Extranjero profesional (PRP-PROF)** | Título, profesión, empleador | Diploma/título **U**; permiso de trabajo **A**; contrato |
| **5.5.4 Diplomáticos / organismos internacionales (PRP)** | Entidad y cargo final | Certificación del organismo; exoneraciones según convenio |
| **5.6.1 Religioso Iglesia Católica/Ortodoxa (PRP-D)** | Congregación y cargo | Carta del ordinario o autoridad; identificación de la entidad |
| **5.6.2 Otras denominaciones (PRP-D)** | Iglesia/entidad, cargo, duración | Registro de la entidad **A**; carta de la autoridad religiosa |

### 4.4 Residente temporal

| Trámite | Campos adicionales | Adjuntos / notas |
|---|---|---|
| **6.1.1 Personal del Gobierno / entidades autónomas** | Institución, cargo, vigencia | Carta institucional; nombramiento; permiso de trabajo **A** |
| **6.1.2 Empresas con contrato con el Gobierno** | Contrato y obra | Contrato con el Estado; registro de la empresa **A** |
| **6.1.3 Ejecutivos Zona Libre de Colón** | Empresa, cargo, salario | Certificación de la empresa; permiso de trabajo **A**; paz y salvo **A** |
| **6.1.4 Personal remunerado desde el exterior (embajadas/organismos)** | Entidad, cargo, remuneración | Carta de la embajada u organismo; constancia de remuneración |
| **6.1.5 Corresponsal de prensa internacional** | Medio y país de pago | Acreditación periodística; contrato con el medio extranjero |
| **6.1.6 Empresas bajo Acuerdo Marrakech (Ley 23/1997)** | Empresa y porcentaje | Certificación de la autoridad competente; Registro Público |
| **6.1.7 Profesional del deporte (PRT-EPD)** | Disciplina, club, contrato | Contrato con el club; certificación deportiva |
| **6.1.8 Consultores y profesionales de salud por capacitación** | Institución y programa | Carta de la institución; certificación profesional |
| **6.2.1 Inversión agraria (PRT-AI)** | Finca, actividad, monto | Título de propiedad o arriendo; plan de actividad; permisos |
| **6.2.2 Inversión forestal temporal (PPT-IFOR)** | Monto y proyecto | Registro del Ministerio de Ambiente; certificación bancaria **A** |
| **6.3.1 Industria cinematográfica** | Producción, fechas | Contrato de la producción |
| **6.3.2 Investigador – Ciudad del Saber** | Proyecto e institución | Carta de la fundación |
| **6.3.3 Docente – Ciudad del Saber** | Institución y materia | Carta de la institución educativa |
| **6.3.4 Empresario/ejecutivo – Ciudad del Saber** | Empresa y cargo | Certificación de la fundación y de la empresa |
| **6.3.5 Técnico – Ciudad del Saber (PRT-4FCS)** | Función técnica | Carta de la fundación |
| **6.3.6 Estudiante – Ciudad del Saber (PRT-5FCS)** | Institución y programa | Matrícula y certificación de estudios |
| **6.3.7 Empleado de la ACP** | Cargo y contrato | Certificación del Canal de Panamá |
| **6.3.8 Trabajadores Panamá-Pacífico (10 %)** | Empresa y cargo | Certificación del Área; planilla **A** |
| **6.3.9 Personal especializado Panamá-Pacífico (15 %)** | Empresa, cargo, antigüedad | Certificación de especialización |
| **6.3.10 Ejecutivos/técnicos en zonas procesadoras** | Empresa y zona | Certificación de la zona; contrato |
| **6.3.11 Personal de call centers de exportación** | Empresa y cargo | Registro de la empresa **A**; contrato |
| **6.3.12 Ejecutivos con funciones en el extranjero** | Empresa, funciones, ingreso | Carta de la empresa; certificación bancaria **A** |
| **6.3.13 Sedes de multinacionales (Ley 41/2007)** | Multinacional y cargo | Certificación de la Ley 41 |
| **6.3.14 Gobierno de EE. UU. (CARSI/MÉRIDA, Cuerpo de Paz)** | Programa y sede | Carta del programa |
| **6.4.1 Estudiantes regulares** | Institución, nivel, fechas | Matrícula; certificación de estudios; solvencia del responsable |
| **6.4.2 Programas educativos sin fines de lucro (MEDUCA)** | Programa y entidad | Certificación de la entidad / MEDUCA |
| **6.4.3 Fulbright** | Becas y programa | Certificación de la comisión Fulbright |
| **6.4.4 Becados por instituciones de seguridad pública** | Institución y plan de estudios | Nombramiento de la institución |
| **6.5 Misionero laico** | Congregación y misión | Carta de la entidad religiosa; registro **A** |
| **6.6 Reagrupación familiar (PRT-FAM)** | Parentesco y datos del familiar | Carta de responsabilidad; **A** actas de parentesco; domicilio; solvencia |

### 4.5 Otros procesos, certificaciones y naturalización

| Trámite | Campos adicionales | Adjuntos / notas |
|---|---|---|
| **7.1 Protección de Seguridad Humanitaria (PPSH)** | Fecha de ingreso y permanencia (≥ 1 año, sin más de 60 días consecutivos fuera) | Poder y solicitud; antecedentes apostillados; salud; registro de mano de obra MITRADEL **A**; comprobante de domicilio; **B/.800.00 + B/.250.00 + B/.100.00 + B/.100.00** |
| **7.2 Regularización RMG 235 (permiso temporal)** | Años del permiso | Carné original; antecedentes apostillados; salud; domicilio; **B/.250.00 + B/.800.00 + B/.400.00** |
| **7.3 SENACYT (investigadores/científicos)** | Proyecto e institución | Certificación de SENACYT; en permanencia: **sin cheques** |
| **7.4 Refugiados (ONPAR)** | Hechos que motivan la protección | Solicitud; resolución ONPAR con sello de notificado; registro **B/.5.00**, carné **B/.10.00** |
| **7.5 Retorno voluntario** | Motivo; fecha de salida; pasaje | Carta al Director General; pasaporte y sello de ingreso; **pasaje confirmado (5–7 días hábiles)**; RUEX vigente; advierte impedimento de **2 a 5 años** |
| **7.6 Exoneración OPEDE (vehículo)** | Datos del vehículo | Estado del carné: debe estar **vigente** (no "en trámite") |
| **8 Estatus migratorio** | Carné; entidad de uso; leyenda "para uso de Naturalización" | Ver P-25; **B/.10.00** (o timbres **B/.8.00**); carné E **A** TE |
| **9 Movimiento migratorio (adulto/menor)** | Entidad destino; pasaportes anteriores | Ver P-25 |
| **10 Naturalización** | Ver flujos N-1 a N-13 | Ver P-26 |

---

## 5. Módulo interno SNM — pantallas y datos

### I-01 Login institucional con MFA

| Campo | Tipo | Obl. | Validación |
|---|---|---|---|
| Usuario corporativo | texto | S | Directorio institucional |
| Contraseña | contraseña | S | Política de dominio |
| Segundo factor (token/SMS) | numérico | S | Obligatorio para analistas, resolutores y administradores |
| Estación / IP | automático | — | Se registra en la bitácora (I-16) |

---

### I-02 Tablero de gestión

Sin campos de entrada. Indicadores: solicitudes recibidas hoy · en análisis · con observaciones pendientes · en resolución · tiempo promedio por etapa (base de la meta de reducción del rango actual de 3–8 meses) · verificaciones interinstitucionales fallidas.

---

### I-03 Bandeja de recepción (citas y turnos)

| Campo | Tipo | Obl. | Origen |
|---|---|---|---|
| Turno / tiquete (letra y número) | — | S | P-18 |
| Fecha y hora de la cita | — | S | P-18 |
| Titular y tipo de trámite | — | S | P-07 |
| Número de expediente / QR | texto/escaner | S | P-17 |
| Estado de llegada | select | S | En espera · Atendido · No asistió |

---

### I-04 Recepción y verificación de completitud

| Campo | Tipo | Obl. | Origen / regla |
|---|---|---|---|
| Identidad del presentante | consulta | S | **S/A** RUEX, carné o cédula; si es apoderado: poder **U** |
| Verificación de pagos (cheques/recibos) | checklist | S | Monto, concepto, banco y estado del cheque |
| Verificación del sello de ingreso | consulta | S | **S** registro de entradas |
| Estado del RUEX | consulta | S | **S** vigente / vencido / con multa |
| Revisión casilla por casilla (igual que P-14) | checklist | S | Completa e incompleta |
| **Observaciones del Recepcionista** | texto largo | Cond. | Obligatorio si el expediente está incompleto ("No se recibirán solicitudes incompletas") |
| Recibo de expediente | botón | — | Genera **Registro N.º / Trámite N.º / Expediente N.º** |
| Fecha y hora de recibido | automático | — | Inicia el conteo del tiempo de atención |

---

### I-05 Asignación de analista

| Campo | Tipo | Obl. | Origen |
|---|---|---|---|
| Analista asignado | select | S | Disponibilidad y especialidad (visas, residencias, naturalización) |
| Prioridad | select | N | Ordinaria · Plazo legal (p. ej. cambio de nacionalidad 48 h) |
| Fecha límite sugerida | fecha | — | Calculada por tipo de trámite |
| Observación de asignación | texto | N | — |

---

### I-06 Análisis del expediente (checklist)

| Campo | Tipo | Obl. | Origen / regla |
|---|---|---|---|
| Requisitos comunes (Art. 28) | checklist | S | Cada casilla con estado y motivo |
| Requisitos específicos del permiso | checklist | S | Cargados desde el catálogo (I-14) |
| Vigencias de los documentos | cálculo automático | — | 30/90 días; marca "vencido" |
| **¿Solicitud conforme?** | radio SÍ / NO | S | SÍ → admisión (I-09/I-10) · NO → observación (I-08) |
| **Observación del Analista** | texto largo | Cond. | Ítems observados con plazo de atención |
| Verificaciones interinstitucionales requeridas | multiselección | S | TE · CSS · Registro Público · SNM (abre I-07) |
| Dictamen técnico preliminar | texto | N | — |

---

### I-07 Panel de verificación interoperable

Pantalla que muestra el resultado de cada consulta enviada por la plataforma.

| Elemento | Contenido |
|---|---|
| Institución consultada | TE · CSS · Registro Público · SNM |
| Dato solicitado | Ej.: identidad, matrimonio, afiliación, propiedad, RUEX |
| Resultado | **Coincide** · **No coincide** · **Sin dato** · **Error de servicio** |
| Valor retornado | Solo los campos autorizados para la finalidad del trámite |
| Identificador de la consulta y marca de tiempo | Sello de la respuesta |
| Fuente y responsable | Institución origen |
| Evidencia descargable | Oficio/constancia electrónica para el expediente |
| Acción | Registrar como verificado · Marcar inconsistencia (→ observación en I-08) · Repetir consulta |

*Todo acceso queda en la bitácora (I-16): quién consultó, cuándo, qué dato y con qué trámite asociado.*

---

### I-08 Emisión y atención de observaciones

| Campo | Tipo | Obl. | Origen |
|---|---|---|---|
| Tipo de observación | select | S | Recepción · Analista |
| Ítems observados (checklist) | multiselección | S | Vinculados a P-20/P-21 |
| Descripción y plazo | texto/fecha | S | — |
| Medio de notificación | select | S | Portal · correo · SMS |
| Atención recibida | archivo/dato | S | Lo carga el ciudadano en P-21 |
| Reingreso completo | checkbox | S | Regla: todas las observaciones en un solo reingreso |
| Estado resultante | — | — | Vuelve a **EN ANÁLISIS** o **ARCHIVADO** si vence el plazo |

---

### I-09 Edictos y publicaciones

| Campo | Tipo | Obl. | Origen |
|---|---|---|---|
| Número de edicto / expediente | texto | S | Generado en la admisión |
| Titular | texto | S | P-09 |
| Tipo de publicación | select | S | Edicto de admisión · Oposición · Notificación |
| Fecha de publicación y de vencimiento | fechas | S | — |
| Texto del edicto | texto largo | S | — |
| Publicar / retirar | botón | S | Historial inmutable |

---

### I-10 Resolución (aprobar / negar)

| Campo | Tipo | Obl. | Origen / regla |
|---|---|---|---|
| Expediente y trámite | — | S | Prellenado |
| Verificaciones concluidas (I-07) | resumen | — | Ninguna inconsistencia abierta |
| Resultado | radio | S | **APROBADA** / **NEGADA** |
| Motivo de negación (catálogo + detalle) | select/texto | Cond. | Obligatorio si es NEGADA |
| Condiciones de la resolución | texto | N | Vigencia, limitaciones, obligaciones |
| Fecha de resolución y número de resolución | fecha/texto | S | Autogenerados |
| Saldo por cancelar | numérico | N | Validado antes de la entrega |
| Vigencia del permiso (desde / hasta) | fechas | S | Alimenta P-22 y alertas de prórroga |
| Firma digital del resolutor | firma | S | — |

---

### I-11 Notificación

| Campo | Tipo | Obl. | Origen |
|---|---|---|---|
| Medio de notificación | select | S | Portal · correo · edicto · cita |
| Plazo de retiro | fecha | S | — |
| Texto de la comunicación | texto largo | S | — |
| Constancia de notificación | documento | — | Con fecha y medio; archivada en el expediente |

---

### I-12 Entrega en ventanilla

| Campo | Tipo | Obl. | Origen / regla |
|---|---|---|---|
| Identidad de quien retira | consulta | S | Documento de identidad original |
| Si es apoderado | checklist | S | Poder notariado + idoneidad + cédula |
| Documentos a entregar | multiselección | S | Resolución · carné · certificación |
| Estampado / carné digital emitido | acción | S | **A** datos biométricos; carné E → Tribunal Electoral |
| Saldos pendientes cancelados | checkbox | S | — |
| Fecha de entrega y firma de recibido | — | S | Estado → **ENTREGADO** |

---

### I-13 Expedientes archivados y reactivación

| Campo | Tipo | Obl. | Origen |
|---|---|---|---|
| Motivo de archivo | select | S | Observaciones no atendidas · No retiro en plazo · Desistimiento |
| Fecha de archivo | fecha | S | — |
| Reactivación: nuevo turno y pago | acción/checkbox | S | Reinicia en **RECIBIDO** |
| Nota de archivo | texto | N | — |

---

### I-14 Catálogos: trámites, requisitos, tasas y vigencias

| Campo | Tipo | Obl. | Origen |
|---|---|---|---|
| Código y nombre del trámite | texto | S | PM1–PM18, RP, RT, RUEX, certificados, naturalización |
| Categoría y estado legal | select | S | Fundamento (D.L. 3/2008, D.E. 320/2008, decretos vigentes) |
| Requisitos (lista editable) | filas | S | Coincide con el PDF oficial y con P-14 / I-06 |
| Vigencia por documento | numérico (días) | S | 30 / 90 días según requisito |
| Tasas y conceptos | filas | S | Tesoro Nacional, SNM, timbres, garantías |
| Verificaciones automáticas asociadas | multiselección | S | TE, CSS, Registro Público |
| Plazos oficiales | numérico | N | Ej.: cambio de nacionalidad 48 h; corrección mismo día |
| Versión y fecha de vigencia | automático | — | Toda modificación conserva la versión anterior (trámites ya presentados) |

---

### I-15 Usuarios, roles y permisos

| Campo | Tipo | Obl. |
|---|---|---|
| Nombre, cédula, cargo y sección | texto/select | S |
| Rol | select | S (Roles de la sección 1.2) |
| Permisos granulares | multiselección | S (consultar, verificar, observar, resolver, notificar) |
| Instituciones habilitadas para consultar | multiselección | S (mínimo necesario por finalidad) |
| Vigencia de la cuenta y estado | fecha/select | S |
| Último acceso | automático | — |

---

### I-16 Bitácora de auditoría

Solo lectura. Registros inmutables de: usuario, fecha/hora, IP, pantalla, acción, expediente afectado, dato consultado (interoperabilidad), creación/modificación/eliminación, exportación y fallos de autenticación. Filtros por fecha, usuario, expediente, institución y tipo de acción. Obligatorio para cumplir la **Ley 81 de 2019**.

---

### I-17 Reportes y tiempos por etapa

| Reporte | Contenido |
|---|---|
| Tiempo por etapa | Recepción → análisis → resolución → entrega (promedio, mediana, máximo) |
| Tiempo total por trámite | Base para comparar contra el rango actual de **3–8 meses** |
| Motivos de demora | Expedientes incompletos, observaciones, verificaciones fallidas |
| Volumen por trámite, oficina y analista | — |
| Cumplimiento de plazos legales | Alertas de vencimiento |
| Verificaciones interinstitucionales | Volumen y tasa de éxito por institución |
| Exportación | CSV/PDF con fecha de corte |

---

### I-18 Salud de las conexiones de interoperabilidad

| Campo | Tipo | Origen |
|---|---|---|
| Institución y endpoint | — | Catálogo de conexiones |
| Estado | verdes / ámbar / rojo | Monitoreo continuo |
| Última respuesta y tiempo de latencia | — | — |
| Tasa de error últimas 24 h | % | — |
| Modo de contingencia | select | Operación manual con verificación diferida |

---

## 6. Datos validados por interoperabilidad (TE, CSS, Registro Público)

> Esta tabla es la que **elimina los documentos repetidos**: el dato pasa a marcarse como *verificado automáticamente* en P-14 y en I-06/I-07.

| Institución | Datos que la plataforma puede validar | Trámites donde aplica | Sustituye al ciudadano… |
|---|---|---|---|
| **Tribunal Electoral (TE)** | Identidad y datos de identificación; inscripciones de matrimonio y nacimiento; certificado de cedulación; carné de Residente Permanente "E"; certificados emitidos por el Registro Civil | Residencias, dependientes, naturalización, estatus migratorio, correcciones | …el certificado de matrimonio/nacimiento impreso, la copia del carné E, el certificado de cedulación |
| **Caja de Seguro Social (CSS)** | Afiliación y número de asegurado; ficha de cuotas actualizada; paz y salvo del afiliado o de la empresa; planilla de personal panameño | Trabajo, domésticos, V-TET, espectáculos, macro-empresa, naturalización (9 cuotas) | …la ficha CSS impresa, el paz y salvo de la empresa, la planilla de mano de obra |
| **Registro Público** | Existencia de sociedades; representante legal; certificado de acciones y capital; propiedad de fincas y su estado de gravamen; aviso de operación; registro de ONG y asociaciones | Inversiones, empresas, permisos empresariales, naturalización (negocios y propiedades) | …el certificado de Registro Público, la escritura o el certificado de acciones |
| **SNM (sistemas propios)** | RUEX y su vigencia/multa; historial de entradas y salidas; permisos anteriores y su estado; expediente y resoluciones; edictos | Todos | …la copia de sello de ingreso, la copia de carnés anteriores, el historial manual de movimiento |
| **MITRADEL / DGI (si habilitan el servicio)** | Permiso de trabajo; registro de mano de obra; paz y salvo de renta | Visas de trabajo y residencias laborales | …la copia del permiso de trabajo y del paz y salvo |

**Reglas de interoperabilidad aplicables a todas las pantallas:**

1. **Solo lo necesario:** cada trámite solo solicita a cada institución los campos autorizados para su finalidad.
2. **Si no responde la fuente,** el requisito vuelve a estar en el checklist del ciudadano como carga manual (con aviso y reintentos).
3. **Toda consulta queda registrada** (I-16) con institución, dato, usuario, expediente y fecha.
4. **Discrepancia ⇒ observación automática:** si el dato retornado no coincide con lo digitado, se genera una observación en P-20/I-08 en lugar de aprobar el trámite.
5. **Sin consulta masiva:** el sistema no permite consultar datos de personas sin un expediente asociado.

---

## 7. Reglas transversales: validaciones, estados y seguridad

### 7.1 Validaciones comunes

| Regla | Pantallas |
|---|---|
| Pasaporte con vigencia mínima de **3 meses** | P-10 |
| Antecedentes penales: **30 días** de vigencia | P-14, I-06 |
| Salud, estatus migratorio, carta bancaria: **90 días** | P-14, I-06 |
| Ficha CSS: **90 días y 9 cuotas**, notariada | P-14, P-25, I-06 |
| Solvencia de dependientes: **B/.1,000.00 + B/.100.00** por dependiente | P-13 |
| Documentos del exterior: apostilla/legalización y Relaciones Exteriores | P-14 |
| Formato de foto carné 3.5 × 4.5 cm, sin lentes/gorros/escotes | P-09 |
| Montos: **B/.250.00** Tesoro Nacional, **B/.800.00** SNM y tasas específicas | P-15, I-04 |
| Un solo reingreso con **todas** las observaciones atendidas | P-21, I-08 |
| Un expediente incompleto **no se admite** | P-17, I-04 |

### 7.2 Estados (comunes a portal y módulo interno)

```
EN PREPARACIÓN → RECIBIDO → [CON OBSERVACIONES] → EN ANÁLISIS
→ [CON OBSERVACIONES / CORRECCIÓN] → ADMITIDO → EN RESOLUCIÓN
→ RESUELTO (APROBADA | NEGADA) → NOTIFICADO → ENTREGADO → ARCHIVADO
```

Estado del permiso finalizado: **VIGENTE → EN PRÓRROGA → VIGENTE** o **VENCIDO**; **INDEFINIDO**; **CANCELADO OFICIOSO**.

### 7.3 Seguridad de datos personales (Ley 81 de 2019)

* Cifrado en tránsito (TLS) y en reposo de todos los campos personales y adjuntos.
* Autenticación con MFA para todo el módulo interno (I-01).
* Autorización por rol y por institución (I-15): cada usuario ve solo lo que su función requiere.
* Bitácora de auditoría inmutable (I-16): quién, cuándo, qué dato, con qué finalidad.
* Minimización: los formularios solo piden los campos que el trámite exige legalmente.
* Finalidad y plazo: los datos se conservan según las obligaciones legales y luego se eliminan.
* Notificación de brechas y ejercicio de derechos ARCO canalizado desde P-27.
* Separación entre datos de verificación (instituciones) y datos de trámite (expediente).

---

## 8. Pendientes y datos a confirmar

1. **Tiempos por etapa:** no hay datos oficiales desglosados; la línea base es **3–8 meses**. El reporte I-17 debe medir cada etapa antes de fijar la nueva meta.
2. **Disponibilidad real de servicios:** conviene confirmar con TE, CSS y Registro Público qué campos pueden exponerse legalmente y bajo qué convenio (acuerdo de 2012 con la AIG para la Plataforma de Interoperabilidad Estatal).
3. **Pagos en línea:** definir si el SNM habilita pago electrónico o si la validación sigue siendo por cheque certificado capturado.
4. **Cobertura de ventanilla:** confirmar qué trámites quedan 100 % en línea y cuáles requieren cita presencial (fotos, huella, firma de entrevista, retiro con identificación).
5. **Versiones de requisitos:** todo trámite presentado se resuelve contra la versión de requisitos vigente al momento del envío (I-14 conserva versiones).

---

*Documento asociado: `Procesos_Migratorios_Panama.md` (requisitos oficiales), `Intercambio_Informacion_Instituciones_Migratorias.md` (arquitectura de intercambio) y `Problematica.md` (caso 2).*

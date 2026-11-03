# Matriz de fuentes y finalidad (HU-25, TASK-25.1)

Deriva de §4 de `Documentacion/07-marco-legal-y-matriz-fuentes-verificacion.md`. En el código vive en
`verificacion/MatrizFuentes.java`, que es la única fuente de estas reglas, y se consulta en
`GET /api/verificaciones/matriz`. **Borrador del Backend: falta la revisión de LT y PO** antes de darla
por formalizada.

| Fuente | Tipo / finalidad (códigos de la API) | Base legal | Responsable | Consentimiento | Modos | Qué se envía a la fuente | Qué se guarda | Aplica a |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE | `IDENTIDAD` / `IDENTIDAD_DEL_TITULAR` | Dato público y consentimiento informado (Ley 81 de 2019) | Analista con `VERIFICAR` | Vigente | Manual asistido, simulado | Tipo y número de documento | Fuente, fecha, `COINCIDE`/`NO_COINCIDE`, referencia, responsable | Todo trámite |
| CSS | `AFILIACION` / `AFILIACION_DEL_TITULAR` | Consentimiento expreso: afiliación y salud (Ley 81 de 2019; Decreto 285 de 2021) | Analista con `VERIFICAR` | **Expreso** | Manual asistido, simulado | Tipo y número de documento | Fuente, fecha, `VIGENTE`/`NO_VIGENTE`, referencia, responsable. No el número de asegurado ni las cuotas | Trámites que exigen `FICHA_CSS` |
| Registro Público | `INFORMACION_REGISTRAL` / `INFORMACION_REGISTRAL` | Dato de acceso público | Analista con `VERIFICAR` | Vigente | Manual asistido, simulado | Tipo y número de documento | Fuente, fecha, `CON_REGISTROS`, referencia, responsable. No folios ni descripciones | A pedido del despacho |
| Documentos del exterior | `LEGALIZACION` / `VIGENCIA_Y_LEGALIZACION` | Consentimiento expreso: antecedentes penales (Ley 81 de 2019) | Analista con `VERIFICAR` | **Expreso** | Solo manual asistido | Nada (el cliente aporta el documento) | Fuente, fecha, `VIGENTE`/`NO_VIGENTE`, referencia, responsable | Trámites que exigen `ANTECEDENTES_PENALES` |

El SNM no está en la matriz: no es fuente de datos del despacho (fila 5 del documento 07, `NO APLICABLE`).
Una verificación del SNM responde 403 `FUENTE_NO_AUTORIZADA`.

## Reglas que aplica el Backend

1. **Antes de emitir o registrar** (CA-2), en este orden: permiso `VERIFICAR` sobre el expediente,
   fuente presente en la matriz, finalidad y tipo de la fila, modo permitido y consentimiento del
   titular (expreso cuando la fila lo pide). Si algo falta, no se consulta ninguna fuente y la
   denegación queda en auditoría.
2. **Minimización de la petición** (CA-3): el adaptador recibe solo los campos de "Qué se envía". El
   nombre del titular no sale: el adaptador del TE lo coteja en local y lo descarta.
3. **Resultado mínimo** (CA-4): `resultadoMinimo` es un vocabulario cerrado (también lo restringe la base
   de datos) y debe corresponder a la fuente. La tabla `verificacion` no tiene columnas para la respuesta
   de la fuente.
4. **Logs y auditoría** (CA-5): solo identificadores, fuente, modo, estado, intentos y correlación.
   `Consulta.toString()` oculta documento y nombre para evitar fugas por un log descuidado.

Pruebas: `AdaptadoresContratoTest` (qué sale hacia la fuente y qué queda en los registros) y
`VerificacionesTest` (validación previa y contenido de la base y la auditoría).

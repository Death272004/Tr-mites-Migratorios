# TASK-32.2 · Manual de usuario por rol

**Sistema:** Trámites Migratorios · **Sprint:** 7
**Estado:** revisión local

## 1. Acceso

1. Abra el portal local.

2. Ingrese correo y contraseña.

3. Seleccione el perfil autorizado cuando la pantalla lo solicite.

4. Cierre sesión desde el menú de usuario al terminar.

Use únicamente cuentas ficticias en pruebas. No comparta contraseñas ni tokens.

## 2. Solicitante

El rol `SOLICITANTE` usa el portal del cliente y solo consulta sus propios trámites.

### Crear una solicitud

1. Abra **Mis trámites → Nueva solicitud**.

2. Seleccione el motivo, país del trámite y forma de presentación.

3. Complete **Titularidad y representación**.

4. Complete **Datos personales**.

5. Adjunte los documentos solicitados.

6. Revise requisitos, pagos, declaración y firma.

7. Envíe la solicitud y conserve el número de expediente.

Los campos marcados como obligatorios deben completarse. Los campos opcionales solo se habilitan cuando la respuesta correspondiente es afirmativa.

### Seguimiento

Use **Estado del trámite**, **Observaciones**, **Subsanación**, **Resultados**, **Historial de pagos** y **Edictos y citaciones** para consultar el expediente propio.

### Datos de demostración

El tipo **Pasante de bufete** puede activar **Datos de prueba · Solo demostración** y seleccionar una persona ficticia. En ese modo puede editar los datos de la persona ficticia. Los solicitantes normales tienen protegidos los datos de identidad cargados desde su cuenta.

## 3. Funcionario del bufete

El funcionario trabaja en el módulo interno:

1. Abra el **Tablero**.

2. Revise expedientes asignados.

3. Use **Recepción** y **Completitud** para revisar documentos.

4. Asigne o consulte análisis y verificaciones.

5. Registre observaciones y resultados.

6. Envíe el expediente a la siguiente etapa permitida.

Solo un funcionario con permiso granular de resolución puede aprobar o negar. Un error técnico de una fuente no equivale a un resultado negativo.

## 4. Pasante institucional

Un funcionario con área institucional RP, CSS o TE ve únicamente **Expedientes asignados**, **Verificaciones de mi área** y **Observaciones**. Puede consultar la verificación asignada, adjuntar el resultado autorizado y registrar observaciones. No puede aprobar trámites ni consultar expedientes fuera de su asignación.

## 5. Supervisor

El supervisor usa **Tablero**, **Reportes y tiempos** y verificaciones en modo lectura. Supervisa volumen, tiempos y estados del ámbito autorizado, sin modificar resoluciones.

## 6. Auditor

El auditor usa **Bitácora**, **Consentimientos** en lectura y **Reportes y tiempos**. Su acceso es de solo lectura y sirve para comprobar trazabilidad, accesos, cambios y denegaciones.

## 7. Administrador

El administrador gestiona **Catálogos**, **Usuarios y roles** y **Salud de conexiones**. Administra cuentas y permisos, pero no decide expedientes por el solo hecho de ser administrador.

## 8. Documentos y archivos

- Adjunte solo archivos del trámite y en el formato/tamaño aceptado por la pantalla.

- Compruebe que el documento corresponde al expediente correcto.

- No use enlaces públicos para documentos privados.

- La descarga y consulta deben realizarse dentro de una sesión autenticada.

## 9. Mensajes frecuentes

| Situación | Acción |
| - | - |
| Sesión expirada | Inicie sesión nuevamente. |
| No tiene permiso | Solicite al responsable que revise el rol o permiso granular. |
| Falta un documento | Abra la sección de requisitos y adjunte el archivo pendiente. |
| Error técnico de verificación | Registre la incidencia y reintente según el flujo; no lo marque como resultado negativo. |
| Cambios no visibles | Recargue con `Ctrl+F5, o renicie conpilado.` |


## 10. Evidencia de uso

Para una prueba de aceptación capture:

- Rol utilizado.

- Pantalla y ruta.

- Datos ficticios empleados.

- Acción realizada.

- Resultado esperado y obtenido.

- Fecha, hora y evidencia visual.

Este manual queda en revisión local y no se sube a GitHub hasta la aprobación del Product Owner.

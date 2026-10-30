# HU-30 — Evaluación con usuarios
Estado: preparado; sesiones pendientes. No constituye evidencia de ejecución.

## Preparación
QA y PO revisan este guion antes de las sesiones. Registrar fecha, commit, URL local de pruebas y navegador en sesiones.csv. Usar solo cuentas y expedientes ficticios. No usar nombres, correos, contraseñas ni tokens de participantes; identificar U01 a U05.
Cada participante prueba cinco tareas, con la cuenta adecuada al rol. No se cambian permisos para facilitar la prueba. Hacer las tareas sobre backend real, sin fixtures que simulen resultados. Registrar el dispositivo y tamaño de ventana; cubrir escritorio y tablet (768 px) en el conjunto y repetir tareas críticas en ambos tamaños al verificar correcciones.

## Guion para el participante
1. Crear expediente: iniciar una solicitud de residencia temporal y obtener su número.
2. Adjuntar documento: agregar un PDF ficticio al expediente y confirmar que aparece.
3. Consultar estado: localizar el expediente y explicar su estado actual.
4. Revisar: con cuenta interna, localizar expediente y consultar documentos e historial.
5. Decidir: con cuenta autorizada y expediente previamente preparado para resolución, registrar decisión y verificar resultado. Si faltan prerrequisitos o el flujo no está conectado, registrar bloqueo, no éxito.

El facilitador lee el objetivo sin explicar dónde pulsar. Cronometrar desde el inicio hasta confirmación del resultado. Registrar segundos, errores, dificultades y cualquier ayuda. Si se presta ayuda, asistencia=si aunque la tarea termine. Un bloqueo es un resultado fallido. No sustituir resultados por opiniones ni pruebas automáticas.

## Registro
Completar sesiones.csv: una fila por participante y tarea (25 filas). fecha, commit, entorno_url, navegador, viewport, segundos, errores, completada (si/no), asistencia (si/no), dificultad y evidencia. Solo resultados reales.
Registrar hallazgos en hallazgos.csv: severidad, responsable, decisión de prioridad con PO, corrección/commit y evidencia de repetición.

## Éxito y reevaluación
Meta del backlog: al menos 90 % de las tareas críticas completadas sin asistencia. Para 25 ejecuciones se necesitan al menos 23 completadas sin ayuda (92 %). Reportar también resultado por tarea para evitar ocultar una operación problemática. No excluir bloqueos del denominador.
Tras corregir problemas prioritarios, repetir las tareas críticas afectadas y registrar una ronda nueva; conservar los resultados originales, sin sobrescribirlos. Verificar mensajes de campos obligatorios y errores, teclado, foco y coherencia entre escritorio y tablet.
El cierre requiere sesiones de cinco personas, métricas, priorización con PO, correcciones y reevaluación documentadas, y evidencia en ambos tamaños. Si no se cumple la meta o queda un criterio sin comprobar, HU-30 permanece en revisión.

## Informe final
Adjuntar: commit probado, participantes anónimos, fechas, dispositivos, total completado sin asistencia / total, porcentaje, resultados por tarea, hallazgos prioritarios, commits de corrección y métricas de reevaluación. Marcar cada criterio del backlog como cumple/no cumple con su evidencia. Ningún estado de TeamTrack se modifica con este documento.

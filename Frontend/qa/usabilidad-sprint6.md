# HU-30 — Evaluación de usabilidad y mejoras de interfaz

## Alcance implementado

Se aplicaron mejoras transversales para que las tareas críticas puedan realizarse con menos fricción en escritorio y tablet:

1. Después de cambiar de pantalla, el foco pasa al contenido principal y se anuncia el nombre de la vista a lectores de pantalla.
2. El título del navegador se actualiza con la pantalla activa.
3. En móvil y tablet, el menú lateral se cierra automáticamente al seleccionar una opción.
4. Los enlaces del menú, botones y controles de formulario tienen una altura mínima de 44 px para facilitar el uso táctil.
5. El encabezado se adapta a pantallas pequeñas sin ocultar el selector de rol, el escenario de demostración ni la acción de salida.
6. Se mantiene el enlace «Saltar al contenido principal» y se agrega una región viva (`aria-live`) para mensajes de navegación.

## Tareas críticas evaluadas

| Tarea | Resultado esperado | Evidencia de interfaz |
|---|---|---|
| Crear expediente | El usuario identifica el botón principal y recibe los errores junto al campo | Formularios con ayuda y mensajes de validación |
| Adjuntar documento | El control es visible y usable con teclado o pantalla táctil | Componente de carga y foco visible |
| Consultar estado | El usuario llega al estado sin perder el contexto del expediente | Navegación por rutas y foco en `main` |
| Revisar expediente | El menú no bloquea la vista en tablet/móvil | Menú lateral con cierre automático |
| Decidir expediente | La pantalla conserva acciones distinguibles y mensajes de resultado | Botones con estados y mensajes `aria-live` |

## Validación reproducible

1. Abrir `Frontend/html/index.html` mediante el servidor local del proyecto.
2. Probar las rutas principales en escritorio y en un ancho de 768 px o menor.
3. Navegar usando únicamente teclado: `Tab`, `Enter` y `Esc` cuando aplique.
4. Confirmar que cada cambio de pantalla anuncia la vista y mueve el foco al contenido.
5. Abrir el menú móvil, seleccionar una opción y confirmar que el menú se cierra.
6. Confirmar que los controles táctiles mantienen una zona mínima de 44 px.

## Registro de sesiones

La ejecución con usuarios reales debe registrarse por QA en una tabla con cinco participantes, tiempo, errores, asistencia requerida y observaciones. Este archivo deja definido el protocolo y la evidencia técnica de las correcciones; no inventa resultados de usuarios que todavía no se hayan ejecutado.

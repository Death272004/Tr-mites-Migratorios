# QA – Sprint 2: Entorno, autorización y errores

## Objetivo

Comprobar que el entorno se puede levantar de forma reproducible y que el acceso por rol, la autenticación y el manejo de errores no exponen información sensible.

## Actividades de QA

- Levantar el entorno con Docker desde una instalación limpia.
- Probar autenticación correcta e incorrecta.
- Verificar acceso permitido y denegado para cada rol.
- Probar respuestas 400, 401, 403, 404, 409 y 5xx.
- Revisar que los errores no muestren trazas ni datos personales.
- Validar listados, consultas e integridad de datos ficticios.

## Evidencias esperadas

- Registro del arranque limpio.
- Matriz de autorización por rol y endpoint.
- Casos positivos y negativos de login.
- Evidencias de códigos de error.
- Incidencias encontradas y re-verificación de correcciones.

## Evidencia registrada

Los resultados de la suite automatizada están en [pruebas.md](pruebas.md).

## Informe PDF

Consulta el informe completo en [qa.pdf](qa.pdf).

## Criterio de cierre

Los casos críticos de autenticación y autorización deben estar en verde; ningún error debe revelar credenciales, documentos, datos personales ni trazas internas.

## Estado

Alcance de pruebas documentado. Los resultados deben enlazarse cuando se ejecuten en el entorno correspondiente.

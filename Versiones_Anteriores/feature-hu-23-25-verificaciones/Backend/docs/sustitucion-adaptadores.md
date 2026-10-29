# Sustituir el modo simulado por una integración autorizada (HU-23, TASK-23.6)

**Hoy no existe convenio ni API disponible** con el TE, la CSS ni el Registro Público (fila 7 del
documento 07: la vía AIG está `PENDIENTE DE CONVENIO`). El modo de producción es el **manual asistido**;
el modo simulado solo sirve para demostrar el flujo y conectar el Frontend. Este documento describe qué
haría falta si en el futuro se firma un convenio. **Borrador del Backend para que DOC y LT lo completen.**

## Cómo está construido

```
Verificaciones (orquestación) ──► Puertos.TePort / CssPort / RegistroPublicoPort
                                         ▲
                       TeSimulado, CssSimulado, RegistroPublicoSimulado
                       (sobre fuentes/FuentesSimuladas y el fixture del Sprint 1)
```

- `verificacion/adaptadores/Puertos.java` define el contrato común: `consultar(Consulta)` devuelve
  siempre una `Respuesta` normalizada (fuente, estado técnico, resultado mínimo, referencia, fecha,
  responsable). Un fallo de la fuente se devuelve como estado técnico, nunca como excepción.
- La orquestación (`Verificaciones`) y el expediente no importan ninguna clase de `fuentes` ni de los
  adaptadores simulados: reciben los puertos por inyección (`List<PuertoFuente>`).
- El registro manual asistido (`RegistroManualAsistido`) produce la misma `Respuesta`.

## Pasos para una integración real

1. **Requisitos previos (no técnicos):** convenio firmado con la institución o con la AIG, autorización
   expresa del titular para esa vía, actualización del documento 07 y de la matriz de fuentes y
   finalidad (`MatrizFuentes.java` y `matriz-fuentes-finalidad.md`), y registro en el *Registro de
   cambios del backlog*.
2. **Nueva implementación del puerto**, p. ej. `TeAig implements TePort`, en
   `verificacion/adaptadores`. Debe:
   - enviar solo `consulta.tipoDocumento()` y `consulta.numeroDocumento()` (o los campos que fije la
     matriz actualizada);
   - traducir la respuesta institucional al `ResultadoMinimo` y descartar el resto;
   - devolver `TIEMPO_AGOTADO`, `LIMITE_EXCEDIDO`, `ERROR_TECNICO` o `RESPUESTA_INVALIDA` ante fallos;
   - ignorar `consulta.escenario()`, que solo atienden los simulados.
   Puede extender `AdaptadorSimulado` para reutilizar el timeout y la traducción de fallos, o
   implementar el puerto directamente.
3. **Activar una sola implementación por fuente.** Hoy los simulados son `@Component`. Al agregar la real,
   condicionar ambas con una propiedad, p. ej.
   `@ConditionalOnProperty(name = "app.verificaciones.fuentes.te.modo", havingValue = "simulado")`, para
   que la orquestación reciba un único puerto por fuente.
4. **Configuración:** URL, certificados y credenciales por variables de entorno (ver
   `docs/ENTORNOS-Y-SECRETOS.md`), nunca en el repositorio. Ajustar `timeout-ms`, `reintentos-maximos` y
   `espera-base-ms` de la fuente en `application.yml` según el acuerdo de nivel de servicio del convenio.
5. **Contrato y pruebas:** ejecutar contra la nueva implementación los mismos escenarios de
   `AdaptadoresContratoTest` (respuesta válida, sin resultado, error técnico, timeout, límite y respuesta
   inválida) con un doble del servicio institucional, y agregar las pruebas de minimización de la petición.
6. **Sin cambios** en `Verificaciones`, `Verificacion`, `Transiciones`, la API ni el Frontend: el modo
   sigue registrándose como `SIMULADO` o `MANUAL_ASISTIDO` hasta que el PO decida si hace falta un modo
   `AUTOMATICO` (cambio de contrato que se anotaría en `CHANGELOG-api.md`).

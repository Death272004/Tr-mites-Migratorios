# Evidencia de validación — Sprint 5 Backend (HU-23, HU-24, HU-25)

**Rama:** `feature/hu-23-25-verificaciones` (PR #13 contra `Backend`)  
**Commit probado:** `3756581`  
**Fecha:** 2026-10-22  
**Ejecución:** GitHub Actions, workflow `Backend - pruebas`, run [39816552000](https://github.com/Death272004/Tr-mites-Migratorios/actions/runs/39816552000)  
**Reportes:** artefacto `reportes-pruebas-backend` de esa ejecución (Surefire, 30 días)

## Comando

```bash
cd Backend
./mvnw -B -ntp verify
```

Corre en `ubuntu-latest` con Java 17 (Temurin) y PostgreSQL 16 levantado por Testcontainers. Las migraciones de Flyway, incluida `V5__verificaciones_orquestacion.sql`, se aplican sobre una base limpia.

## Resultado

**96 pruebas, 0 fallos, 0 errores, 0 omitidas. `BUILD SUCCESS`.**

| Clase | Pruebas | Resultado |
| --- | ---: | --- |
| `AdaptadoresContratoTest` | 18 | Aprobada |
| `VerificacionesTest` | 10 | Aprobada |
| `EstadosTest` | 8 | Aprobada |
| `FuentesSimuladasTest` | 6 | Aprobada |
| `AutorizacionTest` | 5 | Aprobada |
| `AutenticacionTest` | 9 | Aprobada |
| `CuentaTest` | 9 | Aprobada |
| `ExpedienteTest` | 8 | Aprobada |
| `DocumentoTest` | 6 | Aprobada |
| `PrivacidadTest` | 5 | Aprobada |
| `AuditoriaTest` | 5 | Aprobada |
| `ErroresYModeloTest` | 5 | Aprobada |
| `BackendApplicationTests` | 2 | Aprobada |

En la primera ejecución (run 39815288112) falló 1 de las 96 pruebas: `EstadosTest` registraba una verificación con un responsable inexistente (`UUID.randomUUID()`) y la base lo rechazó por la clave foránea. Era un error de la prueba, no del código. Se corrigió en `3756581` usando el usuario del despacho.

## Criterios cubiertos por las pruebas

| HU | Criterio | Prueba |
| --- | --- | --- |
| HU-23 | Contrato común y respuesta normalizada de TE, CSS y Registro Público en los seis escenarios | `AdaptadoresContratoTest` |
| HU-23 | El registro manual asistido produce la misma respuesta | `elRegistroManualProduceLaMismaRespuestaNormalizada`, `elRegistroManualAsistidoGuardaElResponsableHumano` |
| HU-24 | Las verificaciones que aplican al trámite se crean sin duplicar | `laPreparacionCreaLasQueAplicanAlTramiteSinDuplicar` |
| HU-24 | Un error técnico programa un reintento y nunca cuenta como resultado negativo | `unErrorTecnicoProgramaUnReintentoYNuncaEsResultadoNegativo`, `unFalloProgramaReintentosConEsperaYAlAgotarseQuedaEnErrorTecnico` |
| HU-24 | Los reintentos tienen tope y luego se pasa a cotejo manual | `losReintentosTienenTopeYLuegoSeCotejaAMano` |
| HU-24 | Una petición repetida con `Idempotency-Key` no duplica la operación | `unaPeticionRepetidaNoDuplicaLaOperacion` |
| HU-24 | Una verificación resuelta no cambia de estado | `unaVerificacionResueltaNoCambiaMas` |
| HU-25 | Sin finalidad, fuente autorizada o consentimiento no se consulta la fuente | `sinFinalidadFuenteOConsentimientoNoSeVerifica` |
| HU-25 | A la fuente solo se envía el documento, y el nombre se coteja en local | `haciaLaFuenteSoloSaleElDocumento`, `elTeCotejaElNombreEnLocal` |
| HU-25 | Solo se guarda el resultado mínimo | `elModoSimuladoConsultaLasFuentesYGuardaSoloElResultadoMinimo` |
| HU-25 | El cliente solo ve el estado agregado | `elClienteSoloVeElEstadoAgregado` |
| HU-25 | La matriz de fuentes y finalidad se puede consultar | `laMatrizDeFuentesYFinalidadEsConsultable` |
| HU-13 | Las rutas nuevas respetan la matriz de autorización | `AutorizacionTest` |

## Validaciones adicionales

- `Backend/docs/openapi.yaml` 0.5.0: el YAML es válido, tiene 33 rutas y ninguna referencia `$ref` rota.
- Datos de prueba ficticios: documento `XF0000002` y el fixture de `fuentes-simuladas.json`.

## Pendiente

1. Revisión de LT y PO de `Backend/docs/matriz-fuentes-finalidad.md` (TASK-25.1).
2. Completar `Backend/docs/sustitucion-adaptadores.md` (TASK-23.6, DOC/LT).
3. Ampliación de pruebas de QA (TASK-24.4 y 25.4) e integración del Frontend (HU-26).

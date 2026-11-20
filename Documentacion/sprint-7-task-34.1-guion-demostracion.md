# TASK-34.1 · Datos ficticios y guion de demostración

## Objetivo

Demostrar el flujo principal del MVP con datos ficticios, sin consultar instituciones reales ni usar credenciales reales.

## Datos del escenario

| Elemento | Valor de demostración |
|---|---|
| Solicitante | Daniela Anaya · Turista |
| Documento | Pasaporte `CO-DEMO-1001` |
| Correo | `daniela.anaya@tr-utp.com` |
| Expediente | `EXP-2026-000004` |
| Motivo | Estudios |
| Fuentes | TE, CSS, RP y SNM simuladas |
| Resultado técnico | Una consulta normal y una consulta con error técnico controlado |

Para demostrar datos editables se puede usar el usuario Pasante de Bufete con **Datos de prueba · Solo demostración** y una persona ficticia. No se deben mezclar datos de demostración con cuentas reales.

## Guion

1. Abrir el portal local e iniciar sesión.
2. Crear una solicitud y seleccionar el tipo de solicitante y el motivo.
3. Completar los datos personales y verificar que los campos de una cuenta normal estén protegidos.
4. Avanzar por titularidad, domicilio, situación y requisitos.
5. Adjuntar documentos ficticios.
6. Registrar consentimiento informado.
7. Ejecutar verificaciones simuladas y mostrar un resultado normal.
8. Ejecutar una fuente con error técnico y mostrar que no se convierte en resultado negativo.
9. Registrar una observación y revisar el historial del expediente.
10. Mostrar decisión, notificación, entrega y derechos ARCO según el rol autorizado.
11. Cerrar mostrando las limitaciones: datos ficticios, fuentes simuladas y ausencia de convenios institucionales reales.

## Evidencias a preparar

- Captura del login y perfil.
- Captura del expediente y documentos.
- Captura del consentimiento.
- Captura de verificaciones normal y con error técnico.
- Captura del historial y resultado final.

## Estado

**Guion preparado localmente.** Pendiente de ensayo en TASK-34.2. No se modificó código ni se hizo commit o push.

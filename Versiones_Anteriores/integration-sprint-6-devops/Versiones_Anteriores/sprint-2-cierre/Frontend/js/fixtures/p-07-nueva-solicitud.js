/**
 * Fixture P-07 · Nueva solicitud · escenario base (éxito).
 * Catálogo de trámites alineado a la sección 4 de la documentación.
 * Mismo envelope `{ meta, data, error }` que los mocks de la HU-08 (§2.5).
 * [A] = obtenible por interoperabilidad en el futuro convenio.
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("P-07", "exito", {
    meta: {
      pantalla: "P-07",
      titulo: "Nueva solicitud",
      escenario: "exito",
      esquema: "hu-08/v1",
      nota: "Catálogo ficticio de demostración (sin datos reales).",
    },
    data: {
      requisitosArt28: [
        "Poder y solicitud notariados",
        "3 fotos carné",
        "Pasaporte cotejado",
        "Antecedentes penales",
        "Certificado de salud",
        "Cheque B/.250.00 (Tesoro Nacional)",
        "Cheque B/.800.00 (SNM)",
        "Declaración jurada de antecedentes",
      ],
      motivos: ["Trabajo", "Inversión", "Familia", "Estudios", "Religión", "Humanitario", "Otro"],
      paises: [
        { value: "PA", label: "En Panamá" },
        { value: "EX", label: "En consulado en el exterior" },
      ],
      catalogo: [
        {
          value: "REGISTRO_EXTRANJERIA",
          label: "Registro de Extranjería",
          residencia: false,
          tramites: [
            { nombre: "Confección de Registro de Filiación", req: ["Puesto y fecha del sello de ingreso", "Número de pasaporte", "Generales del pasaporte", "Copia del sello de ingreso", "2 fotos carné", "Tiquete B", "Tasa B/.5.00"] },
            { nombre: "Filiación con pre-registro en línea", req: ["Datos del pre-registro (folio)", "Generales del pasaporte", "Copia del sello de ingreso", "2 fotos carné", "Tiquete B", "Copia de la visa de entrada (si procede)", "Tasa B/.5.00"] },
            { nombre: "Cambio de residencia", req: ["Escritura pública notariada o contrato de arrendamiento notariado o carta de responsabilidad / certificación de juez de paz", "Recibo de servicios públicos", "Copia de carné o cédula", "Nuevo país/provincia/distrito/corregimiento/dirección", "Tipo de tenencia"] },
            { nombre: "Traspaso de sello (cambio de pasaporte)", req: ["Generales de ambos pasaportes", "Copia del sello de registro anterior", "Copia de carné/cédula", "Denuncia (si perdió el pasaporte)", "Tiquete X"] },
            { nombre: "Cambio de nacionalidad", req: ["Nota formal al Director General (original y copia, Ventanilla 42)", "Generales de pasaporte actual y anterior", "Sello del pasaporte anterior", "Nacionalidad anterior y nueva", "Motivo", "Plazo 48 h"] },
            { nombre: "Correcciones a filiación", req: ["Copia simple de generales del pasaporte y del sello, o de los documentos de Certificaciones", "Dato erróneo: valor actual y valor correcto", "Campo afectado"] },
          ],
        },
        {
          value: "VISAS_NO_RESIDENTE",
          label: "Visas no residente",
          residencia: false,
          tramites: [
            { nombre: "Visa de Turista (PM1)", req: ["Pasaporte con vigencia ≥ 3 meses", "Reservación o tiquete", "Identificación del país de domicilio", "3 fotos", "Prueba de solvencia ≥ B/.500.00", "Carta de invitación (cédula del invitante, pasaporte y servicios públicos)", "B/.50.00"] },
            { nombre: "Turista en tránsito (PM2)", req: ["2 fotos", "Pasaporte vigencia ≥ 3 meses", "Itinerario de continuación", "Identidad del país de domicilio", "Carta de invitación", "Pago consular", "Mínimo 15 días hábiles antes"] },
            { nombre: "Extensión de visa de turista (PM3)", req: ["Copia del pasaporte", "Tiquete pagado", "Reservación de hotel", "Justificación", "Solvencia ≥ B/.500.00", "Declaración notarial del invitante", "Antes del vencimiento"] },
            { nombre: "Visa múltiple no residente (PM5)", req: ["Pasaporte notariado", "Solvencia", "Carta de la empresa con Registro Público y carta bancaria", "Reserva aérea y de hotel", "Identidad del país de domicilio", "Idoneidad del abogado"] },
            { nombre: "Trabajador remoto / nómada digital (PM18)", req: ["Ingreso anual ≥ B/.36,000.00", "Póliza de seguro médico con cobertura en Panamá", "Certificación de existencia de la empresa", "Carta de la empresa (ingreso ≥ B/.3,000.00)", "Declaración de no trabajar para clientes locales", "B/.250.00", "Carné B/.50.00"] },
          ],
        },
        {
          value: "RESIDENTE_TEMPORAL",
          label: "Residente temporal",
          residencia: true,
          tramites: [
            { nombre: "Personal del Gobierno / entidades autónomas", req: ["Carta institucional", "Nombramiento", "Permiso de trabajo (A)"] },
            { nombre: "Empresas con contrato con el Gobierno", req: ["Contrato con el Estado", "Registro de la empresa (A)"] },
            { nombre: "Ejecutivos Zona Libre de Colón", req: ["Certificación de la empresa", "Permiso de trabajo (A)", "Paz y salvo (A)"] },
            { nombre: "Inversión agraria (PRT-AI)", req: ["Título de propiedad o arriendo", "Plan de actividad", "Permisos"] },
            { nombre: "Investigador – Ciudad del Saber", req: ["Carta de la fundación", "Proyecto e institución"] },
          ],
        },
        {
          value: "RESIDENTE_PERMANENTE",
          label: "Residente permanente",
          residencia: true,
          tramites: [
            { nombre: "Regularización general 235 (PRP-RMG)", req: ["Carné original de 6 años", "Antecedentes apostillados", "Cheques B/.250.00 + B/.800.00 + B/.900.00", "Prueba de domicilio", "Documento de arraigo (actas (A), permiso de trabajo (A), paz y salvo DGI)"] },
            { nombre: "Inversión forestal (PRP-FOR)", req: ["Certificación CPA", "Certificado de acciones", "Resolución del Ministerio de Ambiente", "Registro Público de la empresa y del inmueble", "Certificación bancaria (A)"] },
            { nombre: "Depósito a plazo fijo (PRP-SEP-DPF)", req: ["Monto B/.300,000.00", "Plazo ≥ 3 años", "Certificación bancaria del depósito libre de gravamen", "Copia autenticada del certificado"] },
            { nombre: "Rentista retirado (PRP-RR)", req: ["Renta mensual ≥ B/.850.00", "Duración ≥ 5 años", "Certificación bancaria (BNP o Caja de Ahorros) libre de gravamen", "Copia autenticada del plazo fijo"] },
            { nombre: "Casado con panameño(a) (PRP-2/3)", req: ["Certificado de matrimonio inscrito (A)", "Cédula del cónyuge (A)", "Entrevista si el matrimonio tiene menos de 2 años"] },
          ],
        },
        {
          value: "PROCESOS_ESPECIALES",
          label: "Procesos especiales",
          residencia: false,
          tramites: [
            { nombre: "Asistencia humanitaria (PM16)", req: ["Carta del Ministerio de Relaciones Exteriores (requisito único)"] },
            { nombre: "Protección de Seguridad Humanitaria (PPSH)", req: ["Poder y solicitud", "Antecedentes apostillados", "Certificado de salud", "Registro de mano de obra MITRADEL (A)", "Comprobante de domicilio", "B/.800.00 + B/.250.00 + B/.100.00 + B/.100.00"] },
            { nombre: "Refugiados (ONPAR)", req: ["Solicitud", "Resolución ONPAR con sello de notificado", "Registro B/.5.00", "Carné B/.10.00", "Hechos que motivan la protección"] },
            { nombre: "Regularización RMG 235 (permiso temporal)", req: ["Carné original", "Antecedentes apostillados", "Certificado de salud", "Domicilio", "B/.250.00 + B/.800.00 + B/.400.00"] },
          ],
        },
        {
          value: "CERTIFICACIONES",
          label: "Certificaciones",
          residencia: false,
          tramites: [
            { nombre: "Estatus migratorio", req: ["Carné", "Entidad de uso", "Leyenda 'para uso de Naturalización'", "B/.10.00 (o timbres B/.8.00)", "Carné E (A) TE"] },
            { nombre: "Movimiento migratorio (adulto/menor)", req: ["Entidad destino", "Pasaportes anteriores"] },
            { nombre: "Naturalización", req: ["Ver flujos N-1 a N-13 en P-26"] },
          ],
        },
        {
          value: "NATURALIZACION",
          label: "Naturalización",
          residencia: false,
          tramites: [
            { nombre: "Naturalización (flujos N-1 a N-13)", req: ["Ver P-26 para el flujo completo", "Solicitud y poder notariados", "Antecedentes penales", "Certificado de salud", "Constancia de residencia"] },
          ],
        },
      ],
    },
    error: null,
  });
})(window);
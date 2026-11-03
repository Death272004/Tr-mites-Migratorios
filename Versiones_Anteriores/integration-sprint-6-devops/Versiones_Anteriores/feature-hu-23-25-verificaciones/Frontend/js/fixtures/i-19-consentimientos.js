/**
 * Fixture I-19 · Consentimientos del titular · escenario base (éxito).
 * Regla: consentimiento informado vigente para operar (Ley 81/DE 285); expreso
 * para datos sensibles (salud, antecedentes). Datos ficticios (CP-13).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-19", "exito", {
    meta: { pantalla: "I-19", titulo: "Consentimientos del titular", escenario: "exito", esquema: "hu-08/v1", nota: "Gestión de consentimientos (informado y expreso). Revocación sin efecto retroactivo." },
    data: {
      aviso: "El cliente opera con consentimiento informado vigente (Ley 81 de 2019 y DE 285 de 2021). Para datos sensibles (salud, antecedentes) se exige consentimiento expreso. La revocación no tiene efecto retroactivo; queda trazada en la bitácora (I-16).",
      resumen: { vigentes: 3, revocados: 1, porVencer: 1 },
      consentimientos: [
        { id: "C-001", titular: "María Demo", documento: "Pasaporte · 123456789", expediente: "SM-2026-00123", tipo: "Informado", finalidad: "Trámite de residencia permanente", fecha: "2026-03-12", vigencia: "2027-03-12", responsable: "Lic. Pedro Ruiz", estado: "vigente", nota: "Finalidad declarada; destinatarios: TE, CSS, Registro Público y SNM." },
        { id: "C-002", titular: "María Demo", documento: "Pasaporte · 123456789", expediente: "SM-2026-00123", tipo: "Expreso (datos sensibles)", finalidad: "Datos de salud — certificado médico (naturalización)", fecha: "2026-04-02", vigencia: "2026-07-01", responsable: "Lic. Ana Solís", estado: "por vencer", nota: "Dato sensible: consentimiento previo y expreso. Vigencia corta (90 días)." },
        { id: "C-003", titular: "Carlos Vega", documento: "Cédula · 8-777-777", expediente: "SM-2026-00098", tipo: "Informado", finalidad: "Trámite de permiso de trabajo", fecha: "2026-02-20", vigencia: "2027-02-20", responsable: "Lic. Pedro Ruiz", estado: "vigente", nota: "Opera además por representación acreditada." },
        { id: "C-004", titular: "Luisa Núñez", documento: "Pasaporte · 987654321", expediente: "SM-2026-00110", tipo: "Informado", finalidad: "Trámite de residencia temporal", fecha: "2025-11-05", vigencia: "2026-11-05", responsable: "Lic. Ana Solís", estado: "revocado", nota: "Revocado por el titular el 2026-09-30; sin efecto retroactivo." },
        { id: "C-005", titular: "Jorge Batista", documento: "Cédula · 8-555-555", expediente: "SM-2026-00131", tipo: "Informado", finalidad: "Certificación de estatus migratorio", fecha: "2026-05-14", vigencia: "2027-05-14", responsable: "Lic. Pedro Ruiz", estado: "vigente", nota: "Consentimiento vigente; verificaciones solo con finalidad declarada (I-07)." }
      ]
    },
    error: null,
  });
})(window);

/**
 * Fixture I-01 · Login institucional con MFA · escenario base (éxito).
 * Usuarios de prueba por rol interno (MVP, sin directorio real).
 * Mismo envelope `{ meta, data, error }` que los mocks de la HU-08 (§2.5).
 */
(function (g) {
  "use strict";
  g.tm.fixtures.register("I-01", "exito", {
    meta: {
      pantalla: "I-01",
      titulo: "Acceso institucional",
      escenario: "exito",
      esquema: "hu-08/v1",
      nota: "Usuarios ficticios del despacho. MFA simulado: sin credenciales ni secretos reales (CP-01/CP-02).",
    },
    data: {
      usuarios: [
        { rol: "FUNCIONARIO", rolLabel: "Funcionario (abogado analista)", usuario: "analista", clave: "Interno123!" },
        { rol: "SUPERVISOR", rolLabel: "Supervisor", usuario: "supervisor", clave: "Interno123!" },
        { rol: "AUDITOR", rolLabel: "Auditor", usuario: "auditor", clave: "Interno123!" },
        { rol: "ADMIN", rolLabel: "Administrador", usuario: "admin", clave: "Interno123!" },
      ],
      mfa: {
        longitud: 6,
        codigoDemo: "123456",
        nota: "MFA simulado en el MVP: use 123456 o cualquier código de 6 dígitos.",
      },
      estacion: "WKS-DEMO-01",
      ip: "10.0.0.24",
    },
    error: null,
  });
})(window);

/**
 * P-01 — Inicio de sesión (vista del portal cliente).
 * Criterios: validaciones en cliente, mensaje genérico de fallo (CP-02).
 * Online: POST /api/auth/login. Offline (file://): demo inline con usuarios ficticios.
 * Script clásico: expone `tm.views.p01.renderP01`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;

  // Demo offline (sin backend): mismos usuarios ficticios que crea DatosDemo en el backend.
  var DEMO_PASS = "Demo-Tramites-2026";
  var DEMO_USERS = {
    "cliente@demo.pa": { rol: "SOLICITANTE", nombre: "Carla Cliente (ficticia)" },
    "cliente2@demo.pa": { rol: "SOLICITANTE", nombre: "Tomás Titular (ficticio)" },
    "abogado@demo.pa": { rol: "SOLICITANTE", nombre: "Ana Abogada (ficticia)" },
    "recepcion@demo.pa": { rol: "FUNCIONARIO", nombre: "Rita Recepción (ficticia)" },
    "analista@demo.pa": { rol: "FUNCIONARIO", nombre: "Andrés Analista (ficticio)" },
    "resolutor@demo.pa": { rol: "FUNCIONARIO", nombre: "Rosa Resolutora (ficticia)" },
    "supervisor@demo.pa": { rol: "SUPERVISOR", nombre: "Sara Supervisora (ficticia)" },
    "auditor@demo.pa": { rol: "AUDITOR", nombre: "Aurelio Auditor (ficticio)" },
    "admin@demo.pa": { rol: "ADMIN", nombre: "Alma Administradora (ficticia)" },
    "demo@bufete.test": { rol: "SOLICITANTE", nombre: "María Demo" },
  };

  function renderP01(container, opts) {
    opts = opts || {};
    container.innerHTML = "";
    var inner = layout.el("div", "app-content__inner app-auth");
    inner.appendChild(layout.pageHeader("Iniciar sesión", "Acceda al portal del cliente del bufete"));

    var form = layout.el("form", "auth-card");
    form.noValidate = true;

    var correo = field.fieldText({
      id: "correo",
      label: "Correo electrónico",
      placeholder: "nombre@ejemplo.com",
      required: true,
      helpText: "Use el correo con el que se registró",
    });
    var clave = field.fieldPassword({
      id: "clave",
      label: "Contraseña",
      required: true,
      toggle: true,
      helpText: "Use la contraseña de su cuenta",
    });

    form.appendChild(correo);
    form.appendChild(clave);

    var errorBox = layout.el("div", "auth-error", "");
    errorBox.setAttribute("aria-live", "polite");
    form.appendChild(errorBox);

    var actions = layout.el("div", "auth-actions");
    var btnLogin = button({ variant: "primary", text: "Iniciar sesión", type: "submit" });
    actions.appendChild(btnLogin);
    form.appendChild(actions);

    var links = layout.el("div", "auth-links");
    var linkRecuperar = layout.el("a", "auth-link", "¿Olvidó su contraseña?");
    linkRecuperar.href = "#/recuperar-clave";
    linkRecuperar.addEventListener("click", function (ev) {
      ev.preventDefault();
      if (opts.onGoToRecuperar) opts.onGoToRecuperar();
    });
    var linkRegistro = layout.el("a", "auth-link", "Crear cuenta");
    linkRegistro.href = "#/registro";
    linkRegistro.addEventListener("click", function (ev) {
      ev.preventDefault();
      if (opts.onGoToRegistro) opts.onGoToRegistro();
    });
    links.appendChild(linkRecuperar);
    links.appendChild(linkRegistro);
    form.appendChild(links);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();

      var email = correo.querySelector("input").value.trim();
      var pass = clave.querySelector("input").value;

      if (!email) return setError("El correo es obligatorio.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Formato de correo inválido.");
      if (!pass) return setError("La contraseña es obligatoria.");

      clearError();
      setLoading(true);

      if (!global.tm.api.isOnline()) {
        // Demo offline: sin backend, valida contra los usuarios ficticios.
        global.setTimeout(function () {
          setLoading(false);
          var user = DEMO_USERS[email.toLowerCase()];
          if (user && pass === DEMO_PASS) {
            if (opts.onLoginSuccess) opts.onLoginSuccess({
              rol: user.rol,
              usuario: { nombre: user.nombre, correo: email },
              token: null,
              expiraEn: 3600,
            });
            return;
          }
          setError("No pudimos iniciar sesión. Verifique el correo y la contraseña e intente de nuevo.");
        }, 300);
        return;
      }

      global.tm.api.request("POST", "/auth/login",
        { pantalla: "P-01", body: { correo: email, contrasena: pass } },
        function (err, data) {
          setLoading(false);
          if (err) return setError(err.mensajeUsuario);
          if (opts.onLoginSuccess) opts.onLoginSuccess({
            rol: data.rol,
            usuario: data.usuario,
            token: data.token,
            expiraEn: data.expiraEn,
          });
        });
    });

    function setError(msg) {
      errorBox.textContent = msg;
      errorBox.classList.add("is-visible");
    }
    function clearError() {
      errorBox.textContent = "";
      errorBox.classList.remove("is-visible");
    }
    function setLoading(loading) {
      btnLogin.disabled = loading;
      btnLogin.textContent = loading ? "Ingresando…" : "Iniciar sesión";
    }

    inner.appendChild(form);
    container.appendChild(inner);
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p01 = { renderP01: renderP01 };
})(window);

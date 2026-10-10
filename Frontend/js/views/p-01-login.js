/**
 * P-01 — Inicio de sesión (vista del portal cliente).
 * Criterios: validaciones en cliente, mensaje genérico de fallo (CP-02),
 * bloqueo por intentos, 4 estados (carga, éxito, vacío, error).
 * Script clásico: expone `tm.views.p01.renderP01`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;

  var MAX_ATTEMPTS = 3;
  var BLOCK_SECONDS = 60;

  var DEMO_EMAIL = "demo@bufete.test";
  var DEMO_PASS = "Demo123!";
  var DEMO_ROL = "SOLICITANTE";
  var DEMO_NOMBRE = "María Demo";

  function renderP01(container, opts) {
    opts = opts || {};
    container.innerHTML = "";
    var inner = layout.el("div", "app-content__inner app-auth");
    inner.appendChild(layout.pageHeader("Iniciar sesión", "Acceda al portal del cliente del bufete"));

    var attempts = 0;
    var blockedUntil = 0;

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
      helpText: "Mínimo 8 caracteres, incluye mayúscula, número y símbolo",
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
      if (blockedUntil > Date.now()) {
        var secs = Math.ceil((blockedUntil - Date.now()) / 1000);
        setError("Demasiados intentos. Inténtelo de nuevo en " + secs + " segundos.");
        return;
      }

      var email = correo.querySelector("input").value.trim();
      var pass = clave.querySelector("input").value;

      if (!email) return setError("El correo es obligatorio.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Formato de correo inválido.");
      if (!pass) return setError("La contraseña es obligatoria.");
      if (!validatePass(pass)) return setError("La contraseña no cumple con los requisitos mínimos.");

      clearError();
      setLoading(true);

      setTimeout(function () {
        setLoading(false);
        attempts += 1;

        if (email === DEMO_EMAIL && pass === DEMO_PASS) {
          attempts = 0;
          blockedUntil = 0;
          if (opts.onLoginSuccess) opts.onLoginSuccess({ rol: DEMO_ROL, usuario: { nombre: DEMO_NOMBRE, correo: email } });
          return;
        }

        if (attempts >= MAX_ATTEMPTS) {
          blockedUntil = Date.now() + BLOCK_SECONDS * 1000;
          setError("Demasiados intentos fallidos. Bloqueado temporalmente por " + BLOCK_SECONDS + " segundos.");
        } else {
          setError("No pudimos iniciar sesión. Verifique el correo y la contraseña e intente de nuevo.");
        }
      }, 400);
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
    function validatePass(p) {
      return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(p);
    }

    inner.appendChild(form);
    container.appendChild(inner);
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p01 = { renderP01: renderP01 };
})(window);
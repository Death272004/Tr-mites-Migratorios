/**
 * P-04 — Recuperación de contraseña (dos pasos).
 * Paso 1: solicita el enlace (respuesta neutra, CP-02). Paso 2: token + nueva contraseña.
 * Online: POST /api/auth/recuperacion y /api/auth/recuperacion/confirmacion.
 * Offline (file://): demo inline.
 * Script clásico: expone `tm.views.p04.renderP04`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;

  function renderP04(container, opts) {
    opts = opts || {};
    container.innerHTML = "";
    var inner = layout.el("div", "app-content__inner app-auth");
    inner.appendChild(layout.pageHeader("Recuperar contraseña", "Le enviaremos un enlace temporal si el correo existe"));

    var correoRecuperacion = "";
    var step2Built = false;

    // ---------- Paso 1: solicitar el enlace ----------
    var form1 = layout.el("form", "auth-card");
    form1.noValidate = true;

    var correo = field.fieldText({ id: "correo", label: "Correo electrónico", placeholder: "nombre@ejemplo.com", required: true });
    form1.appendChild(correo);

    var infoBox = layout.el("div", "auth-info", "");
    infoBox.setAttribute("aria-live", "polite");
    form1.appendChild(infoBox);

    var errorBox = layout.el("div", "auth-error", "");
    errorBox.setAttribute("aria-live", "polite");
    form1.appendChild(errorBox);

    var actions = layout.el("div", "auth-actions");
    var btn = button({ variant: "primary", text: "Enviar enlace", type: "submit" });
    actions.appendChild(btn);
    form1.appendChild(actions);

    var links = layout.el("div", "auth-links");
    var linkToken = layout.el("a", "auth-link", "Ya tengo un token");
    linkToken.href = "#";
    linkToken.addEventListener("click", function (ev) {
      ev.preventDefault();
      showStep2();
    });
    var linkLogin = layout.el("a", "auth-link", "Volver a iniciar sesión");
    linkLogin.href = "#/login";
    linkLogin.addEventListener("click", function (ev) {
      ev.preventDefault();
      if (opts.onGoToLogin) opts.onGoToLogin();
    });
    links.appendChild(linkToken);
    links.appendChild(linkLogin);
    form1.appendChild(links);

    form1.addEventListener("submit", function (ev) {
      ev.preventDefault();
      clear();
      var email = correo.querySelector("input").value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Ingrese un correo válido.");

      correoRecuperacion = email;
      setLoading(true);

      function listo() {
        setLoading(false);
        infoBox.textContent = "Si el correo está registrado, recibirá un enlace temporal válido por 1 hora.";
        infoBox.classList.add("is-visible");
        showStep2();
      }

      if (!global.tm.api.isOnline()) {
        global.setTimeout(listo, 300);
        return;
      }

      global.tm.api.request("POST", "/auth/recuperacion",
        { pantalla: "P-04", body: { correo: email } },
        function (err) {
          // El backend responde 202 tanto si la cuenta existe como si no (CP-02).
          if (err && err.status && err.status !== 202) return setError(err.mensajeUsuario);
          listo();
        });
    });

    // ---------- Paso 2: token + nueva contraseña ----------
    var form2 = layout.el("form", "auth-card");
    form2.noValidate = true;

    var step2Title = layout.el("h3", "wizard-section-title", "Definir nueva contraseña");
    form2.appendChild(step2Title);

    var token = field.fieldText({ id: "tokenRecuperacion", label: "Token del enlace", required: true });
    var claveNueva = field.fieldPassword({
      id: "claveNueva",
      label: "Nueva contraseña",
      required: true,
      toggle: true,
      helpText: "Mínimo 10 caracteres, con mayúscula, minúscula, número y símbolo",
    });
    var claveNueva2 = field.fieldPassword({ id: "claveNueva2", label: "Confirmar nueva contraseña", required: true, toggle: true });

    form2.appendChild(token);
    form2.appendChild(claveNueva);
    form2.appendChild(claveNueva2);

    var ayuda = layout.el("p", "form-field__help",
      "En desarrollo local, el token aparece en los registros del backend: " +
      "docker compose logs backend | Select-String \"CORREO SIMULADO\".");
    form2.appendChild(ayuda);

    var errorBox2 = layout.el("div", "auth-error", "");
    errorBox2.setAttribute("aria-live", "polite");
    form2.appendChild(errorBox2);

    var actions2 = layout.el("div", "auth-actions");
    var btn2 = button({ variant: "primary", text: "Cambiar contraseña", type: "submit" });
    actions2.appendChild(btn2);
    form2.appendChild(actions2);

    form2.addEventListener("submit", function (ev) {
      ev.preventDefault();
      clearError2();
      var tk = token.querySelector("input").value.trim();
      var p1 = claveNueva.querySelector("input").value;
      var p2 = claveNueva2.querySelector("input").value;

      if (!tk) return setError2("El token del enlace es obligatorio.");
      var faltas = global.tm.validacion.incumplimientos(p1, correoRecuperacion);
      if (faltas.length) return setError2(faltas[0]);
      if (p1 !== p2) return setError2("Las contraseñas no coinciden.");

      setLoading2(true);

      function ok() {
        setLoading2(false);
        infoBox.textContent = "Su contraseña se actualizó. Ya puede iniciar sesión con la nueva.";
        infoBox.classList.add("is-visible");
        form2.style.display = "none";
      }

      if (!global.tm.api.isOnline()) {
        global.setTimeout(ok, 300);
        return;
      }

      global.tm.api.request("POST", "/auth/recuperacion/confirmacion",
        { pantalla: "P-04", body: { token: tk, contrasenaNueva: p1 } },
        function (err) {
          setLoading2(false);
          if (err) {
            if (err.codigo === "ENLACE_INVALIDO") return setError2("El enlace no es válido o ya venció. Solicite uno nuevo.");
            return setError2(err.mensajeUsuario);
          }
          ok();
        });
    });

    function showStep2() {
      if (!step2Built) {
        inner.appendChild(form2);
        step2Built = true;
      }
      form2.style.display = "";
      var firstInput = form2.querySelector("input");
      if (firstInput) firstInput.focus();
    }

    function setError(msg) { errorBox.textContent = msg; errorBox.classList.add("is-visible"); }
    function clear() {
      errorBox.textContent = "";
      errorBox.classList.remove("is-visible");
      infoBox.textContent = "";
      infoBox.classList.remove("is-visible");
    }
    function setLoading(l) { btn.disabled = l; btn.textContent = l ? "Enviando…" : "Enviar enlace"; }
    function setError2(msg) { errorBox2.textContent = msg; errorBox2.classList.add("is-visible"); }
    function clearError2() { errorBox2.textContent = ""; errorBox2.classList.remove("is-visible"); }
    function setLoading2(l) { btn2.disabled = l; btn2.textContent = l ? "Actualizando…" : "Cambiar contraseña"; }

    inner.appendChild(form1);
    container.appendChild(inner);
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p04 = { renderP04: renderP04 };
})(window);

/**
 * P-01 — Inicio de sesión (vista del portal cliente).
 * Criterios: validaciones en cliente, mensaje genérico de fallo (CP-02).
 * Online: POST /api/auth/login. El login requiere el backend y la base de datos;
 * no se mantienen contraseñas ni usuarios válidos dentro del navegador.
 * El botón de autocompletado usa una sesión de demostración controlada por el backend:
 * nunca recibe ni muestra contraseñas.
 * Script clásico: expone tm.views.p01.renderP01.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;

  var CUENTAS_DEMO = [
    { value: "SOLICITANTE:TURISTA", label: "Solicitante — Turista" },
    { value: "SOLICITANTE:PASANTE_BUFETE", label: "Solicitante — Pasante de bufete" },
    { value: "SOLICITANTE:MIGRANTE_INDEPENDIENTE", label: "Solicitante — Migrante independiente" },
    { value: "SOLICITANTE:NACIONAL", label: "Solicitante — Nacional" },
    { value: "FUNCIONARIO", label: "Funcionario / pasante del bufete o institución" },
    { value: "SUPERVISOR", label: "Supervisor migratorio" },
    { value: "AUDITOR", label: "Auditor" },
    { value: "ADMIN", label: "Administrador del sistema" },
  ];

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
    var correoInput = correo.querySelector("input");
    correoInput.autocomplete = "username";
    correoInput.setAttribute("inputmode", "email");

    var rolTipo = field.fieldSelect({
      id: "rolTipo",
      label: "Rol / tipo de usuario",
      options: CUENTAS_DEMO,
      required: true,
      helpText: "El autocompletado selecciona una cuenta ficticia existente en la base de datos local.",
    });

    var areaInstitucional = field.fieldSelect({
      id: "areaInstitucional",
      label: "Área institucional",
      options: [
        { value: "BUFETE", label: "Bufete" },
        { value: "RP", label: "Registro Público (RP)" },
        { value: "CSS", label: "Caja de Seguro Social (CSS)" },
        { value: "TE", label: "Tribunal Electoral (TE)" },
      ],
      value: "BUFETE",
      helpText: "Para RP, CSS y TE solo se mostrarán verificaciones asignadas de esa institución.",
    });
    areaInstitucional.hidden = true;

    var clave = field.fieldPassword({
      id: "clave",
      label: "Contraseña",
      required: true,
      toggle: true,
      helpText: "Use la contraseña de su cuenta",
    });

    form.appendChild(correo);
    form.appendChild(rolTipo);
    form.appendChild(areaInstitucional);
    form.appendChild(clave);

    var errorBox = layout.el("div", "auth-error", "");
    errorBox.setAttribute("aria-live", "polite");
    form.appendChild(errorBox);

    var actions = layout.el("div", "auth-actions");
    var btnLogin = button({ variant: "primary", text: "Iniciar sesión", type: "submit" });
    var btnAutoCompletar = button({ variant: "secondary", text: "Auto-completar", type: "button" });
    actions.appendChild(btnLogin);
    actions.appendChild(btnAutoCompletar);
    form.appendChild(actions);

    var links = layout.el("div", "auth-links");
    var linkRecuperar = layout.el("a", "auth-link", "¿Olvidó su contraseña?");
    linkRecuperar.href = "/recuperar-clave";
    linkRecuperar.addEventListener("click", function (ev) {
      ev.preventDefault();
      if (opts.onGoToRecuperar) opts.onGoToRecuperar();
    });
    var linkRegistro = layout.el("a", "auth-link", "Crear cuenta");
    linkRegistro.href = "/registro";
    linkRegistro.addEventListener("click", function (ev) {
      ev.preventDefault();
      if (opts.onGoToRegistro) opts.onGoToRegistro();
    });
    links.appendChild(linkRecuperar);
    links.appendChild(linkRegistro);
    form.appendChild(links);

    function syncAreaSelector() {
      var selected = rolTipo.querySelector("select").value || "";
      var role = selected.split(":")[0];
      areaInstitucional.hidden = role !== "FUNCIONARIO";
      if (role !== "FUNCIONARIO") areaInstitucional.querySelector("select").value = "BUFETE";
    }
    rolTipo.querySelector("select").addEventListener("change", syncAreaSelector);
    syncAreaSelector();

    btnAutoCompletar.addEventListener("click", function () {
      var selected = rolTipo.querySelector("select").value;
      var partes = selected.split(":");
      var body = { rol: partes[0] };
      if (partes.length > 1 && partes[1]) body.tipoSolicitante = partes[1];
      if (body.rol === "FUNCIONARIO") {
        body.areaInstitucional = areaInstitucional.querySelector("select").value || "BUFETE";
      }

      clearError();
      if (!global.tm.api.isOnline()) {
        setError("El autocompletado requiere que el frontend esté abierto desde Docker y que el backend esté conectado.");
        return;
      }

      setAutoLoading(true);
      global.tm.api.request("POST", "/auth/autocompletar",
        { pantalla: "P-01", body: body },
        function (err, data) {
          setAutoLoading(false);
          if (err) return setError(err.mensajeUsuario);
          var cuenta = data && data.usuario;
          if (!cuenta || !cuenta.correo) return setError("No se encontró una cuenta demo para esa selección.");
          correoInput.value = cuenta.correo;
          correoInput.dispatchEvent(new Event("input", { bubbles: true }));
          var claveInput = clave.querySelector("input");
          if (claveInput) claveInput.value = "";
          // En la vista real el callback guarda el token y navega al área correspondiente.
          if (opts.onLoginSuccess) {
            opts.onLoginSuccess({
              rol: data.rol,
              usuario: data.usuario,
              token: data.token,
              expiraEn: data.expiraEn,
            });
          } else {
            setError("Cuenta demo seleccionada: " + cuenta.nombre + ". La contraseña no se expone en el navegador.");
          }
        });
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();

      var email = correoInput.value.trim();
      var pass = clave.querySelector("input").value;

      if (!email) return setError("El correo es obligatorio.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Formato de correo inválido.");
      if (!pass) return setError("La contraseña es obligatoria.");

      clearError();
      setLoading(true);

      if (!global.tm.api.isOnline()) {
        global.setTimeout(function () {
          setLoading(false);
          setError("El inicio de sesión requiere conexión con el backend. Abre la aplicación con Docker e inténtalo de nuevo.");
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
    function setAutoLoading(loading) {
      btnAutoCompletar.disabled = loading;
      btnAutoCompletar.textContent = loading ? "Buscando…" : "Auto-completar";
      rolTipo.querySelector("select").disabled = loading;
    }

    inner.appendChild(form);
    container.appendChild(inner);
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p01 = { renderP01: renderP01 };
})(window);

/**
 * I-01 — Login institucional con MFA (Fase E).
 * Autentica al personal del despacho con segundo factor obligatorio (simulado).
 * Reglas: timeout de sesión, bitácora de intentos (HU-05), mensaje genérico de
 * fallo (CP-02), sin credenciales ni secretos en el cliente (CP-01).
 * Script clásico: expone `tm.views.i01.renderI01`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;

  var MAX_ATTEMPTS = 3;
  var BLOCK_SECONDS = 60;

  var FALLBACK = {
    usuarios: [
      { rol: "FUNCIONARIO", rolLabel: "Funcionario (abogado analista)", usuario: "analista", clave: "Interno123!" },
      { rol: "SUPERVISOR", rolLabel: "Supervisor", usuario: "supervisor", clave: "Interno123!" },
      { rol: "AUDITOR", rolLabel: "Auditor", usuario: "auditor", clave: "Interno123!" },
      { rol: "ADMIN", rolLabel: "Administrador", usuario: "admin", clave: "Interno123!" },
    ],
    mfa: { longitud: 6, codigoDemo: "123456" },
    estacion: "WKS-DEMO-01",
    ip: "10.0.0.24",
  };

  function fixtureData() {
    var d = global.tm.fixtures.data("I-01", "exito");
    return d && d.usuarios ? d : FALLBACK;
  }

  function renderI01(container, opts) {
    opts = opts || {};
    container.innerHTML = "";
    var datos = fixtureData();

    var inner = layout.el("div", "app-content__inner app-auth");
    inner.appendChild(layout.pageHeader("Acceso institucional", "Módulo interno del despacho — autenticación con doble factor"));

    var attempts = 0;
    var blockedUntil = 0;

    var form = layout.el("form", "auth-card");
    form.noValidate = true;

    var perfilWrap = field.fieldSelect({
      id: "perfilInterno",
      label: "Perfil de demostración",
      options: datos.usuarios.map(function (u) { return { label: u.rolLabel, value: u.rol }; }),
      value: datos.usuarios[0].rol,
      helpText: "En el MVP se elige el usuario de prueba; en producción lo provee el directorio institucional.",
    });
    form.appendChild(perfilWrap);

    var usuario = field.fieldText({
      id: "usuarioInterno",
      label: "Usuario corporativo",
      value: datos.usuarios[0].usuario,
      required: true,
      helpText: "Directorio institucional del despacho",
    });
    var clave = field.fieldPassword({
      id: "claveInterna",
      label: "Contraseña",
      required: true,
      toggle: true,
      helpText: "Política de dominio (mínimo 8, mayúscula, número y símbolo)",
    });
    form.appendChild(usuario);
    form.appendChild(clave);

    var mfaWrap = field.fieldText({
      id: "mfaInterno",
      label: "Segundo factor (token/SMS)",
      placeholder: "Código de 6 dígitos",
      required: true,
      helpText: "MFA obligatorio para analistas, resolutores y administradores",
    });
    mfaWrap.style.display = "none";
    form.appendChild(mfaWrap);

    var station = layout.el("div", "verified-field__meta");
    station.appendChild(layout.el("span", null, "Estación / IP (automático): " + datos.estacion + " · " + datos.ip));
    station.appendChild(layout.el("span", null, "Se registra en la bitácora de auditoría (I-16)."));
    form.appendChild(station);

    var errorBox = layout.el("div", "auth-error", "");
    errorBox.setAttribute("aria-live", "polite");
    form.appendChild(errorBox);

    var actions = layout.el("div", "auth-actions");
    var btnContinuar = button({ variant: "primary", text: "Continuar", type: "submit" });
    var btnVolver = button({ variant: "ghost", text: "Volver", type: "button", onClick: function () { toStep1(); } });
    btnVolver.style.display = "none";
    actions.appendChild(btnContinuar);
    actions.appendChild(btnVolver);
    form.appendChild(actions);

    var linkPortal = layout.el("div", "auth-links");
    var link = layout.el("a", "auth-link", "Volver al portal del cliente");
    link.href = "#/login";
    linkPortal.appendChild(link);
    form.appendChild(linkPortal);

    var paso = 1;
    var perfil = datos.usuarios[0];
    var loading = false;

    function selPerfil() {
      var sel = document.getElementById("perfilInterno");
      return sel ? sel.value : datos.usuarios[0].rol;
    }

    function perfilPorRol(rol) {
      for (var i = 0; i < datos.usuarios.length; i++) {
        if (datos.usuarios[i].rol === rol) return datos.usuarios[i];
      }
      return datos.usuarios[0];
    }

    function toStep1() {
      paso = 1;
      mfaWrap.style.display = "none";
      btnVolver.style.display = "none";
      btnContinuar.textContent = "Continuar";
      clearError();
    }

    function toStep2() {
      paso = 2;
      mfaWrap.style.display = "";
      btnVolver.style.display = "";
      btnContinuar.textContent = "Verificar e ingresar";
      clearError();
      var mfaInput = document.querySelector("#mfaInterno");
      if (mfaInput) mfaInput.focus();
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (loading) return;

      if (blockedUntil > Date.now()) {
        var secs = Math.ceil((blockedUntil - Date.now()) / 1000);
        setError("Demasiados intentos. Inténtelo de nuevo en " + secs + " segundos.");
        return;
      }

      var u = valor("usuarioInterno");
      var c = valor("claveInterna");

      if (paso === 1) {
        if (!u) return setError("El usuario corporativo es obligatorio.");
        if (!c) return setError("La contraseña es obligatoria.");
        if (!validatePass(c)) return setError("La contraseña no cumple con los requisitos mínimos.");

        perfil = perfilPorRol(selPerfil());
        setLoading(true);
        setTimeout(function () {
          setLoading(false);
          if (u === perfil.usuario && c === perfil.clave) {
            toStep2();
          } else {
            registrarFallo();
          }
        }, 400);
        return;
      }

      var codigo = valor("mfaInterno");
      if (!/^[0-9]{6}$/.test(codigo)) return setError("Ingrese el código de 6 dígitos del segundo factor.");

      setLoading(true);
      setTimeout(function () {
        setLoading(false);
        attempts = 0;
        blockedUntil = 0;
        if (opts.onInternalLoginSuccess) {
          opts.onInternalLoginSuccess({
            rol: perfil.rol,
            usuario: { nombre: perfil.rolLabel, correo: perfil.usuario + "@despacho.test", estacion: datos.estacion, ip: datos.ip },
          });
        }
      }, 400);
    });

    function registrarFallo() {
      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) {
        blockedUntil = Date.now() + BLOCK_SECONDS * 1000;
        setError("Demasiados intentos fallidos. Bloqueado temporalmente por " + BLOCK_SECONDS + " segundos.");
      } else {
        setError("No pudimos iniciar sesión. Verifique el usuario y la contraseña e intente de nuevo.");
      }
    }

    function valor(id) {
      var e = document.getElementById(id);
      return e ? String(e.value).trim() : "";
    }
    function setError(msg) {
      errorBox.textContent = msg;
      errorBox.classList.add("is-visible");
    }
    function clearError() {
      errorBox.textContent = "";
      errorBox.classList.remove("is-visible");
    }
    function setLoading(state) {
      loading = state;
      btnContinuar.disabled = state;
      btnContinuar.textContent = state ? "Verificando…" : (paso === 2 ? "Verificar e ingresar" : "Continuar");
    }
    function validatePass(p) {
      return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(p);
    }

    inner.appendChild(form);
    container.appendChild(inner);
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i01 = { renderI01: renderI01 };
})(window);

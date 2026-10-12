/**
 * P-02 — Registro de cuenta (portal cliente).
 * CP-02 aplicable (mensajes genéricos), aceptación de Ley 81 obligatoria.
 * Script clásico: expone `tm.views.p02.renderP02`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;

  function renderP02(container, opts) {
    opts = opts || {};
    container.innerHTML = "";
    var inner = layout.el("div", "app-content__inner app-auth");
    inner.appendChild(layout.pageHeader("Crear cuenta", "Registro en el portal del cliente del bufete"));

    var form = layout.el("form", "auth-card");
    form.noValidate = true;

    var tipoDoc = field.fieldSelect({
      id: "tipoDoc",
      label: "Tipo de documento",
      options: [
        { value: "PASAPORTE", label: "Pasaporte" },
        { value: "CEDULA_E", label: "Cédula E" },
        { value: "CARNE", label: "Carné" },
      ],
      required: true,
    });

    var numDoc = field.fieldText({ id: "numDoc", label: "Número de documento", required: true });
    var nombres = field.fieldText({ id: "nombres", label: "Nombres y apellidos", required: true });
    var nacionalidad = field.fieldSelect({
      id: "nacionalidad",
      label: "Nacionalidad",
      options: [
        { value: "PA", label: "Panamá" },
        { value: "US", label: "Estados Unidos" },
        { value: "CO", label: "Colombia" },
        { value: "VE", label: "Venezuela" },
      ],
      required: true,
    });
    var correo = field.fieldText({ id: "correo", label: "Correo electrónico", placeholder: "nombre@ejemplo.com", required: true });
    var telefono = field.fieldText({ id: "telefono", label: "Teléfono (código país + número)", placeholder: "+507 6000-0000", required: true });
    var paisRes = field.fieldSelect({
      id: "paisRes",
      label: "País de residencia actual",
      options: [
        { value: "PA", label: "Panamá" },
        { value: "US", label: "Estados Unidos" },
        { value: "CO", label: "Colombia" },
        { value: "VE", label: "Venezuela" },
      ],
      required: true,
    });
    var clave = field.fieldPassword({ id: "clave", label: "Contraseña", required: true, toggle: true });
    var clave2 = field.fieldPassword({ id: "clave2", label: "Confirmar contraseña", required: true, toggle: true });

    var leyRow = layout.el("label", "auth-check");
    var leyChk = layout.el("input", "auth-check__input");
    leyChk.type = "checkbox";
    leyChk.id = "aceptaLey";
    var leyLbl = layout.el("span", "auth-check__label", "Acepto términos y la autorización de tratamiento de datos personales (Ley 81 de 2019).");
    leyRow.appendChild(leyChk);
    leyRow.appendChild(leyLbl);

    form.appendChild(tipoDoc);
    form.appendChild(numDoc);
    form.appendChild(nombres);
    form.appendChild(nacionalidad);
    form.appendChild(correo);
    form.appendChild(telefono);
    form.appendChild(paisRes);
    form.appendChild(clave);
    form.appendChild(clave2);
    form.appendChild(leyRow);

    var errorBox = layout.el("div", "auth-error", "");
    errorBox.setAttribute("aria-live", "polite");
    form.appendChild(errorBox);

    var actions = layout.el("div", "auth-actions");
    var btnReg = button({ variant: "primary", text: "Crear cuenta", type: "submit" });
    actions.appendChild(btnReg);
    form.appendChild(actions);

    var links = layout.el("div", "auth-links");
    var linkLogin = layout.el("a", "auth-link", "Ya tengo cuenta. Iniciar sesión");
    linkLogin.href = "#/login";
    linkLogin.addEventListener("click", function (ev) {
      ev.preventDefault();
      if (opts.onGoToLogin) opts.onGoToLogin();
    });
    links.appendChild(linkLogin);
    form.appendChild(links);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      clearError();
      var email = correo.querySelector("input").value.trim();
      var p1 = clave.querySelector("input").value;
      var p2 = clave2.querySelector("input").value;
      var acepta = leyChk.checked;

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Correo inválido.");
      if (!p1 || !validatePass(p1)) return setError("La contraseña no cumple con los requisitos mínimos.");
      if (p1 !== p2) return setError("Las contraseñas no coinciden.");
      if (!acepta) return setError("Debe aceptar la autorización de tratamiento de datos (Ley 81).");

      setLoading(true);
      setTimeout(function () {
        setLoading(false);
        if (opts.onRegistered) opts.onRegistered({ correo: email });
      }, 300);
    });

    function setError(msg) { errorBox.textContent = msg; errorBox.classList.add("is-visible"); }
    function clearError() { errorBox.textContent = ""; errorBox.classList.remove("is-visible"); }
    function setLoading(l) { btnReg.disabled = l; btnReg.textContent = l ? "Creando…" : "Crear cuenta"; }
    function validatePass(p) { return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(p); }

    inner.appendChild(form);
    container.appendChild(inner);
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p02 = { renderP02: renderP02 };
})(window);
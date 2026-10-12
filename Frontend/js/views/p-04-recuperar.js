/**
 * P-04 — Recuperación de contraseña.
 * Confirmación neutra (no revela si la cuenta existe), enlace temporal simulado (1 h).
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

    var form = layout.el("form", "auth-card");
    form.noValidate = true;

    var correo = field.fieldText({ id: "correo", label: "Correo electrónico", placeholder: "nombre@ejemplo.com", required: true });
    form.appendChild(correo);

    var infoBox = layout.el("div", "auth-info", "");
    infoBox.setAttribute("aria-live", "polite");
    form.appendChild(infoBox);

    var errorBox = layout.el("div", "auth-error", "");
    errorBox.setAttribute("aria-live", "polite");
    form.appendChild(errorBox);

    var actions = layout.el("div", "auth-actions");
    var btn = button({ variant: "primary", text: "Enviar enlace", type: "submit" });
    actions.appendChild(btn);
    form.appendChild(actions);

    var links = layout.el("div", "auth-links");
    var linkLogin = layout.el("a", "auth-link", "Volver a iniciar sesión");
    linkLogin.href = "#/login";
    linkLogin.addEventListener("click", function (ev) {
      ev.preventDefault();
      if (opts.onGoToLogin) opts.onGoToLogin();
    });
    links.appendChild(linkLogin);
    form.appendChild(links);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      clear();
      var email = correo.querySelector("input").value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Ingrese un correo válido.");

      setLoading(true);
      setTimeout(function () {
        setLoading(false);
        infoBox.textContent = "Si el correo está registrado, recibirá un enlace temporal válido por 1 hora (simulado).";
        infoBox.classList.add("is-visible");
      }, 300);
    });

    function setError(msg) { errorBox.textContent = msg; errorBox.classList.add("is-visible"); }
    function clear() {
      errorBox.textContent = "";
      errorBox.classList.remove("is-visible");
      infoBox.textContent = "";
      infoBox.classList.remove("is-visible");
    }
    function setLoading(l) { btn.disabled = l; btn.textContent = l ? "Enviando…" : "Enviar enlace"; }

    inner.appendChild(form);
    container.appendChild(inner);
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p04 = { renderP04: renderP04 };
})(window);
/**
 * P-03 — Verificación de identidad (OTP simulado).
 * Código de 6 dígitos, expira en 10 minutos, 3 intentos; sin envío real.
 * Script clásico: expone `tm.views.p03.renderP03`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;

  var CODE_LENGTH = 6;
  var EXP_MIN = 10;
  var MAX_ATT = 3;

  function renderP03(container, opts) {
    opts = opts || {};
    container.innerHTML = "";
    var inner = layout.el("div", "app-content__inner app-auth");
    inner.appendChild(layout.pageHeader("Verificación de identidad (OTP)", "Ingrese el código de 6 dígitos enviado a su correo"));

    var attempts = 0;
    var expiresAt = Date.now() + EXP_MIN * 60 * 1000;

    var card = layout.el("form", "auth-card");
    card.noValidate = true;

    var code = field.fieldText({ id: "otp", label: "Código OTP", placeholder: "123456", required: true, helpText: "Expira en " + EXP_MIN + " minutos. Máximo " + MAX_ATT + " intentos." });
    var input = code.querySelector("input");
    input.maxLength = CODE_LENGTH;
    input.inputMode = "numeric";
    input.pattern = "[0-9]{6}";
    card.appendChild(code);

    var errorBox = layout.el("div", "auth-error", "");
    errorBox.setAttribute("aria-live", "polite");
    card.appendChild(errorBox);

    var actions = layout.el("div", "auth-actions");
    var btnVer = button({ variant: "primary", text: "Verificar", type: "submit" });
    var btnRe = button({ text: "Reenviar código (simulado)", type: "button" });
    actions.appendChild(btnRe);
    actions.appendChild(btnVer);
    card.appendChild(actions);

    card.addEventListener("submit", function (ev) {
      ev.preventDefault();
      clearError();
      if (expiresAt < Date.now()) return setError("El código ha expirado. Solicite uno nuevo.");
      var val = input.value.trim();
      if (!/^\d{6}$/.test(val)) return setError("El código debe tener 6 dígitos.");

      setLoading(true);
      setTimeout(function () {
        setLoading(false);
        attempts += 1;
        if (attempts >= MAX_ATT) {
          return setError("Demasiados intentos. Solicite un nuevo código.");
        }
        if (opts.onVerified) opts.onVerified({ codigo: val });
      }, 300);
    });

    btnRe.addEventListener("click", function () {
      attempts = 0;
      clearError();
      if (opts.onResend) opts.onResend();
    });

    function setError(msg) { errorBox.textContent = msg; errorBox.classList.add("is-visible"); }
    function clearError() { errorBox.textContent = ""; errorBox.classList.remove("is-visible"); }
    function setLoading(l) { btnVer.disabled = l; btnVer.textContent = l ? "Verificando…" : "Verificar"; }

    inner.appendChild(card);
    container.appendChild(inner);
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p03 = { renderP03: renderP03 };
})(window);
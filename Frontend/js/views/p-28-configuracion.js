/** P-28 — Configuración de la cuenta. Preferencias locales de demostración. */
(function (global) {
  "use strict";
  var layout = global.tm.layout;
  var settings = global.tm.settings;

  function optionRow(label, description, control) {
    var row = layout.el("div", "settings-row");
    var copy = layout.el("div", "settings-row__copy");
    copy.appendChild(layout.el("strong", null, label));
    copy.appendChild(layout.el("span", null, description));
    row.appendChild(copy);
    row.appendChild(control);
    return row;
  }

  function selectControl(label, value, options, onChange) {
    var select = layout.el("select", "settings-control");
    select.setAttribute("aria-label", label);
    options.forEach(function (item) {
      var option = layout.el("option", null, item.label);
      option.value = item.value;
      option.selected = item.value === value;
      select.appendChild(option);
    });
    select.addEventListener("change", function () { onChange(select.value); });
    return select;
  }

  function switchControl(label, checked, onChange) {
    var wrap = layout.el("label", "settings-switch");
    var input = layout.el("input");
    input.type = "checkbox";
    input.checked = checked;
    input.setAttribute("aria-label", label);
    input.addEventListener("change", function () { onChange(input.checked); });
    wrap.appendChild(input);
    wrap.appendChild(layout.el("span", "settings-switch__track"));
    return wrap;
  }

  function renderP28(container) {
    var current = settings.get();
    var inner = layout.el("div", "app-content__inner settings-page");
    inner.appendChild(layout.pageHeader("Configuración", "Personaliza la forma en que utilizas el portal."));

    var appearance = layout.el("section", "settings-section");
    appearance.appendChild(layout.el("h2", null, "Apariencia y accesibilidad"));
    appearance.appendChild(layout.el("p", "settings-section__intro", "Estos cambios se guardan en este navegador y solo afectan tu experiencia de demostración."));
    appearance.appendChild(optionRow("Modo de color", "Elige entre una interfaz clara u oscura.", selectControl("Modo de color", current.tema, [
      { value: "claro", label: "Modo claro" }, { value: "oscuro", label: "Modo oscuro" },
    ], function (value) { current.tema = value; settings.save(current); })));
    appearance.appendChild(optionRow("Tamaño del texto", "Ajusta la lectura sin cambiar el contenido.", selectControl("Tamaño del texto", current.texto, [
      { value: "normal", label: "Normal" }, { value: "grande", label: "Grande" }, { value: "muy-grande", label: "Muy grande" },
    ], function (value) { current.texto = value; settings.save(current); })));
    appearance.appendChild(optionRow("Contraste reforzado", "Aumenta la diferencia entre texto, fondo y controles.", switchControl("Contraste reforzado", current.contraste, function (value) { current.contraste = value; settings.save(current); })));
    inner.appendChild(appearance);

    var notifications = layout.el("section", "settings-section");
    notifications.appendChild(layout.el("h2", null, "Avisos y sesión"));
    notifications.appendChild(optionRow("Avisos del trámite", "Recibir avisos cuando cambie el estado de un expediente.", switchControl("Avisos del trámite", current.notificaciones, function (value) { current.notificaciones = value; settings.save(current); })));
    notifications.appendChild(optionRow("Recordar esta sesión", "Mantener la sesión de demostración en este dispositivo.", switchControl("Recordar esta sesión", current.recordarSesion, function (value) { current.recordarSesion = value; settings.save(current); })));
    var reset = layout.el("button", "settings-reset", "Restablecer preferencias");
    reset.type = "button";
    reset.addEventListener("click", function () { settings.reset(); renderP28(container); });
    notifications.appendChild(reset);
    inner.appendChild(notifications);
    container.appendChild(inner);
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p28 = { renderP28: renderP28 };
})(window);

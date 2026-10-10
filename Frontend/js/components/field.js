/**
 * field.js — campos de formulario reutilizables. Script clásico: expone `tm.ui.field`.
 */
(function (global) {
  "use strict";

  const { el } = global.tm.layout;

  function setHelp(id, helpText) {
    if (!helpText) return null;
    const help = el("span", "form-field__help", helpText);
    help.id = id;
    return help;
  }

  function setError(id, errorText) {
    if (!errorText) return null;
    const err = el("span", "form-field__error", errorText);
    err.id = id;
    err.setAttribute("aria-live", "polite");
    return err;
  }

  function fieldText({ id, label, value = "", placeholder, required = false, disabled = false, helpText, errorText } = {}) {
    const wrapper = el("div", "form-field");
    const lbl = el("label", "form-field__label", label);
    lbl.setAttribute("for", id);
    wrapper.appendChild(lbl);

    const input = el("input", "form-field__input");
    input.type = "text";
    input.id = id;
    input.name = id;
    if (value) input.value = value;
    if (placeholder) input.placeholder = placeholder;
    if (required) input.required = true;
    if (disabled) input.disabled = true;
    const describedBy = [];
    if (helpText) describedBy.push(`${id}-help`);
    if (errorText) describedBy.push(`${id}-error`);
    if (describedBy.length) input.setAttribute("aria-describedby", describedBy.join(" "));
    if (errorText) input.setAttribute("aria-invalid", "true");
    wrapper.appendChild(input);

    if (helpText) wrapper.appendChild(setHelp(`${id}-help`, helpText));
    if (errorText) wrapper.appendChild(setError(`${id}-error`, errorText));
    return wrapper;
  }

  function fieldPassword({ id, label, value = "", placeholder, required = false, disabled = false, helpText, errorText, toggle = false } = {}) {
    const wrapper = el("div", "form-field");
    const lbl = el("label", "form-field__label", label);
    lbl.setAttribute("for", id);
    wrapper.appendChild(lbl);

    const group = el("div", "form-field__group");
    const input = el("input", "form-field__input");
    input.type = "password";
    input.id = id;
    input.name = id;
    if (value) input.value = value;
    if (placeholder) input.placeholder = placeholder;
    if (required) input.required = true;
    if (disabled) input.disabled = true;
    const describedBy = [];
    if (helpText) describedBy.push(`${id}-help`);
    if (errorText) describedBy.push(`${id}-error`);
    if (describedBy.length) input.setAttribute("aria-describedby", describedBy.join(" "));
    if (errorText) input.setAttribute("aria-invalid", "true");
    group.appendChild(input);

    if (toggle) {
      const btnToggle = el("button", "form-field__toggle", "Mostrar");
      btnToggle.type = "button";
      btnToggle.addEventListener("click", () => {
        const isPass = input.type === "password";
        input.type = isPass ? "text" : "password";
        btnToggle.textContent = isPass ? "Ocultar" : "Mostrar";
      });
      group.appendChild(btnToggle);
    }
    wrapper.appendChild(group);

    if (helpText) wrapper.appendChild(setHelp(`${id}-help`, helpText));
    if (errorText) wrapper.appendChild(setError(`${id}-error`, errorText));
    return wrapper;
  }

  function fieldSelect({ id, label, options = [], value, required = false, disabled = false, helpText, errorText } = {}) {
    const wrapper = el("div", "form-field");
    const lbl = el("label", "form-field__label", label);
    lbl.setAttribute("for", id);
    wrapper.appendChild(lbl);

    const select = el("select", "form-field__select");
    select.id = id;
    select.name = id;
    if (required) select.required = true;
    if (disabled) select.disabled = true;
    for (const opt of options) {
      const o = el("option", null, opt.label);
      o.value = opt.value;
      if (value !== undefined && String(opt.value) === String(value)) o.selected = true;
      select.appendChild(o);
    }
    const describedBy = [];
    if (helpText) describedBy.push(`${id}-help`);
    if (errorText) describedBy.push(`${id}-error`);
    if (describedBy.length) select.setAttribute("aria-describedby", describedBy.join(" "));
    if (errorText) select.setAttribute("aria-invalid", "true");
    wrapper.appendChild(select);

    if (helpText) wrapper.appendChild(setHelp(`${id}-help`, helpText));
    if (errorText) wrapper.appendChild(setError(`${id}-error`, errorText));
    return wrapper;
  }

  function fieldTextarea({ id, label, value = "", rows = 4, required = false, disabled = false, helpText, errorText } = {}) {
    const wrapper = el("div", "form-field");
    const lbl = el("label", "form-field__label", label);
    lbl.setAttribute("for", id);
    wrapper.appendChild(lbl);

    const ta = el("textarea", "form-field__textarea");
    ta.id = id;
    ta.name = id;
    ta.rows = rows;
    if (value) ta.value = value;
    if (required) ta.required = true;
    if (disabled) ta.disabled = true;
    const describedBy = [];
    if (helpText) describedBy.push(`${id}-help`);
    if (errorText) describedBy.push(`${id}-error`);
    if (describedBy.length) ta.setAttribute("aria-describedby", describedBy.join(" "));
    if (errorText) ta.setAttribute("aria-invalid", "true");
    wrapper.appendChild(ta);

    if (helpText) wrapper.appendChild(setHelp(`${id}-help`, helpText));
    if (errorText) wrapper.appendChild(setError(`${id}-error`, errorText));
    return wrapper;
  }

  global.tm.ui = global.tm.ui || {};
  global.tm.ui.field = { fieldText, fieldPassword, fieldSelect, fieldTextarea };
})(window);
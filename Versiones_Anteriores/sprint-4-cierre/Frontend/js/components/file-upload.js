/**
 * file-upload.js — control de carga de documento simulado.
 * Registra el nombre, tamaño y tipo; en modo online entrega el File al módulo
 * de servicios para su carga multipart. Emite la fecha de emisión y dispara onChange.
 * Script clásico: expone `tm.ui.fileUpload`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;

  function fileUpload(opts) {
    opts = opts || {};
    var wrapper = layout.el("div", "file-upload");
    var head = layout.el("div", "file-upload__head");
    head.appendChild(layout.el("span", "file-upload__label", opts.label || "Documento"));

    var input = layout.el("input");
    input.type = "file";
    if (opts.accept) input.accept = opts.accept;
    input.className = "file-upload__input";
    input.id = opts.id || "";
    input.setAttribute("aria-label", opts.label || "Cargar documento");
    head.appendChild(input);

    var state = layout.el("span", "file-upload__state", "Sin archivo");
    head.appendChild(state);
    wrapper.appendChild(head);

    if (opts.helpText) wrapper.appendChild(layout.el("span", "form-field__help", opts.helpText));

    input.addEventListener("change", function () {
      var f = input.files && input.files[0];
      if (!f) {
        state.textContent = "Sin archivo";
        state.classList.remove("is-loaded");
        if (opts.onChange) opts.onChange(null);
        return;
      }
      state.textContent = f.name + " (" + Math.round(f.size / 1024) + " KB)";
      state.classList.add("is-loaded");
      // Conservamos los metadatos para la vista y la referencia al File para
      // que el flujo online pueda enviarlo como multipart después de crear el
      // expediente. El File nunca se guarda en sessionStorage.
      if (opts.onChange) opts.onChange({ file: f, name: f.name, size: f.size, type: f.type });
    });

    return wrapper;
  }

  global.tm.ui.fileUpload = fileUpload;
})(window);

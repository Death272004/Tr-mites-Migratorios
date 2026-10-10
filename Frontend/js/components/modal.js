/**
 * modal.js — componentes de modal (confirmación) con foco y teclado.
 * Script clásico: expone `tm.ui.confirmModal`.
 */
(function (global) {
  "use strict";

  const { el } = global.tm.layout;

  let activeBackdrop = null;
  let lastFocus = null;

  function trapFocus(dialog, event) {
    if (event.key !== "Tab") return;
    const focusable = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  function closeBackdrop() {
    if (!activeBackdrop) return;
    const { backdrop, keydown, onClose } = activeBackdrop;
    backdrop.remove();
    document.removeEventListener("keydown", keydown);
    activeBackdrop = null;
    lastFocus?.focus();
    onClose?.();
  }

  function openBackdrop({ title, body, actions }) {
    lastFocus = document.activeElement;
    const backdrop = el("div", "modal-backdrop");
    const dialog = el("div", "modal");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    if (title) dialog.setAttribute("aria-labelledby", "modal-title");

    const header = el("div", "modal__header");
    if (title) {
      const h2 = el("h2", "modal__title", title);
      h2.id = "modal-title";
      header.appendChild(h2);
    }
    const close = el("button", "modal__close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Cerrar");
    close.addEventListener("click", closeBackdrop);
    header.appendChild(close);
    dialog.appendChild(header);

    if (body) {
      const bodyEl = el("div", "modal__body");
      if (typeof body === "string") bodyEl.textContent = body;
      else bodyEl.appendChild(body);
      dialog.appendChild(bodyEl);
    }

    if (actions) {
      const footer = el("div", "modal__footer");
      footer.appendChild(actions);
      dialog.appendChild(footer);
    }

    const keydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeBackdrop();
      }
      if (event.key === "Tab") trapFocus(dialog, event);
    };
    document.addEventListener("keydown", keydown);

    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);

    setTimeout(() => {
      const focusable = dialog.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) focusable.focus();
      else close.focus();
    }, 0);

    activeBackdrop = { backdrop, dialog, keydown, onClose: null };
    return {
      close: closeBackdrop,
      setOnClose: (fn) => (activeBackdrop.onClose = fn),
    };
  }

  function confirmModal(title, message, { onConfirm, onCancel } = {}) {
    const actions = el("div", "modal__actions");
    const cancel = el("button", "btn", "Cancelar");
    cancel.type = "button";
    cancel.addEventListener("click", () => {
      closeBackdrop();
      onCancel?.();
    });
    const ok = el("button", "btn btn--primary", "Aceptar");
    ok.type = "button";
    ok.addEventListener("click", () => {
      closeBackdrop();
      onConfirm?.();
    });
    actions.appendChild(cancel);
    actions.appendChild(ok);

    const body = el("p", null, message);
    openBackdrop({ title, body, actions });
  }

  global.tm.ui = global.tm.ui || {};
  global.tm.ui.confirmModal = confirmModal;
})(window);
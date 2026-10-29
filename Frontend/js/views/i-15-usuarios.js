/**
 * I-15 — Usuarios, roles y permisos (Fase F).
 * Administración de cuentas y permisos granulares (solo perfil administrador). Confirmación
 * antes de asignar/quitar permisos; separación técnico-funcional. 4 estados.
 * Script clásico: expone `tm.views.i15.renderI15`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var table = global.tm.ui.table;
  var confirmModal = global.tm.ui.confirmModal;
  var perms = global.tm.perms;

  var FALLBACK = { roles: [], permisosDisponibles: [], institucionesDisponibles: [], usuarios: [], aviso: "" };

  function datos() {
    return global.tm.fixtures.data("I-15", "exito") || FALLBACK;
  }

  function optionsTo(list) {
    return list.map(function (v) { return { label: v, value: v }; });
  }

  function renderI15(container, opts) {
    opts = opts || {};
    var d = datos();
    var usuarios = d.usuarios.map(function (u) { return JSON.parse(JSON.stringify(u)); });
    var seleccion = 0;
    var guardado = null;

    function demoSelector() {
      var wrap = layout.el("label", "toolbar__demo");
      wrap.appendChild(layout.el("span", null, "Vista (demo)"));
      var sel = layout.el("select");
      var opciones = [{ v: "carga", l: "Carga" }, { v: "exito", l: "Éxito" }, { v: "vacio", l: "Vacío" }, { v: "error", l: "Error" }];
      for (var i = 0; i < opciones.length; i++) { var o = layout.el("option", null, opciones[i].l); o.value = opciones[i].v; sel.appendChild(o); }
      sel.addEventListener("change", function () { if (opts.onDemoState) opts.onDemoState(sel.value); });
      wrap.appendChild(sel);
      return wrap;
    }

    function renderContent() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Usuarios, roles y permisos", "Cuentas del despacho y permisos granulares"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", "badge badge--info", usuarios.length + " cuentas"));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var note = layout.el("div", "app-alert app-alert--info");
      note.appendChild(layout.el("span", "app-alert__title", "Separación técnico-funcional"));
      note.appendChild(layout.el("span", "app-alert__text", d.aviso));
      inner.appendChild(note);

      var rows = usuarios.map(function (u, idx) {
        var action = layout.el("button", "btn btn--ghost", "Editar");
        action.type = "button";
        action.addEventListener("click", function () { seleccion = idx; guardado = null; renderContent(); });
        return [u.nombre, u.rol, u.permisos.join(", ") || "—", u.instituciones.join(", ") || "—", { node: layout.el("span", "badge badge--" + (u.estado === "activo" ? "success" : "danger"), u.estado) }, u.ultimoAcceso, { node: action }];
      });
      inner.appendChild(table({ headers: [
        { label: "Nombre" }, { label: "Rol" }, { label: "Permisos" }, { label: "Instituciones" }, { label: "Estado" }, { label: "Último acceso" }, { label: "" },
      ], rows: rows, emptyText: "No hay usuarios registrados." }));

      var u = usuarios[seleccion];
      var form = layout.el("fieldset", "wizard-section");
      form.appendChild(layout.el("legend", "wizard-section-title", "Editar cuenta — " + u.nombre));
      var grid = layout.el("div", "wizard-grid");
      grid.appendChild(field.fieldText({ id: "usrNombre", label: "Nombre", value: u.nombre }));
      grid.appendChild(field.fieldText({ id: "usrCedula", label: "Cédula", value: u.cedula }));
      grid.appendChild(field.fieldText({ id: "usrCargo", label: "Cargo", value: u.cargo }));
      grid.appendChild(field.fieldText({ id: "usrSeccion", label: "Sección", value: u.seccion }));
      grid.appendChild(field.fieldSelect({ id: "usrRol", label: "Rol", options: optionsTo(d.roles), value: u.rol }));
      grid.appendChild(field.fieldSelect({ id: "usrEstado", label: "Estado de la cuenta", options: [{ label: "activo", value: "activo" }, { label: "inactivo", value: "inactivo" }], value: u.estado }));
      grid.appendChild(field.fieldDate({ id: "usrVigencia", label: "Vigencia de la cuenta", value: u.vigencia }));
      grid.appendChild(field.fieldText({ id: "usrUltimo", label: "Último acceso", value: u.ultimoAcceso, disabled: true }));
      form.appendChild(grid);

      var permBlock = layout.el("div", "wizard-section");
      permBlock.appendChild(layout.el("h3", "wizard-section-title", "Permisos granulares"));
      for (var p = 0; p < d.permisosDisponibles.length; p++) {
        (function (nombre) {
          permBlock.appendChild(field.fieldCheckbox({ id: "per-" + nombre, label: nombre, checked: u.permisos.indexOf(nombre) >= 0, onChange: function (checked) {
            var i = u.permisos.indexOf(nombre);
            if (checked && i < 0) u.permisos.push(nombre);
            if (!checked && i >= 0) u.permisos.splice(i, 1);
          } }));
        })(d.permisosDisponibles[p]);
      }
      form.appendChild(permBlock);

      var instBlock = layout.el("div", "wizard-section");
      instBlock.appendChild(layout.el("h3", "wizard-section-title", "Instituciones habilitadas para consultar"));
      for (var n = 0; n < d.institucionesDisponibles.length; n++) {
        (function (nombre) {
          instBlock.appendChild(field.fieldCheckbox({ id: "inst-" + nombre.replace(/\s+/g, "-"), label: nombre, checked: u.instituciones.indexOf(nombre) >= 0, onChange: function (checked) {
            var i = u.instituciones.indexOf(nombre);
            if (checked && i < 0) u.instituciones.push(nombre);
            if (!checked && i >= 0) u.instituciones.splice(i, 1);
          } }));
        })(d.institucionesDisponibles[n]);
      }
      form.appendChild(instBlock);
      inner.appendChild(form);

      if (guardado) {
        var ok = layout.el("div", "app-alert app-alert--info");
        ok.appendChild(layout.el("span", "app-alert__title", "Permisos actualizados"));
        ok.appendChild(layout.el("span", "app-alert__text", "Cambio auditado (I-16). " + guardado));
        inner.appendChild(ok);
      }

      var errBox = layout.el("div", "auth-error", "");
      errBox.setAttribute("aria-live", "polite");
      inner.appendChild(errBox);

      var actions = layout.el("div", "toolbar__actions");
      var guardarPermisosBtn = button({ variant: "primary", text: "Guardar permisos", onClick: function () {
        errBox.textContent = "";
        errBox.classList.remove("is-visible");
        var rol = form.querySelector("#usrRol");
        if (rol && rol.value === "ADMIN" && u.permisos.length > 0) {
          errBox.textContent = "El ADMIN no puede tener permisos de consulta/decisión de expedientes (separación técnico-funcional).";
          errBox.classList.add("is-visible");
          return;
        }
        confirmModal("Guardar permisos", "¿Aplicar los cambios de rol y permisos a " + u.nombre + "?", {
          onConfirm: function () { guardado = "Rol: " + (rol ? rol.value : u.rol) + " · Permisos: " + (u.permisos.join(", ") || "ninguno"); u.rol = rol ? rol.value : u.rol; renderContent(); },
        });
      } });
      actions.appendChild(perms.can(perms.PERMS.ADMINISTRAR) ? guardarPermisosBtn : perms.notice(perms.PERMS.ADMINISTRAR, "Solo el rol administrador puede gestionar usuarios y permisos."));
      inner.appendChild(actions);

      container.appendChild(inner);
    }

    function renderSimple(titulo, subtitulo, mensaje, retry) {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader(titulo, subtitulo));
      var box = layout.el("div", "app-empty");
      box.appendChild(layout.el("p", null, mensaje));
      inner.appendChild(box);
      if (retry) {
        var actions = layout.el("div", "toolbar__actions");
        actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { show("carga"); } }));
        inner.appendChild(actions);
      }
      container.appendChild(inner);
    }

    function renderLoading() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Usuarios, roles y permisos", "Cargando cuentas…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Reuniendo roles y permisos…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderError() {
      renderSimple("Usuarios, roles y permisos", "No se pudo cargar", global.tm.fixtures.message("I-15", "error", "No pudimos cargar las cuentas."), true);
    }

    function show(state) {
      global.tm.fixtures.setScenario(state);
      if (state === "carga") { renderLoading(); setTimeout(renderContent, 700); return; }
      if (state === "error") { renderError(); return; }
      if (state === "vacio") { renderSimple("Usuarios, roles y permisos", "Sin usuarios", "No hay usuarios registrados."); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i15 = { renderI15: renderI15 };
})(window);

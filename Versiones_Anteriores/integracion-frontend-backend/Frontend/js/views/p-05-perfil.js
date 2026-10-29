/**
 * P-05 — Mi perfil / datos de contacto.
 * Online: GET/PATCH /api/perfil y PUT /api/auth/contrasena. Offline (file://): demo inline.
 * Incluye el consentimiento informado (Ley 81 de 2019 / DE 285 de 2021): ver estado y
 * revocar (sin efecto retroactivo). HU-18b (demostración, sin endpoint en este alcance).
 * El cambio de correo queda pendiente del PO: se muestra como no disponible.
 * Script clásico: expone `tm.views.p05.renderP05`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var confirmModal = global.tm.ui.confirmModal;

  var TIPOS_DOC = { PASAPORTE: "Pasaporte", CEDULA_E: "Cédula E", CARNE: "Carné" };
  var PAISES = { PA: "Panamá", US: "Estados Unidos", CO: "Colombia", VE: "Venezuela" };
  var IDIOMAS = [{ value: "ES", label: "Español" }, { value: "EN", label: "English" }];
  var MEDIOS = [
    { value: "CORREO", label: "Correo electrónico" },
    { value: "SMS", label: "SMS" },
    { value: "PUSH", label: "Notificación push" },
  ];

  var DEMO_PERFIL = {
    id: null,
    nombre: "María Demo",
    correo: "cliente@demo.pa",
    rol: "SOLICITANTE",
    tipoDocumento: "PASAPORTE",
    numeroDocumento: "123456789",
    nacionalidad: "PA",
    paisResidencia: "PA",
    telefono: "+507 6000-0000",
    idiomaNotificacion: "ES",
    medioNotificacion: "CORREO",
  };

  function etiqueta(mapa, valor) {
    return mapa[valor] || valor || "—";
  }

  function renderP05(container, opts) {
    opts = opts || {};
    container.innerHTML = "";
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Mi perfil", "Datos de la cuenta"));

    var perfilWrap = layout.el("div");
    inner.appendChild(perfilWrap);

    var passWrap = layout.el("div");
    inner.appendChild(passWrap);

    var consentWrap = renderConsentimiento(function () { return perfilActual; });
    inner.appendChild(consentWrap);

    container.appendChild(inner);

    var perfilActual = null;

    function renderPerfil(perfil, notaExito) {
      perfilActual = perfil;
      layout.clear(perfilWrap);

      var card = layout.el("div", "detail-card");
      card.appendChild(layout.el("h3", "wizard-section-title", "Datos de la cuenta"));

      var filas = [
        { label: "Nombres y apellidos", value: perfil.nombre },
        { label: "Tipo y número de documento", value: etiqueta(TIPOS_DOC, perfil.tipoDocumento) + " · " + (perfil.numeroDocumento || "—") },
        { label: "Nacionalidad", value: etiqueta(PAISES, perfil.nacionalidad) },
        { label: "País de residencia", value: etiqueta(PAISES, perfil.paisResidencia) },
        { label: "Correo electrónico", value: perfil.correo },
      ];
      for (var i = 0; i < filas.length; i++) {
        var row = layout.el("div", "detail-row");
        row.appendChild(layout.el("span", "detail-row__label", filas[i].label));
        row.appendChild(layout.el("span", "detail-row__value", filas[i].value));
        card.appendChild(row);
      }

      // Correo: solo lectura (el backend no soporta cambio de correo en este alcance).
      var notaCorreo = layout.el("p", "form-field__help", "El cambio de correo electrónico estará disponible en una entrega posterior.");
      card.appendChild(notaCorreo);

      // Datos de contacto editables (PATCH /api/perfil).
      var form = layout.el("form", "detail-card");
      form.noValidate = true;

      var tel = field.fieldText({ id: "telefono", label: "Teléfono (código país + número)", value: perfil.telefono || "", placeholder: "+507 6000-0000" });
      var idioma = field.fieldSelect({ id: "idiomaNotificacion", label: "Idioma de notificación", options: IDIOMAS, value: perfil.idiomaNotificacion });
      var medio = field.fieldSelect({ id: "medioNotificacion", label: "Medio de notificación", options: MEDIOS, value: perfil.medioNotificacion });

      form.appendChild(tel);
      form.appendChild(idioma);
      form.appendChild(medio);

      var msg = layout.el("div", "auth-info", "");
      msg.setAttribute("aria-live", "polite");
      form.appendChild(msg);

      var errBox = layout.el("div", "auth-error", "");
      errBox.setAttribute("aria-live", "polite");
      form.appendChild(errBox);

      var actions = layout.el("div", "detail-actions");
      var btnGuardar = button({ variant: "primary", text: "Guardar cambios", type: "submit" });
      actions.appendChild(btnGuardar);
      form.appendChild(actions);

      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        clear2();

        var telefono = tel.querySelector("input").value.trim();
        var idiomaVal = idioma.querySelector("select").value;
        var medioVal = medio.querySelector("select").value;

        if (!telefono) return setError2("El teléfono es obligatorio.");
        if (!/^\+?[0-9][0-9 ()-]{6,28}$/.test(telefono)) return setError2("El teléfono lleva código de país y número (7 a 30 caracteres).");

        var cambio = { telefono: telefono, idiomaNotificacion: idiomaVal, medioNotificacion: medioVal };
        setLoading2(true);

        if (!global.tm.api.isOnline()) {
          global.setTimeout(function () {
            setLoading2(false);
            renderPerfil({
              nombre: perfilActual.nombre,
              correo: perfilActual.correo,
              rol: perfilActual.rol,
              tipoDocumento: perfilActual.tipoDocumento,
              numeroDocumento: perfilActual.numeroDocumento,
              nacionalidad: perfilActual.nacionalidad,
              paisResidencia: perfilActual.paisResidencia,
              telefono: telefono,
              idiomaNotificacion: idiomaVal,
              medioNotificacion: medioVal,
            }, "Datos actualizados.");
          }, 300);
          return;
        }

        global.tm.api.request("PATCH", "/perfil",
          { pantalla: "P-05", body: cambio },
          function (err, data) {
            setLoading2(false);
            if (err) return setError2(err.mensajeUsuario);
            renderPerfil(data, "Datos actualizados.");
          });
      });

      card.appendChild(form);
      perfilWrap.appendChild(card);
      if (notaExito) showInfo(notaExito);

      function setError2(m) { errBox.textContent = m; errBox.classList.add("is-visible"); }
      function clear2() { errBox.textContent = ""; errBox.classList.remove("is-visible"); msg.textContent = ""; msg.classList.remove("is-visible"); }
      function setLoading2(l) { btnGuardar.disabled = l; btnGuardar.textContent = l ? "Guardando…" : "Guardar cambios"; }
      function showInfo(texto) { msg.textContent = texto; msg.classList.add("is-visible"); }
    }

    function cargarPerfil() {
      layout.clear(perfilWrap);
      if (!global.tm.api.isOnline()) {
        renderPerfil(DEMO_PERFIL, null);
        return;
      }

      var loading = layout.el("div", "app-loading");
      loading.setAttribute("role", "status");
      loading.appendChild(layout.el("span", "spinner"));
      loading.appendChild(layout.el("span", null, "Cargando perfil…"));
      perfilWrap.appendChild(loading);

      global.tm.api.request("GET", "/perfil", { pantalla: "P-05" }, function (err, data) {
        if (err) {
          layout.clear(perfilWrap);
          var alert = layout.el("div", "app-alert app-alert--warning");
          alert.appendChild(layout.el("span", "app-alert__title", "No pudimos cargar su perfil"));
          alert.appendChild(layout.el("span", "app-alert__text", err.mensajeUsuario));
          perfilWrap.appendChild(alert);
          var retry = layout.el("div", "detail-actions");
          retry.appendChild(button({ variant: "primary", text: "Reintentar", type: "button", onClick: cargarPerfil }));
          perfilWrap.appendChild(retry);
          return;
        }
        renderPerfil(data, null);
      });
    }

    cargarPerfil();
    renderCambioContrasena(passWrap, function () { return perfilActual; });
  }

  // ----- Cambio de contraseña (PUT /api/auth/contrasena) -----
  function renderCambioContrasena(wrap, getPerfil) {
    layout.clear(wrap);
    var card = layout.el("div", "detail-card");
    card.appendChild(layout.el("h3", "wizard-section-title", "Cambiar contraseña"));

    var form = layout.el("form", "detail-card");
    form.noValidate = true;

    var actual = field.fieldPassword({ id: "contrasenaActual", label: "Contraseña actual", required: true, toggle: true });
    var nueva = field.fieldPassword({
      id: "contrasenaNueva",
      label: "Nueva contraseña",
      required: true,
      toggle: true,
      helpText: "Mínimo 10 caracteres, con mayúscula, minúscula, número y símbolo",
    });
    var confirma = field.fieldPassword({ id: "contrasenaNueva2", label: "Confirmar nueva contraseña", required: true, toggle: true });

    form.appendChild(actual);
    form.appendChild(nueva);
    form.appendChild(confirma);

    var msg = layout.el("div", "auth-info", "");
    msg.setAttribute("aria-live", "polite");
    form.appendChild(msg);

    var errBox = layout.el("div", "auth-error", "");
    errBox.setAttribute("aria-live", "polite");
    form.appendChild(errBox);

    var actions = layout.el("div", "detail-actions");
    var btn = button({ variant: "primary", text: "Cambiar contraseña", type: "submit" });
    actions.appendChild(btn);
    form.appendChild(actions);

    card.appendChild(form);
    wrap.appendChild(card);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      clear();
      var p0 = actual.querySelector("input").value;
      var p1 = nueva.querySelector("input").value;
      var p2 = confirma.querySelector("input").value;
      var perfil = getPerfil() || {};

      if (!p0) return setError("La contraseña actual es obligatoria.");
      var faltas = global.tm.validacion.incumplimientos(p1, perfil.correo);
      if (faltas.length) return setError(faltas[0]);
      if (p1 !== p2) return setError("Las contraseñas no coinciden.");

      setLoading(true);

      function ok() {
        setLoading(false);
        form.reset();
        msg.textContent = "Su contraseña se actualizó correctamente.";
        msg.classList.add("is-visible");
      }

      if (!global.tm.api.isOnline()) {
        global.setTimeout(ok, 300);
        return;
      }

      global.tm.api.request("PUT", "/auth/contrasena",
        { pantalla: "P-05", body: { contrasenaActual: p0, contrasenaNueva: p1 } },
        function (err) {
          setLoading(false);
          if (err) return setError(err.mensajeUsuario);
          ok();
        });
    });

    function setError(m) { errBox.textContent = m; errBox.classList.add("is-visible"); }
    function clear() { errBox.textContent = ""; errBox.classList.remove("is-visible"); msg.textContent = ""; msg.classList.remove("is-visible"); }
    function setLoading(l) { btn.disabled = l; btn.textContent = l ? "Actualizando…" : "Cambiar contraseña"; }
  }

  // ----- Consentimiento informado (HU-18b) -----
  function renderConsentimiento(getPerfil) {
    var consentimiento = null;
    var cargando = true;
    var error = null;

    var consentWrap = layout.el("div", "detail-card");

    function render() {
      layout.clear(consentWrap);
      consentWrap.appendChild(layout.el("h3", "wizard-section-title", "Consentimiento informado (Ley 81 de 2019)"));

      if (cargando) {
        consentWrap.appendChild(layout.el("p", "form-field__help", "Consultando el estado real del consentimiento…"));
        return;
      }
      if (error) {
        consentWrap.appendChild(layout.el("p", "form-field__help", error));
        return;
      }
      if (!consentimiento) {
        consentWrap.appendChild(layout.el("p", "form-field__help", "No hay un consentimiento registrado todavía."));
        consentWrap.appendChild(button({
          variant: "primary", text: "Otorgar consentimiento", type: "button",
          onClick: function () {
            var perfil = getPerfil ? getPerfil() : null;
            if (!perfil || !perfil.id) { error = "No pudimos identificar al titular de la cuenta."; render(); return; }
            global.tm.api.request("POST", "/consentimientos", {
              pantalla: "P-05",
              body: { titularId: perfil.id, finalidad: "Gestión del trámite migratorio", alcance: "Datos personales necesarios para la gestión y verificación del expediente", baseLegal: "Consentimiento informado del titular", expreso: true }
            }, function (err, data) { if (err) { error = err.mensajeUsuario; render(); return; } consentimiento = data; render(); });
          }
        }));
        return;
      }

      var vigente = consentimiento.estado === "VIGENTE" || consentimiento.estado === "vigente";
      var estRow = layout.el("div", "detail-row");
      estRow.appendChild(layout.el("span", "detail-row__label", "Estado"));
      var estVal = layout.el("span", "detail-row__value");
      estVal.appendChild(layout.el("span", "badge badge--" + (vigente ? "success" : "danger"), consentimiento.estado));
      estRow.appendChild(estVal);
      consentWrap.appendChild(estRow);

      var campos = [
        { label: "Tipo", value: (consentimiento.expreso ? "Expreso" : "Informado") + " · " + consentimiento.alcance },
        { label: "Finalidad", value: consentimiento.finalidad },
        { label: "Otorgado el", value: consentimiento.fecha ? new Date(consentimiento.fecha).toLocaleDateString() : "—" },
        { label: "Vigencia", value: consentimiento.vigenciaHasta || "Sin fecha de vencimiento" },
        { label: "Responsable del tratamiento", value: consentimiento.responsable },
      ];
      for (var k = 0; k < campos.length; k++) {
        var cRow = layout.el("div", "detail-row");
        cRow.appendChild(layout.el("span", "detail-row__label", campos[k].label));
        cRow.appendChild(layout.el("span", "detail-row__value", campos[k].value));
        consentWrap.appendChild(cRow);
      }

      if (!vigente) {
        var alert = layout.el("div", "app-alert app-alert--warning");
        alert.appendChild(layout.el("span", "app-alert__title", "Consentimiento revocado"));
        alert.appendChild(layout.el("span", "app-alert__text", "La revocación no tiene efecto retroactivo. Para volver a operar, otorgue un nuevo consentimiento o autorice por representación acreditada."));
        consentWrap.appendChild(alert);
      }

      var nota = layout.el("p", "detail-row__value", "Sus derechos de acceso, rectificación, cancelación y oposición (ARCO) se ejercen desde “Ayuda y FAQ” (P-27). Destinatarios: Tribunal Electoral, CSS, Registro Público y SNM.");
      consentWrap.appendChild(nota);

      var cActions = layout.el("div", "detail-actions");
      if (vigente) {
        cActions.appendChild(button({
          variant: "danger", text: "Revocar consentimiento", type: "button",
          onClick: function () {
            confirmModal(
              "Revocar consentimiento informado",
              "¿Revocar su consentimiento informado? No tendrá efecto retroactivo y quedará registrado. Para volver a operar necesitará otorgar uno nuevo.",
                { onConfirm: function () {
                  if (!global.tm.api.isOnline()) { consentimiento.estado = "revocado"; render(); return; }
                  global.tm.api.request("PATCH", "/consentimientos/" + encodeURIComponent(consentimiento.id),
                    { pantalla: "P-05", body: {} }, function (err, data) {
                      if (err) { error = err.mensajeUsuario; render(); return; }
                      consentimiento = data;
                      render();
                    });
                } }
            );
          }
        }));
      } else {
        cActions.appendChild(button({
          variant: "primary", text: "Otorgar consentimiento", type: "button",
          onClick: function () {
            confirmModal(
              "Otorgar consentimiento informado",
              "¿Otorgar un nuevo consentimiento informado para el tratamiento de sus datos (Ley 81 de 2019 / DE 285 de 2021)?",
              { onConfirm: function () {
                  var perfil = getPerfil ? getPerfil() : null;
                  if (!perfil || !perfil.id) { error = "No pudimos identificar al titular de la cuenta."; render(); return; }
                  global.tm.api.request("POST", "/consentimientos", {
                    pantalla: "P-05",
                    body: { titularId: perfil.id, finalidad: "Gestión del trámite migratorio", alcance: "Datos personales necesarios para la gestión y verificación del expediente", baseLegal: "Consentimiento informado del titular", expreso: true }
                  }, function (err, data) {
                    if (err) { error = err.mensajeUsuario; render(); return; }
                    consentimiento = data;
                    render();
                  });
                } }
            );
          }
        }));
      }
      consentWrap.appendChild(cActions);
    }

    render();
    if (global.tm.api.isOnline()) {
      global.tm.api.request("GET", "/consentimientos", { pantalla: "P-05" }, function (err, data) {
        cargando = false;
        if (err) { error = err.mensajeUsuario; render(); return; }
        consentimiento = data && data.length ? data[0] : null;
        render();
      });
    } else {
      cargando = false;
      consentimiento = { id: null, estado: "vigente", alcance: "Trámite de residencia permanente", finalidad: "Gestión del trámite migratorio", fecha: "2026-03-12", vigenciaHasta: "2027-03-12", responsable: "Lic. Pedro Ruiz", expreso: true };
      render();
    }
    return consentWrap;
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p05 = { renderP05: renderP05 };
})(window);

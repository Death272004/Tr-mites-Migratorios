/**
 * autofill.js — autorrellenado de pantallas para agilizar pruebas (solo demo).
 *
 * Recorre los campos del contenedor visible (`#contenido`) y los completa con
 * datos de prueba no sensibles: textos, fechas, selects (primera opción válida),
 * radios, checkboxes, firma manuscrita (simulada) y cargas de archivo.
 * No envía nada ni persiste: el asistente sigue guardando en `tm.draft` al
 * pulsar «Continuar». Nunca usa datos reales.
 * Script clásico: expone `tm.autofill`.
 */
(function (global) {
  "use strict";

  var TODAY = new Date().toISOString().slice(0, 10);
  var PROFILE_KEY = "tm.solicitud.demo.profile";

  var PROFILES = [
    {
      id: "andrea-morales",
      name: "Andrea Morales Vega",
      caption: "Pasaporte colombiano · solicitud laboral",
      values: {
        primerapellido: "Morales", segundoapellido: "Vega", nombres: "Andrea Lucía",
        nombrespasaporte: "MORALES VEGA ANDREA LUCIA", fechanacimiento: "1992-04-18",
        lugarnacimiento: "Medellín", nombrepadre: "Jorge Morales", nombremadre: "Elena Vega",
        numdoctitular: "CO-DEMO-1001", nombretitular: "Andrea Lucía Morales Vega",
        numpasaporte: "CO-DEMO-1001", correonotificacion: "andrea.morales@demo.invalid",
        telefononotificacion: "+507 6000-1001", titularrecibo: "Andrea Lucía Morales Vega",
        nombrefirmante: "Andrea Lucía Morales Vega"
      },
      selects: { paisNacimiento: "CO", nacionalidad: "CO", nacionalidadPadre: "CO", nacionalidadMadre: "CO", sexo: "F", estadoCivil: "SOLTERO", paisEmisor: "CO" }
    },
    {
      id: "luis-herrera",
      name: "Luis Herrera Soto",
      caption: "Pasaporte venezolano · solicitud familiar",
      values: {
        primerapellido: "Herrera", segundoapellido: "Soto", nombres: "Luis Alberto",
        nombrespasaporte: "HERRERA SOTO LUIS ALBERTO", fechanacimiento: "1988-09-07",
        lugarnacimiento: "Caracas", nombrepadre: "Alberto Herrera", nombremadre: "Mónica Soto",
        numdoctitular: "VE-DEMO-1002", nombretitular: "Luis Alberto Herrera Soto",
        numpasaporte: "VE-DEMO-1002", correonotificacion: "luis.herrera@demo.invalid",
        telefononotificacion: "+507 6000-1002", titularrecibo: "Luis Alberto Herrera Soto",
        nombrefirmante: "Luis Alberto Herrera Soto"
      },
      selects: { paisNacimiento: "VE", nacionalidad: "VE", nacionalidadPadre: "VE", nacionalidadMadre: "VE", sexo: "M", estadoCivil: "CASADO", paisEmisor: "VE" }
    },
    {
      id: "sofia-alvarez",
      name: "Sofía Álvarez Ruiz",
      caption: "Pasaporte costarricense · solicitud de estudios",
      values: {
        primerapellido: "Álvarez", segundoapellido: "Ruiz", nombres: "Sofía Elena",
        nombrespasaporte: "ALVAREZ RUIZ SOFIA ELENA", fechanacimiento: "1998-02-21",
        lugarnacimiento: "San José", nombrepadre: "Mario Álvarez", nombremadre: "Laura Ruiz",
        numdoctitular: "CR-DEMO-1003", nombretitular: "Sofía Elena Álvarez Ruiz",
        numpasaporte: "CR-DEMO-1003", correonotificacion: "sofia.alvarez@demo.invalid",
        telefononotificacion: "+507 6000-1003", titularrecibo: "Sofía Elena Álvarez Ruiz",
        nombrefirmante: "Sofía Elena Álvarez Ruiz"
      },
      selects: { paisNacimiento: "CR", nacionalidad: "CR", nacionalidadPadre: "CR", nacionalidadMadre: "CR", sexo: "F", estadoCivil: "SOLTERO", paisEmisor: "CR" }
    },
    {
      id: "mateo-castillo",
      name: "Mateo Castillo Rojas",
      caption: "Pasaporte dominicano · residencia temporal",
      values: {
        primerapellido: "Castillo", segundoapellido: "Rojas", nombres: "Mateo José",
        nombrespasaporte: "CASTILLO ROJAS MATEO JOSE", fechanacimiento: "1985-12-11",
        lugarnacimiento: "Santo Domingo", nombrepadre: "José Castillo", nombremadre: "Irene Rojas",
        numdoctitular: "DO-DEMO-1004", nombretitular: "Mateo José Castillo Rojas",
        numpasaporte: "DO-DEMO-1004", correonotificacion: "mateo.castillo@demo.invalid",
        telefononotificacion: "+507 6000-1004", titularrecibo: "Mateo José Castillo Rojas",
        nombrefirmante: "Mateo José Castillo Rojas"
      },
      selects: { paisNacimiento: "DO", nacionalidad: "DO", nacionalidadPadre: "DO", nacionalidadMadre: "DO", sexo: "M", estadoCivil: "CASADO", paisEmisor: "DO" }
    },
    {
      id: "valentina-navarro",
      name: "Valentina Navarro Paz",
      caption: "Pasaporte ecuatoriano · residencia permanente",
      values: {
        primerapellido: "Navarro", segundoapellido: "Paz", nombres: "Valentina Isabel",
        nombrespasaporte: "NAVARRO PAZ VALENTINA ISABEL", fechanacimiento: "1994-07-30",
        lugarnacimiento: "Quito", nombrepadre: "Ramón Navarro", nombremadre: "Isabel Paz",
        numdoctitular: "EC-DEMO-1005", nombretitular: "Valentina Isabel Navarro Paz",
        numpasaporte: "EC-DEMO-1005", correonotificacion: "valentina.navarro@demo.invalid",
        telefononotificacion: "+507 6000-1005", titularrecibo: "Valentina Isabel Navarro Paz",
        nombrefirmante: "Valentina Isabel Navarro Paz"
      },
      selects: { paisNacimiento: "EC", nacionalidad: "EC", nacionalidadPadre: "EC", nacionalidadMadre: "EC", sexo: "F", estadoCivil: "SOLTERO", paisEmisor: "EC" }
    }
  ];

  // Valores demo por id exacto (clave en minúsculas).
  var EXACT = {
    // P-01 / P-02 / I-01 (autenticación)
    correo: "cliente@demo.pa",
    correoregistro: "nuevo.cliente@demo.pa",
    tokenrecuperacion: "token-de-prueba",
    telefono: "+507 6000-0000",
    numdoc: "8-712-3456",
    usuario: "analista",
    usuariointerno: "analista",
    perfilinterno: "FUNCIONARIO",

    // P-09 datos personales
    primerapellido: "Pérez",
    segundoapellido: "Gómez",
    nombres: "Juan Carlos",
    nombrespasaporte: "PEREZ GOMEZ JUAN CARLOS",
    fechanacimiento: "1990-05-14",
    lugarnacimiento: "Ciudad de Panamá",
    nombrepadre: "Carlos Pérez",
    nombremadre: "Ana Gómez",
    nombreconyuge: "María Rodríguez",
    fechamatrimonio: "2018-11-03",
    lugarmatrimonio: "Ciudad de Panamá",
    docexterior: "AB123456",

    // P-10 pasaporte e historial
    numpasaporte: "PA1234567",
    fechaexpedicion: "2022-01-15",
    fechavencimiento: "2032-01-15",
    lugarexpedicion: "Ciudad de Panamá",
    sellofecha: "2026-08-30",
    numruex: "8-712-3456",
    ultimopermiso: "PRO-2026-00987",
    numerocarne: "CAR-2026-00123",
    carnenumero: "E-1234-5678",
    pasaportesanteriores: "PA0001111, PA0002222",
    motivocambiospasaporte: "Vencimiento de vigencia",

    // P-11 domicilio y notificaciones
    distrito: "Panamá",
    corregimiento: "Bella Vista",
    direccioncompleta: "Calle 50, Torre Global, Apto. 12B, Bella Vista",
    titularrecibo: "Juan Carlos Pérez Gómez",
    numerorecibo: "L-2026-778899",
    direccionnotificacion: "Calle 50, Torre Global, Apto. 12B",
    correonotificacion: "cliente@demo.pa",
    telefonenotificacion: "+507 6000-0000",

    // P-12 situación
    empleador: "Tech Solutions Panamá, S.A.",
    ruc: "1556789-1-2020 DV 12",
    cargo: "Desarrollador de software senior",
    iniciolaboral: "2023-03-01",
    salario: "3500.00",
    moneda: "USD (B/.)",
    permisodetrabajo: "PT-2026-0456",
    monto: "300000.00",
    numcuenta: "03-1234-56789",
    finca: "F-98765",
    sociedad: "Inversiones Istmo, S.A.",
    capital: "50000.00",
    institucion: "Universidad Tecnológica de Panamá",
    carrera: "Ingeniería de Sistemas — tiempo completo",
    matricula: "2026-UTP-7788",
    beca: "SENACYT",
    nombrepariente: "Rosa Gómez",
    cedulapariente: "8-888-9999",
    hijospanamenos: "2 (Juan y Sofía)",
    entidad: "Fundación Cultural Istmo",
    actividad: "Coordinador de proyectos",
    duraciondesde: "2026-01-01",
    duracionhasta: "2026-12-31",
    convenio: "Convenio Marco 2026",

    // P-13 dependientes (id dinámico dep#_...)
    // P-15 pagos
    chequenumero: "CH-001234",
    chequefecha: "2026-09-15",

    // P-16 declaración y firma
    lugarfirma: "Ciudad de Panamá",
    fechafirma: TODAY,
    nombrefirmante: "Juan Carlos Pérez Gómez",

    // P-08 titularidad y representación
    numdoctitular: "8-712-3456",
    nombretitular: "Juan Carlos Pérez Gómez",
    cedulaabogado: "8-123-4567 · Idoneidad 12345",
    cedulapasante: "8-765-4321",
    repnombre: "Lic. María Rodríguez",
    repdoc: "8-888-7777",
    reptel: "+507 6111-2222",
    repcorreo: "rep.demo@bufete.test",
  };

  // Reglas por patrón de id/nombre (después del mapa exacto).
  var RULES = [
    { re: /(^|_)correo|email/, value: "cliente@demo.pa" },
    { re: /(^|_)telefono|(^|_)tel$|celular|movil/, value: "+507 6000-0000" },
    { re: /(^|_)ruc/, value: "1556789-1-2020 DV 12" },
    { re: /cedula|documento|numdoc|(^|_)doc$/, value: "8-712-3456" },
    { re: /pasaporte/, value: "PA1234567" },
    { re: /direccion|domicilio/, value: "Calle 50, Torre Global, Apto. 12B, Bella Vista" },
    { re: /monto|salario|capital|importe/, value: "300000.00" },
    { re: /numero|(^|_)num|finca|cuenta|matricula|carne/, value: "123456789" },
    { re: /nombre/, value: "Juan Carlos Pérez" },
    { re: /apellido/, value: "Pérez" },
    { re: /lugar|ciudad|puesto|provincia/, value: "Ciudad de Panamá" },
  ];

  function keyOf(el) {
    return String(el.id || el.name || "").toLowerCase();
  }

  function getProfile(id) {
    var selected = id;
    if (!selected) {
      try { selected = global.sessionStorage.getItem(PROFILE_KEY); } catch (e) { selected = ""; }
    }
    for (var i = 0; i < PROFILES.length; i++) if (PROFILES[i].id === selected) return PROFILES[i];
    return null;
  }

  function setProfile(id) {
    try {
      if (id) global.sessionStorage.setItem(PROFILE_KEY, id);
      else global.sessionStorage.removeItem(PROFILE_KEY);
    } catch (e) { /* ignore */ }
    return getProfile(id);
  }

  function valueFor(el, profile) {
    var key = keyOf(el);
    if (profile && profile.values && Object.prototype.hasOwnProperty.call(profile.values, key)) return profile.values[key];
    if (Object.prototype.hasOwnProperty.call(EXACT, key)) return EXACT[key];
    for (var i = 0; i < RULES.length; i++) {
      if (RULES[i].re.test(key)) return RULES[i].value;
    }
    return byType(el);
  }

  function byType(el) {
    var t = String(el.type || "text").toLowerCase();
    if (t === "date") return TODAY;
    if (t === "datetime-local") return TODAY + "T10:00";
    if (t === "email") return "cliente@demo.pa";
    // Nunca se rellenan contraseñas, tokens ni códigos de verificación.
    if (t === "password") return "";
    if (t === "number" || t === "range") return "100";
    if (t === "tel") return "+507 6000-0000";
    if (t === "url") return "https://ejemplo.test";
    return "Dato de prueba";
  }

  function isPlaceholder(opt) {
    if (!opt) return true;
    if (opt.disabled) return true;
    if (opt.value === "" || opt.value == null) return true;
    return /seleccione|selecciona|elige|--/.test(String(opt.textContent || "").toLowerCase());
  }

  function pickOption(sel) {
    for (var i = 0; i < sel.options.length; i++) {
      if (!isPlaceholder(sel.options[i])) return sel.options[i];
    }
    return null;
  }

  function isFillableInput(el) {
    if (el.disabled || el.readOnly) return false;
    var skip = { checkbox: 1, radio: 1, file: 1, hidden: 1, submit: 1, button: 1, image: 1, reset: 1, range: 1, color: 1 };
    return !skip[String(el.type || "text").toLowerCase()];
  }

  function dispatch(el, type) {
    if (!el || !global.document.contains(el)) return;
    var ev;
    try {
      ev = new Event(type, { bubbles: true });
    } catch (e) {
      ev = global.document.createEvent("HTMLEvents");
      ev.initEvent(type, true, false);
    }
    el.dispatchEvent(ev);
  }

  function fillSignatures(root, result) {
    var pads = root.querySelectorAll(".signature");
    for (var i = 0; i < pads.length; i++) {
      var pad = pads[i];
      if (typeof pad.isDirty === "function" && pad.isDirty()) continue;
      var canvas = pad.querySelector("canvas");
      if (!canvas) continue;
      var rect = canvas.getBoundingClientRect();
      var w = rect.width || 320;
      var h = rect.height || 100;
      var cx = rect.left;
      var cy = rect.top;
      var y = cy + h * 0.5;
      var x1 = cx + w * 0.22;
      var x2 = cx + w * 0.78;
      var evt = function (type, x, yy) {
        try {
          canvas.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: yy }));
        } catch (e) { /* entorno sin MouseEvent */ }
      };
      evt("mousedown", x1, y);
      var pasos = 6;
      for (var s = 1; s <= pasos; s++) {
        evt("mousemove", x1 + ((x2 - x1) * s) / pasos, y + (s % 2 ? -h * 0.18 : h * 0.18));
      }
      evt("mouseup", x2, y);
      result.count += 1;
    }
  }

  function fillFiles(root, result) {
    if (!global.DataTransfer || !global.File) return;
    var inputs = root.querySelectorAll('input[type="file"]');
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      if (inp.disabled) continue;
      try {
        var dt = new global.DataTransfer();
        dt.items.add(new global.File(["documento de demostración"], "documento-demo.pdf", { type: "application/pdf" }));
        inp.files = dt.files;
        inp.dispatchEvent(new Event("change", { bubbles: true }));
        result.count += 1;
      } catch (e) { /* el navegador no permite asignar files */ }
    }
  }

  function preferredOption(sel, profile) {
    if (!profile || !profile.selects) return null;
    var wanted = profile.selects[sel.id] || profile.selects[sel.name];
    if (!wanted) return null;
    for (var i = 0; i < sel.options.length; i++) if (String(sel.options[i].value) === String(wanted)) return sel.options[i];
    return null;
  }

  function fill(root, options) {
    root = root || global.document.getElementById("contenido") || global.document;
    options = options || {};
    var profile = getProfile(options.profileId);
    var result = { count: 0 };
    var pending = [];
    var radioGroups = {};
    var i;

    var inputs = root.querySelectorAll("input, textarea");
    for (i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var type = String(el.type || "text").toLowerCase();

      if (type === "checkbox") {
        if (el.disabled) continue;
        if (!el.checked) { el.checked = true; result.count += 1; }
        pending.push([el, "change"]);
        continue;
      }
      if (type === "radio") {
        if (el.disabled) continue;
        var name = el.name || ("radio_" + i);
        (radioGroups[name] = radioGroups[name] || []).push(el);
        continue;
      }
      if (type === "file") continue;
      if (!isFillableInput(el)) continue;

      var value = valueFor(el, profile);
      if (String(el.value) !== String(value)) { el.value = value; result.count += 1; }
      pending.push([el, el.tagName === "TEXTAREA" || type === "text" ? "input" : "change"]);
    }

    for (var g in radioGroups) {
      if (!Object.prototype.hasOwnProperty.call(radioGroups, g)) continue;
      var group = radioGroups[g];
      var anyChecked = false;
      for (i = 0; i < group.length; i++) if (group[i].checked) { anyChecked = true; break; }
      if (!anyChecked && group.length) { group[0].checked = true; result.count += 1; }
      for (i = 0; i < group.length; i++) pending.push([group[i], "change"]);
    }

    var selects = root.querySelectorAll("select");
    for (i = 0; i < selects.length; i++) {
      var sel = selects[i];
      if (sel.disabled) continue;
      var opt = preferredOption(sel, profile) || pickOption(sel);
      if (opt && String(sel.value) !== String(opt.value)) {
        sel.value = opt.value;
        result.count += 1;
        pending.push([sel, "change"]);
      }
    }

    // Segunda pasada: dispara eventos una vez fijados los valores, para que se
    // ejecuten las lógicas de visibilidad/progreso sin que un re-render corte el relleno.
    for (i = 0; i < pending.length; i++) dispatch(pending[i][0], pending[i][1]);

    fillSignatures(root, result);
    fillFiles(root, result);

    return result;
  }

  function fillStage(root, options, done) {
    var total = 0;
    var passes = [0, 140, 420];
    for (var i = 0; i < passes.length; i++) {
      (function (delay, last) {
        global.setTimeout(function () {
          total += fill(typeof root === "function" ? root() : root, options).count;
          if (last && done) done(total);
        }, delay);
      })(passes[i], i === passes.length - 1);
    }
  }

  function createStageControl(options) {
    options = options || {};
    var panel = global.document.createElement("section");
    panel.className = "demo-fill";
    panel.setAttribute("aria-label", "Datos ficticios para demostración");

    var heading = global.document.createElement("div");
    heading.className = "demo-fill__heading";
    var title = global.document.createElement("strong");
    title.textContent = "Datos de prueba";
    var badge = global.document.createElement("span");
    badge.className = "demo-fill__badge";
    badge.textContent = "Solo demostración";
    heading.appendChild(title);
    heading.appendChild(badge);
    panel.appendChild(heading);

    var profileArea = global.document.createElement("div");
    profileArea.className = "demo-fill__profiles";
    panel.appendChild(profileArea);

    function renderProfiles() {
      profileArea.innerHTML = "";
      var active = getProfile();
      if (options.chooseProfile) {
        var activation = global.document.createElement("label");
        activation.className = "demo-fill__activation";
        var check = global.document.createElement("input");
        check.type = "checkbox";
        check.checked = !!active;
        activation.appendChild(check);
        var activationText = global.document.createElement("span");
        activationText.textContent = "Usar una persona ficticia para completar el formulario";
        activation.appendChild(activationText);
        profileArea.appendChild(activation);

        var choices = global.document.createElement("div");
        choices.className = "demo-fill__choices";
        choices.hidden = !check.checked;
        for (var i = 0; i < PROFILES.length; i++) {
          var item = global.document.createElement("label");
          item.className = "demo-fill__choice";
          var radio = global.document.createElement("input");
          radio.type = "radio";
          radio.name = "demo-profile";
          radio.value = PROFILES[i].id;
          radio.checked = !!active && active.id === PROFILES[i].id;
          var text = global.document.createElement("span");
          text.innerHTML = "<strong>" + PROFILES[i].name + "</strong><small>" + PROFILES[i].caption + "</small>";
          radio.addEventListener("change", function () { setProfile(this.value); updateButton(); });
          item.appendChild(radio);
          item.appendChild(text);
          choices.appendChild(item);
        }
        profileArea.appendChild(choices);
        check.addEventListener("change", function () {
          choices.hidden = !check.checked;
          if (!check.checked) setProfile("");
          updateButton();
        });
      } else {
        var summary = global.document.createElement("p");
        summary.className = "demo-fill__summary";
        summary.textContent = active ? "Persona seleccionada: " + active.name : "Seleccione una persona ficticia en la etapa 1 para habilitar el autocompletado.";
        profileArea.appendChild(summary);
      }
    }

    var actions = global.document.createElement("div");
    actions.className = "demo-fill__actions";
    var status = global.document.createElement("span");
    status.className = "demo-fill__status";
    status.setAttribute("aria-live", "polite");
    var fillButton = global.document.createElement("button");
    fillButton.type = "button";
    fillButton.className = "btn demo-fill__button";
    fillButton.textContent = "Completar esta etapa";
    fillButton.addEventListener("click", function () {
      if (!getProfile()) return;
      fillButton.disabled = true;
      status.textContent = "Completando…";
      fillStage(options.root, { profileId: getProfile().id }, function () {
        fillButton.disabled = false;
        fillButton.textContent = "Volver a completar esta etapa";
        status.textContent = "Etapa completada con datos ficticios. Revise antes de continuar.";
        if (options.onFilled) options.onFilled();
      });
    });
    actions.appendChild(status);
    actions.appendChild(fillButton);
    panel.appendChild(actions);

    function updateButton() {
      fillButton.disabled = !getProfile() || (options.isReady && !options.isReady());
    }

    panel.refresh = function () { renderProfiles(); updateButton(); };
    panel.updateAvailability = updateButton;
    renderProfiles();
    updateButton();
    return panel;
  }

  global.tm = global.tm || {};
  global.tm.autofill = {
    fill: fill,
    fillStage: fillStage,
    createStageControl: createStageControl,
    profiles: PROFILES.slice(),
    getProfile: getProfile,
    setProfile: setProfile,
  };
})(window);

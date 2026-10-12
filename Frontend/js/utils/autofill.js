/**
 * autofill.js — autorrellenado de pantallas para agilizar pruebas (solo demo).
 *
 * Recorre los campos del contenedor visible (`#contenido`) y los completa con
 * datos ficticios plausibles: textos, fechas, selects (primera opción válida),
 * radios, checkboxes, firma manuscrita (simulada) y cargas de archivo.
 * No envía nada ni persiste: el asistente sigue guardando en `tm.draft` al
 * pulsar «Continuar». Nunca usa datos reales.
 * Script clásico: expone `tm.autofill`.
 */
(function (global) {
  "use strict";

  var TODAY = new Date().toISOString().slice(0, 10);

  // Valores demo por id exacto (clave en minúsculas).
  var EXACT = {
    // P-01 / P-02 / I-01 (autenticación)
    correo: "demo@bufete.test",
    clave: "Demo123!",
    clave2: "Demo123!",
    telefono: "+507 6000-0000",
    numdoc: "8-712-3456",
    usuario: "analista",
    usuariointerno: "analista",
    claveinterna: "Interno123!",
    mfainterno: "123456",
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
    correonotificacion: "cliente.demo@bufete.test",
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
    { re: /(^|_)correo|email/, value: "demo@bufete.test" },
    { re: /(^|_)clave|password|contrasena/, value: "Demo123!" },
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

  function valueFor(el) {
    var key = keyOf(el);
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
    if (t === "email") return "demo@bufete.test";
    if (t === "password") return "Demo123!";
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

  function fill(root) {
    root = root || global.document.getElementById("contenido") || global.document;
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

      var value = valueFor(el);
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
      var opt = pickOption(sel);
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

  global.tm = global.tm || {};
  global.tm.autofill = { fill: fill };
})(window);

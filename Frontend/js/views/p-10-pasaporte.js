/**
 * P-10 Paso 2 — Pasaporte e historial migratorio.
 * El sello de ingreso y el RUEX se cotejan con servicios del SNM ([A]/[S]);
 * el historial de entradas/salidas tiene dos modos que elige el solicitante:
 * con convenio se muestra lo consultado al SNM en solo lectura; sin convenio
 * lo declara él mismo, con un comprobante por movimiento. La opción inicial
 * sale de utils/convenios.js.
 * 4 estados: carga, éxito, vacío, error.
 * Script clásico: expone `tm.views.p10.renderP10`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var wizard = global.tm.wizard;
  var draft = global.tm.draft;
  var data = global.tm.data;
  var fixtures = global.tm.fixtures;

  var ROUTE = "#/solicitud/paso-2";

  function byId(id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; }

  var HIST_DEFAULT = [
    { fecha: "2026-08-30", movimiento: "Entrada", puesto: "Tocumen" },
    { fecha: "2026-06-14", movimiento: "Salida", puesto: "Paso Canoas" },
    { fecha: "2026-05-02", movimiento: "Entrada", puesto: "Tocumen" },
  ];

  function demoSelector(opts) {
    var wrap = layout.el("label", "toolbar__demo");
    wrap.appendChild(layout.el("span", null, "Vista (demo)"));
    var select = layout.el("select");
    var opciones = [
      { v: "carga", l: "Carga" },
      { v: "exito", l: "Éxito" },
      { v: "vacio", l: "Vacío" },
      { v: "error", l: "Error" },
    ];
    for (var i = 0; i < opciones.length; i++) {
      var o = layout.el("option", null, opciones[i].l);
      o.value = opciones[i].v;
      select.appendChild(o);
    }
    select.addEventListener("change", function () {
      if (opts.onDemoState) opts.onDemoState(select.value);
    });
    wrap.appendChild(select);
    return wrap;
  }

  function renderLoading(container) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Pasaporte e historial migratorio", "Cargando…"));
    var loading = layout.el("div", "app-loading");
    loading.appendChild(layout.el("span", "spinner"));
    loading.appendChild(layout.el("span", null, "Cargando…"));
    inner.appendChild(loading);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Pasaporte e historial migratorio", "No se pudo cargar la información"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "No pudimos cargar su historial migratorio"));
    alert.appendChild(layout.el(
      "span",
      "app-alert__text",
      (opts && opts.mensaje) || "Ocurrió un problema temporal. Intente nuevamente."
    ));
    inner.appendChild(alert);
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    inner.appendChild(retry);
    container.appendChild(inner);
  }

  var PUESTOS = [
    { value: "", label: "Seleccione…" },
    { value: "Tocumen", label: "Aeropuerto de Tocumen" },
    { value: "Paso Canoas", label: "Paso Canoas" },
    { value: "Guabito", label: "Guabito" },
    { value: "Puerto", label: "Puerto / marítimo" },
    { value: "Otro", label: "Otro puesto" },
  ];
  var secuenciaMovimiento = 0;

  /**
   * Historial declarado por el solicitante (sin convenio con el SNM): una fila
   * por entrada o salida, cada una con su propio comprobante.
   */
  function movimientosDeclarados(guardados) {
    var docs = global.tm.docs;
    var seccion = layout.el("div", "movements__declared");
    seccion.appendChild(layout.el("p", "movements__intro",
      "Registre cada entrada y salida de Panamá y adjunte su comprobante (por ejemplo, la página del pasaporte con el sello). " +
      "Por ahora estos datos los aporta usted; el despacho los verifica al revisar la solicitud."));
    var lista = layout.el("div", "movements__list");
    seccion.appendChild(lista);
    var filas = [];

    function renumerar() {
      filas.forEach(function (f, i) { f.titulo.textContent = "Movimiento " + (i + 1); });
    }

    function agregar(previo) {
      previo = previo || {};
      secuenciaMovimiento += 1;
      var id = "mov" + secuenciaMovimiento;
      var clave = previo.clave || ("mov:" + Date.now() + ":" + secuenciaMovimiento);
      var fila = layout.el("div", "movements__row");
      var cabecera = layout.el("div", "movements__head");
      var titulo = layout.el("strong", "movements__title", "Movimiento");
      cabecera.appendChild(titulo);
      var quitar = layout.el("button", "btn movements__remove", "Quitar movimiento");
      quitar.type = "button";
      cabecera.appendChild(quitar);
      fila.appendChild(cabecera);

      var grid = layout.el("div", "wizard-grid");
      grid.appendChild(field.fieldDate({ id: id + "_fecha", label: "Fecha", value: previo.fecha, required: true }));
      grid.appendChild(field.fieldSelect({
        id: id + "_movimiento", label: "Movimiento",
        options: [{ value: "", label: "Seleccione…" }, { value: "Entrada", label: "Entrada" }, { value: "Salida", label: "Salida" }],
        value: previo.movimiento, required: true,
      }));
      grid.appendChild(field.fieldSelect({ id: id + "_puesto", label: "Puesto migratorio", options: PUESTOS, value: previo.puesto, required: true }));
      fila.appendChild(grid);

      fila.appendChild(docs.card({
        tag: "div",
        key: clave,
        grupo: "movimientos",
        label: "Comprobante del movimiento",
        // El sello es una página del pasaporte: se archiva con ese tipo documental.
        tipoDocumental: "PASAPORTE",
        prioritario: true,
      }));

      var registro = { id: id, clave: clave, el: fila, titulo: titulo };
      quitar.addEventListener("click", function () {
        docs.remove(clave);
        filas.splice(filas.indexOf(registro), 1);
        fila.remove();
        renumerar();
      });
      filas.push(registro);
      lista.appendChild(fila);
      renumerar();
    }

    var acciones = layout.el("div", "movements__actions");
    var btnAgregar = layout.el("button", "btn", "Agregar movimiento");
    btnAgregar.type = "button";
    btnAgregar.addEventListener("click", function () { agregar(null); });
    acciones.appendChild(btnAgregar);
    seccion.appendChild(acciones);

    // Se retira lo que haya quedado de filas que ya no existen en el borrador.
    var claves = {};
    (guardados || []).forEach(function (g) { if (g && g.clave) claves[g.clave] = true; });
    docs.list("movimientos").forEach(function (e) { if (!claves[e.key]) docs.remove(e.key); });

    if (guardados && guardados.length) guardados.forEach(agregar);
    else agregar(null);

    function valor(fila, campo) { return byId(fila.id + "_" + campo); }

    return {
      el: seccion,
      validar: function () {
        if (!filas.length) return "Registre al menos un movimiento migratorio (su última entrada a Panamá).";
        for (var i = 0; i < filas.length; i++) {
          var n = "movimiento " + (i + 1);
          if (!valor(filas[i], "fecha") || !valor(filas[i], "movimiento") || !valor(filas[i], "puesto")) {
            return "Complete la fecha, el tipo y el puesto del " + n + ".";
          }
          if (!docs.get(filas[i].clave)) return "Adjunte el comprobante del " + n + ".";
        }
        return null;
      },
      leer: function () {
        return filas.map(function (f) {
          var entrada = docs.get(f.clave);
          return {
            clave: f.clave,
            fecha: valor(f, "fecha"),
            movimiento: valor(f, "movimiento"),
            puesto: valor(f, "puesto"),
            comprobante: entrada ? entrada.file.name : null,
          };
        });
      },
    };
  }

  function renderContent(container, opts, escenario) {
    opts = opts || {};
    var body = wizard.frame(container, ROUTE);
    body.appendChild(demoSelector(opts));
    var d = draft.getDraft().pasaporte || {};

    var fuente = (fixtures && fixtures.data("P-10", escenario)) || {};
    var historial = fuente.historial;
    if (!historial) historial = HIST_DEFAULT;

    var grid = layout.el("div", "wizard-grid");
    grid.appendChild(field.fieldText({ id: "numPasaporte", label: "Número de pasaporte vigente", value: d.numPasaporte, required: true }));
    grid.appendChild(field.fieldSelect({ id: "paisEmisor", label: "País emisor del pasaporte", options: data.paisOptions("Seleccione…"), value: d.paisEmisor, required: true }));
    grid.appendChild(field.fieldDate({ id: "fechaExpedicion", label: "Fecha de expedición", value: d.fechaExpedicion, required: true }));
    grid.appendChild(field.fieldDate({ id: "fechaVencimiento", label: "Fecha de vencimiento", value: d.fechaVencimiento, required: true, helpText: "Vigencia mínima habitual: 3 meses." }));
    grid.appendChild(field.fieldText({ id: "lugarExpedicion", label: "Lugar de expedición", value: d.lugarExpedicion }));
    body.appendChild(grid);

    var sello = layout.el("fieldset", "wizard-section");
    sello.appendChild(layout.el("legend", "wizard-section-title", "Sello de ingreso"));
    var selloGrid = layout.el("div", "wizard-grid");
    selloGrid.appendChild(field.fieldDate({ id: "selloFecha", label: "Fecha del sello de ingreso", value: d.selloFecha, required: true }));
    selloGrid.appendChild(field.fieldSelect({
      id: "selloPuesto", label: "Puesto fronterizo",
      options: [{ value: "", label: "Seleccione…" }, { value: "Tocumen", label: "Aeropuerto de Tocumen" }, { value: "Paso Canoas", label: "Paso Canoas" }, { value: "Guabito", label: "Guabito" }, { value: "Puerto", label: "Puerto / marítimo" }],
      value: d.selloPuesto, required: true,
    }));
    selloGrid.appendChild(field.fieldSelect({
      id: "claseAdmision", label: "Clase de admisión",
      options: [{ value: "", label: "Seleccione…" }, { value: "TURISTA", label: "Turista" }, { value: "RESIDENTE", label: "Residente" }, { value: "OTRO", label: "Otro" }],
      value: d.claseAdmision, required: true,
    }));
    sello.appendChild(selloGrid);
    body.appendChild(sello);

    var ruxGrid = layout.el("div", "wizard-grid");
    ruxGrid.appendChild(field.fieldText({ id: "numRUEX", label: "Número de Registro de Filiación (RUEX)", value: d.numRUEX, helpText: "Estado: vigente / vencido / con multa (consulta simulada)." }));
    ruxGrid.appendChild(field.fieldText({ id: "ultimoPermiso", label: "Último permiso migratorio (número/tipo)", value: d.ultimoPermiso }));
    ruxGrid.appendChild(field.fieldText({ id: "numeroCarne", label: "Número de carné migratorio", value: d.numeroCarne }));
    ruxGrid.appendChild(field.fieldText({ id: "carneENumero", label: "Carné de Residente Permanente 'E' (número)", value: d.carneENumero }));
    ruxGrid.appendChild(field.fieldText({ id: "pasaportesAnteriores", label: "Pasaportes anteriores (números)", value: d.pasaportesAnteriores, helpText: "Obligatorio en Movimiento Migratorio." }));
    ruxGrid.appendChild(field.fieldText({ id: "motivoCambioPasaporte", label: "Motivo del cambio de pasaporte", value: d.motivoCambioPasaporte }));
    body.appendChild(ruxGrid);

    var radioField = layout.el("fieldset", "form-field");
    radioField.appendChild(layout.el("legend", "form-field__label", "¿Ha salido del país en los últimos 5 años por más de 3 meses?"));
    var rg = layout.el("div", "radio-group");
    ["Sí", "No"].forEach(function (t, i) {
      var lbl = layout.el("label", "radio-option");
      var input = layout.el("input");
      input.type = "radio"; input.name = "salidaLarga"; input.value = t;
      if (d.salidaLarga === t || (!d.salidaLarga && i === 1)) input.checked = true;
      lbl.appendChild(input); lbl.appendChild(layout.el("span", null, t));
      rg.appendChild(lbl);
    });
    radioField.appendChild(rg);
    radioField.appendChild(layout.el("span", "form-field__help", "Relevante en naturalización (numerales 2 y 3 del Art. 10)."));
    body.appendChild(radioField);

    // Historial de entradas y salidas: el solicitante elige el origen.
    //   Con convenio: llega del SNM y se muestra en solo lectura.
    //   Sin convenio: declara cada movimiento con su comprobante.
    // La opción inicial es la del borrador o, si no hay, la de utils/convenios.js.
    var hist = layout.el("fieldset", "wizard-section movements");
    hist.appendChild(layout.el("legend", "wizard-section-title", "Historial de entradas y salidas"));

    var fuenteInicial = d.historialFuente ||
      (global.tm.convenios && global.tm.convenios.activo("snm") ? "SNM" : "DECLARADO");
    var origen = layout.el("div", "radio-group movements__source");
    origen.setAttribute("role", "radiogroup");
    origen.setAttribute("aria-label", "Origen del historial de entradas y salidas");
    [
      { value: "SNM", label: "Con convenio", ayuda: "Se consulta al Servicio Nacional de Migración" },
      { value: "DECLARADO", label: "Sin convenio", ayuda: "Registro mis movimientos con sus comprobantes" },
    ].forEach(function (o) {
      var lbl = layout.el("label", "radio-option movements__source-option");
      var input = layout.el("input");
      input.type = "radio"; input.name = "historialFuente"; input.value = o.value;
      input.checked = o.value === fuenteInicial;
      var texto = layout.el("span", "movements__source-text");
      texto.appendChild(layout.el("strong", null, o.label));
      texto.appendChild(layout.el("small", null, o.ayuda));
      lbl.appendChild(input); lbl.appendChild(texto);
      origen.appendChild(lbl);
    });
    hist.appendChild(origen);

    var movimientos = movimientosDeclarados(d.historialFuente === "DECLARADO" ? d.historial : null);
    hist.appendChild(movimientos.el);

    var panelSnm = layout.el("div", "movements__snm");
    panelSnm.setAttribute("aria-live", "polite");
    hist.appendChild(panelSnm);
    var snmCargado = false;

    function pintarSnm() {
      layout.clear(panelSnm);
      if (historial && historial.length > 0) {
        panelSnm.appendChild(global.tm.ui.table({
          headers: [{ label: "Fecha" }, { label: "Movimiento" }, { label: "Puesto" }],
          rows: historial.map(function (h) { return [{ text: h.fecha }, { text: h.movimiento }, { text: h.puesto }]; }),
        }));
        panelSnm.appendChild(layout.el("span", "form-field__help",
          "Obtenido del Servicio Nacional de Migración (SNM) por convenio; no necesita digitarlo ni adjuntar comprobantes."));
      } else {
        var emptyHist = layout.el("div", "app-empty");
        emptyHist.appendChild(layout.el("p", null, "El SNM no registra movimientos migratorios para este pasaporte."));
        panelSnm.appendChild(emptyHist);
      }
      snmCargado = true;
    }

    function fuenteElegida() { return (origen.querySelector("input:checked") || {}).value || "DECLARADO"; }

    function mostrarOrigen() {
      var conConvenio = fuenteElegida() === "SNM";
      movimientos.el.hidden = conConvenio;
      panelSnm.hidden = !conConvenio;
      if (conConvenio && !snmCargado) {
        // La consulta se muestra como llegaría de la institución.
        layout.clear(panelSnm);
        var cargando = layout.el("div", "app-loading");
        cargando.appendChild(layout.el("span", "spinner"));
        cargando.appendChild(layout.el("span", null, "Consultando el historial en el SNM…"));
        panelSnm.appendChild(cargando);
        global.setTimeout(pintarSnm, 600);
      }
    }
    origen.addEventListener("change", mostrarOrigen);
    mostrarOrigen();
    body.appendChild(hist);

    var err = wizard.errorBox();
    body.appendChild(err);

    body.appendChild(wizard.footer({
      onBack: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/paso-1"); },
      onNext: function () {
        wizard.clearError(err);
        if (!byId("numPasaporte")) return wizard.showError(err, "Ingrese el número de pasaporte.");
        if (!byId("paisEmisor")) return wizard.showError(err, "Seleccione el país emisor.");
        if (!byId("fechaExpedicion")) return wizard.showError(err, "Ingrese la fecha de expedición.");
        if (!byId("fechaVencimiento")) return wizard.showError(err, "Ingrese la fecha de vencimiento.");
        if (!byId("selloFecha")) return wizard.showError(err, "Ingrese la fecha del sello de ingreso.");
        if (!byId("selloPuesto")) return wizard.showError(err, "Seleccione el puesto fronterizo.");
        var conConvenio = fuenteElegida() === "SNM";
        var declarados = null;
        if (conConvenio) {
          if (!snmCargado) return wizard.showError(err, "Espere a que termine la consulta del historial en el SNM.");
          // Con convenio no se envían comprobantes de movimientos.
          global.tm.docs.clear("movimientos");
        } else {
          var problema = movimientos.validar();
          if (problema) return wizard.showError(err, problema);
          declarados = movimientos.leer();
        }

        draft.mergeDraft({
          pasaporte: {
            numPasaporte: byId("numPasaporte"),
            paisEmisor: byId("paisEmisor"),
            fechaExpedicion: byId("fechaExpedicion"),
            fechaVencimiento: byId("fechaVencimiento"),
            lugarExpedicion: byId("lugarExpedicion"),
            selloFecha: byId("selloFecha"),
            selloPuesto: byId("selloPuesto"),
            claseAdmision: byId("claseAdmision"),
            numRUEX: byId("numRUEX"),
            ultimoPermiso: byId("ultimoPermiso"),
            numeroCarne: byId("numeroCarne"),
            carneENumero: byId("carneENumero"),
            pasaportesAnteriores: byId("pasaportesAnteriores"),
            motivoCambioPasaporte: byId("motivoCambioPasaporte"),
            salidaLarga: (rg.querySelector("input:checked") || {}).value || "No",
            // SNM = obtenido por convenio; DECLARADO = lo aporta el solicitante.
            historialFuente: conConvenio ? "SNM" : "DECLARADO",
            historial: conConvenio ? (historial || []) : declarados,
          },
        });
        if (opts.onNavigate) opts.onNavigate(wizard.nextRoute(ROUTE));
      },
    }));
  }

  function renderP10(container, opts) {
    opts = opts || {};

    function show(state) {
      if (!state) state = "carga";
      if (fixtures) fixtures.setScenario(state);
      if (state === "carga") {
        renderLoading(container);
        setTimeout(function () { renderContent(container, opts, "exito"); }, 700);
        return;
      }
      if (state === "error") {
        renderError(container, {
          onRetry: function () { show("carga"); },
          mensaje: fixtures ? fixtures.message("P-10", "error", null) : null,
        });
        return;
      }
      if (state === "vacio") { renderContent(container, opts, "vacio"); return; }
      renderContent(container, opts, "exito");
    }

    opts.onDemoState = show;
    show("carga");
  }

  var button = global.tm.ui.button;
  var rg;
  global.tm.views = global.tm.views || {};
  global.tm.views.p10 = { renderP10: renderP10 };
})(window);

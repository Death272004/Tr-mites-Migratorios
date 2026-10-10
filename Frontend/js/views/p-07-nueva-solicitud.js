/**
 * P-07 — Nueva solicitud · selección de trámite con ficha de requisitos.
 * Campos: categoría, trámite específico (filtrado), motivo, presentante
 * (cuenta propia o apoderado → deriva a P-08) y país de origen del trámite.
 * Al elegir el trámite se carga su ficha de requisitos (sección 4 de la doc),
 * incluidos los requisitos comunes Art. 28 en permisos de residencia.
 * El trámite elegido determina el wizard, requisitos, tasas (P-15) y
 * verificaciones (I-07).
 * 4 estados: carga, éxito, error.
 * Script clásico: expone `tm.views.p07.renderP07`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;

  var DRAFT_KEY = "tm.solicitud.v1";

  // Requisitos comunes del Art. 28 (aplican a todos los permisos de residencia).
  var REQUISITOS_ART_28 = [
    "Poder y solicitud notariados",
    "3 fotos carné",
    "Pasaporte cotejado",
    "Antecedentes penales",
    "Certificado de salud",
    "Cheque B/.250.00 (Tesoro Nacional)",
    "Cheque B/.800.00 (SNM)",
    "Declaración jurada de antecedentes",
  ];

  // Catálogo demo (ficticio) alineado a la sección 4 de la doc.
  // [A] = obtenible por interoperabilidad en el futuro convenio.
  var CATALOGO = [
    {
      value: "REGISTRO_EXTRANJERIA",
      label: "Registro de Extranjería",
      residencia: false,
      tramites: [
        { nombre: "Confección de Registro de Filiación", req: ["Puesto y fecha del sello de ingreso", "Número de pasaporte", "Generales del pasaporte", "Copia del sello de ingreso", "2 fotos carné", "Tiquete B", "Tasa B/.5.00"] },
        { nombre: "Filiación con pre-registro en línea", req: ["Datos del pre-registro (folio)", "Generales del pasaporte", "Copia del sello de ingreso", "2 fotos carné", "Tiquete B", "Copia de la visa de entrada (si procede)", "Tasa B/.5.00"] },
        { nombre: "Cambio de residencia", req: ["Escritura pública notariada o contrato de arrendamiento notariado o carta de responsabilidad / certificación de juez de paz", "Recibo de servicios públicos", "Copia de carné o cédula", "Nuevo país/provincia/distrito/corregimiento/dirección", "Tipo de tenencia"] },
        { nombre: "Traspaso de sello (cambio de pasaporte)", req: ["Generales de ambos pasaportes", "Copia del sello de registro anterior", "Copia de carné/cédula", "Denuncia (si perdió el pasaporte)", "Tiquete X"] },
        { nombre: "Cambio de nacionalidad", req: ["Nota formal al Director General (original y copia, Ventanilla 42)", "Generales de pasaporte actual y anterior", "Sello del pasaporte anterior", "Nacionalidad anterior y nueva", "Motivo", "Plazo 48 h"] },
        { nombre: "Correcciones a filiación", req: ["Copia simple de generales del pasaporte y del sello, o de los documentos de Certificaciones", "Dato erróneo: valor actual y valor correcto", "Campo afectado"] },
      ],
    },
    {
      value: "VISAS_NO_RESIDENTE",
      label: "Visas no residente",
      residencia: false,
      tramites: [
        { nombre: "Visa de Turista (PM1)", req: ["Pasaporte con vigencia ≥ 3 meses", "Reservación o tiquete", "Identificación del país de domicilio", "3 fotos", "Prueba de solvencia ≥ B/.500.00", "Carta de invitación (cédula del invitante, pasaporte y servicios públicos)", "B/.50.00"] },
        { nombre: "Turista en tránsito (PM2)", req: ["2 fotos", "Pasaporte vigencia ≥ 3 meses", "Itinerario de continuación", "Identidad del país de domicilio", "Carta de invitación", "Pago consular", "Mínimo 15 días hábiles antes"] },
        { nombre: "Extensión de visa de turista (PM3)", req: ["Copia del pasaporte", "Tiquete pagado", "Reservación de hotel", "Justificación", "Solvencia ≥ B/.500.00", "Declaración notarial del invitante", "Antes del vencimiento"] },
        { nombre: "Visa múltiple no residente (PM5)", req: ["Pasaporte notariado", "Solvencia", "Carta de la empresa con Registro Público y carta bancaria", "Reserva aérea y de hotel", "Identidad del país de domicilio", "Idoneidad del abogado"] },
        { nombre: "Trabajador remoto / nómada digital (PM18)", req: ["Ingreso anual ≥ B/.36,000.00", "Póliza de seguro médico con cobertura en Panamá", "Certificación de existencia de la empresa", "Carta de la empresa (ingreso ≥ B/.3,000.00)", "Declaración de no trabajar para clientes locales", "B/.250.00", "Carné B/.50.00"] },
      ],
    },
    {
      value: "RESIDENTE_TEMPORAL",
      label: "Residente temporal",
      residencia: true,
      tramites: [
        { nombre: "Personal del Gobierno / entidades autónomas", req: ["Carta institucional", "Nombramiento", "Permiso de trabajo (A)"] },
        { nombre: "Empresas con contrato con el Gobierno", req: ["Contrato con el Estado", "Registro de la empresa (A)"] },
        { nombre: "Ejecutivos Zona Libre de Colón", req: ["Certificación de la empresa", "Permiso de trabajo (A)", "Paz y salvo (A)"] },
        { nombre: "Inversión agraria (PRT-AI)", req: ["Título de propiedad o arriendo", "Plan de actividad", "Permisos"] },
        { nombre: "Investigador – Ciudad del Saber", req: ["Carta de la fundación", "Proyecto e institución"] },
      ],
    },
    {
      value: "RESIDENTE_PERMANENTE",
      label: "Residente permanente",
      residencia: true,
      tramites: [
        { nombre: "Regularización general 235 (PRP-RMG)", req: ["Carné original de 6 años", "Antecedentes apostillados", "Cheques B/.250.00 + B/.800.00 + B/.900.00", "Prueba de domicilio", "Documento de arraigo (actas (A), permiso de trabajo (A), paz y salvo DGI)"] },
        { nombre: "Inversión forestal (PRP-FOR)", req: ["Certificación CPA", "Certificado de acciones", "Resolución del Ministerio de Ambiente", "Registro Público de la empresa y del inmueble", "Certificación bancaria (A)"] },
        { nombre: "Depósito a plazo fijo (PRP-SEP-DPF)", req: ["Monto B/.300,000.00", "Plazo ≥ 3 años", "Certificación bancaria del depósito libre de gravamen", "Copia autenticada del certificado"] },
        { nombre: "Rentista retirado (PRP-RR)", req: ["Renta mensual ≥ B/.850.00", "Duración ≥ 5 años", "Certificación bancaria (BNP o Caja de Ahorros) libre de gravamen", "Copia autenticada del plazo fijo"] },
        { nombre: "Casado con panameño(a) (PRP-2/3)", req: ["Certificado de matrimonio inscrito (A)", "Cédula del cónyuge (A)", "Entrevista si el matrimonio tiene menos de 2 años"] },
      ],
    },
    {
      value: "PROCESOS_ESPECIALES",
      label: "Procesos especiales",
      residencia: false,
      tramites: [
        { nombre: "Asistencia humanitaria (PM16)", req: ["Carta del Ministerio de Relaciones Exteriores (requisito único)"] },
        { nombre: "Protección de Seguridad Humanitaria (PPSH)", req: ["Poder y solicitud", "Antecedentes apostillados", "Certificado de salud", "Registro de mano de obra MITRADEL (A)", "Comprobante de domicilio", "B/.800.00 + B/.250.00 + B/.100.00 + B/.100.00"] },
        { nombre: "Refugiados (ONPAR)", req: ["Solicitud", "Resolución ONPAR con sello de notificado", "Registro B/.5.00", "Carné B/.10.00", "Hechos que motivan la protección"] },
        { nombre: "Regularización RMG 235 (permiso temporal)", req: ["Carné original", "Antecedentes apostillados", "Certificado de salud", "Domicilio", "B/.250.00 + B/.800.00 + B/.400.00"] },
      ],
    },
    {
      value: "CERTIFICACIONES",
      label: "Certificaciones",
      residencia: false,
      tramites: [
        { nombre: "Estatus migratorio", req: ["Carné", "Entidad de uso", "Leyenda 'para uso de Naturalización'", "B/.10.00 (o timbres B/.8.00)", "Carné E (A) TE"] },
        { nombre: "Movimiento migratorio (adulto/menor)", req: ["Entidad destino", "Pasaportes anteriores"] },
        { nombre: "Naturalización", req: ["Ver flujos N-1 a N-13 en P-26"] },
      ],
    },
    {
      value: "NATURALIZACION",
      label: "Naturalización",
      residencia: false,
      tramites: [
        { nombre: "Naturalización (flujos N-1 a N-13)", req: ["Ver P-26 para el flujo completo", "Solicitud y poder notariados", "Antecedentes penales", "Certificado de salud", "Constancia de residencia"] },
      ],
    },
  ];

  var MOTIVOS = ["Trabajo", "Inversión", "Familia", "Estudios", "Religión", "Humanitario", "Otro"];

  function categorias() {
    return CATALOGO.map(function (c) { return { value: c.value, label: c.label }; });
  }

  function getCategoria(value) {
    return CATALOGO.filter(function (x) { return x.value === value; })[0] || null;
  }

  function getTramite(categoriaValue, nombre) {
    var c = getCategoria(categoriaValue);
    if (!c) return null;
    return c.tramites.filter(function (t) { return t.nombre === nombre; })[0] || null;
  }

  function saveDraft(datos) {
    try { global.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(datos)); } catch (e) { /* ignore */ }
  }

  function renderFicha(container, categoriaValue, tramiteNombre) {
    layout.clear(container);
    if (!tramiteNombre) return;

    var categoria = getCategoria(categoriaValue);
    var tramite = getTramite(categoriaValue, tramiteNombre);
    if (!categoria || !tramite) return;

    var card = layout.el("div", "card ficha");
    card.appendChild(layout.el("h3", "ficha__title", "Ficha de requisitos · " + tramite.nombre));

    var list = layout.el("ul", "ficha__list");
    for (var i = 0; i < tramite.req.length; i++) {
      var item = tramite.req[i];
      var esAuto = /\(A\)/.test(item);
      var li = layout.el("li", "ficha__item" + (esAuto ? " ficha__item--auto" : ""));
      li.appendChild(layout.el("span", "ficha__marker", esAuto ? "A" : ""));
      li.appendChild(layout.el("span", null, item.replace(/\s*\(A\)/, "")));
      if (esAuto) li.appendChild(layout.el("span", "ficha__tag", "verificado automáticamente (futuro)"));
      list.appendChild(li);
    }
    card.appendChild(list);

    if (categoria.residencia) {
      card.appendChild(layout.el("h4", "ficha__subtitle", "Requisitos comunes del Art. 28"));
      var list2 = layout.el("ul", "ficha__list");
      for (var j = 0; j < REQUISITOS_ART_28.length; j++) {
        var li2 = layout.el("li", "ficha__item");
        li2.appendChild(layout.el("span", "ficha__marker", ""));
        li2.appendChild(layout.el("span", null, REQUISITOS_ART_28[j]));
        list2.appendChild(li2);
      }
      card.appendChild(list2);
    }

    card.appendChild(layout.el(
      "p",
      "ficha__note",
      "Los requisitos marcados (A) podrían obtenerse por interoperabilidad y quedar sellados como verificados automáticamente; en el MVP el despacho lo registra en I-07. La carga de documentos se realiza en el paso 6 (P-14)."
    ));

    container.appendChild(card);
  }

  function renderForm(container, opts) {
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Nueva solicitud", "Paso 1 de 11 · Seleccione el trámite a realizar"));

    if (opts.onDemoState) inner.appendChild(demoSelector(opts.onDemoState));

    var form = layout.el("form", "card");
    form.noValidate = true;

    var selectCat = field.fieldSelect({
      id: "categoria",
      label: "Categoría del trámite",
      options: [{ value: "", label: "Seleccione una categoría…" }].concat(categorias()),
      required: true,
    });
    form.appendChild(selectCat);

    var tramiteWrap = layout.el("div");
    form.appendChild(tramiteWrap);

    var fichaWrap = layout.el("div");
    form.appendChild(fichaWrap);

    var selectMotivo = field.fieldSelect({
      id: "motivo",
      label: "Motivo de la solicitud",
      options: [{ value: "", label: "Seleccione un motivo…" }].concat(MOTIVOS.map(function (m) { return { value: m, label: m }; })),
      required: true,
    });
    form.appendChild(selectMotivo);

    var selectPais = field.fieldSelect({
      id: "paisOrigen",
      label: "País de origen del trámite",
      options: [
        { value: "", label: "Seleccione una opción…" },
        { value: "PA", label: "En Panamá" },
        { value: "EX", label: "En consulado en el exterior" },
      ],
      helpText: "Determina la oficina y el flujo de recepción del expediente.",
      required: true,
    });
    form.appendChild(selectPais);

    var radioField = layout.el("fieldset", "form-field");
    radioField.appendChild(layout.el("legend", "form-field__label", "¿Presenta por cuenta propia o mediante apoderado?"));
    var radioGroup = layout.el("div", "radio-group");
    var opciones = [
      { value: "CUENTA_PROPIA", label: "Por cuenta propia" },
      { value: "APODERADO", label: "Mediante apoderado (bufete)" },
    ];
    var radios = [];
    for (var i = 0; i < opciones.length; i++) {
      var o = opciones[i];
      var lbl = layout.el("label", "radio-option");
      var input = layout.el("input");
      input.type = "radio";
      input.name = "presentante";
      input.value = o.value;
      if (i === 0) input.checked = true;
      lbl.appendChild(input);
      lbl.appendChild(layout.el("span", null, o.label));
      radioGroup.appendChild(lbl);
      radios.push(input);
    }
    radioField.appendChild(radioGroup);
    radioField.appendChild(layout.el("span", "form-field__help", "Ambas opciones continúan en el paso de titularidad y representación."));
    form.appendChild(radioField);

    var errorBox = layout.el("div", "auth-error", "");
    errorBox.setAttribute("aria-live", "polite");
    form.appendChild(errorBox);

    var actions = layout.el("div", "auth-actions");
    var btnBack = button({ text: "Volver a mis trámites", onClick: function () { if (opts.onBack) opts.onBack(); } });
    var btnNext = button({ variant: "primary", text: "Continuar", type: "submit" });
    actions.appendChild(btnBack);
    actions.appendChild(btnNext);
    form.appendChild(actions);

    var catSelect = selectCat.querySelector("select");
    catSelect.addEventListener("change", function () { renderTramiteSelect(catSelect.value); });
    renderTramiteSelect("");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      clearError();
      var categoria = catSelect.value;
      var tramiteSelect = tramiteWrap.querySelector("select");
      var tramite = tramiteSelect ? tramiteSelect.value : "";
      var motivo = selectMotivo.querySelector("select").value;
      var paisOrigen = selectPais.querySelector("select").value;
      var presentante = radios.filter(function (r) { return r.checked; })[0];

      if (!categoria) return setError("Seleccione la categoría del trámite.");
      if (!tramite) return setError("Seleccione el trámite específico.");
      if (!motivo) return setError("Seleccione el motivo de la solicitud.");
      if (!paisOrigen) return setError("Seleccione el país de origen del trámite.");
      if (!presentante) return setError("Indique si presenta por cuenta propia o mediante apoderado.");

      var datos = {
        categoria: categoria,
        tramite: tramite,
        motivo: motivo,
        paisOrigen: paisOrigen,
        presentante: presentante.value,
      };
      saveDraft(datos);

      btnNext.disabled = true;
      btnNext.textContent = "Guardando…";
      setTimeout(function () {
        btnNext.disabled = false;
        btnNext.textContent = "Continuar";
        if (opts.onContinue) opts.onContinue(datos);
      }, 300);
    });

    function renderTramiteSelect(categoriaValue) {
      layout.clear(tramiteWrap);
      layout.clear(fichaWrap);
      var cat = getCategoria(categoriaValue);
      var options = [{ value: "", label: categoriaValue ? "Seleccione un trámite…" : "Elija primero una categoría" }];
      if (cat) options = options.concat(cat.tramites.map(function (t) { return { value: t.nombre, label: t.nombre }; }));
      var sel = field.fieldSelect({
        id: "tramite",
        label: "Trámite específico",
        options: options,
        required: true,
        disabled: !categoriaValue,
        helpText: "Al elegirlo se carga su ficha de requisitos.",
      });
      tramiteWrap.appendChild(sel);
      var select = sel.querySelector("select");
      select.addEventListener("change", function () { renderFicha(fichaWrap, categoriaValue, select.value); });
    }

    function setError(msg) { errorBox.textContent = msg; errorBox.classList.add("is-visible"); }
    function clearError() { errorBox.textContent = ""; errorBox.classList.remove("is-visible"); }

    inner.appendChild(form);
    container.appendChild(inner);
  }

  function demoSelector(onDemoState) {
    var wrap = layout.el("label", "toolbar__demo");
    wrap.appendChild(layout.el("span", null, "Vista (demo)"));
    var select = layout.el("select");
    var opciones = [
      { v: "carga", l: "Carga" },
      { v: "exito", l: "Éxito" },
      { v: "error", l: "Error" },
    ];
    for (var i = 0; i < opciones.length; i++) {
      var o = layout.el("option", null, opciones[i].l);
      o.value = opciones[i].v;
      select.appendChild(o);
    }
    select.addEventListener("change", function () { onDemoState(select.value); });
    wrap.appendChild(select);
    return wrap;
  }

  function renderLoading(container) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Nueva solicitud", "Cargando catálogo de trámites…"));
    var loading = layout.el("div", "app-loading");
    loading.appendChild(layout.el("span", "spinner"));
    loading.appendChild(layout.el("span", null, "Cargando…"));
    inner.appendChild(loading);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Nueva solicitud", "No se pudo cargar el catálogo"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "Catálogo no disponible"));
    alert.appendChild(layout.el("span", "app-alert__text", "No pudimos cargar las categorías y trámites. Intente nuevamente."));
    inner.appendChild(alert);
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    inner.appendChild(retry);
    container.appendChild(inner);
  }

  function renderP07(container, opts) {
    opts = opts || {};

    function show(state) {
      if (state === "carga") {
        renderLoading(container);
        setTimeout(function () { renderForm(container, opts); }, 700);
        return;
      }
      if (state === "error") { renderError(container, { onRetry: function () { show("carga"); } }); return; }
      renderForm(container, opts);
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p07 = { renderP07: renderP07, CATALOGO: CATALOGO, REQUISITOS_ART_28: REQUISITOS_ART_28 };
})(window);
/**
 * P-19 — Estado del trámite (línea de tiempo).
 * No pide datos: muestra expediente, trámite, etapa actual, fecha de cada
 * etapa, días transcurridos, requisitos faltantes y acción pendiente.
 * Estados visibles para el ciudadano (Pantallas… P-19) y alertas de vigencias
 * a 30/90 días. 4 estados de vista: carga, éxito, vacío, error.
 * Nivel de detalle por rol (TASK-04.1): el portal muestra la versión del
 * titular; el detalle ampliado vive en el módulo interno (I-06).
 * Script clásico: expone `tm.views.p19.renderP19`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var button = global.tm.ui.button;
  var timeline = global.tm.ui.timeline;
  var api = global.tm.api;

  // Etapas visibles para el titular (cadena exacta de la fuente).
  var ESTADOS_VISIBLES = [
    "EN PREPARACIÓN",
    "RECIBIDO",
    "CON OBSERVACIONES (ciudadano)",
    "EN ANÁLISIS",
    "CON OBSERVACIONES (analista)",
    "ADMITIDO",
    "EN RESOLUCIÓN",
    "RESUELTO",
    "NOTIFICADO",
    "ENTREGADO",
  ];

  // Datos demo (ficticios) usados únicamente cuando la aplicación está offline.
  var DEMO_ESTADO = {
    expediente: "EXP-2026-000184",
    tramite: "Residente temporal",
    fechaEnvio: "2026-09-12",
    etapaActual: "EN ANÁLISIS",
    etapaActualTono: "info",
    etapas: [
      { titulo: "EN PREPARACIÓN", fecha: "2026-09-10", estado: "done" },
      { titulo: "RECIBIDO", fecha: "2026-09-12", estado: "done" },
      { titulo: "CON OBSERVACIONES (ciudadano)", fecha: "2026-09-15", estado: "done", detalle: "Faltaba copia del sello de ingreso (subsanada).", autor: "Recepcionista" },
      { titulo: "EN ANÁLISIS", fecha: "2026-09-20", estado: "active", detalle: "Su expediente está siendo analizado." },
      { titulo: "CON OBSERVACIONES (analista)", estado: "pending" },
      { titulo: "ADMITIDO", estado: "pending" },
      { titulo: "EN RESOLUCIÓN", estado: "pending" },
      { titulo: "RESUELTO", estado: "pending" },
      { titulo: "NOTIFICADO", estado: "pending" },
      { titulo: "ENTREGADO", estado: "pending" },
    ],
    requisitosFaltantes: [
      "Copia del último sello de ingreso legible",
      "Constancia de antecedentes penales vigente (máx. 90 días)",
    ],
    accionPendiente: { texto: "Atender las observaciones del analista", tipo: "atender" },
    vigencias: [
      { label: "Constancia de antecedentes penales", fecha: "2026-09-05", diasParaVencer: 25 },
      { label: "Permiso de trabajo (prórroga)", fecha: "2026-11-30", diasParaVencer: 50 },
    ],
    verificaciones: [
      {
        id: "demo-v1", fuente: "TE", tipoVerificacion: "IDENTIDAD", modo: "MANUAL_ASISTIDO",
        estado: "RESPONDIDA", finalidad: "IDENTIDAD_DEL_TITULAR",
        fechaSolicitud: "2026-09-21T15:00:00Z", fechaResultado: "2026-09-22T16:20:00Z",
        resultadoMinimo: "COINCIDE", referenciaOrigen: "TE-2026-1842",
        responsableId: "demo-funcionario", intentos: 1
      },
      {
        id: "demo-v2", fuente: "CSS", tipoVerificacion: "AFILIACION", modo: "SIMULADO",
        estado: "ERROR_TECNICO", finalidad: "AFILIACION_DEL_TITULAR",
        fechaSolicitud: "2026-09-23T14:10:00Z", fechaResultado: null,
        resultadoMinimo: null, referenciaOrigen: null, responsableId: null,
        intentos: 2, ultimoFallo: "TIMEOUT"
      },
      {
        id: "demo-v3", fuente: "REGISTRO_PUBLICO", tipoVerificacion: "INFORMACION_REGISTRAL",
        modo: "MANUAL_ASISTIDO", estado: "SIN_RESULTADO", finalidad: "INFORMACION_REGISTRAL",
        fechaSolicitud: "2026-09-24T13:00:00Z", fechaResultado: "2026-09-24T13:15:00Z",
        resultadoMinimo: "SIN_RESULTADO", referenciaOrigen: "RP-2026-778",
        responsableId: "demo-funcionario", intentos: 1
      },
      {
        id: "demo-v4", fuente: "DOCUMENTO_EXTERIOR", tipoVerificacion: "LEGALIZACION",
        modo: "SIMULADO", estado: "REINTENTO_PROGRAMADO", finalidad: "VIGENCIA_Y_LEGALIZACION",
        fechaSolicitud: "2026-09-25T11:00:00Z", fechaResultado: null,
        resultadoMinimo: null, referenciaOrigen: null, responsableId: null,
        intentos: 1, proximoIntento: "2026-09-25T12:00:00Z", ultimoFallo: "RATE_LIMIT"
      }
    ],
  };

  var VERIF_ESTADOS = {
    PENDIENTE: "Pendiente",
    ENVIADA: "Enviada",
    EN_ATENCION: "En atención",
    RESPONDIDA: "Respondida",
    SIN_RESULTADO: "Sin resultado",
    ERROR_TECNICO: "Error técnico",
    REINTENTO_PROGRAMADO: "Reintento programado"
  };

  var VERIF_RESULTADOS = {
    COINCIDE: "Coincide",
    NO_COINCIDE: "No coincide",
    VIGENTE: "Vigente",
    NO_VIGENTE: "No vigente",
    CON_REGISTROS: "Con registros",
    SIN_RESULTADO: "Sin resultado"
  };

  var VERIF_FALLOS = {
    TIMEOUT: "tiempo de espera agotado",
    ERROR_TECNICO: "error técnico de la fuente",
    RATE_LIMIT: "límite de consultas alcanzado",
    DATOS_INCOMPLETOS: "datos incompletos",
    LLENO: "fuente saturada"
  };

  function fmtFecha(iso) {
    if (!iso) return "—";
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function daysSince(iso) {
    if (!iso) return null;
    var desde = new Date(iso + "T00:00:00");
    if (isNaN(desde.getTime())) return null;
    var semanas = Math.floor((Date.now() - desde.getTime()) / 86400000);
    return semanas < 0 ? 0 : semanas;
  }

  function badge(text, tone) {
    return layout.el("span", "badge badge--" + (tone || "info"), text);
  }

  function summaryItem(label, valueNode) {
    var item = layout.el("div", "seguimiento-summary__item");
    item.appendChild(layout.el("span", "seguimiento-summary__label", label));
    var value = layout.el("span", "seguimiento-summary__value");
    if (typeof valueNode === "string") value.textContent = valueNode;
    else if (valueNode) value.appendChild(valueNode);
    item.appendChild(value);
    return item;
  }

  function vigenciaAlert(vigencias) {
    var por30 = [];
    var por90 = [];
    for (var i = 0; i < vigencias.length; i++) {
      var d = vigencias[i].diasParaVencer;
      if (d == null || d < 0) continue;
      if (d <= 30) por30.push(vigencias[i]);
      else if (d <= 90) por90.push(vigencias[i]);
    }
    if (por30.length === 0 && por90.length === 0) return null;

    var critico = por30.length > 0;
    var alert = layout.el("div", "app-alert " + (critico ? "app-alert--warning" : "app-alert--info"));
    alert.appendChild(layout.el("span", "app-alert__title", critico
      ? "Vigencias por vencer en menos de 30 días"
      : "Vigencias por vencer en menos de 90 días"));
    var lista = (critico ? por30 : por90).map(function (v) {
      return v.label + " (" + v.diasParaVencer + " días)";
    }).join(" · ");
    alert.appendChild(layout.el("span", "app-alert__text", "Revise y renueve a tiempo: " + lista + "."));
    return alert;
  }

  function timelineItems(estado) {
    return estado.etapas.map(function (e) {
      var item = {
        titulo: e.titulo,
        fecha: e.fecha ? fmtFecha(e.fecha) : "Etapa pendiente",
        detalle: e.detalle,
        autor: e.autor,
        done: e.estado === "done",
        active: e.estado === "active",
      };
      return item;
    });
  }

  function etiquetaEstado(estado) {
    var labels = {
      EN_PREPARACION: "EN PREPARACIÓN",
      RECIBIDO: "RECIBIDO",
      CON_OBSERVACIONES: "CON OBSERVACIONES (ciudadano)",
      EN_ANALISIS: "EN ANÁLISIS",
      ADMITIDO: "ADMITIDO",
      EN_RESOLUCION: "EN RESOLUCIÓN",
      RESUELTO: "RESUELTO",
      NOTIFICADO: "NOTIFICADO",
      ENTREGADO: "ENTREGADO",
      ARCHIVADO: "ARCHIVADO",
    };
    return labels[estado] || estado || "SIN ESTADO";
  }

  function estadoDesdeApi(dto, historial) {
    var etapas = [];
    var vistos = {};
    function agregar(nombre, fecha, detalle, estado) {
      if (!nombre || vistos[nombre]) return;
      vistos[nombre] = true;
      etapas.push({ titulo: nombre, fecha: fecha ? fecha.slice(0, 10) : null, detalle: detalle, estado: estado || "done" });
    }
    agregar("EN PREPARACIÓN", dto.fechaCreacion, null, "done");
    for (var i = 0; i < (historial || []).length; i++) {
      var h = historial[i];
      agregar(etiquetaEstado(h.estadoNuevo), h.fecha, h.motivo, "done");
    }
    var actual = etiquetaEstado(dto.estado);
    if (!vistos[actual]) agregar(actual, dto.fechaActualizacion || dto.fechaCreacion, null, "active");
    else if (etapas.length) etapas[etapas.length - 1].estado = "active";
    return {
      expediente: dto.numero || dto.id,
      tramite: dto.tipoTramite || "Trámite migratorio",
      fechaEnvio: (dto.fechaCreacion || "").slice(0, 10),
      etapaActual: actual,
      etapaActualTono: dto.estado === "CON_OBSERVACIONES" ? "warning" : "info",
      etapas: etapas,
      requisitosFaltantes: dto.estado === "CON_OBSERVACIONES" ? ["Atienda las observaciones notificadas en P-20"] : [],
      accionPendiente: dto.estado === "CON_OBSERVACIONES" ? { texto: "Atender las observaciones del expediente", tipo: "atender" } : null,
      vigencias: [],
    };
  }

  function isInternalUser() {
    try {
      var s = global.tm.session && typeof global.tm.session.getSession === "function" ? global.tm.session.getSession() : null;
      var rol = s && s.datos ? s.datos.rol : null;
      if (!rol) return false;
      return rol !== "SOLICITANTE";
    } catch (e) { return false; }
  }

  function esRemoto() {
    return !!(api && api.isOnline && api.isOnline() &&
      !(api.isDemoSession && api.isDemoSession()));
  }

  function fmtFechaVerif(iso) {
    if (!iso) return "—";
    var s = String(iso);
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      return s.slice(8, 10) + "/" + s.slice(5, 7) + "/" + s.slice(0, 4);
    }
    var d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("es-PA", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function verifEtiqueta(v) {
    if (v.estado === "RESPONDIDA" && v.resultadoMinimo) {
      return VERIF_RESULTADOS[v.resultadoMinimo] || v.resultadoMinimo;
    }
    return VERIF_ESTADOS[v.estado] || v.estado || "Pendiente";
  }

  function verifTono(v) {
    if (v.estado === "ERROR_TECNICO" || v.estado === "SIN_RESULTADO" || v.estado === "REINTENTO_PROGRAMADO") return "warning";
    if (v.resultadoMinimo === "NO_COINCIDE" || v.resultadoMinimo === "NO_VIGENTE") return "danger";
    if (v.resultadoMinimo === "COINCIDE" || v.resultadoMinimo === "VIGENTE" || v.resultadoMinimo === "CON_REGISTROS") return "success";
    return "info";
  }

  function verifDetalle(v) {
    if (v.estado === "ERROR_TECNICO") {
      var fallo = v.ultimoFallo ? (VERIF_FALLOS[v.ultimoFallo] || v.ultimoFallo) : "respuesta inválida";
      return "No es resultado negativo. Último fallo: " + fallo + ".";
    }
    if (v.estado === "REINTENTO_PROGRAMADO") {
      return "Reintento programado" + (v.proximoIntento ? " para " + fmtFechaVerif(v.proximoIntento) : "") + ".";
    }
    if (v.estado === "SIN_RESULTADO") return "La fuente no devolvió el dato solicitado.";
    if (v.estado === "RESPONDIDA") return "Resultado confirmado por la fuente.";
    if (v.estado === "ENVIADA") return "Consulta enviada, pendiente de respuesta.";
    if (v.estado === "EN_ATENCION") return "En cotejo manual por el despacho.";
    return "Pendiente de cotejo.";
  }

  function renderVerificacionesBloque(container, lista, error) {
    if (!lista) lista = [];
    var interno = isInternalUser();
    var block = layout.el("div", "seguimiento-block");
    block.appendChild(layout.el("h2", "seguimiento-block__title", "Verificaciones"));

    if (error) {
      var alerta = layout.el("div", "app-alert app-alert--warning");
      alerta.setAttribute("role", "alert");
      alerta.appendChild(layout.el("span", "app-alert__title", "No se pudieron cargar las verificaciones"));
      alerta.appendChild(layout.el("span", "app-alert__text",
        "El estado del trámite sigue disponible. Actualice la pantalla para intentar de nuevo."));
      block.appendChild(alerta);
    }

    if (lista.length === 0) {
      block.appendChild(layout.el("p", "seguimiento-note",
        error ? "No hay datos de verificaciones para mostrar." : "No hay verificaciones registradas."));
      container.appendChild(block);
      return;
    }

    if (!interno) {
      var rows = lista.map(function (v) {
        var completada = v.estado === "RESPONDIDA" || v.estado === "SIN_RESULTADO";
        return [
          { text: v.fuente || "—" },
          { text: completada ? "Completada" : "Pendiente" },
          { text: fmtFechaVerif(v.fechaResultado || v.fechaSolicitud) }
        ];
      });
      block.appendChild(layout.el("p", "seguimiento-note",
        "Estado agregado. Si una verificación está pendiente, el despacho la está gestionando; " +
        "los detalles internos no se muestran en el portal."));
      block.appendChild(global.tm.ui.table({
        headers: [{ label: "Fuente" }, { label: "Estado" }, { label: "Fecha" }],
        rows: rows
      }));
      container.appendChild(block);
      return;
    }

    var rowsInt = lista.map(function (v) {
      var estado = v.estado || "PENDIENTE";
      var resultado = v.estado === "ERROR_TECNICO"
        ? "No aplica (error técnico)"
        : (v.resultadoMinimo ? (VERIF_RESULTADOS[v.resultadoMinimo] || v.resultadoMinimo) : "—");
      return [
        { text: v.fuente || "—" },
        { text: v.tipoVerificacion || "—" },
        { node: badge(VERIF_ESTADOS[estado] || estado, verifTono(v)) },
        { text: resultado },
        { text: fmtFechaVerif(v.fechaResultado || v.fechaSolicitud) },
        { text: v.modo === "MANUAL_ASISTIDO" ? "Manual asistido" : (v.modo || "—") },
        { text: v.responsableId || "—" },
        { text: verifDetalle(v) }
      ];
    });

    block.appendChild(global.tm.ui.table({
      headers: [
        { label: "Fuente" },
        { label: "Tipo" },
        { label: "Estado" },
        { label: "Resultado" },
        { label: "Fecha" },
        { label: "Modo" },
        { label: "Responsable" },
        { label: "Detalle" }
      ],
      rows: rowsInt
    }));
    container.appendChild(block);
  }

  function renderContent(container, opts, estado, verifsLista, verifError) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");

    inner.appendChild(layout.pageHeader(
      "Estado del trámite",
      "Siga la etapa en la que se encuentra su expediente"
    ));

    var toolbar = layout.el("div", "toolbar");
    toolbar.appendChild(layout.el("span", null, ""));
    if (!esRemoto()) toolbar.appendChild(demoSelector(opts));
    inner.appendChild(toolbar);

    var alert = vigenciaAlert(estado.vigencias || []);
    if (alert) inner.appendChild(alert);

    var dias = daysSince(estado.fechaEnvio);
    var summary = layout.el("div", "seguimiento-summary");
    summary.appendChild(summaryItem("Expediente", estado.expediente));
    summary.appendChild(summaryItem("Trámite", estado.tramite));
    summary.appendChild(summaryItem("Etapa actual", badge(estado.etapaActual, estado.etapaActualTono)));
    summary.appendChild(summaryItem("Fecha de envío", fmtFecha(estado.fechaEnvio)));
    summary.appendChild(summaryItem("Días transcurridos", dias == null ? "—" : dias + " días"));
    inner.appendChild(summary);

    if (estado.requisitosFaltantes && estado.requisitosFaltantes.length > 0) {
      var reqBlock = layout.el("div", "seguimiento-block");
      reqBlock.appendChild(layout.el("h2", "seguimiento-block__title", "Requisitos faltantes"));
      var list = layout.el("ul", "ficha__list");
      for (var i = 0; i < estado.requisitosFaltantes.length; i++) {
        var li = layout.el("li", "ficha__item");
        li.appendChild(layout.el("span", "ficha__marker ficha__marker--pending", "!"));
        li.appendChild(layout.el("span", null, estado.requisitosFaltantes[i]));
        list.appendChild(li);
      }
      reqBlock.appendChild(list);
      inner.appendChild(reqBlock);
    }

    if (estado.accionPendiente) {
      var action = layout.el("div", "seguimiento-action");
      action.appendChild(layout.el("span", "seguimiento-action__text", estado.accionPendiente.texto));
      action.appendChild(button({
        variant: "primary",
        text: "Resolver ahora",
        onClick: function () {
          if (estado.accionPendiente.tipo === "documentos") { if (opts.onVerDocumentos) opts.onVerDocumentos(estado); }
          else if (opts.onAtender) opts.onAtender(estado);
        },
      }));
      inner.appendChild(action);
    }

    var tlBlock = layout.el("div", "seguimiento-block");
    tlBlock.appendChild(layout.el("h2", "seguimiento-block__title", "Línea de tiempo"));
    tlBlock.appendChild(timeline({ items: timelineItems(estado) }));
    inner.appendChild(tlBlock);

    renderVerificacionesBloque(inner, verifsLista || [], verifError);

    var nota = layout.el("p", "seguimiento-note", "Estados visibles para el titular: " + ESTADOS_VISIBLES.join(" → ") + ".");
    inner.appendChild(nota);

    container.appendChild(inner);
  }

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
    inner.appendChild(layout.pageHeader("Estado del trámite", "Cargando expediente…"));
    var loading = layout.el("div", "app-loading");
    loading.appendChild(layout.el("span", "spinner"));
    loading.appendChild(layout.el("span", null, "Consultando el estado de su trámite…"));
    inner.appendChild(loading);
    container.appendChild(inner);
  }

  function renderEmpty(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Estado del trámite", "Expediente no disponible"));
    var empty = layout.el("div", "app-empty");
    empty.appendChild(layout.el("p", null, "No encontramos este expediente a su nombre."));
    empty.appendChild(layout.el("p", null, "Por seguridad solo puede consultar sus propios trámites."));
    empty.appendChild(button({
      variant: "primary",
      text: "Ir a mis trámites",
      onClick: function () { if (opts.onGoMisTramites) opts.onGoMisTramites(); },
    }));
    inner.appendChild(empty);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Estado del trámite", "No se pudo cargar el expediente"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
    alert.appendChild(layout.el("span", "app-alert__text", "No pudimos consultar su trámite. Intente nuevamente."));
    inner.appendChild(alert);
    var actions = layout.el("div", "toolbar__actions");
    actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    inner.appendChild(actions);
    container.appendChild(inner);
  }

  function renderP19(container, opts) {
    opts = opts || {};

    if (esRemoto()) {
      var seleccionado = global.tm.expediente && global.tm.expediente.getSelected ? global.tm.expediente.getSelected() : null;
      if (!seleccionado || !seleccionado.id) { renderEmpty(container, opts); return; }
      renderLoading(container);
      api.request("GET", "/expedientes/" + encodeURIComponent(seleccionado.id), { pantalla: "P-19" }, function (err, dto) {
        if (err) { renderError(container, { mensaje: err.mensajeUsuario, onRetry: function () { renderP19(container, opts); } }); return; }
        api.request("GET", "/expedientes/" + encodeURIComponent(seleccionado.id) + "/historial", { pantalla: "P-19" }, function (historyErr, historial) {
          if (historyErr) { renderError(container, { mensaje: historyErr.mensajeUsuario, onRetry: function () { renderP19(container, opts); } }); return; }
          var estado = estadoDesdeApi(dto, historial);
          api.request("GET", "/expedientes/" + encodeURIComponent(seleccionado.id) + "/verificaciones", { pantalla: "P-19" }, function (verr, vlist) {
            renderContent(container, opts, estado, Array.isArray(vlist) ? vlist : [], verr || null);
          });
        });
      });
      return;
    }

    function show(state) {
      if (state === "carga") {
        renderLoading(container);
        setTimeout(function () {
          renderContent(container, opts, DEMO_ESTADO, DEMO_ESTADO.verificaciones);
        }, 700);
        return;
      }
      if (state === "error") { renderError(container, { onRetry: function () { show("carga"); } }); return; }
      if (state === "vacio") { renderEmpty(container, opts); return; }
      renderContent(container, opts, DEMO_ESTADO, DEMO_ESTADO.verificaciones);
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p19 = { renderP19: renderP19, DEMO_ESTADO: DEMO_ESTADO, ESTADOS_VISIBLES: ESTADOS_VISIBLES };
})(window);

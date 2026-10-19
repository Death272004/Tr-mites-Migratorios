/**
 * P-06 — Mis trámites (bandeja del cliente).
 * No pide datos: tarjetas con número de expediente, tipo de trámite, fecha de
 * envío, estado, vencimiento de vigencias y pendiente del ciudadano.
 * Botones: Nueva solicitud (P-07), Continuar borrador, Ver observación (P-20),
 * Descargar (P-22). Alerta de vigencias a 30/90 días.
 * 4 estados: carga, éxito, vacío, error.
 * Script clásico: expone `tm.views.p06.renderP06`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var button = global.tm.ui.button;
  var fixtures = global.tm.fixtures;
  var api = global.tm.api;

  // Datos ficticios de respaldo. La fuente por defecto es el fixture P-06 (§2.5);
  // sin backend (file://) el envelope lo registran los `.js` de js/fixtures/.
  var DEMO_TRAMITES = [
    {
      expediente: "EXP-2026-000184",
      tipo: "Residente temporal",
      fechaEnvio: "2026-09-12",
      estado: "En revisión",
      estadoTono: "info",
      vencimiento: "2026-10-20",
      diasParaVencer: 10,
      pendiente: null,
      borrador: false,
      puedeDescargar: false,
    },
    {
      expediente: "EXP-2026-000159",
      tipo: "Visas no residente",
      fechaEnvio: "2026-08-30",
      estado: "Pendiente del ciudadano",
      estadoTono: "warning",
      vencimiento: null,
      diasParaVencer: null,
      pendiente: "Subsanar observación: documento de domicilio ilegible",
      borrador: false,
      puedeDescargar: false,
    },
    {
      expediente: "EXP-2026-000210",
      tipo: "Certificaciones",
      fechaEnvio: "2026-09-28",
      estado: "Borrador",
      estadoTono: "muted",
      vencimiento: null,
      diasParaVencer: null,
      pendiente: null,
      borrador: true,
      puedeDescargar: false,
    },
    {
      expediente: "EXP-2026-000047",
      tipo: "Registro de Extranjería",
      fechaEnvio: "2026-05-15",
      estado: "Aprobado",
      estadoTono: "success",
      vencimiento: "2027-05-15",
      diasParaVencer: 218,
      pendiente: null,
      borrador: false,
      puedeDescargar: true,
    },
  ];

  function toneForState(state, tono) {
    return tono || "muted";
  }

  function estadoTexto(estado) {
    var labels = {
      EN_PREPARACION: "En preparación",
      RECIBIDO: "Recibido",
      CON_OBSERVACIONES: "Con observaciones",
      EN_ANALISIS: "En análisis",
      ADMITIDO: "Admitido",
      EN_RESOLUCION: "En resolución",
      RESUELTO: "Resuelto",
      NOTIFICADO: "Notificado",
      ENTREGADO: "Entregado",
      ARCHIVADO: "Archivado",
    };
    return labels[estado] || estado || "Sin estado";
  }

  function apiTramite(dto) {
    var iso = dto.fechaCreacion || dto.fechaActualizacion || "";
    return {
      id: dto.id,
      expediente: dto.numero || dto.id,
      tipo: dto.tipoTramite || "Trámite migratorio",
      fechaEnvio: iso ? iso.slice(0, 10) : "",
      estado: estadoTexto(dto.estado),
      estadoTono: dto.estado === "RESUELTO" || dto.estado === "ENTREGADO" ? "success" :
        dto.estado === "CON_OBSERVACIONES" ? "warning" : "info",
      vencimiento: null,
      diasParaVencer: null,
      pendiente: dto.estado === "CON_OBSERVACIONES" ? "Tiene una observación pendiente de atención" : null,
      borrador: false,
      puedeDescargar: false,
    };
  }

  function tramitesDe(escenario) {
    if (!fixtures) return DEMO_TRAMITES;
    var env = fixtures.envelope("P-06", escenario || "exito");
    if (!env || !env.data) return escenario === "vacio" ? [] : DEMO_TRAMITES;
    return env.data.tramites || [];
  }

  function errorText(escenario, fallback) {
    if (!fixtures) return fallback;
    return fixtures.message("P-06", escenario, fallback);
  }

  function badge(text, tone) {
    return layout.el("span", "badge badge--" + tone, text);
  }

  function fmtFecha(iso) {
    if (!iso) return "—";
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function vigenciaCell(t) {
    if (!t.vencimiento) return "—";
    var label = fmtFecha(t.vencimiento);
    if (t.diasParaVencer != null && t.diasParaVencer <= 30) {
      return label + " (" + t.diasParaVencer + " días)";
    }
    return label;
  }

  function tramiteCard(t, opts) {
    var card = layout.el("article", "tramite-card");

    var head = layout.el("div", "tramite-card__head");
    var titles = layout.el("div");
    titles.appendChild(layout.el("h3", "tramite-card__title", t.tipo));
    titles.appendChild(layout.el("span", "tramite-card__exp", t.expediente));
    head.appendChild(titles);
    head.appendChild(badge(t.estado, toneForState(t.estado, t.estadoTono)));
    card.appendChild(head);

    var body = layout.el("div", "tramite-card__body");

    function row(label, valueNode) {
      var wrap = layout.el("div", "tramite-card__row");
      var dt = layout.el("dt", null, label);
      var dd = layout.el("dd");
      if (typeof valueNode === "string") dd.textContent = valueNode;
      else if (valueNode) dd.appendChild(valueNode);
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      body.appendChild(wrap);
    }

    row("Fecha de envío", t.borrador ? "Sin enviar (borrador)" : fmtFecha(t.fechaEnvio));
    row("Vigencia", vigenciaCell(t));
    if (t.pendiente) row("Pendiente", layout.el("span", "tramite-card__pending", t.pendiente));

    card.appendChild(body);

    var actions = layout.el("div", "tramite-card__actions");
    if (t.borrador) {
      actions.appendChild(button({
        text: "Continuar borrador",
        onClick: function () { if (opts.onContinue) opts.onContinue(t); },
      }));
    }
    if (t.pendiente) {
      actions.appendChild(button({
        text: "Ver observación",
        onClick: function () { if (opts.onVerObservacion) opts.onVerObservacion(t); },
      }));
    }
    if (t.puedeDescargar) {
      actions.appendChild(button({
        text: "Descargar",
        onClick: function () { if (opts.onDescargar) opts.onDescargar(t); },
      }));
    }
    if (!t.borrador && t.id) {
      actions.appendChild(button({
        text: "Ver estado",
        onClick: function () {
          if (global.tm.expediente) global.tm.expediente.setSelected(t);
          if (opts.onVerEstado) opts.onVerEstado(t);
        },
      }));
    }
    card.appendChild(actions);

    return card;
  }

  function vigenciaAlert(tramites) {
    var por30 = [];
    var por90 = [];
    for (var i = 0; i < tramites.length; i++) {
      var d = tramites[i].diasParaVencer;
      if (d == null || d < 0) continue;
      if (d <= 30) por30.push(tramites[i]);
      else if (d <= 90) por90.push(tramites[i]);
    }
    if (por30.length === 0 && por90.length === 0) return null;

    var esCritico = por30.length > 0;
    var alert = layout.el("div", "app-alert " + (esCritico ? "app-alert--warning" : "app-alert--info"));
    alert.appendChild(layout.el(
      "span",
      "app-alert__title",
      esCritico
        ? "Vigencias por vencer en menos de 30 días"
        : "Vigencias por vencer en menos de 90 días"
    ));
    var lista = (esCritico ? por30 : por90).map(function (t) {
      return t.expediente + " (" + t.diasParaVencer + " días)";
    }).join(" · ");
    alert.appendChild(layout.el("span", "app-alert__text", "Revise y renueve a tiempo: " + lista + "."));
    return alert;
  }

  function renderContent(container, opts, tramites) {
    // Sustituir el estado de carga antes de pintar el contenido recibido.
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");

    var header = layout.pageHeader("Mis trámites", "Expedientes y solicitudes registradas a su nombre");
    inner.appendChild(header);

    var toolbar = layout.el("div", "toolbar");
    var actions = layout.el("div", "toolbar__actions");
    actions.appendChild(button({
      variant: "primary",
      text: "Nueva solicitud",
      onClick: function () { if (opts.onNueva) opts.onNueva(); },
    }));
    toolbar.appendChild(actions);
    if (!api || !api.isOnline()) toolbar.appendChild(demoSelector(opts));
    inner.appendChild(toolbar);

    if (tramites.length === 0) {
      var empty = layout.el("div", "app-empty");
      empty.appendChild(layout.el("p", null, "Aún no tiene trámites registrados."));
      empty.appendChild(button({
        variant: "primary",
        text: "Crear mi primera solicitud",
        onClick: function () { if (opts.onNueva) opts.onNueva(); },
      }));
      inner.appendChild(empty);
      container.appendChild(inner);
      return;
    }

    var alert = vigenciaAlert(tramites);
    if (alert) inner.appendChild(alert);

    var grid = layout.el("div", "tramite-grid");
    for (var i = 0; i < tramites.length; i++) {
      grid.appendChild(tramiteCard(tramites[i], opts));
    }
    inner.appendChild(grid);

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
    inner.appendChild(layout.pageHeader("Mis trámites", "Cargando expedientes…"));
    var loading = layout.el("div", "app-loading");
    loading.appendChild(layout.el("span", "spinner"));
    loading.appendChild(layout.el("span", null, "Cargando sus trámites…"));
    inner.appendChild(loading);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Mis trámites", "No se pudo cargar la bandeja"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "No pudimos cargar sus trámites"));
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

  function renderP06(container, opts) {
    opts = opts || {};

    if (api && api.isOnline()) {
      renderLoading(container);
      api.request("GET", "/expedientes?pagina=0&tamano=50", { pantalla: "P-06" }, function (err, data) {
        if (err) {
          renderError(container, { mensaje: err.mensajeUsuario, onRetry: function () { renderP06(container, opts); } });
          return;
        }
        var contenido = data && data.contenido ? data.contenido : [];
        renderContent(container, opts, contenido.map(apiTramite));
      });
      return;
    }

    function show(state) {
      if (!state) state = "carga";
      if (fixtures) fixtures.setScenario(state);
      if (state === "carga") {
        renderLoading(container);
        setTimeout(function () { renderContent(container, opts, tramitesDe("exito")); }, 700);
        return;
      }
      if (state === "error") {
        renderError(container, {
          onRetry: function () { show("carga"); },
          mensaje: errorText("error", null),
        });
        return;
      }
      if (state === "vacio") { renderContent(container, opts, tramitesDe("vacio")); return; }
      renderContent(container, opts, tramitesDe("exito"));
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p06 = { renderP06: renderP06, DEMO_TRAMITES: DEMO_TRAMITES };
})(window);

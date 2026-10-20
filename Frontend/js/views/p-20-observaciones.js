/**
 * P-20 — Observaciones y notificaciones.
 * Lista las observaciones/notificaciones del expediente del titular con emisor
 * (recepcionista / analista), fecha y plazo de atención, los ítems observados
 * con su detalle, la nueva fecha de vigencia de documentos vencidos y la
 * acción para atender (→ P-21). Sin notas internas ni datos confidenciales
 * (CP-09). 4 estados de vista: carga, éxito, vacío, error.
 * Script clásico: expone `tm.views.p20.renderP20`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var button = global.tm.ui.button;
  var api = global.tm.api;

  // Datos demo (ficticios) usados únicamente cuando la aplicación está offline.
  var DEMO_OBSERVACIONES = [
    {
      id: "OBS-2026-0021",
      emisor: "Analista",
      emisorTipo: "analista",
      fecha: "2026-10-02",
      plazo: "2026-10-12",
      asunto: "Complete el expediente para continuar el análisis",
      leida: false,
      items: [
        { titulo: "Domicilio ilegible", detalle: "El recibo de servicio no permite leer la dirección; cargue uno legible." },
        { titulo: "Antecedentes penales vencidos", detalle: "La constancia tiene más de 90 días; cargue una nueva." },
      ],
      vigenciaNueva: { label: "Constancia de antecedentes penales", fecha: "2026-10-02" },
    },
    {
      id: "OBS-2026-0014",
      emisor: "Recepcionista",
      emisorTipo: "recepcion",
      fecha: "2026-09-15",
      plazo: "2026-09-25",
      asunto: "Documento faltante en la recepción",
      leida: true,
      items: [
        { titulo: "Copia del último sello de ingreso", detalle: "Falta la copia legible del sello de ingreso al país." },
      ],
    },
  ];

  function fmtFecha(iso) {
    if (!iso) return "—";
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function diasHasta(iso) {
    if (!iso) return null;
    var hasta = new Date(iso + "T00:00:00");
    if (isNaN(hasta.getTime())) return null;
    return Math.ceil((hasta.getTime() - Date.now()) / 86400000);
  }

  function plazoText(obs) {
    if (!obs.plazo) return "Sin plazo indicado";
    var dias = diasHasta(obs.plazo);
    if (dias == null) return "Plazo: " + fmtFecha(obs.plazo);
    if (dias < 0) return "Plazo vencido (" + fmtFecha(obs.plazo) + ")";
    if (dias === 0) return "Vence hoy";
    return "Vence en " + dias + (dias === 1 ? " día" : " días") + " (" + fmtFecha(obs.plazo) + ")";
  }

  function esCritico(obs) {
    var dias = diasHasta(obs.plazo);
    return dias != null && dias <= 3;
  }

  function observationCard(obs, opts, rerender) {
    var card = layout.el("article", "obs-card" + (obs.leida ? "" : " is-unread"));

    var head = layout.el("div", "obs-card__head");
    var emisor = layout.el("div", "obs-card__emisor");
    emisor.appendChild(layout.el("span", null, "Emitió: " + obs.emisor));
    emisor.appendChild(layout.el("span", "badge", obs.id));
    head.appendChild(emisor);

    var fechas = layout.el("div", "obs-card__fechas");
    fechas.appendChild(layout.el("span", null, "Fecha: " + fmtFecha(obs.fecha)));
    var plazo = layout.el("span", "obs-plazo" + (esCritico(obs) ? " is-critical" : ""), plazoText(obs));
    fechas.appendChild(plazo);
    head.appendChild(fechas);
    card.appendChild(head);

    var body = layout.el("div", "obs-card__body");
    body.appendChild(layout.el("p", "obs-card__subject", obs.asunto));

    var items = layout.el("ul", "obs-items");
    for (var i = 0; i < obs.items.length; i++) {
      var it = obs.items[i];
      var li = layout.el("li", "obs-item");
      li.appendChild(layout.el("span", "obs-item__marker", String(i + 1)));
      var texto = layout.el("div", "obs-item__text");
      texto.appendChild(layout.el("div", "obs-item__title", it.titulo));
      if (it.detalle) texto.appendChild(layout.el("div", "obs-item__detail", it.detalle));
      li.appendChild(texto);
      items.appendChild(li);
    }
    body.appendChild(items);

    if (obs.vigenciaNueva) {
      var alert = layout.el("div", "app-alert app-alert--info");
      alert.appendChild(layout.el("span", "app-alert__title", "Nueva vigencia solicitada"));
      alert.appendChild(layout.el("span", "app-alert__text",
        obs.vigenciaNueva.label + ": válida desde el " + fmtFecha(obs.vigenciaNueva.fecha) + "."));
      body.appendChild(alert);
    }

    card.appendChild(body);

    var actions = layout.el("div", "obs-card__actions");
    if (!obs.leida) {
      actions.appendChild(button({
        text: "Marcar como leída",
        onClick: function () {
          if (api && api.isOnline() && obs.id) {
            api.request("PUT", "/notificaciones/" + encodeURIComponent(obs.id) + "/leida", {}, function (err) {
              if (!err) { obs.leida = true; rerender(); }
            });
            return;
          }
          obs.leida = true;
          rerender();
        },
      }));
    }
    actions.appendChild(button({
      variant: "primary",
      text: "Atender observación",
      onClick: function () { if (opts.onAtender) opts.onAtender(obs); },
    }));
    card.appendChild(actions);

    return card;
  }

  function renderContent(container, opts, observaciones, rerender) {
    var inner = layout.el("div", "app-content__inner");

    inner.appendChild(layout.pageHeader(
      "Observaciones y notificaciones",
      "Requerimientos del despacho sobre su expediente"
    ));

    var toolbar = layout.el("div", "toolbar");
    var info = layout.el("span", null, observacionesPendientesText(observaciones));
    toolbar.appendChild(info);
    if (!api || !api.isOnline()) toolbar.appendChild(demoSelector(opts));
    inner.appendChild(toolbar);

    if (observaciones.length === 0) {
      var empty = layout.el("div", "app-empty");
      empty.appendChild(layout.el("p", null, "No tiene observaciones ni notificaciones."));
      empty.appendChild(layout.el("p", null, "Le avisaremos aquí cuando el despacho registre un requerimiento."));
      inner.appendChild(empty);
      container.appendChild(inner);
      return;
    }

    var pendientes = observaciones.filter(function (o) { return !o.leida; });
    if (pendientes.length > 0) {
      var alert = layout.el("div", "app-alert app-alert--warning");
      alert.appendChild(layout.el("span", "app-alert__title", "Tiene observaciones sin leer"));
      alert.appendChild(layout.el("span", "app-alert__text",
        "Atienda todos los requerimientos en un solo reingreso para que el trámite continúe."));
      inner.appendChild(alert);
    }

    var list = layout.el("div", "obs-list");
    for (var i = 0; i < observaciones.length; i++) {
      list.appendChild(observationCard(observaciones[i], opts, rerender));
    }
    inner.appendChild(list);

    var nota = layout.el("p", "seguimiento-note",
      "Una observación no cambia por sí sola el estado del trámite: al atenderla y reingresar, este vuelve a EN ANÁLISIS.");
    inner.appendChild(nota);

    container.appendChild(inner);
  }

  function observacionesPendientesText(observaciones) {
    var pend = observaciones.filter(function (o) { return !o.leida; }).length;
    if (observaciones.length === 0) return "Sin observaciones";
    return pend + " sin leer de " + observaciones.length;
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
    inner.appendChild(layout.pageHeader("Observaciones y notificaciones", "Cargando requerimientos…"));
    var loading = layout.el("div", "app-loading");
    loading.appendChild(layout.el("span", "spinner"));
    loading.appendChild(layout.el("span", null, "Consultando observaciones y notificaciones…"));
    inner.appendChild(loading);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Observaciones y notificaciones", "No se pudo cargar"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
    alert.appendChild(layout.el("span", "app-alert__text", "No pudimos consultar sus observaciones. Intente nuevamente."));
    inner.appendChild(alert);
    var actions = layout.el("div", "toolbar__actions");
    actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    inner.appendChild(actions);
    container.appendChild(inner);
  }

  function renderP20(container, opts) {
    opts = opts || {};

    if (api && api.isOnline()) {
      renderLoading(container);
      api.request("GET", "/notificaciones?pagina=0&tamano=50", { pantalla: "P-20" }, function (err, data) {
        if (err) { renderError(container, { mensaje: err.mensajeUsuario, onRetry: function () { renderP20(container, opts); } }); return; }
        var contenido = data && data.contenido ? data.contenido : [];
        var notificaciones = contenido.map(function (n) {
          return {
            id: n.id,
            emisor: "Despacho",
            emisorTipo: "sistema",
            fecha: n.fecha ? n.fecha.slice(0, 10) : "",
            plazo: null,
            asunto: n.mensaje || "Tiene una nueva notificación sobre su expediente.",
            leida: !!n.leida,
            items: [],
            expedienteId: n.expedienteId,
          };
        });
        var seleccionado = global.tm.expediente && global.tm.expediente.getSelected ? global.tm.expediente.getSelected() : null;
        var expedienteId = seleccionado && seleccionado.id ? seleccionado.id : (notificaciones.length ? notificaciones[0].expedienteId : null);
        function mostrar(observaciones) {
          var todas = notificaciones.concat(observaciones || []);
          function rerenderRemote() {
            layout.clear(container);
            renderContent(container, opts, todas, rerenderRemote);
          }
          renderContent(container, opts, todas, rerenderRemote);
        }
        if (!expedienteId) { mostrar([]); return; }
        api.request("GET", "/expedientes/" + encodeURIComponent(expedienteId) + "/observaciones", { pantalla: "P-20" }, function (obsErr, datosObs) {
          if (obsErr) { renderError(container, { mensaje: obsErr.mensajeUsuario, onRetry: function () { renderP20(container, opts); } }); return; }
          var observaciones = (datosObs || []).map(function (o) {
            return {
              id: "obs-" + o.id,
              emisor: "Despacho",
              emisorTipo: "despacho",
              fecha: o.fecha ? o.fecha.slice(0, 10) : "",
              plazo: null,
              asunto: o.texto || "Observación registrada sobre el expediente.",
              leida: true,
              items: [],
              expedienteId: o.expedienteId,
            };
          });
          mostrar(observaciones);
        });
      });
      return;
    }

    var observaciones = DEMO_OBSERVACIONES.map(function (o) {
      var copia = {};
      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) copia[k] = o[k];
      return copia;
    });

    function rerender() {
      layout.clear(container);
      renderContent(container, opts, observaciones, rerender);
    }

    function show(state) {
      if (state === "carga") {
        renderLoading(container);
        setTimeout(function () { rerender(); }, 700);
        return;
      }
      if (state === "error") { renderError(container, { onRetry: function () { show("carga"); } }); return; }
      if (state === "vacio") {
        layout.clear(container);
        renderContent(container, opts, [], rerender);
        return;
      }
      rerender();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p20 = { renderP20: renderP20, DEMO_OBSERVACIONES: DEMO_OBSERVACIONES };
})(window);

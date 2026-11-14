/**
 * P-14 — Requisitos y documentos del trámite.
 * La ficha de requisitos es informativa: lista lo que el ciudadano debe aportar
 * (sin casillas que marcar). Cada requisito tiene su propia ficha con la
 * prioridad y la carga del documento por separado, con vista previa y descarga.
 * Incluye descarga general (sin confirmación) y limpieza general (dos confirmaciones).
 * Los requisitos con interoperabilidad [A] no se cargan; los pagos se acreditan
 * en el paso «Revisión y pago».
 * 4 estados: carga, éxito, vacío, error.
 * Script clásico: expone `tm.views.p14.renderP14`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var button = global.tm.ui.button;
  var wizard = global.tm.wizard;
  var draft = global.tm.draft;
  var fixtures = global.tm.fixtures;
  var docs = global.tm.docs;

  var ROUTE = "#/solicitud/paso-6";
  var GRUPO = "requisitos";

  // Respaldo inline; la fuente por defecto es el fixture P-14 (§2.5).
  var REQUISITOS_FALLBACK = ["Documento de identidad", "Comprobante de domicilio", "Documento de respaldo del trámite"];

  function estadoActual() {
    return (fixtures && fixtures.scenario && fixtures.scenario()) || "exito";
  }

  function tipoDocumentalCode(texto) {
    var textoNormalizado = String(texto || "").toLowerCase();
    if (/pasaporte/.test(textoNormalizado)) return "PASAPORTE";
    if (/foto|fotograf/.test(textoNormalizado)) return "FOTO_CARNE";
    if (/poder/.test(textoNormalizado)) return "PODER_NOTARIADO";
    if (/declaraci[oó]n/.test(textoNormalizado)) return "DECLARACION_JURADA";
    if (/pago|cheque|tasa|b\/\./.test(textoNormalizado)) return "COMPROBANTE_PAGO";
    if (/css|caja de seguro/.test(textoNormalizado)) return "FICHA_CSS";
    if (/salud/.test(textoNormalizado)) return "CERTIFICADO_SALUD";
    if (/antecedente/.test(textoNormalizado)) return "ANTECEDENTES_PENALES";
    return null;
  }

  // Tasas, cheques y timbres no se cargan aquí: se acreditan con el comprobante
  // del paso «Revisión y pago».
  function esPago(texto, codigo) {
    if (codigo === "COMPROBANTE_PAGO") return true;
    return /^(cheques?|tasas?|tiquetes?|pagos?|timbres?)\b|^B\/\./i.test(String(texto || "").trim());
  }

  // Sin dato del catálogo, un requisito es prioritario salvo que su texto lo
  // condicione («si procede», «si aplica», «opcional»).
  function esCondicional(texto) {
    return /\(opcional\)|si procede|si aplica|si perdi[oó]|\(si /i.test(String(texto || ""));
  }

  function desdeTexto(texto) {
    var auto = /\(A\)/.test(texto);
    var limpio = texto.replace(/\s*\(A\)/g, "").replace(/\s*\(opcional\)/i, "");
    var pago = esPago(limpio, null);
    return {
      texto: limpio,
      auto: auto,
      prioritario: !esCondicional(texto),
      codigo: pago ? null : tipoDocumentalCode(limpio),
      pago: pago,
    };
  }

  /** Requisitos del trámite elegido: [{ texto, auto, prioritario, codigo, pago }]. */
  function buildRequisitos(d, fallback) {
    var out = [];
    var cat = null;
    var p07 = global.tm.views.p07 || {};
    var catalogo = p07.CATALOGO || [];
    var delBackend = false;
    for (var i = 0; i < catalogo.length; i++) {
      if (catalogo[i].value === d.categoria) { cat = catalogo[i]; break; }
    }
    if (cat) {
      for (var j = 0; j < cat.tramites.length; j++) {
        if (cat.tramites[j].nombre !== d.tramite) continue;
        var detalle = cat.tramites[j].reqDetalle;
        if (detalle && detalle.length) {
          // Catálogo del backend: trae el tipo documental y si es obligatorio.
          delBackend = true;
          for (var k = 0; k < detalle.length; k++) {
            out.push({
              texto: detalle[k].nombre,
              auto: false,
              prioritario: !!detalle[k].obligatorio,
              codigo: detalle[k].codigo || tipoDocumentalCode(detalle[k].nombre),
              pago: esPago(detalle[k].nombre, detalle[k].codigo),
            });
          }
        } else {
          var req = cat.tramites[j].req || [];
          for (var r = 0; r < req.length; r++) out.push(desdeTexto(req[r]));
        }
        break;
      }
      // El catálogo del backend ya incluye los requisitos comunes del trámite.
      if (cat.residencia && !delBackend) {
        var art = p07.REQUISITOS_ART_28 || [];
        for (var a = 0; a < art.length; a++) out.push(desdeTexto(art[a]));
      }
    }
    if (out.length === 0) {
      var base = fallback || REQUISITOS_FALLBACK;
      for (var f = 0; f < base.length; f++) out.push(desdeTexto(base[f]));
      out.esRespaldo = true;
    }
    return out;
  }

  function claveDe(requisito) { return "req:" + requisito.texto; }

  function renderContent(container, opts) {
    var body = wizard.frame(container, ROUTE);
    if (!global.tm.api || !global.tm.api.isOnline()) body.appendChild(demoSelector(opts));
    var d = draft.getDraft();

    var fuente = (fixtures && fixtures.data("P-14", estadoActual())) || {};
    var arr = buildRequisitos(d, fuente.requisitosFallback || REQUISITOS_FALLBACK);

    // Al cambiar de trámite se retiran los archivos de requisitos que ya no
    // aplican. Nunca se retira nada si la lista es el respaldo genérico (no se
    // reconoció el trámite): ahí no hay base para decidir qué sobra.
    if (!arr.esRespaldo) {
      var vigentes = {};
      arr.forEach(function (r) { if (!r.auto && !r.pago) vigentes[claveDe(r)] = true; });
      docs.list(GRUPO).forEach(function (e) { if (!vigentes[e.key]) docs.remove(e.key); });
    }

    var cargables = arr.filter(function (r) { return !r.auto && !r.pago; });
    var prioritarios = cargables.filter(function (r) { return r.prioritario; });

    var intro = layout.el("div", "doc-intro");
    intro.appendChild(layout.el("p", "doc-intro__text",
      "Esta es la documentación que debe aportar para su trámite. Adjunte cada documento en su propia ficha; los marcados como «Prioritario» son indispensables para recibir la solicitud."));
    body.appendChild(intro);

    var toolbar = layout.el("div", "doc-toolbar");
    var resumen = layout.el("p", "doc-toolbar__summary", "");
    resumen.setAttribute("aria-live", "polite");
    toolbar.appendChild(resumen);
    var toolbarActions = layout.el("div", "doc-toolbar__actions");
    var btnDescargar = button({
      text: "Descargar todos",
      onClick: function () {
        // Descarga general: directa, sin confirmación.
        docs.downloadAll(docs.list(GRUPO), "documentos-solicitud.zip");
      },
    });
    var btnLimpiar = button({
      variant: "danger",
      text: "Limpiar todos",
      onClick: function () {
        var total = docs.list(GRUPO).length;
        if (!total) return;
        // Limpieza general: exige dos confirmaciones seguidas.
        global.tm.ui.confirmModal(
          "Limpiar documentos (paso 1 de 2)",
          "Se quitarán los " + total + " documento(s) adjuntos de esta solicitud. ¿Desea continuar?",
          {
            confirmText: "Sí, continuar",
            onConfirm: function () {
              global.tm.ui.confirmModal(
                "Confirmación final (paso 2 de 2)",
                "Esta acción no se puede deshacer: tendrá que adjuntar de nuevo cada documento. ¿Quitar definitivamente los " + total + " documento(s)?",
                {
                  danger: true,
                  confirmText: "Quitar todos",
                  onConfirm: function () {
                    docs.clear(GRUPO);
                    cards.forEach(function (c) { if (c.refresh) c.refresh(); });
                    update();
                  },
                }
              );
            },
          }
        );
      },
    });
    btnDescargar.classList.add("doc-toolbar__download");
    btnLimpiar.classList.add("doc-toolbar__clear");
    toolbarActions.appendChild(btnDescargar);
    toolbarActions.appendChild(btnLimpiar);
    toolbar.appendChild(toolbarActions);
    body.appendChild(toolbar);

    var list = layout.el("ul", "doc-list");
    var cards = [];

    function update() {
      var adjuntos = docs.list(GRUPO).length;
      var prioritariosListos = prioritarios.filter(function (r) { return !!docs.get(claveDe(r)); }).length;
      resumen.textContent = prioritarios.length
        ? prioritariosListos + " de " + prioritarios.length + " documentos prioritarios adjuntos · " + adjuntos + " archivo(s) en total"
        : adjuntos + " archivo(s) adjuntos";
      btnDescargar.disabled = adjuntos === 0;
      btnLimpiar.disabled = adjuntos === 0;
    }

    arr.forEach(function (r) {
      var cardEl;
      if (r.auto) {
        cardEl = docs.card({
          key: claveDe(r),
          label: r.texto,
          etiqueta: { text: "Verificación automática", tone: "verified" },
          informativo: "No necesita adjuntarlo: el despacho lo verifica con la institución que lo emite.",
        });
      } else if (r.pago) {
        cardEl = docs.card({
          key: claveDe(r),
          label: r.texto,
          etiqueta: { text: "Se acredita en el pago", tone: "info" },
          informativo: "No se adjunta aquí: el comprobante se carga en el paso «Revisión y pago».",
        });
      } else {
        cardEl = docs.card({
          key: claveDe(r),
          label: r.texto,
          grupo: GRUPO,
          tipoDocumental: r.codigo,
          prioritario: r.prioritario,
          onChange: update,
        });
      }
      cards.push(cardEl);
      list.appendChild(cardEl);
    });

    body.appendChild(list);
    update();

    var err = wizard.errorBox();
    body.appendChild(err);

    body.appendChild(wizard.footer({
      onBack: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/paso-1"); },
      onNext: function () {
        wizard.clearError(err);
        var faltantes = prioritarios.filter(function (r) { return !docs.get(claveDe(r)); });
        if (faltantes.length) {
          for (var c = 0; c < cards.length; c++) {
            if (cards[c].getAttribute("data-doc-key") === claveDe(faltantes[0]) && cards[c].scrollIntoView) {
              cards[c].scrollIntoView({ block: "center", behavior: "smooth" });
              break;
            }
          }
          return wizard.showError(err, "Falta adjuntar " + faltantes.length + " documento(s) prioritario(s): " +
            faltantes.slice(0, 3).map(function (r) { return r.texto; }).join("; ") + (faltantes.length > 3 ? "…" : "") +
            ". No se recibirán solicitudes incompletas.");
        }
        var autoCount = arr.filter(function (r) { return r.auto; }).length;
        draft.mergeDraft({
          requisitos: {
            total: arr.length,
            automaticos: autoCount,
            prioritarios: prioritarios.length,
            cumplidos: docs.list(GRUPO).length,
            adjuntos: docs.list(GRUPO).map(function (e) { return { requisito: e.label, archivo: e.file.name, tamano: e.file.size }; }),
          },
        });
        if (opts.onNavigate) opts.onNavigate(wizard.nextRoute(ROUTE));
      },
    }));
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
    inner.appendChild(layout.pageHeader("Nueva solicitud", "Cargando requisitos…"));
    var loading = layout.el("div", "app-loading");
    loading.appendChild(layout.el("span", "spinner"));
    loading.appendChild(layout.el("span", null, "Cargando la lista de requisitos…"));
    inner.appendChild(loading);
    container.appendChild(inner);
  }

  function renderEmpty(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Nueva solicitud", "Sin requisitos configurados"));
    var empty = layout.el("div", "app-empty");
    empty.appendChild(layout.el("p", null, "No hay requisitos configurados para este trámite. Contacte al despacho."));
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    empty.appendChild(retry);
    inner.appendChild(empty);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Nueva solicitud", "No se pudo cargar la lista"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "No pudimos cargar la lista de requisitos"));
    alert.appendChild(layout.el(
      "span",
      "app-alert__text",
      (opts && opts.mensaje) || "No pudimos cargar la lista de requisitos. Intente nuevamente."
    ));
    inner.appendChild(alert);
    var retry = layout.el("div", "toolbar__actions");
    retry.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    inner.appendChild(retry);
    container.appendChild(inner);
  }

  function renderP14(container, opts) {
    opts = opts || {};

    function cargarCatalogoYMostrar() {
      if (!global.tm.api || !global.tm.api.isOnline()) {
        renderContent(container, opts);
        return;
      }
      var p07 = global.tm.views.p07 || {};
      // Solo vale el catálogo que ya vino del backend; el de demostración que
      // viene precargado no describe los trámites reales.
      if (p07.catalogoEnLinea && p07.CATALOGO && p07.CATALOGO.length) {
        renderContent(container, opts);
        return;
      }
      renderLoading(container);
      global.tm.api.request("GET", "/catalogos/tipos-tramite", { pantalla: "P-14" }, function (err, items) {
        if (err) {
          renderError(container, { mensaje: err.mensajeUsuario, onRetry: cargarCatalogoYMostrar });
          return;
        }
        var mapper = p07.catalogoDesdeApi;
        var catalogo = mapper ? mapper(items) : [];
        if (global.tm.views.p07) {
          global.tm.views.p07.CATALOGO = catalogo;
          global.tm.views.p07.catalogoEnLinea = catalogo.length > 0;
        }
        if (!catalogo.length) {
          renderEmpty(container, { onRetry: cargarCatalogoYMostrar });
          return;
        }
        renderContent(container, opts);
      });
    }

    function show(state) {
      if (!state) state = "carga";
      if (global.tm.api && global.tm.api.isOnline()) {
        cargarCatalogoYMostrar();
        return;
      }
      if (fixtures) fixtures.setScenario(state);
      if (state === "carga") {
        renderLoading(container);
        setTimeout(function () { renderContent(container, opts); }, 700);
        return;
      }
      if (state === "error") {
        renderError(container, {
          onRetry: function () { show("carga"); },
          mensaje: fixtures ? fixtures.message("P-14", "error", null) : null,
        });
        return;
      }
      if (state === "vacio") { renderEmpty(container, { onRetry: function () { show("carga"); } }); return; }
      renderContent(container, opts);
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p14 = { renderP14: renderP14, buildRequisitos: buildRequisitos, claveDe: claveDe, GRUPO: GRUPO };
})(window);

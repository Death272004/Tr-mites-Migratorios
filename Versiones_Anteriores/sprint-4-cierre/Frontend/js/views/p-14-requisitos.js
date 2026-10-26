/**
 * P-14 Paso 6 — Requisitos y carga de documentos.
 * Checklist generado desde la ficha de P-07 (sección 4). Los requisitos con
 * interoperabilidad [A] se muestran bloqueados y sellados; el ciudadano carga
 * los demás. Incluye barra de progreso y exige checklist completo para avanzar.
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

  var ROUTE = "#/solicitud/paso-6";

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

  function buildRequisitos(d, fallback) {
    var out = [];
    var cat = null;
    var catalogo = (global.tm.views.p07 && global.tm.views.p07.CATALOGO) || [];
    for (var i = 0; i < catalogo.length; i++) {
      if (catalogo[i].value === d.categoria) { cat = catalogo[i]; break; }
    }
    if (cat) {
      for (var j = 0; j < cat.tramites.length; j++) {
        if (cat.tramites[j].nombre === d.tramite) {
          var req = cat.tramites[j].req || [];
          for (var k = 0; k < req.length; k++) out.push(req[k]);
          break;
        }
      }
      if (cat.residencia) {
        var art = (global.tm.views.p07 && global.tm.views.p07.REQUISITOS_ART_28) || [];
        for (var a = 0; a < art.length; a++) out.push(art[a]);
      }
    }
    if (out.length === 0) out = fallback || REQUISITOS_FALLBACK;
    return out;
  }

  function renderContent(container, opts) {
    var body = wizard.frame(container, ROUTE);
    if (!global.tm.api || !global.tm.api.isOnline()) body.appendChild(demoSelector(opts));
    var d = draft.getDraft();

    var fuente = (fixtures && fixtures.data("P-14", estadoActual())) || {};
    var fallback = fuente.requisitosFallback || REQUISITOS_FALLBACK;

    var requisitos = buildRequisitos(d, fallback);
    var arr = [];
    for (var i = 0; i < requisitos.length; i++) {
      arr.push({ texto: requisitos[i].replace(/\s*\(A\)/, ""), auto: /\(A\)/.test(requisitos[i]) });
    }

    var progressWrap = layout.el("div");
    progressWrap.appendChild(layout.el("p", "wizard-summary", "Complete el checklist. Los requisitos [A] se verifican por interoperabilidad (simulado)."));
    var bar = layout.el("div", "progress");
    var fill = layout.el("div", "progress__bar");
    bar.appendChild(fill);
    progressWrap.appendChild(bar);
    var progressText = layout.el("span", "form-field__help", "0 de " + arr.length + " cumplidos");
    progressWrap.appendChild(progressText);
    body.appendChild(progressWrap);

    var list = layout.el("ul", "checklist");
    var checks = [];
    var archivos = [];

    function updateProgress() {
      var done = 0;
      for (var c = 0; c < arr.length; c++) if (arr[c].auto || checks[c].checked) done++;
      var pct = Math.round((done / arr.length) * 100);
      fill.style.width = pct + "%";
      progressText.textContent = done + " de " + arr.length + " cumplidos";
    }

    for (var j = 0; j < arr.length; j++) {
      var item = layout.el("li", "checklist__item" + (arr[j].auto ? " checklist__item--auto" : ""));
      var main = layout.el("div", "checklist__item-main");
      main.appendChild(layout.el("div", "checklist__name", arr[j].texto));

      if (arr[j].auto) {
        main.appendChild(layout.el("div", "checklist__meta", "Verificado automáticamente (futuro convenio) · en MVP lo registra el despacho en I-07"));
        item.appendChild(main);
        item.appendChild(verifiedBadge());
      } else {
        var row = layout.el("label", "auth-check");
        var chk = layout.el("input", "auth-check__input");
        chk.type = "checkbox";
        chk.addEventListener("change", updateProgress);
        row.appendChild(chk);
        row.appendChild(layout.el("span", "auth-check__label", "Cumplido / cargado"));
        main.appendChild(row);
        (function (indice) {
          var upload = global.tm.ui.fileUpload({
            label: "Archivo",
            accept: ".pdf,.jpg,.jpeg,.png",
            onChange: function (f) { archivos[indice] = f && f.file ? f.file : null; },
          });
          main.appendChild(upload);
        })(j);
        checks[j] = chk;
        item.appendChild(main);
      }
      list.appendChild(item);
      if (arr[j].auto) checks[j] = { checked: true };
    }

    body.appendChild(list);
    updateProgress();

    var err = wizard.errorBox();
    body.appendChild(err);

    body.appendChild(wizard.footer({
      onBack: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/paso-5"); },
      onNext: function () {
        wizard.clearError(err);
        for (var c = 0; c < arr.length; c++) {
          if (!arr[c].auto && !checks[c].checked) {
            return wizard.showError(err, "Faltan requisitos por cumplir. No se recibirán solicitudes incompletas.");
          }
        }
        var autoCount = 0;
        for (var a = 0; a < arr.length; a++) if (arr[a].auto) autoCount++;
        draft.mergeDraft({ requisitos: { total: arr.length, automaticos: autoCount, cumplidos: arr.length - autoCount } });
        global.tm.pendingDocuments = [];
        for (var f = 0; f < archivos.length; f++) {
          var codigo = tipoDocumentalCode(arr[f].texto);
          if (archivos[f] && codigo) global.tm.pendingDocuments.push({ file: archivos[f], tipoDocumental: codigo });
        }
        if (opts.onNavigate) opts.onNavigate(wizard.nextRoute(ROUTE));
      },
    }));

    updateProgress();
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

    function show(state) {
      if (!state) state = "carga";
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

  function verifiedBadge() {
    var s = layout.el("span", "badge badge--verified", "verificado automáticamente");
    return s;
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p14 = { renderP14: renderP14 };
})(window);

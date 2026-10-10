/**
 * P-14 Paso 6 — Requisitos y carga de documentos.
 * Checklist generado desde la ficha de P-07 (sección 4). Los requisitos con
 * interoperabilidad [A] se muestran bloqueados y sellados; el ciudadano carga
 * los demás. Incluye barra de progreso y exige checklist completo para avanzar.
 * Script clásico: expone `tm.views.p14.renderP14`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var wizard = global.tm.wizard;
  var draft = global.tm.draft;

  var ROUTE = "#/solicitud/paso-6";

  function buildRequisitos(d) {
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
    if (out.length === 0) out = ["Documento de identidad", "Comprobante de domicilio", "Documento de respaldo del trámite"];
    return out;
  }

  function renderP14(container, opts) {
    opts = opts || {};
    var body = wizard.frame(container, ROUTE);
    var d = draft.getDraft();

    var requisitos = buildRequisitos(d);
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
        var upload = global.tm.ui.fileUpload({ label: "Archivo", accept: ".pdf,.jpg,.jpeg,.png", onChange: function (f) { if (f) { this; } } });
        main.appendChild(upload);
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
        if (opts.onNavigate) opts.onNavigate(wizard.nextRoute(ROUTE));
      },
    }));

    updateProgress();
  }

  function verifiedBadge() {
    var s = layout.el("span", "badge badge--verified", "verificado automáticamente");
    return s;
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p14 = { renderP14: renderP14 };
})(window);
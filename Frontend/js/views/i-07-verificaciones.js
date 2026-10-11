/**
 * I-07 — Panel de verificación interoperable (Fase E).
 * Pantalla estrella del modo manual asistido: muestra y registra el resultado de
 * cada verificación externa, distinguiendo error técnico de resultado negativo
 * (CP-07), con reintento idempotente (CP-08). 4 estados de vista.
 * Script clásico: expone `tm.views.i07.renderI07`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var table = global.tm.ui.table;
  var perms = global.tm.perms;

  var FALLBACK = { expediente: "—", modo: "manual asistido", resultados: ["OK"], instituciones: ["TE"], verificaciones: [] };

  function datos() {
    return global.tm.fixtures.data("I-07", "exito") || FALLBACK;
  }

  function tone(resultado) {
    if (resultado === "OK") return "success";
    if (resultado === "SIN_RESULTADO") return "warning";
    return "danger";
  }

  function etiqueta(resultado) {
    if (resultado === "ERROR_TECNICO") return "ERROR TÉCNICO";
    if (resultado === "SIN_RESULTADO") return "SIN RESULTADO";
    return resultado;
  }

  function optionsTo(list) {
    return list.map(function (v) { return { label: v, value: v }; });
  }

  function renderI07(container, opts) {
    opts = opts || {};
    var d = datos();
    var verifs = d.verificaciones.map(function (v) { return Object.assign({}, v); });

    function demoSelector() {
      var wrap = layout.el("label", "toolbar__demo");
      wrap.appendChild(layout.el("span", null, "Vista (demo)"));
      var sel = layout.el("select");
      var opciones = [{ v: "carga", l: "Carga" }, { v: "exito", l: "Éxito" }, { v: "vacio", l: "Vacío" }, { v: "error", l: "Error" }];
      for (var i = 0; i < opciones.length; i++) { var o = layout.el("option", null, opciones[i].l); o.value = opciones[i].v; sel.appendChild(o); }
      sel.addEventListener("change", function () { if (opts.onDemoState) opts.onDemoState(sel.value); });
      wrap.appendChild(sel);
      return wrap;
    }

    function rowActions(v) {
      if (!perms.can(perms.PERMS.VERIFICAR)) return perms.notice(perms.PERMS.VERIFICAR, "Solo un rol con permiso «verificar» puede registrar resultados.");
      var box = layout.el("div", "detail-actions");
      box.appendChild(button({ variant: "ghost", text: "Verificado", onClick: function () {
        v.resultado = "OK";
        v.valorRetornado = v.valorRetornado || "Coincide";
        renderContent();
      } }));
      box.appendChild(button({ variant: "ghost", text: "Inconsistencia", onClick: function () {
        window.alert("Inconsistencia registrada (simulada): se generará una observación automática en I-08 (regla 4).");
      } }));
      box.appendChild(button({ variant: "ghost", text: "Repetir", onClick: function () {
        window.alert("Consulta repetida (simulada). La operación es idempotente (CP-08).");
      } }));
      return box;
    }

    function renderContent() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Panel de verificación interoperable", "Verificación manual asistida (sin convenios en el MVP)"));

      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", null, ""));
      toolbar.appendChild(demoSelector());
      inner.appendChild(toolbar);

      var card = layout.el("div", "detail-card");
      var r1 = layout.el("div", "detail-row");
      r1.appendChild(layout.el("span", "detail-row__label", "Expediente"));
      r1.appendChild(layout.el("span", "detail-row__value", d.expediente));
      card.appendChild(r1);
      var r2 = layout.el("div", "detail-row");
      r2.appendChild(layout.el("span", "detail-row__label", "Modo vigente"));
      r2.appendChild(layout.el("span", "detail-row__value", d.modo));
      card.appendChild(r2);
      inner.appendChild(card);

      var legend = layout.el("div", "app-alert app-alert--info");
      legend.appendChild(layout.el("span", "app-alert__title", "Distinción obligatoria (CP-07)"));
      legend.appendChild(layout.el("span", "app-alert__text", "Un error técnico (ERROR_TÉCNICO / TIMEOUT) nunca se presenta como resultado negativo; devuelve el requisito a carga manual."));
      inner.appendChild(legend);

      inner.appendChild(table({
        headers: [
          { label: "Institución" },
          { label: "Dato solicitado" },
          { label: "Resultado" },
          { label: "Valor / respuesta" },
          { label: "Referencia" },
          { label: "Responsable" },
          { label: "Acciones" },
        ],
        rows: verifs.map(function (v) {
          return [
            { text: v.institucion },
            { text: v.dato },
            { node: layout.el("span", "badge badge--" + tone(v.resultado), etiqueta(v.resultado)) },
            { text: v.valorRetornado || "—" },
            { text: v.referencia || "—" },
            { text: v.responsable || "—" },
            { node: rowActions(v) },
          ];
        }),
        emptyText: "Sin verificaciones registradas.",
      }));

      var form = layout.el("fieldset", "wizard-section");
      form.appendChild(layout.el("legend", "wizard-section-title", "Registrar verificación manual asistida"));
      var grid = layout.el("div", "wizard-grid");
      var wInst = field.fieldSelect({ id: "vInst", label: "Institución consultada", options: optionsTo(d.instituciones) });
      var wDato = field.fieldText({ id: "vDato", label: "Dato solicitado", placeholder: "Ej.: identidad, matrimonio, afiliación, RUEX" });
      var wRes = field.fieldSelect({ id: "vRes", label: "Resultado", options: optionsTo(d.resultados) });
      var wRef = field.fieldText({ id: "vRef", label: "Referencia / identificador de la consulta" });
      var wResp = field.fieldText({ id: "vResp", label: "Responsable del registro", value: "Lic. Pedro Ruiz" });
      grid.appendChild(wInst);
      grid.appendChild(wDato);
      grid.appendChild(wRes);
      grid.appendChild(wRef);
      grid.appendChild(wResp);
      form.appendChild(grid);
      form.appendChild(field.fieldTextarea({ id: "vValor", label: "Valor retornado / observación (resultado mínimo)", rows: 2 }));

      var actions = layout.el("div", "toolbar__actions");
      var registrarBtn = button({
        variant: "primary",
        text: "Registrar verificación",
        onClick: function () {
          var inst = wInst.querySelector("select");
          var dato = wDato.querySelector("input");
          var res = wRes.querySelector("select");
          var ref = wRef.querySelector("input");
          var resp = wResp.querySelector("input");
          var valor = form.querySelector("#vValor");
          if (!dato || !dato.value.trim()) { window.alert("Indique el dato solicitado."); return; }
          verifs.push({
            institucion: inst ? inst.value : "TE",
            dato: dato.value.trim(),
            resultado: res ? res.value : "OK",
            valorRetornado: valor && valor.value.trim() ? valor.value.trim() : "—",
            fecha: "2026-10-11",
            referencia: ref && ref.value.trim() ? ref.value.trim() : "Registro manual",
            responsable: resp && resp.value.trim() ? resp.value.trim() : "—",
            evidencia: null,
          });
          renderContent();
        },
      });
      actions.appendChild(perms.can(perms.PERMS.VERIFICAR) ? registrarBtn : perms.notice(perms.PERMS.VERIFICAR, "Solo un rol con permiso «verificar» puede registrar resultados."));
      form.appendChild(actions);
      inner.appendChild(form);

      inner.appendChild(layout.el("p", "seguimiento-note", "Sin consulta masiva: solo con expediente asociado (regla 5). Toda consulta queda registrada en la bitácora (I-16, regla 3)."));
      container.appendChild(inner);
    }

    function renderLoading() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Panel de verificación interoperable", "Cargando verificaciones…"));
      var l = layout.el("div", "app-loading");
      l.appendChild(layout.el("span", "spinner"));
      l.appendChild(layout.el("span", null, "Reuniendo resultados de verificación externa…"));
      inner.appendChild(l);
      container.appendChild(inner);
    }

    function renderEmpty() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Panel de verificación interoperable", "Sin verificaciones"));
      var e = layout.el("div", "app-empty");
      e.appendChild(layout.el("p", null, "No hay verificaciones registradas para este expediente."));
      inner.appendChild(e);
      container.appendChild(inner);
    }

    function renderError() {
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader("Panel de verificación interoperable", "No se pudo cargar"));
      var a = layout.el("div", "app-alert app-alert--warning");
      a.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
      a.appendChild(layout.el("span", "app-alert__text", global.tm.fixtures.message("I-07", "error", "No pudimos cargar las verificaciones.")));
      inner.appendChild(a);
      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { show("carga"); } }));
      inner.appendChild(actions);
      container.appendChild(inner);
    }

    function show(state) {
      global.tm.fixtures.setScenario(state);
      if (state === "carga") { renderLoading(); setTimeout(renderContent, 700); return; }
      if (state === "error") { renderError(); return; }
      if (state === "vacio") { renderEmpty(); return; }
      renderContent();
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i07 = { renderI07: renderI07 };
})(window);

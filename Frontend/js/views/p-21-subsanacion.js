/**
 * P-21 — Subsanación (corrección del expediente).
 * Permite corregir el expediente en un SOLO reingreso que atienda cada una de
 * las observaciones. Por cada ítem observado (prellenado): documento corregido
 * (archivo, obligatorio), justificación (opcional) y sustitución de dato
 * digitalizado (condicional). Confirmación final obligatoria de atender cada punto.
 * Al reingresar, el trámite vuelve a EN ANÁLISIS (simulado).
 * 4 estados de vista: carga, éxito, vacío, error.
 * Script clásico: expone `tm.views.p21.renderP21`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var fileUpload = global.tm.ui.fileUpload;

  var MAX_BYTES = 5 * 1024 * 1024;
  var ACCEPT = ".pdf,.jpg,.jpeg,.png";

  // Ítems de respaldo si P-20 no está disponible (mismos datos ficticios).
  var FALLBACK_ITEMS = [
    {
      obsId: "OBS-2026-0021",
      emisor: "Analista",
      plazo: "2026-10-12",
      titulo: "Domicilio ilegible",
      detalle: "El recibo de servicio no permite leer la dirección; cargue uno legible.",
    },
    {
      obsId: "OBS-2026-0021",
      emisor: "Analista",
      plazo: "2026-10-12",
      titulo: "Antecedentes penales vencidos",
      detalle: "La constancia tiene más de 90 días; cargue una nueva.",
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

  function plazoText(plazo) {
    var dias = diasHasta(plazo);
    if (dias == null) return "Plazo: " + fmtFecha(plazo);
    if (dias < 0) return "Plazo vencido (" + fmtFecha(plazo) + ")";
    if (dias === 0) return "Vence hoy";
    return "Plazo: " + dias + (dias === 1 ? " día" : " días") + " (" + fmtFecha(plazo) + ")";
  }

  // Reúne los ítems observados pendientes desde P-20 (o usa el respaldo).
  function buildItems() {
    var obs = (global.tm.views.p20 && global.tm.views.p20.DEMO_OBSERVACIONES) || [];
    var pendientes = obs.filter(function (o) { return !o.leida; });
    if (pendientes.length === 0) pendientes = obs.length ? obs : null;

    var out = [];
    if (pendientes && pendientes.length) {
      for (var i = 0; i < pendientes.length; i++) {
        var o = pendientes[i];
        for (var j = 0; j < o.items.length; j++) {
          out.push({
            obsId: o.id,
            emisor: o.emisor,
            plazo: o.plazo,
            titulo: o.items[j].titulo,
            detalle: o.items[j].detalle,
          });
        }
      }
    }
    return out.length ? out : FALLBACK_ITEMS.slice();
  }

  function itemBlock(item, index) {
    var state = { file: null };

    var block = layout.el("section", "subsana-item");
    block.appendChild(layout.el("h3", "subsana-item__title", (index + 1) + ". " + item.titulo));

    var meta = layout.el("div", "subsana-item__meta");
    meta.appendChild(layout.el("span", null, "Observación " + item.obsId + " · " + item.emisor));
    meta.appendChild(layout.el("span", null, plazoText(item.plazo)));
    block.appendChild(meta);

    if (item.detalle) block.appendChild(layout.el("p", "subsana-item__detail", item.detalle));

    var err = layout.el("span", "auth-error", "");
    err.setAttribute("aria-live", "polite");

    block.appendChild(fileUpload({
      id: "doc-" + index,
      label: "Documento corregido / completado",
      accept: ACCEPT,
      helpText: "PDF, JPG o PNG · máximo 5 MB · debe respetar la vigencia (30/90 días).",
      onChange: function (f) {
        err.textContent = "";
        err.classList.remove("is-visible");
        if (f && f.size > MAX_BYTES) {
          err.textContent = "El archivo supera los 5 MB.";
          err.classList.add("is-visible");
          state.file = null;
          return;
        }
        state.file = f;
      },
    }));
    block.appendChild(err);

    block.appendChild(field.fieldTextarea({
      id: "just-" + index,
      label: "Justificación de la corrección (opcional)",
      rows: 2,
      helpText: "Explique brevemente el cambio realizado, si aplica.",
    }));
    block.appendChild(field.fieldText({
      id: "dato-" + index,
      label: "Sustitución de dato digitalizado (si aplica)",
      helpText: "Solo para campos corregibles, p. ej. un error de digitación.",
    }));

    return { block: block, error: err, state: state };
  }

  function renderForm(container, opts, items) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");

    inner.appendChild(layout.pageHeader(
      "Subsanación del expediente",
      "Atienda todas las observaciones en un solo reingreso"
    ));

    var toolbar = layout.el("div", "toolbar");
    toolbar.appendChild(layout.el("span", null, items.length + (items.length === 1 ? " ítem observado" : " ítems observados")));
    toolbar.appendChild(demoSelector(opts));
    inner.appendChild(toolbar);

    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "Regla oficial: solo se reingresa completo"));
    alert.appendChild(layout.el("span", "app-alert__text", "Debe cargar el documento corregido de todos los ítems y confirmar que atiende la totalidad de las observaciones. Si vence el plazo, el expediente se archiva."));
    inner.appendChild(alert);

    var entries = [];
    var wrapper = layout.el("div", "subsana-form");
    for (var i = 0; i < items.length; i++) {
      var built = itemBlock(items[i], i);
      entries.push(built);
      wrapper.appendChild(built.block);
    }
    inner.appendChild(wrapper);

    var confirm = field.fieldCheckbox({
      id: "confirm-todas",
      label: "Confirmo que atiendo TODAS las observaciones en este único reingreso",
      helpText: "El expediente se reingresa completo; el trámite retoma en EN ANÁLISIS.",
    });
    inner.appendChild(confirm);

    var err = layout.el("div", "auth-error", "");
    err.setAttribute("aria-live", "polite");
    inner.appendChild(err);

    var actions = layout.el("div", "auth-actions");
    actions.appendChild(button({ text: "Volver a observaciones", onClick: function () { if (opts.onNavigate) opts.onNavigate("#/seguimiento/observaciones"); } }));
    actions.appendChild(button({ variant: "primary", text: "Reingresar expediente", onClick: submit }));
    inner.appendChild(actions);

    container.appendChild(inner);

    function submit() {
      err.textContent = "";
      err.classList.remove("is-visible");
      var faltantes = [];
      for (var k = 0; k < entries.length; k++) {
        if (!entries[k].state.file) faltantes.push(k + 1);
      }
      if (faltantes.length > 0) {
        err.textContent = "Cargue el documento corregido del ítem " + faltantes.join(", ") + ".";
        err.classList.add("is-visible");
        return;
      }
      if (!confirm.querySelector("input").checked) {
        err.textContent = "Debe confirmar que atiende todas las observaciones.";
        err.classList.add("is-visible");
        return;
      }
      var post = {
        expediente: expedienteFromDraft(),
        items: items.length,
        reingreso: "EXP-2026-000184/R1",
        fecha: new Date().toISOString().slice(0, 10),
        estadoAnterior: "CON OBSERVACIONES",
        estadoNuevo: "EN ANÁLISIS",
      };
      if (global.tm.draft) global.tm.draft.mergeDraft({ subsanacion: post });
      renderConfirm(container, opts, post);
    }
  }

  function expedienteFromDraft() {
    var d = global.tm.draft ? global.tm.draft.getDraft() : {};
    return (d.submitted && d.submitted.expediente) || "EXP-2026-000184";
  }

  function renderConfirm(container, opts, post) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Reingreso enviado", "Su expediente vuelve a análisis"));

    var ok = layout.el("div", "app-alert app-alert--info");
    ok.appendChild(layout.el("span", "app-alert__title", "Subsanación registrada (simulado)"));
    ok.appendChild(layout.el("span", "app-alert__text", "N.o de reingreso: " + post.reingreso));
    inner.appendChild(ok);

    var card = layout.el("div", "detail-card");
    card.appendChild(fila("Expediente", post.expediente));
    card.appendChild(fila("Ítems corregidos", String(post.items)));
    card.appendChild(fila("Estado anterior", post.estadoAnterior));
    card.appendChild(fila("Estado nuevo", post.estadoNuevo));
    card.appendChild(fila("Fecha de reingreso", fmtFecha(post.fecha)));
    inner.appendChild(card);

    var nota = layout.el("p", "seguimiento-note", "El despacho revisará la atención de las observaciones. Puede seguir el avance en el estado del trámite.");
    inner.appendChild(nota);

    var actions = layout.el("div", "auth-actions");
    actions.appendChild(button({ text: "Mis trámites", onClick: function () { if (opts.onNavigate) opts.onNavigate("#/mis-tramites"); } }));
    actions.appendChild(button({ variant: "primary", text: "Ver estado del trámite", onClick: function () { if (opts.onNavigate) opts.onNavigate("#/seguimiento/estado"); } }));
    inner.appendChild(actions);

    container.appendChild(inner);
  }

  function fila(label, value) {
    var row = layout.el("div", "detail-row");
    row.appendChild(layout.el("span", "detail-row__label", label));
    row.appendChild(layout.el("span", "detail-row__value", value == null ? "—" : String(value)));
    return row;
  }

  function renderEmpty(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Subsanación del expediente", "Sin observaciones pendientes"));
    var empty = layout.el("div", "app-empty");
    empty.appendChild(layout.el("p", null, "No tiene observaciones por subsanar."));
    empty.appendChild(button({
      variant: "primary",
      text: "Ver estado del trámite",
      onClick: function () { if (opts.onNavigate) opts.onNavigate("#/seguimiento/estado"); },
    }));
    inner.appendChild(empty);
    container.appendChild(inner);
  }

  function renderLoading(container) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Subsanación del expediente", "Cargando observaciones…"));
    var loading = layout.el("div", "app-loading");
    loading.appendChild(layout.el("span", "spinner"));
    loading.appendChild(layout.el("span", null, "Preparando el formulario de subsanación…"));
    inner.appendChild(loading);
    container.appendChild(inner);
  }

  function renderError(container, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Subsanación del expediente", "No se pudo cargar"));
    var alert = layout.el("div", "app-alert app-alert--warning");
    alert.appendChild(layout.el("span", "app-alert__title", "Ocurrió un problema temporal"));
    alert.appendChild(layout.el("span", "app-alert__text", "No pudimos preparar la subsanación. Intente nuevamente."));
    inner.appendChild(alert);
    var actions = layout.el("div", "toolbar__actions");
    actions.appendChild(button({ variant: "primary", text: "Reintentar", onClick: function () { if (opts.onRetry) opts.onRetry(); } }));
    inner.appendChild(actions);
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

  function renderP21(container, opts) {
    opts = opts || {};

    function show(state) {
      if (state === "carga") {
        renderLoading(container);
        setTimeout(function () { renderForm(container, opts, buildItems()); }, 700);
        return;
      }
      if (state === "error") { renderError(container, { onRetry: function () { show("carga"); } }); return; }
      if (state === "vacio") { renderEmpty(container, opts); return; }
      renderForm(container, opts, buildItems());
    }

    opts.onDemoState = show;
    show("carga");
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p21 = { renderP21: renderP21, buildItems: buildItems };
})(window);

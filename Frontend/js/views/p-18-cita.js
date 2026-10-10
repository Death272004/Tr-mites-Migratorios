/**
 * P-18 — Reserva de cita (simulado).
 * Calendario semanal ficticio, selección de sede y hora, confirmación con
 * código y QR de la cita. Requiere haber enviado la solicitud (P-17).
 * Script clásico: expone `tm.views.p18.renderP18`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var button = global.tm.ui.button;
  var draft = global.tm.draft;
  var confirmModal = global.tm.ui.confirmModal;

  var ROUTE = "#/solicitud/cita";
  var SEDES = ["Oficina Central — Ciudad de Panamá", "Sede Regional de Colón", "Sede Regional de Chiriquí", "Sede Regional de Herrera"];
  var HORAS = ["08:00", "09:00", "10:00", "11:00", "13:30", "14:30", "15:30"];

  function dias() {
    var out = [];
    var base = new Date();
    var d = new Date(base.getTime() + 24 * 3600 * 1000);
    while (out.length < 5) {
      if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d.getTime()));
      d = new Date(d.getTime() + 24 * 3600 * 1000);
    }
    return out;
  }

  function fmtISO(dt) { return dt.toISOString().slice(0, 10); }

  function renderConfirm(container, cita, opts) {
    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Cita confirmada", "Preséntese con su pasaporte y el comprobante de la cita"));

    var ok = layout.el("div", "app-alert app-alert--info");
    ok.appendChild(layout.el("span", "app-alert__title", "Su cita quedó reservada (simulado)"));
    ok.appendChild(layout.el("span", "app-alert__text", "Código de cita: " + cita.codigo));
    inner.appendChild(ok);

    var card = layout.el("div", "detail-card");
    card.appendChild(fila("Fecha", cita.fecha));
    card.appendChild(fila("Hora", cita.hora));
    card.appendChild(fila("Sede", cita.sede));
    card.appendChild(fila("Expediente", cita.expediente));
    card.appendChild(fila("Motivo", cita.motivo));
    inner.appendChild(card);

    var qrWrap = layout.el("div", "qr-box");
    var canvas = layout.el("canvas", "signature__canvas");
    canvas.width = 180; canvas.height = 180;
    canvas.style.width = "180px"; canvas.style.height = "180px";
    drawQR(canvas, cita.codigo);
    qrWrap.appendChild(canvas);
    qrWrap.appendChild(layout.el("span", "detail-row__value", cita.codigo));
    qrWrap.appendChild(layout.el("span", "form-field__help", "QR simulado para el check-in"));
    inner.appendChild(qrWrap);

    var nota = layout.el("p", "wizard-summary", "Puede consultar o reprogramar desde Mis trámites (P-19). No olvide cancelar con anticipación si no puede asistir.");
    inner.appendChild(nota);

    var actions = layout.el("div", "auth-actions");
    actions.appendChild(button({ text: "Reprogramar", onClick: function () { draft.mergeDraft({ cita: null }); renderP18(container, opts); } }));
    actions.appendChild(button({ variant: "primary", text: "Ir a mis trámites", onClick: function () { draft.clearDraft(); if (opts.onNavigate) opts.onNavigate("#/mis-tramites"); } }));
    actions.appendChild(button({ text: "Descargar", onClick: function () { window.print(); } }));
    inner.appendChild(actions);

    container.appendChild(inner);
  }

  function fila(label, value) {
    var row = layout.el("div", "detail-row");
    row.appendChild(layout.el("span", "detail-row__label", label));
    row.appendChild(layout.el("span", "detail-row__value", value == null ? "—" : String(value)));
    return row;
  }

  function drawQR(canvas, seed) {
    var ctx = canvas.getContext("2d");
    var n = 21, size = canvas.width, cell = size / n;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, size, size);
    var h = 0;
    for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    function rnd() { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; }
    ctx.fillStyle = "#1f2733";
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n; x++) {
        var finder = (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
        var on;
        if (finder) {
          var fx = x < 7 ? x : x - (n - 7);
          var fy = y < 7 ? y : y - (n - 7);
          on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
        } else { on = rnd() > 0.5; }
        if (on) ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }

  function renderP18(container, opts) {
    opts = opts || {};
    var d = draft.getDraft();

    if (d.cita) { renderConfirm(container, d.cita, opts); return; }

    layout.clear(container);
    var inner = layout.el("div", "app-content__inner");
    inner.appendChild(layout.pageHeader("Reservar cita", "Seleccione día, hora y sede"));
    if (!d.submitted) {
      var warn = layout.el("div", "app-alert app-alert--warning");
      warn.appendChild(layout.el("span", "app-alert__title", "Aún no ha enviado la solicitud"));
      warn.appendChild(layout.el("span", "app-alert__text", "Puede reservar la cita cuando desee, pero se recomienda enviar la solicitud primero (P-17)."));
      inner.appendChild(warn);
    }

    var form = layout.el("div", "card");
    var sedes = sedeFieldWrap();
    var selSede = layout.el("select", "form-field__select");
    selSede.id = "sede";
    for (var s = 0; s < SEDES.length; s++) {
      var o = layout.el("option", null, SEDES[s]);
      o.value = SEDES[s];
      selSede.appendChild(o);
    }
    sedes.appendChild(selSede);
    form.appendChild(sedes);

    var dayLabel = layout.el("p", "wizard-section-title", "Día disponible");
    form.appendChild(dayLabel);
    var dayRow = layout.el("div", "radio-group");
    var dayInputs = [];
    var ds = dias();
    for (var i = 0; i < ds.length; i++) {
      var l = layout.el("label", "cita-day");
      var input = layout.el("input");
      input.type = "radio";
      input.name = "dia";
      input.value = fmtISO(ds[i]);
      if (i === 0) input.checked = true;
      var txt = ds[i].toLocaleDateString("es-PA", { weekday: "short", day: "2-digit", month: "short" });
      l.appendChild(input);
      l.appendChild(layout.el("span", null, txt));
      dayRow.appendChild(l);
      dayInputs.push(input);
    }
    form.appendChild(dayRow);

    form.appendChild(layout.el("p", "wizard-section-title", "Hora disponible"));
    var hourRow = layout.el("div", "radio-group");
    var hourInputs = [];
    for (var h = 0; h < HORAS.length; h++) {
      var lh = layout.el("label", "cita-hour");
      var ih = layout.el("input");
      ih.type = "radio";
      ih.name = "hora";
      ih.value = HORAS[h];
      if (h === 0) ih.checked = true;
      lh.appendChild(ih);
      lh.appendChild(layout.el("span", null, HORAS[h]));
      hourRow.appendChild(lh);
      hourInputs.push(ih);
    }
    form.appendChild(hourRow);

    var err = layout.el("div", "auth-error", "");
    err.setAttribute("aria-live", "polite");
    form.appendChild(err);

    var actions = layout.el("div", "auth-actions");
    actions.appendChild(button({ text: "Volver", onClick: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/resumen"); } }));
    actions.appendChild(button({
      variant: "primary",
      text: "Confirmar cita",
      onClick: function () {
        err.textContent = ""; err.classList.remove("is-visible");
        var dia = (dayInputs.filter(function (x) { return x.checked; })[0] || {}).value;
        var hora = (hourInputs.filter(function (x) { return x.checked; })[0] || {}).value;
        if (!selSede.value || !dia || !hora) {
          err.textContent = "Seleccione sede, día y hora.";
          err.classList.add("is-visible");
          return;
        }
        var cita = {
          sede: selSede.value,
          fecha: dia,
          hora: hora,
          expediente: (d.submitted && d.submitted.expediente) || "Por asignar",
          motivo: "Registro de extranjería / entrega y verificación de documentos",
          codigo: "CITA-" + dia.replace(/-/g, "") + "-" + hora.replace(":", "") + "-" + Math.floor(100 + Math.random() * 900),
        };
        confirmModal("Confirmar cita", "¿Confirma la reserva para el " + dia + " a las " + hora + "?", {
          onConfirm: function () { draft.mergeDraft({ cita: cita }); renderConfirm(container, cita, opts); },
        });
      },
    }));
    form.appendChild(actions);

    inner.appendChild(form);
    container.appendChild(inner);
  }

  function sedeFieldWrap() {
    var wrap = layout.el("div", "form-field");
    var lbl = layout.el("label", "form-field__label", "Sede");
    lbl.setAttribute("for", "sede");
    wrap.appendChild(lbl);
    return wrap;
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p18 = { renderP18: renderP18 };
})(window);
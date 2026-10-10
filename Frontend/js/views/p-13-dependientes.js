/**
 * P-13 Paso 5 — Dependientes.
 * Bloque repetible por cada dependiente (cónyuge, hijos, padres u otros).
 * Si el trámite no contempla dependientes, se puede continuar sin agregar.
 * Script clásico: expone `tm.views.p13.renderP13`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var wizard = global.tm.wizard;
  var draft = global.tm.draft;
  var data = global.tm.data;

  var ROUTE = "#/solicitud/paso-5";
  var seq = 0;

  function byId(id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; }

  function dependentCard(list, saved) {
    seq += 1;
    var idx = seq;
    var card = layout.el("div", "card dependent-card");
    card.dataset.idx = String(idx);

    var head = layout.el("div", "dependent-card__head");
    head.appendChild(layout.el("h4", "dependent-card__title", "Dependiente " + idx));
    var remove = layout.el("button", "btn", "Quitar");
    remove.type = "button";
    remove.addEventListener("click", function () { list.removeChild(card); });
    head.appendChild(remove);
    card.appendChild(head);

    var grid = layout.el("div", "wizard-grid");
    var p = "dep" + idx + "_";
    grid.appendChild(field.fieldSelect({
      id: p + "parentesco", label: "Parentesco con el solicitante",
      options: [{ value: "", label: "Seleccione…" }, { value: "CONYUGE", label: "Cónyuge" }, { value: "HIJO", label: "Hijo(a)" }, { value: "PADRE_MADRE", label: "Padre/Madre" }, { value: "OTRO", label: "Otro" }],
      value: saved ? saved.parentesco : "", required: true,
    }));
    grid.appendChild(field.fieldText({ id: p + "nombres", label: "Nombres y apellidos completos", value: saved ? saved.nombres : "", required: true }));
    grid.appendChild(field.fieldDate({ id: p + "fechaNacimiento", label: "Fecha de nacimiento", value: saved ? saved.fechaNacimiento : "", required: true }));
    grid.appendChild(field.fieldSelect({ id: p + "nacionalidad", label: "Nacionalidad", options: data.paisOptions("Seleccione…"), value: saved ? saved.nacionalidad : "", required: true }));
    grid.appendChild(field.fieldText({ id: p + "tipoDoc", label: "Tipo de documento", value: saved ? saved.tipoDoc : "", required: true }));
    grid.appendChild(field.fieldText({ id: p + "numDoc", label: "Número de documento", value: saved ? saved.numDoc : "", required: true }));
    grid.appendChild(field.fieldSelect({
      id: p + "sexo", label: "Sexo",
      options: [{ value: "", label: "Seleccione…" }, { value: "F", label: "Femenino" }, { value: "M", label: "Masculino" }],
      value: saved ? saved.sexo : "",
    }));
    card.appendChild(grid);

    var files = layout.el("div", "wizard-grid");
    files.appendChild(global.tm.ui.fileUpload({ id: p + "certificado", label: "Certificado de matrimonio / nacimiento / tutela", accept: ".pdf,.jpg,.jpeg,.png", helpText: "Obtenible del Registro Civil (TE) a futuro [A]." }));
    files.appendChild(global.tm.ui.fileUpload({ id: p + "carta", label: "Carta de responsabilidad y repatriación notariada", accept: ".pdf,.jpg,.jpeg,.png" }));
    card.appendChild(files);

    return card;
  }

  function renderP13(container, opts) {
    opts = opts || {};
    var body = wizard.frame(container, ROUTE);
    var saved = draft.getDraft().dependientes || [];

    var intro = layout.el("p", "wizard-summary", "Agregue cada dependiente. Si su trámite no incluye dependientes, puede continuar sin agregar ninguno.");
    body.appendChild(intro);

    var actions = layout.el("div", "toolbar");
    var aWrap = layout.el("div", "toolbar__actions");
    var addBtn = layout.el("button", "btn btn--primary", "Agregar dependiente");
    addBtn.type = "button";
    aWrap.appendChild(addBtn);
    actions.appendChild(aWrap);
    body.appendChild(actions);

    var list = layout.el("div", "dependent-list");
    body.appendChild(list);

    addBtn.addEventListener("click", function () { list.appendChild(dependentCard(list, null)); });

    for (var i = 0; i < saved.length; i++) list.appendChild(dependentCard(list, saved[i]));

    var err = wizard.errorBox();
    body.appendChild(err);

    body.appendChild(wizard.footer({
      backText: "Volver",
      nextText: saved.length ? "Continuar" : "Continuar sin dependientes",
      onBack: function () { if (opts.onNavigate) opts.onNavigate("#/solicitud/paso-4"); },
      onNext: function () {
        wizard.clearError(err);
        var cards = list.querySelectorAll(".dependent-card");
        var out = [];
        for (var c = 0; c < cards.length; c++) {
          var card = cards[c];
          var idx = card.dataset.idx;
          function g(suffix) { var e = document.getElementById("dep" + idx + "_" + suffix); return e ? e.value.trim() : ""; }
          var item = {
            parentesco: g("parentesco"),
            nombres: g("nombres"),
            fechaNacimiento: g("fechaNacimiento"),
            nacionalidad: g("nacionalidad"),
            tipoDoc: g("tipoDoc"),
            numDoc: g("numDoc"),
            sexo: g("sexo"),
          };
          if (!item.parentesco || !item.nombres || !item.fechaNacimiento || !item.nacionalidad || !item.tipoDoc || !item.numDoc) {
            return wizard.showError(err, "Complete todos los campos obligatorios de cada dependiente.");
          }
          out.push(item);
        }
        draft.mergeDraft({ dependientes: out });
        if (opts.onNavigate) opts.onNavigate(wizard.nextRoute(ROUTE));
      },
    }));
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.p13 = { renderP13: renderP13 };
})(window);
/**
 * signature.js — pad de firma manuscrita digital sobre <canvas> (simulado).
 * Soporta ratón y táctil; expone isDirty() y clear(). El trazo no se
 * transmite a ningún servidor. Script clásico: expone `tm.ui.signaturePad`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;

  function signaturePad(opts) {
    opts = opts || {};
    var wrapper = layout.el("div", "signature");

    var canvas = layout.el("canvas", "signature__canvas");
    canvas.width = 600;
    canvas.height = 180;
    canvas.setAttribute("aria-label", "Área de firma manuscrita");

    var ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1f2733";

    var drawing = false;
    var dirty = false;

    function pos(ev) {
      var rect = canvas.getBoundingClientRect();
      var p = ev.touches ? ev.touches[0] : ev;
      return { x: (p.clientX - rect.left) * (canvas.width / rect.width), y: (p.clientY - rect.top) * (canvas.height / rect.height) };
    }
    function start(ev) {
      ev.preventDefault();
      drawing = true;
      var pt = pos(ev);
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
    }
    function draw(ev) {
      if (!drawing) return;
      ev.preventDefault();
      var pt = pos(ev);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      dirty = true;
    }
    function end() { drawing = false; }

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", end);

    wrapper.appendChild(canvas);

    var actions = layout.el("div", "signature__actions");
    var clear = layout.el("button", "btn", "Limpiar");
    clear.type = "button";
    clear.addEventListener("click", function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dirty = false;
    });
    actions.appendChild(clear);
    if (opts.helpText) actions.appendChild(layout.el("span", "form-field__help", opts.helpText));
    wrapper.appendChild(actions);

    wrapper.isDirty = function () { return dirty; };
    return wrapper;
  }

  global.tm.ui.signaturePad = signaturePad;
})(window);
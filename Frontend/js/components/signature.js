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

    // Firma de demostración para el botón «Autollenar». Se dibuja
    // directamente sobre el mismo canvas y marca el pad como usado, igual que
    // una firma hecha con el ratón o el touchpad.
    wrapper.fillDemo = function () {
      if (dirty) return false;
      ctx.save();
      ctx.strokeStyle = "#1f2733";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(74, 112);
      ctx.bezierCurveTo(96, 42, 104, 142, 132, 93);
      ctx.bezierCurveTo(150, 58, 154, 128, 176, 96);
      ctx.bezierCurveTo(205, 58, 218, 132, 238, 94);
      ctx.bezierCurveTo(262, 60, 274, 126, 302, 97);
      ctx.bezierCurveTo(333, 68, 358, 116, 386, 91);
      ctx.bezierCurveTo(418, 62, 440, 120, 472, 96);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(92, 130);
      ctx.quadraticCurveTo(278, 151, 500, 125);
      ctx.stroke();
      ctx.restore();
      dirty = true;
      return true;
    };

    wrapper.isDirty = function () { return dirty; };
    return wrapper;
  }

  global.tm.ui.signaturePad = signaturePad;
})(window);
/**
 * docs.js — documentos adjuntos de la solicitud en curso.
 *
 * Guarda el File de cada requisito en memoria, con respaldo en IndexedDB para
 * que una recarga de página no los pierda (nunca en sessionStorage), de modo que
 * el ciudadano pueda adjuntar cada documento por separado, verlo, descargarlo y
 * conservarlo al moverse entre los pasos del asistente. Al enviar la solicitud,
 * `pending()` entrega los archivos con su tipo documental para la carga multipart.
 *
 * Incluye la ficha visual de documento (`card`), la vista previa en modal, la
 * descarga individual y la descarga general en un único .zip (sin compresión).
 * Script clásico: expone `window.tm.docs`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;

  var MAX_BYTES = 10 * 1024 * 1024; // límite de negocio del backend (10 MB)
  var ACCEPT = ".pdf,.jpg,.jpeg,.png";
  var TIPOS = { "application/pdf": 1, "image/jpeg": 1, "image/png": 1 };

  // clave → { key, grupo, label, tipoDocumental, file }
  var store = {};

  /* ------------------------------------------------------------------ */
  /* Respaldo local                                                      */
  /* ------------------------------------------------------------------ */
  // Los archivos se respaldan en IndexedDB del navegador para no perderlos si
  // se recarga la página a mitad de la solicitud. Es solo un respaldo: si el
  // navegador no lo permite, todo sigue funcionando en memoria. Se borra al
  // enviar la solicitud, al empezar una nueva y al cerrar sesión.
  var DB_NAME = "tm-documentos";
  var DB_STORE = "adjuntos";
  var dbPromise = null;

  function db() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve) {
      try {
        if (!global.indexedDB) { resolve(null); return; }
        var req = global.indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = function () { req.result.createObjectStore(DB_STORE, { keyPath: "key" }); };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
        req.onblocked = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
    return dbPromise;
  }

  function persist(fn) {
    db().then(function (conexion) {
      if (!conexion) return;
      try { fn(conexion.transaction(DB_STORE, "readwrite").objectStore(DB_STORE)); } catch (e) { /* respaldo no disponible */ }
    });
  }

  /** Recupera los adjuntos respaldados. Se espera antes del primer render. */
  function restore() {
    return db().then(function (conexion) {
      if (!conexion) return 0;
      return new Promise(function (resolve) {
        try {
          var req = conexion.transaction(DB_STORE, "readonly").objectStore(DB_STORE).getAll();
          req.onsuccess = function () {
            (req.result || []).forEach(function (e) { if (e && e.key && e.file && !store[e.key]) store[e.key] = e; });
            resolve(Object.keys(store).length);
          };
          req.onerror = function () { resolve(0); };
        } catch (e) { resolve(0); }
      });
    });
  }

  function set(key, entry) {
    store[key] = {
      key: key,
      grupo: entry.grupo || "requisitos",
      label: entry.label || "Documento",
      tipoDocumental: entry.tipoDocumental || null,
      file: entry.file,
    };
    var copia = store[key];
    persist(function (os) { os.put(copia); });
    return store[key];
  }

  function get(key) { return store[key] || null; }

  function remove(key) {
    delete store[key];
    persist(function (os) { os.delete(key); });
  }

  function list(grupo) {
    var out = [];
    for (var k in store) {
      if (!Object.prototype.hasOwnProperty.call(store, k)) continue;
      if (!grupo || store[k].grupo === grupo) out.push(store[k]);
    }
    return out;
  }

  function clear(grupo) {
    if (!grupo) {
      store = {};
      persist(function (os) { os.clear(); });
      return;
    }
    var claves = [];
    for (var k in store) {
      if (Object.prototype.hasOwnProperty.call(store, k) && store[k].grupo === grupo) claves.push(k);
    }
    claves.forEach(function (clave) { delete store[clave]; });
    persist(function (os) { claves.forEach(function (clave) { os.delete(clave); }); });
  }

  /** Archivos listos para la carga al backend (solo los que tienen tipo documental). */
  function pending() {
    return list().filter(function (e) { return e.file && e.tipoDocumental; })
      .map(function (e) { return { file: e.file, tipoDocumental: e.tipoDocumental, label: e.label }; });
  }

  function sizeLabel(bytes) {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return Math.max(1, Math.round(bytes / 1024)) + " KB";
  }

  function validate(file) {
    if (!file) return "Seleccione un archivo.";
    var ext = /\.(pdf|jpe?g|png)$/i.test(file.name || "");
    if (!TIPOS[file.type] && !ext) return "Formato no admitido. Use PDF, JPG o PNG.";
    if (file.size > MAX_BYTES) return "El archivo supera el máximo de 10 MB.";
    if (file.size === 0) return "El archivo está vacío.";
    return null;
  }

  function esImagen(file) { return /^image\//.test(file.type) || /\.(jpe?g|png)$/i.test(file.name); }
  function esPdf(file) { return file.type === "application/pdf" || /\.pdf$/i.test(file.name); }

  /* ------------------------------------------------------------------ */
  /* Descarga                                                            */
  /* ------------------------------------------------------------------ */

  function saveBlob(blob, nombre) {
    var url = global.URL.createObjectURL(blob);
    var a = global.document.createElement("a");
    a.href = url;
    a.download = nombre;
    a.rel = "noopener";
    global.document.body.appendChild(a);
    a.click();
    a.remove();
    global.setTimeout(function () { global.URL.revokeObjectURL(url); }, 4000);
  }

  function download(entry) {
    if (entry && entry.file) saveBlob(entry.file, entry.file.name);
  }

  var CRC_TABLE = null;
  function crc32(bytes) {
    if (!CRC_TABLE) {
      CRC_TABLE = new Uint32Array(256);
      for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        CRC_TABLE[n] = c >>> 0;
      }
    }
    var crc = 0xffffffff;
    for (var i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function slug(texto) {
    return String(texto || "documento")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      .slice(0, 40).toLowerCase() || "documento";
  }

  function extension(nombre) {
    var m = /\.[A-Za-z0-9]{1,5}$/.exec(nombre || "");
    return m ? m[0].toLowerCase() : "";
  }

  /**
   * Arma un .zip «store» (sin compresión) con las entradas `{ nombre, bytes }`.
   * Basta para agrupar la descarga sin sumar una librería al proyecto.
   */
  function buildZip(archivos) {
    var encoder = new global.TextEncoder();
    var ahora = new Date();
    var hora = (ahora.getHours() << 11) | (ahora.getMinutes() << 5) | (ahora.getSeconds() >> 1);
    var fecha = ((ahora.getFullYear() - 1980) << 9) | ((ahora.getMonth() + 1) << 5) | ahora.getDate();
    var partes = [];
    var central = [];
    var offset = 0;

    archivos.forEach(function (a) {
      var nombre = encoder.encode(a.nombre);
      var crc = crc32(a.bytes);
      var local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0x0800, true); // nombres en UTF-8
      local.setUint16(8, 0, true);
      local.setUint16(10, hora, true);
      local.setUint16(12, fecha, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, a.bytes.length, true);
      local.setUint32(22, a.bytes.length, true);
      local.setUint16(26, nombre.length, true);
      local.setUint16(28, 0, true);
      partes.push(local.buffer, nombre, a.bytes);

      var dir = new DataView(new ArrayBuffer(46));
      dir.setUint32(0, 0x02014b50, true);
      dir.setUint16(4, 20, true);
      dir.setUint16(6, 20, true);
      dir.setUint16(8, 0x0800, true);
      dir.setUint16(10, 0, true);
      dir.setUint16(12, hora, true);
      dir.setUint16(14, fecha, true);
      dir.setUint32(16, crc, true);
      dir.setUint32(20, a.bytes.length, true);
      dir.setUint32(24, a.bytes.length, true);
      dir.setUint16(28, nombre.length, true);
      dir.setUint32(42, offset, true);
      central.push(dir.buffer, nombre);

      offset += 30 + nombre.length + a.bytes.length;
    });

    var tamanoCentral = 0;
    central.forEach(function (p) { tamanoCentral += p.byteLength; });
    var fin = new DataView(new ArrayBuffer(22));
    fin.setUint32(0, 0x06054b50, true);
    fin.setUint16(8, archivos.length, true);
    fin.setUint16(10, archivos.length, true);
    fin.setUint32(12, tamanoCentral, true);
    fin.setUint32(16, offset, true);

    return new global.Blob(partes.concat(central, [fin.buffer]), { type: "application/zip" });
  }

  function readBytes(file) {
    if (file.arrayBuffer) return file.arrayBuffer().then(function (b) { return new Uint8Array(b); });
    return new Promise(function (resolve, reject) {
      var reader = new global.FileReader();
      reader.onload = function () { resolve(new Uint8Array(reader.result)); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsArrayBuffer(file);
    });
  }

  /** Descarga todos los documentos de una vez: un archivo directo o un único .zip. */
  function downloadAll(entries, nombreZip) {
    entries = (entries || []).filter(function (e) { return e && e.file; });
    if (!entries.length) return Promise.resolve(0);
    if (entries.length === 1) { download(entries[0]); return Promise.resolve(1); }
    return Promise.all(entries.map(function (e) { return readBytes(e.file); })).then(function (buffers) {
      var archivos = buffers.map(function (bytes, i) {
        var e = entries[i];
        var numero = String(i + 1).padStart(2, "0");
        return { nombre: numero + "-" + slug(e.label) + extension(e.file.name), bytes: bytes };
      });
      saveBlob(buildZip(archivos), nombreZip || "documentos-solicitud.zip");
      return entries.length;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Vista previa                                                        */
  /* ------------------------------------------------------------------ */

  function preview(entry) {
    if (!entry || !entry.file || !global.tm.ui.openModal) return;
    var file = entry.file;
    var url = global.URL.createObjectURL(file);
    var body = layout.el("div", "doc-preview");
    body.appendChild(layout.el("p", "doc-preview__meta", file.name + " · " + sizeLabel(file.size)));

    if (esImagen(file)) {
      var img = layout.el("img", "doc-preview__image");
      img.src = url;
      img.alt = "Vista del documento: " + entry.label;
      body.appendChild(img);
    } else if (esPdf(file)) {
      var frame = layout.el("iframe", "doc-preview__frame");
      frame.src = url;
      frame.title = "Vista del documento: " + entry.label;
      body.appendChild(frame);
    } else {
      body.appendChild(layout.el("p", "doc-preview__empty", "Este tipo de archivo no tiene vista previa. Puede descargarlo para revisarlo."));
    }

    var actions = layout.el("div", "modal__actions");
    var descargar = layout.el("button", "btn", "Descargar");
    descargar.type = "button";
    descargar.addEventListener("click", function () { download(entry); });
    var cerrar = layout.el("button", "btn btn--primary", "Cerrar");
    cerrar.type = "button";
    cerrar.addEventListener("click", function () { global.tm.ui.closeModal(); });
    actions.appendChild(descargar);
    actions.appendChild(cerrar);

    var modal = global.tm.ui.openModal({ title: entry.label, body: body, actions: actions, className: "modal--preview" });
    modal.setOnClose(function () { global.URL.revokeObjectURL(url); });
  }

  /* ------------------------------------------------------------------ */
  /* Ficha de documento                                                  */
  /* ------------------------------------------------------------------ */

  // Iconos de las acciones de un documento (trazos sobre una cuadrícula de 24).
  var ICONOS = {
    // Ojo: vista previa
    ojo: ["M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
    // Carpeta con flecha hacia abajo: descargar
    descarga: ["M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M12 10v6", "M9.5 13.5 12 16l2.5-2.5"],
    // Equis: quitar
    equis: ["M6 6l12 12", "M18 6 6 18"],
  };

  function svgIcon(nombre) {
    var NS = "http://www.w3.org/2000/svg";
    var svg = global.document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    (ICONOS[nombre] || []).forEach(function (d) {
      var path = global.document.createElementNS(NS, "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    });
    return svg;
  }

  /**
   * Ficha de un documento: nombre, prioridad y su propia carga con vista previa,
   * descarga y retiro (botones de icono).
   *   opts.key            clave única en el almacén
   *   opts.label          nombre del requisito
   *   opts.grupo          "requisitos" | "pago" | …
   *   opts.tipoDocumental código del backend (o null)
   *   opts.prioritario    true | false | undefined (sin distintivo)
   *   opts.nota           texto de apoyo
   *   opts.informativo    texto: la ficha no admite carga (p. ej. verificación automática)
   *   opts.etiqueta       { text, tone } distintivo alterno para fichas informativas
   *   opts.onChange       function(entry|null)
   */
  function card(opts) {
    opts = opts || {};
    var li = layout.el(opts.tag || "li", "doc-card");
    li.setAttribute("data-doc-key", opts.key || "");

    var head = layout.el("div", "doc-card__head");
    head.appendChild(layout.el("span", "doc-card__name", opts.label || "Documento"));
    if (opts.etiqueta) {
      head.appendChild(layout.el("span", "badge badge--" + (opts.etiqueta.tone || "info") + " doc-card__priority", opts.etiqueta.text));
    } else if (opts.prioritario === true) {
      head.appendChild(layout.el("span", "badge badge--danger doc-card__priority", "Prioritario"));
    } else if (opts.prioritario === false) {
      head.appendChild(layout.el("span", "badge badge--info doc-card__priority", "No prioritario"));
    }
    li.appendChild(head);

    if (opts.nota) li.appendChild(layout.el("p", "doc-card__note", opts.nota));

    if (opts.informativo) {
      li.classList.add("doc-card--info");
      li.appendChild(layout.el("p", "doc-card__file", opts.informativo));
      return li;
    }

    var fileLine = layout.el("p", "doc-card__file", "");
    fileLine.setAttribute("aria-live", "polite");
    li.appendChild(fileLine);

    var error = layout.el("p", "doc-card__error", "");
    error.setAttribute("role", "alert");
    li.appendChild(error);

    var actions = layout.el("div", "doc-card__actions");
    var input = layout.el("input", "doc-card__input");
    input.type = "file";
    input.accept = opts.accept || ACCEPT;
    input.hidden = true;
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");

    function boton(clase, texto, ariaLabel, onClick, icono) {
      var b = layout.el("button", clase, icono ? "" : texto);
      b.type = "button";
      b.setAttribute("aria-label", ariaLabel);
      if (icono) {
        // Botón de solo icono: el nombre accesible va en aria-label y el title sirve de ayuda al pasar el cursor.
        b.title = texto;
        b.appendChild(svgIcon(icono));
      }
      b.addEventListener("click", onClick);
      actions.appendChild(b);
      return b;
    }

    // Para cambiar un archivo se quita y se adjunta de nuevo (no hay «reemplazar»).
    var nombre = opts.label || "documento";
    var adjuntar = boton("btn btn--primary doc-card__attach", "Adjuntar documento", "Adjuntar " + nombre, function () { input.click(); });
    var ver = boton("doc-card__icon doc-card__view", "Vista previa", "Vista previa de " + nombre, function () { preview(get(opts.key)); }, "ojo");
    var bajar = boton("doc-card__icon doc-card__download", "Descargar", "Descargar " + nombre, function () { download(get(opts.key)); }, "descarga");
    var quitar = boton("doc-card__icon doc-card__icon--danger doc-card__remove", "Quitar", "Quitar " + nombre, function () {
      remove(opts.key);
      input.value = "";
      refresh();
      if (opts.onChange) opts.onChange(null);
    }, "equis");
    actions.appendChild(input);
    li.appendChild(actions);

    input.addEventListener("change", function () {
      var f = input.files && input.files[0];
      if (!f) return;
      var problema = validate(f);
      if (problema) {
        error.textContent = problema;
        error.classList.add("is-visible");
        input.value = "";
        return;
      }
      var entry = set(opts.key, { grupo: opts.grupo, label: opts.label, tipoDocumental: opts.tipoDocumental, file: f });
      refresh();
      if (opts.onChange) opts.onChange(entry);
    });

    function refresh() {
      var entry = get(opts.key);
      var cargado = !!(entry && entry.file);
      error.textContent = "";
      error.classList.remove("is-visible");
      li.classList.toggle("is-loaded", cargado);
      fileLine.textContent = cargado
        ? "Adjunto: " + entry.file.name + " · " + sizeLabel(entry.file.size)
        : "Sin archivo adjunto · PDF, JPG o PNG de hasta 10 MB";
      adjuntar.hidden = cargado;
      ver.hidden = !cargado;
      bajar.hidden = !cargado;
      quitar.hidden = !cargado;
    }

    li.refresh = refresh;
    refresh();
    return li;
  }

  global.tm = global.tm || {};
  global.tm.docs = {
    set: set,
    get: get,
    remove: remove,
    list: list,
    clear: clear,
    restore: restore,
    pending: pending,
    sizeLabel: sizeLabel,
    validate: validate,
    preview: preview,
    download: download,
    downloadAll: downloadAll,
    buildZip: buildZip,
    card: card,
  };
})(window);

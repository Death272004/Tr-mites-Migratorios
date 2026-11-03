/**
 * I-07 — Verificaciones de fuentes externas (HU-26).
 * Script clásico: expone `tm.views.i07`.
 */
(function (global) {
  "use strict";

  var layout = global.tm.layout;
  var field = global.tm.ui.field;
  var button = global.tm.ui.button;
  var table = global.tm.ui.table;
  var perms = global.tm.perms;
  var api = global.tm.api;

  var FUENTES = {
    TE: {
      label: "Tribunal Electoral (TE)",
      tipo: "IDENTIDAD",
      finalidad: "IDENTIDAD_DEL_TITULAR",
      resultados: ["COINCIDE", "NO_COINCIDE", "SIN_RESULTADO"],
      positivo: "COINCIDE",
      modos: ["MANUAL_ASISTIDO", "SIMULADO"]
    },
    CSS: {
      label: "Caja de Seguro Social (CSS)",
      tipo: "AFILIACION",
      finalidad: "AFILIACION_DEL_TITULAR",
      resultados: ["VIGENTE", "NO_VIGENTE", "SIN_RESULTADO"],
      positivo: "VIGENTE",
      modos: ["MANUAL_ASISTIDO", "SIMULADO"]
    },
    REGISTRO_PUBLICO: {
      label: "Registro Público",
      tipo: "INFORMACION_REGISTRAL",
      finalidad: "INFORMACION_REGISTRAL",
      resultados: ["CON_REGISTROS", "SIN_RESULTADO"],
      positivo: "CON_REGISTROS",
      modos: ["MANUAL_ASISTIDO", "SIMULADO"]
    },
    DOCUMENTO_EXTERIOR: {
      label: "Documento exterior",
      tipo: "LEGALIZACION",
      finalidad: "VIGENCIA_Y_LEGALIZACION",
      resultados: ["VIGENTE", "NO_VIGENTE", "SIN_RESULTADO"],
      positivo: "VIGENTE",
      modos: ["MANUAL_ASISTIDO"]
    }
  };

  var ESTADOS_BACKEND = {
    PENDIENTE: true,
    ENVIADA: true,
    EN_ATENCION: true,
    RESPONDIDA: true,
    SIN_RESULTADO: true,
    ERROR_TECNICO: true,
    REINTENTO_PROGRAMADO: true
  };

  var ESTADOS_COTEJO = {
    PENDIENTE: true,
    EN_ATENCION: true,
    ERROR_TECNICO: true,
    REINTENTO_PROGRAMADO: true
  };

  var ESTADO_LABELS = {
    PENDIENTE: "Pendiente",
    ENVIADA: "Enviada a la fuente",
    EN_ATENCION: "En atención",
    RESPONDIDA: "Respondida",
    SIN_RESULTADO: "Sin resultado",
    ERROR_TECNICO: "Error técnico",
    REINTENTO_PROGRAMADO: "Reintento programado"
  };

  var RESULTADO_LABELS = {
    COINCIDE: "Coincide",
    NO_COINCIDE: "No coincide",
    VIGENTE: "Vigente",
    NO_VIGENTE: "No vigente",
    CON_REGISTROS: "Con registros",
    SIN_RESULTADO: "Sin resultado"
  };

  var FALLO_LABELS = {
    TIMEOUT: "tiempo de espera agotado",
    ERROR_TECNICO: "error técnico de la fuente",
    RATE_LIMIT: "límite de consultas alcanzado",
    DATOS_INCOMPLETOS: "datos incompletos",
    LLENO: "fuente saturada"
  };

  var ESCENARIOS = [
    { value: "OK", label: "OK (resultado positivo)" },
    { value: "SIN_RESULTADO", label: "Sin resultado" },
    { value: "ERROR_TECNICO", label: "Error técnico" },
    { value: "TIMEOUT", label: "Timeout" },
    { value: "RATE_LIMIT", label: "Límite de consultas" },
    { value: "DATOS_INCOMPLETOS", label: "Datos incompletos" },
    { value: "LLENO", label: "Fuente saturada" }
  ];

  var FALLBACK = {
    expediente: "EXP-2026-000184",
    tramite: "Residente temporal",
    modo: "manual asistido",
    verificaciones: []
  };

  var _escenarioFuente = "OK";

  function esRemoto() {
    return !!(api && api.isOnline && api.isOnline() && !(api.isDemoSession && api.isDemoSession()));
  }

  function esInterno() {
    return perms.can(perms.PERMS.VERIFICAR);
  }

  function expedienteSeleccionado() {
    try {
      return global.tm.expediente && global.tm.expediente.getSelected
        ? global.tm.expediente.getSelected()
        : null;
    } catch (e) {
      return null;
    }
  }

  function datosDemo() {
    try {
      var d = global.tm.fixtures && global.tm.fixtures.data
        ? global.tm.fixtures.data("I-07", "exito")
        : null;
      return d || FALLBACK;
    } catch (e) {
      return FALLBACK;
    }
  }

  function fechaLegible(valor) {
    if (!valor) return "—";
    var s = String(valor);
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      return s.slice(8, 10) + "/" + s.slice(5, 7) + "/" + s.slice(0, 4);
    }
    var d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("es-PA", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function fechaHoy() {
    var d = new Date();
    var mes = String(d.getMonth() + 1);
    var dia = String(d.getDate());
    if (mes.length < 2) mes = "0" + mes;
    if (dia.length < 2) dia = "0" + dia;
    return d.getFullYear() + "-" + mes + "-" + dia;
  }

  function fechaAInstant(valor) {
    if (!valor) return null;
    if (valor === fechaHoy()) return new Date().toISOString();
    var partes = String(valor).split("-");
    if (partes.length !== 3) return null;
    var d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]), 12, 0, 0);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  function normalizarFuente(valor) {
    var s = String(valor || "").toUpperCase();
    if (s.indexOf("REGISTRO") >= 0) return "REGISTRO_PUBLICO";
    if (s.indexOf("DOCUMENTO") >= 0) return "DOCUMENTO_EXTERIOR";
    return s;
  }

  function normalizar(v) {
    v = v || {};
    var fuenteRaw = normalizarFuente(v.fuente || v.fuenteRaw || v.institucion);
    var conf = FUENTES[fuenteRaw] || null;
    var estado = v.estado ? String(v.estado).toUpperCase() : null;
    var esBackend = estado && ESTADOS_BACKEND[estado];
    var resultado = v.resultadoMinimo ? String(v.resultadoMinimo).toUpperCase() : null;
    var ultimoFallo = v.ultimoFallo ? String(v.ultimoFallo).toUpperCase() : null;

    if (!esBackend) {
      var legado = String(v.resultado || "").toUpperCase();
      if (legado === "OK") {
        estado = "RESPONDIDA";
        resultado = conf ? conf.positivo : null;
      } else if (legado === "SIN_RESULTADO") {
        estado = "SIN_RESULTADO";
        resultado = "SIN_RESULTADO";
      } else if (legado === "ERROR_TECNICO" || legado === "TIMEOUT") {
        estado = "ERROR_TECNICO";
        resultado = null;
        ultimoFallo = legado;
      } else {
        estado = "PENDIENTE";
        resultado = null;
      }
    }

    if (estado === "SIN_RESULTADO") resultado = "SIN_RESULTADO";

    return {
      id: v.id || null,
      fuenteRaw: fuenteRaw,
      fuente: conf ? conf.label : (fuenteRaw || "Fuente no identificada"),
      tipoVerificacion: v.tipoVerificacion || (conf ? conf.tipo : "VERIFICACION"),
      finalidad: v.finalidad || (conf ? conf.finalidad : null),
      modo: v.modo || (v.responsable || v.responsableId ? "MANUAL_ASISTIDO" : "SIMULADO"),
      estado: estado || "PENDIENTE",
      resultado: resultado,
      fechaSolicitud: v.fechaSolicitud || null,
      fechaResultado: v.fechaResultado || v.fecha || null,
      referenciaOrigen: v.referenciaOrigen || v.referencia || null,
      responsableId: v.responsableId || v.responsable || null,
      nota: v.nota || null,
      intentos: Number(v.intentos) || 0,
      proximoIntento: v.proximoIntento || null,
      ultimoFallo: ultimoFallo,
      correlacionId: v.correlacionId || null
    };
  }

  function etiquetaEstado(v) {
    if (v.estado === "RESPONDIDA" && v.resultado) {
      return RESULTADO_LABELS[v.resultado] || v.resultado;
    }
    return ESTADO_LABELS[v.estado] || v.estado;
  }

  function tonoEstado(v) {
    if (v.estado === "ERROR_TECNICO") return "warning";
    if (v.estado === "SIN_RESULTADO") return "warning";
    if (v.estado === "REINTENTO_PROGRAMADO") return "info";
    if (v.estado === "PENDIENTE" || v.estado === "ENVIADA" || v.estado === "EN_ATENCION") return "info";
    if (v.resultado === "NO_COINCIDE" || v.resultado === "NO_VIGENTE") return "danger";
    if (v.resultado === "COINCIDE" || v.resultado === "VIGENTE" || v.resultado === "CON_REGISTROS") return "success";
    return "info";
  }

  function esPositivo(v) {
    return ["COINCIDE", "VIGENTE", "CON_REGISTROS"].indexOf(v.resultado) >= 0;
  }

  function esNegativo(v) {
    return ["NO_COINCIDE", "NO_VIGENTE"].indexOf(v.resultado) >= 0;
  }

  function puedeCotejar(v) {
    return !!(FUENTES[v.fuenteRaw] && ESTADOS_COTEJO[v.estado]);
  }

  function puedeReintentar(v) {
    return v.modo === "SIMULADO" && v.estado === "REINTENTO_PROGRAMADO" && !!v.id;
  }

  function detalle(v) {
    var partes = [];
    if (v.estado === "ERROR_TECNICO") {
      partes.push("No hubo respuesta válida de la fuente. No cuenta como resultado negativo.");
      if (v.ultimoFallo) {
        partes.push("Último fallo: " + (FALLO_LABELS[v.ultimoFallo] || v.ultimoFallo) + ".");
      }
      if (v.intentos) partes.push("Intentos: " + v.intentos + ".");
      if (v.proximoIntento) partes.push("Próximo intento: " + fechaLegible(v.proximoIntento) + ".");
    } else if (v.estado === "SIN_RESULTADO") {
      partes.push("La fuente respondió, pero no devolvió el dato solicitado.");
    } else if (v.estado === "RESPONDIDA") {
      partes.push(esNegativo(v)
        ? "Resultado negativo confirmado por la fuente."
        : "Resultado positivo confirmado por la fuente.");
    } else if (v.estado === "REINTENTO_PROGRAMADO") {
      partes.push("La consulta falló y se puede reintentar desde esta pantalla.");
      if (v.proximoIntento) partes.push("Próximo intento: " + fechaLegible(v.proximoIntento) + ".");
    } else if (v.estado === "ENVIADA") {
      partes.push("Consulta enviada a la fuente; aún no hay respuesta.");
    } else if (v.estado === "EN_ATENCION") {
      partes.push("En cotejo manual por el despacho.");
    } else {
      partes.push("Pendiente de cotejo manual o envío simulado.");
    }
    return partes.join(" ");
  }

  function responsableLegible(id) {
    if (!id) return "—";
    var s = String(id);
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(s)) return "Usuario " + s.slice(0, 8);
    return s;
  }

  function claveIdempotencia() {
    var rnd = Math.random().toString(36).slice(2, 10);
    return "I07-" + Date.now().toString(36) + "-" + rnd;
  }

  function construirResumen(verifs) {
    var r = { positivas: 0, negativas: 0, tecnicas: 0, sinResultado: 0, pendientes: 0, total: verifs.length };
    for (var i = 0; i < verifs.length; i++) {
      var v = verifs[i];
      if (v.estado === "ERROR_TECNICO") r.tecnicas++;
      else if (v.estado === "SIN_RESULTADO") r.sinResultado++;
      else if (esNegativo(v)) r.negativas++;
      else if (esPositivo(v)) r.positivas++;
      else r.pendientes++;
    }
    return r;
  }

  function renderI07(container, opts) {
    opts = opts || {};
    var estado = {
      expedienteId: null,
      expediente: "",
      tramite: "",
      modo: "",
      verificaciones: [],
      ultimoError: null,
      cargando: false
    };

    function renderLoading() {
      estado.cargando = true;
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader(
        "Verificaciones de fuentes externas",
        "Verificación manual asistida e interoperabilidad"
      ));
      var loading = layout.el("div", "app-loading");
      loading.appendChild(layout.el("span", "spinner"));
      loading.appendChild(layout.el("span", null, "Consultando verificaciones…"));
      inner.appendChild(loading);
      container.appendChild(inner);
    }

    function renderError() {
      estado.cargando = false;
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader(
        "Verificaciones de fuentes externas",
        "No se pudo completar la consulta"
      ));
      var alerta = layout.el("div", "app-alert app-alert--warning");
      alerta.setAttribute("role", "alert");
      alerta.appendChild(layout.el("span", "app-alert__title", "No se pudieron cargar las verificaciones"));
      alerta.appendChild(layout.el("span", "app-alert__text",
        estado.ultimoError && estado.ultimoError.mensajeUsuario
          ? estado.ultimoError.mensajeUsuario
          : "Intente actualizar la pantalla."));
      inner.appendChild(alerta);
      var actions = layout.el("div", "toolbar__actions");
      actions.appendChild(button({
        variant: "primary",
        text: "Reintentar carga",
        onClick: function () { mostrar("carga"); }
      }));
      inner.appendChild(actions);
      container.appendChild(inner);
    }

    function renderEmpty() {
      estado.cargando = false;
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");
      inner.appendChild(layout.pageHeader(
        "Verificaciones de fuentes externas",
        "Verificación manual asistida e interoperabilidad"
      ));
      var empty = layout.el("div", "app-empty");
      empty.appendChild(layout.el("p", null,
        estado.expedienteId
          ? "El expediente " + (estado.expediente || estado.expedienteId) + " aún no tiene verificaciones registradas."
          : "Seleccione o cargue un expediente para consultar sus verificaciones."));
      inner.appendChild(empty);

      var actions = layout.el("div", "toolbar__actions");
      if (esRemoto() && estado.expedienteId && perms.can(perms.PERMS.VERIFICAR)) {
        actions.appendChild(button({
          variant: "primary",
          text: "Preparar verificaciones del expediente",
          onClick: prepararVerificaciones
        }));
      }
      actions.appendChild(button({
        text: "Actualizar",
        onClick: function () { mostrar("carga"); }
      }));
      inner.appendChild(actions);
      container.appendChild(inner);
    }

    function prepararVerificaciones() {
      var ruta = "/expedientes/" + encodeURIComponent(estado.expedienteId) + "/verificaciones/preparacion";
      api.request("POST", ruta, { body: {} }, function (err) {
        if (err) {
          alert(err.mensajeUsuario || "No se pudieron preparar las verificaciones.");
          return;
        }
        mostrar("carga");
      });
    }

    function cargarVerificaciones(callback) {
      var ruta = "/expedientes/" + encodeURIComponent(estado.expedienteId) + "/verificaciones";
      api.request("GET", ruta, { pantalla: "I-07" }, function (err, data) {
        if (err) {
          callback(err);
          return;
        }
        var lista = Array.isArray(data) ? data : [];
        estado.verificaciones = lista.map(normalizar);
        callback(null);
      });
    }

    function cargarExpediente(callback) {
      var seleccionado = expedienteSeleccionado();
      if (seleccionado && seleccionado.id) {
        estado.expedienteId = seleccionado.id;
        estado.expediente = seleccionado.numero || "";
        estado.tramite = seleccionado.tipoTramite || seleccionado.tramite || "";
        estado.modo = seleccionado.modo || "";
        if (estado.expediente) {
          cargarVerificaciones(callback);
          return;
        }
        api.request("GET", "/expedientes/" + encodeURIComponent(seleccionado.id), {}, function (err, exp) {
          if (!err && exp) {
            estado.expediente = exp.numero || exp.id || seleccionado.id;
            estado.tramite = exp.tipoTramite || exp.tramite || estado.tramite;
            estado.modo = exp.modo || estado.modo;
          } else {
            estado.expediente = seleccionado.id;
          }
          cargarVerificaciones(callback);
        });
        return;
      }

      api.request("GET", "/expedientes?tamano=100", {}, function (err, data) {
        if (err) {
          callback(err);
          return;
        }
        var lista = Array.isArray(data)
          ? data
          : (data && Array.isArray(data.contenido) ? data.contenido : []);
        var elegido = elegirExpediente(lista);
        if (!elegido) {
          estado.verificaciones = [];
          callback(null);
          return;
        }
        estado.expedienteId = elegido.id;
        estado.expediente = elegido.numero || elegido.id;
        estado.tramite = elegido.tipoTramite || elegido.tramite || "";
        estado.modo = elegido.modo || "";
        cargarVerificaciones(callback);
      });
    }

    function elegirExpediente(lista) {
      var preferencia = ["EN_ANALISIS", "ADMITIDO", "RECIBIDO", "CON_OBSERVACIONES", "EN_RESOLUCION"];
      for (var p = 0; p < preferencia.length; p++) {
        for (var i = 0; i < lista.length; i++) {
          if (String(lista[i].estado || "").toUpperCase() === preferencia[p]) return lista[i];
        }
      }
      return lista.length ? lista[0] : null;
    }

    function cargar(callback) {
      if (!esRemoto()) {
        var demo = datosDemo();
        estado.expediente = demo.expediente || FALLBACK.expediente;
        estado.tramite = demo.tramite || FALLBACK.tramite;
        estado.modo = demo.modo || FALLBACK.modo;
        estado.verificaciones = Array.isArray(demo.verificaciones) ? demo.verificaciones.map(normalizar) : [];
        callback(null);
        return;
      }
      cargarExpediente(callback);
    }

    function mostrar(uiState) {
      try {
        if (global.tm.fixtures && global.tm.fixtures.setScenario) {
          global.tm.fixtures.setScenario(uiState);
        }
      } catch (e) { /* escenario no disponible */ }

      estado.ultimoError = null;

      if (uiState === "error") {
        estado.ultimoError = { mensajeUsuario: "El servicio de verificación no está disponible en este momento." };
        renderError();
        return;
      }
      if (uiState === "vacio") {
        estado.expediente = "";
        estado.verificaciones = [];
        renderEmpty();
        return;
      }

      renderLoading();
      var demora = esRemoto() ? 0 : (uiState === "carga" ? 500 : 150);
      global.setTimeout(function () {
        cargar(function (err) {
          if (err) {
            estado.ultimoError = err;
            renderError();
            return;
          }
          if (!estado.verificaciones.length) {
            renderEmpty();
            return;
          }
          renderContent();
        });
      }, demora);
    }

    function recargar() {
      renderLoading();
      cargar(function (err) {
        if (err) {
          estado.ultimoError = err;
          renderError();
          return;
        }
        if (!estado.verificaciones.length) {
          renderEmpty();
          return;
        }
        renderContent();
      });
    }

    function celdaEstado(v) {
      var wrap = layout.el("div");
      wrap.appendChild(layout.el("span", "badge badge--" + tonoEstado(v), etiquetaEstado(v)));
      if (v.estado === "ERROR_TECNICO") {
        wrap.appendChild(layout.el("span", "form-field__help", "No es un resultado negativo"));
      } else if (v.estado === "SIN_RESULTADO") {
        wrap.appendChild(layout.el("span", "form-field__help", "La fuente no devolvió el dato"));
      }
      return wrap;
    }

    function selectorEscenarioFuente() {
      var wrap = layout.el("div", "toolbar__demo");
      wrap.appendChild(layout.el("label", null, "Escenario de fuente"));
      var sel = layout.el("select");
      sel.setAttribute("aria-label", "Escenario de fuente para simulación");
      for (var i = 0; i < ESCENARIOS.length; i++) {
        var opt = layout.el("option", null, ESCENARIOS[i].label);
        opt.value = ESCENARIOS[i].value;
        if (ESCENARIOS[i].value === _escenarioFuente) opt.selected = true;
        sel.appendChild(opt);
      }
      sel.addEventListener("change", function () { _escenarioFuente = sel.value; });
      wrap.appendChild(sel);
      return wrap;
    }

    function tablaVerificaciones() {
      var headers = [
        { label: "Fuente" },
        { label: "Dato" },
        { label: "Estado / resultado" },
        { label: "Fecha" }
      ];
      if (esInterno()) {
        headers.push({ label: "Modo" }, { label: "Responsable" }, { label: "Detalle" }, { label: "Acciones" });
      }

      var filas = [];
      for (var i = 0; i < estado.verificaciones.length; i++) {
        var v = estado.verificaciones[i];
        var fila = [
          v.fuente,
          v.tipoVerificacion,
          celdaEstado(v),
          fechaLegible(v.fechaResultado || v.fechaSolicitud)
        ];
        if (esInterno()) {
          fila.push(v.modo === "MANUAL_ASISTIDO" ? "Manual asistido" : "Simulado");
          fila.push(responsableLegible(v.responsableId));
          fila.push(detalle(v));
          fila.push(accionesVerificacion(v));
        }
        filas.push(fila);
      }
      return table({ headers: headers, rows: filas, emptyText: "No hay verificaciones registradas" });
    }

    function accionesVerificacion(v) {
      var box = layout.el("div");
      box.style.display = "flex";
      box.style.flexWrap = "wrap";
      box.style.gap = "var(--space-2)";
      box.style.alignItems = "center";

      if (!perms.can(perms.PERMS.VERIFICAR)) {
        box.appendChild(perms.notice(perms.PERMS.VERIFICAR));
        return box;
      }

      if (puedeCotejar(v)) {
        var conf = FUENTES[v.fuenteRaw];
        var sel = layout.el("select", "form-field__select");
        sel.setAttribute("aria-label", "Resultado para " + v.fuente);
        for (var i = 0; i < conf.resultados.length; i++) {
          var opt = layout.el("option", null, RESULTADO_LABELS[conf.resultados[i]] || conf.resultados[i]);
          opt.value = conf.resultados[i];
          sel.appendChild(opt);
        }
        box.appendChild(sel);
        box.appendChild(button({
          text: "Guardar cotejo",
          onClick: function (resultado) {
            return function () { registrarCotejo(v, resultado.value); };
          }(sel)
        }));
      }

      if (puedeReintentar(v)) {
        box.appendChild(button({
          text: "Reintentar",
          onClick: function () { reintentar(v); }
        }));
      }

      if (!puedeCotejar(v) && !puedeReintentar(v)) {
        box.appendChild(layout.el("span", "form-field__help", "Sin acciones disponibles"));
      }
      return box;
    }

    function registrarCotejo(v, resultado) {
      var conf = FUENTES[v.fuenteRaw];
      if (!conf) return;
      var fecha = new Date().toISOString();
      var payload = {
        fuente: v.fuenteRaw,
        tipoVerificacion: v.tipoVerificacion,
        modo: "MANUAL_ASISTIDO",
        finalidad: v.finalidad || conf.finalidad,
        resultadoMinimo: resultado,
        fechaResultado: fecha,
        referenciaOrigen: v.referenciaOrigen || null,
        nota: v.nota || null
      };

      if (!esRemoto()) {
        aplicarCotejoLocal(v, resultado, fecha);
        renderContent();
        return;
      }

      var ruta = "/expedientes/" + encodeURIComponent(estado.expedienteId) + "/verificaciones";
      api.request("POST", ruta, {
        body: payload,
        headers: {
          "Idempotency-Key": claveIdempotencia(),
          "X-Scenario": "OK"
        }
      }, function (err) {
        if (err) {
          alert(err.mensajeUsuario || "No se pudo guardar el cotejo.");
          return;
        }
        recargar();
      });
    }

    function aplicarCotejoLocal(v, resultado, fecha) {
      v.modo = "MANUAL_ASISTIDO";
      v.resultado = resultado;
      v.estado = resultado === "SIN_RESULTADO" ? "SIN_RESULTADO" : "RESPONDIDA";
      v.fechaResultado = fecha;
      v.ultimoFallo = null;
      v.proximoIntento = null;
      v.responsableId = v.responsableId || "demo-funcionario";
    }

    function reintentar(v) {
      if (!esRemoto()) {
        v.intentos = (v.intentos || 0) + 1;
        if (_escenarioFuente === "OK") {
          var conf = FUENTES[v.fuenteRaw];
          v.estado = "RESPONDIDA";
          v.resultado = conf ? conf.positivo : null;
          v.fechaResultado = new Date().toISOString();
          v.ultimoFallo = null;
          v.proximoIntento = null;
        } else if (_escenarioFuente === "SIN_RESULTADO") {
          v.estado = "SIN_RESULTADO";
          v.resultado = "SIN_RESULTADO";
          v.fechaResultado = new Date().toISOString();
          v.ultimoFallo = null;
          v.proximoIntento = null;
        } else if (v.intentos < 2) {
          v.estado = "REINTENTO_PROGRAMADO";
          v.resultado = null;
          v.ultimoFallo = _escenarioFuente;
          v.proximoIntento = new Date(Date.now() + 3600000).toISOString();
        } else {
          v.estado = "ERROR_TECNICO";
          v.resultado = null;
          v.ultimoFallo = _escenarioFuente;
          v.proximoIntento = null;
        }
        renderContent();
        return;
      }

      var ruta = "/expedientes/" + encodeURIComponent(estado.expedienteId) +
        "/verificaciones/" + encodeURIComponent(v.id) + "/reintento";
      api.request("POST", ruta, {
        body: {},
        headers: {
          "Idempotency-Key": claveIdempotencia(),
          "X-Scenario": _escenarioFuente
        }
      }, function (err) {
        if (err) {
          alert(err.mensajeUsuario || "No se pudo reintentar la verificación.");
          return;
        }
        recargar();
      });
    }

    function formularioVerificacion() {
      if (!perms.can(perms.PERMS.VERIFICAR)) {
        var aviso = layout.el("div", "app-alert app-alert--warning");
        aviso.setAttribute("role", "note");
        aviso.appendChild(layout.el("span", "app-alert__text", "Su rol no permite registrar ni enviar verificaciones."));
        return aviso;
      }

      var card = layout.el("fieldset", "wizard-section");
      card.appendChild(layout.el("legend", "wizard-section-title", "Registrar cotejo o enviar consulta"));
      var body = layout.el("div", "wizard-grid");
      var form = layout.el("form", "wizard-grid");
      form.setAttribute("novalidate", "novalidate");

      var wFuente = field.fieldSelect({
        id: "i07-fuente",
        label: "Fuente",
        options: [
          { value: "TE", label: FUENTES.TE.label },
          { value: "CSS", label: FUENTES.CSS.label },
          { value: "REGISTRO_PUBLICO", label: FUENTES.REGISTRO_PUBLICO.label },
          { value: "DOCUMENTO_EXTERIOR", label: FUENTES.DOCUMENTO_EXTERIOR.label }
        ],
        value: "TE",
        required: true
      });
      var wModo = field.fieldSelect({
        id: "i07-modo",
        label: "Modo",
        options: [
          { value: "MANUAL_ASISTIDO", label: "Manual asistido (registrar resultado)" },
          { value: "SIMULADO", label: "Simulado (forzar escenario)" }
        ],
        value: "MANUAL_ASISTIDO",
        required: true
      });
      var wTipo = field.fieldText({
        id: "i07-tipo",
        label: "Dato a verificar",
        value: FUENTES.TE.tipo,
        disabled: true
      });
      var wFinalidad = field.fieldText({
        id: "i07-finalidad",
        label: "Finalidad",
        value: FUENTES.TE.finalidad,
        disabled: true
      });
      var wFecha = field.fieldDate({
        id: "i07-fecha",
        label: "Fecha del resultado",
        value: fechaHoy(),
        required: true
      });
      var wResultado = field.fieldSelect({
        id: "i07-resultado",
        label: "Resultado",
        options: opcionesResultado("TE"),
        value: "",
        required: true
      });
      var wReferencia = field.fieldText({
        id: "i07-referencia",
        label: "Referencia de origen",
        placeholder: "N.º de consulta, oficio o folio"
      });
      var wNota = field.fieldTextarea({
        id: "i07-nota",
        label: "Nota",
        rows: 3,
        placeholder: "Detalle del cotejo o de la gestión realizada"
      });
      var wEscenario = field.fieldSelect({
        id: "i07-escenario",
        label: "Escenario de la respuesta (solo simulado)",
        options: ESCENARIOS,
        value: _escenarioFuente
      });

      var selFuente = wFuente.querySelector("select");
      var selModo = wModo.querySelector("select");
      var selResultado = wResultado.querySelector("select");
      var selEscenario = wEscenario.querySelector("select");
      var inTipo = wTipo.querySelector("input");
      var inFinalidad = wFinalidad.querySelector("input");
      var inFecha = wFecha.querySelector("input");
      var inReferencia = wReferencia.querySelector("input");
      var inNota = wNota.querySelector("textarea");

      function actualizarFuente() {
        var conf = FUENTES[selFuente.value];
        inTipo.value = conf.tipo;
        inFinalidad.value = conf.finalidad;
        while (selResultado.firstChild) selResultado.removeChild(selResultado.firstChild);
        var opciones = opcionesResultado(selFuente.value);
        for (var i = 0; i < opciones.length; i++) {
          var opt = layout.el("option", null, opciones[i].label);
          opt.value = opciones[i].value;
          selResultado.appendChild(opt);
        }
        var opcionSimulada = selModo.querySelector('option[value="SIMULADO"]');
        var permiteSimulado = conf.modos.indexOf("SIMULADO") >= 0;
        if (opcionSimulada) opcionSimulada.disabled = !permiteSimulado;
        if (!permiteSimulado && selModo.value === "SIMULADO") selModo.value = "MANUAL_ASISTIDO";
        actualizarModo();
      }

      function actualizarModo() {
        var manual = selModo.value === "MANUAL_ASISTIDO";
        wResultado.style.display = manual ? "" : "none";
        wFecha.style.display = manual ? "" : "none";
        wEscenario.style.display = manual ? "none" : "";
      }

      selFuente.addEventListener("change", actualizarFuente);
      selModo.addEventListener("change", actualizarModo);
      selEscenario.addEventListener("change", function () { _escenarioFuente = selEscenario.value; });

      var acciones = layout.el("div", "toolbar__actions");
      acciones.appendChild(button({
        variant: "primary",
        text: "Registrar / enviar",
        type: "submit"
      }));
      acciones.appendChild(button({
        text: "Limpiar",
        onClick: function () {
          form.reset();
          actualizarFuente();
          actualizarModo();
        }
      }));

      form.appendChild(wFuente);
      form.appendChild(wModo);
      form.appendChild(wTipo);
      form.appendChild(wFinalidad);
      form.appendChild(wFecha);
      form.appendChild(wResultado);
      form.appendChild(wReferencia);
      form.appendChild(wNota);
      form.appendChild(wEscenario);
      form.appendChild(acciones);

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var fuente = selFuente.value;
        var conf = FUENTES[fuente];
        var modo = selModo.value;
        var resultado = selResultado.value;
        var fecha = inFecha.value;
        var nota = inNota.value.trim();
        var referencia = inReferencia.value.trim();

        if (conf.modos.indexOf(modo) < 0) {
          alert("La fuente seleccionada no admite el modo " + modo + ".");
          return;
        }

        if (modo === "MANUAL_ASISTIDO") {
          if (!resultado) {
            alert("Seleccione el resultado del cotejo.");
            return;
          }
          if (!fecha) {
            alert("Indique la fecha del resultado.");
            return;
          }
          var instant = fechaAInstant(fecha);
          if (!instant) {
            alert("La fecha del resultado no es válida.");
            return;
          }
          if (fecha > fechaHoy()) {
            alert("La fecha del resultado no puede ser futura.");
            return;
          }
        }

        _escenarioFuente = selEscenario.value;

        var payload = {
          fuente: fuente,
          tipoVerificacion: conf.tipo,
          modo: modo,
          finalidad: conf.finalidad,
          resultadoMinimo: modo === "MANUAL_ASISTIDO" ? resultado : undefined,
          fechaResultado: modo === "MANUAL_ASISTIDO" ? fechaAInstant(fecha) : undefined,
          referenciaOrigen: referencia || undefined,
          nota: nota || undefined
        };

        if (!esRemoto()) {
          aplicarRegistroLocal(payload);
          return;
        }

        var ruta = "/expedientes/" + encodeURIComponent(estado.expedienteId) + "/verificaciones";
        api.request("POST", ruta, {
          body: payload,
          headers: {
            "Idempotency-Key": claveIdempotencia(),
            "X-Scenario": modo === "SIMULADO" ? _escenarioFuente : "OK"
          }
        }, function (err) {
          if (err) {
            alert(err.mensajeUsuario || "No se pudo registrar la verificación.");
            return;
          }
          recargar();
        });
      });

      actualizarFuente();
      actualizarModo();
      body.appendChild(form);
      card.appendChild(body);
      return card;
    }

    function opcionesResultado(fuente) {
      var conf = FUENTES[fuente];
      var out = [{ value: "", label: "Seleccione un resultado" }];
      if (!conf) return out;
      for (var i = 0; i < conf.resultados.length; i++) {
        out.push({
          value: conf.resultados[i],
          label: RESULTADO_LABELS[conf.resultados[i]] || conf.resultados[i]
        });
      }
      return out;
    }

    function aplicarRegistroLocal(payload) {
      var conf = FUENTES[payload.fuente];
      var existente = null;
      for (var i = 0; i < estado.verificaciones.length; i++) {
        var actual = estado.verificaciones[i];
        if (actual.fuenteRaw === payload.fuente &&
            actual.tipoVerificacion === payload.tipoVerificacion &&
            ["RESPONDIDA", "SIN_RESULTADO"].indexOf(actual.estado) < 0) {
          existente = actual;
          break;
        }
      }

      if (payload.modo === "SIMULADO") {
        if (existente && existente.estado !== "PENDIENTE") {
          alert("Ya existe una verificación en curso para esta fuente. Use Reintentar cuando esté disponible.");
          return;
        }
        if (!existente) {
          existente = {
            id: "demo-" + Date.now(),
            fuenteRaw: payload.fuente,
            fuente: conf.label,
            tipoVerificacion: payload.tipoVerificacion,
            finalidad: payload.finalidad,
            modo: "SIMULADO",
            estado: "PENDIENTE",
            resultado: null,
            fechaSolicitud: new Date().toISOString(),
            fechaResultado: null,
            referenciaOrigen: payload.referenciaOrigen || null,
            responsableId: null,
            nota: payload.nota || null,
            intentos: 0,
            proximoIntento: null,
            ultimoFallo: null,
            correlacionId: null
          };
          estado.verificaciones.unshift(existente);
        }
        existente.intentos = (existente.intentos || 0) + 1;
        existente.modo = "SIMULADO";
        if (_escenarioFuente === "OK") {
          existente.estado = "RESPONDIDA";
          existente.resultado = conf.positivo;
          existente.fechaResultado = new Date().toISOString();
          existente.ultimoFallo = null;
        } else if (_escenarioFuente === "SIN_RESULTADO") {
          existente.estado = "SIN_RESULTADO";
          existente.resultado = "SIN_RESULTADO";
          existente.fechaResultado = new Date().toISOString();
          existente.ultimoFallo = null;
        } else if (existente.intentos < 2) {
          existente.estado = "REINTENTO_PROGRAMADO";
          existente.resultado = null;
          existente.ultimoFallo = _escenarioFuente;
          existente.proximoIntento = new Date(Date.now() + 3600000).toISOString();
        } else {
          existente.estado = "ERROR_TECNICO";
          existente.resultado = null;
          existente.ultimoFallo = _escenarioFuente;
          existente.proximoIntento = null;
        }
        renderContent();
        return;
      }

      var fecha = payload.fechaResultado || new Date().toISOString();
      if (existente) {
        aplicarCotejoLocal(existente, payload.resultadoMinimo, fecha);
        existente.referenciaOrigen = payload.referenciaOrigen || existente.referenciaOrigen;
        existente.nota = payload.nota || existente.nota;
      } else {
        estado.verificaciones.unshift(normalizar({
          id: "demo-" + Date.now(),
          fuente: payload.fuente,
          tipoVerificacion: payload.tipoVerificacion,
          modo: "MANUAL_ASISTIDO",
          estado: payload.resultadoMinimo === "SIN_RESULTADO" ? "SIN_RESULTADO" : "RESPONDIDA",
          finalidad: payload.finalidad,
          fechaSolicitud: new Date().toISOString(),
          fechaResultado: fecha,
          resultadoMinimo: payload.resultadoMinimo,
          referenciaOrigen: payload.referenciaOrigen,
          nota: payload.nota,
          responsableId: "demo-funcionario"
        }));
      }
      renderContent();
    }

    function renderContent() {
      estado.cargando = false;
      layout.clear(container);
      var inner = layout.el("div", "app-content__inner");

      inner.appendChild(layout.pageHeader(
        "Verificaciones de fuentes externas",
        "Verificación manual asistida e interoperabilidad"
      ));

      var resumen = construirResumen(estado.verificaciones);
      var toolbar = layout.el("div", "toolbar");
      toolbar.appendChild(layout.el("span", null, ""));
      var toolbarRight = layout.el("div", "toolbar__actions");
      toolbarRight.appendChild(button({
        text: "Actualizar",
        onClick: function () { mostrar("carga"); }
      }));
      if (esInterno()) toolbarRight.appendChild(selectorEscenarioFuente());
      if (!esRemoto()) {
        var demo = layout.el("div", "toolbar__demo");
        demo.appendChild(layout.el("span", null,
          "Modo demo · " + (estado.expediente || FALLBACK.expediente)));
        toolbarRight.appendChild(demo);
      }
      toolbar.appendChild(toolbarRight);
      inner.appendChild(toolbar);

      var grid = layout.el("div", "seguimiento-summary");
      agregarResumen(grid, "Expediente", estado.expediente || estado.expedienteId || "—");
      agregarResumen(grid, "Trámite", estado.tramite || "—");
      agregarResumen(grid, "Modo", estado.modo || "Manual asistido");
      agregarResumen(grid, "Verificaciones", String(resumen.total));
      agregarResumen(grid, "Errores técnicos", String(resumen.tecnicas));
      agregarResumen(grid, "Resultados negativos", String(resumen.negativas));
      inner.appendChild(grid);

      var leyenda = layout.el("div", "app-alert app-alert--info");
      leyenda.appendChild(layout.el("span", "app-alert__title", "Distinción obligatoria (CP-07)"));
      leyenda.appendChild(layout.el("span", "app-alert__text",
        "Un error técnico o timeout nunca se presenta como resultado negativo: la consulta no obtuvo " +
        "respuesta válida y el requisito vuelve a cotejo manual."));
      inner.appendChild(leyenda);

      if (resumen.tecnicas > 0) {
        var alertaTecnica = layout.el("div", "app-alert app-alert--warning");
        alertaTecnica.setAttribute("role", "alert");
        alertaTecnica.appendChild(layout.el("span", "app-alert__title",
          resumen.tecnicas + " error(es) técnico(s) de fuente"));
        alertaTecnica.appendChild(layout.el("span", "app-alert__text",
          "No son resultados negativos: la consulta no obtuvo una respuesta válida. " +
          "Registre el cotejo manual o use Reintentar cuando esté habilitado."));
        inner.appendChild(alertaTecnica);
      }

      if (resumen.negativas > 0) {
        var alertaNegativa = layout.el("div", "app-alert app-alert--danger");
        alertaNegativa.setAttribute("role", "alert");
        alertaNegativa.appendChild(layout.el("span", "app-alert__title",
          resumen.negativas + " resultado(s) negativo(s) confirmado(s)"));
        alertaNegativa.appendChild(layout.el("span", "app-alert__text",
          "La fuente respondió de forma válida. Estos resultados se tratan por separado de los errores técnicos."));
        inner.appendChild(alertaNegativa);
      }

      var block = layout.el("div", "seguimiento-block");
      block.appendChild(layout.el("h2", "seguimiento-block__title", "Verificaciones del expediente"));
      block.appendChild(tablaVerificaciones());
      inner.appendChild(block);

      if (esInterno()) inner.appendChild(formularioVerificacion());

      inner.appendChild(layout.el("p", "seguimiento-note",
        "Modo manual asistido: el funcionario registra el resultado obtenido en la fuente. " +
        "En modo simulado se fuerza un escenario de respuesta para demostración; el reintento solo " +
        "se habilita cuando la verificación simulada quedó en reintento programado. " +
        "Sin consulta masiva: solo con expediente asociado (regla 5). Toda consulta queda en la bitácora (I-16)."));
      container.appendChild(inner);
    }

    function agregarResumen(grid, etiqueta, valor) {
      var item = layout.el("div", "seguimiento-summary__item");
      item.appendChild(layout.el("span", "seguimiento-summary__label", etiqueta));
      item.appendChild(layout.el("span", "seguimiento-summary__value", valor));
      grid.appendChild(item);
    }

    opts.onDemoState = mostrar;
    mostrar(esRemoto()
      ? "carga"
      : (global.tm.fixtures && global.tm.fixtures.scenario
        ? global.tm.fixtures.scenario()
        : "exito"));
  }

  global.tm.views = global.tm.views || {};
  global.tm.views.i07 = { render: renderI07, renderI07: renderI07, FUENTES: FUENTES };
})(window);

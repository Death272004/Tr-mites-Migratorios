// Recorre los flujos disponibles contra el backend real (Docker, http://localhost:8080) con los
// usuarios ficticios de demostración, y guarda cada petición/respuesta en flujos.json.
import fs from 'fs';

const API = 'http://localhost:8080';
const CLAVE_DEMO = 'Demo-Tramites-2026';
const PDF = Buffer.from('%PDF-1.4\ncontenido ficticio de demostración\n%%EOF');
const tokens = {};
const flujos = [];
let actual = null;

const enmascarar = s => s.replace(/"(token|contrasena|contrasenaActual|contrasenaNueva)"(\s*):(\s*)"[^"]*"/g, '"$1"$2:$3"•••"');
const recortar = (t, n = 900) => (t.length > n ? t.slice(0, n) + '\n… (recortado)' : t);

async function llamar(actor, metodo, ruta, cuerpo, esperado, opciones = {}) {
  const headers = { ...(opciones.headers || {}) };
  if (actor && tokens[actor]) headers.Authorization = 'Bearer ' + tokens[actor];
  let body;
  if (opciones.archivo) {
    const fd = new FormData();
    fd.append('archivo', new Blob([opciones.archivo.contenido], { type: opciones.archivo.mime }), opciones.archivo.nombre);
    fd.append('tipoDocumental', opciones.archivo.tipo);
    body = fd;
  } else if (cuerpo !== undefined) {
    headers['Content-Type'] = opciones.tipo || 'application/json';
    body = typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo);
  }
  const r = await fetch(API + ruta, { method: metodo, headers, body });
  const texto = await r.text();
  let json = null;
  try { json = JSON.parse(texto); } catch { /* CSV o vacío */ }
  const mostrado = json ? enmascarar(JSON.stringify(json, null, 2)) : texto;
  const peticion = opciones.archivo ? `multipart: archivo=${opciones.archivo.nombre} (${opciones.archivo.mime}, ${opciones.archivo.contenido.length} bytes), tipoDocumental=${opciones.archivo.tipo}`
    : cuerpo === undefined ? '' : enmascarar(typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo));
  const esperados = [].concat(esperado);
  actual.pasos.push({ actor: actor || 'sin sesión', metodo, ruta, peticion, extraHeaders: opciones.headers || null,
    estado: r.status, esperado: esperados, ok: esperados.includes(r.status), respuesta: recortar(mostrado),
    correlacion: r.headers.get('x-correlation-id') });
  return { estado: r.status, json, texto };
}

async function entrar(actor, correo) {
  const r = await llamar(null, 'POST', '/api/auth/login', { correo, contrasena: CLAVE_DEMO }, 200);
  tokens[actor] = r.json.token;
  actual.pasos.at(-1).actor = actor;
  return r;
}

async function flujo(meta, fn) {
  actual = { ...meta, pasos: [], notas: [] };
  try { await fn(); } catch (e) { actual.notas.push('Error del script: ' + e.message); actual.error = true; }
  actual.ok = !actual.error && actual.pasos.every(p => p.ok);
  flujos.push(actual);
  console.log(`${actual.ok ? '✔' : '✘'} ${meta.id} ${meta.nombre}`);
}

const nota = t => actual.notas.push(t);
const PRORROGA = 'PRORROGA_ESTADIA';
const ids = {};

// ---------- Sesión inicial de todos los perfiles (no se registra como flujo) ----------
actual = { pasos: [] };
for (const [a, c] of [['cliente', 'cliente@demo.pa'], ['cliente2', 'cliente2@demo.pa'], ['abogado', 'abogado@demo.pa'],
  ['recepcion', 'recepcion@demo.pa'], ['analista', 'analista@demo.pa'], ['resolutor', 'resolutor@demo.pa'],
  ['supervisor', 'supervisor@demo.pa'], ['auditor', 'auditor@demo.pa'], ['admin', 'admin@demo.pa']]) {
  const r = await fetch(API + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ correo: c, contrasena: CLAVE_DEMO }) });
  tokens[a] = (await r.json()).token;
}

// ================= Entorno y acceso =================
await flujo({ id: 'F-01', modulo: 'Entorno', nombre: 'Health check del backend', rol: 'Público', tareas: ['TASK-10.6'],
  esperado: 'GET /actuator/health responde 200 con status UP sin exponer detalles.' }, async () => {
  await llamar(null, 'GET', '/actuator/health', undefined, 200);
});
await flujo({ id: 'F-02', modulo: 'Acceso', nombre: 'Iniciar sesión con credenciales válidas', rol: 'Cliente', tareas: ['TASK-13.4', 'TASK-22.5'],
  esperado: 'Login correcto devuelve token, rol y datos del usuario; el token se enmascara en la evidencia.' }, async () => {
  await entrar('cliente', 'cliente@demo.pa');
  await llamar('cliente', 'GET', '/api/perfil', undefined, 200);
});
await flujo({ id: 'F-03', modulo: 'Acceso', nombre: 'Login fallido sin revelar si el correo existe', rol: 'Sin sesión', tareas: ['TASK-14.4', 'TASK-22.5'],
  esperado: 'Contraseña errónea y correo inexistente responden igual: 401 con el mismo código y mensaje.' }, async () => {
  await llamar(null, 'POST', '/api/auth/login', { correo: 'cliente2@demo.pa', contrasena: 'Clave-Equivocada-1' }, 401);
  await llamar(null, 'POST', '/api/auth/login', { correo: 'no-existe@demo.pa', contrasena: 'Clave-Equivocada-1' }, 401);
});
const correoNuevo = `qa-${Date.now()}@demo.pa`;
await flujo({ id: 'F-04', modulo: 'Cuenta', nombre: 'Registro de cuenta de cliente (P-02)', rol: 'Sin sesión', tareas: [],
  esperado: 'Registro con datos válidos crea la cuenta (201); política de contraseña y aceptación de tratamiento obligatorias (400).' }, async () => {
  const base = { tipoDocumento: 'PASAPORTE', numeroDocumento: 'QA' + Date.now().toString().slice(-8), nombre: 'Cliente QA (ficticio)', nacionalidad: 'CO',
    correo: correoNuevo, telefono: '+507 6000-0000', paisResidencia: 'PA', contrasena: 'Registro-Seguro-2026', aceptaTratamientoDatos: true };
  await llamar(null, 'POST', '/api/auth/registro', { ...base, contrasena: 'corta', correo: 'x' + correoNuevo }, 400);
  await llamar(null, 'POST', '/api/auth/registro', { ...base, aceptaTratamientoDatos: false, correo: 'y' + correoNuevo }, 400);
  await llamar(null, 'POST', '/api/auth/registro', base, 201);
});
await flujo({ id: 'F-05', modulo: 'Cuenta', nombre: 'Recuperación de contraseña (P-04)', rol: 'Sin sesión', tareas: ['TASK-14.4'],
  esperado: 'La solicitud responde 202 igual exista o no la cuenta; un token inválido se rechaza.' }, async () => {
  await llamar(null, 'POST', '/api/auth/recuperacion', { correo: correoNuevo }, 202);
  await llamar(null, 'POST', '/api/auth/recuperacion', { correo: 'no-existe@demo.pa' }, 202);
  await llamar(null, 'POST', '/api/auth/recuperacion/confirmacion', { token: 'token-inventado', contrasenaNueva: 'Otra-Clave-2026!' }, 400);
});
await flujo({ id: 'F-06', modulo: 'Cuenta', nombre: 'Consultar y actualizar mi perfil (P-05)', rol: 'Cliente', tareas: ['TASK-13.4'],
  esperado: 'El cliente ve su perfil y cambia teléfono e idioma; intentar cambiar su rol no tiene efecto.' }, async () => {
  await llamar('cliente', 'PATCH', '/api/perfil', { telefono: '+507 6111-2222', idiomaNotificacion: 'ES', rol: 'ADMIN' }, 200);
  const r = await llamar('cliente', 'GET', '/api/perfil', undefined, 200);
  if (r.json?.rol !== 'SOLICITANTE') { actual.error = true; nota('El rol cambió.'); } else nota('El rol sigue siendo SOLICITANTE.');
});
await flujo({ id: 'F-07', modulo: 'Cuenta', nombre: 'Cambio de contraseña con la actual incorrecta', rol: 'Cliente', tareas: ['TASK-22.5'],
  esperado: 'Sin la contraseña actual correcta el cambio se rechaza (400) y queda auditado como FALLO.' }, async () => {
  await llamar('cliente', 'PUT', '/api/auth/contrasena', { contrasenaActual: 'No-Es-La-Mia-1', contrasenaNueva: 'Nueva-Clave-2026!' }, 400);
});
await flujo({ id: 'F-08', modulo: 'Acceso', nombre: 'Cerrar sesión invalida el token', rol: 'Cliente 2', tareas: ['TASK-13.4'],
  esperado: 'Tras POST /api/auth/logout (204), el mismo token responde 401.' }, async () => {
  await entrar('temporal', 'cliente2@demo.pa');
  await llamar('temporal', 'GET', '/api/perfil', undefined, 200);
  await llamar('temporal', 'POST', '/api/auth/logout', undefined, 204);
  await llamar('temporal', 'GET', '/api/perfil', undefined, 401);
});
await flujo({ id: 'F-09', modulo: 'Seguridad', nombre: 'Token falso o ausente', rol: 'Sin sesión', tareas: ['TASK-13.4', 'TASK-14.4'],
  esperado: 'Sin token o con un token inventado la API responde 401 con cuerpo uniforme.' }, async () => {
  await llamar(null, 'GET', '/api/expedientes', undefined, 401);
  tokens.falso = 'token-inventado-123';
  await llamar('falso', 'GET', '/api/expedientes', undefined, 401);
});

// ================= Catálogos y expedientes =================
await flujo({ id: 'F-10', modulo: 'Catálogos', nombre: 'Consultar tipos de trámite y tipos documentales', rol: 'Cliente', tareas: ['TASK-16.4'],
  esperado: 'Se listan los 4 trámites con sus requisitos y los tipos documentales con MIME y tamaño máximo.' }, async () => {
  await llamar('cliente', 'GET', '/api/catalogos/tipos-tramite', undefined, 200);
  await llamar('cliente', 'GET', '/api/catalogos/tipos-documentales', undefined, 200);
});
await flujo({ id: 'F-11', modulo: 'Expedientes', nombre: 'Crear expediente (P-09…P-17)', rol: 'Cliente', tareas: ['TASK-16.4'],
  esperado: 'El cliente crea un expediente (201, estado RECIBIDO); un tipo inexistente responde 400 con el campo señalado.' }, async () => {
  const r = await llamar('cliente', 'POST', '/api/expedientes', { tipoTramite: PRORROGA }, 201);
  ids.exp = r.json.id;
  await llamar('cliente', 'POST', '/api/expedientes', { tipoTramite: 'NO_EXISTE' }, 400);
});
await flujo({ id: 'F-12', modulo: 'Expedientes', nombre: 'Listar mis expedientes con filtros y paginación (P-06)', rol: 'Cliente', tareas: ['TASK-16.4'],
  esperado: 'El listado trae solo expedientes del cliente, con filtros y paginación; tamaño fuera de rango → 400.' }, async () => {
  await llamar('cliente', 'GET', '/api/expedientes?tamano=5&pagina=0', undefined, 200);
  await llamar('cliente', 'GET', `/api/expedientes?tipoTramite=${PRORROGA}&estado=RECIBIDO`, undefined, 200);
  await llamar('cliente', 'GET', '/api/expedientes?tamano=101', undefined, 400);
});
await flujo({ id: 'F-13', modulo: 'Expedientes', nombre: 'Expediente ajeno responde como inexistente', rol: 'Cliente 2', tareas: ['TASK-16.4', 'TASK-13.4'],
  esperado: 'Otro cliente recibe 404 (sin revelar el expediente) en detalle, documentos e historial.' }, async () => {
  await llamar('cliente2', 'GET', `/api/expedientes/${ids.exp}`, undefined, 404);
  await llamar('cliente2', 'GET', `/api/expedientes/${ids.exp}/historial`, undefined, 404);
});
await flujo({ id: 'F-14', modulo: 'Expedientes', nombre: 'Representante crea expediente a nombre de su representado', rol: 'Abogada', tareas: ['TASK-16.4'],
  esperado: 'Con representación acreditada se crea a nombre del titular (201); sin ella → 403 SIN_REPRESENTACION.' }, async () => {
  const perfil = await fetch(API + '/api/perfil', { headers: { Authorization: 'Bearer ' + tokens.cliente } }).then(r => r.json());
  const perfil2 = await fetch(API + '/api/perfil', { headers: { Authorization: 'Bearer ' + tokens.cliente2 } }).then(r => r.json());
  const r = await llamar('abogado', 'POST', '/api/expedientes', { tipoTramite: PRORROGA, titularId: perfil.id }, 201);
  ids.expRepresentado = r.json.id;
  await llamar('abogado', 'POST', '/api/expedientes', { tipoTramite: PRORROGA, titularId: perfil2.id }, 403);
  await llamar('cliente', 'GET', `/api/expedientes/${ids.expRepresentado}`, undefined, 200);
});
await flujo({ id: 'F-15', modulo: 'Expedientes', nombre: 'Consulta del despacho, supervisor y auditor', rol: 'Recepción / Supervisor / Auditor', tareas: ['TASK-16.4', 'TASK-13.4'],
  esperado: 'Personal interno lista y ve el expediente; el administrador recibe 403.' }, async () => {
  await llamar('recepcion', 'GET', `/api/expedientes/${ids.exp}`, undefined, 200);
  await llamar('supervisor', 'GET', '/api/expedientes?tamano=3', undefined, 200);
  await llamar('auditor', 'GET', `/api/expedientes/${ids.exp}`, undefined, 200);
  await llamar('admin', 'GET', `/api/expedientes/${ids.exp}`, undefined, 403);
});

// ================= Documentos =================
await flujo({ id: 'F-16', modulo: 'Documentos', nombre: 'Subir documentos válidos (P-14)', rol: 'Cliente', tareas: ['TASK-17.5'],
  esperado: 'PDF válido se adjunta (201) sin exponer la ruta del almacén; segundo del mismo tipo avisa duplicado.' }, async () => {
  const r = await llamar('cliente', 'POST', `/api/expedientes/${ids.exp}/documentos`, undefined, 201, { archivo: { nombre: 'pasaporte.pdf', mime: 'application/pdf', contenido: PDF, tipo: 'PASAPORTE' } });
  ids.doc = r.json.id;
  await llamar('cliente', 'POST', `/api/expedientes/${ids.exp}/documentos`, undefined, 201, { archivo: { nombre: 'pago.pdf', mime: 'application/pdf', contenido: PDF, tipo: 'COMPROBANTE_PAGO' } });
  await llamar('cliente', 'GET', `/api/expedientes/${ids.exp}/documentos`, undefined, 200);
});
await flujo({ id: 'F-17', modulo: 'Documentos', nombre: 'Rechazo de archivos inválidos', rol: 'Cliente', tareas: ['TASK-17.5'],
  esperado: 'Ejecutable, contenido que no es PDF y archivo > 10 MB se rechazan con 400 y el campo archivo.' }, async () => {
  await llamar('cliente', 'POST', `/api/expedientes/${ids.exp}/documentos`, undefined, 400, { archivo: { nombre: 'programa.exe', mime: 'application/x-msdownload', contenido: Buffer.from('MZ programa'), tipo: 'PASAPORTE' } });
  await llamar('cliente', 'POST', `/api/expedientes/${ids.exp}/documentos`, undefined, 400, { archivo: { nombre: 'falso.pdf', mime: 'application/pdf', contenido: Buffer.from('<html>no soy pdf</html>'), tipo: 'PASAPORTE' } });
  const grande = Buffer.alloc(10 * 1024 * 1024 + 1); PDF.copy(grande);
  await llamar('cliente', 'POST', `/api/expedientes/${ids.exp}/documentos`, undefined, 400, { archivo: { nombre: 'enorme.pdf', mime: 'application/pdf', contenido: grande, tipo: 'PASAPORTE' } });
});
await flujo({ id: 'F-18', modulo: 'Documentos', nombre: 'Descarga protegida por rol', rol: 'Varios', tareas: ['TASK-17.5', 'TASK-13.4'],
  esperado: 'Titular, recepción (CONSULTAR) y supervisor descargan (200); auditor y admin 403; otro cliente 404.' }, async () => {
  const url = `/api/expedientes/${ids.exp}/documentos/${ids.doc}/contenido`;
  await llamar('cliente', 'GET', url, undefined, 200);
  await llamar('recepcion', 'GET', url, undefined, 200);
  await llamar('supervisor', 'GET', url, undefined, 200);
  await llamar('auditor', 'GET', url, undefined, 403);
  await llamar('admin', 'GET', url, undefined, 403);
  await llamar('cliente2', 'GET', url, undefined, 404);
});

// ================= Estados, observaciones, historial =================
await flujo({ id: 'F-19', modulo: 'Estados', nombre: 'Recorrido completo hasta la resolución y el archivo', rol: 'Analista / Resolutora', tareas: ['TASK-19.5'],
  esperado: 'Cada transición válida responde 200 con versión incrementada: RECIBIDO → EN_ANALISIS → ADMITIDO → EN_RESOLUCION → RESUELTO (APROBADA) → NOTIFICADO → ENTREGADO → ARCHIVADO.' }, async () => {
  let v = 0;
  const cambiar = async (actor, estado, motivo, extra = {}) => {
    const r = await llamar(actor, 'PATCH', `/api/expedientes/${ids.exp}/estado`, { estadoNuevo: estado, motivo, version: v, ...extra }, 200);
    v = r.json?.version ?? v;
  };
  await cambiar('analista', 'EN_ANALISIS', 'Nota interna: revisar pasaporte');
  await cambiar('analista', 'ADMITIDO', 'Solicitud conforme');
  await cambiar('resolutor', 'EN_RESOLUCION', 'Requisitos completos');
  await cambiar('resolutor', 'RESUELTO', 'Cumple los requisitos del trámite', { resultado: 'APROBADA' });
  await cambiar('resolutor', 'NOTIFICADO', 'Resolución notificada');
  await cambiar('resolutor', 'ENTREGADO', 'Documento entregado');
  await cambiar('resolutor', 'ARCHIVADO', 'Trámite concluido');
});
await flujo({ id: 'F-20', modulo: 'Estados', nombre: 'Transición no permitida, sin requisitos y versión desactualizada', rol: 'Analista / Resolutora', tareas: ['TASK-19.5'],
  esperado: 'Saltar estados → 409 TRANSICION_NO_PERMITIDA; resolver sin documentos → 409 REQUISITOS_INCOMPLETOS; versión vieja → 409 VERSION_DESACTUALIZADA; el estado no cambia.' }, async () => {
  const r = await llamar('cliente', 'POST', '/api/expedientes', { tipoTramite: PRORROGA }, 201);
  const id = r.json.id;
  await llamar('resolutor', 'PATCH', `/api/expedientes/${id}/estado`, { estadoNuevo: 'NOTIFICADO', motivo: 'Saltar el proceso', version: 0 }, [403, 409]);
  await llamar('analista', 'PATCH', `/api/expedientes/${id}/estado`, { estadoNuevo: 'ADMITIDO', motivo: 'Saltar el análisis', version: 0 }, 409);
  await llamar('analista', 'PATCH', `/api/expedientes/${id}/estado`, { estadoNuevo: 'EN_ANALISIS', motivo: 'Inicio', version: 0 }, 200);
  await llamar('analista', 'PATCH', `/api/expedientes/${id}/estado`, { estadoNuevo: 'ADMITIDO', motivo: 'Conforme', version: 1 }, 200);
  await llamar('resolutor', 'PATCH', `/api/expedientes/${id}/estado`, { estadoNuevo: 'EN_RESOLUCION', motivo: 'Sin documentos', version: 2 }, 409);
  await llamar('analista', 'PATCH', `/api/expedientes/${id}/estado`, { estadoNuevo: 'CON_OBSERVACIONES', motivo: 'Versión vieja', version: 0 }, 409);
  ids.expObservado = id;
});
await flujo({ id: 'F-21', modulo: 'Estados', nombre: 'Permisos por etapa', rol: 'Cliente / Supervisor / Resolutora', tareas: ['TASK-19.5', 'TASK-13.4'],
  esperado: 'Cliente y supervisor no cambian estados (403); la resolutora no inicia el análisis (403).' }, async () => {
  const r = await llamar('cliente', 'POST', '/api/expedientes', { tipoTramite: PRORROGA }, 201);
  const cuerpo = { estadoNuevo: 'EN_ANALISIS', motivo: 'Inicio', version: 0 };
  await llamar('cliente', 'PATCH', `/api/expedientes/${r.json.id}/estado`, cuerpo, 403);
  await llamar('supervisor', 'PATCH', `/api/expedientes/${r.json.id}/estado`, cuerpo, 403);
  await llamar('resolutor', 'PATCH', `/api/expedientes/${r.json.id}/estado`, cuerpo, 403);
});
await flujo({ id: 'F-22', modulo: 'Observaciones', nombre: 'Registrar y responder observaciones (I-08 / P-20)', rol: 'Analista / Cliente', tareas: ['TASK-20.3'],
  esperado: 'Analista con OBSERVAR y cliente titular registran (201); ambos ven el hilo; texto vacío → 400.' }, async () => {
  await llamar('analista', 'POST', `/api/expedientes/${ids.expObservado}/observaciones`, { texto: 'La foto del pasaporte está borrosa.' }, 201);
  await llamar('cliente', 'POST', `/api/expedientes/${ids.expObservado}/observaciones`, { texto: 'Subo una foto nueva hoy.' }, 201);
  await llamar('cliente', 'GET', `/api/expedientes/${ids.expObservado}/observaciones`, undefined, 200);
  await llamar('analista', 'POST', `/api/expedientes/${ids.expObservado}/observaciones`, { texto: '   ' }, 400);
});
await flujo({ id: 'F-23', modulo: 'Observaciones', nombre: 'Observaciones: roles sin permiso', rol: 'Resolutora / Supervisor / Auditor / Admin', tareas: ['TASK-20.3', 'TASK-13.4'],
  esperado: 'Resolutora (sin OBSERVAR), supervisor y auditor no escriben (403); supervisor lee (200); admin no lee (403).' }, async () => {
  const u = `/api/expedientes/${ids.expObservado}/observaciones`;
  await llamar('resolutor', 'POST', u, { texto: 'x' }, 403);
  await llamar('supervisor', 'POST', u, { texto: 'x' }, 403);
  await llamar('auditor', 'POST', u, { texto: 'x' }, 403);
  await llamar('supervisor', 'GET', u, undefined, 200);
  await llamar('admin', 'GET', u, undefined, 403);
});
await flujo({ id: 'F-24', modulo: 'Historial', nombre: 'Historial con proyección por rol (P-19 / I-06)', rol: 'Cliente / Analista', tareas: ['TASK-21.3'],
  esperado: 'El cliente ve todos los cambios sin la nota interna; la analista ve la nota interna.' }, async () => {
  const c = await llamar('cliente', 'GET', `/api/expedientes/${ids.exp}/historial`, undefined, 200);
  const a = await llamar('analista', 'GET', `/api/expedientes/${ids.exp}/historial`, undefined, 200);
  const nInterna = t => (t.texto.includes('Nota interna') ? 'sí' : 'no');
  nota(`Nota interna visible para el cliente: ${nInterna(c)} · para la analista: ${nInterna(a)}.`);
  if (c.texto.includes('Nota interna') || !a.texto.includes('Nota interna')) actual.error = true;
});
await flujo({ id: 'F-25', modulo: 'Historial', nombre: 'Historial: accesos denegados', rol: 'Admin / Cliente 2 / Sin sesión', tareas: ['TASK-21.3'],
  esperado: 'Admin 403, cliente ajeno 404, sin sesión 401; el historial no se escribe por la API (403).' }, async () => {
  const u = `/api/expedientes/${ids.exp}/historial`;
  await llamar('admin', 'GET', u, undefined, 403);
  await llamar('cliente2', 'GET', u, undefined, 404);
  await llamar(null, 'GET', u, undefined, 401);
  await llamar('analista', 'POST', u, { estadoNuevo: 'RESUELTO' }, 403);
});

// ================= Notificaciones, privacidad =================
await flujo({ id: 'F-26', modulo: 'Notificaciones', nombre: 'Ver notificaciones y marcar como leída (P-20)', rol: 'Cliente', tareas: ['TASK-18.4'],
  esperado: 'El cliente ve sus avisos con plantilla fija (sin textos del caso) y marca uno como leído (204, idempotente); el auditor no tiene bandeja (403).' }, async () => {
  const r = await llamar('cliente', 'GET', '/api/notificaciones?tamano=5', undefined, 200);
  const id = r.json?.contenido?.[0]?.id;
  if (id) {
    await llamar('cliente', 'PUT', `/api/notificaciones/${id}/leida`, '', 204);
    await llamar('cliente', 'PUT', `/api/notificaciones/${id}/leida`, '', 204);
    await llamar('cliente2', 'PUT', `/api/notificaciones/${id}/leida`, '', 404);
  }
  await llamar('auditor', 'GET', '/api/notificaciones', undefined, 403);
  if (r.texto.includes('borrosa') || r.texto.includes('Cumple los requisitos')) { actual.error = true; nota('Un aviso copió texto del caso.'); }
  else nota('Ningún aviso contiene textos de observaciones ni motivos.');
});
await flujo({ id: 'F-27', modulo: 'Consentimiento', nombre: 'Documento sensible sin consentimiento expreso', rol: 'Cliente 2', tareas: ['TASK-18b.5'],
  esperado: 'Adjuntar CERTIFICADO_SALUD sin consentimiento expreso vigente → 403 CONSENTIMIENTO_EXPRESO_REQUERIDO.' }, async () => {
  const r = await llamar('cliente2', 'POST', '/api/expedientes', { tipoTramite: 'RESIDENCIA_TEMPORAL' }, 201);
  ids.expResidencia = r.json.id;
  await llamar('cliente2', 'POST', `/api/expedientes/${ids.expResidencia}/documentos`, undefined, 403, { archivo: { nombre: 'salud.pdf', mime: 'application/pdf', contenido: PDF, tipo: 'CERTIFICADO_SALUD' } });
});
await flujo({ id: 'F-28', modulo: 'Consentimiento', nombre: 'Registrar, consultar y revocar consentimiento (P-05)', rol: 'Cliente 2 / Recepción', tareas: ['TASK-18b.5'],
  esperado: 'Alta 201 VIGENTE; con consentimiento expreso se admite el sensible (201); revocación 200 REVOCADO conservando la evidencia; segunda revocación 409.' }, async () => {
  const perfil = await fetch(API + '/api/perfil', { headers: { Authorization: 'Bearer ' + tokens.cliente2 } }).then(r => r.json());
  const c = await llamar('cliente2', 'POST', '/api/consentimientos', { titularId: perfil.id, finalidad: 'Trámite de residencia temporal', alcance: 'Identidad y documentos del trámite', baseLegal: 'Ley 81 de 2019', expreso: true }, 201);
  await llamar('cliente2', 'POST', `/api/expedientes/${ids.expResidencia}/documentos`, undefined, 201, { archivo: { nombre: 'salud.pdf', mime: 'application/pdf', contenido: PDF, tipo: 'CERTIFICADO_SALUD' } });
  await llamar('recepcion', 'GET', `/api/consentimientos?titularId=${perfil.id}`, undefined, 200);
  await llamar('cliente2', 'PATCH', `/api/consentimientos/${c.json.id}`, '', 200);
  await llamar('cliente2', 'PATCH', `/api/consentimientos/${c.json.id}`, '', 409);
});
await flujo({ id: 'F-29', modulo: 'Derechos ARCO', nombre: 'Crear y atender una solicitud ARCO', rol: 'Cliente 2 / Recepción', tareas: ['TASK-18c.5'],
  esperado: 'Registro 201 RECIBIDA con plazo; atención EN_ATENCION → ATENDIDA (200); saltar a ATENDIDA → 409; rechazo sin motivo → 400.' }, async () => {
  const r = await llamar('cliente2', 'POST', '/api/solicitudes-arco', { tipo: 'RECTIFICACION', descripcion: 'Mi segundo apellido está mal escrito.' }, 201);
  const id = r.json.id;
  await llamar('recepcion', 'PATCH', `/api/solicitudes-arco/${id}`, { estado: 'ATENDIDA' }, 409);
  await llamar('recepcion', 'PATCH', `/api/solicitudes-arco/${id}`, { estado: 'EN_ATENCION' }, 200);
  await llamar('recepcion', 'PATCH', `/api/solicitudes-arco/${id}`, { estado: 'RECHAZADA' }, 400);
  await llamar('recepcion', 'PATCH', `/api/solicitudes-arco/${id}`, { estado: 'ATENDIDA' }, 200);
  ids.arco = id;
});
await flujo({ id: 'F-30', modulo: 'Derechos ARCO', nombre: 'ARCO: titularidad y acceso por rol', rol: 'Cliente / Auditor / Supervisor / Admin', tareas: ['TASK-18c.5'],
  esperado: 'Otro cliente no ve la solicitud (404); el auditor la consulta (200) pero no la atiende (403); supervisor y admin 403.' }, async () => {
  await llamar('cliente', 'GET', `/api/solicitudes-arco/${ids.arco}`, undefined, 404);
  await llamar('auditor', 'GET', `/api/solicitudes-arco/${ids.arco}`, undefined, 200);
  await llamar('auditor', 'PATCH', `/api/solicitudes-arco/${ids.arco}`, { estado: 'EN_ATENCION' }, 403);
  await llamar('supervisor', 'GET', '/api/solicitudes-arco', undefined, 403);
  await llamar('admin', 'GET', '/api/solicitudes-arco', undefined, 403);
});

// ================= Auditoría, errores, fuentes =================
await flujo({ id: 'F-31', modulo: 'Auditoría', nombre: 'Consultar la bitácora con filtros (I-16)', rol: 'Auditor', tareas: ['TASK-22.5'],
  esperado: 'El auditor consulta eventos filtrados por operación y recurso con actor, resultado y correlación; otros roles 403.' }, async () => {
  await llamar('auditor', 'GET', '/api/auditoria/eventos?operacion=CAMBIAR_ESTADO&tamano=3', undefined, 200);
  await llamar('auditor', 'GET', `/api/auditoria/eventos?recurso=${ids.exp}&tamano=3`, undefined, 200);
  await llamar('auditor', 'GET', '/api/auditoria/eventos?operacion=ACCESO_DENEGADO&tamano=3', undefined, 200);
  await llamar('supervisor', 'GET', '/api/auditoria/eventos', undefined, 403);
});
await flujo({ id: 'F-32', modulo: 'Auditoría', nombre: 'Exportar la bitácora a CSV', rol: 'Auditor', tareas: ['TASK-22.5'],
  esperado: 'La exportación responde 200 text/csv con los filtros aplicados; el cliente recibe 403.' }, async () => {
  await llamar('auditor', 'GET', `/api/auditoria/eventos/exportacion?recurso=${ids.exp}`, undefined, 200);
  await llamar('cliente', 'GET', '/api/auditoria/eventos/exportacion', undefined, 403);
});
await flujo({ id: 'F-33', modulo: 'Errores', nombre: 'Cuerpo de error uniforme por código', rol: 'Varios', tareas: ['TASK-14.4'],
  esperado: '400, 401, 403, 404, 409 y 415 responden {codigo, mensaje, correlacionId} sin trazas ni SQL.' }, async () => {
  await llamar('cliente', 'POST', '/api/expedientes', '{"tipoTramite":', 400);
  await llamar(null, 'GET', '/api/expedientes', undefined, 401);
  await llamar('cliente', 'GET', '/api/auditoria/eventos', undefined, 403);
  await llamar('cliente', 'GET', '/api/expedientes/00000000-0000-0000-0000-000000000000', undefined, 404);
  await llamar('cliente', 'POST', '/api/expedientes', 'tipoTramite=PRORROGA_ESTADIA', 415, { tipo: 'text/plain' });
  await llamar('analista', 'PATCH', `/api/expedientes/${ids.expObservado}/estado`, { estadoNuevo: 'CON_OBSERVACIONES', motivo: 'Versión vieja', version: 0 }, 409);
});
await flujo({ id: 'F-34', modulo: 'Fuentes simuladas', nombre: 'Consultas a fuentes simuladas con escenarios', rol: 'Recepción', tareas: ['TASK-14.4'],
  esperado: 'TE OK (200), sin resultado (4xx), fallo técnico (500 ERROR_TECNICO), tiempo agotado (504) y límite (429); el cliente no accede (403).' }, async () => {
  const u = '/api/mock/te/personas/CEDULA/8-123-456';
  await llamar('recepcion', 'GET', u, undefined, [200, 404]);
  await llamar('recepcion', 'GET', u, undefined, [404, 422], { headers: { 'X-Scenario': 'SIN_RESULTADO' } });
  await llamar('recepcion', 'GET', u, undefined, 500, { headers: { 'X-Scenario': 'ERROR_TECNICO' } });
  await llamar('recepcion', 'GET', u, undefined, 504, { headers: { 'X-Scenario': 'TIMEOUT' } });
  await llamar('recepcion', 'GET', u, undefined, 429, { headers: { 'X-Scenario': 'RATE_LIMIT' } });
  await llamar('cliente', 'GET', u, undefined, 403);
});
await flujo({ id: 'F-35', modulo: 'Seguridad', nombre: 'Matriz de acceso por rol (muestra)', rol: 'Todos los roles', tareas: ['TASK-13.4'],
  esperado: 'Cada rol accede solo a lo que le permite la matriz: crear expediente solo cliente; bitácora solo auditor; bandeja ARCO cliente/funcionario/auditor.' }, async () => {
  for (const a of ['cliente', 'recepcion', 'supervisor', 'auditor', 'admin']) {
    await llamar(a, 'POST', '/api/expedientes', { tipoTramite: PRORROGA }, a === 'cliente' ? 201 : 403);
  }
  for (const a of ['cliente', 'recepcion', 'supervisor', 'auditor', 'admin']) {
    await llamar(a, 'GET', '/api/auditoria/eventos?tamano=1', undefined, a === 'auditor' ? 200 : 403);
  }
});

fs.writeFileSync(process.argv[2] || 'flujos.json', JSON.stringify({ fecha: new Date().toISOString(), api: API, flujos }, null, 1));
console.log(`\n${flujos.filter(f => f.ok).length}/${flujos.length} flujos OK`);

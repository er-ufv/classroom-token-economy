/**
 * Fichas de participación · conexión con Google Sheets
 *
 * Pega este código en la hoja: Extensiones → Apps Script.
 * 1. Cambia CLAVE por tu contraseña (la que escribirás en la app para entrar).
 * 2. Implementar → Nueva implementación → Tipo: Aplicación web.
 *    Ejecutar como: «Yo».  Quién tiene acceso: «Cualquier usuario».
 * 3. Copia la dirección que termina en /exec y pégala en la app (Configurar la hoja de cálculo).
 *
 * La app guarda todo el curso en la pestaña oculta «_datos» y, cada vez que guarda,
 * reescribe las pestañas «Notas» y «Registro» para que puedas consultarlas o copiarlas.
 * Tras 8 contraseñas incorrectas seguidas, el acceso se bloquea 10 minutos.
 */
const CLAVE = 'CAMBIA-ESTA-CLAVE';

const HOJA_DATOS = '_datos';
const TROZO = 45000;          // caracteres por celda (el límite de Sheets es 50.000)
const MAX_FALLOS = 8;         // intentos fallidos antes de bloquear
const BLOQUEO_SEG = 600;      // 10 minutos

function doGet(e) {
  const p = (e && e.parameter) || {};
  const acceso = comprobar_(p.clave);
  if (acceso) return salida_(acceso);
  return salida_({ ok: true, data: leerDatos_() });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return salida_({ ok: false, error: 'json' }); }
  const acceso = comprobar_(body && body.clave);
  if (acceso) return salida_(acceso);
  if (!body.data || typeof body.data.groups !== 'object') return salida_({ ok: false, error: 'datos' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const actual = leerDatos_();
    // Si otro ordenador guardó algo más nuevo desde la última lectura, devolvemos esos datos para combinarlos.
    if (actual && actual.updatedAt && (!body.base || actual.updatedAt > body.base) && !body.forzar) {
      return salida_({ ok: false, error: 'conflicto', data: actual });
    }
    escribirDatos_(body.data);
    escribirLegible_(body.data);
    return salida_({ ok: true, savedAt: Date.now() });
  } finally {
    lock.releaseLock();
  }
}

/** Devuelve null si la contraseña es correcta; si no, el error a enviar. */
function comprobar_(clave) {
  const cache = CacheService.getScriptCache();
  const fallos = Number(cache.get('fallos') || 0);
  if (fallos >= MAX_FALLOS) return { ok: false, error: 'bloqueado' };
  if (clave !== CLAVE) {
    cache.put('fallos', String(fallos + 1), BLOQUEO_SEG);
    return { ok: false, error: 'clave' };
  }
  if (fallos) cache.remove('fallos');
  return null;
}

function salida_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function hoja_(nombre) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(nombre) || ss.insertSheet(nombre);
}

function leerDatos_() {
  const sh = hoja_(HOJA_DATOS);
  const n = sh.getLastRow();
  if (!n) return null;
  // cada trozo lleva un '#' delante para que Sheets no lo interprete
  const texto = sh.getRange(1, 1, n, 1).getValues().map(function (r) { return String(r[0]).slice(1); }).join('');
  if (!texto) return null;
  try { return JSON.parse(texto); } catch (err) { return null; }
}

function escribirDatos_(data) {
  const sh = hoja_(HOJA_DATOS);
  const texto = JSON.stringify(data);
  const filas = [];
  for (let i = 0; i < texto.length; i += TROZO) filas.push(['#' + texto.slice(i, i + TROZO)]);
  sh.clear();
  if (filas.length) sh.getRange(1, 1, filas.length, 1).setNumberFormat('@').setValues(filas);
  if (!sh.isSheetHidden()) sh.hideSheet();
}

function separarNombre_(n) {
  n = String(n || '').trim();
  const i = n.indexOf(',');
  if (i >= 0) return { apellidos: n.slice(0, i).trim(), nombre: n.slice(i + 1).trim() };
  const partes = n.split(/\s+/);
  return { apellidos: partes.slice(1).join(' '), nombre: partes[0] || '' };
}

function escribirLegible_(data) {
  const notas = [['Asignatura', 'Grupo', 'Institución', 'Apellidos', 'Nombre', 'Fichas 1.er parcial', 'Puntos 1.er parcial', 'Fichas 2.º parcial', 'Puntos 2.º parcial', 'Total puntos', 'Respuestas correctas', 'Respuestas incorrectas']];
  const registro = [['Asignatura', 'Grupo', 'Apellidos', 'Nombre', 'Parcial', 'Fecha y hora', 'Resultado', 'Tema', 'Pregunta']];
  const tz = Session.getScriptTimeZone();
  const r = function (x) { return Math.round(x * 1000) / 1000; };
  Object.keys(data.groups || {}).forEach(function (gid) {
    const g = data.groups[gid];
    const max = Math.max(1, Number(g.max) || 10);
    const puntos = g.bonusMax != null ? Number(g.bonusMax) : (Number(g.value) || 0.1) * max;
    const valor = puntos / max;
    const inst = { ufv: 'UFV', esic: 'ESIC' }[g.institution] || '';
    const preguntas = g.questions || {};
    const est = g.students || {};
    Object.keys(est).map(function (sid) { return est[sid]; })
      .sort(function (a, b) { return String(a.name).localeCompare(String(b.name), 'es'); })
      .forEach(function (s) {
        const nm = separarNombre_(s.name);
        const ans = s.ans || [];
        const f1 = Math.min((s.p1 || []).length, max), f2 = Math.min((s.p2 || []).length, max);
        const ok = ans.filter(function (a) { return a.ok; }).length, ko = ans.length - ok;
        notas.push([g.name, g.groupLabel || '', inst, nm.apellidos, nm.nombre, f1, r(f1 * valor), f2, r(f2 * valor), r((f1 + f2) * valor), ok, ko]);
        const porT = {};
        ans.forEach(function (a) { porT[a.t] = a; });
        const fila = function (t, p, res, a) {
          const q = a && preguntas[a.q];
          registro.push([g.name, g.groupLabel || '', nm.apellidos, nm.nombre, p, Utilities.formatDate(new Date(t), tz, 'dd/MM/yyyy HH:mm'), res, q ? q.topic : '', q ? q.q : '']);
        };
        [1, 2].forEach(function (p) {
          (s['p' + p] || []).forEach(function (t) { const a = porT[t]; fila(t, p, a ? 'Correcta (+1)' : 'Ficha', a); });
        });
        ans.filter(function (a) { return !a.ok; }).forEach(function (a) { fila(a.t, a.p || 1, 'Incorrecta', a); });
      });
  });
  [['Notas', notas], ['Registro', registro]].forEach(function (par) {
    const sh = hoja_(par[0]);
    sh.clearContents();
    sh.getRange(1, 1, par[1].length, par[1][0].length).setValues(par[1]);
    sh.getRange(1, 1, 1, par[1][0].length).setFontWeight('bold');
    sh.setFrozenRows(1);
  });
}

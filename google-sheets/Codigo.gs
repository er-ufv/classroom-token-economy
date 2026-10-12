/**
 * Fichas de participación · conexión con Google Sheets
 *
 * Pega este código en la hoja: Extensiones → Apps Script.
 * 1. Cambia CLAVE por una palabra secreta tuya (la misma que pondrás en la app).
 * 2. Implementar → Nueva implementación → Tipo: Aplicación web.
 *    Ejecutar como: «Yo».  Quién tiene acceso: «Cualquier usuario».
 * 3. Copia la URL que termina en /exec y pégala en la app (Inicio → Dónde se guardan los datos).
 *
 * La app guarda todo el curso en la pestaña oculta «_datos» y, cada vez que guarda,
 * reescribe las pestañas «Notas» y «Registro» para que puedas consultarlas o copiarlas.
 */
const CLAVE = 'CAMBIA-ESTA-CLAVE';

const HOJA_DATOS = '_datos';
const TROZO = 45000; // caracteres por celda (el límite de Sheets es 50.000)

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.clave !== CLAVE) return salida_({ ok: false, error: 'clave' });
  return salida_({ ok: true, data: leerDatos_() });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return salida_({ ok: false, error: 'json' }); }
  if (!body || body.clave !== CLAVE) return salida_({ ok: false, error: 'clave' });
  if (!body.data || typeof body.data.groups !== 'object') return salida_({ ok: false, error: 'datos' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const actual = leerDatos_();
    // Si otro dispositivo guardó algo más nuevo desde la última lectura, devolvemos esos datos para combinarlos.
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
  const texto = sh.getRange(1, 1, n, 1).getValues().map(function (r) { return String(r[0]).slice(1); }).join(''); // cada trozo lleva un '#' delante
  if (!texto) return null;
  try { return JSON.parse(texto); } catch (err) { return null; }
}

function escribirDatos_(data) {
  const sh = hoja_(HOJA_DATOS);
  const texto = JSON.stringify(data);
  const filas = [];
  for (let i = 0; i < texto.length; i += TROZO) filas.push(['#' + texto.slice(i, i + TROZO)]); // el '#' evita que Sheets interprete el trozo
  sh.clear();
  if (filas.length) {
    sh.getRange(1, 1, filas.length, 1).setNumberFormat('@').setValues(filas);
  }
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
  const notas = [['Asignatura', 'Grupo', 'Institución', 'Apellidos', 'Nombre', 'Fichas 1.er parcial', 'Puntos 1.er parcial', 'Fichas 2.º parcial', 'Puntos 2.º parcial', 'Total puntos']];
  const registro = [['Asignatura', 'Grupo', 'Apellidos', 'Nombre', 'Parcial', 'Fecha y hora']];
  const tz = Session.getScriptTimeZone();
  Object.keys(data.groups || {}).forEach(function (gid) {
    const g = data.groups[gid];
    const max = Math.max(1, Number(g.max) || 10);
    const puntos = g.bonusMax != null ? Number(g.bonusMax) : (Number(g.value) || 0.1) * max;
    const valor = puntos / max;
    const inst = { ufv: 'UFV', esic: 'ESIC' }[g.institution] || '';
    const est = g.students || {};
    Object.keys(est).map(function (sid) { return est[sid]; })
      .sort(function (a, b) { return String(a.name).localeCompare(String(b.name), 'es'); })
      .forEach(function (s) {
        const nm = separarNombre_(s.name);
        const f1 = Math.min((s.p1 || []).length, max), f2 = Math.min((s.p2 || []).length, max);
        const r = function (x) { return Math.round(x * 1000) / 1000; };
        notas.push([g.name, g.groupLabel || '', inst, nm.apellidos, nm.nombre, f1, r(f1 * valor), f2, r(f2 * valor), r((f1 + f2) * valor)]);
        [1, 2].forEach(function (p) {
          (s['p' + p] || []).forEach(function (ts) {
            registro.push([g.name, g.groupLabel || '', nm.apellidos, nm.nombre, p, Utilities.formatDate(new Date(ts), tz, 'dd/MM/yyyy HH:mm')]);
          });
        });
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

/**
 * ════════════════════════════════════════════════════════════════
 *  LAS CRIPTAS DE HIBBELERIUS — Backend en Google Sheets
 * ════════════════════════════════════════════════════════════════
 *  1) Crea una hoja de cálculo nueva en Google Drive.
 *  2) Extensiones → Apps Script. Pega este archivo completo.
 *  3) Ejecuta la función  setup  una vez (acepta permisos).
 *  4) Implementar → Nueva implementación → Tipo: Aplicación web
 *       · Ejecutar como: Yo
 *       · Quién tiene acceso: Cualquier usuario
 *     Copia la URL que termina en /exec y pégala en src/config.ts
 *  5) En la hoja "Grupos" da de alta tus claves de grupo.
 *  6) Menú "Criptas" → Actualizar panel, para ver el avance.
 *
 *  AL ACTUALIZAR ESTE ARCHIVO: pega el código nuevo, ejecuta setup otra vez
 *  (agrega columnas nuevas sin borrar datos) y luego
 *  Implementar → Administrar implementaciones → ✏️ editar → Versión: Nueva versión → Implementar.
 *  Así la URL /exec sigue siendo la misma.
 * ════════════════════════════════════════════════════════════════
 */

var HEAD = {
  Grupos: ['clave', 'nombre', 'activo', 'creado'],
  Alumnos: ['matricula', 'grupo', 'alias', 'avatar', 'salt', 'hash', 'token', 'creado', 'ultimoAcceso', 'grimorio'],
  Partidas: ['runId', 'matricula', 'grupo', 'alias', 'clase', 'inicio', 'actualizado', 'acto', 'pisoMax', 'vida',
    'puntaje', 'resultado', 'causa', 'combates', 'elites', 'runasOk', 'runasTotal', 'mazo', 'gravedad', 'minutos'],
  Eventos: ['fecha', 'matricula', 'grupo', 'runId', 'tipo', 'concepto', 'correcto', 'detalle'],
  // v0.30: lápidas (donde murió un compañero) y signos de invocación (quien venció a un jefe)
  Huellas: ['fecha', 'matricula', 'grupo', 'alias', 'tipo', 'acto', 'piso', 'jefe', 'datos', 'usos', 'avisado'],
};

// ───────────────────────── Configuración ─────────────────────────
function setup() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(HEAD).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.getRange(1, 1, 1, HEAD[name].length).setValues([HEAD[name]])
      .setFontWeight('bold').setBackground('#221c2a').setFontColor('#e8c15a');
    sh.setFrozenRows(1);
  });
  var g = ss.getSheetByName('Grupos');
  if (g.getLastRow() < 2) g.appendRow(['DIN-OTO26', 'Dinámica · Otoño 2026', true, new Date()]);
  ['Panel', 'Conceptos', 'Resumen', 'Actividad'].forEach(function (n) { if (!ss.getSheetByName(n)) ss.insertSheet(n); });
  var def = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) ss.deleteSheet(def);
  actualizarPanel();
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Criptas')
    .addItem('Actualizar panel', 'actualizarPanel')
    .addItem('Configurar hojas', 'setup')
    .addItem('Actualizar panel cada hora', 'instalarDisparador')
    .addSeparator()
    .addItem('Generar evidencia (reporte del proyecto)', 'generarEvidencia')
    .addItem('Crear formulario de retroalimentación', 'crearFormulario')
    .addSeparator()
    .addItem('Reiniciar contraseña de un alumno…', 'reiniciarContrasena')
    .addSeparator()
    .addItem('Borrar datos de un alumno…', 'borrarAlumno')
    .addItem('Borrar datos de un grupo…', 'borrarGrupo')
    .addItem('Borrar TODO y empezar de cero…', 'borrarTodo')
    .addToUi();
}

/**
 * Para un alumno que olvidó su contraseña: escribe su matrícula y la próxima
 * vez que entre, la contraseña que escriba se vuelve la nueva. No pierde su
 * avatar, su Grimorio ni sus partidas.
 */
function reiniciarContrasena() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('Reiniciar contraseña', 'Matrícula del alumno:', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  var mat = String(r.getResponseText()).trim().toUpperCase();
  var sh = sheet_('Alumnos');
  var row = findRow_(sh, 1, mat);
  if (!row) { ui.alert('No encontré la matrícula ' + mat + '.'); return; }
  sh.getRange(row, 6).setValue('REINICIAR');
  sh.getRange(row, 7).setValue('');
  ui.alert('Listo. Pídele a ' + mat + ' que entre con «Entrar» y escriba una contraseña NUEVA: esa quedará guardada.');
}

// ───────────────────────── Limpieza (pruebas / beta testers) ─────────────────────────
// Antes de borrar, se guarda una COPIA de respaldo de toda la hoja en tu Drive.

/** Quita de una hoja las filas cuya columna col (1 = A) vale val. Devuelve cuántas quitó. */
function quitarFilas_(name, col, val) {
  var sh = sheet_(name);
  var n = sh.getLastRow() - 1;
  if (n < 1) return 0;
  var w = sh.getLastColumn();
  var data = sh.getRange(2, 1, n, w).getValues();
  var keep = data.filter(function (r) { return String(r[col - 1]).trim().toUpperCase() !== val; });
  var quitadas = data.length - keep.length;
  if (!quitadas) return 0;
  sh.getRange(2, 1, n, w).clearContent();
  if (keep.length) sh.getRange(2, 1, keep.length, w).setValues(keep);
  return quitadas;
}

function contarFilas_(name, col, val) {
  var sh = sheet_(name);
  var n = sh.getLastRow() - 1;
  if (n < 1) return 0;
  return sh.getRange(2, col, n, 1).getValues().filter(function (r) { return String(r[0]).trim().toUpperCase() === val; }).length;
}

function respaldo_() {
  var ss = SpreadsheetApp.getActive();
  var nombre = 'Respaldo Criptas ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  ss.copy(nombre);
  return nombre;
}

/** Borra a una persona (p. ej. un amigo que probó el juego en el grupo real) */
function borrarAlumno() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('Borrar datos de un alumno', 'Matrícula a borrar (se quitan su cuenta, partidas, eventos, lápidas y signos):', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  var mat = String(r.getResponseText()).trim().toUpperCase();
  if (!mat) return;
  var a = contarFilas_('Alumnos', 1, mat), p = contarFilas_('Partidas', 2, mat), e = contarFilas_('Eventos', 2, mat);
  if (!a && !p && !e) { ui.alert('No encontré datos de ' + mat + '.'); return; }
  if (ui.alert('¿Borrar a ' + mat + '?', a + ' cuenta, ' + p + ' partidas y ' + e + ' eventos. Se hará un respaldo antes.', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  var copia = respaldo_();
  var lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    quitarFilas_('Alumnos', 1, mat); quitarFilas_('Partidas', 2, mat); quitarFilas_('Eventos', 2, mat);
    quitarFilas_('Huellas', 2, mat); // v0.30: lápidas y signos
  } finally { lock.releaseLock(); }
  actualizarPanel();
  ui.alert('Listo. Respaldo guardado en tu Drive como «' + copia + '».');
}

/** Borra todo lo de una clave de grupo (p. ej. BETA o PRUEBAS) */
function borrarGrupo() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('Borrar datos de un grupo', 'Clave del grupo a borrar (p. ej. BETA). La clave sigue en «Grupos»; sólo se borran alumnos, partidas, eventos, lápidas y signos:', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  var g = String(r.getResponseText()).trim().toUpperCase();
  if (!g) return;
  var a = contarFilas_('Alumnos', 2, g), p = contarFilas_('Partidas', 3, g), e = contarFilas_('Eventos', 3, g);
  if (!a && !p && !e) { ui.alert('No hay datos del grupo ' + g + '.'); return; }
  if (ui.alert('¿Borrar el grupo ' + g + '?', a + ' alumnos, ' + p + ' partidas y ' + e + ' eventos. Se hará un respaldo antes.', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  var copia = respaldo_();
  var lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    quitarFilas_('Alumnos', 2, g); quitarFilas_('Partidas', 3, g); quitarFilas_('Eventos', 3, g); quitarFilas_('Huellas', 3, g);
  } finally { lock.releaseLock(); }
  actualizarPanel();
  ui.alert('Listo. Respaldo guardado en tu Drive como «' + copia + '».');
}

/** Deja la hoja como nueva (conserva los grupos) */
function borrarTodo() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('Borrar TODO', 'Esto borra TODAS las cuentas, partidas, eventos, lápidas y signos (los grupos se conservan).\nSe guarda un respaldo antes. Escribe BORRAR para confirmar:', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK || String(r.getResponseText()).trim().toUpperCase() !== 'BORRAR') { ui.alert('Cancelado.'); return; }
  var copia = respaldo_();
  var lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    ['Alumnos', 'Partidas', 'Eventos', 'Huellas'].forEach(function (n) {
      var sh = sheet_(n);
      if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
    });
  } finally { lock.releaseLock(); }
  actualizarPanel();
  ui.alert('Hoja limpia. Respaldo guardado en tu Drive como «' + copia + '».');
}

function instalarDisparador() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'actualizarPanel') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('actualizarPanel').timeBased().everyHours(1).create();
}

// ───────────────────────── API ─────────────────────────
function doGet() {
  return json_({ ok: true, msg: 'API de Las Criptas de Hibbelerius activa' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var req = JSON.parse(e.postData.contents);
    lock.waitLock(20000);
    var fn = ACTIONS[req.action];
    if (!fn) throw new Error('Acción desconocida');
    return json_(fn(req));
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

var ACTIONS = {
  register: function (r) {
    var mat = clean_(r.matricula, 12).toUpperCase();
    var grupo = clean_(r.grupo, 20).toUpperCase();
    if (!/^[A-Z0-9_-]{3,12}$/.test(mat)) throw new Error('Matrícula inválida.');
    if (!/^[a-f0-9]{64}$/.test(r.passHash)) throw new Error('Contraseña inválida.');
    if (!grupoActivo_(grupo)) throw new Error('La clave de grupo no existe o está cerrada.');
    var sh = sheet_('Alumnos');
    if (findRow_(sh, 1, mat)) throw new Error('Esa matrícula ya tiene cuenta. Usa "Entrar".');
    var salt = Utilities.getUuid();
    var token = Utilities.getUuid();
    sh.appendRow([mat, grupo, '', '', salt, sha_(salt + r.passHash), token, new Date(), new Date(), '']);
    return { ok: true, token: token, matricula: mat, grupo: grupo, alias: '', avatar: '', grimorio: '' };
  },

  login: function (r) {
    var mat = clean_(r.matricula, 12).toUpperCase();
    var sh = sheet_('Alumnos');
    var row = findRow_(sh, 1, mat);
    if (!row) throw new Error('Matrícula o contraseña incorrecta.');
    var v = sh.getRange(row, 1, 1, HEAD.Alumnos.length).getValues()[0];
    var reinicio = v[5] === 'REINICIAR';
    if (reinicio) {
      // el profesor reinició la contraseña: la que escribió ahora es la nueva
      if (!/^[a-f0-9]{64}$/.test(r.passHash)) throw new Error('Contraseña inválida.');
      var salt = Utilities.getUuid();
      sh.getRange(row, 5, 1, 2).setValues([[salt, sha_(salt + r.passHash)]]);
    } else if (sha_(v[4] + r.passHash) !== v[5]) throw new Error('Matrícula o contraseña incorrecta.');
    var token = Utilities.getUuid();
    sh.getRange(row, 7).setValue(token);
    sh.getRange(row, 9).setValue(new Date());
    // v0.29: expediciones terminadas (para el menú y la Tienda de Layla)
    var exp = 0;
    rows_('Partidas').forEach(function (p) { if (p[1] === mat && p[11] && p[11] !== 'en curso') exp++; });
    return { ok: true, token: token, matricula: mat, grupo: v[1], alias: v[2], avatar: v[3], grimorio: v[9] || '', reinicio: reinicio, expediciones: exp };
  },

  saveProfile: function (r) {
    var u = auth_(r.token);
    u.sh.getRange(u.row, 3).setValue(clean_(r.alias, 16));
    u.sh.getRange(u.row, 4).setValue(clean_(r.avatar, 300));
    return { ok: true };
  },

  startRun: function (r) {
    var u = auth_(r.token);
    var runId = 'R-' + Utilities.getUuid().slice(0, 8);
    sheet_('Partidas').appendRow([runId, u.mat, u.grupo, u.alias, clean_(r.clase, 20), new Date(), new Date(),
      1, 0, '', 0, 'en curso', '', 0, 0, 0, 0, 10, num_(r.gravedad) || 1, 0]);
    return { ok: true, runId: runId };
  },

  updateRun: function (r) {
    var u = auth_(r.token);
    var sh = sheet_('Partidas');
    var row = findRow_(sh, 1, String(r.runId));
    if (!row) {
      // la partida no se registró al iniciar (servidor lento o sin conexión en ese momento): se crea ahora
      if (!/^[LR]-/.test(String(r.runId))) return { ok: true, ignored: true };
      sh.appendRow([String(r.runId), u.mat, u.grupo, u.alias, clean_(r.clase, 20), new Date(), new Date(),
        1, 0, '', 0, 'en curso', '', 0, 0, 0, 0, 10, num_(r.gravedad) || 1, 0]);
      row = sh.getLastRow();
    }
    var cur = sh.getRange(row, 1, 1, HEAD.Partidas.length).getValues()[0];
    if (cur[1] !== u.mat) throw new Error('Partida ajena.');
    cur[6] = new Date();
    cur[7] = num_(r.acto);
    cur[8] = Math.max(num_(cur[8]), num_(r.piso));
    cur[9] = num_(r.vida);
    cur[10] = Math.max(num_(cur[10]), num_(r.puntaje));
    cur[11] = clean_(r.resultado, 20);
    cur[12] = clean_(r.causa, 60);
    cur[13] = num_(r.combates);
    cur[14] = num_(r.elites);
    cur[15] = num_(r.runasOk);
    cur[16] = num_(r.runasTotal);
    cur[17] = num_(r.mazo);
    if (r.gravedad) cur[18] = num_(r.gravedad);
    if (r.minutos !== undefined) cur[19] = Math.max(num_(cur[19]), num_(r.minutos));
    sh.getRange(row, 1, 1, cur.length).setValues([cur]);
    return { ok: true };
  },

  saveCodex: function (r) {
    var u = auth_(r.token);
    u.sh.getRange(u.row, 10).setValue(clean_(r.grimorio, 6000));
    return { ok: true };
  },

  // Ranking: mejor partida de cada alumno (sólo alias, avatar y números; nunca matrícula)
  leaderboard: function (r) {
    var u = auth_(r.token);
    var soloGrupo = r.alcance !== 'todos';
    var alumnos = rows_('Alumnos');
    var info = {};
    alumnos.forEach(function (a) { info[a[0]] = { grupo: a[1], alias: a[2], avatar: a[3] }; });
    var best = {};
    rows_('Partidas').forEach(function (p) {
      var who = info[p[1]];
      if (!who || !who.alias) return;
      if (soloGrupo && who.grupo !== u.grupo) return;
      var b = best[p[1]] || (best[p[1]] = { alias: who.alias, avatar: who.avatar, grupo: who.grupo, puntaje: 0, piso: 0, victorias: 0, gravedad: 0, partidas: 0, yo: p[1] === u.mat });
      b.partidas++;
      b.puntaje = Math.max(b.puntaje, num_(p[10]));
      b.piso = Math.max(b.piso, num_(p[8]));
      if (p[11] === 'victoria') {
        b.victorias++;
        b.gravedad = Math.max(b.gravedad, num_(p[18]) || 1);
      }
    });
    var list = Object.keys(best).map(function (k) { return best[k]; })
      .sort(function (a, b) { return b.puntaje - a.puntaje || b.piso - a.piso; });
    var mine = -1;
    list.forEach(function (x, i) { if (x.yo) mine = i; });
    var top = list.slice(0, 25);
    if (mine >= 25) top.push(list[mine]);
    return { ok: true, grupo: u.grupo, total: list.length, lista: top.map(function (x) {
      return { alias: x.alias, avatar: x.avatar, grupo: x.grupo, puntaje: x.puntaje, piso: x.piso, victorias: x.victorias, gravedad: x.gravedad, partidas: x.partidas, yo: x.yo, lugar: list.indexOf(x) + 1 };
    }) };
  },

  // ── v0.30 · Huellas: lápidas y signos (sólo entre alumnos del mismo grupo; se muestra el alias, nunca la matrícula) ──
  dejarHuella: function (r) {
    var u = auth_(r.token);
    var tipo = r.tipo === 'signo' ? 'signo' : 'lapida';
    var sh = sheet_('Huellas');
    var fila = [new Date(), u.mat, u.grupo, u.alias, tipo, num_(r.acto), num_(r.piso), clean_(r.jefe, 20), clean_(r.datos, 1500), 0, 0];
    if (tipo === 'signo') {
      // un signo por alumno y jefe: se actualiza el anterior
      var datos = rows_('Huellas');
      for (var i = 0; i < datos.length; i++) {
        if (datos[i][1] === u.mat && datos[i][4] === 'signo' && String(datos[i][7]) === fila[7]) {
          sh.getRange(i + 2, 1, 1, 9).setValues([fila.slice(0, 9)]);
          return { ok: true };
        }
      }
    }
    sh.appendRow(fila);
    return { ok: true };
  },

  huellas: function (r) {
    var u = auth_(r.token);
    var acto = num_(r.acto);
    var datos = rows_('Huellas');
    var lapidas = [], signos = [], vistos = {};
    for (var i = datos.length - 1; i >= 0; i--) {
      var h = datos[i];
      if (h[2] !== u.grupo || h[1] === u.mat || num_(h[5]) !== acto) continue;
      var item = { id: i + 2, alias: h[3], tipo: h[4], piso: num_(h[6]), jefe: h[7], datos: h[8] };
      if (h[4] === 'lapida' && lapidas.length < 6) lapidas.push(item);
      if (h[4] === 'signo' && signos.length < 3 && !vistos[h[1]]) { vistos[h[1]] = true; signos.push(item); }
    }
    return { ok: true, lapidas: lapidas, signos: signos };
  },

  usarHuella: function (r) {
    var u = auth_(r.token);
    var sh = sheet_('Huellas');
    var row = num_(r.id);
    if (row < 2 || row > sh.getLastRow()) return { ok: true };
    var h = sh.getRange(row, 1, 1, HEAD.Huellas.length).getValues()[0];
    if (h[2] !== u.grupo || h[1] === u.mat) return { ok: true };
    sh.getRange(row, 10).setValue(num_(h[9]) + 1);
    var quien = clean_(u.alias || 'Alguien', 20);
    var prev = String(h[8] || '');
    // guardamos quién te invocó (los últimos) para el aviso
    try { var d = JSON.parse(prev || '{}'); d.ayudados = (d.ayudados || []).concat([quien]).slice(-5); sh.getRange(row, 9).setValue(clean_(JSON.stringify(d), 1500)); } catch (e) {}
    return { ok: true };
  },

  // ¿tus signos ayudaron a alguien? ¿honraron tus lápidas? (se consulta al entrar al menú)
  avisos: function (r) {
    var u = auth_(r.token);
    var av = avisosHuellas_(u.mat);
    return { ok: true, ayudas: av.ayudas, honras: av.honras, ayudantes: av.quienes };
  },

  // ── v0.30 · Estadísticas para la pantalla de Bayes ──
  estadisticas: function (r) {
    var u = auth_(r.token);
    var partidas = 0, victorias = 0, derrotas = 0, abandonadas = 0, minutos = 0, mejorPiso = 0, mejorActo = 0, combates = 0, elites = 0;
    var causas = {};
    rows_('Partidas').forEach(function (p) {
      if (p[1] !== u.mat) return;
      var res = String(p[11] || '');
      if (!res || res === 'en curso') return;
      partidas++;
      if (res === 'victoria') victorias++;
      else if (res === 'derrota') { derrotas++; var c = String(p[12] || '¿?'); causas[c] = (causas[c] || 0) + 1; }
      else abandonadas++;
      minutos += num_(p[19]);
      combates += num_(p[13]);
      elites += num_(p[14]);
      mejorPiso = Math.max(mejorPiso, num_(p[8]));
      mejorActo = Math.max(mejorActo, num_(p[7]));
    });
    var temas = {};
    var jefes = { 1: 0, 2: 0, 3: 0, 4: 0 };
    // sólo cuentan las preguntas de verdad (no los dones de los ecos ni otros eventos con «concepto»)
    var PREGUNTAS = { runa: 1, encuentro: 1, minijuego_fin: 1 };
    rows_('Eventos').forEach(function (e) {
      if (e[1] !== u.mat) return;
      if (e[4] === 'acto' && (e[6] === true || e[6] === 'TRUE')) {
        try { var a = num_(JSON.parse(e[7] || '{}').acto); if (jefes[a] !== undefined) jefes[a]++; } catch (x) {}
        return;
      }
      if (!PREGUNTAS[e[4]] || !e[5] || e[6] === '') return;
      var t = temas[e[5]] || (temas[e[5]] = [0, 0]);
      t[1]++;
      if (e[6] === true || e[6] === 'TRUE' || e[6] === 'true') t[0]++;
    });
    var lt = Object.keys(temas).map(function (k) { return [k, temas[k][0], temas[k][1]]; });
    var lc = Object.keys(causas).map(function (k) { return [k, causas[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);
    return { ok: true, partidas: partidas, victorias: victorias, derrotas: derrotas, abandonadas: abandonadas, minutos: minutos, mejorPiso: mejorPiso, mejorActo: mejorActo, combates: combates, elites: elites, jefes: jefes, causas: lc, temas: lt };
  },

  logEvent: function (r) {
    var u = auth_(r.token);
    sheet_('Eventos').appendRow([new Date(), u.mat, u.grupo, clean_(r.runId, 20), clean_(r.tipo, 20),
      clean_(r.concepto, 30), r.correcto === '' ? '' : r.correcto === true, clean_(r.detalle, 500)]);
    return { ok: true };
  },
};

// ───────────────────────── Panel docente ─────────────────────────
function actualizarPanel() {
  var ss = SpreadsheetApp.getActive();
  var alumnos = rows_('Alumnos');
  var partidas = rows_('Partidas');
  var eventos = rows_('Eventos');

  var por = {};
  alumnos.forEach(function (a) {
    por[a[0]] = { mat: a[0], grupo: a[1], alias: a[2], ultimo: a[8], partidas: 0, piso: 0, acto: 0, victorias: 0, puntaje: 0, ok: 0, tot: 0, min: 0 };
  });
  partidas.forEach(function (p) {
    var s = por[p[1]];
    if (!s) return;
    s.partidas++;
    s.piso = Math.max(s.piso, num_(p[8]));
    s.acto = Math.max(s.acto, num_(p[7]));
    s.puntaje = Math.max(s.puntaje, num_(p[10]));
    if (p[11] === 'victoria') s.victorias++;
    s.min += num_(p[19]);
  });
  var conc = {};
  eventos.forEach(function (e) {
    if (e[4] !== 'runa') return;
    var s = por[e[1]];
    var ok = e[6] === true || e[6] === 'TRUE';
    if (s) { s.tot++; if (ok) s.ok++; }
    var k = e[2] + '|' + e[5];
    conc[k] = conc[k] || { grupo: e[2], concepto: e[5], tot: 0, ok: 0 };
    conc[k].tot++;
    if (ok) conc[k].ok++;
  });

  var panel = ss.getSheetByName('Panel') || ss.insertSheet('Panel');
  panel.clear();
  panel.clearFormats(); // borra formatos viejos (antes una columna salía en %)
  panel.clearConditionalFormatRules();
  var head = ['Matrícula', 'Grupo', 'Héroe', 'Partidas', 'Piso máx. (de 39)', 'Acto máx.', 'Expedición completa', 'Puntaje máx.',
    'Runas correctas', 'Runas intentadas', '% aciertos', 'Último acceso', 'Minutos jugados', 'Min. por partida'];
  var data = Object.keys(por).map(function (k) {
    var s = por[k];
    return [s.mat, s.grupo, s.alias, s.partidas, s.piso, s.acto, s.victorias > 0 ? 'Sí' : 'No', s.puntaje, s.ok, s.tot,
      s.tot ? s.ok / s.tot : '', s.ultimo, Math.round(s.min), s.partidas ? Math.round(s.min / s.partidas * 10) / 10 : 0];
  }).sort(function (a, b) { return String(a[1]).localeCompare(String(b[1])) || b[4] - a[4]; });
  panel.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#221c2a').setFontColor('#e8c15a');
  if (data.length) {
    panel.getRange(2, 1, data.length, head.length).setValues(data);
    panel.getRange(2, 4, data.length, 7).setNumberFormat('0'); // partidas, pisos, acto, puntaje y runas: enteros
    panel.getRange(2, 7, data.length, 1).setNumberFormat('@');
    panel.getRange(2, 11, data.length, 1).setNumberFormat('0%');
    panel.getRange(2, 12, data.length, 1).setNumberFormat('dd/mm/yyyy hh:mm');
    panel.getRange(2, 13, data.length, 1).setNumberFormat('0');
    panel.getRange(2, 14, data.length, 1).setNumberFormat('0.0');
  }
  panel.setFrozenRows(1);
  panel.autoResizeColumns(1, head.length);

  var cs = ss.getSheetByName('Conceptos') || ss.insertSheet('Conceptos');
  cs.clear();
  var ch = ['Grupo', 'Concepto', 'Intentos', 'Aciertos', '% aciertos'];
  var cd = Object.keys(conc).map(function (k) {
    var c = conc[k];
    return [c.grupo, c.concepto, c.tot, c.ok, c.tot ? c.ok / c.tot : 0];
  }).sort(function (a, b) { return String(a[0]).localeCompare(String(b[0])) || a[4] - b[4]; });
  cs.getRange(1, 1, 1, ch.length).setValues([ch]).setFontWeight('bold').setBackground('#221c2a').setFontColor('#e8c15a');
  if (cd.length) {
    cs.getRange(2, 1, cd.length, ch.length).setValues(cd);
    cs.getRange(2, 5, cd.length, 1).setNumberFormat('0%');
    var rule = SpreadsheetApp.newConditionalFormatRule().setGradientMaxpoint('#9bc96a').setGradientMidpointWithValue('#e8c15a', SpreadsheetApp.InterpolationType.NUMBER, '0.6')
      .setGradientMinpoint('#e05050').setRanges([cs.getRange(2, 5, cd.length, 1)]).build();
    cs.setConditionalFormatRules([rule]);
  }
  cs.setFrozenRows(1);
  cs.autoResizeColumns(1, ch.length);
  resumenGrupos_(ss, alumnos, partidas, eventos);
  panel.getRange(1, 16).setValue('Actualizado: ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'));
}

// ───────────────────────── Resumen por grupo y actividad por día ─────────────────────────
function resumenGrupos_(ss, alumnos, partidas, eventos) {
  var G = {};
  var g = function (k) {
    return G[k] || (G[k] = { grupo: k, registrados: 0, jugaron: {}, partidas: 0, min: 0, completas: 0, pisos: 0, ok: 0, tot: 0, ultima: '' });
  };
  alumnos.forEach(function (a) { g(a[1]).registrados++; });
  partidas.forEach(function (p) {
    var x = g(p[2]);
    x.partidas++;
    x.jugaron[p[1]] = true;
    x.min += num_(p[19]);
    x.pisos += num_(p[8]);
    if (p[11] === 'victoria') x.completas++;
    if (!x.ultima || p[6] > x.ultima) x.ultima = p[6];
  });
  eventos.forEach(function (e) {
    if (e[4] !== 'runa') return;
    var x = g(e[2]);
    x.tot++;
    if (e[6] === true || e[6] === 'TRUE') x.ok++;
  });
  var rs = ss.getSheetByName('Resumen') || ss.insertSheet('Resumen');
  rs.clear();
  rs.clearFormats();
  var h = ['Grupo', 'Alumnos registrados', 'Alumnos que jugaron', 'Partidas', 'Horas jugadas', 'Min. por partida',
    'Min. por alumno', 'Expediciones completas', '% completas', 'Piso promedio', '% aciertos', 'Última actividad'];
  var d = Object.keys(G).sort().map(function (k) {
    var x = G[k];
    var n = Object.keys(x.jugaron).length;
    return [x.grupo, x.registrados, n, x.partidas, Math.round(x.min / 6) / 10, x.partidas ? Math.round(x.min / x.partidas * 10) / 10 : 0,
      n ? Math.round(x.min / n * 10) / 10 : 0, x.completas, x.partidas ? x.completas / x.partidas : 0,
      x.partidas ? Math.round(x.pisos / x.partidas * 10) / 10 : 0, x.tot ? x.ok / x.tot : '', x.ultima];
  });
  rs.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight('bold').setBackground('#221c2a').setFontColor('#e8c15a');
  if (d.length) {
    rs.getRange(2, 1, d.length, h.length).setValues(d);
    rs.getRange(2, 5, d.length, 3).setNumberFormat('0.0');
    rs.getRange(2, 9, d.length, 1).setNumberFormat('0%');
    rs.getRange(2, 11, d.length, 1).setNumberFormat('0%');
    rs.getRange(2, 12, d.length, 1).setNumberFormat('dd/mm/yyyy hh:mm');
  }
  rs.setFrozenRows(1);
  rs.autoResizeColumns(1, h.length);

  // Actividad por día: cuántas partidas, alumnos y minutos (según el día en que inició cada partida)
  var A = {};
  var tz = Session.getScriptTimeZone();
  partidas.forEach(function (p) {
    if (!(p[5] instanceof Date)) return;
    var dia = Utilities.formatDate(p[5], tz, 'yyyy-MM-dd');
    var k = dia + '|' + p[2];
    var x = A[k] || (A[k] = { dia: dia, grupo: p[2], partidas: 0, alumnos: {}, min: 0, completas: 0 });
    x.partidas++;
    x.alumnos[p[1]] = true;
    x.min += num_(p[19]);
    if (p[11] === 'victoria') x.completas++;
  });
  var as = ss.getSheetByName('Actividad') || ss.insertSheet('Actividad');
  as.clear();
  as.clearFormats();
  var ah = ['Día', 'Grupo', 'Partidas iniciadas', 'Alumnos distintos', 'Minutos jugados', 'Min. por alumno', 'Expediciones completas'];
  var ad = Object.keys(A).sort().map(function (k) {
    var x = A[k];
    var n = Object.keys(x.alumnos).length;
    return [x.dia, x.grupo, x.partidas, n, Math.round(x.min), n ? Math.round(x.min / n * 10) / 10 : 0, x.completas];
  });
  as.getRange(1, 1, 1, ah.length).setValues([ah]).setFontWeight('bold').setBackground('#221c2a').setFontColor('#e8c15a');
  if (ad.length) {
    as.getRange(2, 1, ad.length, ah.length).setValues(ad);
    as.getRange(2, 5, ad.length, 2).setNumberFormat('0.0');
  }
  as.setFrozenRows(1);
  as.autoResizeColumns(1, ah.length);
}

// ───────────────────────── utilidades ─────────────────────────
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function sheet_(n) {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(n);
  if (!sh && HEAD[n]) {
    // hojas nuevas de versiones posteriores (p. ej. Huellas) se crean solas
    sh = ss.insertSheet(n);
    sh.getRange(1, 1, 1, HEAD[n].length).setValues([HEAD[n]]).setFontWeight('bold').setBackground('#221c2a').setFontColor('#e8c15a');
    sh.setFrozenRows(1);
  }
  if (!sh) throw new Error('Falta la hoja ' + n + '. Ejecuta setup().');
  return sh;
}
function rows_(n) {
  var sh = sheet_(n);
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, HEAD[n].length).getValues();
}
function findRow_(sh, col, value) {
  if (sh.getLastRow() < 2) return 0;
  var f = sh.getRange(2, col, sh.getLastRow() - 1, 1).createTextFinder(String(value)).matchEntireCell(true).findNext();
  return f ? f.getRow() : 0;
}
function auth_(token) {
  if (!token) throw new Error('Sesión inválida. Vuelve a entrar.');
  var sh = sheet_('Alumnos');
  var row = findRow_(sh, 7, token);
  if (!row) throw new Error('Tu sesión expiró. Vuelve a entrar.');
  var v = sh.getRange(row, 1, 1, 3).getValues()[0];
  return { sh: sh, row: row, mat: v[0], grupo: v[1], alias: v[2] };
}
function grupoActivo_(clave) {
  return rows_('Grupos').some(function (g) {
    return String(g[0]).toUpperCase() === clave && (g[2] === true || String(g[2]).toUpperCase() === 'TRUE');
  });
}
function sha_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}
function clean_(v, max) {
  // evita fórmulas inyectadas en la hoja
  var s = String(v == null ? '' : v).slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function num_(v) {
  var n = Number(v);
  return isFinite(n) ? n : 0;
}

// ───────────────────────── v0.30 · Huellas: avisos al iniciar sesión ─────────────────────────
function avisosHuellas_(mat) {
  var out = { ayudas: 0, honras: 0, quienes: [] };
  var sh = SpreadsheetApp.getActive().getSheetByName('Huellas');
  if (!sh || sh.getLastRow() < 2) return out;
  var datos = sh.getRange(2, 1, sh.getLastRow() - 1, HEAD.Huellas.length).getValues();
  for (var i = 0; i < datos.length; i++) {
    var h = datos[i];
    if (h[1] !== mat) continue;
    var nuevos = num_(h[9]) - num_(h[10]);
    if (nuevos <= 0) continue;
    if (h[4] === 'signo') {
      out.ayudas += nuevos;
      try { out.quienes = out.quienes.concat(JSON.parse(h[8] || '{}').ayudados || []); } catch (e) {}
    } else out.honras += nuevos;
    sh.getRange(i + 2, 11).setValue(num_(h[9]));
  }
  out.quienes = out.quienes.slice(-3);
  return out;
}


/**
 * Fuel & Form: Google Sheet API
 *
 * Paste this into Extensions > Apps Script of the sheet the app should use
 * (a copy of your original is recommended), set SECRET below, then
 * Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone.
 *
 * The app sends every request as POST with the secret in the body.
 * Only the columns listed in MANAGED are ever read or written.
 * Any other column (for example "Details about me", "Average kcal",
 * "Total Steps") is never returned and never changed.
 */

const SECRET = 'CHANGE_ME_TO_A_LONG_RANDOM_TEXT';
const SHEET_NAME = ''; // leave empty to use the first tab

// key used by the app -> start of the header text in row 1 (case-insensitive)
const MANAGED = {
  day: 'day',
  weight: 'weight',
  training: 'training',
  steps: 'steps',
  kcal: 'kcal',
  protein: 'protein',
  carbs: 'carbs',
  fat: 'fat',
  fiber: 'fiber',
  sat: 'saturated fat', // optional: add a "Saturated fat" column to keep it
  hunger: 'hunger',
  sleep: 'sleep',
  binge: 'binge',
  notes: 'notes on what was eaten'
};

function doGet() {
  return out({ ok: true, info: 'Fuel & Form sheet API. Use POST.' });
}

function doPost(e) {
  var req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return out({ error: 'bad request' });
  }
  if (!req || req.key !== SECRET || SECRET === 'CHANGE_ME_TO_A_LONG_RANDOM_TEXT') {
    return out({ error: 'unauthorized' });
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = getSheet();
    if (req.action === 'list') return out({ rows: listRows(sh) });
    if (req.action === 'upsert') return out(upsert(sh, req.row));
    return out({ error: 'unknown action' });
  } catch (err) {
    return out({ error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  var ss = SpreadsheetApp.getActive();
  return SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
}

function columns(sh) {
  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
    .map(function (h) { return String(h).trim().toLowerCase(); });
  var c = {};
  for (var k in MANAGED) {
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].indexOf(MANAGED[k]) === 0) { c[k] = i + 1; break; }
    }
  }
  return c;
}

function dayStr(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'd/M/yyyy');
  return String(v).trim();
}

function listRows(sh) {
  var c = columns(sh);
  if (!c.day) throw new Error('No "Day" column found in row 1');
  var n = sh.getLastRow() - 1;
  if (n < 1) return [];
  var vals = sh.getRange(2, 1, n, sh.getLastColumn()).getValues();
  var rows = [];
  vals.forEach(function (r) {
    if (r[c.day - 1] === '' || r[c.day - 1] === null) return;
    var o = {};
    for (var k in c) {
      var v = r[c[k] - 1];
      if (k === 'day') v = dayStr(v);
      else if (v instanceof Date) v = '';
      o[k] = v;
    }
    rows.push(o);
  });
  return rows;
}

function upsert(sh, row) {
  var c = columns(sh);
  if (!c.day) throw new Error('No "Day" column found in row 1');
  if (!row || !row.day) throw new Error('Missing day');
  var last = sh.getLastRow();
  var days = last > 1
    ? sh.getRange(2, c.day, last - 1, 1).getValues().map(function (r) { return dayStr(r[0]); })
    : [];
  var idx = days.indexOf(String(row.day));
  var r;
  if (idx >= 0) {
    r = idx + 2;
  } else {
    r = last + 1;
    // plain text so 5/10/2026 is never turned into a different date
    sh.getRange(r, c.day).setNumberFormat('@').setValue(String(row.day));
  }
  for (var k in c) {
    if (k === 'day' || !(k in row)) continue;
    var cell = sh.getRange(r, c[k]);
    var old = cell.getValue();
    var oldNorm = String(old).toLowerCase() === 'no data' ? '' : old;
    var nv = row[k];
    if (nv === null || nv === undefined) nv = '';
    if (String(oldNorm) !== String(nv)) cell.setValue(nv);
  }
  return { ok: true, row: r };
}

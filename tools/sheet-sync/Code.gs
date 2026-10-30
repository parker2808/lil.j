/**
 * MJ Universe → Parker's Google Sheet.
 * Paste into Extensions → Apps Script of the sheet, run `setup` once, then Deploy as a Web app
 * (Execute as: Me, Who has access: Anyone). Instructions: tools/sheet-sync/README.md.
 *
 * The web app URL can only append or update rows here. It never returns sheet data.
 */

var TIME_ZONE = "Asia/Ho_Chi_Minh";
var TABS = {
  dreams: {
    name: "Lựa chọn",
    header: ["Cập nhật lúc", "Thiết bị", "Các việc em chọn", "Mã lựa chọn", "Thử nghiệm"],
  },
  wish: {
    name: "Điều ước",
    header: ["Lúc gửi", "Thiết bị", "Điều ước", "Mã điều ước", "Thử nghiệm"],
  },
};
var ID_PATTERN = /^[A-Za-z0-9-]{6,64}$/;
var DREAM_ID_PATTERN = /^d\d{1,2}$/;
var MAX_BODY = 4096;
var MAX_TEXT = 180;
var MAX_DREAMS = 20;

function doPost(e) {
  var data = parseRequest(e);
  if (!data) return reply({ ok: false, error: "invalid" });
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    return reply(data.kind === "dreams" ? saveDreams(data) : saveWish(data));
  } finally {
    lock.releaseLock();
  }
}

/** Opening the URL in a browser only confirms the deploy works. */
function doGet() {
  return reply({ ok: true, note: "MJ Universe sheet is ready" });
}

/** Run once from the Apps Script editor: time zone, tabs and headers. */
function setup() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  book.setSpreadsheetTimeZone(TIME_ZONE);
  tab("dreams");
  tab("wish");
}

function parseRequest(e) {
  var body = e && e.postData && typeof e.postData.contents === "string" ? e.postData.contents : "";
  if (!body || body.length > MAX_BODY) return null;
  var data;
  try {
    data = JSON.parse(body);
  } catch (error) {
    return null;
  }
  if (!data || typeof data !== "object" || data.v !== 1) return null;
  if (typeof data.visitor !== "string" || !ID_PATTERN.test(data.visitor)) return null;
  if (typeof data.at !== "number" || !isFinite(data.at) || data.at <= 0) return null;
  var base = { visitor: data.visitor, at: data.at, test: data.test === true };
  if (data.kind === "dreams") return readDreams(data, base);
  if (data.kind === "wish") return readWish(data, base);
  return null;
}

function readDreams(data, base) {
  var ids = data.ids;
  var items = data.items;
  if (!Array.isArray(ids) || !Array.isArray(items) || ids.length !== items.length || ids.length > MAX_DREAMS) return null;
  for (var i = 0; i < ids.length; i += 1) {
    if (typeof ids[i] !== "string" || !DREAM_ID_PATTERN.test(ids[i])) return null;
    if (typeof items[i] !== "string" || !items[i].trim() || items[i].length > MAX_TEXT) return null;
  }
  base.kind = "dreams";
  base.ids = ids;
  base.items = items.map(function (item) {
    return item.trim();
  });
  return base;
}

function readWish(data, base) {
  if (typeof data.id !== "string" || !ID_PATTERN.test(data.id)) return null;
  if (typeof data.text !== "string") return null;
  var text = data.text.trim();
  if (!text || text.length > MAX_TEXT) return null;
  base.kind = "wish";
  base.id = data.id;
  base.text = text;
  return base;
}

/** One row per device. A newer list replaces it; an older one arriving late is ignored. */
function saveDreams(data) {
  var sheet = tab("dreams");
  var row = findRow(sheet, 2, data.visitor);
  var values = [
    new Date(data.at),
    data.visitor,
    data.items.length ? plain(data.items.join(", ")) : "(chưa chọn gì)",
    data.ids.join(","),
    data.test ? "có" : "",
  ];
  if (row === 0) {
    sheet.appendRow(values);
    return { ok: true };
  }
  var saved = sheet.getRange(row, 1).getValue();
  if (saved instanceof Date && saved.getTime() > data.at) return { ok: true, skipped: "older" };
  sheet.getRange(row, 1, 1, values.length).setValues([values]);
  return { ok: true };
}

/** One row per wish. A retry of the same wish is not added twice. */
function saveWish(data) {
  var sheet = tab("wish");
  if (findRow(sheet, 4, data.id) !== 0) return { ok: true, skipped: "duplicate" };
  sheet.appendRow([new Date(data.at), data.visitor, plain(data.text), data.id, data.test ? "có" : ""]);
  return { ok: true };
}

function tab(kind) {
  var spec = TABS[kind];
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(spec.name) || book.insertSheet(spec.name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(spec.header);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** 1-based row whose `column` equals `value`, or 0. Row 1 is the header. */
function findRow(sheet, column, value) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var cells = sheet.getRange(2, column, last - 1, 1).getValues();
  for (var i = 0; i < cells.length; i += 1) {
    if (cells[i][0] === value) return i + 2;
  }
  return 0;
}

/** Text that starts like a formula is stored as text, never run. */
function plain(text) {
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

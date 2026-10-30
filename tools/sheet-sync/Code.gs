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
    header: ["Cập nhật lúc", "Tên gợi nhớ", "Thiết bị", "Các việc em chọn", "Thử nghiệm", "Mã trình duyệt", "Mã lựa chọn"],
  },
  wish: {
    name: "Điều ước",
    header: ["Lúc gửi", "Tên gợi nhớ", "Thiết bị", "Điều ước", "Thử nghiệm", "Mã trình duyệt", "Mã điều ước"],
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
    deviceTab();
    return reply(data.kind === "dreams" ? saveDreams(data) : saveWish(data));
  } finally {
    lock.releaseLock();
  }
}

/** Opening the URL in a browser only confirms the deploy works. */
function doGet() {
  return reply({ ok: true, note: "MJ Universe sheet is ready" });
}

/** Run after pasting an upgrade too. Old tabs are backed up before columns move. */
function setup() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var book = SpreadsheetApp.getActiveSpreadsheet();
    book.setSpreadsheetTimeZone(TIME_ZONE);
    deviceTab();
    ["dreams", "wish"].forEach(function (kind) {
      var sheet = tab(kind);
      formatTable(sheet, false);
      for (var row = 2; row <= sheet.getLastRow(); row += 1) {
        var visitor = sheet.getRange(row, 6).getValue();
        if (typeof visitor === "string" && ID_PATTERN.test(visitor)) {
          rememberDevice({ visitor: visitor, device: null });
          setAlias(sheet, row);
        }
      }
    });
    formatTable(deviceTab(), true);
  } finally { lock.releaseLock(); }
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu("MJ Universe")
    .addItem("Cập nhật định dạng bảng", "setup").addToUi();
}

function readDevice(value) {
  if (!value || typeof value !== "object") return null;
  var platforms = ["iPhone", "iPad", "Android", "Mac", "Windows", "Linux", "Unknown"];
  var browsers = ["Safari", "Chrome", "Firefox", "Edge", "Samsung Internet", "Unknown"];
  if (platforms.indexOf(value.platform) < 0 || browsers.indexOf(value.browser) < 0) return null;
  return { platform: value.platform, browser: value.browser };
}

function deviceLabel(device) {
  if (!device) return "";
  return [device.platform, device.browser].filter(function (s) { return s !== "Unknown"; }).join(" · ");
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
  var device = readDevice(data.device);
  if (data.device != null && !device) return null;
  var base = { visitor: data.visitor, at: data.at, test: data.test === true, device: device };
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

/** One row per browser AND test mode. Stale retries cannot replace a newer selection. */
function saveDreams(data) {
  var sheet = tab("dreams");
  var row = findDreamRow(sheet, data.visitor, data.test);
  if (row) {
    var saved = sheet.getRange(row, 1).getValue();
    if (saved instanceof Date && saved.getTime() > data.at) return { ok: true, skipped: "older" };
  }
  rememberDevice(data);
  var label = deviceLabel(data.device) || (row ? sheet.getRange(row, 3).getValue() : "");
  var values = [new Date(data.at), "", label,
    data.items.length ? plain(data.items.join("\n")) : "(chưa chọn gì)",
    data.test ? "có" : "", data.visitor, data.ids.join(",")];
  if (!row) { sheet.appendRow(values); row = sheet.getLastRow(); }
  else sheet.getRange(row, 1, 1, values.length).setValues([values]);
  finishRow(sheet, row);
  return { ok: true };
}

function saveWish(data) {
  var sheet = tab("wish");
  if (findRow(sheet, 7, data.id)) return { ok: true, skipped: "duplicate" };
  rememberDevice(data);
  sheet.appendRow([new Date(data.at), "", deviceLabel(data.device), plain(data.text),
    data.test ? "có" : "", data.visitor, data.id]);
  finishRow(sheet, sheet.getLastRow());
  return { ok: true };
}

function findDreamRow(sheet, visitor, test) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var rows = sheet.getRange(2, 5, last - 1, 2).getValues();
  for (var i = 0; i < rows.length; i += 1) {
    if (rows[i][1] === visitor && (rows[i][0] === "có") === test) return i + 2;
  }
  return 0;
}

function deviceTab() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName("Thiết bị");
  if (!sheet) {
    sheet = book.insertSheet("Thiết bị");
    sheet.appendRow(["Mã trình duyệt", "Tên gợi nhớ", "Thiết bị"]);
    formatTable(sheet, true);
  }
  return sheet;
}

function rememberDevice(data) {
  var sheet = deviceTab();
  var row = findRow(sheet, 1, data.visitor);
  var label = deviceLabel(data.device);
  if (!row) { sheet.appendRow([data.visitor, "", label]); row = sheet.getLastRow(); }
  else if (label) sheet.getRange(row, 3).setValue(label);
  // Column B is Parker's input. Never overwrite it when a browser sends again.
  sheet.getRange(row, 1, 1, 3).setWrap(true).setVerticalAlignment("top");
}

function setAlias(sheet, row) {
  var lookup = "VLOOKUP(F" + row + ",'Thiết bị'!A:B,2,FALSE)";
  sheet.getRange(row, 2).setFormula('=IFERROR(IF(' + lookup + '="","",' + lookup + '),"")');
}

function finishRow(sheet, row) {
  setAlias(sheet, row);
  sheet.getRange(row, 1).setNumberFormat("dd/MM/yyyy HH:mm");
  sheet.getRange(row, 1, 1, 7).setWrap(true).setVerticalAlignment("top");
  sheet.autoResizeRows(row, 1);
}

function tab(kind) {
  var spec = TABS[kind];
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(spec.name) || book.insertSheet(spec.name);
  if (!sheet.getLastRow()) {
    sheet.appendRow(spec.header);
    formatTable(sheet, false);
    return sheet;
  }
  var header = sheet.getRange(1, 1, 1, 7).getValues()[0];
  if (header.join("|") === spec.header.join("|")) return sheet;
  var legacy = [spec.header[0], "Thiết bị", spec.header[3], spec.header[6], "Thử nghiệm"];
  if (header.slice(0, 5).join("|") !== legacy.join("|") || header.slice(5).some(function (v) { return v !== ""; })) {
    throw new Error("Unexpected columns in " + spec.name + ". Restore the documented headers before setup.");
  }
  // Copy first, then migrate under the same script lock. Never erase the live sheet.
  sheet.copyTo(book).setName(spec.name + " backup " + Date.now());
  var old = sheet.getRange(1, 1, sheet.getLastRow(), 5).getValues();
  var rows = [spec.header].concat(old.slice(1).map(function (r) {
    return [r[0], "", "", typeof r[2] === "string" ? plain(r[2]) : r[2], r[4], r[1], r[3]];
  }));
  sheet.getRange(1, 1, rows.length, 7).setValues(rows);
  formatTable(sheet, false);
  for (var row = 2; row <= rows.length; row += 1) setAlias(sheet, row);
  return sheet;
}

/** Table-style ranges; no Advanced Sheets service or extra setup is required. */
function formatTable(sheet, devices) {
  var columns = devices ? 3 : 7;
  var rows = sheet.getMaxRows();
  sheet.setFrozenRows(1).setHiddenGridlines(true).setTabColor("#d995b5");
  var range = sheet.getRange(1, 1, rows, columns);
  range.setFontFamily("Arial").setFontSize(11).setFontColor("#432b39").setVerticalAlignment("top").setWrap(true);
  sheet.getBandings().forEach(function (band) { band.remove(); });
  range.applyRowBanding().setHeaderRowColor("#f1d6e3").setFirstRowColor("#ffffff").setSecondRowColor("#fcf5f8");
  sheet.getRange(1, 1, 1, columns).setFontWeight("bold").setFontColor("#563348");
  sheet.setRowHeight(1, 40);
  // Preserve existing filter choices on repeated formatting.
  if (!sheet.getFilter()) range.createFilter();
  if (devices) {
    sheet.setColumnWidth(1, 280).setColumnWidth(2, 180).setColumnWidth(3, 200);
    sheet.getRange(2, 2, rows - 1, 1).setBackground("#fff5de");
    sheet.getRange(1, 2).setNote("Anh tự đặt tên sau khi xác định được thiết bị. Website không đọc được tên máy của chủ máy.");
  } else {
    sheet.setColumnWidth(1, 155).setColumnWidth(2, 155).setColumnWidth(3, 170).setColumnWidth(4, 380).setColumnWidth(5, 110);
    sheet.hideColumns(6, 2);
    sheet.getRange(2, 1, rows - 1, 1).setNumberFormat("dd/MM/yyyy HH:mm");
    sheet.getRange(1, 2).setNote("Tên được lấy từ tab Thiết bị; sửa tên ở tab đó để cập nhật cả hai bảng.");
    var rule = SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("có").setBackground("#fff0ce")
      .setRanges([sheet.getRange(2, 5, rows - 1, 1)]).build();
    // Replace only our test-cell rule; retain other rules Parker may have added.
    var rules = sheet.getConditionalFormatRules().filter(function (r) {
      var condition = r.getBooleanCondition();
      return !(condition && String(condition.getCriteriaType()) === "TEXT_EQUAL_TO" && String(condition.getCriteriaValues()[0]) === "có"
        && r.getRanges().length === 1 && r.getRanges()[0].getColumn() === 5);
    });
    sheet.setConditionalFormatRules(rules.concat([rule]));
  }
  if (sheet.getLastRow() > 1) sheet.autoResizeRows(2, sheet.getLastRow() - 1);
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

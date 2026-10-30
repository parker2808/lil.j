import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const {
  OUTBOX_LIMIT,
  emptyOutbox,
  flushOutbox,
  payloadFor,
  pending,
  readOutbox,
  withDreams,
  withWish,
  without,
} = await import("../src/lib/sheet-outbox.ts");

const dreams = (ids, at) => ({ kind: "dreams", ids, items: ids.map((id) => `item ${id}`), at, test: false });
const wish = (id, at = 1) => ({ kind: "wish", id, text: `wish ${id}`, at, test: false });

describe("outbox", () => {
  it("keeps only the latest dreams list", () => {
    const box = withDreams(withDreams(emptyOutbox(), dreams(["d1"], 1)), dreams(["d1", "d2"], 2));
    assert.deepEqual(box.dreams?.ids, ["d1", "d2"]);
  });

  it("adds a wish once and caps the queue", () => {
    let box = withWish(emptyOutbox(), wish("w-000001"));
    box = withWish(box, wish("w-000001"));
    assert.equal(box.wishes.length, 1);
    for (let index = 0; index < OUTBOX_LIMIT + 5; index += 1) box = withWish(box, wish(`w-${index}`));
    assert.equal(box.wishes.length, OUTBOX_LIMIT);
  });

  it("keeps a newer dreams list queued while an older one was sending", () => {
    const sent = dreams(["d1"], 1);
    const newer = withDreams(emptyOutbox(), dreams(["d2"], 2));
    assert.deepEqual(without(newer, sent).dreams?.ids, ["d2"]);
    assert.equal(without(withDreams(emptyOutbox(), sent), sent).dreams, null);
  });

  it("stops at the first failed send and keeps the rest", async () => {
    let stored = withWish(withWish(withDreams(emptyOutbox(), dreams(["d1"], 1)), wish("w-aaaaaa")), wish("w-bbbbbb"));
    const sent = [];
    const all = await flushOutbox(
      () => stored,
      (next) => {
        stored = next;
      },
      async (entry) => {
        sent.push(entry.kind === "wish" ? entry.id : "dreams");
        return entry.kind === "wish" && entry.id === "w-aaaaaa" ? "retry" : "done";
      },
    );
    assert.equal(all, false);
    assert.deepEqual(sent, ["dreams", "w-aaaaaa"]);
    assert.equal(stored.dreams, null);
    assert.deepEqual(stored.wishes.map((item) => item.id), ["w-aaaaaa", "w-bbbbbb"]);
  });

  it("keeps a wish queued during the flush", async () => {
    let stored = withWish(emptyOutbox(), wish("w-aaaaaa"));
    const all = await flushOutbox(
      () => stored,
      (next) => {
        stored = next;
      },
      async () => {
        stored = withWish(stored, wish("w-later1"));
        return "done";
      },
    );
    assert.equal(all, true);
    assert.deepEqual(pending(stored).map((item) => item.id), ["w-later1"]);
  });

  it("sends nothing beyond the visitor id and the entry", () => {
    assert.deepEqual(Object.keys(payloadFor(dreams(["d1"], 5), "visitor-1")).sort(), [
      "at", "ids", "items", "kind", "test", "v", "visitor",
    ]);
    assert.deepEqual(Object.keys(payloadFor(wish("w-aaaaaa", 5), "visitor-1")).sort(), [
      "at", "id", "kind", "test", "text", "v", "visitor",
    ]);
  });

  it("drops malformed stored entries", () => {
    const box = readOutbox({
      dreams: { kind: "dreams", ids: ["d1"], items: [], at: 1 },
      wishes: [wish("w-aaaaaa"), { kind: "wish", id: "w-bbbbbb", text: "   ", at: 1 }, { kind: "wish", id: 4, text: "x", at: 1 }, wish("w-aaaaaa")],
    });
    assert.equal(box.dreams, null);
    assert.deepEqual(box.wishes.map((item) => item.id), ["w-aaaaaa"]);
    assert.deepEqual(readOutbox("nope"), emptyOutbox());
  });
});

function fakeSheet() {
  const rows = [];
  return {
    rows,
    appendRow(values) {
      rows.push([...values]);
    },
    getLastRow() {
      return rows.length;
    },
    setFrozenRows() {},
    getRange(row, column, rowCount = 1, columnCount = 1) {
      return {
        getValue: () => rows[row - 1][column - 1],
        getValues: () => rows.slice(row - 1, row - 1 + rowCount).map((cells) => cells.slice(column - 1, column - 1 + columnCount)),
        setValues: (values) => {
          values.forEach((cells, i) => cells.forEach((value, j) => {
            rows[row - 1 + i][column - 1 + j] = value;
          }));
        },
      };
    },
  };
}

function loadScript() {
  const sheets = new Map();
  const book = {
    zone: "",
    getSheetByName: (name) => sheets.get(name) ?? null,
    insertSheet: (name) => {
      const sheet = fakeSheet();
      sheets.set(name, sheet);
      return sheet;
    },
    setSpreadsheetTimeZone(zone) {
      this.zone = zone;
    },
  };
  const context = vm.createContext({
    SpreadsheetApp: { getActiveSpreadsheet: () => book },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: (text) => ({ setMimeType: () => JSON.parse(text) }),
    },
  });
  vm.runInContext(readFileSync(new URL("../../tools/sheet-sync/Code.gs", import.meta.url), "utf8"), context);
  const post = (body) => context.doPost({ postData: { contents: typeof body === "string" ? body : JSON.stringify(body) } });
  return { context, book, sheets, post };
}

const VISITOR = "0f8e7c2a-1b2c-4d5e-8f90-123456789abc";

describe("apps script", () => {
  it("sets up both tabs in Vietnam time", () => {
    const { context, book, sheets } = loadScript();
    context.setup();
    assert.equal(book.zone, "Asia/Ho_Chi_Minh");
    assert.equal(sheets.get("Lựa chọn").rows[0][0], "Cập nhật lúc");
    assert.equal(sheets.get("Điều ước").rows[0][2], "Điều ước");
    assert.equal(context.doGet().ok, true);
  });

  it("refuses malformed requests without writing", () => {
    const { post, sheets } = loadScript();
    const bad = [
      "not json",
      { v: 2, kind: "wish", visitor: VISITOR, at: 1, id: "w-aaaaaa", text: "x" },
      { v: 1, kind: "wish", visitor: "short", at: 1, id: "w-aaaaaa", text: "x" },
      { v: 1, kind: "wish", visitor: VISITOR, at: 1, id: "w-aaaaaa", text: "x".repeat(181) },
      { v: 1, kind: "wish", visitor: VISITOR, at: 1, id: "w-aaaaaa", text: "   " },
      { v: 1, kind: "dreams", visitor: VISITOR, at: 1, ids: ["x1"], items: ["A"] },
      { v: 1, kind: "dreams", visitor: VISITOR, at: 1, ids: ["d1"], items: [] },
      { v: 1, kind: "other", visitor: VISITOR, at: 1 },
      "x".repeat(5000),
    ];
    for (const body of bad) assert.deepEqual(post(body), { ok: false, error: "invalid" });
    assert.equal(sheets.size, 0);
  });

  it("keeps one dreams row per device and ignores a late older list", () => {
    const { post, sheets } = loadScript();
    const send = (ids, at) => post({ v: 1, kind: "dreams", visitor: VISITOR, at, ids, items: ids.map((id) => `Việc ${id}`), test: true });
    assert.equal(send(["d1"], 1000).ok, true);
    assert.equal(send(["d1", "d3"], 3000).ok, true);
    assert.equal(send(["d2"], 2000).skipped, "older");
    const rows = sheets.get("Lựa chọn").rows;
    assert.equal(rows.length, 2);
    assert.equal(rows[1][2], "Việc d1, Việc d3");
    assert.equal(rows[1][3], "d1,d3");
    assert.equal(rows[1][4], "có");
    send([], 4000);
    assert.equal(rows[1][2], "(chưa chọn gì)");
  });

  it("adds each wish once and stores formula-like text as text", () => {
    const { post, sheets } = loadScript();
    const body = { v: 1, kind: "wish", visitor: VISITOR, at: 5000, id: "w-aaaaaa", text: "=IMPORTXML(\"x\")" };
    assert.equal(post(body).ok, true);
    assert.equal(post(body).skipped, "duplicate");
    const rows = sheets.get("Điều ước").rows;
    assert.equal(rows.length, 2);
    assert.equal(rows[1][2], "'=IMPORTXML(\"x\")");
    assert.equal(rows[1][4], "");
  });
});

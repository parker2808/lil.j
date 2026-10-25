import assert from "node:assert/strict";
import { elapsedParts, fillTemplate, nicknamesMatch, todayKey } from "../src/lib/pure.ts";

assert.equal(nicknamesMatch("  Bé   YÊU ", "bé yêu"), true);
assert.equal(nicknamesMatch("be yeu", "bé yêu"), false);
assert.equal(nicknamesMatch("bé yêu", "bé yêu"), true);

const parts = elapsedParts("2024-02-14T19:30:00+07:00", new Date("2024-02-15T19:30:05+07:00"));
assert.equal(parts.future, false);
assert.equal(parts.days, 1);
assert.equal(parts.hours, 0);
assert.equal(parts.minutes, 0);
assert.equal(parts.seconds, 5);

const future = elapsedParts("2026-01-02T00:00:00Z", new Date("2026-01-01T00:00:00Z"));
assert.equal(future.future, true);
assert.equal(future.days, 1);

assert.equal(fillTemplate("Đã bên nhau {days} ngày {hours} giờ", { days: 3, hours: 4 }), "Đã bên nhau 3 ngày 4 giờ");
assert.equal(todayKey(new Date(2026, 9, 5, 23, 30)), "2026-10-05");

console.log("selfcheck ok");

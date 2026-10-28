import assert from "node:assert/strict";
import { content, validateContent } from "../src/content.ts";

const problem = validateContent(content);
assert.equal(problem, null);
assert.equal(content.startDate, "2026-07-01T00:00:00+07:00");
assert.equal(content.firstMeeting, "2022-11-18");
assert.notEqual(content.firstMeeting, content.startDate.slice(0, 10));
assert.equal(content.birth.when, "2002-11-18T16:45:00+07:00");
assert.equal(content.birth.timeConfirmed, true);
assert.deepEqual(content.memoryPhotoIds, [
  "care-01",
  "care-02",
  "pout-01",
  "pout-02",
  "surprise-01",
  "surprise-02",
]);
assert.deepEqual(
  content.photos.filter((photo) => photo.pair).map((photo) => photo.id),
  content.memoryPhotoIds,
);
for (const era of content.eras) {
  assert.equal(era.kind, "together");
  assert.match(era.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(!Number.isNaN(Date.parse(`${era.date}T00:00:00+07:00`)));
}

console.log("content-check ok");

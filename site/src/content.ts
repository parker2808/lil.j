import rawJson from "../content.json";
import { FLOW } from "./lib/flow.ts";
import { collectCopyProblems } from "./lib/i18n.ts";
import { CONSTELLATION_IDS } from "./lib/stars.ts";
import type { Content, Copy, Era, Photo } from "./types.ts";

type RawContent = Omit<Content, "photos">;

const raw = rawJson as RawContent;

function flattenPhotos(eras: Era[]): Photo[] {
  const pairIds = new Set(eras.flatMap((era) => era.photos.slice(0, 2).map((photo) => photo.id)));
  return eras.flatMap((era) =>
    era.photos.map((photo) => ({
      id: photo.id,
      src: photo.src,
      alt: photo.caption,
      caption: photo.caption,
      compliment: photo.compliment,
      pair: pairIds.has(photo.id),
    })),
  );
}

export const content: Content = {
  ...raw,
  photos: flattenPhotos(raw.eras ?? []),
};

const REQUIRED_CHAPTERS = [
  "gallery",
  "scratch",
  "quiz",
  "memory",
  "dreams",
  "friends",
  "counter",
];

export function validateContent(value: Content): string | null {
  if (!value?.gate?.password?.trim()) return "content.json thiếu gate.password.";
  if (!value.meta?.constellationName?.trim()) return "content.json thiếu meta.constellationName.";
  if (!value.meta?.herName?.trim()) return "content.json thiếu meta.herName.";
  if (!value.meta?.monogram?.trim()) return "content.json thiếu meta.monogram.";
  if (!Array.isArray(value.chapters)) return "content.json thiếu danh sách chương.";
  const ids = value.chapters.map((chapter) => chapter.id);
  for (const id of REQUIRED_CHAPTERS) {
    if (!ids.includes(id)) return `content.json thiếu chương "${id}".`;
  }
  if (!Array.isArray(value.eras) || value.eras.length < 1) {
    return "content.json cần ít nhất một thời của ảnh.";
  }
  for (const era of value.eras) {
    if (!era.photos?.length) return `Thời "${era.id}" chưa có ảnh.`;
  }
  if (!Array.isArray(value.photos) || value.photos.length < 1) {
    return "content.json cần ít nhất một ảnh.";
  }
  if (value.photos.filter((photo) => photo.pair).length < 2) {
    return "content.json cần ít nhất 2 ảnh có pair: true để chơi trò nhớ.";
  }
  if (!Array.isArray(value.quiz) || value.quiz.length < 1) return "content.json thiếu câu đố.";
  for (const question of value.quiz) {
    if (
      !Array.isArray(question.options) ||
      question.options.length < 2 ||
      question.answer < 0 ||
      question.answer >= question.options.length
    ) {
      return `Câu đố "${question.id}" có đáp án nằm ngoài các lựa chọn.`;
    }
  }
  if (!value.startDate || Number.isNaN(Date.parse(value.startDate))) {
    return "startDate không phải ngày hợp lệ.";
  }
  if (!value.music) return "content.json thiếu đường dẫn nhạc.";
  if (!Array.isArray(value.scratches) || value.scratches.length < 1) {
    return "content.json thiếu thẻ cào.";
  }
  if (!Array.isArray(value.dreams) || value.dreams.length < 1) {
    return "content.json thiếu ước mơ.";
  }
  if (!Array.isArray(value.friendNotes) || value.friendNotes.length < 1) {
    return "content.json thiếu lời bạn bè.";
  }
  if (!Array.isArray(value.openWhen) || value.openWhen.length < 1) {
    return "content.json thiếu thư Mở khi.";
  }
  if (!value.cake?.letter?.vi?.trim() || !value.cake?.letter?.en?.trim()) {
    return "content.json thiếu thư trên bánh (cả vi và en).";
  }
  if (!value.finale?.question?.vi?.trim() || !value.finale?.question?.en?.trim()) {
    return "content.json thiếu câu hỏi cuối (cả vi và en).";
  }
  if (!value.birth?.when || Number.isNaN(Date.parse(value.birth.when))) {
    return "birth.when không phải ngày hợp lệ.";
  }
  if (typeof value.birth.lat !== "number" || value.birth.lat < -90 || value.birth.lat > 90) {
    return "birth.lat phải từ -90 đến 90.";
  }
  if (typeof value.birth.lon !== "number" || value.birth.lon < -180 || value.birth.lon > 180) {
    return "birth.lon phải từ -180 đến 180.";
  }
  if (!value.finalLetter?.body?.vi?.trim() || !value.finalLetter?.body?.en?.trim()) {
    return "content.json thiếu lá thư cuối (cả vi và en).";
  }
  if (!value.constellations) return "content.json thiếu tên chòm sao.";
  for (const id of CONSTELLATION_IDS) {
    const name = value.constellations[id];
    if (!name?.vi?.trim() || !name?.en?.trim()) return `content.json thiếu constellations.${id}.`;
  }
  const requiredCopy: [Copy | undefined, string][] = [
    [value.ui?.langVi, "ui.langVi"],
    [value.ui?.langEn, "ui.langEn"],
    [value.ui?.dottedDate, "ui.dottedDate"],
    [value.ui?.musicHint, "ui.musicHint"],
    [value.friendsCopy?.sign, "friendsCopy.sign"],
    [value.quizMarks, "quizMarks"],
  ];
  for (const [copy, path] of requiredCopy) {
    if (!copy?.vi?.trim() || !copy?.en?.trim()) return `content.json thiếu ${path}.`;
  }
  for (const locale of ["vi", "en"] as const) {
    const pattern = value.ui.dottedDate[locale];
    if (!pattern.includes("{d}") || !pattern.includes("{m}") || !pattern.includes("{y}")) {
      return "ui.dottedDate cần {d}, {m} và {y}.";
    }
  }
  for (const id of FLOW) {
    const hint = value.flow?.hints?.[id];
    if (!hint?.vi?.trim() || !hint?.en?.trim()) return `content.json thiếu flow.hints.${id}.`;
  }
  const copyProblem = collectCopyProblems(value)[0];
  return copyProblem ?? null;
}

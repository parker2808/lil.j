import raw from "../content.json";
import type { Content } from "./types.ts";

export const content = raw as Content;

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
  if (!Array.isArray(value.chapters)) return "content.json thiếu danh sách chương.";
  const ids = value.chapters.map((chapter) => chapter.id);
  for (const id of REQUIRED_CHAPTERS) {
    if (!ids.includes(id)) return `content.json thiếu chương "${id}".`;
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
  if (!value.cake?.letter) return "content.json thiếu thư trên bánh.";
  if (!value.finale?.question) return "content.json thiếu câu hỏi cuối.";
  return null;
}

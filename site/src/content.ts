import rawJson from "../content.json";
import { FLOW } from "./lib/flow.ts";
import { collectCopyProblems } from "./lib/i18n.ts";
import { CONSTELLATION_IDS, projectSky } from "./lib/stars.ts";
import type { Content, Copy, Era, MusicTrack, Photo } from "./types.ts";
import { lockProblem } from "./lib/lock.ts";

type RawContent = Omit<Content, "photos">;

const raw = rawJson as RawContent;

function captionBlank(copy: Copy | undefined): boolean {
  return !copy?.vi.trim() && !copy?.en.trim();
}

function flattenPhotos(eras: Era[]): Photo[] {
  const pairIds = new Set(eras.flatMap((era) => era.photos.slice(0, 2).map((photo) => photo.id)));
  return eras.flatMap((era) =>
    era.photos.map((photo) => ({
      id: photo.id,
      src: photo.src,
      alt: captionBlank(photo.caption) ? era.title : (photo.caption ?? era.title),
      caption: photo.caption ?? { vi: "", en: "" },
      compliment: photo.compliment,
      pair: pairIds.has(photo.id),
    })),
  );
}

export const content: Content = {
  ...raw,
  photos: flattenPhotos(raw.eras ?? []),
};

function musicTrackProblem(track: MusicTrack | undefined, label: string): string | null {
  if (!track?.title?.trim()) return `${label} thiếu title.`;
  if (track.artist != null && !track.artist.trim()) return `${label} có artist trống.`;
  if (!track.src?.startsWith("/music/")) return `${label} cần src bắt đầu bằng /music/.`;
  return null;
}

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
  const lockIssue = lockProblem(value);
  if (lockIssue) return lockIssue;
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
  const startDay = value.startDate.slice(0, 10);
  for (const era of value.eras) {
    if (era.date < startDay) return `Thời "${era.id}" bắt đầu trước ngày bên nhau.`;
    for (const photo of era.photos) {
      if (photo.date && !/^\d{4}-\d{2}-\d{2}$/.test(photo.date)) {
        return `Ảnh "${photo.id}" có ngày không hợp lệ.`;
      }
      if (!photo.src?.startsWith("lilj/")) {
        return `Ảnh "${photo.id}" cần public id Cloudinary (lilj/...).`;
      }
    }
  }
  if (!Array.isArray(value.music.tracks) || value.music.tracks.length < 2) {
    return "content.json cần ít nhất 2 bài trong music.tracks.";
  }
  const seenSrc = new Set<string>();
  for (const [index, track] of value.music.tracks.entries()) {
    const problem = musicTrackProblem(track, `music.tracks[${index}]`);
    if (problem) return problem;
    if (seenSrc.has(track.src)) return `music.tracks có src trùng (${track.src}).`;
    seenSrc.add(track.src);
  }
  if (value.music.birthday) {
    const problem = musicTrackProblem(value.music.birthday, "music.birthday");
    if (problem) return problem;
    if (seenSrc.has(value.music.birthday.src)) return "music.birthday không nằm trong playlist ngẫu nhiên.";
  }
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
  if (!value.finale?.lead?.vi?.trim() || !value.finale?.lead?.en?.trim()) {
    return "content.json thiếu lời dẫn câu hỏi cuối (finale.lead).";
  }
  if (!value.finale?.celebrate?.vi?.trim() || !value.finale?.celebrate?.en?.trim()) {
    return "content.json thiếu dòng pháo hoa (finale.celebrate).";
  }
  if (!value.gate?.subtitle?.vi?.trim() || !value.gate?.subtitle?.en?.trim()) {
    return "content.json thiếu phụ đề cánh cửa (gate.subtitle).";
  }
  if (
    !value.gate?.found?.vi?.trim() ||
    !value.gate?.found?.en?.trim() ||
    !value.gate?.welcome?.vi?.trim() ||
    !value.gate?.welcome?.en?.trim()
  ) {
    return "content.json thiếu lời chào khi mở được cửa (gate.found, gate.welcome).";
  }
  if (!Array.isArray(value.birth?.notes) || value.birth.notes.length !== 4) {
    return "content.json cần đúng 4 lời nhắn trên bầu trời sinh (birth.notes).";
  }
  const seenNotes = new Set<string>();
  for (const note of value.birth.notes) {
    if (!note?.id || !CONSTELLATION_IDS.includes(note.id)) {
      return `birth.notes có chòm sao không hợp lệ (${note?.id ?? "?"}).`;
    }
    if (seenNotes.has(note.id)) return `birth.notes trùng chòm sao ${note.id}.`;
    seenNotes.add(note.id);
    if (!note.title?.vi?.trim() || !note.title?.en?.trim() || !note.body?.vi?.trim() || !note.body?.en?.trim()) {
      return `birth.notes.${note.id} thiếu title hoặc body.`;
    }
  }
  if (!value.birth.progress?.vi?.includes("{n}") || !value.birth.progress?.en?.includes("{total}")) {
    return "birth.progress cần {n} và {total}.";
  }
  if (!value.birth.sign?.vi?.trim() || !value.birth.sign?.en?.trim()) {
    return "content.json thiếu birth.sign.";
  }
  if (!Array.isArray(value.memoryCopy?.lines) || value.memoryCopy.lines.length !== 5) {
    return "content.json cần đúng 5 lời nhắn khi ghép cặp (memoryCopy.lines).";
  }
  const galleryKeys = ["backToGalaxy", "eraProgress", "nextEra", "seen", "pending"] as const;
  for (const key of galleryKeys) {
    const copy = value.galleryCopy?.[key];
    if (!copy?.vi?.trim() || !copy?.en?.trim()) return `content.json thiếu galleryCopy.${key}.`;
  }
  for (const locale of ["vi", "en"] as const) {
    const pattern = value.galleryCopy.eraProgress[locale];
    if (!pattern.includes("{n}") || !pattern.includes("{total}") || !pattern.includes("{photo}") || !pattern.includes("{photos}")) {
      return "galleryCopy.eraProgress cần {n}, {total}, {photo} và {photos}.";
    }
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
  const birthSky = projectSky(value.birth.lat, value.birth.lon, new Date(value.birth.when), value.constellations);
  const visibleNotes = new Set(birthSky.labels.map((label) => label.id));
  for (const id of seenNotes) {
    if (!visibleNotes.has(id)) return `birth.notes.${id} không hiện trên bầu trời đêm sinh, nên không bấm được.`;
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

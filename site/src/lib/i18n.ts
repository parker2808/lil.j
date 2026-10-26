export type Locale = "vi" | "en";

export type Copy = {
  vi: string;
  en: string;
};

export const LOCALE_KEY = "lilj.locale.v1";

const PLAIN = new Set([
  "password",
  "id",
  "src",
  "tone",
  "startDate",
  "music",
  "herName",
  "constellationName",
  "monogram",
  "author",
  "when",
  "date",
  "color",
]);

export function isCopy(value: unknown): value is Copy {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  return (
    keys.length === 2 &&
    keys.includes("vi") &&
    keys.includes("en") &&
    typeof record.vi === "string" &&
    typeof record.en === "string"
  );
}

export function text(value: Copy | string | null | undefined, locale: Locale): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  const chosen = value[locale];
  if (chosen.trim()) return chosen;
  return value.vi;
}

export function readLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved === "en" || saved === "vi") return saved;
  } catch {
    // Storage can be blocked. Vietnamese stays the default.
  }
  return "vi";
}

export function collectCopyProblems(value: unknown, path = "content"): string[] {
  const problems: string[] = [];
  walk(value, path, problems);
  return problems;
}

function walk(value: unknown, path: string, problems: string[], key?: string): void {
  if (key && PLAIN.has(key)) {
    if (typeof value !== "string") problems.push(`${path} phải là một chuỗi, không phải {vi, en}.`);
    return;
  }
  if (value == null || typeof value === "number" || typeof value === "boolean") return;
  if (typeof value === "string") {
    problems.push(`${path} cần dạng { "vi": "...", "en": "..." }.`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${path}[${index}]`, problems));
    return;
  }
  if (typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  if ("vi" in record || "en" in record) {
    if (!isCopy(record) || !record.vi.trim() || !record.en.trim()) {
      problems.push(`${path} cần đủ cả vi và en, không để trống.`);
    }
    return;
  }
  for (const [childKey, child] of Object.entries(record)) {
    walk(child, `${path}.${childKey}`, problems, childKey);
  }
}

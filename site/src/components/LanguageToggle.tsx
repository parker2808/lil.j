import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import type { Locale } from "../lib/i18n.ts";

const OPTIONS: { id: Locale; label: string }[] = [
  { id: "vi", label: "VI" },
  { id: "en", label: "EN" },
];

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="lang" role="group" aria-label={t(content.ui.language)}>
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={locale === option.id}
          onClick={() => setLocale(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

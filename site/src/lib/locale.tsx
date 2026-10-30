import { useEffect, useMemo, useState, type ReactNode } from "react";
import { content } from "../content.ts";
import { LOCALE_KEY, readLocale, text, type Locale } from "./i18n.ts";
import { LocaleContext, type LocaleContextValue } from "./locale-context.ts";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readLocale);

  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      // The toggle still works for this visit.
    }
    document.documentElement.lang = locale;
    document.title = text(content.meta.docTitle, locale);
    document.querySelector('meta[name="description"]')?.setAttribute("content", text(content.meta.description, locale));
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (copy) => text(copy, locale),
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

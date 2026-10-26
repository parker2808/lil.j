import { createContext, useContext } from "react";
import type { Copy, Locale } from "./i18n.ts";

export type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (value: Copy | string | null | undefined) => string;
};

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useI18n(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("LocaleProvider missing");
  return value;
}

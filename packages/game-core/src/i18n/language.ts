export const supportedLanguages = ["de", "en", "ja"] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const defaultLanguage: SupportedLanguage = "ja";

export const languageLabels: Record<SupportedLanguage, string> = {
  de: "Deutsch",
  en: "English",
  ja: "日本語"
};

export interface TextPicker {
  <T>(de: T, en: T, ja: T): T;
}

/**
 * Builds a helper that picks one variant per supported language.
 *
 * Several layouts and services used to write `language === "en" ? english : german`.
 * That shape silently falls back to German for every language added later, so the
 * picker replaces it while keeping the call sites just as short. The argument order
 * follows `supportedLanguages`.
 *
 * Many UI models carry the language as an optional field, so a missing language is
 * allowed here and resolves to `defaultLanguage`.
 */
export function textPicker(language?: SupportedLanguage): TextPicker {
  const resolved = normalizeLanguage(language);
  return <T,>(de: T, en: T, ja: T): T => {
    if (resolved === "ja") return ja;
    if (resolved === "en") return en;
    return de;
  };
}

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === "string" && supportedLanguages.includes(value as SupportedLanguage);
}

export function normalizeLanguage(
  value: unknown,
  fallback: SupportedLanguage = defaultLanguage
): SupportedLanguage {
  return isSupportedLanguage(value) ? value : fallback;
}

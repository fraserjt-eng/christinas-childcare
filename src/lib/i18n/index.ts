// Lightweight i18n layer for the parent-facing surfaces. No external library:
// two dictionaries, a cookie for persistence, and a context (see
// src/contexts/LanguageContext.tsx) expose useT() / useLang() to components.

import en, { type TranslationKey } from './en';
import es from './es';

export type Lang = 'en' | 'es';
export type { TranslationKey };

export const DEFAULT_LANG: Lang = 'en';
export const SUPPORTED_LANGS: Lang[] = ['en', 'es'];
export const LANG_COOKIE = 'lang';

export const dictionaries: Record<Lang, Record<TranslationKey, string>> = {
  en,
  es,
};

export function isLang(value: string | undefined | null): value is Lang {
  return value === 'en' || value === 'es';
}

// Look up a key for a language. Falls back to English, then the key itself, so
// a missing string never renders blank.
export function translate(lang: Lang, key: TranslationKey): string {
  return dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
}

// --- Client cookie helpers (the lang cookie is plain, not HttpOnly, since it
// is only a UI preference the client must read on every page). ---

export function readLangCookie(): Lang | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${LANG_COOKIE}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.split('=')[1] || '');
  return isLang(value) ? value : null;
}

export function writeLangCookie(lang: Lang): void {
  if (typeof document === 'undefined') return;
  // 1 year, site-wide, lax. No Secure flag requirement for a UI preference,
  // but include it on https so it is not downgraded.
  const oneYear = 60 * 60 * 24 * 365;
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${oneYear}; SameSite=Lax${secure}`;
}

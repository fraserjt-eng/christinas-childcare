import 'server-only';
import { cookies } from 'next/headers';
import { translate, isLang, DEFAULT_LANG, type Lang, type TranslationKey } from './index';

// Server-component translation. Marketing pages export `metadata` (SEO), so
// they are server components and cannot use the client useT() hook. They read
// the `lang` cookie here instead. The LanguageToggle calls router.refresh()
// after switching, so these pages re-render in the new language.
export function getServerLang(): Lang {
  const value = cookies().get('lang')?.value;
  return isLang(value) ? value : DEFAULT_LANG;
}

export function getServerT(): { lang: Lang; t: (key: TranslationKey) => string } {
  const lang = getServerLang();
  return { lang, t: (key: TranslationKey) => translate(lang, key) };
}

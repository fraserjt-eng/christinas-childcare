'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  type Lang,
  type TranslationKey,
  DEFAULT_LANG,
  translate,
  readLangCookie,
  writeLangCookie,
} from '@/lib/i18n';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

/**
 * Wraps the parent-facing surfaces ((public) + dashboard layouts).
 *
 * `initialLang` can be passed from a server component that already read the
 * `lang` cookie (the (public) layout does this) so the first paint matches the
 * saved language with no flash. Where the layout is a client component (the
 * dashboard), it is omitted and the cookie is read on mount.
 */
export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang?: Lang;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang ?? DEFAULT_LANG);

  // On mount, reconcile with the cookie (covers the client-layout case where
  // no initialLang was provided) and reflect the language on <html lang>.
  useEffect(() => {
    if (!initialLang) {
      const fromCookie = readLangCookie();
      if (fromCookie && fromCookie !== lang) setLangState(fromCookie);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    writeLangCookie(next);
    // If a parent is signed in, remember the choice on their family record so
    // future emails and return visits use it. Fire-and-forget: a 401 (not
    // signed in) or any failure is fine, the cookie already carries the UI.
    try {
      void fetch('/api/parent/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: next }),
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === 'en' ? 'es' : 'en');
  }, [lang, setLang]);

  const t = useCallback((key: TranslationKey) => translate(lang, key), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLang must be used within a LanguageProvider');
  }
  return ctx;
}

// Convenience hook: returns just the translate function.
export function useT(): (key: TranslationKey) => string {
  return useLang().t;
}

// Safe variant for components SHARED with surfaces that have no provider
// (e.g. DashboardLayout is also used by admin/employee, which do not mount
// LanguageProvider). Outside a provider it returns English instead of throwing.
export function useOptionalT(): (key: TranslationKey) => string {
  const ctx = useContext(LanguageContext);
  return useCallback(
    (key: TranslationKey) => (ctx ? ctx.t(key) : translate(DEFAULT_LANG, key)),
    [ctx]
  );
}

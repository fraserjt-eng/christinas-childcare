'use client';

import { useLang } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';

/**
 * Floating English / Espanol toggle, fixed at the bottom of every parent
 * surface. On mobile it sits above the MobileCTA bar (fixed bottom-0, z-50,
 * lg:hidden); on desktop it centers along the bottom.
 */
export function LanguageToggle() {
  const { lang, setLang, t } = useLang();

  return (
    <div
      className="fixed right-4 bottom-20 z-[60] lg:left-1/2 lg:right-auto lg:bottom-6 lg:-translate-x-1/2"
      role="group"
      aria-label={t('toggle.aria')}
    >
      <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white/95 p-1 shadow-lg backdrop-blur">
        <Languages className="ml-2 mr-1 h-4 w-4 text-gray-400" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setLang('en')}
          aria-pressed={lang === 'en'}
          className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
            lang === 'en'
              ? 'bg-christina-red text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLang('es')}
          aria-pressed={lang === 'es'}
          className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
            lang === 'es'
              ? 'bg-christina-red text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Español
        </button>
      </div>
    </div>
  );
}

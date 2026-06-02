import { cookies } from 'next/headers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileCTA } from '@/components/layout/MobileCTA';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { isLang, DEFAULT_LANG } from '@/lib/i18n';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const cookieLang = cookies().get('lang')?.value;
  const initialLang = isLang(cookieLang) ? cookieLang : DEFAULT_LANG;

  return (
    <LanguageProvider initialLang={initialLang}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <ErrorBoundary>
          <main className="flex-1">{children}</main>
        </ErrorBoundary>
        <Footer />
        <MobileCTA />
        <LanguageToggle />
      </div>
    </LanguageProvider>
  );
}

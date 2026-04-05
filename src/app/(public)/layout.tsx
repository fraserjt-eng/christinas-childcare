import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileCTA } from '@/components/layout/MobileCTA';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ErrorBoundary>
        <main className="flex-1">{children}</main>
      </ErrorBoundary>
      <Footer />
      <MobileCTA />
    </div>
  );
}

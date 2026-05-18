'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NotificationPopupWrapper } from '@/components/NotificationPopupWrapper';

// Gate on the real signed session cookie (already verified by middleware),
// NOT browser localStorage. The old localStorage check bounced parents on a
// fresh device back to /login even after a correct sign-in.
export default function DashLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const res = await fetch('/api/auth/session');
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setLoading(false);
            return;
          }
        }
        router.push('/login');
      } catch {
        if (!cancelled) router.push('/login');
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <NotificationPopupWrapper audience="parents" />
        {children}
      </DashboardLayout>
    </ErrorBoundary>
  );
}

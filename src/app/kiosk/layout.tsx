'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const hasAdminSession = document.cookie.includes('auth_session=');
    setIsAdmin(hasAdminSession);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin && (
        <div className="fixed top-2 right-2 z-50">
          <Link
            href="/admin"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-white/80 backdrop-blur px-2 py-1 rounded shadow-sm transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Admin
          </Link>
        </div>
      )}
      {children}
    </div>
  );
}

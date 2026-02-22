'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Calendar } from 'lucide-react';

export function MobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t shadow-lg safe-area-bottom">
      <div className="grid grid-cols-2 divide-x">
        <a
          href="tel:+17633905870"
          className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-christina-red hover:bg-red-50 transition-colors"
        >
          <Phone className="h-4 w-4" />
          Call Now
        </a>
        <Link
          href="/schedule-tour"
          className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-white bg-christina-red hover:bg-christina-red/90 transition-colors"
        >
          <Calendar className="h-4 w-4" />
          Schedule Tour
        </Link>
      </div>
    </div>
  );
}

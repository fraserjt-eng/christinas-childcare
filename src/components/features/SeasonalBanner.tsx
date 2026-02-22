'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Sparkles } from 'lucide-react';

function getSeasonalMessage(): { text: string; cta: string; href: string } | null {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) {
    return { text: 'Summer Registration Now Open!', cta: 'Reserve Your Spot', href: '/enroll' };
  }
  if (month >= 5 && month <= 7) {
    return { text: 'Fall Enrollment: Limited Spots Available', cta: 'Enroll Today', href: '/enroll' };
  }
  if (month >= 8 && month <= 10) {
    return { text: 'Now Enrolling for Winter & Spring', cta: 'Get Started', href: '/enroll' };
  }
  return { text: 'Now Enrolling All Age Groups!', cta: 'Schedule a Tour', href: '/schedule-tour' };
}

export function SeasonalBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const key = 'christinas_banner_dismissed';
    const stored = sessionStorage.getItem(key);
    if (!stored) setDismissed(false);
  }, []);

  const message = getSeasonalMessage();
  if (dismissed || !message) return null;

  function handleDismiss() {
    sessionStorage.setItem('christinas_banner_dismissed', 'true');
    setDismissed(true);
  }

  return (
    <div className="bg-gradient-to-r from-christina-red to-christina-coral text-white py-2.5 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-sm">
        <Sparkles className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium">{message.text}</span>
        <Link
          href={message.href}
          className="underline underline-offset-2 font-semibold hover:no-underline"
        >
          {message.cta} &rarr;
        </Link>
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

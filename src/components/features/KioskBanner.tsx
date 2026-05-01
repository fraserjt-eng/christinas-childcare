'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Sits directly under SeasonalBanner on the public homepage. Drives parents
// straight to the in-center sign-in kiosk. The Z mark in the top-left
// matches the logo used in DashboardLayout (red circle, yellow gradient Z).
// Yellow + red is the high-contrast "pop" Christina asked for.

export function KioskBanner() {
  return (
    <Link
      href="/kiosk"
      aria-label="Open the family check-in kiosk"
      className="group block bg-gradient-to-r from-christina-yellow via-amber-400 to-christina-red text-[#1a1a1a] hover:to-christina-coral transition-colors relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Z mark — same SVG as the dashboard logo, sized for the banner. */}
        <svg
          width="36"
          height="36"
          viewBox="0 0 40 40"
          className="flex-shrink-0 drop-shadow-sm"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="zGradientKiosk" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="50%" stopColor="#FFD54F" />
              <stop offset="100%" stopColor="#FFC107" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="20" fill="#C62828" />
          <path
            d="M12,10 L28,10 Q30,10 29,12 L17,26 L28,26 Q30,26 30,28 Q30,30 28,30 L12,30 Q10,30 11,28 L23,14 L12,14 Q10,14 10,12 Q10,10 12,10 Z"
            fill="url(#zGradientKiosk)"
          />
          <circle cx="31" cy="9" r="1.5" fill="#FFE082" opacity="0.9" />
        </svg>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm sm:text-base leading-tight">
            Family Check-In Kiosk
          </p>
          <p className="text-xs sm:text-sm text-[#1a1a1a]/80 leading-tight">
            Drop off and pick up with a tap. Tap to open.
          </p>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 bg-[#1a1a1a] text-white text-xs font-semibold px-3 py-1.5 rounded-full group-hover:bg-christina-red transition-colors">
          Open Kiosk
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
        <ArrowRight className="sm:hidden h-5 w-5 flex-shrink-0" />
      </div>
    </Link>
  );
}

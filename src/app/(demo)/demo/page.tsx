'use client';

import Link from 'next/link';

// Public demo sandbox landing. Reachable by direct URL and from a discreet
// link in Admin Settings. Not listed in any navigation. All data here is
// fabricated and lives in the demo_* tables, fully isolated from live records.

export default function DemoHomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-5">
        <span className="inline-block text-xs font-semibold bg-christina-yellow/30 text-christina-red rounded-full px-3 py-1">
          DEMO SANDBOX
        </span>
        <h1 className="text-2xl font-bold text-gray-800">
          Christina&apos;s Child Care — Demo
        </h1>
        <p className="text-gray-600 text-sm">
          A safe space to show the product. Every name here is made up. Nothing
          you do touches real families or real attendance.
        </p>
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-left text-sm text-gray-600">
          <p className="font-semibold text-gray-800 mb-1">Try the sign-in kiosk</p>
          <p>Use demo PIN <span className="font-mono font-bold">1234</span>,{' '}
            <span className="font-mono font-bold">5678</span>, or{' '}
            <span className="font-mono font-bold">9876</span>.</p>
        </div>
        <Link
          href="/demo/kiosk"
          className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-christina-red text-white font-bold text-lg hover:bg-christina-red/90 active:scale-[0.98] transition-all"
        >
          Open the demo kiosk
        </Link>
        <Link
          href="/"
          className="block text-sm text-gray-400 hover:text-gray-600"
        >
          Back to site
        </Link>
      </div>
    </div>
  );
}

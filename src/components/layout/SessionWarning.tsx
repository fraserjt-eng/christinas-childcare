'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

// How many milliseconds before expiry to start showing the warning
const WARN_BEFORE_MS = 30 * 60 * 1000; // 30 minutes
// How many milliseconds to add when the user extends their session
const EXTEND_BY_MS = 8 * 60 * 60 * 1000; // 8 hours
// How often to re-check the session
const CHECK_INTERVAL_MS = 60 * 1000; // 60 seconds

const SESSION_KEY = 'auth_session';

interface StoredSession {
  expires_at: number;
  user?: unknown;
}

function readSession(): StoredSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function saveSession(session: StoredSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage write failure is non-fatal here
  }
}

export function SessionWarning() {
  const router = useRouter();
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function check() {
      const session = readSession();

      if (!session) {
        // No session present at all, no banner needed
        setMinutesLeft(null);
        return;
      }

      const now = Date.now();
      const remaining = session.expires_at - now;

      if (remaining <= 0) {
        // Session has expired. Clear it and send to login.
        localStorage.removeItem(SESSION_KEY);
        router.push('/login');
        return;
      }

      if (remaining <= WARN_BEFORE_MS) {
        const mins = Math.ceil(remaining / (60 * 1000));
        setMinutesLeft(mins);
        // Reset dismiss state if we dropped below threshold again (new session)
        setDismissed(false);
      } else {
        setMinutesLeft(null);
      }
    }

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [router]);

  function extendSession() {
    const session = readSession();
    if (!session) return;
    const extended: StoredSession = {
      ...session,
      expires_at: Date.now() + EXTEND_BY_MS,
    };
    saveSession(extended);
    setMinutesLeft(null);
    setDismissed(false);
  }

  // No banner needed
  if (minutesLeft === null || dismissed) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-4 bg-yellow-400 px-4 py-2 text-yellow-900 shadow-md"
    >
      <span className="text-sm font-medium">
        Your session expires in {minutesLeft} minute{minutesLeft === 1 ? '' : 's'}. Save your work.
      </span>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={extendSession}
          className="rounded bg-yellow-700 px-3 py-1 text-sm font-semibold text-white hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-900"
        >
          Extend Session
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss session warning"
          className="rounded p-1 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

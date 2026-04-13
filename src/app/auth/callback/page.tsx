'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { lookupInvite, redirectPathForRole } from '@/lib/auth-allowlist';

type CallbackState =
  | { status: 'loading' }
  | { status: 'not-invited'; email: string }
  | { status: 'error'; message: string };

export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<CallbackState>({ status: 'loading' });

  useEffect(() => {
    async function handleCallback() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setState({ status: 'error', message: 'Supabase is not configured.' });
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError || !session) {
        setState({
          status: 'error',
          message: 'Authentication failed. Please try again.',
        });
        return;
      }

      const email = session.user.email || '';
      const oauthName =
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        email.split('@')[0];

      // Invite-only allowlist check
      const invite = await lookupInvite(email);

      if (!invite.allowed || !invite.role) {
        // Sign them out of Supabase so they can retry with a different account
        await supabase.auth.signOut();
        setState({ status: 'not-invited', email });
        return;
      }

      const resolvedName = invite.fullName || oauthName;

      try {
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            role: invite.role,
            name: resolvedName,
          }),
        });

        if (!res.ok) {
          setState({ status: 'error', message: 'Failed to create session.' });
          return;
        }

        router.push(redirectPathForRole(invite.role));
      } catch {
        setState({ status: 'error', message: 'Connection error. Please try again.' });
      }
    }

    handleCallback();
  }, [router]);

  if (state.status === 'not-invited') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4 bg-white rounded-2xl border border-[#e5e0d8] p-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-christina-yellow/20 flex items-center justify-center mx-auto">
            <span className="text-3xl">✋</span>
          </div>
          <h1 className="text-xl font-bold">Not Invited Yet</h1>
          <p className="text-sm text-muted-foreground">
            Your email{' '}
            <span className="font-mono text-xs bg-muted px-1 rounded">{state.email}</span>{' '}
            is not on the invite list for Christina&apos;s Child Care Center.
          </p>
          <p className="text-sm text-muted-foreground">
            If you&apos;re a parent or staff member, ask the center director to add you.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-christina-red text-white text-sm font-medium hover:bg-christina-red/90"
            >
              Back to Homepage
            </Link>
            <Link
              href="/enroll"
              className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-christina-red text-christina-red text-sm font-medium hover:bg-christina-red/10"
            >
              Start an Enrollment Inquiry
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-christina-coral font-heading font-semibold">{state.message}</p>
          <a
            href="/admin-login"
            className="text-christina-blue hover:underline text-sm font-body"
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christina-red mx-auto" />
        <p className="text-sm text-gray-500 font-body">Completing sign-in...</p>
      </div>
    </div>
  );
}

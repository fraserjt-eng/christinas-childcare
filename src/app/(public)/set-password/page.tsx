'use client';

// Set-your-own-password page. One page serves two flows:
//   1. A new staff/admin invited from User Management (Supabase invite link).
//   2. Anyone using a password-reset / recovery link.
//
// The Supabase email link establishes a short-lived session (either tokens in
// the URL hash, or a token_hash + type we exchange via verifyOtp). The user
// chooses a password, then we exchange the Supabase session for the app's
// signed cookie via establishServerSession() and route by server-derived role.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react';

type Phase = 'verifying' | 'ready' | 'saving' | 'invalid';

export default function SetPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('verifying');
  const [error, setError] = useState('');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    async function verify() {
      if (!supabaseUrl || !supabaseKey) {
        setPhase('invalid');
        setError('Authentication is not configured.');
        return;
      }
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Email links arrive one of two ways. Newer Supabase templates use a
      // token_hash + type in the query string; older/implicit use tokens in
      // the URL hash (auto-detected by supabase-js).
      const url = new URL(window.location.href);
      const tokenHash = url.searchParams.get('token_hash');
      const type = url.searchParams.get('type');

      if (tokenHash && type) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          type: type as 'invite' | 'recovery' | 'email' | 'signup',
          token_hash: tokenHash,
        });
        if (otpError) {
          setPhase('invalid');
          setError('This link is invalid or has expired. Ask the director to resend it.');
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setPhase('invalid');
        setError('This link is invalid or has expired. Ask the director to resend it.');
        return;
      }

      setPhase('ready');
    }
    verify();
  }, [supabaseUrl, supabaseKey]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const password = fd.get('password') as string;
    const confirm = fd.get('confirm') as string;

    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setPhase('saving');

    try {
      const supabase = createClient(supabaseUrl!, supabaseKey!);
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) {
        setError(updErr.message || 'Could not set the password.');
        setPhase('ready');
        return;
      }

      const { establishServerSession } = await import('@/lib/auth');
      const { redirectPathForRole } = await import('@/lib/auth-allowlist');
      const sess = await establishServerSession();

      if (!sess.success || !sess.role) {
        // Password is set; they can now sign in normally.
        router.push('/admin-login');
        return;
      }
      router.push(redirectPathForRole(sess.role));
    } catch {
      setError('Connection error. Please try again.');
      setPhase('ready');
    }
  }

  return (
    <div className="py-24">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-christina-red flex items-center justify-center mx-auto mb-4">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Set Your Password</h1>
          <p className="text-muted-foreground">Choose a password for your account</p>
        </div>
        <Card>
          <CardContent className="p-6">
            {phase === 'verifying' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christina-red mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Checking your link...</p>
              </div>
            )}

            {phase === 'invalid' && (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-red-600">{error}</p>
                <Link href="/admin-login" className="text-christina-blue hover:underline text-sm">
                  Back to login
                </Link>
              </div>
            )}

            {(phase === 'ready' || phase === 'saving') && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input
                    id="confirm"
                    name="confirm"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-christina-red hover:bg-christina-red/90"
                  disabled={phase === 'saving'}
                >
                  {phase === 'saving' ? 'Saving...' : 'Set Password & Continue'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

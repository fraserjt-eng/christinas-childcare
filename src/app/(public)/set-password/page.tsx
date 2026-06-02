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
import { useT } from '@/contexts/LanguageContext';

type Phase = 'verifying' | 'ready' | 'saving' | 'invalid';

export default function SetPasswordPage() {
  const router = useRouter();
  const t = useT();
  const [phase, setPhase] = useState<Phase>('verifying');
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState<{ kind: string; loginPath: string } | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    async function verify() {
      // Our own signed setup link (admin-issued). No Supabase needed; the
      // signed token is the proof. Show the form right away.
      const urlEarly = new URL(window.location.href);
      const ourToken = urlEarly.searchParams.get('token');
      if (ourToken) {
        setToken(ourToken);
        setPhase('ready');
        return;
      }

      if (!supabaseUrl || !supabaseKey) {
        setPhase('invalid');
        setError(t('setpw.authNotConfigured'));
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
          setError(t('setpw.invalidLink'));
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setPhase('invalid');
        setError(t('setpw.invalidLink'));
        return;
      }

      setPhase('ready');
    }
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseUrl, supabaseKey]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const password = fd.get('password') as string;
    const confirm = fd.get('confirm') as string;

    if (password.length < 8) {
      setError(t('setpw.useAtLeast8'));
      return;
    }
    if (password !== confirm) {
      setError(t('setpw.passwordsNoMatch'));
      return;
    }

    setPhase('saving');

    // Our signed-token flow: sets the password where it is actually checked
    // (families.password_hash for parents). No Supabase session involved.
    if (token) {
      try {
        const r = await fetch('/api/auth/set-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok || !d.ok) {
          setError(d.error || t('setpw.couldNotSet'));
          setPhase('ready');
          return;
        }
        setDoneMsg({
          kind: d.kind || 'parent',
          loginPath: d.loginPath || '/login',
        });
      } catch {
        setError(t('setpw.connError'));
        setPhase('ready');
      }
      return;
    }

    try {
      const supabase = createClient(supabaseUrl!, supabaseKey!);
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) {
        setError(updErr.message || t('setpw.couldNotSet'));
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
      setError(t('setpw.connError'));
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
          <h1 className="text-2xl font-bold">{t('setpw.title')}</h1>
          <p className="text-muted-foreground">{t('setpw.subtitle')}</p>
        </div>
        <Card>
          <CardContent className="p-6">
            {phase === 'verifying' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christina-red mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{t('setpw.checking')}</p>
              </div>
            )}

            {phase === 'invalid' && (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-red-600">{error}</p>
                <Link href="/admin-login" className="text-christina-blue hover:underline text-sm">
                  {t('setpw.backToLogin')}
                </Link>
              </div>
            )}

            {doneMsg && (
              <div className="text-center py-6 space-y-4">
                <p className="text-sm">
                  {doneMsg.kind === 'parent'
                    ? t('setpw.doneParent')
                    : t('setpw.doneOther')}
                </p>
                <Button
                  className="w-full bg-christina-red hover:bg-christina-red/90"
                  onClick={() => router.push(doneMsg.loginPath)}
                >
                  {t('setpw.goToSignIn')}
                </Button>
              </div>
            )}

            {!doneMsg && (phase === 'ready' || phase === 'saving') && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('setpw.newPassword')}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={t('setpw.placeholder8')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">{t('setpw.confirmPassword')}</Label>
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
                  {phase === 'saving' ? t('setpw.saving') : t('setpw.submit')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

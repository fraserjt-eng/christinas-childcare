'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PinPad } from '@/components/employee/PinPad';
import { Clock, KeyRound, Mail } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';

export default function EmployeeLoginPage() {
  const t = useT();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handlePinSubmit = useCallback(async (pin: string) => {
    setLoading(true);
    setPinError('');

    // PIN is verified server-side against the employees table; the role is
    // derived there, never sent by the client.
    try {
      const res = await fetch('/api/auth/staff-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.status === 429) {
        setPinError(t('emplogin.errTooManyAttempts'));
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setPinError(t('emplogin.errInvalidPin'));
        setLoading(false);
        return;
      }

      const data = await res.json();
      const role = data.user?.role;
      router.push(role === 'admin' || role === 'superadmin' ? '/admin' : '/employee');
    } catch {
      setPinError(t('emplogin.errConnection'));
      setLoading(false);
    }
  }, [router, t]);

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setEmailError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { signIn, establishServerSession } = await import('@/lib/auth');
      const { redirectPathForRole } = await import('@/lib/auth-allowlist');

      const result = await signIn(email, password);
      if (!result.success) {
        setEmailError(result.error || t('emplogin.errInvalidEmail'));
        setLoading(false);
        return;
      }

      const sess = await establishServerSession();
      if (!sess.success || !sess.role) {
        setEmailError(sess.error || t('emplogin.errCompleteSignIn'));
        setLoading(false);
        return;
      }

      router.push(redirectPathForRole(sess.role));
    } catch {
      setEmailError(t('emplogin.errConnection'));
      setLoading(false);
    }
  }

  return (
    <div className="py-16">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-christina-red flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">{t('emplogin.heroTitle')}</h1>
          <p className="text-muted-foreground">{t('emplogin.heroSubtitle')}</p>
        </div>

        {/* Login Tabs */}
        <Card>
          <CardContent className="p-6">
            {/* Google OAuth button */}
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setEmailError('');
                const { signInWithGoogle } = await import('@/lib/auth');
                const result = await signInWithGoogle();
                if (!result.success) {
                  setEmailError(result.error || t('emplogin.errGoogleSignIn'));
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-heading font-semibold text-gray-700 hover:bg-gray-50 transition-colors mb-4 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t('emplogin.googleButton')}
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-400">{t('emplogin.dividerOr')}</span></div>
            </div>

            <Tabs defaultValue="pin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="pin" className="gap-2">
                  <KeyRound className="h-4 w-4" />
                  {t('emplogin.tabPin')}
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="h-4 w-4" />
                  {t('emplogin.tabEmail')}
                </TabsTrigger>
              </TabsList>

              {/* PIN Login Tab */}
              <TabsContent value="pin" className="mt-0">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground">
                    {t('emplogin.pinPrompt')}
                  </p>
                </div>
                <PinPad
                  onSubmit={handlePinSubmit}
                  error={pinError}
                  loading={loading}
                  maxLength={4}
                />
              </TabsContent>

              {/* Email Login Tab */}
              <TabsContent value="email" className="mt-0">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('emplogin.emailLabel')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@christinaschildcare.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('emplogin.passwordLabel')}</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder={t('emplogin.passwordPlaceholder')}
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="text-sm text-red-600">{emailError}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-christina-red hover:bg-christina-red/90"
                    disabled={loading}
                  >
                    {loading ? t('emplogin.signingIn') : t('emplogin.signIn')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Other Login Links */}
            <div className="mt-6 flex justify-center gap-4 text-sm text-muted-foreground">
              <Link
                href="/admin-login"
                className="text-christina-red hover:underline"
              >
                {t('emplogin.adminLogin')}
              </Link>
              <span>•</span>
              <Link
                href="/login"
                className="text-christina-blue hover:underline"
              >
                {t('emplogin.parentPortal')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

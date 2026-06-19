'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, LogIn, UserPlus, Heart, Shield, MapPin } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';

export default function ParentLoginPage() {
  const router = useRouter();
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSignInError('');
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Password is verified server-side against the families table; the role
    // is fixed to 'parent' there. The client never sends a role.
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyLogin: { email, password } }),
      });

      if (res.status === 429) {
        setSignInError(t('login.tooManyAttempts'));
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setSignInError(t('login.invalidCreds'));
        setLoading(false);
        return;
      }

      router.push('/preview/family');
    } catch {
      setSignInError(t('login.connError'));
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSignUpError('');
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const confirm = formData.get('confirm') as string;

    if (password !== confirm) {
      setSignUpError(t('login.passwordsNoMatch'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setSignUpError(t('login.passwordMin6'));
      setLoading(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 500));

    try {
      const { registerFamily } = await import('@/lib/family-storage');
      await registerFamily(email, password, name, phone);
      setSignUpSuccess(true);
      setLoading(false);
      // Do not redirect: account is pending approval
    } catch (err) {
      setSignUpError(err instanceof Error ? err.message : t('login.regFailed'));
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-christina-red via-[#a51f1f] to-[#7d1818]">
      {/* Soft brand wash: floating circles echo the home page hero */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/3 -right-28 h-[380px] w-[380px] rounded-full bg-christina-yellow/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-[460px] w-[460px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-16 sm:py-20">
        {/* Branded masthead */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl shadow-black/20">
            <Heart className="h-10 w-10 text-christina-red" strokeWidth={2} fill="currentColor" />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            Crystal &amp; Brooklyn Park, Minnesota
          </p>
          <h1 className="font-playful text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
            Christina&apos;s Child Care Center
          </h1>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 backdrop-blur-sm">
            <Users className="h-4 w-4 text-white" />
            <span className="font-heading text-sm font-semibold text-white">{t('login.portalTitle')}</span>
          </div>
          <p className="mx-auto mt-3 max-w-sm font-body text-sm text-white/80">{t('login.portalSubtitle')}</p>
        </div>

        <Card className="rounded-3xl border-0 shadow-2xl shadow-black/30">
          <CardContent className="p-6 sm:p-8">
            {/* Google OAuth button */}
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setSignInError('');
                const { signInWithGoogle } = await import('@/lib/auth');
                const result = await signInWithGoogle();
                if (!result.success) {
                  setSignInError(result.error || t('login.googleFailed'));
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
              {t('login.googleSignIn')}
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-400">{t('login.orEmailPassword')}</span></div>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  {t('login.tabSignIn')}
                </TabsTrigger>
                <TabsTrigger value="signup" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  {t('login.tabCreate')}
                </TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="mt-0">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{t('login.email')}</Label>
                    <Input id="signin-email" name="email" type="email" placeholder="you@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">{t('login.password')}</Label>
                    <Input id="signin-password" name="password" type="password" placeholder="••••••••" required />
                  </div>
                  {signInError && <p className="text-sm text-red-600">{signInError}</p>}
                  <Button type="submit" className="w-full bg-christina-blue hover:bg-christina-blue/90" disabled={loading}>
                    {loading ? t('login.signingIn') : t('login.signIn')}
                  </Button>
                </form>
              </TabsContent>

              {/* Create Account Tab */}
              <TabsContent value="signup" className="mt-0">
                {signUpSuccess ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <UserPlus className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="font-semibold text-green-700">{t('login.regReceivedTitle')}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t('login.regPending')}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">{t('login.yourName')}</Label>
                      <Input id="signup-name" name="name" placeholder="Jane Smith" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t('login.email')}</Label>
                      <Input id="signup-email" name="email" type="email" placeholder="you@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">{t('login.phone')}</Label>
                      <Input id="signup-phone" name="phone" type="tel" placeholder="(555) 123-4567" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t('login.password')}</Label>
                      <Input id="signup-password" name="password" type="password" placeholder={t('login.passwordMinPlaceholder')} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">{t('login.confirmPassword')}</Label>
                      <Input id="signup-confirm" name="confirm" type="password" placeholder="••••••••" required />
                    </div>
                    {signUpError && <p className="text-sm text-red-600">{signUpError}</p>}
                    <Button type="submit" className="w-full bg-christina-blue hover:bg-christina-blue/90" disabled={loading}>
                      {loading ? t('login.creatingAccount') : t('login.createAccount')}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            {/* Signup Guide */}
            <div className="mt-4 text-center">
              <Link href="/signup-guide" className="text-sm text-christina-blue hover:underline">
                {t('login.signupGuideLink')}
              </Link>
            </div>

            {/* Other Login Links */}
            <div className="mt-3 flex justify-center gap-4 text-sm text-muted-foreground">
              <Link href="/admin-login" className="text-christina-red hover:underline">{t('login.staffLogin')}</Link>
              <span>·</span>
              <Link href="/employee-login" className="text-christina-red hover:underline">{t('login.employeePortal')}</Link>
            </div>
          </CardContent>
        </Card>

        {/* Trust footer — same warm reassurance as the home page */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/70">
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-christina-yellow" />
            Licensed by Minnesota DCYF
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-christina-yellow" />
            Family-Owned Since 2020
          </span>
        </div>
      </div>
    </div>
  );
}

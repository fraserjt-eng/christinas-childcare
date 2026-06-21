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
import { Clock, KeyRound, Mail, MapPin, Heart, ShieldCheck } from 'lucide-react';

export default function EmployeeLoginPage() {
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
        setPinError('Too many attempts. Please wait before trying again.');
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setPinError('Invalid PIN. Please try again.');
        setLoading(false);
        return;
      }

      const data = await res.json();
      const role = (data.user?.role || '').toLowerCase();
      const centerId = data.user?.center_id as string | undefined;
      // Scope the session to the signer's OWN center so they see their site.
      if (centerId) {
        document.cookie = `cc_center=${centerId}; path=/; max-age=86400; samesite=lax`;
        document.cookie = 'cc_view=single; path=/; max-age=86400; samesite=lax';
      }
      // Teachers to the room; owners/admins to their own office.
      router.push(role === 'teacher' ? '/preview/room' : '/preview/office');
    } catch {
      setPinError('Connection error. Please try again.');
      setLoading(false);
    }
  }, [router]);

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
        setEmailError(result.error || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      const sess = await establishServerSession();
      if (!sess.success || !sess.role) {
        setEmailError(sess.error || 'Could not complete sign-in.');
        setLoading(false);
        return;
      }

      router.push(redirectPathForRole(sess.role));
    } catch {
      setEmailError('Connection error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#fafafa] to-[#f5f0e8]">
      {/* Soft brand wash background, matching the home-page hero */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, #C62828 0%, transparent 70%)',
            left: '-8%',
            top: '4%',
          }}
        />
        <div
          className="absolute w-[520px] h-[520px] rounded-full opacity-[0.05]"
          style={{
            background: 'radial-gradient(circle, #FF7043 0%, transparent 70%)',
            right: '-6%',
            bottom: '8%',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        {/* Brand hero panel */}
        <div className="text-center lg:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-[#6b6b6b] mb-5">
            Staff &amp; Admin Sign-In
          </p>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
            <span className="text-christina-red">Christina&apos;s</span>
            <br />
            <span className="text-[#1a1a1a]">Child Care Center</span>
          </h1>

          <p className="mx-auto lg:mx-0 max-w-md text-lg text-[#6b6b6b] font-light leading-relaxed mb-8">
            Welcome back. Clock in, check your schedule, and pick up right where the day left off.
          </p>

          {/* Trust signals, echoing the public site */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3">
            <span className="flex items-center gap-2 text-sm text-[#6b6b6b]">
              <ShieldCheck className="h-4 w-4 text-christina-red" />
              MN Licensed
            </span>
            <span className="flex items-center gap-2 text-sm text-[#6b6b6b]">
              <Heart className="h-4 w-4 text-christina-red" />
              Caring Team
            </span>
            <span className="flex items-center gap-2 text-sm text-[#6b6b6b]">
              <MapPin className="h-4 w-4 text-christina-red" />
              Crystal &amp; Brooklyn Park, MN
            </span>
          </div>
        </div>

        {/* Sign-in card */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
          <Card className="rounded-3xl border-0 shadow-2xl shadow-christina-red/10 overflow-hidden">
            {/* Branded card header */}
            <div className="bg-gradient-to-br from-christina-red to-[#a12020] px-8 pt-8 pb-7 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 ring-1 ring-white/20">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-white">Employee Portal</h2>
              <p className="text-white/80 text-sm mt-1">Clock in/out and access your dashboard</p>
            </div>

            <CardContent className="p-6 sm:p-8">
              {/* Google OAuth button */}
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setEmailError('');
                  const { signInWithGoogle } = await import('@/lib/auth');
                  const result = await signInWithGoogle();
                  if (!result.success) {
                    setEmailError(result.error || 'Google sign-in failed.');
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-sm font-heading font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors mb-5 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>

              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400 uppercase tracking-wider">or PIN / email</span></div>
              </div>

              <Tabs defaultValue="pin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="pin" className="gap-2 data-[state=active]:bg-christina-red data-[state=active]:text-white">
                    <KeyRound className="h-4 w-4" />
                    Quick PIN
                  </TabsTrigger>
                  <TabsTrigger value="email" className="gap-2 data-[state=active]:bg-christina-red data-[state=active]:text-white">
                    <Mail className="h-4 w-4" />
                    Email Login
                  </TabsTrigger>
                </TabsList>

                {/* PIN Login Tab */}
                <TabsContent value="pin" className="mt-0">
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground">
                      Enter your 4-digit PIN to clock in/out
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
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@christinaschildcare.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Your password"
                        required
                      />
                    </div>
                    {emailError && (
                      <p className="text-sm text-red-600">{emailError}</p>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-christina-red hover:bg-christina-red/90 rounded-xl py-6 text-base"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Other Login Links */}
              <div className="mt-7 pt-6 border-t border-gray-100 flex justify-center gap-4 text-sm text-muted-foreground">
                <Link
                  href="/admin-login"
                  className="text-christina-red hover:underline font-medium"
                >
                  Admin Login
                </Link>
                <span>•</span>
                <Link
                  href="/login"
                  className="text-christina-blue hover:underline font-medium"
                >
                  Parent Portal
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

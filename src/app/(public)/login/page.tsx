'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, LogIn, UserPlus } from 'lucide-react';
import { authenticateFamily, seedFamilyData } from '@/lib/family-storage';

export default function ParentLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  useEffect(() => {
    seedFamilyData();
  }, []);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSignInError('');
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await authenticateFamily(email, password);
    if (result.family) {
      // Establish server-side HttpOnly session
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'parent', name: result.family.parents.find(p => p.is_primary)?.name || result.family.parents[0]?.name || email }),
      });
      if (res.status === 429) {
        setSignInError('Too many login attempts. Please wait before trying again.');
        setLoading(false);
        return;
      }
      router.push('/dashboard');
    } else if (result.pending) {
      setSignInError('Your account is pending approval. Christina will review and activate your account within 24 hours.');
      setLoading(false);
    } else {
      setSignInError('Invalid email or password.');
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
      setSignUpError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setSignUpError('Password must be at least 6 characters.');
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
      setSignUpError(err instanceof Error ? err.message : 'Registration failed.');
      setLoading(false);
    }
  }

  return (
    <div className="py-16">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-christina-blue flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Parent Portal</h1>
          <p className="text-muted-foreground">Sign in to view your child&apos;s progress</p>
        </div>
        <Card>
          <CardContent className="p-6">
            {/* Google OAuth button */}
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setSignInError('');
                const { signInWithGoogle } = await import('@/lib/auth');
                const result = await signInWithGoogle();
                if (!result.success) {
                  setSignInError(result.error || 'Google sign-in failed.');
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
              Sign in with Google
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-400">or email &amp; password</span></div>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="mt-0">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" name="email" type="email" placeholder="you@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" name="password" type="password" placeholder="••••••••" required />
                  </div>
                  {signInError && <p className="text-sm text-red-600">{signInError}</p>}
                  <Button type="submit" className="w-full bg-christina-blue hover:bg-christina-blue/90" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
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
                    <p className="font-semibold text-green-700">Registration received!</p>
                    <p className="text-sm text-muted-foreground mt-1">Your account is pending approval. Christina will review your information and activate your account within 24 hours. You will be able to log in once approved.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Your Name</Label>
                      <Input id="signup-name" name="name" placeholder="Jane Smith" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" name="email" type="email" placeholder="you@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone</Label>
                      <Input id="signup-phone" name="phone" type="tel" placeholder="(555) 123-4567" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" name="password" type="password" placeholder="At least 6 characters" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <Input id="signup-confirm" name="confirm" type="password" placeholder="••••••••" required />
                    </div>
                    {signUpError && <p className="text-sm text-red-600">{signUpError}</p>}
                    <Button type="submit" className="w-full bg-christina-blue hover:bg-christina-blue/90" disabled={loading}>
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            {/* Signup Guide */}
            <div className="mt-4 text-center">
              <Link href="/signup-guide" className="text-sm text-christina-blue hover:underline">
                New parent? View our step-by-step signup guide
              </Link>
            </div>

            {/* Other Login Links */}
            <div className="mt-3 flex justify-center gap-4 text-sm text-muted-foreground">
              <Link href="/admin-login" className="text-christina-red hover:underline">Staff login</Link>
              <span>·</span>
              <Link href="/employee-login" className="text-christina-red hover:underline">Employee portal</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

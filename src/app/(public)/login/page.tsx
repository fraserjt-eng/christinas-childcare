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

    await new Promise((r) => setTimeout(r, 500));

    const family = await authenticateFamily(email, password);
    if (family) {
      router.push('/dashboard');
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
      setTimeout(() => router.push('/dashboard'), 500);
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
                    <p className="font-semibold text-green-700">Account created!</p>
                    <p className="text-sm text-muted-foreground mt-1">Redirecting to your dashboard...</p>
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

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Demo Credentials</p>
              <p className="text-sm font-mono">Email: parent@demo.com</p>
              <p className="text-sm font-mono">Password: parent123</p>
            </div>

            {/* Other Login Links */}
            <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
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

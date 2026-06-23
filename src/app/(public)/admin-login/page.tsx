'use client';

// Admin portal sign-in. This is the door to the deep back office (/admin).
// Accepts a 4-digit admin PIN (fastest, what the owner uses to test) OR email /
// Google. After a successful sign-in it routes admins straight to /admin (not
// the staff portal). A non-admin PIN is rejected here with a pointer to the
// staff portal.

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PinPad } from '@/components/employee/PinPad';
import { ShieldCheck, KeyRound, Mail } from 'lucide-react';

const ADMIN_ROLES = ['admin', 'owner', 'superadmin'];

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [error, setError] = useState('');

  const handlePin = useCallback(
    async (pin: string) => {
      setLoading(true);
      setPinError('');
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
        if (role === 'superadmin' || role === 'admin' || role === 'owner') {
          // Land in the owner's office (the same page Christina sees); the Admin
          // button there opens the deep back office.
          if (centerId) {
            // A site owner/admin: scope every center-aware page to their center.
            document.cookie = `cc_center=${centerId}; path=/; max-age=86400; samesite=lax`;
            document.cookie = 'cc_view=single; path=/; max-age=86400; samesite=lax';
          } else {
            // A cross-center director (superadmin, or an owner with no home
            // center): default a center so the office renders, but DON'T force
            // single-center view — leave cc_view as-is so the admin hub's
            // Combined (all-centers) view keeps working. Forcing single here was
            // resetting Combined to one center on every login.
            document.cookie = `cc_center=3104ae69-4f26-4c1e-a767-3ff45b534860; path=/; max-age=86400; samesite=lax`;
          }
          router.push('/preview/office');
        } else {
          setPinError('That PIN is a staff PIN, not an admin PIN. Use the Staff portal.');
          setLoading(false);
        }
      } catch {
        setPinError('Connection error. Please try again.');
        setLoading(false);
      }
    },
    [router]
  );

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    try {
      const { signIn, establishServerSession } = await import('@/lib/auth');
      const result = await signIn(email, password);
      if (!result.success) {
        setError(result.error || 'Invalid credentials. Try the PIN, or Sign in with Google.');
        setLoading(false);
        return;
      }
      const sess = await establishServerSession();
      if (!sess.success || !sess.role) {
        setError(sess.error || 'Could not complete sign-in.');
        setLoading(false);
        return;
      }
      if (ADMIN_ROLES.includes((sess.role || '').toLowerCase())) {
        router.push('/admin');
      } else {
        setError('This account is not an admin. Use the Staff or Parent portal.');
        setLoading(false);
      }
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="py-16">
      <div className="mx-auto max-w-md px-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-christina-red">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground">The owner / director back office</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setError('');
                const { signInWithGoogle } = await import('@/lib/auth');
                const result = await signInWithGoogle();
                if (!result.success) {
                  setError(result.error || 'Google sign-in failed.');
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-heading font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-2 uppercase tracking-wider text-gray-400">or PIN / email</span></div>
            </div>

            <Tabs defaultValue="pin" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="pin" className="gap-2 data-[state=active]:bg-christina-red data-[state=active]:text-white">
                  <KeyRound className="h-4 w-4" /> Admin PIN
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-2 data-[state=active]:bg-christina-red data-[state=active]:text-white">
                  <Mail className="h-4 w-4" /> Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pin" className="mt-0">
                <p className="mb-4 text-center text-sm text-muted-foreground">Enter your 4-digit admin PIN</p>
                <PinPad onSubmit={handlePin} error={pinError} loading={loading} maxLength={4} />
              </TabsContent>

              <TabsContent value="email" className="mt-0">
                <form onSubmit={handleEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="you@christinaschildcare.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" placeholder="••••••••" required />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" className="w-full bg-christina-red hover:bg-christina-red/90" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-center gap-4 border-t border-gray-100 pt-4 text-sm text-muted-foreground">
              <Link href="/employee-login" className="text-christina-red hover:underline">Staff portal</Link>
              <span>•</span>
              <Link href="/start" className="hover:underline">All portals</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

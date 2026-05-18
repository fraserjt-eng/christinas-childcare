'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { signIn, establishServerSession } = await import('@/lib/auth');
      const { redirectPathForRole } = await import('@/lib/auth-allowlist');

      const result = await signIn(email, password);
      if (!result.success) {
        setError(result.error || 'Invalid credentials. Try Sign in with Google instead.');
        setLoading(false);
        return;
      }

      // Credential proven with Supabase. Exchange it for the signed session
      // cookie; the server derives the role.
      const sess = await establishServerSession();
      if (!sess.success || !sess.role) {
        setError(sess.error || 'Could not complete sign-in.');
        setLoading(false);
        return;
      }

      router.push(redirectPathForRole(sess.role));
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="py-24">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-christina-red flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Business Hub</h1>
          <p className="text-muted-foreground">Staff & Admin Sign In</p>
        </div>
        <Card>
          <CardContent className="p-6">
            {/* Google OAuth button */}
            <button
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
              <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-400">or sign in with email</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="staff@christinaschildcare.com" required />
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
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-christina-blue hover:underline">← Parent login</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

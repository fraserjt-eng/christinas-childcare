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

    await new Promise((r) => setTimeout(r, 600));

    // Test credentials for demo
    if (email === 'admin@demo.com' && password === 'admin123') {
      router.push('/admin');
    } else {
      setError('Invalid credentials. Use test login below.');
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
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Test Credentials</p>
              <p className="text-sm font-mono">Email: admin@demo.com</p>
              <p className="text-sm font-mono">Password: admin123</p>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-christina-blue hover:underline">← Parent login</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

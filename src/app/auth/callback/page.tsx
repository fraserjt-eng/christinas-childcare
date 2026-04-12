'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { SUPERADMIN_EMAILS } from '@/lib/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setError('Supabase is not configured.');
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Exchange the OAuth code for a session
      const { data: { session }, error: authError } = await supabase.auth.getSession();

      if (authError || !session) {
        setError('Authentication failed. Please try again.');
        return;
      }

      const email = session.user.email || '';
      const fullName = session.user.user_metadata?.full_name ||
                       session.user.user_metadata?.name ||
                       email.split('@')[0];

      // Determine role based on email
      const isSuperadmin = SUPERADMIN_EMAILS.includes(email.toLowerCase());
      const role = isSuperadmin ? 'superadmin' : (session.user.user_metadata?.role || 'parent');

      // Update Supabase user metadata with the correct role if superadmin
      if (isSuperadmin && session.user.user_metadata?.role !== 'superadmin') {
        await supabase.auth.updateUser({
          data: { role: 'superadmin', full_name: fullName },
        });
      }

      // Create server-side session cookie
      try {
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            role,
            name: fullName,
          }),
        });

        if (!res.ok) {
          setError('Failed to create session.');
          return;
        }

        // Redirect based on role
        if (isSuperadmin || role === 'owner' || role === 'admin') {
          router.push('/admin');
        } else if (role === 'teacher') {
          router.push('/employee');
        } else {
          router.push('/dashboard');
        }
      } catch {
        setError('Connection error. Please try again.');
      }
    }

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-christina-coral font-heading font-semibold">{error}</p>
          <a href="/admin-login" className="text-christina-blue hover:underline text-sm font-body">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christina-red mx-auto" />
        <p className="text-sm text-gray-500 font-body">Completing sign-in...</p>
      </div>
    </div>
  );
}

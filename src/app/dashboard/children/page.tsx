'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, ClipboardList } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  classroom: string | null;
  date_of_birth: string | null;
  photo_url?: string | null;
}

function ageFrom(dob: string | null): string {
  if (!dob) return '';
  const d = new Date(dob);
  if (isNaN(d.getTime())) return '';
  const months =
    (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  if (months < 24) return `${Math.max(0, Math.round(months))} months`;
  return `${Math.floor(months / 12)} years`;
}

function dobLabel(dob: string | null): string {
  if (!dob) return 'Not on file';
  const d = new Date(dob);
  if (isNaN(d.getTime())) return 'Not on file';
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/parent/children', { cache: 'no-store' });
        if (r.ok) {
          const d = await r.json();
          setChildren(d.children || []);
        }
      } catch {
        /* leave empty */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Users className="h-6 w-6 text-christina-red" />
        My Children
      </h1>

      {children.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No child is linked to your account yet. Once your enrollment is
            approved, your children appear here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => (
            <Card key={child.id}>
              <CardHeader>
                <CardTitle className="text-lg">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {child.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={child.photo_url}
                      alt={child.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-christina-blue/10 flex items-center justify-center">
                      <span className="font-heading font-bold text-christina-blue text-xl">
                        {child.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{child.name}</h2>
                    {ageFrom(child.date_of_birth) && (
                      <p className="text-muted-foreground">
                        {ageFrom(child.date_of_birth)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Date of Birth</span>
                  <span>{dobLabel(child.date_of_birth)}</span>
                  <span className="text-muted-foreground">Classroom</span>
                  <span>{child.classroom || 'Not assigned yet'}</span>
                </div>
                <Button asChild variant="outline" className="w-full gap-2">
                  <Link href="/dashboard/daily">
                    <ClipboardList className="h-4 w-4" />
                    View Daily Report
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

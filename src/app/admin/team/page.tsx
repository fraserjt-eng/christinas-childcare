'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShieldCheck, UserPlus, Copy, Check, RefreshCw } from 'lucide-react';

// Team & Access (Phase 6): the owner adds and manages backend users (admin /
// owner) over time so other directors get /admin access. Backed by the
// admin-gated /api/admin/team route. No DashboardLayout wrapper here: the admin
// layout (src/app/admin/layout.tsx) already provides ErrorBoundary +
// DashboardLayout for every /admin page.

interface TeamUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  center_id: string | null;
  employment_status: string;
}

interface Center {
  id: string;
  name: string;
}

const ALL_CENTERS = '__all__';

function roleBadgeClass(role: string): string {
  const r = (role || '').toLowerCase();
  if (r === 'owner') return 'bg-christina-red text-white';
  if (r === 'director') return 'bg-christina-coral text-white';
  if (r === 'admin') return 'bg-christina-blue text-white';
  return 'bg-muted text-muted-foreground';
}

function roleLabel(role: string): string {
  const r = (role || '').toLowerCase();
  if (r === 'owner') return 'Owner';
  if (r === 'admin') return 'Admin';
  if (r === 'director') return 'Director';
  if (r === 'teacher') return 'Teacher';
  return role || 'User';
}

export default function TeamAccessPage() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Add form state.
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'owner'>('admin');
  const [centerId, setCenterId] = useState<string>(ALL_CENTERS);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/admin/team', { cache: 'no-store' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLoadError(data.error || 'Could not load the team.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
      setCenters(Array.isArray(data.centers) ? data.centers : []);
    } catch {
      setLoadError('Could not load the team.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function centerName(id: string | null): string {
    if (!id) return 'All centers';
    return centers.find((c) => c.id === id)?.name || 'Center';
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setGeneratedLink(null);
    setCopied(false);
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          role,
          centerId: role === 'owner' || centerId === ALL_CENTERS ? null : centerId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || 'Could not add the user.');
        setSubmitting(false);
        return;
      }
      setGeneratedLink(data.link || null);
      if (!data.link && data.warning) {
        setFormError(data.warning);
      }
      // Reset the form fields, keep the link visible.
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('admin');
      setCenterId(ALL_CENTERS);
      await load();
    } catch {
      setFormError('Could not add the user.');
    }
    setSubmitting(false);
  }

  async function copyLink() {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable; the link is still visible to copy manually */
    }
  }

  async function handleRoleChange(user: TeamUser, nextRole: string) {
    if (nextRole === user.role) return;
    const res = await fetch('/api/admin/team', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, role: nextRole }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error || 'Could not change the role.');
      return;
    }
    await load();
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Team &amp; Access</h1>
          <p className="text-muted-foreground">
            Add and manage directors and admins who can sign in to the back office.
          </p>
        </div>
      </div>

      {/* Add a director / admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-christina-red" />
            Add a director / admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'owner')}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="owner">Owner (all centers)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {role === 'admin' && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="center">Center</Label>
                  <Select value={centerId} onValueChange={setCenterId}>
                    <SelectTrigger id="center">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_CENTERS}>All centers</SelectItem>
                      {centers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {formError && (
              <p className="text-sm text-christina-red">{formError}</p>
            )}

            <Button type="submit" disabled={submitting} className="bg-christina-red hover:bg-christina-red/90">
              {submitting ? 'Adding...' : 'Add user'}
            </Button>
          </form>

          {generatedLink && (
            <div className="mt-4 rounded-lg border border-christina-green/40 bg-christina-green/5 p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">
                User added. Send this link to the new admin:
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="flex-1 break-all rounded bg-muted px-2 py-1.5 text-xs">
                  {generatedLink}
                </code>
                <Button type="button" variant="outline" size="sm" onClick={copyLink}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" /> Copy link
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Send this link to the new admin. They set their password, then sign in at /admin.
                The link expires in 7 days.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current backend users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Current team</CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading team...</p>
          ) : loadError ? (
            <p className="text-sm text-christina-red">{loadError}</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">
              No backend users yet. Add a director or admin above.
            </p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {u.first_name} {u.last_name}
                      </p>
                      <Badge className={roleBadgeClass(u.role)}>{roleLabel(u.role)}</Badge>
                      {u.employment_status !== 'active' && (
                        <Badge variant="outline" className="text-xs">
                          {u.employment_status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    <p className="text-xs text-muted-foreground">{centerName(u.center_id)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Role</Label>
                    <Select
                      value={['admin', 'owner', 'teacher'].includes(u.role) ? u.role : 'admin'}
                      onValueChange={(v) => handleRoleChange(u, v)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

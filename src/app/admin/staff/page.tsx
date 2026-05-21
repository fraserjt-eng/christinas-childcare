'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Pencil } from 'lucide-react';
import { getEmployees } from '@/lib/employee-storage';
import type { Employee } from '@/types/employee';
import { EditStaffDialog } from '@/components/admin/EditStaffDialog';

function initials(e: Employee): string {
  return `${(e.first_name || '?')[0]}${(e.last_name || '?')[0]}`.toUpperCase();
}

function colorForRole(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('owner') || t.includes('director')) return 'bg-christina-red';
  if (t.includes('infant')) return 'bg-pink-500';
  if (t.includes('toddler')) return 'bg-blue-500';
  if (t.includes('preschool')) return 'bg-purple-500';
  if (t.includes('school age')) return 'bg-green-600';
  return 'bg-amber-500';
}

export default function StaffDirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function load() {
    setLoading(true);
    const data = await getEmployees();
    setEmployees(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(id: string, updates: Partial<Employee>) {
    // PATCH server-side. The previous client path went through anon Supabase,
    // which RLS silently denies for the employees table; PIN edits never
    // persisted. The server route runs with the service role.
    const res = await fetch('/api/admin/staff', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error || 'Could not save changes.');
      return;
    }
    await load();
  }

  function openEdit(emp: Employee) {
    setEditing(emp);
    setDialogOpen(true);
  }

  const active = employees.filter((e) => e.employment_status === 'active');
  const inactive = employees.filter((e) => e.employment_status !== 'active');

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Staff Directory</h1>
          <p className="text-muted-foreground">
            Click any profile to edit access, permissions, and contact info
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading staff...</p>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No staff members yet. Add employees from Admin → HR.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {active.map((emp) => (
              <Card
                key={emp.id}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => openEdit(emp)}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className={`${colorForRole(emp.job_title)} text-white text-lg font-semibold`}>
                        {initials(emp)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {emp.first_name} {emp.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{emp.job_title}</p>
                    </div>
                    {emp.certifications?.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1">
                        {emp.certifications.slice(0, 3).map((c) => (
                          <Badge key={c} variant="secondary" className="text-xs">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {emp.permissions && Object.values(emp.permissions).some(Boolean) && (
                      <Badge variant="outline" className="text-xs">
                        {Object.values(emp.permissions).filter(Boolean).length} permissions
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {inactive.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-muted-foreground">Inactive ({inactive.length})</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {inactive.map((emp) => (
                  <Card
                    key={emp.id}
                    className="opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
                    onClick={() => openEdit(emp)}
                  >
                    <CardContent className="pt-4 pb-4 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                          {initials(emp)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {emp.first_name} {emp.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{emp.job_title}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <EditStaffDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={editing}
        onSave={handleSave}
      />
    </div>
  );
}

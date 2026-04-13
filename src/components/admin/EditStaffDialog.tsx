'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { Employee } from '@/types/employee';
import {
  PERMISSION_LABELS,
  ROUTE_ACCESS_OPTIONS,
  type PermissionKey,
} from '@/lib/permissions';

interface EditStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSave: (id: string, updates: Partial<Employee>) => Promise<void>;
}

export function EditStaffDialog({ open, onOpenChange, employee, onSave }: EditStaffDialogProps) {
  const [form, setForm] = useState<Partial<Employee>>({});
  const [certInput, setCertInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm({ ...employee });
    }
  }, [employee]);

  if (!employee) return null;

  function update<K extends keyof Employee>(key: K, value: Employee[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function togglePermission(key: PermissionKey, value: boolean) {
    setForm((prev) => ({
      ...prev,
      permissions: { ...(prev.permissions || {}), [key]: value },
    }));
  }

  function togglePageAccess(prefix: string, checked: boolean) {
    const current = form.pageAccess || [];
    const next = checked ? Array.from(new Set([...current, prefix])) : current.filter((p) => p !== prefix);
    update('pageAccess', next);
  }

  function addCert() {
    const c = certInput.trim();
    if (!c) return;
    update('certifications', Array.from(new Set([...(form.certifications || []), c])));
    setCertInput('');
  }

  function removeCert(c: string) {
    update('certifications', (form.certifications || []).filter((x) => x !== c));
  }

  async function handleSave() {
    if (!employee) return;
    setSaving(true);
    try {
      await onSave(employee.id, form);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  const permissionKeys = Object.keys(PERMISSION_LABELS) as PermissionKey[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Staff Profile</DialogTitle>
          <DialogDescription>
            {employee.first_name} {employee.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <section className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Profile</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name</Label>
                <Input value={form.first_name || ''} onChange={(e) => update('first_name', e.target.value)} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={form.last_name || ''} onChange={(e) => update('last_name', e.target.value)} />
              </div>
              <div>
                <Label>Job Title</Label>
                <Input value={form.job_title || ''} onChange={(e) => update('job_title', e.target.value)} />
              </div>
              <div>
                <Label>Hourly Rate</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.hourly_rate ?? 0}
                  onChange={(e) => update('hourly_rate', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Employment Status</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.employment_status || 'active'}
                  onChange={(e) => update('employment_status', e.target.value as Employee['employment_status'])}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate || form.hire_date || ''}
                  onChange={(e) => update('startDate', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea
                rows={2}
                value={form.bio || ''}
                onChange={(e) => update('bio', e.target.value)}
                placeholder="Short bio for team directory"
              />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Contact</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Phone</Label>
                <Input value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} />
              </div>
              <div>
                <Label>Emergency Contact Name</Label>
                <Input
                  value={form.emergency_contact_name || ''}
                  onChange={(e) => update('emergency_contact_name', e.target.value)}
                />
              </div>
              <div>
                <Label>Emergency Contact Phone</Label>
                <Input
                  value={form.emergency_contact_phone || ''}
                  onChange={(e) => update('emergency_contact_phone', e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Certifications</h3>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. CPR/First Aid"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCert();
                  }
                }}
              />
              <Button type="button" onClick={addCert}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(form.certifications || []).map((c) => (
                <Badge key={c} variant="secondary" className="gap-1">
                  {c}
                  <button onClick={() => removeCert(c)} aria-label={`Remove ${c}`}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Access & Permissions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {permissionKeys.map((key) => (
                <div key={key} className="flex items-center justify-between p-2 rounded border">
                  <Label className="text-sm font-normal cursor-pointer" htmlFor={`perm-${key}`}>
                    {PERMISSION_LABELS[key]}
                  </Label>
                  <Switch
                    id={`perm-${key}`}
                    checked={!!form.permissions?.[key]}
                    onCheckedChange={(v) => togglePermission(key, v)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Page Access</h3>
            <p className="text-xs text-muted-foreground">
              Leave all unchecked for default role-based access. Check specific pages to whitelist.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ROUTE_ACCESS_OPTIONS.map((opt) => (
                <div key={opt.prefix} className="flex items-center gap-2">
                  <Checkbox
                    id={`page-${opt.prefix}`}
                    checked={(form.pageAccess || []).includes(opt.prefix)}
                    onCheckedChange={(v) => togglePageAccess(opt.prefix, !!v)}
                  />
                  <Label htmlFor={`page-${opt.prefix}`} className="text-sm font-normal cursor-pointer">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex gap-2 pt-4 border-t mt-6 sticky bottom-0 bg-background">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-christina-red hover:bg-christina-red/90"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

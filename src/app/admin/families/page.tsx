'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Plus,
  Search,
  Check,
  X,
  Edit,
  Trash2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  FamilyAccount,
  FamilyParent,
  FamilyChild,
  EmergencyContact,
  generateParentId,
  generateChildId,
} from '@/types/family';
// Families are read/written through the admin service-role API. The old
// client family-storage used the anon key, which migration 017 locks out
// (empty list, silent save failures). Same pattern as User Management.
type ChildPayload = {
  name: string;
  date_of_birth?: string;
  classroom?: string;
  allergies?: string[];
  medical_notes?: string;
};
function primaryOf(f: Pick<FamilyAccount, 'parents'>) {
  return f.parents?.find((p) => p.is_primary) || f.parents?.[0];
}
function childrenPayload(f: Pick<FamilyAccount, 'children'>): ChildPayload[] {
  return (f.children || [])
    .filter((c) => (c.name || '').trim())
    .map((c) => ({
      name: c.name.trim(),
      date_of_birth: c.date_of_birth || undefined,
      classroom: c.classroom || undefined,
      allergies: c.allergies || [],
      medical_notes: c.medical_notes || undefined,
    }));
}
import { FamilyBulkUpload } from '@/components/admin/FamilyBulkUpload';

// ============================================================================
// Helpers
// ============================================================================

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Never';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

function getAge(dob: string): string {
  try {
    const birth = new Date(dob);
    const now = new Date();
    const months =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth());
    if (months < 12) return `${months}mo`;
    const years = Math.floor(months / 12);
    return `${years}y`;
  } catch {
    return '';
  }
}

function getPrimaryParent(family: FamilyAccount): FamilyParent | undefined {
  return family.parents.find((p) => p.is_primary) ?? family.parents[0];
}

function getPrograms(family: FamilyAccount): string {
  const programs = new Set<string>();
  family.children.forEach((c) => {
    if (c.classroom) programs.add(c.classroom);
  });
  return programs.size > 0 ? Array.from(programs).join(', ') : 'Not assigned';
}

// ============================================================================
// Status Badge
// ============================================================================

function StatusBadge({ status }: { status: FamilyAccount['status'] }) {
  const styles: Record<FamilyAccount['status'], string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };
  return (
    <Badge variant="outline" className={styles[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

// ============================================================================
// Empty child / parent builders
// ============================================================================

function emptyChild(): ChildFormData {
  return {
    id: generateChildId(),
    name: '',
    date_of_birth: '',
    classroom: '',
    allergies: '',
    medical_notes: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
  };
}

function emptyParent(isPrimary: boolean): ParentFormData {
  return {
    id: generateParentId(),
    name: '',
    email: '',
    phone: '',
    relationship: 'guardian' as const,
    is_primary: isPrimary,
  };
}

// ============================================================================
// Form shape (flat, easier to bind to inputs)
// ============================================================================

interface ParentFormData {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: 'mother' | 'father' | 'guardian' | 'other';
  is_primary: boolean;
}

interface ChildFormData {
  id: string;
  name: string;
  date_of_birth: string;
  classroom: string;
  allergies: string;
  medical_notes: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
}

interface FamilyFormState {
  parent1: ParentFormData;
  hasParent2: boolean;
  parent2: ParentFormData;
  pin: string;
  address: string;
  children: ChildFormData[];
  tempPassword: string;
}

function buildInitialForm(): FamilyFormState {
  return {
    parent1: emptyParent(true),
    hasParent2: false,
    parent2: emptyParent(false),
    pin: generatePin(),
    address: '',
    children: [emptyChild()],
    tempPassword: generateTempPassword(),
  };
}

function buildFormFromFamily(family: FamilyAccount): FamilyFormState {
  const primary = family.parents.find((p) => p.is_primary) ?? family.parents[0];
  const secondary = family.parents.find((p) => !p.is_primary);

  const toParentForm = (p: FamilyParent): ParentFormData => ({
    id: p.id,
    name: p.name,
    email: p.email,
    phone: p.phone,
    relationship: p.relationship,
    is_primary: p.is_primary,
  });

  const toChildForm = (c: FamilyChild): ChildFormData => {
    const ec = c.emergency_contacts[0];
    return {
      id: c.id,
      name: c.name,
      date_of_birth: c.date_of_birth,
      classroom: c.classroom ?? '',
      allergies: c.allergies.join(', '),
      medical_notes: c.medical_notes ?? '',
      emergency_contact_name: ec?.name ?? '',
      emergency_contact_phone: ec?.phone ?? '',
      emergency_contact_relationship: ec?.relationship ?? '',
    };
  };

  return {
    parent1: primary ? toParentForm(primary) : emptyParent(true),
    hasParent2: !!secondary,
    parent2: secondary ? toParentForm(secondary) : emptyParent(false),
    pin: family.pin ?? generatePin(),
    address: family.address ?? '',
    children: family.children.length > 0 ? family.children.map(toChildForm) : [emptyChild()],
    tempPassword: '',
  };
}

function formToFamilyData(
  form: FamilyFormState,
  tempPassword: string
): Omit<FamilyAccount, 'id' | 'created_at' | 'updated_at'> {
  const parents: FamilyParent[] = [
    {
      id: form.parent1.id,
      name: form.parent1.name,
      email: form.parent1.email,
      phone: form.parent1.phone,
      relationship: form.parent1.relationship,
      is_primary: true,
    },
  ];

  if (form.hasParent2 && form.parent2.name) {
    parents.push({
      id: form.parent2.id,
      name: form.parent2.name,
      email: form.parent2.email,
      phone: form.parent2.phone,
      relationship: form.parent2.relationship,
      is_primary: false,
    });
  }

  const children: FamilyChild[] = form.children
    .filter((c) => c.name.trim() !== '')
    .map((c) => {
      const emergencyContacts: EmergencyContact[] = c.emergency_contact_name
        ? [
            {
              name: c.emergency_contact_name,
              phone: c.emergency_contact_phone,
              relationship: c.emergency_contact_relationship,
            },
          ]
        : [];

      return {
        id: c.id,
        name: c.name,
        date_of_birth: c.date_of_birth,
        classroom: c.classroom || undefined,
        allergies: c.allergies
          ? c.allergies.split(',').map((a) => a.trim()).filter(Boolean)
          : [],
        medical_notes: c.medical_notes || undefined,
        emergency_contacts: emergencyContacts,
      };
    });

  return {
    email: form.parent1.email,
    password_hash: tempPassword,
    pin: form.pin,
    status: 'active',
    parents,
    children,
    address: form.address || undefined,
  };
}

// ============================================================================
// Family Form (shared by Add + Edit dialogs)
// ============================================================================

function FamilyFormContent({
  form,
  onChange,
  isEdit,
}: {
  form: FamilyFormState;
  onChange: (form: FamilyFormState) => void;
  isEdit: boolean;
}) {
  const updateParent1 = (field: keyof ParentFormData, value: string) =>
    onChange({ ...form, parent1: { ...form.parent1, [field]: value } });

  const updateParent2 = (field: keyof ParentFormData, value: string) =>
    onChange({ ...form, parent2: { ...form.parent2, [field]: value } });

  const updateChild = (index: number, field: keyof ChildFormData, value: string) => {
    const updated = form.children.map((c, i) => (i === index ? { ...c, [field]: value } : c));
    onChange({ ...form, children: updated });
  };

  const addChild = () => onChange({ ...form, children: [...form.children, emptyChild()] });

  const removeChild = (index: number) => {
    if (form.children.length <= 1) return;
    onChange({ ...form, children: form.children.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6 py-2 max-h-[65vh] overflow-y-auto pr-1">
      {/* Parent 1 */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Primary Parent / Guardian</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label htmlFor="p1-name">Full Name *</Label>
            <Input
              id="p1-name"
              value={form.parent1.name}
              onChange={(e) => updateParent1('name', e.target.value)}
              placeholder="Jane Smith"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="p1-email">Email *</Label>
            <Input
              id="p1-email"
              type="email"
              value={form.parent1.email}
              onChange={(e) => updateParent1('email', e.target.value)}
              placeholder="jane@email.com"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="p1-phone">Phone *</Label>
            <Input
              id="p1-phone"
              type="tel"
              value={form.parent1.phone}
              onChange={(e) => updateParent1('phone', e.target.value)}
              placeholder="(612) 555-0100"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label htmlFor="p1-relationship">Relationship</Label>
            <Select
              value={form.parent1.relationship}
              onValueChange={(v) =>
                updateParent1('relationship', v)
              }
            >
              <SelectTrigger id="p1-relationship">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mother">Mother</SelectItem>
                <SelectItem value="father">Father</SelectItem>
                <SelectItem value="guardian">Guardian</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Parent 2 toggle */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="has-parent2"
            checked={form.hasParent2}
            onChange={(e) => onChange({ ...form, hasParent2: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="has-parent2" className="cursor-pointer">
            Add second parent / guardian
          </Label>
        </div>

        {form.hasParent2 && (
          <div className="grid grid-cols-2 gap-3 pl-2 border-l-2 border-muted">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="p2-name">Full Name</Label>
              <Input
                id="p2-name"
                value={form.parent2.name}
                onChange={(e) => updateParent2('name', e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p2-email">Email</Label>
              <Input
                id="p2-email"
                type="email"
                value={form.parent2.email}
                onChange={(e) => updateParent2('email', e.target.value)}
                placeholder="john@email.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p2-phone">Phone</Label>
              <Input
                id="p2-phone"
                type="tel"
                value={form.parent2.phone}
                onChange={(e) => updateParent2('phone', e.target.value)}
                placeholder="(612) 555-0200"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label htmlFor="p2-relationship">Relationship</Label>
              <Select
                value={form.parent2.relationship}
                onValueChange={(v) => updateParent2('relationship', v)}
              >
                <SelectTrigger id="p2-relationship">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mother">Mother</SelectItem>
                  <SelectItem value="father">Father</SelectItem>
                  <SelectItem value="guardian">Guardian</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* PIN */}
      <div className="space-y-1">
        <Label htmlFor="family-pin">Family PIN</Label>
        <div className="flex gap-2">
          <Input
            id="family-pin"
            value={form.pin}
            onChange={(e) => onChange({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            placeholder="4-digit PIN"
            maxLength={4}
            className="w-32 font-mono tracking-widest"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange({ ...form, pin: generatePin() })}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Regenerate
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Used for kiosk check-in at the front door.</p>
      </div>

      {/* Address */}
      <div className="space-y-1">
        <Label htmlFor="family-address">Home Address</Label>
        <Input
          id="family-address"
          value={form.address}
          onChange={(e) => onChange({ ...form, address: e.target.value })}
          placeholder="123 Oak Street, Crystal, MN 55428"
        />
      </div>

      {/* Temp password (add mode only) */}
      {!isEdit && (
        <div className="space-y-1">
          <Label>Temporary Password</Label>
          <div className="flex gap-2 items-center">
            <Input
              value={form.tempPassword}
              readOnly
              className="font-mono text-sm bg-muted"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange({ ...form, tempPassword: generateTempPassword() })}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this password with the family for their first login. Save it now as it will not be shown again.
          </p>
        </div>
      )}

      {/* Children */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Children</h3>
          <Button type="button" variant="outline" size="sm" onClick={addChild}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Child
          </Button>
        </div>

        {form.children.map((child, idx) => (
          <div key={child.id} className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Child {idx + 1}
              </span>
              {form.children.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeChild(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label htmlFor={`child-${idx}-name`}>Name *</Label>
                <Input
                  id={`child-${idx}-name`}
                  value={child.name}
                  onChange={(e) => updateChild(idx, 'name', e.target.value)}
                  placeholder="Emma Smith"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`child-${idx}-dob`}>Date of Birth</Label>
                <Input
                  id={`child-${idx}-dob`}
                  type="date"
                  value={child.date_of_birth}
                  onChange={(e) => updateChild(idx, 'date_of_birth', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`child-${idx}-program`}>Program</Label>
                <Select
                  value={child.classroom}
                  onValueChange={(v) => updateChild(idx, 'classroom', v)}
                >
                  <SelectTrigger id={`child-${idx}-program`}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infant">Infant</SelectItem>
                    <SelectItem value="toddler">Toddler</SelectItem>
                    <SelectItem value="preschool">Preschool</SelectItem>
                    <SelectItem value="school_age">School Age</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor={`child-${idx}-allergies`}>Allergies</Label>
                <Input
                  id={`child-${idx}-allergies`}
                  value={child.allergies}
                  onChange={(e) => updateChild(idx, 'allergies', e.target.value)}
                  placeholder="Peanuts, Dairy (comma separated)"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor={`child-${idx}-medical`}>Medical Notes</Label>
                <Textarea
                  id={`child-${idx}-medical`}
                  value={child.medical_notes}
                  onChange={(e) => updateChild(idx, 'medical_notes', e.target.value)}
                  placeholder="EpiPen on file, asthma inhaler..."
                  rows={2}
                />
              </div>
            </div>

            {/* Emergency contact */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Emergency Contact
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`child-${idx}-ec-name`}>Name</Label>
                  <Input
                    id={`child-${idx}-ec-name`}
                    value={child.emergency_contact_name}
                    onChange={(e) => updateChild(idx, 'emergency_contact_name', e.target.value)}
                    placeholder="Grandma Carol"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`child-${idx}-ec-phone`}>Phone</Label>
                  <Input
                    id={`child-${idx}-ec-phone`}
                    type="tel"
                    value={child.emergency_contact_phone}
                    onChange={(e) => updateChild(idx, 'emergency_contact_phone', e.target.value)}
                    placeholder="(612) 555-0300"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor={`child-${idx}-ec-rel`}>Relationship</Label>
                  <Input
                    id={`child-${idx}-ec-rel`}
                    value={child.emergency_contact_relationship}
                    onChange={(e) => updateChild(idx, 'emergency_contact_relationship', e.target.value)}
                    placeholder="Grandmother"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// View Details Dialog
// ============================================================================

function FamilyDetailsDialog({
  family,
  open,
  onClose,
}: {
  family: FamilyAccount | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!family) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Family Details</DialogTitle>
          <DialogDescription>
            Account created {formatDate(family.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
          {family.parents.map((p) => (
            <div key={p.id} className="space-y-1">
              <p className="text-sm font-semibold">
                {p.name}{' '}
                <span className="font-normal text-muted-foreground capitalize">({p.relationship})</span>
                {p.is_primary && (
                  <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{p.email}</p>
              <p className="text-sm text-muted-foreground">{p.phone}</p>
            </div>
          ))}

          {family.address && (
            <p className="text-sm text-muted-foreground">{family.address}</p>
          )}

          <div className="border-t pt-3 space-y-3">
            <p className="text-sm font-semibold">Children ({family.children.length})</p>
            {family.children.map((c) => (
              <div key={c.id} className="rounded-lg bg-muted/40 p-3 space-y-1 text-sm">
                <p className="font-medium">
                  {c.name}
                  {c.date_of_birth && (
                    <span className="text-muted-foreground font-normal ml-2">
                      {getAge(c.date_of_birth)}
                    </span>
                  )}
                </p>
                {c.classroom && <p className="text-muted-foreground capitalize">{c.classroom}</p>}
                {c.allergies.length > 0 && (
                  <p className="text-christina-coral font-medium">
                    Allergies: {c.allergies.join(', ')}
                  </p>
                )}
                {c.medical_notes && (
                  <p className="text-muted-foreground">{c.medical_notes}</p>
                )}
                {c.emergency_contacts.length > 0 && (
                  <p className="text-muted-foreground">
                    Emergency: {c.emergency_contacts[0].name} ({c.emergency_contacts[0].phone})
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="border-t pt-3 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">PIN:</span>
            <span className="font-mono font-semibold">{family.pin ?? 'Not set'}</span>
            <StatusBadge status={family.status} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Page
// ============================================================================

type SortDir = 'asc' | 'desc';

export default function FamiliesPage() {
  const [families, setFamilies] = useState<FamilyAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FamilyAccount['status'] | 'all'>('all');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [detailFamily, setDetailFamily] = useState<FamilyAccount | null>(null);
  const [editingFamily, setEditingFamily] = useState<FamilyAccount | null>(null);

  const [addForm, setAddForm] = useState<FamilyFormState>(buildInitialForm);
  const [editForm, setEditForm] = useState<FamilyFormState>(buildInitialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedPassword, setSavedPassword] = useState<string | null>(null);

  const loadFamilies = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/families', { cache: 'no-store' });
      if (!r.ok) {
        setFamilies([]);
        return;
      }
      const d = await r.json();
      const data: FamilyAccount[] = d.families || [];
      setFamilies(
        data.map((f) => ({ ...f, status: f.status || 'active' }))
      );
    } catch {
      setFamilies([]);
    }
  }, []);

  useEffect(() => {
    loadFamilies();
  }, [loadFamilies]);

  const pendingFamilies = families.filter((f) => f.status === 'pending');

  const filteredFamilies = families
    .filter((f) => {
      const primary = getPrimaryParent(f);
      const matchesSearch =
        !searchQuery ||
        (primary?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        f.children.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        f.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const nameA = getPrimaryParent(a)?.name ?? '';
      const nameB = getPrimaryParent(b)?.name ?? '';
      return sortDir === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  // Approval actions
  const patchFamily = async (payload: Record<string, unknown>) => {
    await fetch('/api/admin/families', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  const handleApprove = async (id: string) => {
    await patchFamily({ id, status: 'active' });
    loadFamilies();
  };

  const handleDecline = async (id: string) => {
    await patchFamily({ id, status: 'inactive' });
    loadFamilies();
  };

  // Add family
  const handleAddFamily = async () => {
    setFormError(null);
    if (!addForm.parent1.name || !addForm.parent1.email || !addForm.parent1.phone) {
      setFormError('Primary parent name, email, and phone are required.');
      return;
    }
    if (addForm.children.every((c) => !c.name.trim())) {
      setFormError('At least one child name is required.');
      return;
    }

    const data = formToFamilyData(addForm, addForm.tempPassword);
    const p = primaryOf(data);
    const res = await fetch('/api/admin/family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        parentName: p?.name || '',
        parentPhone: p?.phone || '',
        pin: data.pin || undefined,
        children: childrenPayload(data),
      }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      setFormError(e.error || 'Could not add the family.');
      return;
    }
    setSavedPassword(addForm.tempPassword);
    setIsAddDialogOpen(false);
    setAddForm(buildInitialForm());
    loadFamilies();
  };

  const openAddDialog = () => {
    setAddForm(buildInitialForm());
    setFormError(null);
    setSavedPassword(null);
    setIsAddDialogOpen(true);
  };

  // Edit family
  const openEditDialog = (family: FamilyAccount) => {
    setEditingFamily(family);
    setEditForm(buildFormFromFamily(family));
    setFormError(null);
    setIsEditDialogOpen(true);
  };

  const handleEditFamily = async () => {
    setFormError(null);
    if (!editingFamily) return;
    if (!editForm.parent1.name || !editForm.parent1.email || !editForm.parent1.phone) {
      setFormError('Primary parent name, email, and phone are required.');
      return;
    }

    const data = formToFamilyData(editForm, editingFamily.password_hash);
    const p = primaryOf(data);
    await patchFamily({
      id: editingFamily.id,
      email: data.email,
      address: data.address || '',
      family_bio: data.family_bio || '',
      parentName: p?.name || '',
      parentPhone: p?.phone || '',
      children: childrenPayload(data),
    });
    setIsEditDialogOpen(false);
    setEditingFamily(null);
    loadFamilies();
  };

  const toggleSort = () => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-christina-red/10 rounded-lg">
            <Users className="h-6 w-6 text-christina-red" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Family Management</h1>
            <p className="text-muted-foreground">
              {families.length} {families.length === 1 ? 'family' : 'families'} registered
            </p>
          </div>
        </div>

        {/* Saved password toast */}
        {savedPassword && (
          <div className="rounded-lg border border-green-300 bg-green-50 p-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-green-800">Family account created.</p>
              <p className="text-sm text-green-700 mt-0.5">
                Temporary password:{' '}
                <span className="font-mono font-bold">{savedPassword}</span>. Save this now. It will not be shown again.
              </p>
            </div>
            <button
              onClick={() => setSavedPassword(null)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Section 1: Pending Approvals */}
        {pendingFamilies.length > 0 && (
          <div className="space-y-3">
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-yellow-800">
                {pendingFamilies.length}{' '}
                {pendingFamilies.length === 1 ? 'family' : 'families'} awaiting approval
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pendingFamilies.map((family) => {
                const primary = getPrimaryParent(family);
                return (
                  <Card key={family.id} className="border-yellow-200">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <p className="font-medium">{primary?.name ?? 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{primary?.email}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {family.children.length}{' '}
                          {family.children.length === 1 ? 'child' : 'children'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Registered {formatDate(family.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-christina-green hover:bg-christina-green/90 text-white flex-1"
                          onClick={() => handleApprove(family.id)}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive flex-1"
                          onClick={() => handleDecline(family.id)}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Family List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex flex-1 gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[180px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as FamilyAccount['status'] | 'all')}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <FamilyBulkUpload onImport={loadFamilies} />
                <Dialog open={isAddDialogOpen} onOpenChange={(v) => { if (!v) setIsAddDialogOpen(false); }}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-christina-red hover:bg-christina-red/90"
                      onClick={openAddDialog}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Family
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Add New Family</DialogTitle>
                      <DialogDescription>
                        Create a family account. The temporary password is shown once after saving.
                      </DialogDescription>
                    </DialogHeader>
                    {formError && (
                      <div className="px-1 pb-1">
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                          {formError}
                        </div>
                      </div>
                    )}
                    <FamilyFormContent form={addForm} onChange={setAddForm} isEdit={false} />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddFamily}
                        className="bg-christina-red hover:bg-christina-red/90"
                      >
                        Create Family
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        onClick={toggleSort}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Family Name
                        {sortDir === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Children</TableHead>
                    <TableHead className="hidden md:table-cell">Program(s)</TableHead>
                    <TableHead>PIN</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Registered</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFamilies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        No families found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFamilies.map((family) => {
                      const primary = getPrimaryParent(family);
                      return (
                        <TableRow key={family.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{primary?.name ?? 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{primary?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              {family.children.length === 0 ? (
                                <span className="text-muted-foreground text-sm">None</span>
                              ) : (
                                family.children.map((c) => (
                                  <p key={c.id} className="text-sm">
                                    {c.name}
                                    {c.date_of_birth && (
                                      <span className="text-muted-foreground ml-1 text-xs">
                                        {getAge(c.date_of_birth)}
                                      </span>
                                    )}
                                  </p>
                                ))
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground capitalize">
                            {getPrograms(family)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {family.pin ?? 'Not set'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={family.status} />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {formatDate(family.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Edit family"
                                onClick={() => openEditDialog(family)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="View details"
                                onClick={() => setDetailFamily(family)}
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Showing {filteredFamilies.length} of {families.length} families
            </p>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(v) => { if (!v) setIsEditDialogOpen(false); }}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Edit Family</DialogTitle>
              <DialogDescription>
                Update family information and child records.
              </DialogDescription>
            </DialogHeader>
            {formError && (
              <div className="px-1 pb-1">
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {formError}
                </div>
              </div>
            )}
            <FamilyFormContent form={editForm} onChange={setEditForm} isEdit />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleEditFamily}
                className="bg-christina-red hover:bg-christina-red/90"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <FamilyDetailsDialog
          family={detailFamily}
          open={!!detailFamily}
          onClose={() => setDetailFamily(null)}
        />
      </div>
    </>
  );
}

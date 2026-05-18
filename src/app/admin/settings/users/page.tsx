'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users, Plus, Search, MoreHorizontal, ArrowLeft,
  Pencil, UserX, UserCheck, KeyRound, Mail, RefreshCw,
} from 'lucide-react';
import {
  AppUser,
  getUsers,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
  ROLE_DEFINITIONS,
  purgeDemoUsers,
} from '@/lib/user-storage';
import { getEmployees } from '@/lib/employee-storage';
import { UserRole } from '@/types/database';
import { EmployeeBulkUpload } from '@/components/admin/EmployeeBulkUpload';

// ──────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Never';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
}

function RoleBadge({ role }: { role: UserRole }) {
  const def = ROLE_DEFINITIONS[role];
  return (
    <Badge variant="outline" className={def.color}>
      {def.label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: AppUser['status'] }) {
  const styles = {
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

// ──────────────────────────────────────────────
// Form type
// ──────────────────────────────────────────────

// A row in the User Management table: a stored staff AppUser, or a live
// Supabase family mapped onto the same shape with extra display fields.
type DirectoryRow = AppUser & { familyDetail?: string; isFamily?: boolean };

interface UserFormData {
  // Portal access fields
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: UserRole;
  // HR / employee fields
  pin: string;
  job_title: string;
  hourly_rate: string;
  hire_date: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

const emptyFormData: UserFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'teacher',
  pin: '',
  job_title: '',
  hourly_rate: '',
  hire_date: todayIso(),
  emergency_contact_name: '',
  emergency_contact_phone: '',
};

// ──────────────────────────────────────────────
// User form (module-scope: defining this inside UsersPage remounted it on
// every keystroke, so inputs lost focus and you could not type)
// ──────────────────────────────────────────────

function UserFormFields({
  formData,
  setFormData,
  formError,
  isEdit = false,
  onGeneratePin,
}: {
  formData: UserFormData;
  setFormData: (d: UserFormData) => void;
  formError: string | null;
  isEdit?: boolean;
  onGeneratePin: () => void;
}) {
  return (
    <div className="space-y-4 py-4">
      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {formError}
        </div>
      )}

      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            placeholder="Jane"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            placeholder="Smith"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="jsmith@christinaschildcare.com"
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="(763) 555-0100"
        />
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select
          value={formData.role}
          onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLE_DEFINITIONS).map(([role, def]) => (
              <SelectItem key={role} value={role}>
                <div className="flex flex-col">
                  <span>{def.label}</span>
                  <span className="text-xs text-muted-foreground">{def.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Separator: HR fields (shown for both add and edit) */}
      <div className="pt-2 border-t">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Employee Details
        </p>

        {/* PIN */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="pin">Clock-In PIN {!isEdit && '(4-6 digits)'}</Label>
          <div className="flex gap-2">
            <Input
              id="pin"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={formData.pin}
              onChange={(e) =>
                setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })
              }
              placeholder={isEdit ? 'Leave blank to keep current PIN' : 'Auto-generated if blank'}
              className="font-mono tracking-widest"
            />
            {!isEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={onGeneratePin}
                className="shrink-0"
                title="Generate a random PIN not already in use"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Employees use this PIN to clock in at{' '}
            <span className="font-medium">/employee-login</span>.
          </p>
        </div>

        {/* Job Title */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="job_title">Job Title</Label>
          <Input
            id="job_title"
            value={formData.job_title}
            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
            placeholder="Lead Teacher"
          />
        </div>

        {/* Hourly Rate + Hire Date */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
            <Input
              id="hourly_rate"
              type="number"
              min="0"
              step="0.01"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
              placeholder="18.50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hire_date">Hire Date</Label>
            <Input
              id="hire_date"
              type="date"
              value={formData.hire_date}
              onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ec_name">Emergency Contact Name</Label>
            <Input
              id="ec_name"
              value={formData.emergency_contact_name}
              onChange={(e) =>
                setFormData({ ...formData, emergency_contact_name: e.target.value })
              }
              placeholder="John Smith"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ec_phone">Emergency Contact Phone</Label>
            <Input
              id="ec_phone"
              type="tel"
              value={formData.emergency_contact_phone}
              onChange={(e) =>
                setFormData({ ...formData, emergency_contact_phone: e.target.value })
              }
              placeholder="(763) 555-0199"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  // Live families from Supabase (the list otherwise only shows browser-stored
  // staff, so families added via Add Family never appeared).
  const [familyRows, setFamilyRows] = useState<DirectoryRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AppUser['status'] | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const [usedPins, setUsedPins] = useState<Set<string>>(new Set());
  const [inviteBusy, setInviteBusy] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<
    { email: string; link: string; emailed: boolean } | null
  >(null);
  const [copied, setCopied] = useState(false);

  // ── Add Family state ───────────────────────
  const [isAddFamilyOpen, setIsAddFamilyOpen] = useState(false);
  const [familyBusy, setFamilyBusy] = useState(false);
  const [familyError, setFamilyError] = useState<string | null>(null);
  const [familyResult, setFamilyResult] = useState<
    { pin: string; childCount: number; email: string } | null
  >(null);
  const [familyForm, setFamilyForm] = useState<{
    email: string;
    parentName: string;
    parentPhone: string;
    pin: string;
    children: { name: string; date_of_birth: string; classroom: string }[];
  }>({
    email: '',
    parentName: '',
    parentPhone: '',
    pin: '',
    children: [{ name: '', date_of_birth: '', classroom: '' }],
  });

  const loadFamilies = async () => {
    try {
      const r = await fetch('/api/admin/family');
      if (!r.ok) return;
      const data = await r.json();
      const rows = (data.families || []).map(
        (f: {
          id: string;
          email: string;
          status: string;
          pin: string | null;
          created_at: string;
          parentName: string;
          phone: string;
          children: string[];
        }) => {
          const parts = (f.parentName || f.email).trim().split(' ');
          return {
            id: `family-${f.id}`,
            email: f.email,
            first_name: parts[0] || 'Family',
            last_name: parts.slice(1).join(' '),
            role: 'parent' as UserRole,
            status: (f.status as AppUser['status']) || 'active',
            phone: f.phone || '',
            created_at: f.created_at,
            isFamily: true,
            familyDetail:
              `Kiosk PIN ${f.pin ?? '----'}` +
              (f.children.length ? ` · ${f.children.join(', ')}` : ''),
          };
        }
      );
      setFamilyRows(rows);
    } catch {
      /* non-fatal: list still shows staff */
    }
  };

  useEffect(() => {
    purgeDemoUsers();
    setUsers(getUsers());
    loadFamilies();
    // Load existing PINs for collision detection
    getEmployees().then((emps) => {
      setUsedPins(new Set(emps.map((e) => e.pin)));
    }).catch(() => {});
  }, []);

  const refreshUsers = () => {
    setUsers(getUsers());
  };

  // ── Account setup / password link ──────────
  // Creates (or recovers) the Supabase Auth account and returns a "set your
  // password" link. The role is derived at sign-in from the employee record.
  const handleInvite = async (user: AppUser) => {
    setInviteBusy(user.id);
    setCopied(false);
    try {
      const r = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await r.json();
      if (!r.ok) {
        setInviteResult({
          email: user.email,
          link: '',
          emailed: false,
        });
        setFormError(data.error || 'Could not create the setup link.');
      } else {
        setInviteResult({
          email: user.email,
          link: data.link || '',
          emailed: !!data.emailed,
        });
      }
    } catch {
      setInviteResult({ email: user.email, link: '', emailed: false });
    } finally {
      setInviteBusy(null);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteResult?.link) return;
    try {
      await navigator.clipboard.writeText(inviteResult.link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  // ── Add Family (creates live family + children + kiosk PIN) ──
  const resetFamilyForm = () =>
    setFamilyForm({
      email: '',
      parentName: '',
      parentPhone: '',
      pin: '',
      children: [{ name: '', date_of_birth: '', classroom: '' }],
    });

  const submitFamily = async () => {
    setFamilyError(null);
    if (!familyForm.email || !familyForm.parentName) {
      setFamilyError('Family email and parent/guardian name are required.');
      return;
    }
    if (!familyForm.children.some((c) => c.name.trim())) {
      setFamilyError('Add at least one child.');
      return;
    }
    if (familyForm.pin && !/^\d{4}$/.test(familyForm.pin)) {
      setFamilyError('PIN must be exactly 4 digits, or leave it blank to auto-generate.');
      return;
    }
    setFamilyBusy(true);
    try {
      const r = await fetch('/api/admin/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: familyForm.email,
          parentName: familyForm.parentName,
          parentPhone: familyForm.parentPhone,
          pin: familyForm.pin || undefined,
          children: familyForm.children.filter((c) => c.name.trim()),
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setFamilyError(data.error || 'Could not create the family.');
        setFamilyBusy(false);
        return;
      }
      setIsAddFamilyOpen(false);
      setFamilyResult({
        pin: data.pin,
        childCount: data.childCount,
        email: familyForm.email,
      });
      resetFamilyForm();
      loadFamilies();
    } catch {
      setFamilyError('Connection error. Please try again.');
    } finally {
      setFamilyBusy(false);
    }
  };

  // ── PIN generator ──────────────────────────

  function generatePin(): string {
    let attempts = 0;
    while (attempts < 100) {
      const pin = String(Math.floor(1000 + Math.random() * 9000));
      if (!usedPins.has(pin)) return pin;
      attempts++;
    }
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function handleGeneratePin() {
    const pin = generatePin();
    setFormData((prev) => ({ ...prev, pin }));
  }

  // ── Filter ─────────────────────────────────

  const allRows: DirectoryRow[] = [...users, ...familyRows];
  const filteredUsers = allRows.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // ── Add user ───────────────────────────────

  const handleAddUser = async () => {
    setFormError(null);
    if (!formData.email || !formData.first_name || !formData.last_name) {
      setFormError('Please fill in all required fields');
      return;
    }
    if (formData.pin && !/^\d{4,6}$/.test(formData.pin)) {
      setFormError('PIN must be 4 to 6 digits');
      return;
    }

    const existingUser = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
    if (existingUser) {
      setFormError('A user with this email already exists');
      return;
    }

    const pin = formData.pin || generatePin();

    // Persist the staff member to the database server-side so their PIN
    // actually works at login. The old client path saved to this browser
    // only, which is why PIN sign-in failed.
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          role: formData.role,
          pin,
          job_title: formData.job_title,
          hourly_rate: parseFloat(formData.hourly_rate) || undefined,
          hire_date: formData.hire_date || todayIso(),
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Could not create the staff member.');
        return;
      }
    } catch {
      setFormError('Connection error. Please try again.');
      return;
    }

    // Local list record so the new staff is visible in this list too.
    createUser({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: 'active',
    });
    setUsedPins((prev) => {
      const next = new Set(Array.from(prev));
      next.add(pin);
      return next;
    });

    refreshUsers();
    setIsAddDialogOpen(false);
    setFormData({ ...emptyFormData, hire_date: todayIso() });
  };

  // ── Edit user ──────────────────────────────

  const handleEditUser = async () => {
    setFormError(null);
    if (!editingUser) return;

    if (!formData.email || !formData.first_name || !formData.last_name) {
      setFormError('Please fill in all required fields');
      return;
    }
    if (formData.pin && !/^\d{4,6}$/.test(formData.pin)) {
      setFormError('PIN must be 4 to 6 digits');
      return;
    }

    const existingUser = users.find(
      u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== editingUser.id
    );
    if (existingUser) {
      setFormError('A user with this email already exists');
      return;
    }

    updateUser(editingUser.id, {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
    });
    refreshUsers();
    setIsEditDialogOpen(false);
    setEditingUser(null);
    setFormData({ ...emptyFormData, hire_date: todayIso() });
  };

  const handleToggleStatus = (user: AppUser) => {
    if (user.status === 'active') {
      deactivateUser(user.id);
    } else {
      activateUser(user.id);
    }
    refreshUsers();
  };

  const openEditDialog = (user: AppUser) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      pin: '',
      job_title: '',
      hourly_rate: '',
      hire_date: todayIso(),
      emergency_contact_name: '',
      emergency_contact_phone: '',
    });
    setFormError(null);
    setIsEditDialogOpen(true);
  };

  // ── Form content ───────────────────────────

  // UserFormContent was here. It is now the module-scope <UserFormFields />
  // so it does not remount on every keystroke (that bug blocked typing).

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-christina-red/10 rounded-lg">
            <Users className="h-6 w-6 text-christina-red" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage staff and parent accounts</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-1 gap-2 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.entries(ROLE_DEFINITIONS).map(([role, def]) => (
                    <SelectItem key={role} value={role}>{def.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AppUser['status'] | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 shrink-0">
              <EmployeeBulkUpload onImportComplete={refreshUsers} />

              {/* Add Family — creates a live family + children + kiosk PIN */}
              <Dialog
                open={isAddFamilyOpen}
                onOpenChange={(o) => {
                  setIsAddFamilyOpen(o);
                  if (!o) setFamilyError(null);
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-christina-blue text-christina-blue hover:bg-christina-blue/10">
                    <Plus className="h-4 w-4 mr-2" /> Add Family
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Family</DialogTitle>
                    <DialogDescription>
                      Creates the family in the live database with a 4-digit kiosk
                      PIN. The family can sign in and out at the kiosk right away.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    {familyError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {familyError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Family email *</Label>
                      <Input
                        type="email"
                        value={familyForm.email}
                        onChange={(e) =>
                          setFamilyForm({ ...familyForm, email: e.target.value })
                        }
                        placeholder="family@email.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Parent / guardian *</Label>
                        <Input
                          value={familyForm.parentName}
                          onChange={(e) =>
                            setFamilyForm({ ...familyForm, parentName: e.target.value })
                          }
                          placeholder="Jane Smith"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          type="tel"
                          value={familyForm.parentPhone}
                          onChange={(e) =>
                            setFamilyForm({ ...familyForm, parentPhone: e.target.value })
                          }
                          placeholder="(763) 555-0100"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Kiosk PIN (leave blank to auto-generate)</Label>
                      <Input
                        inputMode="numeric"
                        maxLength={4}
                        value={familyForm.pin}
                        onChange={(e) =>
                          setFamilyForm({
                            ...familyForm,
                            pin: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        placeholder="Auto"
                        className="font-mono tracking-widest w-32"
                      />
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Children
                      </p>
                      <div className="space-y-3">
                        {familyForm.children.map((child, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-12 gap-2 items-end"
                          >
                            <div className="col-span-5 space-y-1">
                              <Label className="text-xs">Name *</Label>
                              <Input
                                value={child.name}
                                onChange={(e) => {
                                  const next = [...familyForm.children];
                                  next[idx] = { ...child, name: e.target.value };
                                  setFamilyForm({ ...familyForm, children: next });
                                }}
                                placeholder="Child name"
                              />
                            </div>
                            <div className="col-span-3 space-y-1">
                              <Label className="text-xs">Birthdate</Label>
                              <Input
                                type="date"
                                value={child.date_of_birth}
                                onChange={(e) => {
                                  const next = [...familyForm.children];
                                  next[idx] = {
                                    ...child,
                                    date_of_birth: e.target.value,
                                  };
                                  setFamilyForm({ ...familyForm, children: next });
                                }}
                              />
                            </div>
                            <div className="col-span-3 space-y-1">
                              <Label className="text-xs">Classroom</Label>
                              <Input
                                value={child.classroom}
                                onChange={(e) => {
                                  const next = [...familyForm.children];
                                  next[idx] = { ...child, classroom: e.target.value };
                                  setFamilyForm({ ...familyForm, children: next });
                                }}
                                placeholder="toddler"
                              />
                            </div>
                            <div className="col-span-1">
                              {familyForm.children.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFamilyForm({
                                      ...familyForm,
                                      children: familyForm.children.filter(
                                        (_, i) => i !== idx
                                      ),
                                    })
                                  }
                                  className="text-xs text-red-600 hover:underline pb-2"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() =>
                          setFamilyForm({
                            ...familyForm,
                            children: [
                              ...familyForm.children,
                              { name: '', date_of_birth: '', classroom: '' },
                            ],
                          })
                        }
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add another child
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddFamilyOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={submitFamily}
                      disabled={familyBusy}
                      className="bg-christina-blue hover:bg-christina-blue/90"
                    >
                      {familyBusy ? 'Creating...' : 'Create Family'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-christina-red hover:bg-christina-red/90">
                    <Plus className="h-4 w-4 mr-2" /> Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Create a new account. The employee record (PIN, rate, hire date) is created
                      at the same time so they can clock in immediately.
                    </DialogDescription>
                  </DialogHeader>
                  <UserFormFields
                    formData={formData}
                    setFormData={setFormData}
                    formError={formError}
                    onGeneratePin={handleGeneratePin}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddUser} className="bg-christina-red hover:bg-christina-red/90">
                      Create User
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
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Last Login</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                            {user.isFamily && (
                              <span className="ml-2 text-xs font-normal text-christina-blue">
                                Family
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.familyDetail && (
                            <p className="text-xs text-muted-foreground">
                              {user.familyDetail}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.status} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatDate(user.last_login)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!user.isFamily && (
                              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                <Pencil className="h-4 w-4 mr-2" /> Edit User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              disabled={inviteBusy === user.id}
                              onSelect={(e) => {
                                e.preventDefault();
                                handleInvite(user);
                              }}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              {inviteBusy === user.id
                                ? 'Preparing link...'
                                : 'Email account setup link'}
                            </DropdownMenuItem>
                            {!user.isFamily && (
                              <DropdownMenuItem
                                disabled={inviteBusy === user.id}
                                onSelect={(e) => {
                                  e.preventDefault();
                                  handleInvite(user);
                                }}
                              >
                                <KeyRound className="h-4 w-4 mr-2" /> Send password reset link
                              </DropdownMenuItem>
                            )}
                            {!user.isFamily && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                  {user.status === 'active' ? (
                                    <>
                                      <UserX className="h-4 w-4 mr-2" /> Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-4 w-4 mr-2" /> Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Showing {filteredUsers.length} of {allRows.length} (staff and families)
          </p>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role assignment.
            </DialogDescription>
          </DialogHeader>
          <UserFormFields
            formData={formData}
            setFormData={setFormData}
            formError={formError}
            isEdit
            onGeneratePin={handleGeneratePin}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} className="bg-christina-red hover:bg-christina-red/90">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account setup link result */}
      <Dialog open={!!inviteResult} onOpenChange={(o) => !o && setInviteResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account setup link</DialogTitle>
            <DialogDescription>
              {inviteResult?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {inviteResult?.emailed ? (
              <p className="text-sm text-green-700">
                A setup email was sent to {inviteResult.email}. They can also use the
                link below.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Copy this link and send it to {inviteResult?.email}. It takes them to a
                page where they set their own password.
              </p>
            )}
            {inviteResult?.link ? (
              <div className="flex gap-2">
                <Input readOnly value={inviteResult.link} className="font-mono text-xs" />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={copyInviteLink}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-red-600">
                No link was generated. Confirm the Supabase Auth redirect URLs include
                this site, then try again.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteResult(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Family result — shows the kiosk PIN */}
      <Dialog
        open={!!familyResult}
        onOpenChange={(o) => !o && setFamilyResult(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Family added</DialogTitle>
            <DialogDescription>{familyResult?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-center">
            <p className="text-sm text-muted-foreground">
              {familyResult?.childCount}{' '}
              {familyResult?.childCount === 1 ? 'child' : 'children'} added. They
              can sign in and out at the kiosk now with this PIN:
            </p>
            <div className="text-4xl font-mono font-bold tracking-[0.3em] text-christina-red py-3">
              {familyResult?.pin}
            </div>
            <p className="text-xs text-muted-foreground">
              Write this down for the family. You can see it again later in the
              family record.
            </p>
          </div>
          <DialogFooter>
            <Button
              className="bg-christina-red hover:bg-christina-red/90"
              onClick={() => setFamilyResult(null)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

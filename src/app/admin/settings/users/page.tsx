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
  seedUserData,
} from '@/lib/user-storage';
import { createEmployee, getEmployees } from '@/lib/employee-storage';
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
// Page
// ──────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
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

  useEffect(() => {
    seedUserData();
    setUsers(getUsers());
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

  const filteredUsers = users.filter(user => {
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

    // Create the portal login record
    createUser({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: 'active',
    });

    // Create the HR employee record so the person can clock in with their PIN
    const pin = formData.pin || generatePin();
    try {
      await createEmployee({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        pin,
        job_title: formData.job_title || '',
        hourly_rate: parseFloat(formData.hourly_rate) || 0,
        hire_date: formData.hire_date || todayIso(),
        employment_status: 'active',
        certifications: [],
        emergency_contact_name: formData.emergency_contact_name || undefined,
        emergency_contact_phone: formData.emergency_contact_phone || undefined,
      });
      setUsedPins((prev) => { const next = new Set(Array.from(prev)); next.add(pin); return next; });
    } catch (err) {
      console.error('Failed to create employee record:', err);
      // The portal user was already created; do not block the UX
    }

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

  const UserFormContent = ({ isEdit = false }: { isEdit?: boolean }) => (
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
                onClick={handleGeneratePin}
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
                  <UserFormContent />
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
                          <p className="font-medium">{user.first_name} {user.last_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
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
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Pencil className="h-4 w-4 mr-2" /> Edit User
                            </DropdownMenuItem>
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
                            <DropdownMenuItem
                              disabled={inviteBusy === user.id}
                              onSelect={(e) => {
                                e.preventDefault();
                                handleInvite(user);
                              }}
                            >
                              <KeyRound className="h-4 w-4 mr-2" /> Send password reset link
                            </DropdownMenuItem>
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
            Showing {filteredUsers.length} of {users.length} users
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
          <UserFormContent isEdit />
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
    </div>
  );
}

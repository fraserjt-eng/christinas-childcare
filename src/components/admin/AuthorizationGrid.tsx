'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  HelpCircle,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import {
  ChildAuthorization,
  AuthStatus,
  AUTH_TYPE_LABELS,
  AUTH_STATUS_LABELS,
  getAuthorizations,
  updateAuthorization,
  getDaysRemaining,
} from '@/lib/authorization-storage';

// ─── Status badge config ─────────────────────────────────────────────

function StatusBadge({ status }: { status: AuthStatus }) {
  const styles: Record<AuthStatus, string> = {
    active: 'bg-green-100 text-green-800 border-green-200',
    expiring_soon: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    expired: 'bg-red-100 text-red-800 border-red-200',
    pending: 'bg-blue-100 text-blue-800 border-blue-200',
    renewal_pending: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  const icons: Record<AuthStatus, React.ReactNode> = {
    active: <CheckCircle2 className="h-3 w-3" />,
    expiring_soon: <Clock className="h-3 w-3" />,
    expired: <AlertTriangle className="h-3 w-3" />,
    pending: <HelpCircle className="h-3 w-3" />,
    renewal_pending: <RefreshCw className="h-3 w-3" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {icons[status]}
      {AUTH_STATUS_LABELS[status]}
    </span>
  );
}

// ─── Summary Cards ───────────────────────────────────────────────────

function SummaryCards({ auths }: { auths: ChildAuthorization[] }) {
  const stats = useMemo(() => {
    return {
      active: auths.filter((a) => a.status === 'active').length,
      expiringSoon: auths.filter((a) => a.status === 'expiring_soon').length,
      expired: auths.filter((a) => a.status === 'expired').length,
      pending: auths.filter((a) => a.status === 'pending' || a.status === 'renewal_pending').length,
    };
  }, [auths]);

  const cards = [
    {
      label: 'Active',
      value: stats.active,
      icon: <CheckCircle2 className="h-5 w-5" />,
      bg: 'bg-green-50',
      iconColor: 'bg-green-100 text-green-600',
      textColor: 'text-green-700',
    },
    {
      label: 'Expiring Soon',
      value: stats.expiringSoon,
      icon: <Clock className="h-5 w-5" />,
      bg: 'bg-yellow-50',
      iconColor: 'bg-yellow-100 text-yellow-700',
      textColor: 'text-yellow-700',
    },
    {
      label: 'Expired',
      value: stats.expired,
      icon: <AlertTriangle className="h-5 w-5" />,
      bg: 'bg-red-50',
      iconColor: 'bg-red-100 text-red-600',
      textColor: 'text-red-700',
    },
    {
      label: 'Pending / Renewal',
      value: stats.pending,
      icon: <RefreshCw className="h-5 w-5" />,
      bg: 'bg-purple-50',
      iconColor: 'bg-purple-100 text-purple-700',
      textColor: 'text-purple-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className={`${card.bg} rounded-xl border p-4 flex items-center gap-3`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${card.iconColor}`}>
            {card.icon}
          </div>
          <div>
            <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
            <p className="text-xs text-gray-600">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Edit Dialog ─────────────────────────────────────────────────────

interface EditDialogProps {
  auth: ChildAuthorization | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<ChildAuthorization>) => void;
}

function EditDialog({ auth, onClose, onSave }: EditDialogProps) {
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [renewalSubmitted, setRenewalSubmitted] = useState(false);

  useEffect(() => {
    if (auth) {
      setEndDate(auth.end_date);
      setNotes(auth.notes || '');
      setRenewalSubmitted(!!auth.renewal_submitted_at);
    }
  }, [auth]);

  if (!auth) return null;

  const handleSave = () => {
    const updates: Partial<ChildAuthorization> = {
      end_date: endDate,
      notes,
    };
    if (renewalSubmitted && !auth.renewal_submitted_at) {
      updates.renewal_submitted_at = new Date().toISOString();
    } else if (!renewalSubmitted) {
      updates.renewal_submitted_at = undefined;
    }
    onSave(auth.id, updates);
    onClose();
  };

  return (
    <Dialog open={!!auth} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Authorization</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <p className="text-sm font-medium text-gray-700">{auth.child_name}</p>
            <p className="text-xs text-gray-500">{auth.parent_name} &bull; {AUTH_TYPE_LABELS[auth.auth_type]}</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Notes</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="renewal-submitted"
              checked={renewalSubmitted}
              onChange={(e) => setRenewalSubmitted(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="renewal-submitted" className="text-sm">
              Mark renewal as submitted
            </label>
          </div>

          {auth.renewal_submitted_at && (
            <p className="text-xs text-purple-600">
              Renewal submitted: {new Date(auth.renewal_submitted_at).toLocaleDateString()}
            </p>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#C62828] hover:bg-[#b71c1c] text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

type SortField = 'child_name' | 'end_date' | 'auth_type' | 'status';
type SortDir = 'asc' | 'desc';

export function AuthorizationGrid() {
  const [auths, setAuths] = useState<ChildAuthorization[]>([]);
  const [statusFilter, setStatusFilter] = useState<AuthStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('end_date');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [editAuth, setEditAuth] = useState<ChildAuthorization | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setAuths(getAuthorizations());
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleSave = (id: string, updates: Partial<ChildAuthorization>) => {
    updateAuthorization(id, updates);
    setAuths(getAuthorizations());
  };

  const filtered = useMemo(() => {
    let list = auths;

    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.child_name.toLowerCase().includes(q) ||
          a.parent_name.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortField === 'child_name') {
        valA = a.child_name;
        valB = b.child_name;
      } else if (sortField === 'end_date') {
        valA = a.end_date;
        valB = b.end_date;
      } else if (sortField === 'auth_type') {
        valA = a.auth_type;
        valB = b.auth_type;
      } else if (sortField === 'status') {
        valA = a.status;
        valB = b.status;
      }

      const cmp = valA.localeCompare(valB);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [auths, statusFilter, search, sortField, sortDir]);

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 opacity-30" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  }

  const statusOptions: { value: AuthStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'expiring_soon', label: 'Expiring Soon' },
    { value: 'expired', label: 'Expired' },
    { value: 'pending', label: 'Pending' },
    { value: 'renewal_pending', label: 'Renewal Pending' },
  ];

  const daysRemainingDisplay = (auth: ChildAuthorization) => {
    const days = getDaysRemaining(auth.end_date);
    if (days < 0) return <span className="text-red-600 font-medium">{Math.abs(days)}d overdue</span>;
    if (days === 0) return <span className="text-red-600 font-medium">Expires today</span>;
    if (days <= 7) return <span className="text-red-600 font-medium">{days}d</span>;
    if (days <= 30) return <span className="text-yellow-700 font-medium">{days}d</span>;
    return <span className="text-gray-600">{days}d</span>;
  };

  return (
    <>
      <div className="space-y-4">
        <SummaryCards auths={auths} />

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Authorization Records
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Search child or parent..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-48"
                />
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as AuthStatus | 'all')}
                >
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th
                      className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                      onClick={() => handleSort('child_name')}
                    >
                      <span className="flex items-center gap-1">
                        Child <SortIcon field="child_name" />
                      </span>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Parent</th>
                    <th
                      className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                      onClick={() => handleSort('auth_type')}
                    >
                      <span className="flex items-center gap-1">
                        Type <SortIcon field="auth_type" />
                      </span>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Start</th>
                    <th
                      className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                      onClick={() => handleSort('end_date')}
                    >
                      <span className="flex items-center gap-1">
                        Expires <SortIcon field="end_date" />
                      </span>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Remaining</th>
                    <th
                      className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                      onClick={() => handleSort('status')}
                    >
                      <span className="flex items-center gap-1">
                        Status <SortIcon field="status" />
                      </span>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                        No authorizations match your filter.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((auth) => (
                      <tr
                        key={auth.id}
                        className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setEditAuth(auth)}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">{auth.child_name}</td>
                        <td className="px-4 py-3 text-gray-600">{auth.parent_name}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">
                            {AUTH_TYPE_LABELS[auth.auth_type]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(auth.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(auth.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">{daysRemainingDisplay(auth)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={auth.status} />
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditAuth(auth);
                            }}
                            className="text-[#2196F3] hover:text-blue-700 h-7 px-2"
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 text-xs text-gray-400 border-t">
              {filtered.length} of {auths.length} records
            </div>
          </CardContent>
        </Card>
      </div>

      <EditDialog auth={editAuth} onClose={() => setEditAuth(null)} onSave={handleSave} />
    </>
  );
}

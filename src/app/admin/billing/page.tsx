'use client';

// Billing pilot, phase 1: per-family contracts (rate + CCAP split + pilot flag).
// This is the structured "local tracking" that replaces the spreadsheet. It
// bills no one; it stores each family's agreed contract so later phases (ledger,
// statements, CCAP hub assist) compute from real data instead of hand-keyed
// amounts. Billing only turns on for a family flagged "in the pilot".

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import Link from 'next/link';
import { Wallet, Search, Loader2, Pencil, ScrollText, Download } from 'lucide-react';
import { buildCcapBillingCsv, buildBillingSummaryCsv } from '@/lib/billing-export';

interface Contract {
  rate_amount: number | null;
  rate_unit: string | null;
  schedule_note: string | null;
  ccap_status: string | null;
  ccap_case_number: string | null;
  ccap_subsidy_amount: number | null;
  copay_amount: number | null;
  copay_frequency: string | null;
  is_pilot: boolean | null;
  effective_date: string | null;
  notes: string | null;
}
interface FamilyRow {
  id: string;
  name: string;
  email: string;
  contract: Contract | null;
}

interface FormState {
  rate_amount: string;
  rate_unit: string;
  schedule_note: string;
  ccap_status: string;
  ccap_case_number: string;
  ccap_subsidy_amount: string;
  copay_amount: string;
  copay_frequency: string;
  is_pilot: boolean;
  effective_date: string;
  notes: string;
}

function emptyForm(): FormState {
  return {
    rate_amount: '',
    rate_unit: 'weekly',
    schedule_note: '',
    ccap_status: 'none',
    ccap_case_number: '',
    ccap_subsidy_amount: '',
    copay_amount: '',
    copay_frequency: 'weekly',
    is_pilot: false,
    effective_date: '',
    notes: '',
  };
}

function formFromContract(c: Contract | null): FormState {
  if (!c) return emptyForm();
  return {
    rate_amount: c.rate_amount != null ? String(c.rate_amount) : '',
    rate_unit: c.rate_unit || 'weekly',
    schedule_note: c.schedule_note || '',
    ccap_status: c.ccap_status || 'none',
    ccap_case_number: c.ccap_case_number || '',
    ccap_subsidy_amount: c.ccap_subsidy_amount != null ? String(c.ccap_subsidy_amount) : '',
    copay_amount: c.copay_amount != null ? String(c.copay_amount) : '',
    copay_frequency: c.copay_frequency || 'weekly',
    is_pilot: !!c.is_pilot,
    effective_date: c.effective_date || '',
    notes: c.notes || '',
  };
}

function money(n: number | null | undefined): string {
  if (n == null) return '—';
  return `$${n.toFixed(2)}`;
}

function CcapBadge({ status }: { status: string | null | undefined }) {
  if (!status || status === 'none') return <span className="text-muted-foreground text-sm">—</span>;
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
  };
  return (
    <Badge variant="outline" className={styles[status] || ''}>
      CCAP {status}
    </Badge>
  );
}

export default function BillingPage() {
  const [families, setFamilies] = useState<FamilyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<FamilyRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Exports (Phases 3+5): a period + download buttons for the CCAP draft and the
  // billing summary. Default the period to the current month.
  const monthStart = new Date();
  monthStart.setDate(1);
  const [periodStart, setPeriodStart] = useState(monthStart.toISOString().slice(0, 10));
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().slice(0, 10));
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/billing-contracts', { cache: 'no-store' });
      if (r.ok) {
        const d = await r.json();
        setFamilies(d.families || []);
      } else {
        setFamilies([]);
      }
    } catch {
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (fam: FamilyRow) => {
    setEditing(fam);
    setForm(formFromContract(fam.contract));
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/billing-contracts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ family_id: editing.id, ...form }),
      });
      if (res.ok) {
        setEditing(null);
        load();
      }
    } finally {
      setSaving(false);
    }
  };

  const filtered = families.filter(
    (f) => !query || f.name.toLowerCase().includes(query.toLowerCase())
  );
  const pilotCount = families.filter((f) => f.contract?.is_pilot).length;

  const runExport = async (kind: 'ccap' | 'summary') => {
    setExporting(true);
    try {
      const r = await fetch(
        `/api/admin/billing-export?period_start=${periodStart}&period_end=${periodEnd}`,
        { cache: 'no-store' }
      );
      if (!r.ok) return;
      const d = await r.json();
      const rows = d.rows || [];
      const csv = kind === 'ccap' ? buildCcapBillingCsv(rows) : buildBillingSummaryCsv(rows);
      const name =
        kind === 'ccap'
          ? `ccap-billing-DRAFT_${periodStart}_to_${periodEnd}.csv`
          : `billing-summary_${periodStart}_to_${periodEnd}.csv`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-christina-red/10 rounded-lg">
          <Wallet className="h-6 w-6 text-christina-red" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-muted-foreground">
            Each family&apos;s contract: rate, CCAP split, and co-pay. {pilotCount} in the pilot.
          </p>
        </div>
      </div>

      {/* Pilot framing — keep it honest and visible. */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-semibold">This is the billing pilot.</p>
        <p className="mt-0.5">
          Brightwheel stays each family&apos;s official bill. A family only enters this
          pilot when you flip its <span className="font-semibold">In the pilot</span> switch.
          Setting a contract here records the agreement; it does not send a bill or move money.
        </p>
      </div>

      {/* Exports (pilot families only) */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <p className="text-sm font-semibold">Export billing (pilot families)</p>
              <p className="text-xs text-muted-foreground">
                Pick a period, then download. The CCAP file is a draft format until the owner walkthrough confirms the state-hub fields.
              </p>
            </div>
            <div className="flex items-end gap-2 ml-auto">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="h-9 w-36" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="h-9 w-36" />
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" disabled={exporting} onClick={() => runExport('ccap')}>
              <Download className="h-4 w-4" /> CCAP billing (draft)
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" disabled={exporting} onClick={() => runExport('summary')}>
              <Download className="h-4 w-4" /> Billing summary (QuickBooks / Brightwheel)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search families..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Family</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>CCAP</TableHead>
                    <TableHead>Co-pay</TableHead>
                    <TableHead>Pilot</TableHead>
                    <TableHead className="w-[80px]">Edit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No families found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((fam) => {
                      const c = fam.contract;
                      return (
                        <TableRow key={fam.id}>
                          <TableCell className="font-medium">
                            {fam.name}
                            {c?.notes ? (
                              <span className="block text-xs font-normal text-muted-foreground mt-0.5 line-clamp-2 max-w-xs">
                                {c.notes}
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-sm">
                            {c && c.rate_amount ? (
                              <>
                                {money(c.rate_amount)}
                                <span className="text-muted-foreground"> / {c.rate_unit}</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground">Not set</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <CcapBadge status={c?.ccap_status} />
                          </TableCell>
                          <TableCell className="text-sm">{money(c?.copay_amount)}</TableCell>
                          <TableCell>
                            {c?.is_pilot ? (
                              <Badge className="bg-christina-green text-white">In pilot</Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {c?.is_pilot ? (
                                <Button
                                  asChild
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Open ledger"
                                >
                                  <Link href={`/admin/billing/${fam.id}`}>
                                    <ScrollText className="h-4 w-4" />
                                  </Link>
                                </Button>
                              ) : null}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEdit(fam)}
                                title="Edit contract"
                              >
                                <Pencil className="h-4 w-4" />
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
          )}
        </CardContent>
      </Card>

      {/* Edit contract */}
      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.name} — contract</DialogTitle>
            <DialogDescription>
              The agreed rate and CCAP split. Records the agreement; sends no bill.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
            {/* Pilot toggle */}
            <label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_pilot}
                onChange={(e) => setForm({ ...form, is_pilot: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium">
                In the billing pilot
                <span className="block text-xs font-normal text-muted-foreground">
                  Off = this family stays on Brightwheel only.
                </span>
              </span>
            </label>

            {/* Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="rate">Rate</Label>
                <Input
                  id="rate"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.rate_amount}
                  onChange={(e) => setForm({ ...form, rate_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="rate-unit">Per</Label>
                <Select value={form.rate_unit} onValueChange={(v) => setForm({ ...form, rate_unit: v })}>
                  <SelectTrigger id="rate-unit"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Week</SelectItem>
                    <SelectItem value="biweekly">Two weeks</SelectItem>
                    <SelectItem value="monthly">Month</SelectItem>
                    <SelectItem value="daily">Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="sched">Schedule</Label>
              <Input
                id="sched"
                value={form.schedule_note}
                onChange={(e) => setForm({ ...form, schedule_note: e.target.value })}
                placeholder="Full-time, M-F"
              />
            </div>

            {/* CCAP */}
            <div className="space-y-1">
              <Label htmlFor="ccap">CCAP (assistance)</Label>
              <Select value={form.ccap_status} onValueChange={(v) => setForm({ ...form, ccap_status: v })}>
                <SelectTrigger id="ccap"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not on assistance</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.ccap_status !== 'none' && (
              <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="case">Case / authorization #</Label>
                  <Input
                    id="case"
                    value={form.ccap_case_number}
                    onChange={(e) => setForm({ ...form, ccap_case_number: e.target.value })}
                    placeholder="State case number"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="subsidy">State pays</Label>
                  <Input
                    id="subsidy"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={form.ccap_subsidy_amount}
                    onChange={(e) => setForm({ ...form, ccap_subsidy_amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            {/* Co-pay */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="copay">Family co-pay</Label>
                <Input
                  id="copay"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.copay_amount}
                  onChange={(e) => setForm({ ...form, copay_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="copay-freq">Per</Label>
                <Select value={form.copay_frequency} onValueChange={(v) => setForm({ ...form, copay_frequency: v })}>
                  <SelectTrigger id="copay-freq"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Week</SelectItem>
                    <SelectItem value="biweekly">Two weeks</SelectItem>
                    <SelectItem value="monthly">Month</SelectItem>
                    <SelectItem value="daily">Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="eff">Effective date</Label>
              <Input
                id="eff"
                type="date"
                value={form.effective_date}
                onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Anything about this family's contract"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-christina-red hover:bg-christina-red/90">
              {saving ? 'Saving…' : 'Save contract'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

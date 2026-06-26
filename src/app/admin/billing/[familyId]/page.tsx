'use client';

// Billing ledger for one family (pilot phase 2): the running tab. Charges +
// payments + balance, with one-click "generate this period's tuition" from the
// contract (the manual Saturday entry, killed). Pilot-gated server-side: a
// family not in the pilot returns 409 and this page shows the turn-on notice.

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { centerDate, shiftCenterDate } from '@/lib/center-time';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Wallet, ChevronLeft, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';

interface Charge {
  id: string; kind: string; description: string | null; amount: number;
  period_start: string | null; period_end: string | null; charge_date: string;
}
interface Payment {
  id: string; amount: number; method: string; reference: string | null;
  paid_on: string; note: string | null;
}
interface Ledger {
  familyName: string;
  charges: Charge[];
  payments: Payment[];
  chargeTotal: number;
  paymentTotal: number;
  balance: number;
  contract: { rate_amount?: number; rate_unit?: string; is_pilot?: boolean } | null;
}

function money(n: number | null | undefined): string {
  const v = Number(n || 0);
  return `${v < 0 ? '-' : ''}$${Math.abs(v).toFixed(2)}`;
}
function dateLabel(d: string | null): string {
  if (!d) return '';
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return d; }
}

export default function FamilyLedgerPage() {
  const params = useParams();
  const familyId = String(params.familyId || '');
  const [data, setData] = useState<Ledger | null>(null);
  const [loading, setLoading] = useState(true);
  const [notPilot, setNotPilot] = useState(false);
  const [busy, setBusy] = useState(false);

  // charge form
  const [chKind, setChKind] = useState('tuition');
  const [chAmount, setChAmount] = useState('');
  const [chDesc, setChDesc] = useState('');
  // payment form
  const [pmAmount, setPmAmount] = useState('');
  const [pmMethod, setPmMethod] = useState('check');
  const [pmRef, setPmRef] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setNotPilot(false);
    try {
      const r = await fetch(`/api/admin/billing-ledger?family_id=${encodeURIComponent(familyId)}`, { cache: 'no-store' });
      if (r.ok) {
        setData(await r.json());
      } else if (r.status === 409) {
        setNotPilot(true);
      } else {
        setData(null);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => { load(); }, [load]);

  const post = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const r = await fetch('/api/admin/billing-ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ family_id: familyId, ...payload }),
      });
      if (r.ok) await load();
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: string, type: 'charge' | 'payment') => {
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/billing-ledger?id=${id}&type=${type}`, { method: 'DELETE' });
      if (r.ok) await load();
    } finally {
      setBusy(false);
    }
  };

  const addCharge = async () => {
    if (!chAmount) return;
    await post({ type: 'charge', kind: chKind, amount: chAmount, description: chDesc });
    setChAmount(''); setChDesc('');
  };
  const addPayment = async () => {
    if (!pmAmount) return;
    await post({ type: 'payment', amount: pmAmount, method: pmMethod, reference: pmRef });
    setPmAmount(''); setPmRef('');
  };
  const generateTuition = async () => {
    // Default the period to the current week (Mon-style 7-day span ending today).
    const end = centerDate();
    const start = shiftCenterDate(end, -6);
    await post({ type: 'generate_tuition', period_start: start, period_end: end });
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground">
        <Link href="/admin/billing"><ChevronLeft className="h-4 w-4" /> All families</Link>
      </Button>

      {loading ? (
        <div className="flex items-center justify-center min-h-[240px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : notPilot ? (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <p className="font-semibold">This family is not in the billing pilot.</p>
            <p className="text-muted-foreground text-sm">
              Turn on <span className="font-medium">In the pilot</span> on their contract first. Until then they stay on Brightwheel.
            </p>
            <Button asChild variant="outline"><Link href="/admin/billing">Back to Billing</Link></Button>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-christina-red/10 rounded-lg">
              <Wallet className="h-6 w-6 text-christina-red" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {data.familyName}
                <Badge className="bg-christina-green text-white">In pilot</Badge>
              </h1>
              <p className="text-muted-foreground text-sm">
                Pilot ledger. Records charges and payments; sends no bill and moves no money.
              </p>
            </div>
          </div>

          {/* Balance */}
          <div className="grid grid-cols-3 gap-3">
            <Card><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Charged</p>
              <p className="text-xl font-bold">{money(data.chargeTotal)}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-xl font-bold">{money(data.paymentTotal)}</p>
            </CardContent></Card>
            <Card className={data.balance > 0 ? 'border-christina-coral' : ''}><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Balance due</p>
              <p className={`text-xl font-bold ${data.balance > 0 ? 'text-christina-coral' : 'text-christina-green'}`}>
                {money(data.balance)}
              </p>
            </CardContent></Card>
          </div>

          {/* Charges */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Charges</CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={generateTuition}
                disabled={busy || !data.contract?.rate_amount}
                title={data.contract?.rate_amount ? 'Add this week’s tuition from the contract' : 'Set a rate on the contract first'}
              >
                <Sparkles className="h-4 w-4" /> Generate this week&apos;s tuition
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select value={chKind} onValueChange={setChKind}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tuition">Tuition</SelectItem>
                      <SelectItem value="registration">Registration</SelectItem>
                      <SelectItem value="late_fee">Late fee</SelectItem>
                      <SelectItem value="supply_fee">Supply fee</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Amount</Label>
                  <Input type="number" inputMode="decimal" step="0.01" className="w-28"
                    value={chAmount} onChange={(e) => setChAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-1 flex-1 min-w-40">
                  <Label className="text-xs">Note</Label>
                  <Input value={chDesc} onChange={(e) => setChDesc(e.target.value)} placeholder="Optional" />
                </div>
                <Button onClick={addCharge} disabled={busy || !chAmount} className="gap-1.5 bg-christina-red hover:bg-christina-red/90">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              <div className="divide-y rounded-lg border">
                {data.charges.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No charges yet.</p>
                ) : data.charges.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 text-sm">
                    <Badge variant="outline" className="capitalize text-xs">{c.kind.replace('_', ' ')}</Badge>
                    <span className="text-muted-foreground text-xs w-24">{dateLabel(c.charge_date)}</span>
                    <span className="flex-1 truncate">{c.description || ''}</span>
                    <span className={`font-semibold ${c.amount < 0 ? 'text-christina-green' : ''}`}>{money(c.amount)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => del(c.id, 'charge')} disabled={busy}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Payments</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Amount</Label>
                  <Input type="number" inputMode="decimal" step="0.01" min="0" className="w-28"
                    value={pmAmount} onChange={(e) => setPmAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Method</Label>
                  <Select value={pmMethod} onValueChange={setPmMethod}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="ccap_subsidy">CCAP subsidy</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 flex-1 min-w-40">
                  <Label className="text-xs">Reference</Label>
                  <Input value={pmRef} onChange={(e) => setPmRef(e.target.value)} placeholder="Check # / note" />
                </div>
                <Button onClick={addPayment} disabled={busy || !pmAmount} className="gap-1.5 bg-christina-red hover:bg-christina-red/90">
                  <Plus className="h-4 w-4" /> Record
                </Button>
              </div>
              <div className="divide-y rounded-lg border">
                {data.payments.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No payments yet.</p>
                ) : data.payments.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 text-sm">
                    <Badge variant="outline" className="capitalize text-xs">{p.method.replace('_', ' ')}</Badge>
                    <span className="text-muted-foreground text-xs w-24">{dateLabel(p.paid_on)}</span>
                    <span className="flex-1 truncate">{p.reference || ''}</span>
                    <span className="font-semibold text-christina-green">{money(p.amount)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => del(p.id, 'payment')} disabled={busy}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Could not load this ledger.</CardContent></Card>
      )}
    </div>
  );
}

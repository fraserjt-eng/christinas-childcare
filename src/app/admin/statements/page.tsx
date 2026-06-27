'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateStatementPDF } from '@/lib/pdf/statement';

interface FamilyRow {
  id: string;
  email: string;
  parentName: string;
  copay_default_amount: number | null;
  // For pilot families: the live ledger balance (charges - payments). null = not
  // in the billing pilot, so the amount is still entered by hand.
  ledger_balance: number | null;
}
interface StatementRow {
  id: string;
  family_id: string;
  period_label: string;
  period_start: string | null;
  period_end: string | null;
  amount: number;
  note: string;
  status: string;
  created_at: string;
  sent_at: string | null;
}

function money(n: number): string {
  return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
}

// Build a "Month YYYY" label + first/last day for a given month offset from now.
function monthPeriod(offset: number): { label: string; start: string; end: string } {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  return {
    label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    start: iso(start),
    end: iso(end),
  };
}

export default function StatementsPage() {
  const [families, setFamilies] = useState<FamilyRow[]>([]);
  const [statements, setStatements] = useState<StatementRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [familyId, setFamilyId] = useState('');
  const [periodLabel, setPeriodLabel] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [amount, setAmount] = useState('');
  const [amountSource, setAmountSource] = useState<'ledger' | 'copay' | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/statements', { cache: 'no-store' });
      if (r.ok) {
        const d = await r.json();
        setFamilies(d.families || []);
        setStatements(d.statements || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const familyById = useMemo(() => {
    const m: Record<string, FamilyRow> = {};
    for (const f of families) m[f.id] = f;
    return m;
  }, [families]);

  // Prefill the amount when a family is selected. A PILOT family's live ledger
  // balance (charges - payments) wins — that is the real co-pay due, computed,
  // not hand-keyed. Otherwise fall back to the saved co-pay default.
  function onSelectFamily(id: string) {
    setFamilyId(id);
    const f = familyById[id];
    if (!f) return;
    if (f.ledger_balance != null) {
      setAmount(f.ledger_balance.toFixed(2));
      setAmountSource('ledger');
    } else if (f.copay_default_amount != null && !amount) {
      setAmount(String(f.copay_default_amount));
      setAmountSource('copay');
    } else {
      setAmountSource(null);
    }
  }

  function applyPeriod(offset: number) {
    const p = monthPeriod(offset);
    setPeriodLabel(p.label);
    setPeriodStart(p.start);
    setPeriodEnd(p.end);
  }

  async function createStatement(thenDownload: boolean) {
    setError('');
    const amt = parseFloat(amount);
    if (!familyId) return setError('Choose a family.');
    if (!periodLabel.trim()) return setError('Enter a statement period.');
    if (!Number.isFinite(amt) || amt < 0) return setError('Enter a valid amount.');

    setSaving(true);
    try {
      const r = await fetch('/api/admin/statements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          family_id: familyId,
          period_label: periodLabel.trim(),
          period_start: periodStart || undefined,
          period_end: periodEnd || undefined,
          amount: amt,
          note: note.trim() || undefined,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(d.error || 'Could not save the statement.');
        return;
      }
      if (thenDownload) {
        const f = familyById[familyId];
        generateStatementPDF({
          parentName: f?.parentName || 'Family',
          familyEmail: f?.email || '',
          periodLabel: periodLabel.trim(),
          amount: amt,
          note: note.trim() || undefined,
        });
      }
      // Reset for the next one.
      setPeriodLabel('');
      setPeriodStart('');
      setPeriodEnd('');
      setAmount('');
      setAmountSource(null);
      setNote('');
      await load();
    } finally {
      setSaving(false);
    }
  }

  function downloadExisting(s: StatementRow) {
    const f = familyById[s.family_id];
    generateStatementPDF({
      parentName: f?.parentName || 'Family',
      familyEmail: f?.email || '',
      periodLabel: s.period_label,
      amount: s.amount,
      note: s.note || undefined,
      issuedDate: s.created_at || undefined,
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Parent Statements</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Create a co-payment statement for a family and download it as a PDF to send. This does not
        collect payment; it only produces the statement. Emailing statements directly will be added
        once email sending is connected.
      </p>

      {/* New statement */}
      <div className="rounded-lg border bg-card p-4 mb-6">
        <h2 className="font-semibold mb-3">New statement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label htmlFor="family">Family</Label>
            <select
              id="family"
              value={familyId}
              onChange={(e) => onSelectFamily(e.target.value)}
              className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select a family…</option>
              {families.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.parentName || f.email}
                  {f.copay_default_amount != null ? ` (co-pay ${money(f.copay_default_amount)})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="period">Statement period</Label>
            <Input
              id="period"
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
              placeholder="e.g. June 2026"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => applyPeriod(0)}>
                This month
              </Button>
              <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => applyPeriod(-1)}>
                Last month
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="start">Period start (optional)</Label>
            <Input id="start" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="end">Period end (optional)</Label>
            <Input id="end" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="amount">Amount due</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setAmountSource(null); }}
              placeholder="0.00"
            />
            {amountSource === 'ledger' && (
              <p className="mt-1 text-xs text-christina-green">
                Balance due from the billing ledger. Edit if needed.
              </p>
            )}
            {amountSource === 'copay' && (
              <p className="mt-1 text-xs text-muted-foreground">
                Prefilled from the saved co-pay default.
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Co-payment for June. Thank you!"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-christina-coral">{error}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => createStatement(true)}
            disabled={saving}
            className="bg-christina-red hover:bg-christina-red/90"
          >
            {saving ? 'Saving…' : 'Create + download PDF'}
          </Button>
          <Button type="button" variant="outline" onClick={() => createStatement(false)} disabled={saving}>
            Create only
          </Button>
          <Button type="button" variant="outline" disabled title="Email sending is not connected yet">
            Send by email (coming soon)
          </Button>
        </div>
      </div>

      {/* History */}
      <h2 className="font-semibold mb-2">Statements issued</h2>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : statements.length === 0 ? (
        <p className="text-sm text-muted-foreground">No statements yet.</p>
      ) : (
        <div className="space-y-2">
          {statements.map((s) => {
            const f = familyById[s.family_id];
            return (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-md border bg-card p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{f?.parentName || f?.email || 'Family'}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.period_label} · {money(s.amount)}
                    {s.sent_at ? ' · sent' : ''}
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => downloadExisting(s)}>
                  Download PDF
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

// CCAP attendance export + provider accuracy attestation.
//
// The admin picks a date range and a center, reads and checks the DCYF accuracy
// attestation (required before export is enabled), and downloads a CSV of the
// period's attendance with the CCAP-required fields. The export and the
// attestation record both run through the admin-gated, service-role route
// /api/admin/ccap-export, so the RLS-locked attendance + roster never reach the
// browser anon key. No DashboardLayout wrapper here: admin/layout.tsx provides
// it for everything under /admin.

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileSpreadsheet, Download, Loader2, ShieldCheck } from 'lucide-react';
import { currentCenterId } from '@/lib/current-center';

interface Center {
  id: string;
  name: string;
}

interface ExportRow {
  date: string;
  childFirstName: string;
  childLastName: string;
  dropOff: string | null;
  pickUp: string | null;
}

// The exact DCYF text the provider must read and attest to. Kept verbatim,
// rendered as its own block so the attestation is unambiguous in the UI.
const ATTESTATION_TEXT = `I acknowledge, agree, and attest to the following:
- As a condition of Child Care Assistance Program (CCAP) payment, I agree to maintain complete daily attendance records for all children receiving child care assistance (CCAP).
- I agree to provide attendance data for all children in my program so that DCYF could determine that I am complying with program requirements including licensing rules and standards.
- The attendance records must: be accurate, legible, and completed daily; be kept at the site where services are delivered for six years after the date of service; be immediately available upon request to the county, Tribe and/or staff of the Department of Children, Youth, and Families (DCYF); include the date, each child's first and last name, and each child's drop-off and pick-up times.
- To the extent possible, drop-off and pick-up times must be entered by the person dropping off or picking up the child.
- The attendance records as submitted are true and accurate.`;

// A CSV cell: quote and escape anything with a comma, quote, or newline.
function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// An ISO timestamp shown as a local clock time for the CCAP drop-off / pick-up
// columns. Empty when there is no time recorded.
function timeOf(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Today and 14 days ago as YYYY-MM-DD, for sensible default range bounds.
function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function daysAgoLocal(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function CcapExportPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [centerId, setCenterId] = useState<string>('');
  const [periodStart, setPeriodStart] = useState<string>(daysAgoLocal(14));
  const [periodEnd, setPeriodEnd] = useState<string>(todayLocal());
  const [attested, setAttested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ count: number; name: string } | null>(null);

  // Load the centers the director can pick from. The default selection is the
  // current operating center (cc_center cookie, or Brooklyn Park fallback).
  const loadCenters = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/team', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      const list: Center[] = Array.isArray(data.centers) ? data.centers : [];
      setCenters(list);
      const preferred = currentCenterId();
      const match = list.find((c) => c.id === preferred);
      setCenterId(match ? match.id : list[0]?.id || preferred);
    } catch {
      // Centers list is best-effort; the fallback center still drives the route.
      setCenterId(currentCenterId());
    }
  }, []);

  useEffect(() => {
    loadCenters();
  }, [loadCenters]);

  const rangeValid =
    !!periodStart && !!periodEnd && periodStart <= periodEnd;
  const canExport = attested && rangeValid && !!centerId && !busy;

  async function handleExport() {
    if (!canExport) return;
    setBusy(true);
    setError(null);
    setLastResult(null);
    try {
      const res = await fetch(
        `/api/admin/ccap-export?center=${encodeURIComponent(centerId)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            period_start: periodStart,
            period_end: periodEnd,
            attested: true,
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'The export could not be completed.');
        return;
      }

      const rows: ExportRow[] = Array.isArray(data.rows) ? data.rows : [];

      // Build the CSV with the CCAP-required header and fields.
      const header = [
        'Date',
        'Child First Name',
        'Child Last Name',
        'Drop-off time',
        'Pick-up time',
      ];
      const lines = [header.map(csvCell).join(',')];
      for (const r of rows) {
        lines.push(
          [
            csvCell(r.date || ''),
            csvCell(r.childFirstName || ''),
            csvCell(r.childLastName || ''),
            csvCell(timeOf(r.dropOff)),
            csvCell(timeOf(r.pickUp)),
          ].join(',')
        );
      }
      // Prepend a UTF-8 BOM so Excel reads accented names correctly.
      const csv = '﻿' + lines.join('\r\n');
      const centerName =
        centers.find((c) => c.id === centerId)?.name || 'center';
      const fileName = `CCAP-attendance-${centerName.replace(/[^a-z0-9]+/gi, '-')}-${periodStart}-to-${periodEnd}.csv`;

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      setLastResult({ count: rows.length, name: fileName });
    } catch {
      setError('The export could not be completed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileSpreadsheet className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Export Attendance for CCAP</h1>
          <p className="text-muted-foreground">
            Download a daily attendance file for the Child Care Assistance Program and record your accuracy attestation.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Choose the period and center</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ccap-start">Start date</Label>
              <Input
                id="ccap-start"
                type="date"
                value={periodStart}
                max={periodEnd || undefined}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ccap-end">End date</Label>
              <Input
                id="ccap-end"
                type="date"
                value={periodEnd}
                min={periodStart || undefined}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ccap-center">Center</Label>
              <Select value={centerId} onValueChange={setCenterId}>
                <SelectTrigger id="ccap-center">
                  <SelectValue placeholder="Select a center" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {!rangeValid && (
            <p className="text-sm text-christina-red">
              The start date must be on or before the end date.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-christina-red" />
            Accuracy attestation (required)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-[#faf6f0] p-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#1f2937]">
              {ATTESTATION_TEXT}
            </p>
          </div>
          <label
            htmlFor="ccap-attest"
            className="flex cursor-pointer items-start gap-3 rounded-md border border-christina-red/40 bg-white p-3"
          >
            <Checkbox
              id="ccap-attest"
              checked={attested}
              onCheckedChange={(v) => setAttested(v === true)}
              className="mt-0.5"
            />
            <span className="text-sm font-medium text-[#1f2937]">
              I have read the statement above and I attest that the attendance records as submitted are true and accurate.
            </span>
          </label>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm font-medium text-christina-red" role="alert">
          {error}
        </p>
      )}
      {lastResult && (
        <p className="text-sm font-medium text-christina-green">
          Exported {lastResult.count} attendance{' '}
          {lastResult.count === 1 ? 'record' : 'records'} to {lastResult.name}. Your attestation was recorded.
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleExport}
          disabled={!canExport}
          className="bg-christina-red text-white hover:bg-christina-red/90"
        >
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export attendance for CCAP
        </Button>
        {!attested && (
          <span className="text-sm text-muted-foreground">
            Check the accuracy attestation to enable the export.
          </span>
        )}
      </div>
    </div>
  );
}

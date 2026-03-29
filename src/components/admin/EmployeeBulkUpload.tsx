'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { createEmployee, getEmployees } from '@/lib/employee-storage';
import type { EmployeeCreate } from '@/types/employee';
import { UserRole } from '@/types/database';

// ──────────────────────────────────────────────
// CSV template headers (must stay in sync with parsing below)
// ──────────────────────────────────────────────
const CSV_HEADERS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'role',
  'job_title',
  'hourly_rate',
  'pin',
];

const TEMPLATE_ROWS = [
  'Jane,Smith,jsmith@christinaschildcare.com,(763) 555-0101,teacher,Lead Teacher,18.50,',
  'Mark,Johnson,mjohnson@christinaschildcare.com,(763) 555-0102,aide,Classroom Aide,15.00,1234',
];

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type RowStatus = 'valid' | 'error';

interface ParsedRow {
  index: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  job_title: string;
  hourly_rate: string;
  pin: string;
  status: RowStatus;
  errors: string[];
}

interface ImportResult {
  imported: number;
  total: number;
  failed: number;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const VALID_ROLES: UserRole[] = [
  'owner',
  'admin',
  'teacher',
  'parent',
];

function generateRandomPin(existingPins: Set<string>): string {
  let attempts = 0;
  while (attempts < 100) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    if (!existingPins.has(pin)) return pin;
    attempts++;
  }
  // Fallback: 6-digit PIN if all 4-digit combos taken
  return String(Math.floor(100000 + Math.random() * 900000));
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function validateRow(
  row: Omit<ParsedRow, 'status' | 'errors' | 'index'>,
  existingEmails: Set<string>
): string[] {
  const errors: string[] = [];

  if (!row.first_name) errors.push('Missing first name');
  if (!row.last_name) errors.push('Missing last name');
  if (!row.email) {
    errors.push('Missing email');
  } else if (existingEmails.has(row.email.toLowerCase())) {
    errors.push('Email already exists');
  }
  if (!VALID_ROLES.includes(row.role as UserRole)) {
    errors.push(`Invalid role "${row.role}". Must be one of: ${VALID_ROLES.join(', ')}`);
  }
  if (row.hourly_rate && isNaN(parseFloat(row.hourly_rate))) {
    errors.push('Hourly rate must be a number');
  }
  if (row.pin && !/^\d{4,6}$/.test(row.pin)) {
    errors.push('PIN must be 4-6 digits');
  }

  return errors;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

interface EmployeeBulkUploadProps {
  onImportComplete?: () => void;
}

export function EmployeeBulkUpload({ onImportComplete }: EmployeeBulkUploadProps) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function downloadTemplate() {
    const content = [CSV_HEADERS.join(','), ...TEMPLATE_ROWS].join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult(null);

    const text = await file.text();
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      setRows([]);
      return;
    }

    // Determine header positions (case-insensitive, allow any column order)
    const headerLine = parseCsvLine(lines[0].toLowerCase());
    const colIndex = (name: string) => headerLine.indexOf(name);

    const iFirst = colIndex('first_name');
    const iLast = colIndex('last_name');
    const iEmail = colIndex('email');
    const iPhone = colIndex('phone');
    const iRole = colIndex('role');
    const iTitle = colIndex('job_title');
    const iRate = colIndex('hourly_rate');
    const iPin = colIndex('pin');

    // Collect existing emails to detect duplicates
    let existingEmployees: Awaited<ReturnType<typeof getEmployees>> = [];
    try {
      existingEmployees = await getEmployees();
    } catch {
      // Continue even if storage is unavailable
    }
    const existingEmails = new Set(existingEmployees.map((e) => e.email.toLowerCase()));

    const parsed: ParsedRow[] = lines.slice(1).map((line, idx) => {
      const cols = parseCsvLine(line);
      const raw = {
        first_name: iFirst >= 0 ? (cols[iFirst] || '') : '',
        last_name: iLast >= 0 ? (cols[iLast] || '') : '',
        email: iEmail >= 0 ? (cols[iEmail] || '') : '',
        phone: iPhone >= 0 ? (cols[iPhone] || '') : '',
        role: iRole >= 0 ? (cols[iRole] || 'teacher') : 'teacher',
        job_title: iTitle >= 0 ? (cols[iTitle] || '') : '',
        hourly_rate: iRate >= 0 ? (cols[iRate] || '') : '',
        pin: iPin >= 0 ? (cols[iPin] || '') : '',
      };

      const errors = validateRow(raw, existingEmails);
      return {
        ...raw,
        index: idx + 1,
        status: errors.length === 0 ? 'valid' : 'error',
        errors,
      };
    });

    setRows(parsed);
  }

  async function handleImport() {
    const validRows = rows.filter((r) => r.status === 'valid');
    if (validRows.length === 0) return;

    setImporting(true);

    // Collect PINs already in use to avoid collisions during batch
    let existingEmployees: Awaited<ReturnType<typeof getEmployees>> = [];
    try {
      existingEmployees = await getEmployees();
    } catch {
      // Continue
    }
    const usedPins = new Set(existingEmployees.map((e) => e.pin));

    let imported = 0;
    let failed = 0;
    const today = new Date().toISOString().split('T')[0];

    for (const row of validRows) {
      try {
        let pin = row.pin;
        if (!pin) {
          pin = generateRandomPin(usedPins);
        }
        usedPins.add(pin);

        const employeeData: EmployeeCreate = {
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
          phone: row.phone,
          role: row.role as UserRole,
          job_title: row.job_title || '',
          hire_date: today,
          hourly_rate: parseFloat(row.hourly_rate) || 0,
          pin,
          employment_status: 'active',
          certifications: [],
        };

        await createEmployee(employeeData);
        imported++;
      } catch {
        failed++;
      }
    }

    setImporting(false);
    setResult({ imported, total: validRows.length, failed });
    onImportComplete?.();
  }

  function handleClose(open: boolean) {
    if (!open) {
      setRows([]);
      setResult(null);
      if (fileRef.current) fileRef.current.value = '';
    }
    setOpen(open);
  }

  const validCount = rows.filter((r) => r.status === 'valid').length;
  const errorCount = rows.filter((r) => r.status === 'error').length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" /> Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Employees</DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple employees at once. Download the template to
            see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Step 1: Download template */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Step 1: Download the template</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Fill in one employee per row. PIN is optional (auto-generated if blank).
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="shrink-0">
              <Download className="h-4 w-4 mr-2" /> Template
            </Button>
          </div>

          {/* Step 2: Upload file */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Step 2: Upload your completed file</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-christina-red/10 file:text-christina-red hover:file:bg-christina-red/20 cursor-pointer"
            />
          </div>

          {/* Preview table */}
          {rows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium">Preview</p>
                {validCount > 0 && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> {validCount} ready
                  </Badge>
                )}
                {errorCount > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <XCircle className="h-3 w-3 mr-1" /> {errorCount} with errors
                  </Badge>
                )}
              </div>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>PIN</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow
                        key={row.index}
                        className={row.status === 'error' ? 'bg-red-50' : ''}
                      >
                        <TableCell className="text-xs text-muted-foreground">
                          {row.index}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              !row.first_name || !row.last_name
                                ? 'text-red-600 font-medium'
                                : ''
                            }
                          >
                            {row.first_name || '[missing]'} {row.last_name || '[missing]'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={!row.email ? 'text-red-600 font-medium' : ''}>
                            {row.email || '[missing]'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              !VALID_ROLES.includes(row.role as UserRole)
                                ? 'text-red-600 font-medium'
                                : ''
                            }
                          >
                            {row.role || '[missing]'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {row.hourly_rate
                            ? `$${parseFloat(row.hourly_rate).toFixed(2)}`
                            : '$0.00'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {row.pin || 'auto'}
                        </TableCell>
                        <TableCell>
                          {row.status === 'valid' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="space-y-0.5">
                              {row.errors.map((err, i) => (
                                <p key={i} className="text-xs text-red-600">
                                  {err}
                                </p>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Import result */}
          {result && (
            <div
              className={`p-4 rounded-lg border ${
                result.failed === 0
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <p className="text-sm font-medium">
                Imported {result.imported} of {result.total}.
                {result.failed > 0 && ` ${result.failed} failed.`}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              onClick={handleImport}
              disabled={validCount === 0 || importing}
              className="bg-christina-red hover:bg-christina-red/90"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...
                </>
              ) : (
                `Import ${validCount} Employee${validCount !== 1 ? 's' : ''}`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

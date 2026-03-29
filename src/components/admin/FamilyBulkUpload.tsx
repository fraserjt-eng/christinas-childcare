'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Upload, Download, Check, X } from 'lucide-react';
import { createFamily } from '@/lib/family-storage';
import {
  generateParentId,
  generateChildId,
  FamilyParent,
  FamilyChild,
} from '@/types/family';

// ============================================================================
// CSV Template
// ============================================================================

const CSV_HEADERS = [
  'parent_name',
  'parent_email',
  'parent_phone',
  'relationship',
  'child_name',
  'child_dob',
  'child_program',
  'allergies',
];

const CSV_EXAMPLE_ROWS = [
  'Jane Smith,jane@email.com,(612) 555-0100,mother,Emma Smith,2022-04-10,preschool,Peanuts',
  'Jane Smith,jane@email.com,(612) 555-0100,mother,Noah Smith,2020-09-01,school_age,',
  'Carlos Rivera,carlos@email.com,(612) 555-0200,father,Mia Rivera,2023-01-15,toddler,Dairy',
];

function downloadTemplate() {
  const content = [CSV_HEADERS.join(','), ...CSV_EXAMPLE_ROWS].join('\n');
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'family-import-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// CSV parsing types
// ============================================================================

interface ParsedRow {
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  relationship: string;
  child_name: string;
  child_dob: string;
  child_program: string;
  allergies: string;
  rowIndex: number;
  errors: string[];
}

interface FamilyGroup {
  parentEmail: string;
  parentName: string;
  parentPhone: string;
  relationship: string;
  children: { name: string; dob: string; program: string; allergies: string }[];
  errors: string[];
}

// ============================================================================
// Parsing helpers
// ============================================================================

function parseCSV(text: string): ParsedRow[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  // Skip header row if it matches the template
  const firstLine = lines[0].toLowerCase();
  const startIndex = firstLine.startsWith('parent_name') ? 1 : 0;

  return lines.slice(startIndex).map((line, idx) => {
    const cols = line.split(',').map((c) => c.trim());
    const [
      parent_name = '',
      parent_email = '',
      parent_phone = '',
      relationship = '',
      child_name = '',
      child_dob = '',
      child_program = '',
      allergies = '',
    ] = cols;

    const errors: string[] = [];
    if (!parent_name) errors.push('Missing parent name');
    if (!parent_email) errors.push('Missing email');
    if (!parent_phone) errors.push('Missing phone');
    if (!child_name) errors.push('Missing child name');

    return {
      parent_name,
      parent_email,
      parent_phone,
      relationship,
      child_name,
      child_dob,
      child_program,
      allergies,
      rowIndex: startIndex + idx + 1,
      errors,
    };
  });
}

function groupByFamily(rows: ParsedRow[]): FamilyGroup[] {
  const map = new Map<string, FamilyGroup>();

  for (const row of rows) {
    const key = row.parent_email.toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        parentEmail: row.parent_email,
        parentName: row.parent_name,
        parentPhone: row.parent_phone,
        relationship: row.relationship,
        children: [],
        errors: row.errors,
      });
    }
    const group = map.get(key)!;
    // Merge errors (unique)
    row.errors.forEach((e) => {
      if (!group.errors.includes(e)) group.errors.push(e);
    });
    if (row.child_name) {
      group.children.push({
        name: row.child_name,
        dob: row.child_dob,
        program: row.child_program,
        allergies: row.allergies,
      });
    }
  }

  return Array.from(map.values());
}

// ============================================================================
// Import logic
// ============================================================================

async function importFamilyGroups(
  groups: FamilyGroup[]
): Promise<{ imported: number; skipped: number; reasons: string[] }> {
  let imported = 0;
  let skipped = 0;
  const reasons: string[] = [];

  for (const group of groups) {
    if (group.errors.length > 0) {
      skipped++;
      reasons.push(`${group.parentName || group.parentEmail}: ${group.errors.join(', ')}`);
      continue;
    }

    const validRelationship = ['mother', 'father', 'guardian', 'other'].includes(
      group.relationship.toLowerCase()
    )
      ? (group.relationship.toLowerCase() as FamilyParent['relationship'])
      : 'guardian';

    const parent: FamilyParent = {
      id: generateParentId(),
      name: group.parentName,
      email: group.parentEmail,
      phone: group.parentPhone,
      relationship: validRelationship,
      is_primary: true,
    };

    const children: FamilyChild[] = group.children.map((c) => ({
      id: generateChildId(),
      name: c.name,
      date_of_birth: c.dob,
      classroom: c.program || undefined,
      allergies: c.allergies
        ? c.allergies.split(';').map((a) => a.trim()).filter(Boolean)
        : [],
      emergency_contacts: [],
    }));

    try {
      await createFamily({
        email: group.parentEmail,
        password_hash: '',
        status: 'active',
        parents: [parent],
        children,
      });
      imported++;
    } catch {
      skipped++;
      reasons.push(`${group.parentName}: failed to save`);
    }
  }

  return { imported, skipped, reasons };
}

// ============================================================================
// Component
// ============================================================================

interface FamilyBulkUploadProps {
  onImport?: () => void;
}

export function FamilyBulkUpload({ onImport }: FamilyBulkUploadProps) {
  const [open, setOpen] = useState(false);
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    reasons: string[];
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      const groups = groupByFamily(rows);
      
      setFamilyGroups(groups);
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validGroups = familyGroups.filter((g) => g.errors.length === 0);
    if (validGroups.length === 0) return;

    setImporting(true);
    const res = await importFamilyGroups(familyGroups);
    setImporting(false);
    setResult(res);
    onImport?.();
  };

  const handleClose = () => {
    setOpen(false);
    setFamilyGroups([]);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const validCount = familyGroups.filter((g) => g.errors.length === 0).length;
  const invalidCount = familyGroups.filter((g) => g.errors.length > 0).length;

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4 mr-2" />
        Bulk Upload
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Families</DialogTitle>
            <DialogDescription>
              Import multiple families from a CSV file. Download the template to see the expected format.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Step 1: Template */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <span className="text-sm text-muted-foreground">
                CSV with headers: {CSV_HEADERS.join(', ')}
              </span>
            </div>

            {/* Step 2: Upload */}
            <div className="space-y-1">
              <label
                htmlFor="csv-upload"
                className="block text-sm font-medium"
              >
                Select CSV File
              </label>
              <input
                id="csv-upload"
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="block text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-input file:bg-background file:text-sm file:font-medium file:cursor-pointer cursor-pointer"
              />
            </div>

            {/* Step 3: Preview */}
            {familyGroups.length > 0 && !result && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">
                    Preview: {familyGroups.length}{' '}
                    {familyGroups.length === 1 ? 'family' : 'families'} found in file
                  </p>
                  {invalidCount > 0 && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                      {invalidCount} with errors
                    </Badge>
                  )}
                  {validCount > 0 && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      {validCount} valid
                    </Badge>
                  )}
                </div>

                <div className="rounded-lg border max-h-56 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Parent</TableHead>
                        <TableHead className="text-xs">Email</TableHead>
                        <TableHead className="text-xs">Children</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {familyGroups.map((group, idx) => (
                        <TableRow key={idx} className={group.errors.length > 0 ? 'bg-red-50' : ''}>
                          <TableCell className="text-sm py-2">
                            {group.parentName || (
                              <span className="text-red-600 italic">missing</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm py-2 text-muted-foreground">
                            {group.parentEmail || (
                              <span className="text-red-600 italic">missing</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm py-2">
                            {group.children.map((c) => c.name).filter(Boolean).join(', ') || (
                              <span className="text-muted-foreground">None</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            {group.errors.length === 0 ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="flex items-center gap-1">
                                <X className="h-4 w-4 text-red-600 flex-shrink-0" />
                                <span className="text-xs text-red-600">
                                  {group.errors.join(', ')}
                                </span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <p className="text-xs text-muted-foreground">
                  Rows with errors will be skipped. {invalidCount > 0 && 'Fix the CSV and re-upload to include them.'}
                </p>
              </div>
            )}

            {/* Step 4: Results */}
            {result && (
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-semibold text-foreground">Import complete.</p>
                <p className="text-sm text-muted-foreground">
                  Imported {result.imported} of {result.imported + result.skipped}{' '}
                  {result.imported + result.skipped === 1 ? 'family' : 'families'}.
                  {result.skipped > 0 && (
                    <span className="text-destructive ml-1">
                      {result.skipped} skipped.
                    </span>
                  )}
                </p>
                {result.reasons.length > 0 && (
                  <ul className="text-xs text-destructive space-y-0.5 list-disc list-inside">
                    {result.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {result ? 'Close' : 'Cancel'}
            </Button>
            {!result && validCount > 0 && (
              <Button
                onClick={handleImport}
                disabled={importing}
                className="bg-christina-red hover:bg-christina-red/90"
              >
                {importing ? 'Importing...' : `Import ${validCount} ${validCount === 1 ? 'Family' : 'Families'}`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

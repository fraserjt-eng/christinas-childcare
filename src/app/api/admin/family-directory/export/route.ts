export const runtime = 'nodejs';

// Branded family-directory spreadsheet download for the admin data center.
// Admin-gated, service-role (PII: families/children/parents/PINs never touch the
// anon key). Center scope mirrors the rest of admin: a center-bound admin gets
// their center; an owner/superadmin gets the picked center, or ALL centers when
// the Combined view is on. One worksheet per center + an "All Families" sheet,
// Christina's red header + logo bub, one row per family with the kiosk PIN.

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, type AuthedSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const RED = 'FFC62828', YELLOW = 'FFFFD54F', CREAM = 'FFFAF6F0', GREY = 'FF6B7280';

function scopeCenters(request: NextRequest, session: AuthedSession): string[] | null {
  const role = (session.user.role || '').toLowerCase();
  const isCrossCenter = role === 'owner' || role === 'superadmin' || !session.user.center_id;
  if (!isCrossCenter) return [session.user.center_id as string];
  const combined = request.cookies.get('cc_view')?.value === 'combined';
  if (combined) return null; // all centers
  const picked = request.cookies.get('cc_center')?.value || request.nextUrl.searchParams.get('center');
  if (picked) return [picked];
  return null; // all
}

export async function GET(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });

  const wantCenters = scopeCenters(request, session);
  const inScope = (cid: string | null) => wantCenters === null || (cid != null && wantCenters.includes(cid));

  const [{ data: centers }, { data: fams }, { data: kids }, { data: pars }] = await Promise.all([
    supabase.from('centers').select('id, name').limit(50),
    supabase.from('families').select('id, pin, email, status, center_id').limit(10000),
    supabase.from('family_children').select('name, date_of_birth, classroom, family_id, center_id').limit(10000),
    supabase.from('family_parents').select('family_id, name, phone, email, is_primary').limit(10000),
  ]);
  const centerName = (id: string | null) => (centers || []).find((c) => c.id === id)?.name || 'Unassigned';
  const kidsBy: Record<string, { name: string; date_of_birth: string | null; classroom: string | null }[]> = {};
  for (const k of kids || []) (kidsBy[k.family_id as string] ||= []).push(k as never);
  const parsBy: Record<string, { name: string; phone: string | null; is_primary: boolean | null }[]> = {};
  for (const p of pars || []) (parsBy[p.family_id as string] ||= []).push(p as never);
  const primaryName = (fid: string) => { const ps = parsBy[fid] || []; return (ps.find((p) => p.is_primary) || ps[0])?.name || ''; };
  const primaryPhone = (fid: string) => { const ps = parsBy[fid] || []; return (ps.find((p) => p.is_primary) || ps[0])?.phone || ''; };

  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Christina's Child Care Center";
  let logoId: number | null = null;
  const logoPath = join(process.cwd(), 'public', 'images', 'icon-192.png');
  if (existsSync(logoPath)) logoId = wb.addImage({ filename: logoPath, extension: 'png' });

  function buildSheet(title: string, families: typeof fams) {
    const list = (families || []).filter((f) => (kidsBy[f.id as string] || []).length > 0)
      .sort((a, b) => (primaryName(a.id as string) || '').localeCompare(primaryName(b.id as string) || ''));
    const ws = wb.addWorksheet(title.slice(0, 31), { views: [{ state: 'frozen', ySplit: 4 }] });
    ws.columns = [
      { width: 10 }, { width: 30 }, { width: 22 }, { width: 16 }, { width: 30 }, { width: 26 }, { width: 22 }, { width: 10 },
    ];
    ws.mergeCells('A1:H3');
    const band = ws.getCell('A1');
    band.value = `  Christina's Child Care Center  ·  ${title}  ·  Kiosk PIN Directory`;
    band.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    band.alignment = { vertical: 'middle', horizontal: 'left', indent: 4 };
    band.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RED } };
    ws.getRow(1).height = 22; ws.getRow(2).height = 22; ws.getRow(3).height = 22;
    if (logoId !== null) ws.addImage(logoId, { tl: { col: 7.15, row: 0.25 }, ext: { width: 56, height: 56 } });
    const hdr = ws.getRow(4);
    hdr.values = ['PIN', 'Children', 'Parent / contact', 'Phone', 'Email', 'Room(s)', 'Date(s) of birth', 'Status'];
    hdr.eachCell((c) => {
      c.font = { bold: true, size: 10, color: { argb: 'FF1F2937' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: YELLOW } };
      c.border = { bottom: { style: 'thin', color: { argb: RED } } };
    });
    let r = 5;
    for (const f of list) {
      const ks = kidsBy[f.id as string] || [];
      const email = String(f.email || '');
      const stub = email.endsWith('@roster.local');
      const row = ws.getRow(r);
      row.values = [
        String(f.pin || ''),
        ks.map((k) => k.name).join(', '),
        primaryName(f.id as string) || (stub ? '(needs family info)' : ''),
        primaryPhone(f.id as string) || '',
        stub ? '' : email,
        Array.from(new Set(ks.map((k) => k.classroom).filter(Boolean))).join(' / '),
        ks.map((k) => k.date_of_birth).filter(Boolean).join(', '),
        (f.status as string) || '',
      ];
      row.getCell(1).font = { name: 'Menlo', bold: true, size: 12 };
      if (r % 2 === 1) row.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREAM } }; });
      r++;
    }
    const foot = ws.getRow(r + 1);
    ws.mergeCells(`A${r + 1}:H${r + 1}`);
    foot.getCell(1).value = `${list.length} families · ${list.reduce((n, f) => n + (kidsBy[f.id as string] || []).length, 0)} children. Confidential — front desk only.`;
    foot.getCell(1).font = { italic: true, size: 9, color: { argb: GREY } };
  }

  const scoped = (fams || []).filter((f) => inScope(f.center_id as string | null));
  const centersInScope = Array.from(new Set(scoped.map((f) => f.center_id as string)));
  for (const cid of centersInScope) buildSheet(centerName(cid), scoped.filter((f) => f.center_id === cid));
  if (centersInScope.length > 1) buildSheet('All Families', scoped);
  if (centersInScope.length === 0) buildSheet('Directory', []);

  const buf = await wb.xlsx.writeBuffer();
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(buf as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Christinas-Family-Directory-${stamp}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}

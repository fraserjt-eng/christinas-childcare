export const runtime = 'nodejs';

// Session-gated, service-role access to the RLS-locked training tables
// (training_progress, training_knowledge_checks, training_gate_assessments,
// training_gate_overrides, training_unit_unlocks). These tables deny the anon
// key, so client reads/writes through the anon client 401'd and silently fell
// back to localStorage (per-device only). This route is the single cloud path:
// staff data flows for real, and the intelligence training scan finally sees it.
//
// Scope: any signed-in staff (teacher+) may read/write their OWN records; a
// non-admin is forced to their session user id so one teacher can't read or
// tamper with another's progress. All-staff reads and admin ratings/overrides/
// unlocks require an admin/owner/superadmin session. Mirrors the established
// "server route for RLS-locked client reads" pattern (schedules, employees).

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, type AuthedSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isAdminRole(session: AuthedSession): boolean {
  const role = (session.user.role || '').toLowerCase();
  return role === 'admin' || role === 'owner' || role === 'superadmin' || role === 'director';
}

export async function GET(request: NextRequest) {
  const session = await requireSession('teacher');
  if (!session) return fail('Unauthorized', 401);
  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  const sp = request.nextUrl.searchParams;
  const op = sp.get('op') || '';
  const admin = isAdminRole(session);
  // a non-admin can only ever see their own records
  const ownUser = (requested: string | null) => (admin && requested ? requested : session.user.id);

  const adminOps = new Set(['allProgress', 'allKnowledgeChecks', 'allGateAssessments']);
  if (adminOps.has(op) && !admin) return fail('Forbidden', 403);

  try {
    switch (op) {
      case 'userProgress': {
        const { data } = await supabase.from('training_progress').select('*').eq('user_id', ownUser(sp.get('userId'))).limit(5000);
        return NextResponse.json({ rows: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
      }
      case 'knowledgeCheckHistory': {
        const { data } = await supabase
          .from('training_knowledge_checks')
          .select('*')
          .eq('user_id', ownUser(sp.get('userId')))
          .eq('module_id', sp.get('moduleId') || '')
          .order('attempted_at', { ascending: true })
          .limit(5000);
        return NextResponse.json({ rows: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
      }
      case 'gateAssessments': {
        const { data } = await supabase
          .from('training_gate_assessments')
          .select('*')
          .eq('user_id', ownUser(sp.get('userId')))
          .eq('unit_id', sp.get('unitId') || '')
          .limit(5000);
        return NextResponse.json({ rows: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
      }
      case 'gateOverrides': {
        const { data } = await supabase.from('training_gate_overrides').select('*').limit(5000);
        return NextResponse.json({ rows: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
      }
      case 'unitUnlocks': {
        const { data } = await supabase.from('training_unit_unlocks').select('*').limit(5000);
        return NextResponse.json({ rows: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
      }
      case 'allProgress': {
        const { data } = await supabase.from('training_progress').select('*').limit(20000);
        return NextResponse.json({ rows: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
      }
      case 'allKnowledgeChecks': {
        const { data } = await supabase.from('training_knowledge_checks').select('*').limit(20000);
        return NextResponse.json({ rows: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
      }
      case 'allGateAssessments': {
        const { data } = await supabase.from('training_gate_assessments').select('*').limit(20000);
        return NextResponse.json({ rows: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
      }
      default:
        return fail('Unknown op', 400);
    }
  } catch {
    return fail('Could not read training data', 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await requireSession('teacher');
  if (!session) return fail('Unauthorized', 401);
  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  const admin = isAdminRole(session);
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return fail('Invalid body', 400);
  }
  const op = String(body.op || '');
  const adminOps = new Set(['saveAdminRating', 'saveGateOverride', 'toggleUnitUnlock']);
  if (adminOps.has(op) && !admin) return fail('Forbidden', 403);

  // own-progress writes are pinned to the session user unless an admin acts for someone
  const ownUser = (requested: unknown) => (admin && requested ? String(requested) : session.user.id);
  const now = new Date().toISOString();

  try {
    switch (op) {
      case 'markSectionComplete': {
        const rec = { user_id: ownUser(body.userId), module_id: body.moduleId, section: body.section, completed: true, score: body.score ?? null, completed_at: now };
        const { error } = await supabase.from('training_progress').upsert(rec, { onConflict: 'user_id,module_id,section' });
        return error ? fail('write failed', 500) : NextResponse.json({ ok: true });
      }
      case 'saveKnowledgeCheckAnswer': {
        const rec = { user_id: ownUser(body.userId), module_id: body.moduleId, question_id: body.questionId, selected_answer: body.selectedAnswer, correct: body.correct, attempted_at: now };
        const { error } = await supabase.from('training_knowledge_checks').insert(rec);
        return error ? fail('write failed', 500) : NextResponse.json({ ok: true });
      }
      case 'saveGateAssessment': {
        const rec = { user_id: ownUser(body.userId), unit_id: body.unitId, competency_id: body.competencyId, self_rating: body.selfRating, self_assessed_at: now };
        const { error } = await supabase.from('training_gate_assessments').upsert(rec, { onConflict: 'user_id,unit_id,competency_id' });
        return error ? fail('write failed', 500) : NextResponse.json({ ok: true });
      }
      case 'saveAdminRating': {
        const rec = { user_id: body.userId, unit_id: body.unitId, competency_id: body.competencyId, admin_rating: body.adminRating, admin_assessed_at: now };
        const { error } = await supabase.from('training_gate_assessments').upsert(rec, { onConflict: 'user_id,unit_id,competency_id' });
        return error ? fail('write failed', 500) : NextResponse.json({ ok: true });
      }
      case 'saveGateOverride': {
        const rec = { user_id: body.userId, unit_id: body.unitId, overridden_by: body.overriddenBy, reason: body.reason, created_at: now };
        const { error } = await supabase.from('training_gate_overrides').upsert(rec, { onConflict: 'user_id,unit_id' });
        return error ? fail('write failed', 500) : NextResponse.json({ ok: true });
      }
      case 'toggleUnitUnlock': {
        const unlocked = !!body.unlocked;
        const rec = { unit_id: body.unitId, unlocked, unlocked_at: unlocked ? now : null, unlocked_by: unlocked ? body.unlockedBy : null };
        const { error } = await supabase.from('training_unit_unlocks').upsert(rec, { onConflict: 'unit_id' });
        return error ? fail('write failed', 500) : NextResponse.json({ ok: true });
      }
      default:
        return fail('Unknown op', 400);
    }
  } catch {
    return fail('Could not save training data', 500);
  }
}

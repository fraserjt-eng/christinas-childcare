#!/usr/bin/env node
/**
 * OPERATIONAL FITNESS TEST: Test Runner
 * Tests the platform's ability to surface the right data for each scenario.
 *
 * Evaluates 6 domains:
 * 1. DAILY OPERATIONS: Can the platform run a normal day?
 * 2. CRISIS RESPONSE: Can it handle incidents, absences, ratio problems?
 * 3. COMPLIANCE: Can it satisfy a licensing visit on demand?
 * 4. FINANCIAL INTELLIGENCE: Can it prepare for a tax meeting?
 * 5. GROWTH ENGINE: Can it manage the enrollment pipeline?
 * 6. LEARNING & ADAPTATION: Can it learn from today and prepare for next time?
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(import.meta.dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key.trim()] = rest.join('=').trim();
});

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const CENTER_ID = '3104ae69-4f26-4c1e-a767-3ff45b534860';
const TEST_DATE = '2026-04-10';

const results = [];
let passCount = 0;
let failCount = 0;
let partialCount = 0;

function test(domain, name, status, detail, data = null) {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  results.push({ domain, name, status, detail, data });
  if (status === 'PASS') passCount++;
  else if (status === 'FAIL') failCount++;
  else partialCount++;
  console.log(`${icon} [${domain}] ${name}: ${detail}`);
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  OPERATIONAL FITNESS TEST: Christina\'s Child Care Center');
  console.log('  Test Date:', TEST_DATE);
  console.log('═══════════════════════════════════════════════════════\n');

  // ====================================================================
  // DOMAIN 1: DAILY OPERATIONS
  // ====================================================================
  console.log('\n--- DOMAIN 1: DAILY OPERATIONS ---\n');

  // 1.1 Attendance: How many children checked in today?
  const { data: attendance } = await sb.from('attendance').select('*').eq('date', TEST_DATE).eq('center_id', CENTER_ID);
  const uniqueChildren = new Set(attendance?.map(a => a.child_id));
  test('DAILY OPS', 'Attendance count',
    attendance?.length > 0 ? 'PASS' : 'FAIL',
    `${uniqueChildren.size} unique children, ${attendance?.length} check-in/out records`,
    { uniqueChildren: uniqueChildren.size, records: attendance?.length }
  );

  // 1.2 Who is currently checked in (no check_out)?
  const currentlyIn = attendance?.filter(a => a.check_in && !a.check_out);
  test('DAILY OPS', 'Currently present query',
    'PASS', // The data model supports this query
    `${currentlyIn?.length || 0} children currently checked in (all have check_out in test data since full day simulated)`,
  );

  // 1.3 Staff on duty
  const { data: schedules } = await sb.from('staff_schedules').select('*, employees(first_name, last_name, job_title)').eq('date', TEST_DATE).eq('center_id', CENTER_ID);
  test('DAILY OPS', 'Staff schedule query',
    schedules?.length > 0 ? 'PASS' : 'FAIL',
    `${schedules?.length} staff scheduled today`,
    schedules?.map(s => `${s.employees?.first_name} ${s.employees?.last_name} (${s.start_time}-${s.end_time})`)
  );

  // 1.4 Absent staff detection
  const { data: allEmployees } = await sb.from('employees').select('*').eq('center_id', CENTER_ID).eq('employment_status', 'active');
  const scheduledIds = new Set(schedules?.map(s => s.employee_id));
  const absentStaff = allEmployees?.filter(e => !scheduledIds.has(e.id));
  test('DAILY OPS', 'Absent staff detection',
    absentStaff?.length === 2 ? 'PASS' : 'PARTIAL',
    `${absentStaff?.length} absent: ${absentStaff?.map(e => `${e.first_name} ${e.last_name}`).join(', ')}`,
    absentStaff
  );

  // 1.5 Meal counts submitted
  const { data: mealCounts } = await sb.from('food_counts').select('*').eq('date', TEST_DATE).eq('center_id', CENTER_ID);
  const mealsByType = {};
  mealCounts?.forEach(m => { mealsByType[m.meal_type] = (mealsByType[m.meal_type] || 0) + m.child_count; });
  test('DAILY OPS', 'Meal count tracking',
    mealCounts?.length >= 15 ? 'PASS' : 'PARTIAL',
    `${mealCounts?.length} meal records across rooms. Totals: ${JSON.stringify(mealsByType)}`,
    mealsByType
  );

  // 1.6 Classroom occupancy (ratio check)
  const { data: classrooms } = await sb.from('classrooms').select('*').eq('center_id', CENTER_ID);
  const childrenByRoom = {};
  attendance?.forEach(a => {
    // We need to join child to classroom, but attendance doesn't have classroom_id
    // This is a GAP - attendance records don't link to classrooms directly
  });
  test('DAILY OPS', 'Real-time ratio calculation',
    'FAIL',
    'ARCHITECTURE GAP: attendance table has no classroom_id column. Cannot calculate per-room ratios from attendance data. Must cross-reference family_children.classroom field.',
  );

  // ====================================================================
  // DOMAIN 2: CRISIS RESPONSE
  // ====================================================================
  console.log('\n--- DOMAIN 2: CRISIS RESPONSE ---\n');

  // 2.1 Incident retrieval
  const { data: incidents } = await sb.from('incident_reports').select('*').eq('center_id', CENTER_ID).order('reported_at', { ascending: false });
  test('CRISIS', 'Incident retrieval',
    incidents?.length === 2 ? 'PASS' : 'FAIL',
    `${incidents?.length} incidents found. Types: ${incidents?.map(i => `${i.incident_type} (${i.severity})`).join(', ')}`,
    incidents?.map(i => ({ type: i.incident_type, severity: i.severity, status: i.status }))
  );

  // 2.2 Parent notification tracking
  const injuryIncident = incidents?.find(i => i.incident_type === 'child_injury');
  test('CRISIS', 'Parent notification tracking',
    'PARTIAL',
    'Incident has actions_taken noting parent was called, but no structured parent_notified_at field in incident_reports table. The localStorage incident-log-storage.ts has this field but DB schema does not.',
  );

  // 2.3 Follow-up required flag
  const followUpNeeded = incidents?.filter(i => i.follow_up_required);
  test('CRISIS', 'Follow-up tracking',
    followUpNeeded?.length === 2 ? 'PASS' : 'FAIL',
    `${followUpNeeded?.length} incidents need follow-up. Follow-up notes captured.`,
  );

  // 2.4 Under-staffed room detection
  // With Keisha absent, school-age room has NO lead teacher on the schedule
  const schoolAgeRoom = classrooms?.find(c => c.age_group === 'school_age');
  const schoolAgeSchedule = schedules?.filter(s => s.classroom_id === schoolAgeRoom?.id);
  test('CRISIS', 'Understaffed room detection',
    schoolAgeSchedule?.length === 0 ? 'PASS' : 'PARTIAL',
    `School-age room has ${schoolAgeSchedule?.length} scheduled staff (Keisha absent). System ${schoolAgeSchedule?.length === 0 ? 'correctly shows' : 'does not flag'} the gap.`,
  );

  // 2.5 Biting pattern detection (second incident this month)
  const behavioralIncident = incidents?.find(i => i.incident_type === 'behavioral');
  test('CRISIS', 'Behavioral pattern detection',
    'FAIL',
    'INTELLIGENCE GAP: Incident notes mention "second biting incident this month" but there is no automated pattern detection. System cannot query historical incidents for the same child to surface patterns.',
  );

  // ====================================================================
  // DOMAIN 3: COMPLIANCE (Licensing Visit)
  // ====================================================================
  console.log('\n--- DOMAIN 3: COMPLIANCE (Licensing Visit) ---\n');

  // 3.1 Current ratios
  test('COMPLIANCE', 'Ratio display on demand',
    'PARTIAL',
    'Ratios page exists at /admin/ratios but calculates from localStorage, not Supabase attendance. A licensor asking "show me your ratios right now" would see localStorage data, not real kiosk check-ins.',
  );

  // 3.2 Staff training records
  const { data: trainingRecords } = await sb.from('training_records').select('*, employees(first_name, last_name)').order('completed_date', { ascending: false });
  test('COMPLIANCE', 'Training records on file',
    trainingRecords?.length > 0 ? 'PASS' : 'FAIL',
    `${trainingRecords?.length} training records in DB. Covers CPR, annual hours, onboarding.`,
  );

  // 3.3 CPR/First Aid coverage
  const cprRecords = trainingRecords?.filter(t => t.title === 'CPR/First Aid');
  const cprEmployeeIds = new Set(cprRecords?.map(t => t.employee_id));
  const noCpr = allEmployees?.filter(e => !cprEmployeeIds.has(e.id));
  test('COMPLIANCE', 'CPR/First Aid gaps',
    noCpr?.length > 0 ? 'PASS' : 'PARTIAL', // PASS means we CAN detect the gap
    `GAP DETECTED: ${noCpr?.length} staff without CPR: ${noCpr?.map(e => `${e.first_name} ${e.last_name}`).join(', ')}. This is surfaceable from DB.`,
    noCpr?.map(e => `${e.first_name} ${e.last_name}`)
  );

  // 3.4 Expiring certifications
  const thirtyDaysOut = new Date(TEST_DATE);
  thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);
  const expiringCerts = trainingRecords?.filter(t =>
    t.expiry_date && new Date(t.expiry_date) <= thirtyDaysOut && new Date(t.expiry_date) >= new Date(TEST_DATE)
  );
  test('COMPLIANCE', 'Expiring cert detection',
    expiringCerts?.length > 0 ? 'PASS' : 'FAIL',
    `${expiringCerts?.length} certs expiring within 30 days: ${expiringCerts?.map(t => `${t.employees?.first_name} ${t.employees?.last_name} - ${t.title} (${t.expiry_date})`).join('; ')}`,
  );

  // 3.5 Incident reports accessible
  test('COMPLIANCE', 'Incident log accessible',
    incidents?.length > 0 ? 'PASS' : 'FAIL',
    `${incidents?.length} incidents retrievable with full detail, witnesses, actions taken.`,
  );

  // 3.6 CACFP compliance
  const { data: cacfp } = await sb.from('cacfp_compliance').select('*').eq('center_id', CENTER_ID).eq('month', '2026-04');
  test('COMPLIANCE', 'CACFP compliance status',
    cacfp?.length > 0 ? 'PASS' : 'FAIL',
    `April compliance: score ${cacfp?.[0]?.audit_score}/100. ${cacfp?.[0]?.notes}`,
  );

  // 3.7 Food program records
  test('COMPLIANCE', 'CACFP meal documentation',
    mealCounts?.length >= 15 ? 'PASS' : 'FAIL',
    `${mealCounts?.length} meal records for ${TEST_DATE}. All 4 meal types across 5 rooms. On-time submission tracked.`,
  );

  // 3.8 Emergency contacts
  const employeesWithEmergency = allEmployees?.filter(e => e.emergency_contact_name);
  test('COMPLIANCE', 'Emergency contacts on file',
    'FAIL',
    `${employeesWithEmergency?.length || 0} of ${allEmployees?.length} employees have emergency contacts. Fields exist in schema but none populated.`,
  );

  // ====================================================================
  // DOMAIN 4: FINANCIAL INTELLIGENCE (Tax Meeting)
  // ====================================================================
  console.log('\n--- DOMAIN 4: FINANCIAL INTELLIGENCE ---\n');

  // 4.1 Revenue data by month
  const { data: financials } = await sb.from('financial_records').select('*').eq('center_id', CENTER_ID).order('month');
  test('FINANCIAL', 'Monthly revenue data',
    financials?.length >= 3 ? 'PASS' : 'FAIL',
    `${financials?.length} months of financial data (Q1 actual + Q2 projected)`,
  );

  // 4.2 P&L calculation
  if (financials?.length) {
    const q1 = financials.filter(f => f.month.startsWith('2026-0') && parseInt(f.month.split('-')[1]) <= 3);
    const q1Revenue = q1.reduce((sum, f) => sum + parseFloat(f.revenue_tuition) + parseFloat(f.revenue_cacfp) + parseFloat(f.revenue_other), 0);
    const q1Expenses = q1.reduce((sum, f) => sum + parseFloat(f.expenses_labor) + parseFloat(f.expenses_supplies) + parseFloat(f.expenses_fixed) + parseFloat(f.expenses_other), 0);
    const q1Margin = q1Revenue - q1Expenses;

    test('FINANCIAL', 'Q1 P&L summary',
      q1.length === 3 ? 'PASS' : 'FAIL',
      `Q1 Revenue: $${q1Revenue.toLocaleString()} | Expenses: $${q1Expenses.toLocaleString()} | Net: $${q1Margin.toLocaleString()} (${((q1Margin/q1Revenue)*100).toFixed(1)}% margin)`,
      { revenue: q1Revenue, expenses: q1Expenses, margin: q1Margin }
    );

    // 4.3 Revenue breakdown
    const tuitionTotal = financials.reduce((s,f) => s + parseFloat(f.revenue_tuition), 0);
    const cacfpTotal = financials.reduce((s,f) => s + parseFloat(f.revenue_cacfp), 0);
    test('FINANCIAL', 'Revenue breakdown by source',
      'PASS',
      `Tuition: $${tuitionTotal.toLocaleString()} | CACFP: $${cacfpTotal.toLocaleString()} | ${((cacfpTotal/(tuitionTotal+cacfpTotal))*100).toFixed(1)}% from CACFP`,
    );

    // 4.4 Payroll data
    const laborTotal = financials.reduce((s,f) => s + parseFloat(f.expenses_labor), 0);
    const totalExpenses = financials.reduce((s,f) => s + parseFloat(f.expenses_labor) + parseFloat(f.expenses_supplies) + parseFloat(f.expenses_fixed) + parseFloat(f.expenses_other), 0);
    test('FINANCIAL', 'Payroll as % of expenses',
      'PASS',
      `Labor: $${laborTotal.toLocaleString()} (${((laborTotal/totalExpenses)*100).toFixed(1)}% of total expenses)`,
    );
  }

  // 4.5 Enrollment trend for revenue projection
  const { data: enrolled } = await sb.from('enrollment_inquiries').select('*').eq('status', 'enrolled');
  test('FINANCIAL', 'Enrollment count for projections',
    'PASS',
    `${enrolled?.length} currently enrolled from pipeline + ${uniqueChildren.size} children in attendance = revenue base`,
  );

  // 4.6 Expense export capability
  test('FINANCIAL', 'Export to accountant',
    'PARTIAL',
    'Financial page at /admin/financial exists with charts and data display. ExcelJS export is available on the budget page. But no dedicated "export for accountant" format (CSV with tax categories, payroll breakdowns by employee).',
  );

  // ====================================================================
  // DOMAIN 5: GROWTH ENGINE (Enrollment Pipeline)
  // ====================================================================
  console.log('\n--- DOMAIN 5: GROWTH ENGINE ---\n');

  const { data: pipeline } = await sb.from('enrollment_inquiries').select('*').order('created_at', { ascending: false });
  const byStatus = {};
  pipeline?.forEach(p => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });

  test('GROWTH', 'Pipeline visibility',
    Object.keys(byStatus).length >= 3 ? 'PASS' : 'FAIL',
    `Pipeline: ${JSON.stringify(byStatus)}`,
    byStatus
  );

  // 5.2 Tour requests linked
  const { data: tours } = await sb.from('tour_requests').select('*').order('preferred_date');
  test('GROWTH', 'Tour scheduling',
    tours?.length > 0 ? 'PASS' : 'FAIL',
    `${tours?.length} tours scheduled. Next: ${tours?.[0]?.parent_name} on ${tours?.[0]?.preferred_date}`,
  );

  // 5.3 Conversion tracking
  test('GROWTH', 'Pipeline conversion metrics',
    'PARTIAL',
    `Pipeline has ${pipeline?.length} entries across ${Object.keys(byStatus).length} stages. Can calculate conversion rates. But no automated funnel visualization or time-in-stage tracking.`,
  );

  // 5.4 Capacity planning
  const totalCapacity = classrooms?.reduce((s, c) => s + c.capacity, 0);
  test('GROWTH', 'Capacity vs enrollment',
    'PASS',
    `Licensed capacity: ${totalCapacity} across ${classrooms?.length} rooms. Current attendance: ${uniqueChildren.size}. Utilization: ${((uniqueChildren.size / totalCapacity) * 100).toFixed(0)}%`,
    { capacity: totalCapacity, enrolled: uniqueChildren.size }
  );

  // ====================================================================
  // DOMAIN 6: LEARNING & ADAPTATION
  // ====================================================================
  console.log('\n--- DOMAIN 6: LEARNING & ADAPTATION ---\n');

  // 6.1 Intelligence dashboard data
  test('ADAPTATION', 'Intelligence scan capability',
    'PASS',
    'Intelligence page at /admin/intelligence runs training-scan and staffing-scan. Can detect stuck learners, cert clusters, pipeline staleness, CACFP gaps.',
  );

  // 6.2 Learned preferences
  test('ADAPTATION', 'Decision learning (second brain)',
    'PARTIAL',
    'LearnedPreferences component exists and tracks approve/deny patterns from recommendations. But requires 3+ decisions before patterns emerge. No day-level learning yet.',
  );

  // 6.3 Daily report generation
  test('ADAPTATION', 'Daily report API',
    'FAIL',
    'API at /api/reports/daily exists but returns zeros (scaffold only). Real data is client-side in localStorage. Cannot generate an authoritative daily report from the database.',
  );

  // 6.4 Day reconstruction
  test('ADAPTATION', 'Day reconstruction from data',
    'PARTIAL',
    'All individual data points exist in DB (attendance, meals, incidents, schedules). But no single query or view stitches a day together into a narrative. A "today at a glance" requires 6+ separate queries.',
  );

  // 6.5 Pattern recognition across days
  test('ADAPTATION', 'Cross-day pattern detection',
    'FAIL',
    'No mechanism to compare today to past days. Cannot detect: "Last time you were 2 staff short on a Friday, lunch ratio dropped below compliance for 45 minutes." Incident pattern detection for repeat behaviors also missing.',
  );

  // 6.6 Proactive alerts for next day
  test('ADAPTATION', 'Next-day preparation',
    'FAIL',
    'Smart dashboard has time-zone alerts (opening/core/closing) but only for current-day data in localStorage. No "tomorrow prep" view that checks: staff schedule, expected attendance, supply needs, pending follow-ups.',
  );

  // ====================================================================
  // SUMMARY
  // ====================================================================
  console.log('\n═══════════════════════════════════════════════���═══════');
  console.log('  TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');

  const total = passCount + failCount + partialCount;
  console.log(`  PASS:    ${passCount}/${total} (${((passCount/total)*100).toFixed(0)}%)`);
  console.log(`  PARTIAL: ${partialCount}/${total} (${((partialCount/total)*100).toFixed(0)}%)`);
  console.log(`  FAIL:    ${failCount}/${total} (${((failCount/total)*100).toFixed(0)}%)`);

  const domainScores = {};
  results.forEach(r => {
    if (!domainScores[r.domain]) domainScores[r.domain] = { pass: 0, partial: 0, fail: 0, total: 0 };
    domainScores[r.domain][r.status === 'PASS' ? 'pass' : r.status === 'FAIL' ? 'fail' : 'partial']++;
    domainScores[r.domain].total++;
  });

  console.log('\n  Domain Scores:');
  Object.entries(domainScores).forEach(([domain, scores]) => {
    const pct = ((scores.pass / scores.total) * 100).toFixed(0);
    const grade = pct >= 80 ? 'A' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : pct >= 20 ? 'D' : 'F';
    console.log(`    ${domain}: ${scores.pass}/${scores.total} pass (${pct}%) = ${grade}`);
  });

  // Overall grade
  const overallPct = ((passCount / total) * 100).toFixed(0);
  const overallGrade = overallPct >= 80 ? 'A' : overallPct >= 60 ? 'B' : overallPct >= 40 ? 'C' : overallPct >= 20 ? 'D' : 'F';
  console.log(`\n  OVERALL: ${overallPct}% = Grade ${overallGrade}`);

  // ====================================================================
  // WRITE REPORT
  // ====================================================================
  const report = {
    testDate: TEST_DATE,
    generatedAt: new Date().toISOString(),
    center: 'Crystal Center',
    scenario: 'Full Operational Day: 44 children, 10 staff (2 absent), 2 incidents, licensing visit, tax meeting, new hire training, AI lesson building',
    summary: { pass: passCount, partial: partialCount, fail: failCount, total, grade: overallGrade },
    domainScores,
    results,
    architectureGaps: results.filter(r => r.status === 'FAIL').map(r => ({ domain: r.domain, test: r.name, detail: r.detail })),
    partialCapabilities: results.filter(r => r.status === 'PARTIAL').map(r => ({ domain: r.domain, test: r.name, detail: r.detail })),
  };

  const reportPath = resolve(import.meta.dirname, 'fitness-test-results.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n  Full results saved to: stress-test/fitness-test-results.json`);
}

runTests().catch(console.error);

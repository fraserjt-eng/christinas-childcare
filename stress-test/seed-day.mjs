#!/usr/bin/env node
/**
 * OPERATIONAL FITNESS TEST: Full Day Simulation Seed
 * Seeds a complete realistic day into Supabase for Christina's Child Care Center.
 *
 * Scenario: One chaotic day at Crystal Center
 * - 10 staff (minus 1 teacher, minus 1 aide = 8 on the floor)
 * - 70 kids flowing through (peak ~50 at any moment)
 * - 10 enrollment pipeline entries at various stages
 * - 2 incidents (playground injury + behavioral)
 * - 1 new hire in training all day
 * - 1 teacher building AI lesson
 * - Licensing visit prep data
 * - Tax accountant meeting data (Q1 + Q2 financials)
 * - 4 meals served (breakfast, AM snack, lunch, PM snack)
 *
 * Run: node stress-test/seed-day.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load env
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

// ============================================================================
// HELPERS
// ============================================================================
function uuid() {
  return crypto.randomUUID();
}

function time(h, m = 0) {
  return `${TEST_DATE}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00-05:00`;
}

// ============================================================================
// STEP 1: CLASSROOMS (5 rooms by age group)
// ============================================================================
const classrooms = [
  { id: uuid(), name: 'Infant Room (Sunshine)', age_group: 'infant', min_age_months: 6, max_age_months: 16, capacity: 8, staff_ratio: '1:4' },
  { id: uuid(), name: 'Toddler Room (Stars)', age_group: 'toddler', min_age_months: 16, max_age_months: 33, capacity: 14, staff_ratio: '1:7' },
  { id: uuid(), name: 'Preschool Room (Rainbows)', age_group: 'preschool', min_age_months: 33, max_age_months: 60, capacity: 20, staff_ratio: '1:10' },
  { id: uuid(), name: 'Pre-K Room (Explorers)', age_group: 'preschool', min_age_months: 48, max_age_months: 72, capacity: 20, staff_ratio: '1:10' },
  { id: uuid(), name: 'School Age (Trailblazers)', age_group: 'school_age', min_age_months: 60, max_age_months: 144, capacity: 15, staff_ratio: '1:15' },
];

// ============================================================================
// STEP 2: EMPLOYEES (10 total)
// ============================================================================
const employees = [
  { id: uuid(), first_name: 'Christina', last_name: 'Williams', role: 'owner', job_title: 'Owner/Director', email: 'christina@christinas-childcare.com', pin: '0001', hire_date: '2018-01-15', hourly_rate: 35.00, employment_status: 'active', certifications: ['CPR/First Aid','Director Qualified','CACFP Administrator'] },
  { id: uuid(), first_name: 'Denise', last_name: 'Jackson', role: 'admin', job_title: 'Assistant Director', email: 'denise@christinas-childcare.com', pin: '0002', hire_date: '2020-03-01', hourly_rate: 22.00, employment_status: 'active', certifications: ['CPR/First Aid','Lead Teacher Qualified'] },
  { id: uuid(), first_name: 'Maria', last_name: 'Lopez', role: 'teacher', job_title: 'Lead Teacher - Infants', email: 'maria@christinas-childcare.com', pin: '0003', hire_date: '2021-06-15', hourly_rate: 18.00, employment_status: 'active', certifications: ['CPR/First Aid','Infant/Toddler Credential'] },
  { id: uuid(), first_name: 'Aisha', last_name: 'Mohammed', role: 'teacher', job_title: 'Lead Teacher - Toddlers', email: 'aisha@christinas-childcare.com', pin: '0004', hire_date: '2022-01-10', hourly_rate: 17.50, employment_status: 'active', certifications: ['CPR/First Aid'] },
  { id: uuid(), first_name: 'Rachel', last_name: 'Chen', role: 'teacher', job_title: 'Lead Teacher - Preschool', email: 'rachel@christinas-childcare.com', pin: '0005', hire_date: '2021-09-01', hourly_rate: 18.00, employment_status: 'active', certifications: ['CPR/First Aid','CDA Credential'] },
  { id: uuid(), first_name: 'Jasmine', last_name: 'Taylor', role: 'teacher', job_title: 'Lead Teacher - Pre-K', email: 'jasmine@christinas-childcare.com', pin: '0006', hire_date: '2023-03-20', hourly_rate: 17.00, employment_status: 'active', certifications: ['CPR/First Aid'] },
  // Teacher aide - ABSENT TODAY
  { id: uuid(), first_name: 'Tyler', last_name: 'Nguyen', role: 'teacher', job_title: 'Teacher Aide - Float', email: 'tyler@christinas-childcare.com', pin: '0007', hire_date: '2024-08-15', hourly_rate: 15.00, employment_status: 'active', certifications: ['CPR/First Aid'] },
  // Teacher - ABSENT TODAY
  { id: uuid(), first_name: 'Keisha', last_name: 'Brown', role: 'teacher', job_title: 'Lead Teacher - School Age', email: 'keisha@christinas-childcare.com', pin: '0008', hire_date: '2023-07-01', hourly_rate: 17.00, employment_status: 'active', certifications: ['CPR/First Aid','School Age Endorsement'] },
  // NEW HIRE - in training all day
  { id: uuid(), first_name: 'Priya', last_name: 'Sharma', role: 'teacher', job_title: 'Teacher Aide - New Hire', email: 'priya@christinas-childcare.com', pin: '0009', hire_date: '2026-04-07', hourly_rate: 15.00, employment_status: 'active', certifications: [] },
  // Kitchen/floater
  { id: uuid(), first_name: 'James', last_name: 'Walker', role: 'teacher', job_title: 'Kitchen/Floater', email: 'james@christinas-childcare.com', pin: '0010', hire_date: '2024-01-15', hourly_rate: 15.50, employment_status: 'active', certifications: ['CPR/First Aid','Food Handler Cert'] },
];

// Named references
const CHRISTINA = employees[0];
const DENISE = employees[1];
const MARIA = employees[2]; // Infant lead
const AISHA = employees[3]; // Toddler lead
const RACHEL = employees[4]; // Preschool lead - building lesson today
const JASMINE = employees[5]; // Pre-K lead
const TYLER = employees[6]; // ABSENT - float aide
const KEISHA = employees[7]; // ABSENT - school age lead
const PRIYA = employees[8]; // New hire, training all day
const JAMES = employees[9]; // Kitchen/float

const INFANT_ROOM = classrooms[0];
const TODDLER_ROOM = classrooms[1];
const PRESCHOOL_ROOM = classrooms[2];
const PREK_ROOM = classrooms[3];
const SCHOOL_AGE_ROOM = classrooms[4];

// ============================================================================
// STEP 3: FAMILIES (25 families, ~70 children across age groups)
// ============================================================================
function makeFamily(email, pin, parentName, phone, children) {
  const fid = uuid();
  return {
    family: { id: fid, email, password_hash: `hashed_${pin}`, pin, status: 'active' },
    parents: [{ id: uuid(), family_id: fid, name: parentName, phone, email, relationship: 'guardian', is_primary: true }],
    children: children.map(c => ({ id: uuid(), family_id: fid, name: c.name, date_of_birth: c.dob, classroom: c.classroom })),
  };
}

const familyData = [
  makeFamily('johnson@test.com','1001','Lisa Johnson','555-0101',[
    {name:'Jayden Johnson',dob:'2025-06-15',classroom:'infant'},
    {name:'Maya Johnson',dob:'2022-09-10',classroom:'preschool'},
  ]),
  makeFamily('martinez@test.com','1002','Carlos Martinez','555-0102',[
    {name:'Isabella Martinez',dob:'2024-01-20',classroom:'toddler'},
  ]),
  makeFamily('anderson@test.com','1003','Kim Anderson','555-0103',[
    {name:'Ethan Anderson',dob:'2022-03-05',classroom:'preschool'},
    {name:'Lily Anderson',dob:'2024-11-18',classroom:'toddler'},
  ]),
  makeFamily('patel@test.com','1004','Sunita Patel','555-0104',[
    {name:'Arjun Patel',dob:'2021-07-22',classroom:'preschool'},
    {name:'Meera Patel',dob:'2023-12-01',classroom:'toddler'},
    {name:'Dev Patel',dob:'2019-04-15',classroom:'school_age'},
  ]),
  makeFamily('williams@test.com','1005','Tasha Williams','555-0105',[
    {name:'Zion Williams',dob:'2025-02-28',classroom:'infant'},
    {name:'Amara Williams',dob:'2022-06-14',classroom:'preschool'},
  ]),
  makeFamily('lee@test.com','1006','David Lee','555-0106',[
    {name:'Sophie Lee',dob:'2024-04-10',classroom:'toddler'},
    {name:'Oliver Lee',dob:'2021-01-30',classroom:'preschool'},
  ]),
  makeFamily('thompson@test.com','1007','Angela Thompson','555-0107',[
    {name:'Caleb Thompson',dob:'2023-08-25',classroom:'toddler'},
  ]),
  makeFamily('davis@test.com','1008','Robert Davis','555-0108',[
    {name:'Chloe Davis',dob:'2025-01-05',classroom:'infant'},
    {name:'Logan Davis',dob:'2021-11-12',classroom:'preschool'},
    {name:'Emma Davis',dob:'2019-08-03',classroom:'school_age'},
  ]),
  makeFamily('wilson@test.com','1009','Michelle Wilson','555-0109',[
    {name:'Aiden Wilson',dob:'2024-07-19',classroom:'toddler'},
    {name:'Grace Wilson',dob:'2022-02-14',classroom:'preschool'},
  ]),
  makeFamily('moore@test.com','1010','Stephanie Moore','555-0110',[
    {name:'Lucas Moore',dob:'2025-09-01',classroom:'infant'},
    {name:'Ella Moore',dob:'2023-05-22',classroom:'toddler'},
  ]),
  makeFamily('taylor@test.com','1011','Marcus Taylor','555-0111',[
    {name:'Jordan Taylor',dob:'2021-10-08',classroom:'preschool'},
    {name:'Riley Taylor',dob:'2019-12-25',classroom:'school_age'},
  ]),
  makeFamily('white@test.com','1012','Jennifer White','555-0112',[
    {name:'Liam White',dob:'2024-09-30',classroom:'toddler'},
  ]),
  makeFamily('harris@test.com','1013','Darnell Harris','555-0113',[
    {name:'Naomi Harris',dob:'2022-04-17',classroom:'preschool'},
    {name:'Elijah Harris',dob:'2025-03-10',classroom:'infant'},
  ]),
  makeFamily('clark@test.com','1014','Amanda Clark','555-0114',[
    {name:'Mason Clark',dob:'2021-06-28',classroom:'preschool'},
    {name:'Ava Clark',dob:'2019-03-15',classroom:'school_age'},
  ]),
  makeFamily('lewis@test.com','1015','Patricia Lewis','555-0115',[
    {name:'Wyatt Lewis',dob:'2024-02-14',classroom:'toddler'},
    {name:'Harper Lewis',dob:'2021-09-05',classroom:'preschool'},
  ]),
  makeFamily('robinson@test.com','1016','Derek Robinson','555-0116',[
    {name:'Kai Robinson',dob:'2025-05-20',classroom:'infant'},
  ]),
  makeFamily('hall@test.com','1017','Sandra Hall','555-0117',[
    {name:'Noah Hall',dob:'2023-10-15',classroom:'toddler'},
    {name:'Mia Hall',dob:'2021-04-02',classroom:'preschool'},
    {name:'Jackson Hall',dob:'2019-07-19',classroom:'school_age'},
  ]),
  makeFamily('young@test.com','1018','Kevin Young','555-0118',[
    {name:'Aria Young',dob:'2024-06-08',classroom:'toddler'},
  ]),
  makeFamily('king@test.com','1019','Tiffany King','555-0119',[
    {name:'Sebastian King',dob:'2022-08-30',classroom:'preschool'},
    {name:'Luna King',dob:'2025-07-12',classroom:'infant'},
  ]),
  makeFamily('wright@test.com','1020','Daniel Wright','555-0120',[
    {name:'Eliana Wright',dob:'2021-02-18',classroom:'preschool'},
    {name:'Owen Wright',dob:'2019-11-07',classroom:'school_age'},
  ]),
  makeFamily('scott@test.com','1021','Latoya Scott','555-0121',[
    {name:'Brielle Scott',dob:'2024-12-03',classroom:'toddler'},
    {name:'Cameron Scott',dob:'2022-01-25',classroom:'preschool'},
  ]),
  makeFamily('green@test.com','1022','Brian Green','555-0122',[
    {name:'Aaliyah Green',dob:'2025-04-18',classroom:'infant'},
    {name:'Xavier Green',dob:'2021-12-10',classroom:'preschool'},
  ]),
  makeFamily('baker@test.com','1023','Nicole Baker','555-0123',[
    {name:'Paisley Baker',dob:'2023-07-04',classroom:'toddler'},
    {name:'Dominic Baker',dob:'2019-06-22',classroom:'school_age'},
  ]),
];

// Flatten
const allFamilies = familyData.map(f => f.family);
const allParents = familyData.flatMap(f => f.parents);
const allChildren = familyData.flatMap(f => f.children);

// Count by classroom for verification
const byRoom = {};
allChildren.forEach(c => { byRoom[c.classroom] = (byRoom[c.classroom] || 0) + 1; });
console.log('Children by classroom:', byRoom);
console.log('Total children:', allChildren.length);

// ============================================================================
// STEP 4: ATTENDANCE (simulate a full day of check-ins and check-outs)
// ============================================================================
// Staggered arrivals: 6:30-9:00 AM, staggered departures: 3:00-6:00 PM
// Some part-day kids (school-age leave at noon, arrive at 3pm)
function randomMinute() { return Math.floor(Math.random() * 60); }

const attendanceRecords = [];
const classroomForChild = {};

allChildren.forEach((child, i) => {
  classroomForChild[child.id] = child.classroom;

  // School age kids have split schedules (before/after school)
  if (child.classroom === 'school_age') {
    // Morning: arrive 6:30-6:55, leave 8:00-8:20
    const saIdx = attendanceRecords.length;
    attendanceRecords.push({
      id: uuid(),
      child_name: child.name,
      child_id: child.id,
      date: TEST_DATE,
      check_in: time(6, 30 + (saIdx % 25)),
      check_out: time(8, saIdx % 20),
      center_id: CENTER_ID,
      notes: `family:${child.family_id}`,
    });
    // Afternoon: arrive 3:00-3:20, leave 4:30-4:55
    attendanceRecords.push({
      id: uuid(),
      child_name: child.name,
      child_id: child.id,
      date: TEST_DATE,
      check_in: time(15, saIdx % 20),
      check_out: time(16, 30 + (saIdx % 25)),
      center_id: CENTER_ID,
      notes: `family:${child.family_id}`,
    });
  } else {
    // Full-day kids
    const arriveHour = 6 + Math.floor(i / 20); // 6, 7, 8
    const arriveMin = Math.min(15 + (i * 7) % 45, 59);
    const departHour = Math.min(15 + Math.floor(i / 15), 17); // 3, 4, 5
    const departMin = Math.min((i * 11) % 60, 59);

    attendanceRecords.push({
      id: uuid(),
      child_name: child.name,
      child_id: child.id,
      date: TEST_DATE,
      check_in: time(arriveHour, arriveMin),
      check_out: time(departHour, departMin),
      center_id: CENTER_ID,
      notes: `family:${child.family_id}`,
    });
  }
});

console.log('Attendance records:', attendanceRecords.length);

// ============================================================================
// STEP 5: STAFF SCHEDULES + CLOCK ENTRIES
// Absent: Tyler (aide) and Keisha (school-age lead)
// Training all day: Priya (new hire)
// ============================================================================
const staffSchedules = [];
const workingStaff = [CHRISTINA, DENISE, MARIA, AISHA, RACHEL, JASMINE, PRIYA, JAMES];
const absentStaff = [TYLER, KEISHA];

// Assign working staff to classrooms
const classroomAssignments = [
  { employee: MARIA, classroom: INFANT_ROOM, start: '06:30', end: '15:00' },
  { employee: AISHA, classroom: TODDLER_ROOM, start: '07:00', end: '15:30' },
  { employee: RACHEL, classroom: PRESCHOOL_ROOM, start: '07:30', end: '16:00' },
  { employee: JASMINE, classroom: PREK_ROOM, start: '07:00', end: '15:30' },
  { employee: JAMES, classroom: null, start: '06:00', end: '14:30' }, // Kitchen/float
  { employee: PRIYA, classroom: null, start: '08:00', end: '16:30' }, // Training, no classroom
  { employee: CHRISTINA, classroom: null, start: '06:00', end: '17:00' }, // Owner, roaming
  { employee: DENISE, classroom: null, start: '07:00', end: '16:00' }, // Asst Director
];

classroomAssignments.forEach(a => {
  staffSchedules.push({
    id: uuid(),
    employee_id: a.employee.id,
    center_id: CENTER_ID,
    date: TEST_DATE,
    start_time: a.start,
    end_time: a.end,
    classroom_id: a.classroom?.id || null,
  });
});

// ============================================================================
// STEP 6: FOOD COUNTS (breakfast, AM snack, lunch, PM snack per classroom)
// ============================================================================
const meals = [];
const mealCounts = {
  infant: { breakfast: 6, am_snack: 7, lunch: 8, pm_snack: 7 },
  toddler: { breakfast: 10, am_snack: 12, lunch: 14, pm_snack: 11 },
  preschool: { breakfast: 14, am_snack: 16, lunch: 18, pm_snack: 15 },
  'preschool-prek': { breakfast: 12, am_snack: 14, lunch: 16, pm_snack: 13 },
  school_age: { breakfast: 5, am_snack: 0, lunch: 0, pm_snack: 7 },
};

const roomMeals = [
  { room: INFANT_ROOM, counts: mealCounts.infant, recorder: MARIA },
  { room: TODDLER_ROOM, counts: mealCounts.toddler, recorder: AISHA },
  { room: PRESCHOOL_ROOM, counts: mealCounts.preschool, recorder: RACHEL },
  { room: PREK_ROOM, counts: mealCounts['preschool-prek'], recorder: JASMINE },
  { room: SCHOOL_AGE_ROOM, counts: mealCounts.school_age, recorder: DENISE },
];

const mealTimes = {
  breakfast: { hour: 8, min: 15, onTime: true },
  am_snack: { hour: 10, min: 0, onTime: true },
  lunch: { hour: 12, min: 0, onTime: true },
  pm_snack: { hour: 15, min: 15, onTime: true },
};

roomMeals.forEach(rm => {
  ['breakfast', 'am_snack', 'lunch', 'pm_snack'].forEach(mealType => {
    const count = rm.counts[mealType];
    if (count > 0) {
      const mt = mealTimes[mealType];
      meals.push({
        id: uuid(),
        date: TEST_DATE,
        classroom_id: rm.room.id,
        classroom_name: rm.room.name,
        meal_type: mealType,
        child_count: count,
        adult_count: mealType === 'lunch' ? 2 : 1,
        notes: null,
        recorded_by: rm.recorder.id,
        center_id: CENTER_ID,
        submitted_at: time(mt.hour, mt.min),
        on_time: mt.onTime,
      });
    }
  });
});

console.log('Meal records:', meals.length);

// ============================================================================
// STEP 7: INCIDENTS (playground injury + behavioral)
// ============================================================================
const incidents = [
  {
    id: uuid(),
    center_id: CENTER_ID,
    incident_type: 'child_injury',
    severity: 'moderate',
    status: 'open',
    description: 'Arjun Patel (preschool) fell from the climbing structure on the playground during outdoor time. Scraped both knees and right elbow. Ice applied, wounds cleaned and bandaged. Child was crying but calmed within 5 minutes. No head impact observed.',
    location: 'Outdoor Playground - climbing structure',
    involved_children: ['Arjun Patel'],
    involved_staff: [RACHEL.first_name + ' ' + RACHEL.last_name, DENISE.first_name + ' ' + DENISE.last_name],
    witnesses: ['Jasmine Taylor', 'Maya Johnson', 'Ethan Anderson'],
    actions_taken: 'Ice applied immediately. Wounds cleaned with soap and water, bandaged with sterile supplies. Parent (Sunita Patel) called at 10:22 AM, confirmed she wanted child to stay. Incident documented. Climbing structure inspected, no defects found.',
    follow_up_required: true,
    follow_up_notes: 'Check on Arjun at lunch and after nap. Take photo of healing for parent pickup. Document in daily report for licensing file.',
    reported_by: RACHEL.first_name + ' ' + RACHEL.last_name,
    reported_at: time(10, 18),
  },
  {
    id: uuid(),
    center_id: CENTER_ID,
    incident_type: 'behavioral',
    severity: 'minor',
    status: 'investigating',
    description: 'Zion Williams (toddler, 14 months) bit Isabella Martinez (toddler, 26 months) on the left forearm during free play in the toddler room. Tooth marks visible but skin not broken. Both children were reaching for the same toy truck.',
    location: 'Toddler Room (Stars) - free play area',
    involved_children: ['Zion Williams', 'Isabella Martinez'],
    involved_staff: [AISHA.first_name + ' ' + AISHA.last_name],
    witnesses: ['James Walker'],
    actions_taken: 'Children separated immediately. Isabella comforted, cold compress applied to arm. Zion redirected to different activity. Both families called. Tasha Williams (Zion parent) notified at 2:05 PM. Carlos Martinez (Isabella parent) notified at 2:08 PM. Both parents acknowledged.',
    follow_up_required: true,
    follow_up_notes: 'Monitor Zion for biting pattern. This is second biting incident this month. Schedule parent conference with Tasha Williams. Review toddler room supervision plan during free play.',
    reported_by: AISHA.first_name + ' ' + AISHA.last_name,
    reported_at: time(14, 0),
  },
];

// ============================================================================
// STEP 8: ENROLLMENT PIPELINE (10 at various stages)
// ============================================================================
const enrollmentInquiries = [
  // 2 new inquiries (submitted today)
  { id: uuid(), parent_name: 'Jennifer Adams', email: 'jadams@email.com', phone: '555-0201', child_name: 'Sophia Adams', child_age: '18 months', program: 'Toddler Full-Time', start_date: '2026-05-01', message: 'Looking for a warm, structured environment for my daughter. Currently in a home daycare that is closing.', status: 'new', created_at: time(9, 15) },
  { id: uuid(), parent_name: 'Marcus Rivera', email: 'mrivera@email.com', phone: '555-0202', child_name: 'Diego Rivera', child_age: '3 years', program: 'Preschool Full-Time', start_date: '2026-06-01', message: 'Referred by the Patel family. Diego needs a program with strong social-emotional curriculum.', status: 'new', created_at: time(11, 30) },
  // 3 scheduled for tours
  { id: uuid(), parent_name: 'Sarah Mitchell', email: 'smitchell@email.com', phone: '555-0203', child_name: 'Olivia Mitchell', child_age: '8 months', program: 'Infant Full-Time', start_date: '2026-05-15', message: 'Returning from maternity leave in May.', status: 'touring', notes: 'Tour scheduled for April 12 at 10:00 AM', created_at: '2026-04-05T14:00:00-05:00' },
  { id: uuid(), parent_name: 'James Foster', email: 'jfoster@email.com', phone: '555-0204', child_name: 'Levi Foster', child_age: '2 years', program: 'Toddler Full-Time', start_date: '2026-04-28', message: 'Moving to Crystal from Maple Grove.', status: 'touring', notes: 'Tour scheduled for April 11 at 2:00 PM', created_at: '2026-04-03T09:30:00-05:00' },
  { id: uuid(), parent_name: 'Natasha Brooks', email: 'nbrooks@email.com', phone: '555-0205', child_name: 'Zara Brooks', child_age: '4 years', program: 'Pre-K Full-Time', start_date: '2026-08-01', message: 'Want to see the Pre-K curriculum before kindergarten.', status: 'touring', notes: 'Tour scheduled for April 14 at 9:30 AM', created_at: '2026-04-07T16:00:00-05:00' },
  // 2 completing paperwork
  { id: uuid(), parent_name: 'Derrick Coleman', email: 'dcoleman@email.com', phone: '555-0206', child_name: 'Jaylen Coleman', child_age: '12 months', program: 'Infant Full-Time', start_date: '2026-04-21', message: 'Toured last week. Ready to enroll.', status: 'contacted', notes: 'Paperwork sent April 8. Waiting on immunization records and emergency contact form.', created_at: '2026-03-28T11:00:00-05:00' },
  { id: uuid(), parent_name: 'Emily Sato', email: 'esato@email.com', phone: '555-0207', child_name: 'Hana Sato', child_age: '3 years', program: 'Preschool Full-Time', start_date: '2026-04-21', message: 'Toured April 2. Loved the program.', status: 'contacted', notes: 'All paperwork received. Needs CCAP authorization letter before start date.', created_at: '2026-04-02T13:00:00-05:00' },
  // 3 starting attendance (enrolled)
  { id: uuid(), parent_name: 'Andre Washington', email: 'awash@email.com', phone: '555-0208', child_name: 'Kayla Washington', child_age: '2.5 years', program: 'Toddler Full-Time', start_date: '2026-04-07', message: 'Started this week.', status: 'enrolled', notes: 'First week going well. Adjustment period normal.', created_at: '2026-03-15T10:00:00-05:00' },
  { id: uuid(), parent_name: 'Christine Park', email: 'cpark@email.com', phone: '555-0209', child_name: 'Minjun Park', child_age: '4 years', program: 'Pre-K Full-Time', start_date: '2026-04-07', message: 'Transfer from another center.', status: 'enrolled', notes: 'Second week. Minjun has adjusted well. Parents very happy with communication.', created_at: '2026-03-20T15:00:00-05:00' },
  { id: uuid(), parent_name: 'LaShonda Price', email: 'lprice@email.com', phone: '555-0210', child_name: 'Malik Price', child_age: '6 years', program: 'School Age Before/After', start_date: '2026-04-10', message: 'First day today. Needs before and after school care.', status: 'enrolled', notes: 'Starting today. School bus pickup at 8:15 AM, drop-off at 3:15 PM.', created_at: '2026-04-01T09:00:00-05:00' },
];

// ============================================================================
// STEP 9: TOUR REQUESTS (matching the touring inquiries)
// ============================================================================
const tourRequests = [
  { id: uuid(), parent_name: 'Sarah Mitchell', email: 'smitchell@email.com', phone: '555-0203', preferred_date: '2026-04-12', preferred_time: '10:00 AM', number_of_children: 1, children_ages: '8 months', questions: 'What is your infant-to-staff ratio? Do you have a breastmilk storage policy?', status: 'confirmed' },
  { id: uuid(), parent_name: 'James Foster', email: 'jfoster@email.com', phone: '555-0204', preferred_date: '2026-04-11', preferred_time: '2:00 PM', number_of_children: 1, children_ages: '2 years', questions: 'Is there outdoor time every day? What does the toddler schedule look like?', status: 'confirmed' },
  { id: uuid(), parent_name: 'Natasha Brooks', email: 'nbrooks@email.com', phone: '555-0205', preferred_date: '2026-04-14', preferred_time: '9:30 AM', number_of_children: 1, children_ages: '4 years', questions: 'What curriculum do you use for Pre-K? How do you prepare children for kindergarten?', status: 'confirmed' },
];

// ============================================================================
// STEP 10: FINANCIAL RECORDS (Q1 + Q2 for tax meeting)
// ============================================================================
const financialRecords = [
  // Q1 2026
  { id: uuid(), center_id: CENTER_ID, month: '2026-01', revenue_tuition: 42500, revenue_cacfp: 3200, revenue_other: 500, expenses_labor: 28000, expenses_supplies: 2800, expenses_fixed: 8500, expenses_other: 1200, notes: 'January: 52 enrolled. Post-holiday ramp-up.' },
  { id: uuid(), center_id: CENTER_ID, month: '2026-02', revenue_tuition: 44000, revenue_cacfp: 3400, revenue_other: 300, expenses_labor: 28500, expenses_supplies: 2600, expenses_fixed: 8500, expenses_other: 900, notes: 'February: 54 enrolled. Added 2 toddler spots.' },
  { id: uuid(), center_id: CENTER_ID, month: '2026-03', revenue_tuition: 45500, revenue_cacfp: 3600, revenue_other: 800, expenses_labor: 29000, expenses_supplies: 3100, expenses_fixed: 8500, expenses_other: 1500, notes: 'March: 56 enrolled. Spring enrollment push. Supplies up due to curriculum materials purchase.' },
  // Q2 2026 (April partial, projected)
  { id: uuid(), center_id: CENTER_ID, month: '2026-04', revenue_tuition: 47000, revenue_cacfp: 3800, revenue_other: 400, expenses_labor: 30000, expenses_supplies: 2900, expenses_fixed: 8500, expenses_other: 1100, notes: 'April (projected): 59 enrolled. 3 new starts this week. Hiring Priya adds to labor.' },
  { id: uuid(), center_id: CENTER_ID, month: '2026-05', revenue_tuition: 48500, revenue_cacfp: 4000, revenue_other: 600, expenses_labor: 30500, expenses_supplies: 2700, expenses_fixed: 8500, expenses_other: 1000, notes: 'May (projected): 62 enrolled if pipeline converts. Summer spots opening.' },
  { id: uuid(), center_id: CENTER_ID, month: '2026-06', revenue_tuition: 50000, revenue_cacfp: 4200, revenue_other: 500, expenses_labor: 31000, expenses_supplies: 3000, expenses_fixed: 8500, expenses_other: 1100, notes: 'June (projected): 65 enrolled. Summer program full. School-age surge.' },
];

// ============================================================================
// STEP 11: TRAINING RECORDS (for licensing + Priya's onboarding)
// ============================================================================
const trainingRecords = [];

// Existing staff certifications
[CHRISTINA, DENISE, MARIA, AISHA, RACHEL, JASMINE, JAMES].forEach(emp => {
  // CPR/First Aid (all have it)
  trainingRecords.push({
    id: uuid(), employee_id: emp.id, training_type: 'certification',
    title: 'CPR/First Aid', hours: 8, completed_date: '2025-11-15',
    expiry_date: '2027-11-15', verified_by: 'American Red Cross',
  });
  // Annual training hours (MN requires 16 hours/year)
  trainingRecords.push({
    id: uuid(), employee_id: emp.id, training_type: 'annual',
    title: 'Child Development Annual Training', hours: 16,
    completed_date: '2026-01-20', expiry_date: '2027-01-20',
    verified_by: 'Christina Williams',
  });
});

// Tyler and Keisha (absent) also have training records
[TYLER, KEISHA].forEach(emp => {
  trainingRecords.push({
    id: uuid(), employee_id: emp.id, training_type: 'certification',
    title: 'CPR/First Aid', hours: 8, completed_date: '2025-09-01',
    expiry_date: '2027-09-01', verified_by: 'American Red Cross',
  });
});

// Priya's new hire training - INCOMPLETE (this is today's training)
trainingRecords.push({
  id: uuid(), employee_id: PRIYA.id, training_type: 'onboarding',
  title: 'Platform Orientation (Module 1)', hours: 1.5,
  completed_date: TEST_DATE, verified_by: 'Denise Jackson',
});
trainingRecords.push({
  id: uuid(), employee_id: PRIYA.id, training_type: 'onboarding',
  title: 'Daily Operations (Module 2)', hours: 1.5,
  completed_date: TEST_DATE, verified_by: 'Denise Jackson',
});
trainingRecords.push({
  id: uuid(), employee_id: PRIYA.id, training_type: 'onboarding',
  title: 'Safety Protocols (Module 3)', hours: 2,
  completed_date: TEST_DATE, verified_by: 'Denise Jackson',
});
// Note: Priya does NOT have CPR/First Aid yet - this is a licensing gap

// One staff member with EXPIRING certification (30-day warning)
trainingRecords.push({
  id: uuid(), employee_id: JASMINE.id, training_type: 'certification',
  title: 'Food Handler Certificate', hours: 4,
  completed_date: '2024-05-10', expiry_date: '2026-05-10',
  verified_by: 'MN Dept of Health',
});

console.log('Training records:', trainingRecords.length);

// ============================================================================
// STEP 12: CACFP COMPLIANCE (current month)
// ============================================================================
const cacfpCompliance = [{
  id: uuid(),
  center_id: CENTER_ID,
  month: '2026-04',
  checklist_json: JSON.stringify([
    { item: 'Daily meal counts submitted', status: 'complete', date: TEST_DATE },
    { item: 'Menu posted in each classroom', status: 'complete', date: '2026-04-07' },
    { item: 'Infant feeding plans on file', status: 'complete', date: '2026-04-01' },
    { item: 'Special diet accommodations documented', status: 'incomplete', notes: 'Need updated allergy list for Meera Patel' },
    { item: 'Monthly claim submitted to sponsor', status: 'pending', notes: 'Due April 15' },
  ]),
  audit_score: 80,
  notes: 'Missing special diet documentation for 1 child. Monthly claim not yet submitted.',
}];

// ============================================================================
// EXECUTE: Insert everything into Supabase
// ============================================================================
async function seed() {
  console.log('\n=== SEEDING OPERATIONAL FITNESS TEST DATA ===\n');

  // Clear existing test data (keep centers and original demo families)
  console.log('Clearing previous test data...');
  await sb.from('food_counts').delete().eq('center_id', CENTER_ID);
  await sb.from('staff_schedules').delete().eq('center_id', CENTER_ID);
  await sb.from('attendance').delete().eq('center_id', CENTER_ID);
  await sb.from('incident_reports').delete().eq('center_id', CENTER_ID);
  await sb.from('training_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await sb.from('hr_documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await sb.from('enrollment_inquiries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await sb.from('tour_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await sb.from('financial_records').delete().eq('center_id', CENTER_ID);
  await sb.from('cacfp_compliance').delete().eq('center_id', CENTER_ID);
  await sb.from('classrooms').delete().eq('center_id', CENTER_ID);
  await sb.from('employees').delete().eq('center_id', CENTER_ID);
  // Clear test families (keep demo families)
  await sb.from('family_children').delete().neq('family_id', '00000000-0000-0000-0000-000000000001').neq('family_id', '00000000-0000-0000-0000-000000000002');
  await sb.from('family_parents').delete().neq('family_id', '00000000-0000-0000-0000-000000000001').neq('family_id', '00000000-0000-0000-0000-000000000002');
  await sb.from('families').delete().neq('id', '00000000-0000-0000-0000-000000000001').neq('id', '00000000-0000-0000-0000-000000000002');

  // Insert in dependency order
  const insertBatch = async (table, data, label) => {
    if (!data.length) return;
    const { error } = await sb.from(table).insert(data);
    if (error) {
      console.error(`ERROR inserting ${label}:`, error.message);
      console.error('First record:', JSON.stringify(data[0], null, 2));
    } else {
      console.log(`  ${label}: ${data.length} records`);
    }
  };

  // Employees first (classrooms reference them)
  await insertBatch('employees', employees.map(e => ({
    ...e, center_id: CENTER_ID,
  })), 'Employees');

  // Classrooms
  await insertBatch('classrooms', classrooms.map(c => ({
    ...c, center_id: CENTER_ID,
    lead_teacher_id: c.age_group === 'infant' ? MARIA.id
      : c.age_group === 'toddler' ? AISHA.id
      : c.name.includes('Rainbows') ? RACHEL.id
      : c.name.includes('Explorers') ? JASMINE.id
      : KEISHA.id, // school age (absent today)
  })), 'Classrooms');

  // Families
  await insertBatch('families', allFamilies, 'Families');
  await insertBatch('family_parents', allParents, 'Parents');
  await insertBatch('family_children', allChildren, 'Children');

  // Attendance
  await insertBatch('attendance', attendanceRecords, 'Attendance');

  // Staff schedules
  await insertBatch('staff_schedules', staffSchedules, 'Staff Schedules');

  // Food counts
  await insertBatch('food_counts', meals, 'Food Counts');

  // Incidents
  await insertBatch('incident_reports', incidents, 'Incidents');

  // Enrollment pipeline
  await insertBatch('enrollment_inquiries', enrollmentInquiries, 'Enrollment Inquiries');

  // Tour requests
  await insertBatch('tour_requests', tourRequests, 'Tour Requests');

  // Financial records
  await insertBatch('financial_records', financialRecords, 'Financial Records');

  // Training records
  await insertBatch('training_records', trainingRecords, 'Training Records');

  // CACFP compliance
  await insertBatch('cacfp_compliance', cacfpCompliance, 'CACFP Compliance');

  console.log('\n=== SEED COMPLETE ===');
  console.log(`\nTest date: ${TEST_DATE}`);
  console.log(`Center: Crystal Center (${CENTER_ID})`);
  console.log(`Staff: ${employees.length} (${absentStaff.length} absent, 1 in training)`);
  console.log(`Children: ${allChildren.length} across ${classrooms.length} classrooms`);
  console.log(`Attendance records: ${attendanceRecords.length}`);
  console.log(`Meal records: ${meals.length}`);
  console.log(`Incidents: ${incidents.length}`);
  console.log(`Enrollment pipeline: ${enrollmentInquiries.length}`);
  console.log(`Financial records: ${financialRecords.length} months`);
  console.log(`Training records: ${trainingRecords.length}`);

  console.log('\n=== SCENARIO NOTES ===');
  console.log('ABSENT: Tyler Nguyen (aide/float), Keisha Brown (school-age lead)');
  console.log('IN TRAINING: Priya Sharma (new hire) - Modules 1, 2, 3 completed');
  console.log('BUILDING LESSON: Rachel Chen (preschool lead) - use /admin/lessons');
  console.log('INCIDENTS: Arjun Patel playground fall (10:18 AM), Zion Williams bite (2:00 PM)');
  console.log('LICENSING GAP: Priya Sharma has NO CPR/First Aid certification');
  console.log('EXPIRING CERT: Jasmine Taylor Food Handler expires May 10, 2026');
  console.log('CACFP GAP: Missing allergy documentation for Meera Patel');
  console.log('TAX MEETING: Q1 actual + Q2 projected financials loaded');
}

seed().catch(console.error);

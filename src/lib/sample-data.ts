import { Center, Classroom, Child, Inquiry, CurriculumUnit, ProgressReport, StrategicPlan, Event, Attendance, FoodCount, StaffSchedule, User } from '@/types/database';

export const sampleCenter: Center = {
  id: '1',
  name: "Christina's Child Care Center",
  address: '1234 Sunshine Lane, Springfield, IL 62701',
  phone: '(217) 555-0123',
  email: 'info@christinaschildcare.com',
  license_number: 'IL-DCFS-2024-0456',
  capacity: 75,
  is_active: true,
};

export const sampleClassrooms: Classroom[] = [
  { id: '1', center_id: '1', name: 'Little Stars', age_group: 'infant', min_age_months: 6, max_age_months: 12, capacity: 8, staff_ratio: '1:4', lead_teacher_id: '2' },
  { id: '2', center_id: '1', name: 'Busy Bees', age_group: 'toddler', min_age_months: 12, max_age_months: 24, capacity: 12, staff_ratio: '1:5', lead_teacher_id: '3' },
  { id: '3', center_id: '1', name: 'Curious Cubs', age_group: 'toddler', min_age_months: 24, max_age_months: 36, capacity: 12, staff_ratio: '1:5', lead_teacher_id: '4' },
  { id: '4', center_id: '1', name: 'Bright Butterflies', age_group: 'preschool', min_age_months: 36, max_age_months: 48, capacity: 18, staff_ratio: '1:8', lead_teacher_id: '5' },
  { id: '5', center_id: '1', name: 'Rising Stars', age_group: 'preschool', min_age_months: 48, max_age_months: 60, capacity: 20, staff_ratio: '1:10', lead_teacher_id: '6' },
  { id: '6', center_id: '1', name: 'Adventure Club', age_group: 'school_age', min_age_months: 60, max_age_months: 144, capacity: 15, staff_ratio: '1:12', lead_teacher_id: '7' },
];

export const sampleStaff: User[] = [
  { id: '1', email: 'christina@christinaschildcare.com', full_name: 'Christina Walker', role: 'owner', created_at: '2020-01-15' },
  { id: '2', email: 'maria@christinaschildcare.com', full_name: 'Maria Santos', role: 'teacher', created_at: '2021-03-10' },
  { id: '3', email: 'james@christinaschildcare.com', full_name: 'James Robinson', role: 'teacher', created_at: '2021-06-01' },
  { id: '4', email: 'sarah@christinaschildcare.com', full_name: 'Sarah Mitchell', role: 'teacher', created_at: '2022-01-15' },
  { id: '5', email: 'devon@christinaschildcare.com', full_name: 'Devon Park', role: 'teacher', created_at: '2022-08-20' },
  { id: '6', email: 'linda@christinaschildcare.com', full_name: 'Linda Chen', role: 'teacher', created_at: '2023-02-01' },
  { id: '7', email: 'marcus@christinaschildcare.com', full_name: 'Marcus Johnson', role: 'teacher', created_at: '2023-05-15' },
  { id: '8', email: 'admin@christinaschildcare.com', full_name: 'Patricia Hughes', role: 'admin', created_at: '2020-06-01' },
];

export const sampleChildren: Child[] = [
  { id: '1', first_name: 'Emma', last_name: 'Thompson', date_of_birth: '2024-03-15', classroom_id: '1', emergency_contact: 'David Thompson', emergency_phone: '(217) 555-0201', enrolled_date: '2024-09-01', status: 'active' },
  { id: '2', first_name: 'Liam', last_name: 'Garcia', date_of_birth: '2023-11-20', classroom_id: '2', allergies: 'Peanuts', emergency_contact: 'Sofia Garcia', emergency_phone: '(217) 555-0202', enrolled_date: '2024-06-15', status: 'active' },
  { id: '3', first_name: 'Olivia', last_name: 'Williams', date_of_birth: '2023-05-08', classroom_id: '3', emergency_contact: 'Marcus Williams', emergency_phone: '(217) 555-0203', enrolled_date: '2024-01-10', status: 'active' },
  { id: '4', first_name: 'Noah', last_name: 'Brown', date_of_birth: '2022-09-12', classroom_id: '4', emergency_contact: 'Angela Brown', emergency_phone: '(217) 555-0204', enrolled_date: '2023-09-01', status: 'active' },
  { id: '5', first_name: 'Ava', last_name: 'Davis', date_of_birth: '2022-01-25', classroom_id: '5', emergency_contact: 'Robert Davis', emergency_phone: '(217) 555-0205', enrolled_date: '2023-01-15', status: 'active' },
  { id: '6', first_name: 'Sophia', last_name: 'Martinez', date_of_birth: '2020-07-03', classroom_id: '6', emergency_contact: 'Elena Martinez', emergency_phone: '(217) 555-0206', enrolled_date: '2023-06-01', status: 'active' },
  { id: '7', first_name: 'Jackson', last_name: 'Anderson', date_of_birth: '2024-01-10', classroom_id: '1', emergency_contact: 'Karen Anderson', emergency_phone: '(217) 555-0207', enrolled_date: '2024-07-01', status: 'active' },
  { id: '8', first_name: 'Isabella', last_name: 'Taylor', date_of_birth: '2023-08-22', classroom_id: '2', emergency_contact: 'Michael Taylor', emergency_phone: '(217) 555-0208', enrolled_date: '2024-03-15', status: 'active' },
  { id: '9', first_name: 'Aiden', last_name: 'Thomas', date_of_birth: '2023-02-14', classroom_id: '3', allergies: 'Dairy', emergency_contact: 'Jessica Thomas', emergency_phone: '(217) 555-0209', enrolled_date: '2024-01-20', status: 'active' },
  { id: '10', first_name: 'Mia', last_name: 'Jackson', date_of_birth: '2022-06-30', classroom_id: '4', emergency_contact: 'Derek Jackson', emergency_phone: '(217) 555-0210', enrolled_date: '2023-08-01', status: 'active' },
];

export const sampleInquiries: Inquiry[] = [
  { id: '1', parent_name: 'Jennifer Lee', email: 'jennifer@example.com', phone: '(217) 555-0301', child_name: 'Ryan Lee', child_age: '18 months', preferred_start: '2026-03-01', program_interest: 'toddler', message: 'Looking for full-time care. We heard great things about your program!', status: 'new', created_at: '2026-01-25' },
  { id: '2', parent_name: 'Carlos Rivera', email: 'carlos@example.com', phone: '(217) 555-0302', child_name: 'Luna Rivera', child_age: '3 years', preferred_start: '2026-02-15', program_interest: 'preschool', status: 'toured', created_at: '2026-01-20' },
  { id: '3', parent_name: 'Aisha Johnson', email: 'aisha@example.com', phone: '(217) 555-0303', child_name: 'Zara Johnson', child_age: '8 months', preferred_start: '2026-04-01', program_interest: 'infant', message: 'First-time parent. Would love to schedule a tour.', status: 'contacted', created_at: '2026-01-22' },
];

export const sampleCurriculum: CurriculumUnit[] = [
  {
    id: '1', title: 'Exploring Our Senses', age_group: 'infant', duration_weeks: 2,
    description: 'Babies explore the world through sensory experiences including touch, sight, sound, and movement.',
    objectives: ['Develop sensory awareness', 'Strengthen motor skills', 'Build caregiver-child bonds', 'Encourage curiosity'],
    materials: ['Textured fabrics', 'Musical instruments', 'Colored scarves', 'Safe mirrors', 'Sensory bottles'],
    activities: [
      { id: '1a', unit_id: '1', title: 'Texture Discovery Bin', description: 'Supervised exploration of varied textures', duration_minutes: 15, domain: 'cognitive' },
      { id: '1b', unit_id: '1', title: 'Musical Shakers', description: 'Shake and listen to different sounds', duration_minutes: 10, domain: 'creative' },
      { id: '1c', unit_id: '1', title: 'Mirror Play', description: 'Self-recognition and facial expressions', duration_minutes: 10, domain: 'social_emotional' },
    ],
  },
  {
    id: '2', title: 'Colors All Around', age_group: 'toddler', duration_weeks: 2,
    description: 'Toddlers discover colors through art, nature walks, sorting activities, and creative play.',
    objectives: ['Identify primary colors', 'Develop fine motor skills', 'Expand vocabulary', 'Encourage creative expression'],
    materials: ['Finger paints', 'Colored blocks', 'Nature items', 'Color sorting trays', 'Crayons'],
    activities: [
      { id: '2a', unit_id: '2', title: 'Color Sorting Game', description: 'Sort objects by color into matching bins', duration_minutes: 20, domain: 'cognitive' },
      { id: '2b', unit_id: '2', title: 'Finger Painting Fun', description: 'Free-form painting with primary colors', duration_minutes: 25, domain: 'creative' },
      { id: '2c', unit_id: '2', title: 'Color Walk', description: 'Outdoor walk to find colors in nature', duration_minutes: 20, domain: 'physical' },
    ],
  },
  {
    id: '3', title: 'Community Helpers', age_group: 'preschool', duration_weeks: 3,
    description: 'Children learn about people who help in our community through role-play, stories, and visitor activities.',
    objectives: ['Understand community roles', 'Build social awareness', 'Develop communication skills', 'Practice role-playing'],
    materials: ['Dress-up costumes', 'Picture books', 'Toy tools', 'Art supplies', 'Puppets'],
    activities: [
      { id: '3a', unit_id: '3', title: 'Firefighter Dress-Up', description: 'Role-play as firefighters with props', duration_minutes: 30, domain: 'social_emotional' },
      { id: '3b', unit_id: '3', title: 'Thank You Cards', description: 'Create thank you cards for community helpers', duration_minutes: 25, domain: 'language' },
      { id: '3c', unit_id: '3', title: 'Helper Matching Game', description: 'Match community helpers to their tools', duration_minutes: 20, domain: 'cognitive' },
    ],
  },
  {
    id: '4', title: 'STEM Explorers', age_group: 'school_age', duration_weeks: 4,
    description: 'School-age children engage in hands-on science, technology, engineering, and math challenges.',
    objectives: ['Apply scientific method', 'Develop problem-solving', 'Work collaboratively', 'Build engineering skills'],
    materials: ['Building blocks', 'Magnifying glasses', 'Measuring tools', 'Recyclable materials', 'Tablets'],
    activities: [
      { id: '4a', unit_id: '4', title: 'Bridge Building Challenge', description: 'Design and build bridges from craft materials', duration_minutes: 45, domain: 'cognitive' },
      { id: '4b', unit_id: '4', title: 'Nature Journal', description: 'Observe and record outdoor discoveries', duration_minutes: 30, domain: 'language' },
      { id: '4c', unit_id: '4', title: 'Coding Basics', description: 'Introduction to block-based coding', duration_minutes: 40, domain: 'cognitive' },
    ],
  },
];

export const sampleProgressReports: ProgressReport[] = [
  {
    id: '1', child_id: '4', teacher_id: '5', date: '2026-01-15', period: 'January 2026',
    milestones: [
      { area: 'Language', milestone: 'Uses complete sentences', status: 'achieved' },
      { area: 'Social', milestone: 'Shares with peers independently', status: 'developing' },
      { area: 'Motor', milestone: 'Holds pencil with correct grip', status: 'achieved' },
      { area: 'Cognitive', milestone: 'Counts to 20', status: 'developing' },
      { area: 'Creative', milestone: 'Draws recognizable figures', status: 'emerging' },
    ],
    notes: 'Noah is making wonderful progress this month. He loves story time and is beginning to retell stories with increasing detail. Working on sharing during group activities.',
    shared_with_parents: true,
  },
  {
    id: '2', child_id: '5', teacher_id: '6', date: '2026-01-15', period: 'January 2026',
    milestones: [
      { area: 'Language', milestone: 'Recognizes written name', status: 'achieved' },
      { area: 'Social', milestone: 'Leads group activities', status: 'achieved' },
      { area: 'Motor', milestone: 'Cuts with scissors on a line', status: 'developing' },
      { area: 'Cognitive', milestone: 'Sorts by multiple attributes', status: 'achieved' },
      { area: 'Creative', milestone: 'Creates detailed artwork', status: 'developing' },
    ],
    notes: 'Ava is a natural leader in the classroom. She helps younger friends and shows great enthusiasm for learning. Continuing to develop fine motor control.',
    shared_with_parents: true,
  },
];

export const sampleStrategicPlan: StrategicPlan = {
  id: '1', center_id: '1',
  mission: 'To provide a safe, nurturing, and enriching environment where every child can learn, grow, and thrive through play-based education and compassionate care.',
  vision: 'To be the premier child care center in Springfield, known for excellence in early childhood education, family engagement, and innovative programming that prepares children for lifelong success.',
  values: ['Safety & Well-being', 'Respect & Inclusion', 'Play-Based Learning', 'Family Partnership', 'Continuous Improvement', 'Community Connection'],
  swot: {
    strengths: ['Experienced, dedicated staff', 'Strong community reputation', 'Play-based curriculum', 'High parent satisfaction', 'DCFS excellent rating'],
    weaknesses: ['Limited outdoor space', 'Aging facility infrastructure', 'Staff retention challenges', 'Manual administrative processes', 'Waitlist management'],
    opportunities: ['Second location expansion', 'CACFP program enrollment', 'Digital parent engagement', 'Partnership with local schools', 'Grant funding availability'],
    threats: ['Rising operational costs', 'Competition from franchise centers', 'Regulatory changes', 'Staff recruitment market', 'Economic uncertainty'],
  },
  priorities: [
    { title: 'Digital Transformation', description: 'Implement comprehensive digital platform for parent engagement, operations, and curriculum management', timeline: 'Q1-Q2 2026', status: 'in_progress' },
    { title: 'Second Location Planning', description: 'Complete feasibility study and business plan for Center 2', timeline: 'Q2-Q3 2026', status: 'planned' },
    { title: 'Staff Development Program', description: 'Launch professional development program with mentoring and certification support', timeline: 'Q1-Q4 2026', status: 'planned' },
    { title: 'Facility Improvements', description: 'Upgrade outdoor play area and update infant room', timeline: 'Q3-Q4 2026', status: 'planned' },
  ],
  updated_at: '2026-01-20',
};

export const sampleEvents: Event[] = [
  { id: '1', center_id: '1', title: 'MLK Day - Closed', date: '2026-01-19', type: 'holiday' },
  { id: '2', center_id: '1', title: 'Parent-Teacher Conferences', date: '2026-02-05', time: '4:00 PM - 7:00 PM', type: 'meeting', description: 'Individual conferences with each family' },
  { id: '3', center_id: '1', title: 'Valentine\'s Day Party', date: '2026-02-14', time: '10:00 AM', type: 'event', description: 'Classroom celebrations with card exchange' },
  { id: '4', center_id: '1', title: 'Presidents Day - Closed', date: '2026-02-16', type: 'holiday' },
  { id: '5', center_id: '1', title: 'Spring Re-enrollment Deadline', date: '2026-03-01', type: 'deadline' },
  { id: '6', center_id: '1', title: 'Dr. Seuss Week', date: '2026-03-02', type: 'event', description: 'A week of literacy-focused activities' },
  { id: '7', center_id: '1', title: 'Spring Break', date: '2026-03-23', type: 'holiday' },
  { id: '8', center_id: '1', title: 'Staff Professional Development', date: '2026-02-20', time: '9:00 AM - 3:00 PM', type: 'meeting' },
];

export const sampleAttendance: Attendance[] = [
  { id: '1', child_id: '1', date: '2026-01-27', check_in: '7:45 AM', check_out: undefined, checked_in_by: 'David Thompson' },
  { id: '2', child_id: '2', date: '2026-01-27', check_in: '8:00 AM', check_out: undefined, checked_in_by: 'Sofia Garcia' },
  { id: '3', child_id: '3', date: '2026-01-27', check_in: '7:30 AM', check_out: undefined, checked_in_by: 'Marcus Williams' },
  { id: '4', child_id: '4', date: '2026-01-27', check_in: '8:15 AM', check_out: undefined, checked_in_by: 'Angela Brown' },
  { id: '5', child_id: '5', date: '2026-01-27', check_in: '7:50 AM', check_out: undefined, checked_in_by: 'Robert Davis' },
  { id: '6', child_id: '6', date: '2026-01-27', check_in: '7:30 AM', check_out: undefined },
  { id: '7', child_id: '7', date: '2026-01-27', check_in: '8:30 AM', check_out: undefined, checked_in_by: 'Karen Anderson' },
  { id: '8', child_id: '8', date: '2026-01-27', check_in: '8:05 AM', check_out: undefined, checked_in_by: 'Michael Taylor' },
];

export const sampleFoodCounts: FoodCount[] = [
  { id: '1', classroom_id: '1', date: '2026-01-27', meal_type: 'breakfast', count: 6, recorded_by: 'Maria Santos' },
  { id: '2', classroom_id: '2', date: '2026-01-27', meal_type: 'breakfast', count: 10, recorded_by: 'James Robinson' },
  { id: '3', classroom_id: '3', date: '2026-01-27', meal_type: 'breakfast', count: 9, recorded_by: 'Sarah Mitchell' },
  { id: '4', classroom_id: '4', date: '2026-01-27', meal_type: 'breakfast', count: 15, recorded_by: 'Devon Park' },
  { id: '5', classroom_id: '5', date: '2026-01-27', meal_type: 'breakfast', count: 17, recorded_by: 'Linda Chen' },
  { id: '6', classroom_id: '6', date: '2026-01-27', meal_type: 'breakfast', count: 8, recorded_by: 'Marcus Johnson' },
];

export const sampleSchedule: StaffSchedule[] = [
  { id: '1', user_id: '2', center_id: '1', date: '2026-01-27', start_time: '7:00 AM', end_time: '3:00 PM', classroom_id: '1' },
  { id: '2', user_id: '3', center_id: '1', date: '2026-01-27', start_time: '7:00 AM', end_time: '3:00 PM', classroom_id: '2' },
  { id: '3', user_id: '4', center_id: '1', date: '2026-01-27', start_time: '8:00 AM', end_time: '4:00 PM', classroom_id: '3' },
  { id: '4', user_id: '5', center_id: '1', date: '2026-01-27', start_time: '8:00 AM', end_time: '4:00 PM', classroom_id: '4' },
  { id: '5', user_id: '6', center_id: '1', date: '2026-01-27', start_time: '9:00 AM', end_time: '5:00 PM', classroom_id: '5' },
  { id: '6', user_id: '7', center_id: '1', date: '2026-01-27', start_time: '10:00 AM', end_time: '6:00 PM', classroom_id: '6' },
  { id: '7', user_id: '8', center_id: '1', date: '2026-01-27', start_time: '8:00 AM', end_time: '4:00 PM' },
];

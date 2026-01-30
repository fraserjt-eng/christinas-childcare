'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Lightbulb,
  BookOpen,
  Users,
  Calendar,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

type GuideSection = {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  steps: {
    title: string;
    content: string;
    tip?: string;
    warning?: string;
  }[];
};

const guides: GuideSection[] = [
  {
    id: 'lesson-builder',
    title: 'AI Lesson Builder',
    icon: Lightbulb,
    description: 'Create complete lesson plans in minutes using AI assistance',
    steps: [
      {
        title: 'Step 1: Navigate to Lesson Builder',
        content: 'From the admin dashboard, click "Lessons" in the left sidebar. This opens the Lesson Builder page where you can create new lessons, view your library, remix existing lessons, and see analytics.',
        tip: 'Bookmark this page for quick access if you create lessons frequently.',
      },
      {
        title: 'Step 2: Select Age Group',
        content: 'Click the "Age Group" dropdown and select the appropriate age range for your lesson: Infant (6 weeks - 16 months), Toddler (16-33 months), Preschool (33 months - 5 years), or School Age (5-12 years). The AI will tailor activities, vocabulary, and complexity based on this selection.',
        tip: 'Not sure which age group? The AI adapts well, so choose the primary target group. You can always remix for other ages later.',
      },
      {
        title: 'Step 3: Enter Your Topic',
        content: 'Type your lesson topic in the topic field. Be as specific or general as you like. Examples: "Weather and Seasons", "Counting to 10", "Community Helpers", "Butterflies and Life Cycles", "Colors and Shapes".',
        tip: 'More specific topics yield more focused lessons. "Red things in nature" will be more targeted than just "Colors".',
      },
      {
        title: 'Step 4: Choose Learning Domain',
        content: 'Select the primary learning domain: Cognitive Development, Language & Literacy, Physical Development, Social-Emotional, or Creative Arts. This helps the AI emphasize the right type of activities.',
      },
      {
        title: 'Step 5: Set Duration',
        content: 'Choose how long the lesson should run: 15, 30, 45, or 60 minutes. The AI will adjust the number and depth of activities accordingly.',
        warning: 'For infants and young toddlers, shorter durations (15-30 min) work best due to attention spans.',
      },
      {
        title: 'Step 6: Add Context (Optional)',
        content: 'Use the "Additional Context" field to give the AI more guidance. Examples: "Focus on outdoor activities", "Include a cooking activity", "Tie into our farm field trip next week", "Child in class has nut allergy".',
      },
      {
        title: 'Step 7: Generate the Lesson',
        content: 'Click the "Generate with AI" button. The AI will create a complete lesson plan including: learning objectives, materials needed, step-by-step activities, discussion questions, and assessment ideas. This typically takes 10-30 seconds.',
        tip: 'If you don\'t love the first result, click generate again for a different approach to the same topic.',
      },
      {
        title: 'Step 8: Review and Edit',
        content: 'Review the generated lesson. You can edit any section by clicking on it. Modify activities, add your own ideas, adjust timing, or remove items that don\'t fit your classroom.',
      },
      {
        title: 'Step 9: Save to Library',
        content: 'Click "Save to Library" to store your lesson. It will appear in your Library tab, where you can access it anytime, mark it as a favorite, or share with colleagues.',
      },
    ],
  },
  {
    id: 'curriculum-library',
    title: 'Curriculum Library',
    icon: BookOpen,
    description: 'Browse, filter, organize, and remix your lesson collection',
    steps: [
      {
        title: 'Step 1: Access the Library',
        content: 'From the Lesson Builder page, click the "Library" tab to see all your saved lessons. You\'ll see lesson cards showing the title, age group, domain, duration, and favorite status.',
      },
      {
        title: 'Step 2: Search for Lessons',
        content: 'Use the search bar to find lessons by keyword. The search looks at titles, topics, and activity descriptions. Type "weather" to find all weather-related lessons.',
        tip: 'Search is case-insensitive and finds partial matches.',
      },
      {
        title: 'Step 3: Filter by Age Group',
        content: 'Click the "Age Group" dropdown to show only lessons for a specific age range. This is helpful when planning for a particular classroom.',
      },
      {
        title: 'Step 4: Filter by Domain',
        content: 'Use the "Domain" filter to find lessons focusing on specific learning areas: Cognitive, Language, Physical, Social-Emotional, or Creative Arts.',
      },
      {
        title: 'Step 5: Show Favorites Only',
        content: 'Click the star icon to toggle the favorites filter. This shows only lessons you\'ve marked as favorites - great for finding your go-to activities.',
      },
      {
        title: 'Step 6: Sort Your Lessons',
        content: 'Use the sort dropdown to arrange lessons by: Newest (most recently created first), Oldest, Title (alphabetical), or Duration.',
      },
      {
        title: 'Step 7: View Lesson Details',
        content: 'Click on any lesson card to view the full lesson plan. You\'ll see all objectives, materials, activities, and assessment ideas.',
      },
      {
        title: 'Step 8: Lesson Actions',
        content: 'From the lesson view, you can: Edit the lesson, Remix it for a different age group, Download as PDF, Mark as favorite, Duplicate it, or Delete it.',
        warning: 'Deleting a lesson cannot be undone. Consider using the duplicate feature to create a backup before major edits.',
      },
    ],
  },
  {
    id: 'remix-lessons',
    title: 'Remixing Lessons',
    icon: Lightbulb,
    description: 'Adapt existing lessons for different age groups or contexts',
    steps: [
      {
        title: 'Step 1: Find a Lesson to Remix',
        content: 'Go to your Library or the Remix tab. Find a lesson you want to adapt. This could be one of your own lessons or a shared lesson from your team.',
      },
      {
        title: 'Step 2: Click Remix',
        content: 'Click the "Remix" button on the lesson card or from the lesson detail view. This opens the Remix modal.',
      },
      {
        title: 'Step 3: Select New Age Group',
        content: 'Choose the target age group for your remixed lesson. The AI will adapt vocabulary, activity complexity, safety considerations, and timing for the new age.',
        tip: 'Remixing a preschool lesson down to toddlers? The AI will simplify language, shorten activities, and add more sensory elements.',
      },
      {
        title: 'Step 4: Adjust Duration (Optional)',
        content: 'If needed, select a different duration. Younger children often need shorter lessons.',
      },
      {
        title: 'Step 5: Change Domain (Optional)',
        content: 'You can shift the learning focus. A cognitive lesson about counting could be remixed with a physical development focus to become a movement-based counting game.',
      },
      {
        title: 'Step 6: Add Adaptation Notes',
        content: 'Tell the AI what specific changes you want: "Make it more hands-on", "Add a music component", "Focus on fine motor skills", "Include parent involvement activity".',
      },
      {
        title: 'Step 7: Generate Remix',
        content: 'Click "Remix Lesson". The AI creates a new lesson based on your original, adapted to your specifications. The original lesson remains unchanged.',
      },
      {
        title: 'Step 8: Review and Save',
        content: 'Review the remixed lesson, make any manual adjustments, and save it to your library. It will be tagged as a remix with a link to the original.',
      },
    ],
  },
  {
    id: 'staff-management',
    title: 'Staff Management',
    icon: Users,
    description: 'Manage team profiles, certifications, and schedules',
    steps: [
      {
        title: 'Step 1: Access Staff Management',
        content: 'From the admin dashboard, click "Staff" in the left sidebar. You\'ll see an overview of all staff members with their roles and status.',
      },
      {
        title: 'Step 2: Add a New Staff Member',
        content: 'Click "Add Staff" button. Fill in: Name, Role (Lead Teacher, Assistant, etc.), Contact info, Start date, and assigned classroom(s).',
      },
      {
        title: 'Step 3: Upload Documents',
        content: 'For each staff member, you can upload: Photo, Background check documentation, Certifications (CPR, First Aid, etc.), and training certificates.',
        warning: 'Keep certification expiration dates updated to receive renewal reminders.',
      },
      {
        title: 'Step 4: Track Certifications',
        content: 'The system tracks certification expiration dates. You\'ll see a status indicator: Green (valid), Yellow (expiring within 60 days), Red (expired).',
        tip: 'Set up email notifications to alert staff 30 and 60 days before certifications expire.',
      },
      {
        title: 'Step 5: Assign Classrooms',
        content: 'Assign each staff member to one or more classrooms. This affects ratio calculations and determines which children they can check in/out.',
      },
      {
        title: 'Step 6: View Staff Schedules',
        content: 'Click on a staff member to see their weekly schedule. You can adjust hours, add time-off, and see coverage gaps.',
      },
      {
        title: 'Step 7: Generate Reports',
        content: 'Use the Reports section to generate: Staff contact lists, Certification status reports, Hours worked summaries, and Training completion records.',
      },
    ],
  },
  {
    id: 'attendance',
    title: 'Attendance & Ratios',
    icon: Calendar,
    description: 'Track daily attendance and maintain licensing compliance',
    steps: [
      {
        title: 'Step 1: Access Attendance',
        content: 'Click "Attendance" in the admin sidebar. You\'ll see today\'s date selected by default with a list of enrolled children.',
      },
      {
        title: 'Step 2: Check In a Child',
        content: 'Find the child\'s name and click the check-in button (or scan their QR code if using the tablet app). The system records the exact time.',
        tip: 'Parents can also check in via the Parent Portal app, which you\'ll approve.',
      },
      {
        title: 'Step 3: Check Out a Child',
        content: 'When a child is picked up, click check-out. The system verifies the authorized pickup person and records the time.',
        warning: 'Always verify pickup authorization. The system will flag if someone not on the approved list tries to check out a child.',
      },
      {
        title: 'Step 4: View by Classroom',
        content: 'Use the classroom tabs to see attendance for each room. This shows only children assigned to that classroom.',
      },
      {
        title: 'Step 5: Monitor Ratios',
        content: 'The Ratio Monitor displays current staff-to-child ratios for each classroom. Green means compliant, yellow is approaching limit, red is over ratio.',
        warning: 'Minnesota DCYF requires specific ratios by age. The system alerts you before you exceed limits.',
      },
      {
        title: 'Step 6: Handle Late Arrivals',
        content: 'Late arrivals are flagged in the system. You can add notes explaining the delay for your records.',
      },
      {
        title: 'Step 7: Review Historical Data',
        content: 'Use the date picker to view attendance for any past date. Useful for billing reconciliation and compliance audits.',
      },
      {
        title: 'Step 8: Generate Reports',
        content: 'Export attendance data as PDF or Excel for: Daily attendance sheets, Monthly summaries, DCYF compliance reports, and Billing records.',
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    icon: BarChart3,
    description: 'Generate insights, compliance reports, and export data',
    steps: [
      {
        title: 'Step 1: Access Reports',
        content: 'Click "Reports" in the admin sidebar. You\'ll see categories: Attendance, Enrollment, Financial, Compliance, and Custom.',
      },
      {
        title: 'Step 2: Select Report Type',
        content: 'Choose the report you need. Common reports include: Daily Attendance Summary, Monthly Enrollment Stats, Staff Hours, Ratio Compliance Log, and Revenue by Program.',
      },
      {
        title: 'Step 3: Set Date Range',
        content: 'Select the time period for your report. Options include: Today, This Week, This Month, Last Month, Custom Range.',
      },
      {
        title: 'Step 4: Apply Filters',
        content: 'Narrow your report by: Classroom, Age group, Staff member, or Enrollment status. Filters help you get exactly the data you need.',
      },
      {
        title: 'Step 5: Generate Report',
        content: 'Click "Generate" to create your report. Most reports appear instantly. Larger date ranges may take a few seconds.',
      },
      {
        title: 'Step 6: Review On-Screen',
        content: 'Reports display on-screen with charts and data tables. You can sort columns, expand details, and drill down into specific data points.',
      },
      {
        title: 'Step 7: Export Options',
        content: 'Download reports as: PDF (for printing/sharing), Excel (for further analysis), or CSV (for importing to other systems).',
        tip: 'PDF exports include your center\'s logo and formatting suitable for parent meetings or licensing visits.',
      },
      {
        title: 'Step 8: Schedule Recurring Reports',
        content: 'Set up automatic report generation. Choose frequency (daily, weekly, monthly) and recipients. Great for automated billing reports or weekly attendance summaries.',
      },
      {
        title: 'Step 9: DCYF Compliance Reports',
        content: 'The Compliance section has pre-built reports matching Minnesota DCYF requirements: Ratio logs, Incident reports, Staff qualification records, and Training documentation.',
      },
    ],
  },
];

export default function GuidesPage() {
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  const selectedGuide = guides.find(g => g.id === activeGuide);

  if (selectedGuide) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <section className="border-b bg-white sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" onClick={() => setActiveGuide(null)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Guides
            </Button>
          </div>
        </section>

        {/* Guide Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <selectedGuide.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{selectedGuide.title}</h1>
                <p className="text-slate-600">{selectedGuide.description}</p>
              </div>
            </div>

            <div className="space-y-6">
              {selectedGuide.steps.map((step, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-700 leading-relaxed">{step.content}</p>

                    {step.tip && (
                      <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800">{step.tip}</p>
                      </div>
                    )}

                    {step.warning && (
                      <div className="flex gap-3 p-3 bg-amber-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">{step.warning}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-6 bg-green-50 rounded-lg">
              <div className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">You&apos;re all set!</h3>
                  <p className="text-sm text-green-800">
                    You&apos;ve completed the {selectedGuide.title} guide. Try it out in the admin dashboard,
                    or explore more guides to learn other features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/training">
                <ArrowLeft className="w-4 h-4 mr-1" /> Training
              </Link>
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <h1 className="text-lg font-semibold text-slate-900">Step-by-Step Guides</h1>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Written Training Guides</h2>
            <p className="text-slate-600">Detailed step-by-step instructions for every feature</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {guides.map((guide) => (
              <Card
                key={guide.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setActiveGuide(guide.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <guide.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {guide.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">{guide.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{guide.steps.length} steps</Badge>
                    <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Guide <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

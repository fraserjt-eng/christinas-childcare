'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Video,
  Copy,
  Check,
  Lightbulb,
  BookOpen,
  Users,
  Calendar,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

type VideoScript = {
  id: string;
  title: string;
  duration: string;
  icon: React.ElementType;
  description: string;
  sections: {
    timestamp: string;
    heading: string;
    narration: string;
    screenAction: string;
  }[];
};

const videoScripts: VideoScript[] = [
  {
    id: 'lesson-builder-intro',
    title: 'Getting Started with Lesson Builder',
    duration: '3:45',
    icon: Lightbulb,
    description: 'Introduction to the AI-powered lesson creation tool',
    sections: [
      {
        timestamp: '0:00',
        heading: 'Welcome',
        narration: 'Welcome to Christina\'s Child Care Center training. In this video, I\'ll show you how to use our AI-powered Lesson Builder to create engaging, age-appropriate lesson plans in just minutes.',
        screenAction: 'Show the admin dashboard with Lessons highlighted in sidebar',
      },
      {
        timestamp: '0:15',
        heading: 'Accessing Lesson Builder',
        narration: 'To get started, log into the admin dashboard and click on "Lessons" in the left sidebar. This opens the Lesson Builder where you can create new lessons, view your saved lessons, remix existing ones, and see analytics about your teaching.',
        screenAction: 'Click Lessons, show the Lesson Builder page load with tabs visible',
      },
      {
        timestamp: '0:35',
        heading: 'The New Lesson Tab',
        narration: 'The New Lesson tab is where the magic happens. You\'ll see a form with several options. Let\'s walk through each one.',
        screenAction: 'Highlight the New Lesson tab and show the form',
      },
      {
        timestamp: '0:50',
        heading: 'Selecting Age Group',
        narration: 'First, select your age group. We have four options: Infant for our youngest learners from 6 weeks to 16 months, Toddler for 16 to 33 months, Preschool for 33 months to 5 years, and School Age for children 5 to 12. The AI adapts everything—vocabulary, activity complexity, safety considerations—based on your selection.',
        screenAction: 'Click the Age Group dropdown, slowly hover over each option showing the age ranges',
      },
      {
        timestamp: '1:20',
        heading: 'Entering Your Topic',
        narration: 'Next, type in your topic. This can be anything you want to teach about. Let\'s try "Weather and Seasons". You can be specific like "Thunderstorms" or broad like "Nature". The more specific you are, the more focused your lesson will be.',
        screenAction: 'Type "Weather and Seasons" into the topic field',
      },
      {
        timestamp: '1:45',
        heading: 'Choosing Learning Domain',
        narration: 'Choose the primary learning domain. For our weather lesson, let\'s pick "Cognitive Development" since we\'re focusing on understanding concepts. Other options include Language and Literacy, Physical Development, Social-Emotional, and Creative Arts.',
        screenAction: 'Click Learning Domain dropdown, select Cognitive Development',
      },
      {
        timestamp: '2:05',
        heading: 'Setting Duration',
        narration: 'Select how long your lesson should run. For preschoolers, 30 minutes is usually ideal. The AI will adjust the number of activities and depth of content based on your time selection.',
        screenAction: 'Click Duration, select 30 minutes',
      },
      {
        timestamp: '2:20',
        heading: 'Additional Context',
        narration: 'The Additional Context field is optional but powerful. You can add notes like "Include an outdoor component" or "We have a child with a nut allergy" or "Tie this into our field trip next week". The AI uses this to customize your lesson.',
        screenAction: 'Type "Include a hands-on art activity" in the context field',
      },
      {
        timestamp: '2:45',
        heading: 'Generating the Lesson',
        narration: 'Now click "Generate with AI". The system will take about 10 to 30 seconds to create your complete lesson plan. You\'ll see it generating learning objectives, activities, materials lists, and assessment ideas.',
        screenAction: 'Click Generate with AI button, show loading state, then reveal the generated lesson',
      },
      {
        timestamp: '3:10',
        heading: 'Reviewing Results',
        narration: 'And there\'s our lesson! We have clear learning objectives, a list of materials we\'ll need, step-by-step activities with timing, discussion questions, and ideas for assessing student understanding. If you\'re not happy with any part, you can edit it directly or click generate again for a fresh approach.',
        screenAction: 'Scroll through the generated lesson, highlighting each section',
      },
      {
        timestamp: '3:35',
        heading: 'Saving Your Lesson',
        narration: 'When you\'re satisfied, click "Save to Library". Your lesson is now saved and you can access it anytime from the Library tab. In our next video, we\'ll cover managing your lesson library. Thanks for watching!',
        screenAction: 'Click Save to Library, show success message, end on Library tab',
      },
    ],
  },
  {
    id: 'curriculum-library',
    title: 'Managing Your Curriculum Library',
    duration: '4:00',
    icon: BookOpen,
    description: 'How to organize, search, filter, and manage saved lessons',
    sections: [
      {
        timestamp: '0:00',
        heading: 'Introduction',
        narration: 'In this video, I\'ll show you how to manage your curriculum library—searching for lessons, organizing with favorites, filtering by age and domain, and keeping your teaching resources well organized.',
        screenAction: 'Show the Library tab of Lesson Builder',
      },
      {
        timestamp: '0:15',
        heading: 'Library Overview',
        narration: 'The Library tab shows all your saved lessons as cards. Each card displays the lesson title, age group, learning domain, duration, and whether it\'s marked as a favorite. Let\'s explore the powerful search and filter tools.',
        screenAction: 'Pan across several lesson cards, highlighting the information on each',
      },
      {
        timestamp: '0:40',
        heading: 'Searching Lessons',
        narration: 'The search bar lets you find lessons by keyword. Let\'s search for "colors". The search looks at titles, topics, and even activity descriptions. Notice how lessons with "colors" in any part appear.',
        screenAction: 'Type "colors" in search bar, show results filtering in real-time',
      },
      {
        timestamp: '1:05',
        heading: 'Filtering by Age Group',
        narration: 'Use the Age Group filter to show only lessons for specific ages. If you\'re planning for the toddler room today, select Toddler and you\'ll only see lessons appropriate for that age range.',
        screenAction: 'Click Age Group dropdown, select Toddler, show filtered results',
      },
      {
        timestamp: '1:25',
        heading: 'Filtering by Domain',
        narration: 'The Domain filter helps when you\'re focusing on specific development areas. Let\'s say you need more social-emotional activities. Select Social-Emotional and see only those lessons.',
        screenAction: 'Click Domain dropdown, select Social-Emotional',
      },
      {
        timestamp: '1:45',
        heading: 'Using Favorites',
        narration: 'Click the star icon on any lesson card to mark it as a favorite. Favorites are your go-to lessons that you use frequently. Toggle the favorites filter to see only your starred lessons.',
        screenAction: 'Click star on a lesson, then click the favorites filter button',
      },
      {
        timestamp: '2:10',
        heading: 'Sorting Options',
        narration: 'The sort dropdown lets you arrange lessons by newest, oldest, title alphabetically, or duration. Newest is helpful for finding lessons you just created.',
        screenAction: 'Click sort dropdown, try different sort options',
      },
      {
        timestamp: '2:30',
        heading: 'Viewing Lesson Details',
        narration: 'Click on any lesson card to see the full lesson plan. Here you can read through all the objectives, materials, and activities. The full view also gives you more action options.',
        screenAction: 'Click a lesson card, show the full lesson view opening',
      },
      {
        timestamp: '2:50',
        heading: 'Lesson Actions',
        narration: 'From the lesson view, you have several options. Edit lets you modify the lesson. Remix creates an adapted version for a different age group—we\'ll cover that in another video. You can download as PDF to print or share. Duplicate creates a copy for modification. And delete removes the lesson permanently.',
        screenAction: 'Hover over each action button as it\'s mentioned',
      },
      {
        timestamp: '3:20',
        heading: 'PDF Downloads',
        narration: 'The PDF download includes several formats: a full lesson plan, printable activity cards for each activity, a parent letter explaining what their child is learning, and an assessment checklist. These are great for parent communication and documentation.',
        screenAction: 'Click Download PDF, show the dropdown with options',
      },
      {
        timestamp: '3:45',
        heading: 'Wrap Up',
        narration: 'That\'s your curriculum library! Keep it organized with favorites and clear titles, and you\'ll always be able to find the perfect lesson quickly. In our next video, we\'ll cover remixing lessons. Thanks for watching!',
        screenAction: 'Show a well-organized library view with favorites and clear organization',
      },
    ],
  },
  {
    id: 'staff-management',
    title: 'Staff Management Overview',
    duration: '4:20',
    icon: Users,
    description: 'Managing team profiles, certifications, and scheduling',
    sections: [
      {
        timestamp: '0:00',
        heading: 'Introduction',
        narration: 'Welcome to staff management training. In this video, I\'ll show you how to add staff members, track certifications, assign classrooms, and keep your team information up to date for licensing compliance.',
        screenAction: 'Show admin dashboard, highlight Staff in sidebar',
      },
      {
        timestamp: '0:15',
        heading: 'Staff Directory',
        narration: 'Click Staff in the sidebar to open the staff management page. You\'ll see all current staff members listed with their photo, name, role, assigned classroom, and certification status. The colored dots indicate certification validity—green means all current, yellow means something expires soon, red means something has expired.',
        screenAction: 'Show staff directory with several staff members visible',
      },
      {
        timestamp: '0:45',
        heading: 'Adding New Staff',
        narration: 'To add a new team member, click the "Add Staff" button in the top right. You\'ll fill in their basic information: name, email, phone, role, start date, and which classroom they\'re assigned to.',
        screenAction: 'Click Add Staff, show the form opening',
      },
      {
        timestamp: '1:10',
        heading: 'Staff Profile Details',
        narration: 'Let\'s add a new assistant teacher. Enter the name, select their role from the dropdown—we have Lead Teacher, Assistant Teacher, Aide, and Administrator options. Add their contact information and start date.',
        screenAction: 'Fill in example staff member details',
      },
      {
        timestamp: '1:40',
        heading: 'Uploading Certifications',
        narration: 'The certification section is critical for licensing. Click "Add Certification" to upload documents. You can add CPR and First Aid, background checks, food handler permits, and state-required training certificates. Always enter the expiration date so the system can alert you before renewals are due.',
        screenAction: 'Click Add Certification, show the upload dialog',
      },
      {
        timestamp: '2:15',
        heading: 'Certification Tracking',
        narration: 'The system automatically tracks expiration dates. You\'ll receive email alerts 60 days and 30 days before any certification expires. The staff member also receives reminders. This helps you stay ahead of compliance requirements.',
        screenAction: 'Show a certification with expiration date, highlight the status indicator',
      },
      {
        timestamp: '2:45',
        heading: 'Classroom Assignment',
        narration: 'Assign staff to classrooms using the checkbox list. Staff can be assigned to multiple rooms if they float. This assignment affects ratio calculations—the system uses it to determine if you have adequate staffing for each room.',
        screenAction: 'Show classroom assignment checkboxes, select multiple rooms',
      },
      {
        timestamp: '3:10',
        heading: 'Viewing Staff Details',
        narration: 'Click on any staff member to view their full profile. Here you can see all their information, uploaded documents, certification history, and assigned schedule. You can edit any information from this view.',
        screenAction: 'Click a staff member, show their detailed profile',
      },
      {
        timestamp: '3:35',
        heading: 'Staff Reports',
        narration: 'From the Reports menu, you can generate staff-related reports: a contact list for emergency purposes, certification status summary for DCYF visits, and hours worked reports for payroll. These can be exported as PDF or Excel.',
        screenAction: 'Show Reports dropdown, highlight staff report options',
      },
      {
        timestamp: '4:00',
        heading: 'Wrap Up',
        narration: 'That covers staff management basics. Keep certification dates current, maintain accurate classroom assignments, and you\'ll be well-prepared for licensing inspections. Next, we\'ll cover attendance tracking. Thanks for watching!',
        screenAction: 'Return to staff directory showing organized team list',
      },
    ],
  },
  {
    id: 'attendance-ratios',
    title: 'Attendance & Ratio Tracking',
    duration: '3:30',
    icon: Calendar,
    description: 'Daily check-in/out and maintaining licensing compliance',
    sections: [
      {
        timestamp: '0:00',
        heading: 'Introduction',
        narration: 'In this video, I\'ll show you how to track daily attendance, monitor staff-to-child ratios in real-time, and generate the reports you need for billing and compliance.',
        screenAction: 'Show admin dashboard, click on Attendance',
      },
      {
        timestamp: '0:15',
        heading: 'Attendance Overview',
        narration: 'The Attendance page shows today\'s date by default. You\'ll see a list of all enrolled children organized by classroom. The status column shows who\'s checked in, who\'s absent, and who hasn\'t arrived yet.',
        screenAction: 'Show attendance page with list of children',
      },
      {
        timestamp: '0:40',
        heading: 'Checking In a Child',
        narration: 'When a child arrives, find their name and click the check-in button. The system records the exact time. You can also add a note—for example, if mom mentioned the child didn\'t sleep well, that\'s helpful for teachers to know.',
        screenAction: 'Click check-in for a child, show the time being recorded',
      },
      {
        timestamp: '1:05',
        heading: 'Checking Out',
        narration: 'At pickup, click check-out and select the person picking up from the authorized list. If someone not on the list tries to pick up, the system will alert you. Always verify ID for anyone you don\'t recognize.',
        screenAction: 'Click check-out, show authorized pickup dropdown',
      },
      {
        timestamp: '1:30',
        heading: 'Classroom View',
        narration: 'Use the classroom tabs to see attendance for specific rooms. This is helpful when you\'re in a particular classroom and only need to see those children. Each tab shows current occupancy and ratio.',
        screenAction: 'Click through classroom tabs, showing filtered views',
      },
      {
        timestamp: '1:50',
        heading: 'Real-Time Ratio Monitor',
        narration: 'The Ratio Monitor is critical for compliance. It shows current staff-to-child ratios for each classroom. Green means you\'re compliant, yellow means you\'re approaching the limit, and red means you\'re over ratio and need to take action immediately.',
        screenAction: 'Show the ratio monitor panel, point out different status colors',
      },
      {
        timestamp: '2:20',
        heading: 'Minnesota Requirements',
        narration: 'Minnesota DCYF requires specific ratios: 1 staff per 4 infants, 1 per 7 toddlers, 1 per 10 preschoolers, and 1 per 15 school-age children. The system knows these requirements and monitors continuously.',
        screenAction: 'Show ratio requirements reference or tooltip',
      },
      {
        timestamp: '2:45',
        heading: 'Historical Records',
        narration: 'Use the date picker to view attendance for any past date. This is essential for billing reconciliation—you can verify exactly which days a child attended—and for DCYF audits when you need historical records.',
        screenAction: 'Click date picker, select a past date, show historical attendance',
      },
      {
        timestamp: '3:05',
        heading: 'Attendance Reports',
        narration: 'Generate reports for any date range. Options include daily sign-in sheets, monthly attendance summaries, and DCYF compliance logs. Export as PDF for records or Excel for further analysis.',
        screenAction: 'Show report generation options',
      },
      {
        timestamp: '3:20',
        heading: 'Wrap Up',
        narration: 'That\'s attendance and ratio tracking. Keep check-ins and check-outs accurate, monitor those ratios, and you\'ll maintain compliance easily. Thanks for watching!',
        screenAction: 'End on clean attendance view showing good ratios',
      },
    ],
  },
  {
    id: 'reports-analytics',
    title: 'Reports & Analytics',
    duration: '4:00',
    icon: BarChart3,
    description: 'Generating insights and compliance documentation',
    sections: [
      {
        timestamp: '0:00',
        heading: 'Introduction',
        narration: 'In this video, I\'ll walk you through the reports and analytics features. You\'ll learn how to generate the reports you need for billing, parent communication, and DCYF compliance visits.',
        screenAction: 'Show admin dashboard, click on Reports',
      },
      {
        timestamp: '0:15',
        heading: 'Reports Overview',
        narration: 'The Reports page organizes reports into categories: Attendance, Enrollment, Financial, Staff, and Compliance. Each category contains several pre-built reports designed for specific needs.',
        screenAction: 'Show reports page with category tabs',
      },
      {
        timestamp: '0:35',
        heading: 'Attendance Reports',
        narration: 'Attendance reports include daily sign-in sheets for printing, monthly attendance summaries showing total days attended per child, and ratio compliance logs documenting that you maintained proper staffing.',
        screenAction: 'Click Attendance tab, show available reports',
      },
      {
        timestamp: '1:00',
        heading: 'Generating a Report',
        narration: 'Let\'s generate a monthly attendance summary. Select the report type, choose your date range—last month for example—and optionally filter by classroom. Then click Generate.',
        screenAction: 'Select Monthly Attendance, set date range, click Generate',
      },
      {
        timestamp: '1:25',
        heading: 'Report Results',
        narration: 'The report displays on screen with a data table showing each child, their enrolled days, actual attendance, and attendance percentage. You can sort by any column by clicking the header.',
        screenAction: 'Show generated report, click column headers to sort',
      },
      {
        timestamp: '1:50',
        heading: 'Exporting Reports',
        narration: 'Click Export to download your report. PDF is best for printing or emailing to parents. Excel is great if you need to do further calculations. CSV works for importing into other systems like accounting software.',
        screenAction: 'Click Export, show format options',
      },
      {
        timestamp: '2:15',
        heading: 'Financial Reports',
        narration: 'Financial reports help with billing. You can see revenue by program, outstanding balances, payment history, and more. The revenue report shows income broken down by age group and enrollment type.',
        screenAction: 'Click Financial tab, explore revenue reports',
      },
      {
        timestamp: '2:40',
        heading: 'DCYF Compliance Reports',
        narration: 'The Compliance section is designed for licensing visits. Reports include staff qualification summaries showing everyone\'s certification status, ratio logs proving you maintained compliance, incident reports, and training documentation.',
        screenAction: 'Click Compliance tab, show available compliance reports',
      },
      {
        timestamp: '3:10',
        heading: 'Scheduling Recurring Reports',
        narration: 'Set up automatic reports that generate and email on a schedule. Great for weekly attendance summaries to management or monthly billing reports. Click Schedule, choose frequency, add email recipients, and you\'re set.',
        screenAction: 'Click Schedule Report, show the scheduling options',
      },
      {
        timestamp: '3:40',
        heading: 'Wrap Up',
        narration: 'That covers reports and analytics. Use these tools to stay on top of your center\'s data, keep parents informed, and breeze through DCYF visits. If you have questions, check our written guides or contact support. Thanks for watching!',
        screenAction: 'Show a nicely formatted PDF report as example of final output',
      },
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1">
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  );
}

export default function ScriptsPage() {
  const [expandedScript, setExpandedScript] = useState<string | null>(null);

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
            <h1 className="text-lg font-semibold text-slate-900">Video Scripts</h1>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Video className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Screen Recording Scripts</h2>
          <p className="text-slate-600">
            Use these scripts when recording training videos. Each script includes timestamps,
            narration text, and on-screen actions to perform.
          </p>
        </div>
      </section>

      {/* Scripts */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl space-y-4">
          {videoScripts.map((script) => (
            <Card key={script.id} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedScript(expandedScript === script.id ? null : script.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <script.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{script.title}</CardTitle>
                      <CardDescription>{script.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{script.duration}</Badge>
                    {expandedScript === script.id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedScript === script.id && (
                <CardContent className="border-t bg-slate-50/50">
                  <div className="space-y-6 pt-4">
                    {script.sections.map((section, index) => (
                      <div key={index} className="bg-white rounded-lg border p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-primary">{section.timestamp}</Badge>
                            <h4 className="font-semibold text-slate-900">{section.heading}</h4>
                          </div>
                          <CopyButton text={section.narration} />
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Narration:</p>
                            <p className="text-slate-700 leading-relaxed">{section.narration}</p>
                          </div>

                          <div className="pt-2 border-t">
                            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Screen Action:</p>
                            <p className="text-sm text-slate-600 italic">{section.screenAction}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-center pt-2">
                      <Button variant="outline" onClick={() => {
                        const fullScript = script.sections.map(s =>
                          `[${s.timestamp}] ${s.heading}\n\nNarration: ${s.narration}\n\nScreen Action: ${s.screenAction}`
                        ).join('\n\n---\n\n');
                        navigator.clipboard.writeText(fullScript);
                      }}>
                        <Copy className="w-4 h-4 mr-2" /> Copy Full Script
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-8 bg-slate-50 border-t">
        <div className="container mx-auto px-4 max-w-3xl">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recording Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Before Recording</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Use a clean test account with sample data</li>
                  <li>• Close unnecessary browser tabs</li>
                  <li>• Disable notifications</li>
                  <li>• Practice the flow once without recording</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">During Recording</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Move your mouse slowly and deliberately</li>
                  <li>• Pause briefly after each click</li>
                  <li>• Speak clearly at a moderate pace</li>
                  <li>• It&apos;s okay to do multiple takes!</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

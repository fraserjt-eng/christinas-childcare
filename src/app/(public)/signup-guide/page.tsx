'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  KeyRound, LogIn, UserPlus, ClipboardList, CheckCircle2,
  Clock, Download, Printer,
} from 'lucide-react';
import Link from 'next/link';

// Two real ways a family gets into the Parent Portal:
//  A. Christina adds them in User Management and shares a setup link.
//  B. The family signs up themselves and waits for Christina to approve.
// Both end at the same place: signed in, seeing their child's daily report.

interface Step {
  title: string;
  description: string;
}

const invitedPath: Step[] = [
  {
    title: 'Open the link Christina sent you',
    description:
      'Christina adds your family, then sends you a one-time setup link. Open it on your phone or computer. It goes to a "Set Your Password" page on the center website.',
  },
  {
    title: 'Choose your password',
    description:
      'Enter a password (at least 8 characters) and confirm it, then tap Set Password. The link is good for 7 days; if it expires, ask Christina to resend it.',
  },
  {
    title: 'Sign in',
    description:
      'Tap "Go to sign in," then sign in with your email and the password you just chose. That is it. Skip to "Once you are signed in" below.',
  },
];

const selfSignupPath: Step[] = [
  {
    title: 'Open the Parent Portal',
    description:
      'Go to the Parent Portal from the website, or the sign-in page directly. You will see "Sign In" and "Create Account" tabs.',
  },
  {
    title: 'Create your account',
    description:
      'Tap the "Create Account" tab. Enter your name, email, phone, and a password (at least 8 characters).',
  },
  {
    title: 'Wait for approval',
    description:
      'New accounts are not active right away. Christina reviews and activates your account, usually within 24 hours. You will not be able to sign in until it is approved. This step is normal; it keeps children safe.',
  },
  {
    title: 'Sign in once approved',
    description:
      'After Christina activates your account, come back to the sign-in page and sign in with your email and password.',
  },
];

const afterSignedIn: string[] = [
  'Add your children: name, date of birth, classroom, allergies, and a photo.',
  'Complete your family profile: address, a short family bio, and a family photo.',
  "Open Daily Report to see your child's day as it happens: naps, meals, diapers, activities, notes, and photos that staff log. You only ever see your own child.",
  'At drop-off and pickup, check your child in and out on the room iPad using your family PIN. Christina gives you this PIN.',
];

export default function SignupGuidePage() {
  function handlePrint() {
    window.print();
  }

  async function handleDownloadPDF() {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 22;
    let y = 20;

    const ensureSpace = (need: number) => {
      if (y + need > 280) {
        doc.addPage();
        y = 22;
      }
    };

    // Header bar
    doc.setFillColor('#C62828');
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("Christina's Child Care Center", pageWidth / 2, 12, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Parent Portal Guide', pageWidth / 2, 22, { align: 'center' });

    y = 42;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const intro = doc.splitTextToSize(
      'There are two ways to get into the Parent Portal. Use the one that matches how you were brought in.',
      pageWidth - margin * 2
    );
    doc.text(intro, margin, y);
    y += intro.length * 5 + 8;

    const section = (heading: string, steps: Step[]) => {
      ensureSpace(16);
      doc.setFillColor('#C62828');
      doc.rect(margin, y - 5, pageWidth - margin * 2, 9, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(heading, margin + 3, y + 1);
      y += 14;

      steps.forEach((step, i) => {
        ensureSpace(20);
        doc.setFillColor('#C62828');
        doc.circle(margin + 5, y - 2, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(String(i + 1), margin + 5, y, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(step.title, margin + 15, y);
        y += 7;

        doc.setTextColor('#6B7280');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(
          step.description,
          pageWidth - margin * 2 - 15
        );
        doc.text(lines, margin + 15, y);
        y += lines.length * 5 + 9;
      });
      y += 4;
    };

    section('Path A: Christina sent you a setup link', invitedPath);
    section('Path B: You are signing up yourself', selfSignupPath);

    ensureSpace(16);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Once you are signed in (either way)', margin, y);
    y += 9;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#374151');
    afterSignedIn.forEach((item) => {
      ensureSpace(14);
      const lines = doc.splitTextToSize(`-  ${item}`, pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 4;
    });

    ensureSpace(20);
    y += 6;
    doc.setDrawColor('#E5E7EB');
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    doc.setTextColor('#6B7280');
    doc.setFontSize(9);
    doc.text(
      "Christina's Child Care Center, 5510 W Broadway Ave, Crystal, MN 55428",
      margin,
      y
    );
    y += 5;
    doc.text(
      'Questions about your account? Ask Christina or the front desk.',
      margin,
      y
    );

    doc.save('parent-portal-guide.pdf');
  }

  const renderPath = (
    label: string,
    steps: Step[],
    Icon: typeof KeyRound,
    color: string
  ) => (
    <Card className="print:shadow-none print:border-gray-300">
      <CardContent className="p-6 print:p-4">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-11 h-11 rounded-full ${color} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-bold">{label}</h2>
        </div>
        <ol className="space-y-4">
          {steps.map((step, i) => (
            <li key={step.title} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-muted text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <h3 className="text-sm font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );

  return (
    <div className="py-16 print:py-4">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-10 print:mb-6">
          <h1 className="text-3xl font-bold print:text-2xl">
            Parent Portal Guide
          </h1>
          <p className="text-muted-foreground mt-2">
            Two ways to get in. Use the one that matches how you were brought
            in.
          </p>
          <div className="flex justify-center gap-3 mt-4 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-1" /> Download PDF
            </Button>
          </div>
        </div>

        <div className="space-y-6 print:space-y-4">
          {renderPath(
            'Path A: Christina sent you a setup link',
            invitedPath,
            KeyRound,
            'bg-christina-red'
          )}
          {renderPath(
            'Path B: You are signing up yourself',
            selfSignupPath,
            UserPlus,
            'bg-christina-blue'
          )}

          <Card className="print:shadow-none print:border-gray-300 border-christina-green/40 bg-green-50/40">
            <CardContent className="p-6 print:p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold">
                  Once you are signed in (either way)
                </h2>
              </div>
              <ul className="space-y-2">
                {afterSignedIn.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <ClipboardList className="h-4 w-4 text-christina-green mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="print:hidden bg-amber-50 border-amber-200">
            <CardContent className="p-5 flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">
                Signed up yourself and cannot log in yet? That is expected.
                Your account stays pending until Christina activates it. Once
                it is approved you will be able to sign in with the same email
                and password.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 text-center print:hidden">
          <Link href="/login">
            <Button
              size="lg"
              className="bg-christina-blue hover:bg-christina-blue/90"
            >
              <LogIn className="h-5 w-5 mr-2" /> Go to the Parent Portal
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-3">
            Already set up?{' '}
            <Link href="/login" className="text-christina-blue hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-gray-500">
          <p>
            Christina&apos;s Child Care Center - 5510 W Broadway Ave, Crystal,
            MN 55428
          </p>
          <p>Questions about your account? Ask Christina or the front desk.</p>
        </div>
      </div>
    </div>
  );
}

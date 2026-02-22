'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Globe, LogIn, UserPlus, ClipboardList, CheckCircle2,
  Download, Printer,
} from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    number: 1,
    title: 'Visit Our Website',
    description: "Navigate to Christina's Child Care Center website. You can access the Parent Portal from the homepage or go directly to the login page.",
    icon: Globe,
    color: 'bg-christina-blue',
  },
  {
    number: 2,
    title: 'Go to Parent Portal',
    description: 'Click the "Parent Portal" link in the navigation or visit the login page. You\'ll see options to sign in or create a new account.',
    icon: LogIn,
    color: 'bg-christina-red',
  },
  {
    number: 3,
    title: 'Create Your Account',
    description: 'Click the "Create Account" tab. Fill in your name, email address, phone number, and choose a password (at least 6 characters).',
    icon: UserPlus,
    color: 'bg-christina-coral',
  },
  {
    number: 4,
    title: 'Add Your Children',
    description: 'Once logged in, click "Add Child" on your dashboard. Enter their name, date of birth, classroom, allergies, and upload a photo.',
    icon: ClipboardList,
    color: 'bg-christina-yellow',
  },
  {
    number: 5,
    title: 'Complete Your Profile',
    description: 'Click "Edit" on your family profile to add your address, family bio, and upload a family photo. You\'re all set!',
    icon: CheckCircle2,
    color: 'bg-green-600',
  },
];

export default function SignupGuidePage() {
  function handlePrint() {
    window.print();
  }

  async function handleDownloadPDF() {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 25;
    let y = 20;

    // Header bar
    doc.setFillColor('#C62828');
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("Christina's Child Care Center", pageWidth / 2, 12, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Parent Portal Signup Guide', pageWidth / 2, 22, { align: 'center' });

    y = 42;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text('Follow these 5 easy steps to create your family account:', margin, y);
    y += 14;

    steps.forEach((step) => {
      // Step number circle
      doc.setFillColor('#C62828');
      doc.circle(margin + 5, y - 2, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(String(step.number), margin + 5, y, { align: 'center' });

      // Step title
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(step.title, margin + 15, y);
      y += 7;

      // Step description
      doc.setTextColor('#6B7280');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(step.description, pageWidth - margin * 2 - 15);
      doc.text(lines, margin + 15, y);
      y += lines.length * 5 + 10;
    });

    // Footer
    y = Math.max(y + 10, 220);
    doc.setDrawColor('#E5E7EB');
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setTextColor('#6B7280');
    doc.setFontSize(9);
    doc.text('Need help? Contact us at (555) 555-0123 or email info@christinaschildcare.com', margin, y);
    y += 5;
    doc.text("Christina's Child Care Center - 5510 W Broadway Ave, Crystal, MN 55428", margin, y);

    doc.save('signup-guide.pdf');
  }

  return (
    <div className="py-16 print:py-4">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 print:mb-6">
          <h1 className="text-3xl font-bold print:text-2xl">Parent Portal Signup Guide</h1>
          <p className="text-muted-foreground mt-2">
            Follow these 5 easy steps to create your family account
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

        {/* Steps */}
        <div className="space-y-6 print:space-y-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-14 w-0.5 h-[calc(100%-1rem)] bg-border print:bg-gray-300" />
              )}
              <Card className="print:shadow-none print:border-gray-300">
                <CardContent className="p-6 print:p-4 flex items-start gap-4">
                  {/* Step number */}
                  <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center flex-shrink-0`}>
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  {/* Step content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Step {step.number}</span>
                    </div>
                    <h3 className="text-lg font-bold mt-0.5">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center print:hidden">
          <Link href="/login">
            <Button size="lg" className="bg-christina-blue hover:bg-christina-blue/90">
              <UserPlus className="h-5 w-5 mr-2" /> Get Started Now
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-3">
            Already have an account?{' '}
            <Link href="/login" className="text-christina-blue hover:underline">Sign in</Link>
          </p>
        </div>

        {/* Print footer */}
        <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-gray-500">
          <p>Christina&apos;s Child Care Center - 5510 W Broadway Ave, Crystal, MN 55428</p>
          <p>Questions? Call (555) 555-0123 or email info@christinaschildcare.com</p>
        </div>
      </div>
    </div>
  );
}

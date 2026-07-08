'use client';

import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Clock,
  Table2,
  ShieldCheck,
  Trash2,
  Mail,
  Phone,
} from 'lucide-react';

interface RetentionRow {
  type: string;
  period: string;
}

const retentionRows: RetentionRow[] = [
  {
    type: 'Enrollment inquiries and tour requests',
    period: 'Kept for 2 years from the date you submit them, then permanently deleted.',
  },
  {
    type: 'Active family and child records',
    period:
      'Kept for as long as your child is enrolled, plus 1 year after enrollment ends so we can answer follow-up questions and provide references.',
  },
  {
    type: 'Attendance and daily reports',
    period:
      'Kept for 3 years, in line with Minnesota childcare licensing recordkeeping requirements.',
  },
  {
    type: 'Incident and safety records',
    period:
      'Kept longer for compliance, at least 3 years and up to 7 years, because licensing and liability rules require safety records to be available for review.',
  },
  {
    type: 'Photos and media',
    period:
      'Kept while your child is enrolled and removed within 1 year after enrollment ends, or sooner on request.',
  },
  {
    type: 'Financial and CACFP records',
    period:
      'Kept per program requirements, generally 3 years after the end of the program year for CACFP food-program records, and longer where tax or funding rules require it.',
  },
];

interface PolicySection {
  id: string;
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
}

const sections: PolicySection[] = [
  {
    id: 'how-long',
    icon: Table2,
    title: 'How Long We Keep Each Type of Record',
    content: (
      <div className="space-y-4 text-[#4b4b4b] leading-relaxed">
        <p>
          We keep information only as long as we need it to care for your child, run the center, and
          meet the rules we operate under. The table below shows the main types of records and how
          long each one is kept.
        </p>
        <div className="overflow-x-auto rounded-lg border border-[#e5e0d8]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#faf8f5] border-b border-[#e5e0d8]">
                <th className="px-4 py-3 font-bold text-christina-red">Type of Record</th>
                <th className="px-4 py-3 font-bold text-christina-red">How Long We Keep It</th>
              </tr>
            </thead>
            <tbody>
              {retentionRows.map((row, i) => (
                <tr
                  key={row.type}
                  className={i % 2 === 1 ? 'bg-[#faf8f5]/50' : ''}
                >
                  <td className="px-4 py-3 align-top font-medium text-[#1a1a1a]">{row.type}</td>
                  <td className="px-4 py-3 align-top">{row.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    id: 'why-longer',
    icon: ShieldCheck,
    title: 'Why Some Records Are Kept Longer',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          As a licensed childcare provider, we follow Minnesota childcare licensing requirements for
          how long records must be kept. Some records, such as incident and safety reports and
          program financial records, must be held longer than everyday information so they are
          available if a licensor, auditor, or funding program needs to review them.
        </p>
        <p>
          When a required retention period ends, we remove those records rather than keeping them
          indefinitely.
        </p>
      </div>
    ),
  },
  {
    id: 'request-deletion',
    icon: Trash2,
    title: 'How to Request Deletion',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          You may ask us to delete your family&apos;s information at any time using our{' '}
          <a href="/delete-data" className="text-christina-blue hover:underline">
            data deletion request form
          </a>
          , or by contacting us directly.
        </p>
        <p>
          We will delete what we are permitted to and keep only the records Minnesota licensing
          requires us to retain. Those remaining records are removed once their required retention
          period ends.
        </p>
      </div>
    ),
  },
];

export default function RetentionSchedulePage() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">

        {/* Page Header */}
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-christina-red/10 flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8 text-christina-red" />
            </div>
            <h1 className="font-playful text-4xl md:text-5xl text-[#1a1a1a] mb-4">
              How Long We Keep Information
            </h1>
            <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
              We hold onto records only as long as we need them to care for your child and to follow
              Minnesota childcare licensing rules. Here is what we keep, and for how long.
            </p>
          </div>
        </ScrollFadeIn>

        {/* Business Info Banner */}
        <ScrollFadeIn direction="up" duration={600} delay={80}>
          <div className="mb-10 p-5 rounded-xl bg-[#faf8f5] border border-[#e5e0d8] flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div>
              <p className="font-semibold text-[#1a1a1a]">Christina&apos;s Child Care Center</p>
              <p className="text-sm text-[#6b6b6b]">5510 W Broadway Ave, Crystal, MN 55428</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
              <a
                href="mailto:info@christinaschildcare.com"
                className="flex items-center gap-2 text-sm text-christina-blue hover:underline"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                info@christinaschildcare.com
              </a>
              <a
                href="tel:7633905870"
                className="flex items-center gap-2 text-sm text-christina-blue hover:underline"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                (763) 390-5870
              </a>
            </div>
          </div>
        </ScrollFadeIn>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <ScrollFadeIn
                key={section.id}
                direction="up"
                duration={650}
                delay={index * 60}
                distance={35}
              >
                <Card className="border-[#e5e0d8] shadow-sm overflow-hidden">
                  <CardHeader className="bg-[#faf8f5] border-b border-[#e5e0d8] py-5 px-6">
                    <CardTitle className="flex items-center gap-3 text-lg font-bold text-christina-red">
                      <div className="w-9 h-9 rounded-lg bg-christina-red/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-christina-red" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 py-5">{section.content}</CardContent>
                </Card>
              </ScrollFadeIn>
            );
          })}
        </div>

        {/* Contact CTA */}
        <ScrollFadeIn direction="up" duration={600} delay={200}>
          <div className="text-center mt-16 p-8 bg-[#faf8f5] rounded-2xl border border-[#e5e0d8]">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Questions About Your Records?</h2>
            <p className="text-[#6b6b6b] mb-6 max-w-xl mx-auto">
              We are happy to explain how long we keep any record and how to have your information
              removed. Reach out by phone or email and we will get back to you promptly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:7633905870"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-christina-red text-white font-medium rounded-lg hover:bg-christina-red/90 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call (763) 390-5870
              </a>
              <a
                href="mailto:info@christinaschildcare.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-christina-red text-christina-red font-medium rounded-lg hover:bg-christina-red/5 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email Us
              </a>
            </div>
          </div>
        </ScrollFadeIn>

      </div>
    </div>
  );
}

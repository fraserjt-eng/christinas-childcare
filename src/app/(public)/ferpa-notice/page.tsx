'use client';

import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Baby, UserCheck, ClipboardList, Eye, Mail, Phone } from 'lucide-react';

interface PolicySection {
  id: string;
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
}

const sections: PolicySection[] = [
  {
    id: 'scope',
    icon: GraduationCap,
    title: 'When These Protections Apply',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          Two laws protect the information we hold about your child. The Children&apos;s Online
          Privacy Protection Act (COPPA) covers children under 13. Where our program is connected to
          a school or receives applicable public education funding, education records are also
          handled under the principles of the Family Educational Rights and Privacy Act (FERPA). This
          notice explains the FERPA-style protections we apply to your child&apos;s records.
        </p>
      </div>
    ),
  },
  {
    id: 'records',
    icon: ClipboardList,
    title: 'What Counts as an Education Record',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>An education record is information we keep that is directly tied to your child, such as:</p>
        <ul className="space-y-2 pl-4">
          {[
            'Enrollment and attendance',
            'Daily reports, learning notes, and progress',
            'Health and dietary information kept for care',
            'Incident and safety records',
            'Photos and media kept in your child\'s file',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-christina-red flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'access',
    icon: UserCheck,
    title: 'Who Can See Your Child\'s Records',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          Access is limited to the people who need it to care for your child. A teacher sees the
          children in their own room. Owners and directors see records for their center. A parent or
          guardian sees their own child, and no one else&apos;s. Our system enforces this at the
          data layer, not just by hiding a button, so one family can never open another
          family&apos;s record. We confirmed this with a direct test.
        </p>
      </div>
    ),
  },
  {
    id: 'rights',
    icon: Baby,
    title: 'Your Rights as a Parent or Guardian',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>You have the right to:</p>
        <ul className="space-y-2 pl-4">
          {[
            'Inspect and review your child\'s records',
            'Ask us to correct information you believe is wrong',
            'Know who has access to your child\'s records',
            'Consent before we share records outside the people who care for your child, except where the law requires disclosure (for example, to state licensing or child-safety authorities)',
            'Request deletion of your data through our Delete My Data page',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-christina-red flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'audit',
    icon: Eye,
    title: 'We Keep an Access Trail',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          Administrative actions on records are logged with who did it and when, so access can be
          reviewed. Safety and incident records are kept as an append-only history, meaning past
          entries are preserved rather than overwritten. This is how we can answer, honestly, who
          saw or changed a record.
        </p>
      </div>
    ),
  },
];

export default function FerpaNoticePage() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">

        {/* Page Header */}
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-christina-red/10 flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-8 w-8 text-christina-red" />
            </div>
            <h1 className="font-playful text-4xl md:text-5xl text-[#1a1a1a] mb-4">
              Children&apos;s Records Notice
            </h1>
            <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
              How we protect your child&apos;s records under COPPA and FERPA-style principles: who
              can see them, your rights, and the access trail we keep.
            </p>
          </div>
        </ScrollFadeIn>

        {/* Business Info Banner */}
        <ScrollFadeIn direction="up" duration={600} delay={80}>
          <div className="mb-10 p-5 rounded-xl bg-[#faf8f5] border border-[#e5e0d8] flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div>
              <p className="font-semibold text-[#1a1a1a]">Christina&apos;s Child Care Center</p>
              <p className="text-sm text-[#6b6b6b]">Updated July 2026</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
              <a
                href="mailto:info@christinaschildcare.com"
                className="flex items-center gap-2 text-sm text-christina-blue hover:underline"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                info@christinaschildcare.com
              </a>
              <a href="tel:7633905870" className="flex items-center gap-2 text-sm text-christina-blue hover:underline">
                <Phone className="h-4 w-4 flex-shrink-0" />
                (763) 390-5870
              </a>
            </div>
          </div>
        </ScrollFadeIn>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <ScrollFadeIn key={section.id} direction="up" duration={600}>
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

      </div>
    </div>
  );
}

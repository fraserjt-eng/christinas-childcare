'use client';

import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Handshake,
  UserCheck,
  CalendarCheck,
  CreditCard,
  Ban,
  Camera,
  Server,
  AlertTriangle,
  Scale,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react';

interface TermsSection {
  id: string;
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
}

const sections: TermsSection[] = [
  {
    id: 'acceptance',
    icon: Handshake,
    title: 'Agreeing to These Terms',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          These Terms of Service govern your use of the Christina&apos;s Child Care Center website
          and online portals. By using this website, submitting an inquiry, or signing in to a
          parent or staff account, you agree to these terms.
        </p>
        <p>
          The care we provide for your child is governed by your separate enrollment agreement and
          our Minnesota childcare license. These website terms do not replace that agreement.
        </p>
      </div>
    ),
  },
  {
    id: 'what-this-is',
    icon: FileText,
    title: 'What This Website Is For',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          This website lets families learn about our programs, ask about enrollment, schedule a
          tour, and, once enrolled, use the parent portal to stay connected. It also gives our staff
          the tools they use day to day.
        </p>
        <p>
          We work to keep the information on this site accurate and current, but we cannot guarantee
          it is always complete or free of errors. Program details and availability can change.
        </p>
      </div>
    ),
  },
  {
    id: 'accounts',
    icon: UserCheck,
    title: 'Parent and Staff Accounts',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          Parent and staff accounts are for the people we have invited. Keep your login and any PIN
          private, and do not share it. You are responsible for activity under your account.
        </p>
        <p>
          Tell us right away if you believe someone else has used your account. We may suspend an
          account that is misused or that puts family or child information at risk.
        </p>
      </div>
    ),
  },
  {
    id: 'inquiries',
    icon: CalendarCheck,
    title: 'Inquiries and Tours',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          Submitting an enrollment inquiry or requesting a tour is a way to start a conversation. It
          is not an offer of a spot, and it does not enroll your child or create a contract.
        </p>
        <p>
          Enrollment is confirmed only through our enrollment process and a signed enrollment
          agreement, subject to availability.
        </p>
      </div>
    ),
  },
  {
    id: 'fees',
    icon: CreditCard,
    title: 'Fees and Payment',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          Tuition, fees, and payment schedules are set out in your enrollment agreement, not on this
          website. Any prices shown here are for general information and may change.
        </p>
      </div>
    ),
  },
  {
    id: 'acceptable-use',
    icon: Ban,
    title: 'Acceptable Use',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>When using this website, please do not:</p>
        <ul className="space-y-2 pl-4">
          {[
            'Try to access accounts, data, or areas you are not authorized to use',
            'Upload anything harmful, unlawful, or that infringes someone else’s rights',
            'Interfere with the normal operation or security of the site',
            'Use the site to harass, impersonate, or mislead others',
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
    id: 'content',
    icon: Camera,
    title: 'Photos and Content',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          Photos, newsletters, and other content shown in the portals are for the use of our
          enrolled families and staff. Please do not copy or share photos of other people&apos;s
          children outside the family they belong to.
        </p>
        <p>
          The Christina&apos;s name, logo, and the design of this site belong to us and may not be
          used without our permission.
        </p>
      </div>
    ),
  },
  {
    id: 'third-party',
    icon: Server,
    title: 'Services We Rely On',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          This website runs on trusted service providers for hosting and data storage (Vercel and
          Supabase) and for sending email. Their handling of data is covered by their own terms. We
          choose providers that meet professional security standards.
        </p>
      </div>
    ),
  },
  {
    id: 'disclaimer',
    icon: AlertTriangle,
    title: 'Website Provided As Is',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          We work hard to keep this website available and accurate, but we provide it on an as-is
          basis. We do not promise it will always be uninterrupted or error free.
        </p>
        <p>
          Nothing on this website is professional, medical, or legal advice. The care of your child
          is governed by your enrollment agreement and our licensing requirements.
        </p>
      </div>
    ),
  },
  {
    id: 'liability',
    icon: Scale,
    title: 'Limitation of Liability',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          To the extent allowed by law, Christina&apos;s Child Care Center is not responsible for
          indirect or incidental damages arising from your use of this website. This does not limit
          any rights you have under your enrollment agreement or under applicable law, including the
          responsibilities we hold as a licensed childcare provider.
        </p>
      </div>
    ),
  },
  {
    id: 'governing-law',
    icon: Scale,
    title: 'Governing Law',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          These terms are governed by the laws of the State of Minnesota. We are licensed and
          regulated by the Minnesota Department of Children, Youth and Families.
        </p>
      </div>
    ),
  },
  {
    id: 'changes',
    icon: RefreshCw,
    title: 'Changes to These Terms',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          We may update these terms from time to time. When we do, we will update the date below.
          Continuing to use the website after a change means you accept the updated terms.
        </p>
        <p className="text-sm text-[#6b6b6b] font-medium">Last updated: June 2026</p>
      </div>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-christina-red/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-christina-red" />
            </div>
            <h1 className="font-playful text-4xl md:text-5xl text-[#1a1a1a] mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
              These terms explain how you may use the Christina&apos;s Child Care Center website and
              portals. The care of your child is governed by your enrollment agreement.
            </p>
          </div>
        </ScrollFadeIn>

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

        <ScrollFadeIn direction="up" duration={600} delay={200}>
          <div className="text-center mt-16 p-8 bg-[#faf8f5] rounded-2xl border border-[#e5e0d8]">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Questions About These Terms?</h2>
            <p className="text-[#6b6b6b] mb-6 max-w-xl mx-auto">
              If anything here is unclear, reach out by phone or email and we will be glad to help.
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

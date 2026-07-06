'use client';

import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield,
  Database,
  Users,
  Baby,
  Clock,
  Share2,
  Cookie,
  BarChart2,
  UserCheck,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react';

interface PolicySection {
  id: string;
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
}

const sections: PolicySection[] = [
  {
    id: 'data-collected',
    icon: Database,
    title: 'What Information We Collect',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          When you submit an enrollment inquiry or schedule a tour through our website, we collect
          the following information:
        </p>
        <ul className="space-y-2 pl-4">
          {[
            'Parent or guardian name',
            'Email address',
            'Phone number',
            'Child\'s name',
            'Child\'s age',
            'Program interest (Infant, Toddler, Preschool, or School Age)',
            'Preferred tour dates',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-christina-red flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          We only ask for what we need to respond to your inquiry and help match your family with
          the right program.
        </p>
      </div>
    ),
  },
  {
    id: 'how-we-use',
    icon: UserCheck,
    title: 'How We Use Your Information',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>Your information is used for three purposes only:</p>
        <ul className="space-y-2 pl-4">
          {[
            'To respond to enrollment inquiries and schedule tours',
            'To communicate with your family about our programs, availability, and enrollment status',
            'To provide childcare services once your family is enrolled',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-christina-red flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          We do not use your information for marketing to outside companies, and we never sell it.
        </p>
      </div>
    ),
  },
  {
    id: 'data-storage',
    icon: Shield,
    title: 'How We Store Your Data',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          Your information is stored securely using industry-standard cloud services (Supabase), which
          encrypts data at rest and in transit. We rely on the same infrastructure used by thousands
          of professional organizations.
        </p>
        <p>
          Our website also uses local device caching to improve page performance. This temporary cache
          does not store personal information and clears automatically when you close your browser.
        </p>
      </div>
    ),
  },
  {
    id: 'who-has-access',
    icon: Users,
    title: 'Who Can Access Your Information',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          Access to family data is limited to the center owner, director, and authorized staff members
          who need it to provide care and communicate with your family. We do not grant access to
          contractors, vendors, or other outside parties.
        </p>
        <p>
          All staff with system access are trained on privacy expectations and are bound by
          confidentiality as part of their employment.
        </p>
      </div>
    ),
  },
  {
    id: 'childrens-privacy',
    icon: Baby,
    title: "Children's Privacy",
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          We collect children&apos;s names and ages solely to match families with the appropriate
          classroom and program. We do not collect any information directly from children, and we
          do not build profiles on individual children beyond what is needed to provide care. We
          collect only what is needed to care for your child, and nothing more.
        </p>
        <p>
          Christina&apos;s Child Care Center complies with the Children&apos;s Online Privacy
          Protection Act (COPPA). We obtain a parent or guardian&apos;s consent before we collect a
          child&apos;s information, and a child&apos;s information is only ever provided to us by the
          parent or guardian who enrolls the family. We do not knowingly collect personal
          information from a child directly.
        </p>
        <p>
          As a parent or guardian, you may review the information we hold about your child at any
          time, and you may request that we correct or delete it. To do so, contact us using the
          information at the bottom of this page or use our{' '}
          <a href="/delete-data" className="text-christina-blue hover:underline">
            data deletion request form
          </a>
          . If you believe a child under 13 has provided us with personal information outside of a
          parent-initiated enrollment inquiry, please contact us right away so we can remove it.
        </p>
      </div>
    ),
  },
  {
    id: 'data-retention',
    icon: Clock,
    title: 'How Long We Keep Your Data',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <ul className="space-y-3 pl-4">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-christina-red flex-shrink-0" />
            <span>
              <strong>Enrollment inquiry data:</strong> Retained for 2 years from the date of
              submission. After that period, it is permanently deleted from our systems.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-christina-red flex-shrink-0" />
            <span>
              <strong>Active family data:</strong> Retained throughout your child&apos;s enrollment
              and for 1 year after enrollment ends. This allows us to provide references and respond
              to follow-up questions during that period.
            </span>
          </li>
        </ul>
        <p>
          You may request deletion of your data at any time using our{' '}
          <a href="/delete-data" className="text-christina-blue hover:underline">
            data deletion request form
          </a>
          , or by contacting us directly. As a licensed childcare provider, we delete what we are
          permitted to and keep only the records Minnesota licensing requires us to retain, then
          remove those once their retention period ends.
        </p>
      </div>
    ),
  },
  {
    id: 'data-sharing',
    icon: Share2,
    title: 'Data Sharing',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          We never sell family data. We never share it with advertisers, data brokers, or marketing
          companies.
        </p>
        <p>
          The only exception is regulatory disclosure. As a licensed childcare provider, we may be
          required to share certain records with the Minnesota Department of Children, Youth and
          Families (DCYF) as part of our licensing obligations. These disclosures occur only when
          required by law.
        </p>
      </div>
    ),
  },
  {
    id: 'cookies',
    icon: Cookie,
    title: 'Cookies',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          Our website uses cookies minimally. The only cookies we set are for authentication and
          session management so that logged-in users (enrolled families and staff) stay signed in
          during their visit.
        </p>
        <p>
          We do not use advertising cookies, tracking pixels, or third-party retargeting of any kind.
          You can disable cookies in your browser settings; note that doing so may affect login
          functionality for parent portal users.
        </p>
      </div>
    ),
  },
  {
    id: 'analytics',
    icon: BarChart2,
    title: 'Analytics',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          We use Vercel Analytics to understand how visitors use our website. This tool collects
          aggregate, anonymized data such as page views and general traffic patterns. No personal
          information is collected or stored by Vercel Analytics, and data is not linked to
          individual users.
        </p>
        <p>
          This helps us improve the website experience for families researching our programs.
        </p>
      </div>
    ),
  },
  {
    id: 'your-rights',
    icon: UserCheck,
    title: 'Your Rights',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>You have the right to:</p>
        <ul className="space-y-2 pl-4">
          {[
            'Request access to the personal information we hold about your family',
            'Request a correction if any information is inaccurate or out of date',
            'Request deletion of your personal information from our systems',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-christina-red flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          To request deletion, use our{' '}
          <a href="/delete-data" className="text-christina-blue hover:underline">
            data deletion request form
          </a>
          . To exercise any other right, contact us using the information at the bottom of this
          page. We will respond within 10 business days.
        </p>
      </div>
    ),
  },
  {
    id: 'policy-updates',
    icon: RefreshCw,
    title: 'Updates to This Policy',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          We may update this privacy policy periodically to reflect changes in our practices or
          applicable law. When we make changes, we will update the date shown at the bottom of this
          page. We encourage you to review this policy occasionally.
        </p>
        <p>
          Continued use of our website after a policy update constitutes your acknowledgment of the
          revised terms.
        </p>
        <p className="text-sm text-[#6b6b6b] font-medium">Last updated: March 2026</p>
      </div>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">

        {/* Page Header */}
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-christina-red/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-christina-red" />
            </div>
            <h1 className="font-playful text-4xl md:text-5xl text-[#1a1a1a] mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
              Christina&apos;s Child Care Center is committed to protecting your family&apos;s
              information. This policy explains what we collect, why we collect it, and how we keep
              it safe.
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

        {/* Policy Sections */}
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
                  <CardContent className="px-6 py-5">
                    {section.content}
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            );
          })}
        </div>

        {/* Contact CTA */}
        <ScrollFadeIn direction="up" duration={600} delay={200}>
          <div className="text-center mt-16 p-8 bg-[#faf8f5] rounded-2xl border border-[#e5e0d8]">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Questions About Your Privacy?</h2>
            <p className="text-[#6b6b6b] mb-6 max-w-xl mx-auto">
              We are happy to answer any questions about how we handle your family&apos;s
              information. Reach out by phone or email and we will get back to you promptly.
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

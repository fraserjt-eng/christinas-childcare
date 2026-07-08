'use client';

import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Server,
  Database,
  Cloud,
  Sparkles,
  Mail,
  ShieldCheck,
  MapPin,
  Ban,
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
    id: 'who-processes',
    icon: Server,
    title: 'Who Helps Us Handle Your Data',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          Running a childcare center means using a few trusted technology companies to keep the
          website online, store records safely, and send you messages. These companies are called
          subprocessors: they handle data on our behalf so we can serve your family. We keep the
          list short, and we only work with providers that meet strong security standards.
        </p>
        <p>
          Each one is described below, along with what it does and the promise it makes to protect
          your information.
        </p>
      </div>
    ),
  },
  {
    id: 'supabase',
    icon: Database,
    title: 'Supabase: Our Database and File Storage',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          Supabase stores our records and files, including enrollment details, family and child
          information, and photos shared through the parent portal. Data is encrypted at rest and in
          transit, and access is limited to the accounts that need it.
        </p>
        <p>
          Supabase is bound by its own security and privacy commitments to protect the data it holds
          for us. It processes data only to provide the storage service, not for its own purposes.
        </p>
      </div>
    ),
  },
  {
    id: 'vercel',
    icon: Cloud,
    title: 'Vercel: Website Hosting',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          Vercel hosts our website and delivers its pages to your browser. When you visit the site,
          Vercel handles the request so the page loads quickly and securely over an encrypted
          connection.
        </p>
        <p>
          Vercel is bound to protect the information that passes through its service and to use it
          only to deliver our website to you.
        </p>
      </div>
    ),
  },
  {
    id: 'anthropic',
    icon: Sparkles,
    title: 'Anthropic: AI Features',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          Some helper features on our site use Anthropic&apos;s Claude AI, for example to draft
          lesson ideas or summaries for staff. When a feature uses AI, only the information needed
          for that task is sent, and it is used to produce the result you asked for.
        </p>
        <p>
          Anthropic is bound to protect that information and does not use it to train its AI models.
          We do not send children&apos;s personal records to AI features as part of everyday care.
        </p>
      </div>
    ),
  },
  {
    id: 'email',
    icon: Mail,
    title: 'Email Provider: Notifications',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          We use an email service to send notifications, such as enrollment updates, tour
          confirmations, and messages from the center. This provider handles the email address and
          message needed to deliver those notes to you.
        </p>
        <p>
          Our email provider is bound to protect that information and to use it only to deliver the
          messages we send on your behalf. We do not use it for outside advertising.
        </p>
      </div>
    ),
  },
  {
    id: 'bound-to-protect',
    icon: ShieldCheck,
    title: 'They Are Bound to Protect Your Data',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          Every company listed here works under an agreement that requires it to protect your
          information and to process it only to provide its service to us. None of them may use your
          family&apos;s data for their own marketing, and none may share it with outside parties for
          advertising.
        </p>
        <p>
          We review the providers we use and keep the list as small as the center&apos;s needs
          allow.
        </p>
      </div>
    ),
  },
  {
    id: 'data-location',
    icon: MapPin,
    title: 'Your Data Stays in the United States',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          The records and files we hold are stored on servers located in the United States. Your
          family&apos;s information is not moved overseas as part of our normal operations.
        </p>
      </div>
    ),
  },
  {
    id: 'no-sale-no-training',
    icon: Ban,
    title: 'We Never Sell Your Data or Use It to Train AI',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          We never sell your family&apos;s information, and we never share it with data brokers or
          advertisers. We also do not use your data, or your child&apos;s data, to train AI models.
        </p>
        <p>
          Your information is here to help us care for your child and communicate with you, and
          nothing more.
        </p>
      </div>
    ),
  },
];

export default function DataProcessingPage() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">

        {/* Page Header */}
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-christina-red/10 flex items-center justify-center mx-auto mb-6">
              <Server className="h-8 w-8 text-christina-red" />
            </div>
            <h1 className="font-playful text-4xl md:text-5xl text-[#1a1a1a] mb-4">
              How We Handle Your Data
            </h1>
            <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
              A few trusted companies help us keep the site running, store records safely, and send
              you messages. Here is who they are, what they do, and how your family&apos;s
              information stays protected.
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
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Questions About Your Data?</h2>
            <p className="text-[#6b6b6b] mb-6 max-w-xl mx-auto">
              We are happy to explain who touches your family&apos;s information and why. Reach out
              by phone or email and we will get back to you promptly.
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

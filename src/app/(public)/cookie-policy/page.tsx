'use client';

import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, Lock, BarChart2, Settings, Mail, Phone } from 'lucide-react';

interface PolicySection {
  id: string;
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
}

const sections: PolicySection[] = [
  {
    id: 'what',
    icon: Cookie,
    title: 'What Cookies Are',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          A cookie is a small file a website stores on your device so it can remember something
          between pages or visits. We use a small number of cookies, and only for the site to work
          and to understand how it is used. We do not sell your information and we do not use
          advertising cookies that follow you around the web.
        </p>
      </div>
    ),
  },
  {
    id: 'essential',
    icon: Lock,
    title: 'Cookies That Keep You Signed In',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          When a parent, staff member, or owner signs in, we set one secure session cookie. It keeps
          you logged in as you move between pages. This cookie is:
        </p>
        <ul className="space-y-2 pl-4">
          {[
            'HttpOnly, so it cannot be read by scripts in your browser',
            'Secure, so it only travels over an encrypted connection',
            'Signed, so it cannot be forged or tampered with',
            'Temporary, so it clears when your session ends',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-christina-red flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>The site cannot keep you signed in without this cookie, so it is always on when you log in.</p>
      </div>
    ),
  },
  {
    id: 'analytics',
    icon: BarChart2,
    title: 'Understanding How the Site Is Used',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          We use privacy-respecting analytics from our hosting provider to see which pages families
          visit and whether the site is fast and working. This tells us how the site performs, not
          who you are. It does not build an advertising profile and it is never tied to a child.
        </p>
      </div>
    ),
  },
  {
    id: 'control',
    icon: Settings,
    title: 'Your Control',
    content: (
      <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
        <p>
          You can clear or block cookies in your browser settings at any time. If you block the
          session cookie, you can still browse the public site, but you will not be able to stay
          signed in to the parent, staff, or owner areas. We do not show a cookie consent pop-up
          because we do not use tracking or advertising cookies that would require one.
        </p>
      </div>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">

        {/* Page Header */}
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-christina-red/10 flex items-center justify-center mx-auto mb-6">
              <Cookie className="h-8 w-8 text-christina-red" />
            </div>
            <h1 className="font-playful text-4xl md:text-5xl text-[#1a1a1a] mb-4">Cookie Policy</h1>
            <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
              We keep cookies to a minimum: one to keep you signed in, and privacy-respecting
              analytics to keep the site working. No advertising, no tracking, nothing sold.
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

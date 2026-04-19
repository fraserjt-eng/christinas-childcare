'use client';

import Link from 'next/link';
import { ScrollFadeIn, ScrollFadeInStagger } from '@/components/features/ScrollFadeIn';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CalendarClock,
  ClipboardList,
  Sparkles,
  Wallet,
  MessagesSquare,
  LineChart,
  Mail,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Users,
  Quote,
} from 'lucide-react';

const CONTACT_EMAIL = 'hello@christinaschildcare.com';
const WALKTHROUGH_MAILTO = `mailto:${CONTACT_EMAIL}?subject=Platform%20walkthrough%20request&body=Hi%20Christina%2C%0A%0AI%20run%20a%20child%20care%20center%20and%20I%27d%20like%20a%2020-minute%20walkthrough%20of%20your%20platform.%0A%0AMy%20name%3A%0AMy%20center%3A%0ACity%2FState%3A%0ABest%20time%20to%20talk%3A%0A%0AThanks.`;

const capabilities = [
  {
    icon: CalendarClock,
    name: 'Scheduling & Staffing',
    line: 'Coverage that staffs itself, ratio checks in real time, auto clock-out at close.',
  },
  {
    icon: ClipboardList,
    name: 'CACFP & Compliance',
    line: 'Meal counts, menus, licensing records. One screen, audit-ready every day.',
  },
  {
    icon: Users,
    name: 'Enrollment & Tours',
    line: 'Inquiry capture, tour requests, follow-up prompts, and an honest pipeline view.',
  },
  {
    icon: Wallet,
    name: 'Financials & Billing',
    line: 'Tuition, revenue forecast, subsidy tracking, and expense visibility in one place.',
  },
  {
    icon: MessagesSquare,
    name: 'Family Communication',
    line: 'Daily photos, newsletters, messages, and read receipts without another app.',
  },
  {
    icon: LineChart,
    name: 'Intelligence & Reporting',
    line: 'What is going well, what is drifting, what needs attention. No guessing.',
  },
];

const whatYouGet = [
  'A working admin dashboard covering scheduling, HR, incidents, tasks, and compliance.',
  'A staff portal with clock in and out, meal counts, daily photos, and training.',
  'A parent portal with messages, photos, newsletters, and child progress.',
  'CACFP meal and menu tracking with an audit trail.',
  'Enrollment inquiry capture, tour requests, and revenue forecasting.',
  'Licensed-center safeguards: HTML sanitization, HMAC-signed session cookies, RLS on the database.',
];

const steps = [
  {
    number: '01',
    title: 'See it running',
    body: 'Open christinas-childcare.vercel.app. Click around the public site. This is the front end families see at a real operating center.',
  },
  {
    number: '02',
    title: 'Book a 20-minute walkthrough',
    body: 'I will screen share the admin, staff, and parent portals. You ask the questions. No pitch deck.',
  },
  {
    number: '03',
    title: 'Decide if it fits',
    body: 'If it fits your operation, we talk about onboarding. If not, you walk away with ideas you can use either way.',
  },
];

const faqs = [
  {
    q: 'Who is this for?',
    a: 'Small and family-owned child care centers. One to two sites. Directors who still run the floor and want their admin work to stop eating evenings.',
  },
  {
    q: 'What does it cost?',
    a: 'Walkthroughs are free. Pricing depends on center size and what you want turned on. I will quote you after the walkthrough, not before.',
  },
  {
    q: 'Do you train my staff?',
    a: 'Yes. Staff onboarding is included. Video training is built in. Your teachers can use it on day one.',
  },
  {
    q: 'What about CACFP and licensing?',
    a: 'CACFP meal counts, menus, and an audit trail are built in. Licensing records live in the same dashboard. Minnesota DCYF is our live test case.',
  },
  {
    q: 'Can I try it before I commit?',
    a: 'The parent site at christinas-childcare.vercel.app is live and public. After the walkthrough I can stand up a sandbox for you to click around.',
  },
  {
    q: 'Is my data mine?',
    a: 'Yes. Your center owns its data. Export is available in standard formats whenever you ask.',
  },
  {
    q: 'Is this a franchise?',
    a: 'No. This is the operational platform only. Your brand, your staff, your families. You run your center. I give you the system.',
  },
  {
    q: 'How do I know it actually works?',
    a: 'Because I use it every day to run my own center in Crystal, Minnesota. Twenty years of operating experience is baked into every screen.',
  },
];

export default function PlatformPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-[#f5f0e8] py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-12 left-12 w-64 h-64 bg-[#C62828]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-12 right-12 w-96 h-96 bg-[#FFD54F]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollFadeIn direction="up" duration={700}>
              <p className="text-xs uppercase tracking-[0.25em] text-[#C62828] mb-6 font-semibold">
                For Child Care Owners &amp; Directors
              </p>
            </ScrollFadeIn>
            <ScrollFadeIn direction="up" duration={700} delay={100}>
              <h1 className="font-playful text-4xl md:text-5xl lg:text-6xl text-[#1a1a1a] mb-6 leading-tight">
                Run your center like Christina runs hers.
              </h1>
            </ScrollFadeIn>
            <ScrollFadeIn direction="up" duration={700} delay={200}>
              <p className="text-xl md:text-2xl text-[#4a4a4a] max-w-2xl mx-auto leading-relaxed mb-10">
                The platform a real operating director built for herself.
                Now open to you.
              </p>
            </ScrollFadeIn>
            <ScrollFadeIn direction="up" duration={700} delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-christina-red hover:bg-christina-red/90 text-white px-8 py-6 text-base"
                >
                  <a href={WALKTHROUGH_MAILTO} className="flex items-center gap-2">
                    <Mail className="h-5 w-5" /> Book a 20-minute walkthrough
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-[#C62828]/30 text-[#C62828] hover:bg-[#C62828]/5 px-8 py-6 text-base"
                >
                  <Link href="/" className="flex items-center gap-2">
                    See it running <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Proof bar */}
      <section className="bg-white border-y border-[#e5e0d8] py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[#6b6b6b]">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#C62828]" /> Licensed by Minnesota DCYF
            </span>
            <span className="hidden sm:block h-3 w-px bg-[#e5e0d8]" />
            <span>20+ years operating experience</span>
            <span className="hidden sm:block h-3 w-px bg-[#e5e0d8]" />
            <span>150+ families served</span>
            <span className="hidden sm:block h-3 w-px bg-[#e5e0d8]" />
            <span>Real, running today</span>
          </div>
        </div>
      </section>

      {/* Capability grid */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6b6b6b] mb-4">
                What The Platform Does
              </p>
              <h2 className="font-playful text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] mb-4">
                Six systems. One place.
              </h2>
              <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
                Every operation a director runs during a normal week. Built by a director during her normal week.
              </p>
            </div>
          </ScrollFadeIn>

          <ScrollFadeInStagger
            staggerDelay={100}
            baseDelay={150}
            duration={600}
            direction="up"
            distance={30}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {capabilities.map((item) => (
              <Card
                key={item.name}
                className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
              >
                <CardContent className="p-6 md:p-8">
                  <div className="w-12 h-12 rounded-full bg-[#C62828]/10 flex items-center justify-center mb-5">
                    <item.icon className="h-6 w-6 text-[#C62828]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{item.name}</h3>
                  <p className="text-[#6b6b6b] leading-relaxed">{item.line}</p>
                </CardContent>
              </Card>
            ))}
          </ScrollFadeInStagger>
        </div>
      </section>

      {/* Director story */}
      <section className="bg-[#f5f0e8] py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
            <ScrollFadeIn direction="left" duration={700}>
              <div className="md:col-span-1 flex flex-col items-center md:items-start">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#C62828] to-[#c44536] flex items-center justify-center shadow-md">
                  <span className="text-5xl font-playful text-white">CF</span>
                </div>
                <div className="mt-6 text-center md:text-left">
                  <p className="font-bold text-[#1a1a1a] text-lg">Christina Fraser</p>
                  <p className="text-sm text-[#6b6b6b]">Director &amp; Founder</p>
                  <p className="text-sm text-[#6b6b6b]">Crystal, Minnesota</p>
                  <p className="text-xs text-[#C62828] font-medium mt-2">20+ years in early childhood education</p>
                </div>
              </div>
            </ScrollFadeIn>

            <ScrollFadeIn direction="right" duration={700} delay={100}>
              <div className="md:col-span-2 relative">
                <Quote className="h-10 w-10 text-[#C62828]/20 mb-4" />
                <div className="space-y-5 text-lg text-[#4a4a4a] leading-relaxed">
                  <p>
                    I spent two decades running floors, covering ratios, and doing the paperwork after the kids went home. I tried the big platforms. They felt like they were built by people who had never met a meal-count sheet.
                  </p>
                  <p>
                    So I built the system I wished I had. Scheduling that actually reflects how a real classroom works. A tour flow that follows up so the seats do not sit empty. A compliance view that an inspector can trust.
                  </p>
                  <p>
                    It runs my center every day. If it can hold up to our Monday mornings, it can hold up to yours.
                  </p>
                </div>
                <p className="mt-6 text-sm text-[#C62828] font-semibold uppercase tracking-wider">
                  Built by a director. For directors.
                </p>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* What you actually get */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6b6b6b] mb-4">
                The Actual Deliverable
              </p>
              <h2 className="font-playful text-3xl md:text-4xl text-[#1a1a1a] mb-4">
                What you actually get.
              </h2>
            </div>
          </ScrollFadeIn>

          <ScrollFadeIn direction="up" duration={700} delay={100}>
            <div className="max-w-3xl mx-auto">
              <ul className="space-y-4">
                {whatYouGet.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#C62828] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-lg text-[#4a4a4a] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#f5f0e8] py-20 md:py-28">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6b6b6b] mb-4">
                How This Works
              </p>
              <h2 className="font-playful text-3xl md:text-4xl text-[#1a1a1a]">
                Three steps. No pitch deck.
              </h2>
            </div>
          </ScrollFadeIn>

          <ScrollFadeInStagger
            staggerDelay={120}
            baseDelay={150}
            duration={700}
            direction="up"
            distance={30}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {steps.map((step) => (
              <Card key={step.number} className="border-0 shadow-sm bg-white h-full">
                <CardContent className="p-8">
                  <p className="font-playful text-5xl text-[#C62828]/30 mb-4">{step.number}</p>
                  <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">{step.title}</h3>
                  <p className="text-[#6b6b6b] leading-relaxed">{step.body}</p>
                </CardContent>
              </Card>
            ))}
          </ScrollFadeInStagger>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6b6b6b] mb-4">
                The Questions Other Directors Ask
              </p>
              <h2 className="font-playful text-3xl md:text-4xl text-[#1a1a1a]">
                Frequently asked.
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((item, index) => (
              <ScrollFadeIn key={item.q} direction="up" duration={600} delay={index * 60}>
                <Card className="border-0 shadow-sm bg-[#f5f0e8]/60">
                  <CardContent className="p-6 md:p-7">
                    <h3 className="text-lg font-bold text-[#1a1a1a] mb-2 flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-[#C62828] flex-shrink-0 mt-1" strokeWidth={1.5} />
                      {item.q}
                    </h3>
                    <p className="text-[#4a4a4a] leading-relaxed pl-7">{item.a}</p>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-[#1a1a1a] py-20 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#C62828] to-[#c44536] flex items-center justify-center shadow-lg">
              <span className="text-3xl font-playful text-white">CF</span>
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={100}>
            <h2 className="font-playful text-3xl md:text-4xl text-white mb-4">
              Come see how I run mine.
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={200}>
            <p className="text-white/70 text-lg max-w-2xl mx-auto font-light mb-8">
              Twenty minutes. Screen share. You ask. I answer. Then you decide.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={300}>
            <Button
              asChild
              size="lg"
              className="bg-christina-red hover:bg-christina-red/90 text-white px-8 py-6 text-base"
            >
              <a href={WALKTHROUGH_MAILTO} className="flex items-center gap-2">
                <Mail className="h-5 w-5" /> Book a 20-minute walkthrough
              </a>
            </Button>
          </ScrollFadeIn>
          <ScrollFadeIn direction="none" duration={800} delay={450}>
            <p className="text-white/40 text-sm mt-8">
              Or email {CONTACT_EMAIL} directly. Crystal, Minnesota. Licensed by Minnesota DCYF.
            </p>
          </ScrollFadeIn>
        </div>
      </section>
    </div>
  );
}

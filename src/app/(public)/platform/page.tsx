'use client';

import Link from 'next/link';
import { useT } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/lib/i18n';
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
  { icon: CalendarClock, nameKey: 'platform.cap1Name', lineKey: 'platform.cap1Line' },
  { icon: ClipboardList, nameKey: 'platform.cap2Name', lineKey: 'platform.cap2Line' },
  { icon: Users, nameKey: 'platform.cap3Name', lineKey: 'platform.cap3Line' },
  { icon: Wallet, nameKey: 'platform.cap4Name', lineKey: 'platform.cap4Line' },
  { icon: MessagesSquare, nameKey: 'platform.cap5Name', lineKey: 'platform.cap5Line' },
  { icon: LineChart, nameKey: 'platform.cap6Name', lineKey: 'platform.cap6Line' },
];

const whatYouGet = [
  'platform.getItem1',
  'platform.getItem2',
  'platform.getItem3',
  'platform.getItem4',
  'platform.getItem5',
  'platform.getItem6',
];

const steps = [
  { number: '01', titleKey: 'platform.step1Title', bodyKey: 'platform.step1Body' },
  { number: '02', titleKey: 'platform.step2Title', bodyKey: 'platform.step2Body' },
  { number: '03', titleKey: 'platform.step3Title', bodyKey: 'platform.step3Body' },
];

const faqs = [
  { qKey: 'platform.faq1Q', aKey: 'platform.faq1A' },
  { qKey: 'platform.faq2Q', aKey: 'platform.faq2A' },
  { qKey: 'platform.faq3Q', aKey: 'platform.faq3A' },
  { qKey: 'platform.faq4Q', aKey: 'platform.faq4A' },
  { qKey: 'platform.faq5Q', aKey: 'platform.faq5A' },
  { qKey: 'platform.faq6Q', aKey: 'platform.faq6A' },
  { qKey: 'platform.faq7Q', aKey: 'platform.faq7A' },
  { qKey: 'platform.faq8Q', aKey: 'platform.faq8A' },
];

export default function PlatformPage() {
  const t = useT();
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
                {t('platform.heroEyebrow')}
              </p>
            </ScrollFadeIn>
            <ScrollFadeIn direction="up" duration={700} delay={100}>
              <h1 className="font-playful text-4xl md:text-5xl lg:text-6xl text-[#1a1a1a] mb-6 leading-tight">
                {t('platform.heroTitle')}
              </h1>
            </ScrollFadeIn>
            <ScrollFadeIn direction="up" duration={700} delay={200}>
              <p className="text-xl md:text-2xl text-[#4a4a4a] max-w-2xl mx-auto leading-relaxed mb-10">
                {t('platform.heroSubtitle')}
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
                    <Mail className="h-5 w-5" /> {t('platform.ctaWalkthrough')}
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-[#C62828]/30 text-[#C62828] hover:bg-[#C62828]/5 px-8 py-6 text-base"
                >
                  <Link href="/" className="flex items-center gap-2">
                    {t('platform.ctaSeeItRunning')} <ArrowRight className="h-4 w-4" />
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
              <ShieldCheck className="h-4 w-4 text-[#C62828]" /> {t('platform.proofLicensed')}
            </span>
            <span className="hidden sm:block h-3 w-px bg-[#e5e0d8]" />
            <span>{t('platform.proofYears')}</span>
            <span className="hidden sm:block h-3 w-px bg-[#e5e0d8]" />
            <span>{t('platform.proofFamilies')}</span>
            <span className="hidden sm:block h-3 w-px bg-[#e5e0d8]" />
            <span>{t('platform.proofRunning')}</span>
          </div>
        </div>
      </section>

      {/* Capability grid */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6b6b6b] mb-4">
                {t('platform.capEyebrow')}
              </p>
              <h2 className="font-playful text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] mb-4">
                {t('platform.capTitle')}
              </h2>
              <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
                {t('platform.capSubtitle')}
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
                key={item.nameKey}
                className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
              >
                <CardContent className="p-6 md:p-8">
                  <div className="w-12 h-12 rounded-full bg-[#C62828]/10 flex items-center justify-center mb-5">
                    <item.icon className="h-6 w-6 text-[#C62828]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{t(item.nameKey as TranslationKey)}</h3>
                  <p className="text-[#6b6b6b] leading-relaxed">{t(item.lineKey as TranslationKey)}</p>
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
                  <p className="text-sm text-[#6b6b6b]">{t('platform.directorRole')}</p>
                  <p className="text-sm text-[#6b6b6b]">Crystal, Minnesota</p>
                  <p className="text-xs text-[#C62828] font-medium mt-2">{t('platform.directorYears')}</p>
                </div>
              </div>
            </ScrollFadeIn>

            <ScrollFadeIn direction="right" duration={700} delay={100}>
              <div className="md:col-span-2 relative">
                <Quote className="h-10 w-10 text-[#C62828]/20 mb-4" />
                <div className="space-y-5 text-lg text-[#4a4a4a] leading-relaxed">
                  <p>{t('platform.storyP1')}</p>
                  <p>{t('platform.storyP2')}</p>
                  <p>{t('platform.storyP3')}</p>
                </div>
                <p className="mt-6 text-sm text-[#C62828] font-semibold uppercase tracking-wider">
                  {t('platform.storyTagline')}
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
                {t('platform.getEyebrow')}
              </p>
              <h2 className="font-playful text-3xl md:text-4xl text-[#1a1a1a] mb-4">
                {t('platform.getTitle')}
              </h2>
            </div>
          </ScrollFadeIn>

          <ScrollFadeIn direction="up" duration={700} delay={100}>
            <div className="max-w-3xl mx-auto">
              <ul className="space-y-4">
                {whatYouGet.map((itemKey) => (
                  <li key={itemKey} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#C62828] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-lg text-[#4a4a4a] leading-relaxed">{t(itemKey as TranslationKey)}</span>
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
                {t('platform.howEyebrow')}
              </p>
              <h2 className="font-playful text-3xl md:text-4xl text-[#1a1a1a]">
                {t('platform.howTitle')}
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
                  <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">{t(step.titleKey as TranslationKey)}</h3>
                  <p className="text-[#6b6b6b] leading-relaxed">{t(step.bodyKey as TranslationKey)}</p>
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
                {t('platform.faqEyebrow')}
              </p>
              <h2 className="font-playful text-3xl md:text-4xl text-[#1a1a1a]">
                {t('platform.faqTitle')}
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((item, index) => (
              <ScrollFadeIn key={item.qKey} direction="up" duration={600} delay={index * 60}>
                <Card className="border-0 shadow-sm bg-[#f5f0e8]/60">
                  <CardContent className="p-6 md:p-7">
                    <h3 className="text-lg font-bold text-[#1a1a1a] mb-2 flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-[#C62828] flex-shrink-0 mt-1" strokeWidth={1.5} />
                      {t(item.qKey as TranslationKey)}
                    </h3>
                    <p className="text-[#4a4a4a] leading-relaxed pl-7">{t(item.aKey as TranslationKey)}</p>
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
              {t('platform.closingTitle')}
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={200}>
            <p className="text-white/70 text-lg max-w-2xl mx-auto font-light mb-8">
              {t('platform.closingSubtitle')}
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={300}>
            <Button
              asChild
              size="lg"
              className="bg-christina-red hover:bg-christina-red/90 text-white px-8 py-6 text-base"
            >
              <a href={WALKTHROUGH_MAILTO} className="flex items-center gap-2">
                <Mail className="h-5 w-5" /> {t('platform.ctaWalkthrough')}
              </a>
            </Button>
          </ScrollFadeIn>
          <ScrollFadeIn direction="none" duration={800} delay={450}>
            <p className="text-white/40 text-sm mt-8">
              {t('platform.closingEmail').replace('{email}', CONTACT_EMAIL)}
            </p>
          </ScrollFadeIn>
        </div>
      </section>
    </div>
  );
}

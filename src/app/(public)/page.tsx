'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { ParallaxHero } from '@/components/features/ParallaxHero';
import { ScrollFadeIn, ScrollFadeInStagger } from '@/components/features/ScrollFadeIn';
import { SeasonalBanner } from '@/components/features/SeasonalBanner';
import { KioskBanner } from '@/components/features/KioskBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Heart,
  Shield,
  Star,
  Users,
  Clock,
  MapPin,
  Quote,
  CheckCircle,
  GraduationCap,
  Baby,
  Award,
  Calendar,
} from 'lucide-react';
import { NewsFeed } from '@/components/features/NewsFeed';
import { useT } from '@/contexts/LanguageContext';

const trustSignals = [
  { icon: Shield, key: 'home.trustLicensed' },
  { icon: CheckCircle, key: 'home.trustSince' },
  { icon: Users, key: 'home.trustFamilies' },
  { icon: Award, key: 'home.trustBackground' },
  { icon: Heart, key: 'home.trustCpr' },
] as const;

const features = [
  {
    icon: Shield,
    titleKey: 'home.featureLicensedTitle',
    descKey: 'home.featureLicensedDesc',
  },
  {
    icon: BookOpen,
    titleKey: 'home.featureCurriculumTitle',
    descKey: 'home.featureCurriculumDesc',
  },
  {
    icon: Heart,
    titleKey: 'home.featureStaffTitle',
    descKey: 'home.featureStaffDesc',
  },
  {
    icon: Clock,
    titleKey: 'home.featureScheduleTitle',
    descKey: 'home.featureScheduleDesc',
  },
  {
    icon: Users,
    titleKey: 'home.featureRatiosTitle',
    descKey: 'home.featureRatiosDesc',
  },
  {
    icon: Star,
    titleKey: 'home.featureCommsTitle',
    descKey: 'home.featureCommsDesc',
  },
] as const;

const ratios = [
  { programKey: 'home.ratioInfants', ratio: '1:4', icon: Baby },
  { programKey: 'home.ratioToddlers', ratio: '1:5', icon: Heart },
  { programKey: 'home.ratioPreschool', ratio: '1:8', icon: BookOpen },
  { programKey: 'home.ratioSchoolAge', ratio: '1:12', icon: GraduationCap },
] as const;

const testimonials = [
  {
    quoteKey: 'home.testimonial1Quote',
    name: 'Sarah M.',
    relationKey: 'home.testimonial1Relation',
  },
  {
    quoteKey: 'home.testimonial2Quote',
    name: 'James & Tanya R.',
    relationKey: 'home.testimonial2Relation',
  },
  {
    quoteKey: 'home.testimonial3Quote',
    name: 'Michelle K.',
    relationKey: 'home.testimonial3Relation',
  },
] as const;

const staff = [
  {
    name: 'Ophelia Zeogar',
    roleKey: 'home.staff1Role',
    credentialsKey: 'home.staff1Credentials',
    years: 8,
    bioKey: 'home.staff1Bio',
    funFactKey: 'home.staff1FunFact',
  },
  {
    name: 'Stephen Zeogar',
    roleKey: 'home.staff2Role',
    credentialsKey: 'home.staff2Credentials',
    years: 6,
    bioKey: 'home.staff2Bio',
    funFactKey: 'home.staff2FunFact',
  },
  {
    name: 'Christina Fraser',
    roleKey: 'home.staff3Role',
    credentialsKey: 'home.staff3Credentials',
    years: 20,
    bioKey: 'home.staff3Bio',
    funFactKey: 'home.staff3FunFact',
  },
] as const;

function AnimatedStat({ value, label }: { value: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start: number;
    let frame: number;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 2000, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [started, value]);

  return (
    <div ref={ref}>
      <p className="text-4xl md:text-5xl font-light text-white mb-2">
        {count}
        <span className="text-3xl">+</span>
      </p>
      <p className="text-white/60 text-sm tracking-wide">{label}</p>
    </div>
  );
}

const stats = [
  { value: 20, suffix: '+', labelKey: 'home.statYears' },
  { value: 150, suffix: '+', labelKey: 'home.statFamilies' },
  { value: 4, suffix: '', labelKey: 'home.statPrograms' },
  { value: 5, suffix: '★', labelKey: 'home.statRating' },
] as const;

export default function HomePage() {
  const t = useT();
  // Review schema for testimonials — lets AI search engines cite individual reviews
  const reviewsSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: testimonials.map((review, idx) => ({
      '@type': 'Review',
      position: idx + 1,
      reviewBody: t(review.quoteKey),
      author: {
        '@type': 'Person',
        name: review.name,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      itemReviewed: {
        '@id': 'https://christinas-childcare.vercel.app/#organization',
      },
    })),
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsSchema) }}
      />
      {/* Seasonal Banner */}
      <SeasonalBanner />

      {/* Kiosk quick-access (sits under the seasonal "Summer Registration" banner) */}
      <KioskBanner />

      {/* Parallax Hero */}
      <ParallaxHero />

      {/* Trust Signals Bar */}
      <section className="bg-[#1a1a1a] py-4 border-y border-[#333]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {trustSignals.map((signal) => (
              <div key={signal.key} className="flex items-center gap-2 text-white/80">
                <signal.icon className="h-4 w-4 text-christina-yellow" />
                <span className="text-sm font-medium">{t(signal.key)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Staff-to-Child Ratios */}
      <section className="bg-[#f5f0e8] py-6 border-b border-[#e5e0d8]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            <span className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] font-medium">{t('home.ourRatios')}</span>
            {ratios.map((r) => (
              <div key={r.programKey} className="flex items-center gap-2">
                <r.icon className="h-4 w-4 text-christina-red" />
                <span className="text-sm text-[#1a1a1a]">
                  <span className="font-medium">{t(r.programKey)}:</span>{' '}
                  <span className="text-christina-red font-bold">{r.ratio}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Transportation Banner */}
      <section className="bg-white py-16 border-b border-[#e5e0d8]">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
              <div className="rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                <Image
                  src="/images/community.png"
                  alt={t('home.vanAlt')}
                  width={160}
                  height={120}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-2">{t('home.includedService')}</p>
                <h2 className="font-playful text-3xl md:text-4xl text-[#1a1a1a] mb-2">
                  {t('home.freeTransportation')}
                </h2>
                <p className="text-[#6b6b6b]">
                  {t('home.freeTransportationDesc')}
                </p>
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={600}>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-4">{t('home.ourPromise')}</p>
              <h2 className="font-playful text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] mb-4">
                {t('home.whyChooseUs')}
              </h2>
              <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
                {t('home.whyChooseUsDesc')}
              </p>
            </div>
          </ScrollFadeIn>
          <ScrollFadeInStagger
            staggerDelay={100}
            baseDelay={200}
            duration={600}
            direction="up"
            distance={30}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-5xl mx-auto"
          >
            {features.map((feature) => (
              <div key={feature.titleKey} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-50">
                  <feature.icon className="w-6 h-6 text-[#C62828]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-[#1a1a1a] mb-2">{t(feature.titleKey)}</h3>
                <p className="text-[#6b6b6b] text-sm leading-relaxed">{t(feature.descKey)}</p>
              </div>
            ))}
          </ScrollFadeInStagger>
        </div>
      </section>

      {/* Family Photo Section */}
      <section className="relative">
        <div className="aspect-[21/9] relative overflow-hidden">
          <Image
            src="/family.jpg"
            alt={t('home.familyPhotoAlt')}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="font-playful text-xl md:text-2xl">{t('home.familyOwnedSince')}</p>
            <p className="text-white/80 text-sm">{t('home.familyServing')}</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#fafafa] py-24">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={600}>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-4">{t('home.testimonialsLabel')}</p>
              <h2 className="font-playful text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a]">
                {t('home.whatParentsSay')}
              </h2>
            </div>
          </ScrollFadeIn>
          <ScrollFadeInStagger
            staggerDelay={150}
            baseDelay={100}
            duration={700}
            direction="up"
            distance={40}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {testimonials.map((review, i) => (
              <Card key={i} className="bg-white border-0 shadow-sm">
                <CardContent className="pt-8 pb-6 px-6">
                  <Quote className="w-8 h-8 text-[#1a1a1a]/10 mb-4" />
                  <p className="text-[#6b6b6b] italic mb-6 leading-relaxed">&ldquo;{t(review.quoteKey)}&rdquo;</p>
                  <div>
                    <p className="font-medium text-[#1a1a1a]">{review.name}</p>
                    <p className="text-sm text-[#6b6b6b]">{t(review.relationKey)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollFadeInStagger>
        </div>
      </section>

      {/* Staff Highlights */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={600}>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-4">{t('home.ourTeam')}</p>
              <h2 className="font-playful text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] mb-4">
                {t('home.meetThePeople')}
              </h2>
              <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
                {t('home.meetThePeopleDesc')}
              </p>
            </div>
          </ScrollFadeIn>
          <ScrollFadeInStagger
            staggerDelay={150}
            baseDelay={100}
            duration={700}
            direction="up"
            distance={35}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {staff.map((member) => (
              <Card key={member.name} className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-christina-red/10 to-christina-coral/10 p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-white mx-auto mb-4 flex items-center justify-center shadow-sm">
                      <span className="text-2xl font-playful text-christina-red">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1a1a1a]">{member.name}</h3>
                    <p className="text-sm text-christina-red font-medium">{t(member.roleKey)}</p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="h-4 w-4 text-[#6b6b6b]" />
                      <span className="text-xs text-[#6b6b6b]">{t(member.credentialsKey)} · {t('home.staffYears').replace('{years}', String(member.years))}</span>
                    </div>
                    <p className="text-[#6b6b6b] text-sm leading-relaxed mb-3">{t(member.bioKey)}</p>
                    <p className="text-xs text-christina-red/80 italic">{t('home.funFactLabel')} {t(member.funFactKey)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollFadeInStagger>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="bg-[#1a1a1a] py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
            {stats.map((stat) => (
              <AnimatedStat key={stat.labelKey} value={stat.value} suffix={stat.suffix} label={t(stat.labelKey)} />
            ))}
          </div>
        </div>
      </section>

      {/* News & Updates Feed */}
      <NewsFeed />

      {/* Enrollment CTA Banner */}
      <section className="bg-[#c44536] py-20">
        <div className="container mx-auto px-6 text-center">
          <ScrollFadeIn direction="up" duration={700}>
            <h2 className="font-playful text-3xl md:text-4xl lg:text-5xl text-white mb-4">
              {t('home.ctaTitle')}
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={100}>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto font-light">
              {t('home.ctaSubtitle')}
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={600} delay={200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-[#c44536] hover:bg-white/90 px-8 py-6 text-base font-normal tracking-wide rounded-none"
                asChild
              >
                <Link href="/schedule-tour" className="flex items-center gap-2"><Calendar className="h-5 w-5" /> {t('home.scheduleTour')}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white bg-transparent hover:bg-white/10 px-8 py-6 text-base font-normal tracking-wide rounded-none"
                asChild
              >
                <Link href="/enroll">{t('home.startEnrollment')}</Link>
              </Button>
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn direction="none" duration={800} delay={400}>
            <p className="text-white/50 text-sm mt-8 flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" /> {t('home.ctaLocation')}
            </p>
          </ScrollFadeIn>
        </div>
      </section>
    </main>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { ParallaxHero } from '@/components/features/ParallaxHero';
import { ScrollFadeIn, ScrollFadeInStagger } from '@/components/features/ScrollFadeIn';
import { SeasonalBanner } from '@/components/features/SeasonalBanner';
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

const trustSignals = [
  { icon: Shield, text: 'MN Licensed' },
  { icon: CheckCircle, text: 'Since 2020' },
  { icon: Users, text: '50+ Families Served' },
  { icon: Award, text: 'Background-Checked Staff' },
  { icon: Heart, text: 'CPR Certified Teachers' },
];

const features = [
  {
    icon: Shield,
    title: 'Licensed by Minnesota DCYF',
    description: 'Fully licensed and regularly inspected to meet the highest safety standards.',
  },
  {
    icon: BookOpen,
    title: 'Play-Based Curriculum',
    description: 'Research-backed approach that encourages curiosity and a love of learning.',
  },
  {
    icon: Heart,
    title: 'Nurturing Staff',
    description: 'Experienced, certified caregivers who treat every child like family.',
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: "Full-time enrollment with extended hours to fit your family's needs.",
  },
  {
    icon: Users,
    title: 'Low Child-to-Staff Ratios',
    description: 'Dedicated caregivers ensure personalized attention for every child.',
  },
  {
    icon: Star,
    title: 'Parent Communication',
    description: 'Daily updates, photos, and open-door policy keep you connected.',
  },
];

const ratios = [
  { program: 'Infants', ratio: '1:4', icon: Baby },
  { program: 'Toddlers', ratio: '1:5', icon: Heart },
  { program: 'Preschool', ratio: '1:8', icon: BookOpen },
  { program: 'School Age', ratio: '1:12', icon: GraduationCap },
];

const testimonials = [
  {
    quote:
      "Christina's has been a second home for our kids. The staff truly cares about every child's growth and happiness.",
    name: 'Sarah M.',
    relation: 'Parent of two',
  },
  {
    quote:
      "We looked at many centers in Crystal before choosing Christina's. The warmth and professionalism here is unmatched.",
    name: 'James & Tanya R.',
    relation: 'Parents since 2021',
  },
  {
    quote:
      'My daughter was shy when she started, and within weeks she was thriving. The teachers are incredible.',
    name: 'Michelle K.',
    relation: 'Preschool parent',
  },
];

const staff = [
  {
    name: 'Ophelia Zeogar',
    role: 'Lead Teacher',
    credentials: 'CDA Certified',
    years: 8,
    bio: 'Ophelia brings creativity and patience to the classroom, designing engaging activities that spark curiosity in every age group.',
    funFact: 'Collects children\'s books from around the world',
  },
  {
    name: 'Stephen Zeogar',
    role: 'Owner & Operations Manager',
    credentials: 'Business Administration',
    years: 6,
    bio: 'Stephen ensures smooth daily operations and maintains the safe, welcoming environment families count on.',
    funFact: 'Coaches youth soccer on weekends',
  },
  {
    name: 'Christina Fraser',
    role: 'Assistant Director',
    credentials: 'Early Childhood Education',
    years: 20,
    bio: 'With over 20 years in early childhood education, Christina brings expertise and heart to ensuring every child has a safe, joyful place to learn and grow.',
    funFact: 'Known for her legendary read-aloud voices',
  },
];

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
  { value: 20, suffix: '+', label: 'Years of Experience' },
  { value: 150, suffix: '+', label: 'Families Served' },
  { value: 4, suffix: '', label: 'Age-Group Programs' },
  { value: 5, suffix: '★', label: 'Parent Rating' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Seasonal Banner */}
      <SeasonalBanner />

      {/* Parallax Hero */}
      <ParallaxHero />

      {/* Trust Signals Bar */}
      <section className="bg-[#1a1a1a] py-4 border-y border-[#333]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {trustSignals.map((signal) => (
              <div key={signal.text} className="flex items-center gap-2 text-white/80">
                <signal.icon className="h-4 w-4 text-christina-yellow" />
                <span className="text-sm font-medium">{signal.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Staff-to-Child Ratios */}
      <section className="bg-[#f5f0e8] py-6 border-b border-[#e5e0d8]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            <span className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] font-medium">Our Ratios</span>
            {ratios.map((r) => (
              <div key={r.program} className="flex items-center gap-2">
                <r.icon className="h-4 w-4 text-christina-red" />
                <span className="text-sm text-[#1a1a1a]">
                  <span className="font-medium">{r.program}:</span>{' '}
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
                  alt="Christina's Child Care Center Van"
                  width={160}
                  height={120}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-2">Included Service</p>
                <h2 className="font-playful text-3xl md:text-4xl text-[#1a1a1a] mb-2">
                  Free Transportation
                </h2>
                <p className="text-[#6b6b6b]">
                  Pick-up and drop-off available for school-age children to and from local schools
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
              <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-4">Our Promise</p>
              <h2 className="font-playful text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] mb-4">
                Why Families Choose Us
              </h2>
              <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
                Christina&apos;s Child Care Center has been a trusted part of the Crystal, MN community for over two decades.
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
              <div key={feature.title} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-50">
                  <feature.icon className="w-6 h-6 text-[#C62828]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-[#1a1a1a] mb-2">{feature.title}</h3>
                <p className="text-[#6b6b6b] text-sm leading-relaxed">{feature.description}</p>
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
            alt="The Walker-Zeogar Family at Christina's Child Care Center"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="font-playful text-xl md:text-2xl">Family-Owned Since 2020</p>
            <p className="text-white/80 text-sm">The Zeogar family, serving Crystal, MN families</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#fafafa] py-24">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={600}>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-4">Testimonials</p>
              <h2 className="font-playful text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a]">
                What Parents Say
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
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-white border-0 shadow-sm">
                <CardContent className="pt-8 pb-6 px-6">
                  <Quote className="w-8 h-8 text-[#1a1a1a]/10 mb-4" />
                  <p className="text-[#6b6b6b] italic mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="font-medium text-[#1a1a1a]">{t.name}</p>
                    <p className="text-sm text-[#6b6b6b]">{t.relation}</p>
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
              <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-4">Our Team</p>
              <h2 className="font-playful text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] mb-4">
                Meet the People Who Care
              </h2>
              <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
                Dedicated professionals who make Christina&apos;s a special place every day.
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
                    <p className="text-sm text-christina-red font-medium">{member.role}</p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="h-4 w-4 text-[#6b6b6b]" />
                      <span className="text-xs text-[#6b6b6b]">{member.credentials} · {member.years} years</span>
                    </div>
                    <p className="text-[#6b6b6b] text-sm leading-relaxed mb-3">{member.bio}</p>
                    <p className="text-xs text-christina-red/80 italic">Fun fact: {member.funFact}</p>
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
              <AnimatedStat key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
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
              Ready to Join Our Family?
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={100}>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto font-light">
              We&apos;re now enrolling for all age groups. Schedule a tour today and see why families in Crystal, MN trust us with their most precious gift.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={600} delay={200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-[#c44536] hover:bg-white/90 px-8 py-6 text-base font-normal tracking-wide rounded-none"
                asChild
              >
                <Link href="/schedule-tour" className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Schedule a Tour</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white bg-transparent hover:bg-white/10 px-8 py-6 text-base font-normal tracking-wide rounded-none"
                asChild
              >
                <Link href="/enroll">Start Enrollment</Link>
              </Button>
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn direction="none" duration={800} delay={400}>
            <p className="text-white/50 text-sm mt-8 flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" /> Crystal, MN · Licensed by Minnesota DCYF
            </p>
          </ScrollFadeIn>
        </div>
      </section>
    </main>
  );
}

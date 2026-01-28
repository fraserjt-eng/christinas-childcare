'use client';

import Link from 'next/link';
import { HeroCarousel } from '@/components/features/HeroCarousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Baby,
  BookOpen,
  Heart,
  Shield,
  Star,
  Users,
  Clock,

  MapPin,
  Quote,
  GraduationCap,
  Smile,
} from 'lucide-react';

const programs = [
  {
    title: 'Infant Care',
    ages: '6 weeks - 16 months',
    description:
      'Nurturing care with individualized schedules, sensory exploration, and developmental milestones tracking.',
    icon: Baby,
  },
  {
    title: 'Toddler Program',
    ages: '16 months - 33 months',
    description:
      'Active exploration through play-based learning, early language development, and social skills building.',
    icon: Smile,
  },
  {
    title: 'Preschool',
    ages: '33 months - 5 years',
    description:
      'Kindergarten readiness with literacy, math concepts, creative arts, and collaborative projects.',
    icon: BookOpen,
  },
  {
    title: 'School Age',
    ages: '5 - 12 years',
    description:
      'Before and after school care with homework help, enrichment activities, and summer programming.',
    icon: GraduationCap,
  },
];

const features = [
  {
    icon: Shield,
    title: 'Licensed by Minnesota DHS',
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
    description: "Full-time and part-time options to fit your family's needs.",
  },
  {
    icon: Users,
    title: 'Low Child-to-Staff Ratios',
    description: 'Small group sizes ensure personalized attention for every child.',
  },
  {
    icon: Star,
    title: 'Parent Communication',
    description: 'Daily updates, photos, and open-door policy keep you connected.',
  },
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
    name: 'Christina Fraser',
    role: 'Founder & Director',
    description:
      'With over 20 years in early childhood education, Christina founded the center on the belief that every child deserves a safe, joyful place to learn and grow.',
  },
  {
    name: 'Ophelia Zeogar',
    role: 'Lead Teacher',
    description:
      'Ophelia brings creativity and patience to the classroom, designing engaging activities that spark curiosity in every age group.',
  },
  {
    name: 'Stephen Zeogar',
    role: 'Operations Manager',
    description:
      'Stephen ensures smooth daily operations and maintains the safe, welcoming environment families count on.',
  },
];

const stats = [
  { value: '20+', label: 'Years of Experience' },
  { value: '150+', label: 'Families Served' },
  { value: '4', label: 'Age-Group Programs' },
  { value: '5★', label: 'Parent Rating' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* CTA Buttons */}
      <section className="bg-white py-10">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
          <Link href="/contact">
            <Button size="lg" className="bg-christina-red hover:bg-red-700 text-white px-8 py-6 text-lg">
              Schedule a Tour
            </Button>
          </Link>
          <Link href="/programs">
            <Button size="lg" variant="outline" className="border-christina-red text-christina-red hover:bg-red-50 px-8 py-6 text-lg">
              View Programs
            </Button>
          </Link>
        </div>
      </section>

      {/* Programs Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Programs</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Age-appropriate programs designed to nurture growth at every stage of your child&apos;s development.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program) => (
              <Card key={program.title} className="hover:shadow-lg transition-shadow border-t-4 border-t-christina-red">
                <CardContent className="pt-6">
                  <program.icon className="w-10 h-10 text-christina-red mb-4" />
                  <h3 className="text-xl font-semibold mb-1">{program.title}</h3>
                  <p className="text-sm text-christina-red font-medium mb-3">{program.ages}</p>
                  <p className="text-gray-600">{program.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Christina&apos;s Child Care Center has been a trusted part of the Crystal, MN community for over two decades.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-christina-red" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Parents Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-white">
                <CardContent className="pt-6">
                  <Quote className="w-8 h-8 text-christina-red/30 mb-4" />
                  <p className="text-gray-700 italic mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.relation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Staff Highlights */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dedicated professionals who make Christina&apos;s a special place every day.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {staff.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-24 h-24 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-10 h-10 text-christina-red" />
                </div>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-christina-red font-medium text-sm mb-2">{member.role}</p>
                <p className="text-gray-600 max-w-sm mx-auto">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-bold text-christina-red mb-2">{stat.value}</p>
                <p className="text-white/80 text-sm md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enrollment CTA Banner */}
      <section className="bg-christina-red py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Join the Christina&apos;s Family?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            We&apos;re now enrolling for all age groups. Schedule a tour today and see why families in Crystal, MN trust us with their most precious gift.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-christina-red hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                Schedule a Tour
              </Button>
            </Link>
            <Link href="/enroll">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                Start Enrollment
              </Button>
            </Link>
          </div>
          <p className="text-white/70 text-sm mt-6 flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" /> Crystal, MN &bull; Licensed by Minnesota DHS
          </p>
        </div>
      </section>
    </main>
  );
}

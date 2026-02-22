'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { ProgramFinder } from '@/components/features/ProgramFinder';
import Link from 'next/link';
import { ArrowRight, Clock, Users, Heart, Star, BookOpen, Puzzle, DollarSign, Calendar } from 'lucide-react';

const programs = [
  {
    title: 'Infant Care',
    subtitle: 'Little Stars Classroom',
    ages: '6 weeks - 12 months',
    ratio: '1:4',
    capacity: 8,
    color: '#FF7043',
    icon: Heart,
    schedule: 'Monday - Friday, 6:30 AM - 6:00 PM',
    tuition: 'Starting at $375/week',
    description: 'Our infant program provides a warm, responsive environment where babies feel safe and loved. Each infant has a primary caregiver who learns their unique cues and rhythms.',
    highlights: ['Individualized care plans', 'Tummy time & sensory exploration', 'Daily communication with parents', 'Safe sleep practices', 'Developmental milestone tracking'],
  },
  {
    title: 'Toddler Program',
    subtitle: 'Busy Bees & Curious Cubs',
    ages: '1 - 3 years',
    ratio: '1:5',
    capacity: 24,
    color: '#FFD54F',
    icon: Star,
    schedule: 'Monday - Friday, 6:30 AM - 6:00 PM',
    tuition: 'Starting at $325/week',
    description: 'Toddlers are natural explorers! Our program channels their curiosity through hands-on activities, outdoor play, and guided discovery that builds language, motor skills, and social awareness.',
    highlights: ['Language-rich environment', 'Art & music daily', 'Outdoor play twice daily', 'Potty training support', 'Social-emotional development'],
  },
  {
    title: 'Preschool',
    subtitle: 'Bright Butterflies & Rising Stars',
    ages: '3 - 5 years',
    ratio: '1:8',
    capacity: 38,
    color: '#4CAF50',
    icon: BookOpen,
    schedule: 'Monday - Friday, 6:30 AM - 6:00 PM',
    tuition: 'Starting at $285/week',
    description: 'Our preschool program prepares children for kindergarten and beyond through a balanced curriculum that includes literacy, math, science, creative arts, and social skills development.',
    highlights: ['Kindergarten readiness curriculum', 'STEM activities', 'Early literacy & phonics', 'Field trips & guest speakers', 'Portfolio-based assessment'],
  },
  {
    title: 'School Age',
    subtitle: 'Adventure Club',
    ages: '5 - 12 years',
    ratio: '1:12',
    capacity: 15,
    color: '#2196F3',
    icon: Puzzle,
    schedule: 'Before & After School, Full Day on School Breaks',
    tuition: 'Starting at $185/week',
    description: 'Our school-age program offers a dynamic mix of homework help, enrichment activities, and free play. Children develop independence, leadership, and creativity in a supportive setting.',
    highlights: ['Homework help station', 'STEM & coding projects', 'Sports & outdoor games', 'Art & music enrichment', 'Summer camp program'],
  },
];

export default function ProgramsPage() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <h1 className="font-playful text-4xl md:text-5xl mb-4">Our Programs</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From first steps to first grade and beyond, we have a program designed for every stage of your child&apos;s development.
            </p>
          </div>
        </ScrollFadeIn>

        {/* Program Finder Widget */}
        <ScrollFadeIn direction="up" duration={600} delay={100}>
          <div className="mb-12">
            <ProgramFinder />
          </div>
        </ScrollFadeIn>

        <div className="space-y-8">
          {programs.map((program, index) => (
            <ScrollFadeIn
              key={program.title}
              direction="up"
              duration={700}
              delay={index * 100}
              distance={50}
            >
              <Card className="overflow-hidden">
                <div className="h-2" style={{ backgroundColor: program.color }} />
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: program.color }}>
                          <program.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{program.title}</h2>
                          <p className="text-sm text-muted-foreground">{program.subtitle}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-4 mb-6">{program.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" /> Ages {program.ages}</Badge>
                        <Badge variant="outline" className="gap-1">Ratio {program.ratio}</Badge>
                        <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> {program.schedule}</Badge>
                        <Badge className="gap-1 bg-christina-green/10 text-christina-green border-christina-green/20 hover:bg-christina-green/20">
                          <DollarSign className="h-3 w-3" /> {program.tuition}
                        </Badge>
                      </div>
                    </div>
                    <div className="md:w-72 bg-muted/50 rounded-xl p-6">
                      <h3 className="font-heading font-bold mb-3">Program Highlights</h3>
                      <ul className="space-y-2">
                        {program.highlights.map((h) => (
                          <li key={h} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: program.color }} />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </ScrollFadeIn>
          ))}
        </div>

        {/* Tuition Transparency Section */}
        <ScrollFadeIn direction="up" duration={600} delay={100}>
          <div className="mt-16 bg-[#f5f0e8] rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <DollarSign className="h-10 w-10 mx-auto mb-4 text-christina-red" />
              <h2 className="font-playful text-2xl md:text-3xl mb-3">Tuition & Pricing</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We believe in transparency. Rates shown are starting weekly tuition for full-time enrollment. Contact us for exact pricing based on your schedule and any available discounts.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {programs.map((p) => (
                <div key={p.title} className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <p className="text-sm text-muted-foreground mb-1">{p.title}</p>
                  <p className="font-bold text-lg" style={{ color: p.color }}>{p.tuition.replace('Starting at ', '')}</p>
                </div>
              ))}
            </div>
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                We accept county child care assistance, flexible spending accounts, and offer sibling discounts.
              </p>
              <Button asChild className="bg-christina-red hover:bg-christina-red/90">
                <Link href="/enroll" className="flex items-center gap-2">Get a Personalized Quote <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn direction="up" duration={600} delay={200}>
          <div className="text-center mt-12 p-8 bg-muted/30 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">See Our Classrooms in Action</h2>
            <p className="text-muted-foreground mb-6">Schedule a tour to visit our classrooms and meet our teachers.</p>
            <Button asChild size="lg" className="bg-christina-red hover:bg-christina-red/90">
              <Link href="/schedule-tour" className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Schedule a Tour <ArrowRight className="ml-1 h-5 w-5" /></Link>
            </Button>
          </div>
        </ScrollFadeIn>
      </div>
    </div>
  );
}

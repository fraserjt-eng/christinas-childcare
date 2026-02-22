'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Baby,
  Heart,
  BookOpen,
  GraduationCap,
  Users,
  Clock,
  ArrowRight,
  Calendar as CalendarIcon,
  Search,
} from 'lucide-react';

interface Program {
  name: string;
  icon: React.ReactNode;
  ageLabel: string;
  minMonths: number;
  maxMonths: number;
  classrooms: string;
  ratio: string;
  capacity: number;
  color: string;
  schedule: string;
  highlights: string[];
}

const programs: Program[] = [
  {
    name: 'Infant Care',
    icon: <Baby className="w-6 h-6" />,
    ageLabel: '6 weeks to 12 months',
    minMonths: 0,
    maxMonths: 12,
    classrooms: 'Little Stars',
    ratio: '1:4',
    capacity: 8,
    color: '#FF7043',
    schedule: 'Mon-Fri, 6:30 AM - 6:00 PM',
    highlights: [
      'Individualized feeding and nap schedules',
      'Tummy time and sensory exploration daily',
      'Parent communication app with real-time updates',
      'Certified infant CPR and first aid staff',
    ],
  },
  {
    name: 'Toddler',
    icon: <Heart className="w-6 h-6" />,
    ageLabel: '12 to 36 months',
    minMonths: 12,
    maxMonths: 36,
    classrooms: 'Busy Bees & Curious Cubs',
    ratio: '1:5',
    capacity: 24,
    color: '#FFD54F',
    schedule: 'Mon-Fri, 6:30 AM - 6:00 PM',
    highlights: [
      'Language-rich environment with sign language basics',
      'Art, music, and movement activities each day',
      'Outdoor play and nature exploration',
      'Gentle guidance for social-emotional growth',
    ],
  },
  {
    name: 'Preschool',
    icon: <BookOpen className="w-6 h-6" />,
    ageLabel: '3 to 5 years',
    minMonths: 36,
    maxMonths: 60,
    classrooms: 'Bright Butterflies & Rising Stars',
    ratio: '1:8',
    capacity: 38,
    color: '#4CAF50',
    schedule: 'Mon-Fri, 6:30 AM - 6:00 PM',
    highlights: [
      'Kindergarten readiness curriculum',
      'STEM activities and early literacy focus',
      'Creative arts, dramatic play, and group projects',
      'Field trips and community engagement',
    ],
  },
  {
    name: 'School Age',
    icon: <GraduationCap className="w-6 h-6" />,
    ageLabel: '5 to 12 years',
    minMonths: 60,
    maxMonths: 144,
    classrooms: 'Adventure Club',
    ratio: '1:12',
    capacity: 15,
    color: '#2196F3',
    schedule: 'Mon-Fri, before and after school',
    highlights: [
      'Homework help and quiet study time',
      'Enrichment clubs: coding, cooking, and art',
      'Active outdoor games and team sports',
    ],
  },
];

type ResultState =
  | { kind: 'none' }
  | { kind: 'match'; program: Program; ageMonths: number }
  | { kind: 'too-young' }
  | { kind: 'too-old' };

function calculateAgeInMonths(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months += today.getMonth() - birth.getMonth();
  if (today.getDate() < birth.getDate()) {
    months -= 1;
  }
  return months;
}

function formatAge(months: number): string {
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} old`;
  }
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (remaining === 0) {
    return `${years} year${years !== 1 ? 's' : ''} old`;
  }
  return `${years} year${years !== 1 ? 's' : ''}, ${remaining} month${remaining !== 1 ? 's' : ''} old`;
}

export function ProgramFinder() {
  const [birthdate, setBirthdate] = useState('');
  const [result, setResult] = useState<ResultState>({ kind: 'none' });
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthdate) return;

    setShowResult(false);

    const ageMonths = calculateAgeInMonths(birthdate);

    // Under 6 weeks (approximately 1.5 months)
    if (ageMonths < 1.5) {
      // Check more precisely with days
      const birth = new Date(birthdate);
      const today = new Date();
      const diffMs = today.getTime() - birth.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays < 42) {
        setTimeout(() => {
          setResult({ kind: 'too-young' });
          setShowResult(true);
        }, 100);
        return;
      }
    }

    if (ageMonths < 0 || ageMonths > 144) {
      setTimeout(() => {
        setResult({ kind: 'too-old' });
        setShowResult(true);
      }, 100);
      return;
    }

    const matched = programs.find(
      (p) => ageMonths >= p.minMonths && ageMonths < p.maxMonths
    );

    if (matched) {
      setTimeout(() => {
        setResult({ kind: 'match', program: matched, ageMonths });
        setShowResult(true);
      }, 100);
    } else {
      setTimeout(() => {
        setResult({ kind: 'too-old' });
        setShowResult(true);
      }, 100);
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-christina-red to-christina-coral p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Search className="w-6 h-6" />
            <h2 className="text-2xl font-playful">Find Your Program</h2>
          </div>
          <p className="text-white/90 text-sm">
            Enter your child&apos;s birthdate and we&apos;ll match them with the
            perfect program.
          </p>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <label
                htmlFor="child-birthdate"
                className="block text-sm font-medium text-muted-foreground mb-1.5"
              >
                Child&apos;s Birthdate
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="child-birthdate"
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-christina-red/30 focus:border-christina-red transition-colors"
                  required
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                className="w-full sm:w-auto bg-christina-red hover:bg-christina-red/90 text-white"
              >
                <Search className="w-4 h-4 mr-1" />
                Find My Program
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Result area */}
      <div
        className={`mt-6 transition-all duration-500 ease-out ${
          showResult
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {result.kind === 'match' && (
          <Card
            className="overflow-hidden"
            style={{ borderTop: `4px solid ${result.program.color}` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${result.program.color}20` }}
                  >
                    <span style={{ color: result.program.color }}>
                      {result.program.icon}
                    </span>
                  </div>
                  <div>
                    <h3
                      className="text-2xl font-playful"
                      style={{ color: result.program.color }}
                    >
                      {result.program.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your child is {formatAge(result.ageMonths)}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: `${result.program.color}15`,
                    color: result.program.color,
                    borderColor: `${result.program.color}30`,
                  }}
                >
                  Perfect match
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Classroom:</span>
                  <span className="font-medium">{result.program.classrooms}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Ages:</span>
                  <span className="font-medium">{result.program.ageLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Staff ratio:</span>
                  <span className="font-medium">{result.program.ratio}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Schedule:</span>
                  <span className="font-medium">{result.program.schedule}</span>
                </div>
              </div>

              <div className="mb-5">
                <h4 className="text-sm font-semibold mb-2">Program Highlights</h4>
                <ul className="space-y-1.5">
                  {result.program.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Heart
                        className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                        style={{ color: result.program.color }}
                      />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/schedule-tour">
                <Button
                  className="w-full text-white"
                  style={{ backgroundColor: result.program.color }}
                >
                  Schedule a Tour
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {result.kind === 'too-young' && (
          <Card className="overflow-hidden border-christina-coral/30">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-christina-coral/10 flex items-center justify-center mx-auto mb-3">
                <Baby className="w-6 h-6 text-christina-coral" />
              </div>
              <h3 className="text-lg font-playful text-christina-coral mb-2">
                Just a little early!
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our Infant Care program welcomes babies starting at 6 weeks old.
                Your little one isn&apos;t quite there yet, but we&apos;d love to
                get you on our waitlist so a spot is ready when the time comes.
              </p>
              <Link href="/schedule-tour">
                <Button
                  variant="outline"
                  className="border-christina-coral text-christina-coral hover:bg-christina-coral/10"
                >
                  Join Our Waitlist
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {result.kind === 'too-old' && (
          <Card className="overflow-hidden border-christina-blue/30">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-christina-blue/10 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-6 h-6 text-christina-blue" />
              </div>
              <h3 className="text-lg font-playful text-christina-blue mb-2">
                They grow up so fast!
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our programs serve children from 6 weeks through 12 years old. It
                looks like your child has graduated beyond our age range. If you
                have younger siblings who need care, we&apos;d love to hear from you!
              </p>
              <Link href="/schedule-tour">
                <Button
                  variant="outline"
                  className="border-christina-blue text-christina-blue hover:bg-christina-blue/10"
                >
                  Contact Us
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}

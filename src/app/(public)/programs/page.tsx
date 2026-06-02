'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { ProgramFinder } from '@/components/features/ProgramFinder';
import { useT } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { ArrowRight, Clock, Users, Heart, Star, BookOpen, Puzzle, DollarSign, Calendar } from 'lucide-react';

const programs = [
  {
    titleKey: 'prog.infantTitle',
    subtitleKey: 'prog.infantSubtitle',
    agesKey: 'prog.infantAges',
    ratio: '1:4',
    capacity: 8,
    color: '#FF7043',
    icon: Heart,
    scheduleKey: 'prog.infantSchedule',
    tuitionKey: 'prog.infantTuition',
    descriptionKey: 'prog.infantDescription',
    highlightKeys: ['prog.infantH1', 'prog.infantH2', 'prog.infantH3', 'prog.infantH4', 'prog.infantH5'],
  },
  {
    titleKey: 'prog.toddlerTitle',
    subtitleKey: 'prog.toddlerSubtitle',
    agesKey: 'prog.toddlerAges',
    ratio: '1:5',
    capacity: 24,
    color: '#FFD54F',
    icon: Star,
    scheduleKey: 'prog.toddlerSchedule',
    tuitionKey: 'prog.toddlerTuition',
    descriptionKey: 'prog.toddlerDescription',
    highlightKeys: ['prog.toddlerH1', 'prog.toddlerH2', 'prog.toddlerH3', 'prog.toddlerH4', 'prog.toddlerH5'],
  },
  {
    titleKey: 'prog.preschoolTitle',
    subtitleKey: 'prog.preschoolSubtitle',
    agesKey: 'prog.preschoolAges',
    ratio: '1:8',
    capacity: 38,
    color: '#4CAF50',
    icon: BookOpen,
    scheduleKey: 'prog.preschoolSchedule',
    tuitionKey: 'prog.preschoolTuition',
    descriptionKey: 'prog.preschoolDescription',
    highlightKeys: ['prog.preschoolH1', 'prog.preschoolH2', 'prog.preschoolH3', 'prog.preschoolH4', 'prog.preschoolH5'],
  },
  {
    titleKey: 'prog.schoolAgeTitle',
    subtitleKey: 'prog.schoolAgeSubtitle',
    agesKey: 'prog.schoolAgeAges',
    ratio: '1:12',
    capacity: 15,
    color: '#2196F3',
    icon: Puzzle,
    scheduleKey: 'prog.schoolAgeSchedule',
    tuitionKey: 'prog.schoolAgeTuition',
    descriptionKey: 'prog.schoolAgeDescription',
    highlightKeys: ['prog.schoolAgeH1', 'prog.schoolAgeH2', 'prog.schoolAgeH3', 'prog.schoolAgeH4', 'prog.schoolAgeH5'],
  },
] as const;

export default function ProgramsPage() {
  const t = useT();
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <h1 className="font-playful text-4xl md:text-5xl mb-4">{t('prog.heroTitle')}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('prog.heroSubtitle')}
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
              key={program.titleKey}
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
                          <h2 className="text-2xl font-bold">{t(program.titleKey)}</h2>
                          <p className="text-sm text-muted-foreground">{t(program.subtitleKey)}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-4 mb-6">{t(program.descriptionKey)}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" /> {t('prog.agesLabel')} {t(program.agesKey)}</Badge>
                        <Badge variant="outline" className="gap-1">{t('prog.ratioLabel')} {program.ratio}</Badge>
                        <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> {t(program.scheduleKey)}</Badge>
                        <Badge className="gap-1 bg-christina-green/10 text-christina-green border-christina-green/20 hover:bg-christina-green/20">
                          <DollarSign className="h-3 w-3" /> {t(program.tuitionKey)}
                        </Badge>
                      </div>
                    </div>
                    <div className="md:w-72 bg-muted/50 rounded-xl p-6">
                      <h3 className="font-heading font-bold mb-3">{t('prog.highlightsTitle')}</h3>
                      <ul className="space-y-2">
                        {program.highlightKeys.map((hKey) => (
                          <li key={hKey} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: program.color }} />
                            {t(hKey)}
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
              <h2 className="font-playful text-2xl md:text-3xl mb-3">{t('prog.tuitionTitle')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('prog.tuitionIntro')}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {programs.map((p) => (
                <div key={p.titleKey} className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <p className="text-sm text-muted-foreground mb-1">{t(p.titleKey)}</p>
                  <p className="font-bold text-lg" style={{ color: p.color }}>{t(p.tuitionKey).replace('Starting at ', '').replace('Desde ', '')}</p>
                </div>
              ))}
            </div>
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('prog.tuitionAssistance')}
              </p>
              <Button asChild className="bg-christina-red hover:bg-christina-red/90">
                <Link href="/enroll" className="flex items-center gap-2">{t('prog.quoteButton')} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn direction="up" duration={600} delay={200}>
          <div className="text-center mt-12 p-8 bg-muted/30 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">{t('prog.classroomsTitle')}</h2>
            <p className="text-muted-foreground mb-6">{t('prog.classroomsSubtitle')}</p>
            <Button asChild size="lg" className="bg-christina-red hover:bg-christina-red/90">
              <Link href="/schedule-tour" className="flex items-center gap-2"><Calendar className="h-5 w-5" /> {t('prog.tourButton')} <ArrowRight className="ml-1 h-5 w-5" /></Link>
            </Button>
          </div>
        </ScrollFadeIn>
      </div>
    </div>
  );
}

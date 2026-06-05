'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  MessageCircle,
  Activity,
  Heart,
  Palette,
  BookOpen,
  Calculator,
  Baby,
  Smile,
  GraduationCap,
  Check,
  Lightbulb,
  ArrowRight,
  CircleDot,
  HandHeart,
  Users,
  Sparkles,
  Star,
  MapPin,
  TreePine,
  Home as HomeIcon,
} from 'lucide-react';
import { AGE_GROUP_DISPLAY } from '@/types/milestones';
import { DOMAIN_OVERVIEWS, getMilestonesByDomain } from '@/lib/milestones-data';
import { AgeGroup, LearningDomain, DOMAIN_LABELS, EXPERIENCE_TYPE_LABELS, EXPERIENCE_TYPE_COLORS, type ExperienceType } from '@/types/curriculum';
import { experiencesByAgeGroup } from '@/data/developmental-experiences';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  MessageCircle,
  Activity,
  Heart,
  Palette,
  BookOpen,
  Calculator,
};

const ageGroupIcons: Record<AgeGroup, React.ComponentType<{ className?: string }>> = {
  'infant': Baby,
  'toddler': Smile,
  'preschool': BookOpen,
  'school-age': GraduationCap,
};

const domainColors: Record<LearningDomain, string> = {
  'cognitive': 'bg-purple-100 text-purple-700 border-purple-200',
  'language': 'bg-blue-100 text-blue-700 border-blue-200',
  'physical': 'bg-green-100 text-green-700 border-green-200',
  'social-emotional': 'bg-pink-100 text-pink-700 border-pink-200',
  'creative': 'bg-orange-100 text-orange-700 border-orange-200',
  'literacy': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'math': 'bg-teal-100 text-teal-700 border-teal-200',
  'science': 'bg-amber-100 text-amber-700 border-amber-200',
};

function getExperienceIcon(type: ExperienceType) {
  switch (type) {
    case 'community_outing': return MapPin;
    case 'in_center': return HomeIcon;
    case 'family_engagement': return Heart;
    case 'seasonal_nature': return TreePine;
  }
}

export default function ScopeSequencePage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<AgeGroup>('infant');

  const circleTimeLearnings = [
    { icon: Heart, text: t('scope.learnEmpathy') },
    { icon: MessageCircle, text: t('scope.learnListening') },
    { icon: Users, text: t('scope.learnBelonging') },
    { icon: HandHeart, text: t('scope.learnConflict') },
    { icon: Sparkles, text: t('scope.learnGratitude') },
    { icon: Star, text: t('scope.learnSelfworth') },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-christina-red to-red-700 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('scope.heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-6">
            {t('scope.heroSubtitle')}
          </p>
          <p className="text-white/80 max-w-2xl mx-auto">
            {t('scope.heroDescription')}
          </p>
        </div>
      </section>

      {/* Circle Time & Community Practices Section */}
      <section className="bg-gradient-to-b from-amber-50 to-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-christina-red text-white mb-4 px-4 py-1">
              <Star className="h-3 w-3 mr-1" />
              {t('scope.signaturePractice')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('scope.circleTimeTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('scope.circleTimeIntro')}
            </p>
          </div>

          {/* Ubuntu Philosophy Highlight */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-12 border-l-4 border-christina-red">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-christina-red to-red-600 flex items-center justify-center">
                  <Users className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('scope.ubuntuQuote')}
                </h3>
                <p className="text-gray-600 mb-3">
                  <span className="font-semibold text-christina-red">{t('scope.ubuntuWord')}</span>{t('scope.ubuntuBody')}
                </p>
                <p className="text-sm text-gray-500 italic">
                  {t('scope.ubuntuNote')}
                </p>
              </div>
            </div>
          </div>

          {/* Circle Time Elements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Opening Prayer */}
            <Card className="border-t-4 border-christina-red">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-christina-red" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('scope.prayerTitle')}</h3>
                <p className="text-sm text-gray-600">
                  {t('scope.prayerDesc')}
                </p>
              </CardContent>
            </Card>

            {/* Talking Piece */}
            <Card className="border-t-4 border-amber-500">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <CircleDot className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('scope.talkingPieceTitle')}</h3>
                <p className="text-sm text-gray-600">
                  {t('scope.talkingPieceDesc')}
                </p>
              </CardContent>
            </Card>

            {/* Community Building */}
            <Card className="border-t-4 border-green-500">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('scope.communityCircleTitle')}</h3>
                <p className="text-sm text-gray-600">
                  {t('scope.communityCircleDesc')}
                </p>
              </CardContent>
            </Card>

            {/* Healing & Restoration */}
            <Card className="border-t-4 border-purple-500">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <HandHeart className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('scope.healingTitle')}</h3>
                <p className="text-sm text-gray-600">
                  {t('scope.healingDesc')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* What Children Learn */}
          <div className="bg-gray-900 rounded-2xl p-8 md:p-10 text-white">
            <h3 className="text-xl font-bold mb-6 text-center">{t('scope.whatChildrenLearn')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {circleTimeLearnings.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-4 w-4 text-christina-yellow" />
                  </div>
                  <span className="text-sm text-gray-200">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Domain Legend */}
      <section className="bg-white border-b py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">{t('scope.learningDomainsTitle')}</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {DOMAIN_OVERVIEWS.map((domain) => {
              const Icon = iconMap[domain.icon] || Brain;
              return (
                <Badge
                  key={domain.domain}
                  variant="outline"
                  className={`${domainColors[domain.domain]} flex items-center gap-1.5 px-3 py-1.5`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {domain.parentFriendlyName}
                </Badge>
              );
            })}
          </div>
        </div>
      </section>

      {/* Age Group Tabs */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AgeGroup)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto">
              {(Object.keys(AGE_GROUP_DISPLAY) as AgeGroup[]).map((ageGroup) => {
                const Icon = ageGroupIcons[ageGroup];
                const display = AGE_GROUP_DISPLAY[ageGroup];
                return (
                  <TabsTrigger
                    key={ageGroup}
                    value={ageGroup}
                    className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-christina-red data-[state=active]:text-white"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold">{display.label}</span>
                    <span className="text-xs opacity-80">{display.ages}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {(Object.keys(AGE_GROUP_DISPLAY) as AgeGroup[]).map((ageGroup) => (
              <TabsContent key={ageGroup} value={ageGroup} className="mt-0">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {t('scope.programLabel').replace('{label}', AGE_GROUP_DISPLAY[ageGroup].label)}
                  </h2>
                  <p className="text-gray-600">
                    {t('scope.agesLabel').replace('{ages}', AGE_GROUP_DISPLAY[ageGroup].ages)}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {DOMAIN_OVERVIEWS.map((domainOverview) => {
                    const milestones = getMilestonesByDomain(ageGroup, domainOverview.domain);
                    if (milestones.length === 0) return null;

                    const Icon = iconMap[domainOverview.icon] || Brain;

                    return (
                      <Card key={domainOverview.domain} className="overflow-hidden">
                        <CardHeader className={`${domainColors[domainOverview.domain]} border-b py-4`}>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Icon className="h-5 w-5" />
                            {domainOverview.parentFriendlyName}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <p className="text-sm text-gray-600 mb-4">{domainOverview.description}</p>
                          <ul className="space-y-3">
                            {milestones.map((milestone) => (
                              <li key={milestone.id} className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                                  <p className="text-xs text-gray-500">{milestone.description}</p>
                                  {milestone.parentTip && (
                                    <p className="text-xs text-christina-red mt-1 flex items-start gap-1">
                                      <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                      <span className="italic">{milestone.parentTip}</span>
                                    </p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Developmental Experiences */}
      <section className="bg-gradient-to-b from-white to-amber-50/30 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t('scope.experiencesTitle')}</h2>
            <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
              {t('scope.experiencesIntro')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {(experiencesByAgeGroup[activeTab] || []).map((exp) => {
              const TypeIcon = getExperienceIcon(exp.type);
              return (
                <div key={exp.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  {/* Header with type badge */}
                  <div className="px-5 pt-5 pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${EXPERIENCE_TYPE_COLORS[exp.type]}`}>
                        <TypeIcon className="h-3 w-3" />
                        {EXPERIENCE_TYPE_LABELS[exp.type]}
                      </span>
                      {exp.bestSeason && exp.bestSeason !== 'any' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">{exp.bestSeason}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold">{exp.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{exp.yearRange} · {exp.estimatedDuration} · {exp.frequency}</p>
                  </div>

                  {/* Description */}
                  <div className="px-5 pb-3">
                    <p className="text-base text-gray-600">{exp.description}</p>
                  </div>

                  {/* Ubuntu connection callout */}
                  <div className="mx-5 mb-5 bg-amber-50 rounded-lg p-4 border-l-4 border-amber-400">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">{t('scope.ubuntuConnectionLabel')}</p>
                    <p className="text-sm text-amber-900 italic leading-relaxed">&ldquo;{exp.ubuntuConnection}&rdquo;</p>
                  </div>

                  {/* Domain badges */}
                  <div className="px-5 pb-5 flex flex-wrap gap-1.5">
                    {exp.domains.map(domain => (
                      <span key={domain} className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {DOMAIN_LABELS[domain]}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('scope.ctaTitle')}
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('scope.ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-christina-red hover:bg-red-700 px-8">
              <Link href="/enroll">
                {t('scope.scheduleTour')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-2 border-white bg-transparent hover:bg-white/10 px-8">
              <Link href="/programs">
                {t('scope.viewPrograms')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

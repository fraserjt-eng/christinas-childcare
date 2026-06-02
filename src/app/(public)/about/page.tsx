'use client';

import { useT } from '@/contexts/LanguageContext';
import { ScrollFadeIn, ScrollFadeInStagger } from '@/components/features/ScrollFadeIn';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  Heart,
  Lightbulb,
  Handshake,
  Award,
  Users,
  GraduationCap,
  Sparkles,
  Calendar,
  Building2,
  BookOpen,
  Baby,
  Globe,
  Eye,
  Target,
} from 'lucide-react';

const values = [
  { icon: Shield, titleKey: 'about.valueSafetyTitle', descKey: 'about.valueSafetyDesc' },
  { icon: Heart, titleKey: 'about.valueRespectTitle', descKey: 'about.valueRespectDesc' },
  { icon: Lightbulb, titleKey: 'about.valuePlayTitle', descKey: 'about.valuePlayDesc' },
  { icon: Handshake, titleKey: 'about.valueFamilyTitle', descKey: 'about.valueFamilyDesc' },
  { icon: Award, titleKey: 'about.valueImprovementTitle', descKey: 'about.valueImprovementDesc' },
  { icon: Users, titleKey: 'about.valueCommunityTitle', descKey: 'about.valueCommunityDesc' },
] as const;

const timeline = [
  { year: '2020', titleKey: 'about.timeline2020Title', descKey: 'about.timeline2020Desc', icon: Sparkles },
  { year: '2021', titleKey: 'about.timeline2021Title', descKey: 'about.timeline2021Desc', icon: Building2 },
  { year: '2022', titleKey: 'about.timeline2022Title', descKey: 'about.timeline2022Desc', icon: BookOpen },
  { year: '2023', titleKey: 'about.timeline2023Title', descKey: 'about.timeline2023Desc', icon: Users },
  { year: '2024', titleKey: 'about.timeline2024Title', descKey: 'about.timeline2024Desc', icon: GraduationCap },
] as const;

const staff = [
  {
    name: 'Ophelia Zeogar',
    role: 'Lead Teacher',
    credentials: 'CDA Certified',
    years: 8,
    bio: 'Ophelia brings creativity and patience to every classroom interaction. She designs engaging activities that spark curiosity across all age groups, from infants discovering textures to preschoolers building their first stories. Her approach is simple: meet each child where they are and give them what they need to take the next step.',
    funFact: 'Collects children\'s books from around the world',
    initials: 'OZ',
    roleKey: 'about.staffOpheliaRole',
    credentialsKey: 'about.staffOpheliaCredentials',
    bioKey: 'about.staffOpheliaBio',
    funFactKey: 'about.staffOpheliaFunFact',
  },
  {
    name: 'Stephen Zeogar',
    role: 'Owner & Operations Manager',
    credentials: 'Business Administration',
    years: 6,
    bio: 'Stephen keeps the center running smoothly so the teaching staff can focus on what matters: the kids. From facility maintenance to licensing compliance to parent communication, he handles the operational backbone that makes quality care possible. Families know him as the person who picks up the phone.',
    funFact: 'Coaches youth soccer on weekends',
    initials: 'SZ',
    roleKey: 'about.staffStephenRole',
    credentialsKey: 'about.staffStephenCredentials',
    bioKey: 'about.staffStephenBio',
    funFactKey: 'about.staffStephenFunFact',
  },
  {
    name: 'Christina Fraser',
    role: 'Assistant Director',
    credentials: 'Early Childhood Education',
    years: 20,
    bio: 'With over 20 years in early childhood education, Christina is the heartbeat of the center\'s teaching philosophy. She mentors younger staff, develops curriculum frameworks, and ensures every child has a safe and joyful place to learn. Her experience spans infant care through school-age programming, and she brings that full-spectrum perspective to everything she does.',
    funFact: 'Known for her legendary read-aloud voices',
    initials: 'CF',
    roleKey: 'about.staffChristinaRole',
    credentialsKey: 'about.staffChristinaCredentials',
    bioKey: 'about.staffChristinaBio',
    funFactKey: 'about.staffChristinaFunFact',
  },
] as const;

export default function AboutPage() {
  const t = useT();
  // Person + Organization schema for staff entity recognition in AI search
  const personSchema = {
    '@context': 'https://schema.org',
    '@graph': staff.map((member) => ({
      '@type': 'Person',
      name: member.name,
      jobTitle: member.role,
      description: member.bio,
      hasCredential: member.credentials,
      worksFor: {
        '@type': 'Organization',
        '@id': 'https://christinas-childcare.vercel.app/#organization',
        name: "Christina's Child Care Center",
      },
    })),
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      {/* Page Hero */}
      <section className="relative bg-gradient-to-br from-[#C62828] via-[#c44536] to-[#C62828] py-24 md:py-32 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6 text-center">
          <ScrollFadeIn direction="up" duration={700}>
            <p className="text-xs uppercase tracking-[0.25em] text-white/60 mb-6">
              {t('about.heroEyebrow')}
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={100}>
            <h1 className="font-playful text-4xl md:text-5xl lg:text-6xl text-white mb-6">
              {t('about.heroTitle')}
            </h1>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={200}>
            <p className="text-xl md:text-2xl text-white/90 font-light italic max-w-2xl mx-auto">
              {t('about.heroTagline')}
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Ubuntu Philosophy Section */}
      <section className="bg-[#f5f0e8] py-20 md:py-28">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center rounded-full bg-[#C62828]/10">
                <Globe className="w-8 h-8 text-[#C62828]" strokeWidth={1.5} />
              </div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#6b6b6b] mb-4">
                {t('about.ubuntuEyebrow')}
              </p>
              <h2 className="font-playful text-3xl md:text-4xl text-[#1a1a1a] mb-4">
                {t('about.ubuntuTitle')}
              </h2>
              <div className="w-16 h-0.5 bg-[#C62828] mx-auto mb-8" />
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={150}>
            <div className="max-w-3xl mx-auto space-y-5 text-lg text-[#4a4a4a] leading-relaxed">
              <p>{t('about.ubuntuPara1')}</p>
              <p>{t('about.ubuntuPara2')}</p>
              <p>{t('about.ubuntuPara3')}</p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Center Story Section */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="max-w-3xl mx-auto text-center mb-8">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6b6b6b] mb-4">
                {t('about.storyEyebrow')}
              </p>
              <h2 className="font-playful text-3xl md:text-4xl text-[#1a1a1a] mb-4">
                {t('about.storyTitle')}
              </h2>
              <div className="w-16 h-0.5 bg-[#C62828] mx-auto mb-8" />
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={100}>
            <div className="max-w-3xl mx-auto space-y-5 text-lg text-[#4a4a4a] leading-relaxed mb-16">
              <p>{t('about.storyPara1')}</p>
              <p>{t('about.storyPara2')}</p>
            </div>
          </ScrollFadeIn>

          {/* Timeline */}
          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <ScrollFadeIn
                key={item.year}
                direction="up"
                duration={600}
                delay={index * 80}
              >
                <div className="relative flex gap-6 pb-12 last:pb-0">
                  {/* Timeline line */}
                  {index < timeline.length - 1 && (
                    <div className="absolute left-[23px] top-12 bottom-0 w-px bg-[#C62828]/15" />
                  )}
                  {/* Timeline dot */}
                  <div className="w-12 h-12 rounded-full bg-[#C62828]/10 flex items-center justify-center flex-shrink-0 relative z-10">
                    <item.icon className="w-5 h-5 text-[#C62828]" strokeWidth={1.5} />
                  </div>
                  {/* Content */}
                  <div className="pt-1">
                    <span className="text-sm font-bold text-[#C62828] tracking-wide">
                      {item.year}
                    </span>
                    <h3 className="text-lg font-bold text-[#1a1a1a] mt-1 mb-2">{t(item.titleKey)}</h3>
                    <p className="text-[#6b6b6b] leading-relaxed">{t(item.descKey)}</p>
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-[#f5f0e8] py-20 md:py-28">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6b6b6b] mb-4">
                {t('about.driveEyebrow')}
              </p>
              <h2 className="font-playful text-3xl md:text-4xl text-[#1a1a1a]">
                {t('about.driveTitle')}
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <ScrollFadeIn direction="left" duration={700} delay={100}>
              <Card className="border-0 shadow-md h-full bg-white">
                <CardContent className="p-8 md:p-10">
                  <div className="w-12 h-12 rounded-full bg-[#C62828]/10 flex items-center justify-center mb-6">
                    <Target className="w-6 h-6 text-[#C62828]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] mb-4">{t('about.missionTitle')}</h3>
                  <div className="w-12 h-0.5 bg-[#C62828] mb-6" />
                  <p className="text-[#4a4a4a] leading-relaxed text-lg">
                    {t('about.missionBody')}
                  </p>
                </CardContent>
              </Card>
            </ScrollFadeIn>
            <ScrollFadeIn direction="right" duration={700} delay={200}>
              <Card className="border-0 shadow-md h-full bg-white">
                <CardContent className="p-8 md:p-10">
                  <div className="w-12 h-12 rounded-full bg-[#1565C0]/10 flex items-center justify-center mb-6">
                    <Eye className="w-6 h-6 text-[#1565C0]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] mb-4">{t('about.visionTitle')}</h3>
                  <div className="w-12 h-0.5 bg-[#1565C0] mb-6" />
                  <p className="text-[#4a4a4a] leading-relaxed text-lg">
                    {t('about.visionBody')}
                  </p>
                </CardContent>
              </Card>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6b6b6b] mb-4">
                {t('about.valuesEyebrow')}
              </p>
              <h2 className="font-playful text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] mb-4">
                {t('about.valuesTitle')}
              </h2>
              <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
                {t('about.valuesSubtitle')}
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
            {values.map((value) => (
              <Card
                key={value.titleKey}
                className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
              >
                <CardContent className="p-6 md:p-8">
                  <div className="w-12 h-12 rounded-full bg-[#C62828]/10 flex items-center justify-center mb-5">
                    <value.icon className="h-6 w-6 text-[#C62828]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{t(value.titleKey)}</h3>
                  <p className="text-[#6b6b6b] leading-relaxed">{t(value.descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </ScrollFadeInStagger>
        </div>
      </section>

      {/* Staff Section */}
      <section className="bg-[#f5f0e8] py-20 md:py-28">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6b6b6b] mb-4">
                {t('about.teamEyebrow')}
              </p>
              <h2 className="font-playful text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] mb-4">
                {t('about.teamTitle')}
              </h2>
              <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
                {t('about.teamSubtitle')}
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
              <Card
                key={member.name}
                className="border-0 shadow-md overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-0">
                  {/* Avatar header */}
                  <div className="bg-gradient-to-br from-[#C62828] to-[#c44536] p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-white mx-auto mb-4 flex items-center justify-center shadow-sm">
                      <span className="text-2xl font-playful text-[#C62828]">
                        {member.initials}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{member.name}</h3>
                    <p className="text-sm text-white/80 font-medium">{t(member.roleKey)}</p>
                  </div>

                  {/* Credentials bar */}
                  <div className="bg-[#f5f0e8] px-6 py-3 flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-[#6b6b6b]" />
                      <span className="text-xs text-[#6b6b6b] font-medium">
                        {t(member.credentialsKey)}
                      </span>
                    </div>
                    <div className="w-px h-3 bg-[#6b6b6b]/30" />
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-[#6b6b6b]" />
                      <span className="text-xs text-[#6b6b6b] font-medium">
                        {member.years}{member.years === 20 ? '+' : ''} {t('about.yearsLabel')}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="p-6">
                    <p className="text-[#4a4a4a] text-sm leading-relaxed mb-4">{t(member.bioKey)}</p>
                    <div className="flex items-start gap-2 pt-3 border-t border-[#e5e0d8]">
                      <Baby className="h-4 w-4 text-[#C62828]/60 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#C62828]/80 italic">
                        {t('about.funFactLabel').replace('{fact}', t(member.funFactKey))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollFadeInStagger>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-[#1a1a1a] py-20">
        <div className="container mx-auto px-6 text-center">
          <ScrollFadeIn direction="up" duration={700}>
            <h2 className="font-playful text-3xl md:text-4xl text-white mb-4">
              {t('about.ctaTitle')}
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={100}>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-light mb-2">
              {t('about.ctaBody')}
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn direction="none" duration={800} delay={300}>
            <p className="text-white/40 text-sm mt-8">
              {t('about.ctaMeta')}
            </p>
          </ScrollFadeIn>
        </div>
      </section>
    </div>
  );
}

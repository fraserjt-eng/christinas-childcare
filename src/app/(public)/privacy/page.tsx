'use client';

import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/contexts/LanguageContext';
import {
  Shield,
  Database,
  Users,
  Baby,
  Clock,
  Share2,
  Cookie,
  BarChart2,
  UserCheck,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react';

interface PolicySection {
  id: string;
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
}

export default function PrivacyPage() {
  const t = useT();

  const sections: PolicySection[] = [
    {
      id: 'data-collected',
      icon: Database,
      title: t('privacy.dataCollectedTitle'),
      content: (
        <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
          <p>{t('privacy.dataCollectedIntro')}</p>
          <ul className="space-y-2 pl-4">
            {[
              t('privacy.dataCollectedItem1'),
              t('privacy.dataCollectedItem2'),
              t('privacy.dataCollectedItem3'),
              t('privacy.dataCollectedItem4'),
              t('privacy.dataCollectedItem5'),
              t('privacy.dataCollectedItem6'),
              t('privacy.dataCollectedItem7'),
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-christina-red flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>{t('privacy.dataCollectedOutro')}</p>
        </div>
      ),
    },
    {
      id: 'how-we-use',
      icon: UserCheck,
      title: t('privacy.howWeUseTitle'),
      content: (
        <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
          <p>{t('privacy.howWeUseIntro')}</p>
          <ul className="space-y-2 pl-4">
            {[
              t('privacy.howWeUseItem1'),
              t('privacy.howWeUseItem2'),
              t('privacy.howWeUseItem3'),
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-christina-red flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>{t('privacy.howWeUseOutro')}</p>
        </div>
      ),
    },
    {
      id: 'data-storage',
      icon: Shield,
      title: t('privacy.dataStorageTitle'),
      content: (
        <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
          <p>{t('privacy.dataStorageP1')}</p>
          <p>{t('privacy.dataStorageP2')}</p>
        </div>
      ),
    },
    {
      id: 'who-has-access',
      icon: Users,
      title: t('privacy.whoHasAccessTitle'),
      content: (
        <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
          <p>{t('privacy.whoHasAccessP1')}</p>
          <p>{t('privacy.whoHasAccessP2')}</p>
        </div>
      ),
    },
    {
      id: 'childrens-privacy',
      icon: Baby,
      title: t('privacy.childrensPrivacyTitle'),
      content: (
        <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
          <p>{t('privacy.childrensPrivacyP1')}</p>
          <p>{t('privacy.childrensPrivacyP2')}</p>
        </div>
      ),
    },
    {
      id: 'data-retention',
      icon: Clock,
      title: t('privacy.dataRetentionTitle'),
      content: (
        <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
          <ul className="space-y-3 pl-4">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-christina-red flex-shrink-0" />
              <span>
                <strong>{t('privacy.dataRetentionInquiryLabel')}</strong>{' '}
                {t('privacy.dataRetentionInquiryText')}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-christina-red flex-shrink-0" />
              <span>
                <strong>{t('privacy.dataRetentionActiveLabel')}</strong>{' '}
                {t('privacy.dataRetentionActiveText')}
              </span>
            </li>
          </ul>
          <p>{t('privacy.dataRetentionOutro')}</p>
        </div>
      ),
    },
    {
      id: 'data-sharing',
      icon: Share2,
      title: t('privacy.dataSharingTitle'),
      content: (
        <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
          <p>{t('privacy.dataSharingP1')}</p>
          <p>{t('privacy.dataSharingP2')}</p>
        </div>
      ),
    },
    {
      id: 'cookies',
      icon: Cookie,
      title: t('privacy.cookiesTitle'),
      content: (
        <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
          <p>{t('privacy.cookiesP1')}</p>
          <p>{t('privacy.cookiesP2')}</p>
        </div>
      ),
    },
    {
      id: 'analytics',
      icon: BarChart2,
      title: t('privacy.analyticsTitle'),
      content: (
        <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
          <p>{t('privacy.analyticsP1')}</p>
          <p>{t('privacy.analyticsP2')}</p>
        </div>
      ),
    },
    {
      id: 'your-rights',
      icon: UserCheck,
      title: t('privacy.yourRightsTitle'),
      content: (
        <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
          <p>{t('privacy.yourRightsIntro')}</p>
          <ul className="space-y-2 pl-4">
            {[
              t('privacy.yourRightsItem1'),
              t('privacy.yourRightsItem2'),
              t('privacy.yourRightsItem3'),
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-christina-red flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>{t('privacy.yourRightsOutro')}</p>
        </div>
      ),
    },
    {
      id: 'policy-updates',
      icon: RefreshCw,
      title: t('privacy.policyUpdatesTitle'),
      content: (
        <div className="space-y-3 text-[#4b4b4b] leading-relaxed">
          <p>{t('privacy.policyUpdatesP1')}</p>
          <p>{t('privacy.policyUpdatesP2')}</p>
          <p className="text-sm text-[#6b6b6b] font-medium">{t('privacy.lastUpdated')}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">

        {/* Page Header */}
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-christina-red/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-christina-red" />
            </div>
            <h1 className="font-playful text-4xl md:text-5xl text-[#1a1a1a] mb-4">
              {t('privacy.heroTitle')}
            </h1>
            <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
              {t('privacy.heroSubtitle')}
            </p>
          </div>
        </ScrollFadeIn>

        {/* Business Info Banner */}
        <ScrollFadeIn direction="up" duration={600} delay={80}>
          <div className="mb-10 p-5 rounded-xl bg-[#faf8f5] border border-[#e5e0d8] flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div>
              <p className="font-semibold text-[#1a1a1a]">Christina&apos;s Child Care Center</p>
              <p className="text-sm text-[#6b6b6b]">5510 W Broadway Ave, Crystal, MN 55428</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
              <a
                href="mailto:info@christinaschildcare.com"
                className="flex items-center gap-2 text-sm text-christina-blue hover:underline"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                info@christinaschildcare.com
              </a>
              <a
                href="tel:7633905870"
                className="flex items-center gap-2 text-sm text-christina-blue hover:underline"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                (763) 390-5870
              </a>
            </div>
          </div>
        </ScrollFadeIn>

        {/* Policy Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <ScrollFadeIn
                key={section.id}
                direction="up"
                duration={650}
                delay={index * 60}
                distance={35}
              >
                <Card className="border-[#e5e0d8] shadow-sm overflow-hidden">
                  <CardHeader className="bg-[#faf8f5] border-b border-[#e5e0d8] py-5 px-6">
                    <CardTitle className="flex items-center gap-3 text-lg font-bold text-christina-red">
                      <div className="w-9 h-9 rounded-lg bg-christina-red/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-christina-red" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 py-5">
                    {section.content}
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            );
          })}
        </div>

        {/* Contact CTA */}
        <ScrollFadeIn direction="up" duration={600} delay={200}>
          <div className="text-center mt-16 p-8 bg-[#faf8f5] rounded-2xl border border-[#e5e0d8]">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">{t('privacy.ctaTitle')}</h2>
            <p className="text-[#6b6b6b] mb-6 max-w-xl mx-auto">
              {t('privacy.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:7633905870"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-christina-red text-white font-medium rounded-lg hover:bg-christina-red/90 transition-colors"
              >
                <Phone className="h-4 w-4" />
                {t('privacy.ctaCall')}
              </a>
              <a
                href="mailto:info@christinaschildcare.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-christina-red text-christina-red font-medium rounded-lg hover:bg-christina-red/5 transition-colors"
              >
                <Mail className="h-4 w-4" />
                {t('privacy.ctaEmail')}
              </a>
            </div>
          </div>
        </ScrollFadeIn>

      </div>
    </div>
  );
}

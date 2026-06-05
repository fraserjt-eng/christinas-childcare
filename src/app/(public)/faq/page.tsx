'use client';

import { useState } from 'react';
import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { ChevronDown, HelpCircle, Baby, Sun, BookOpen, Shield, DollarSign } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/lib/i18n';

interface FAQItem {
  questionKey: TranslationKey;
  answerKey: TranslationKey;
}

interface FAQCategory {
  titleKey: TranslationKey;
  icon: React.ElementType;
  color: string;
  questions: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    titleKey: 'faq.catEnrollmentTitle',
    icon: Baby,
    color: '#FF7043',
    questions: [
      { questionKey: 'faq.qAges', answerKey: 'faq.aAges' },
      { questionKey: 'faq.qEnroll', answerKey: 'faq.aEnroll' },
      { questionKey: 'faq.qWaitlist', answerKey: 'faq.aWaitlist' },
      { questionKey: 'faq.qFirstDay', answerKey: 'faq.aFirstDay' },
    ],
  },
  {
    titleKey: 'faq.catDailyLifeTitle',
    icon: Sun,
    color: '#FFD54F',
    questions: [
      { questionKey: 'faq.qHours', answerKey: 'faq.aHours' },
      { questionKey: 'faq.qMeals', answerKey: 'faq.aMeals' },
      { questionKey: 'faq.qSickPolicy', answerKey: 'faq.aSickPolicy' },
      { questionKey: 'faq.qPottyTraining', answerKey: 'faq.aPottyTraining' },
      { questionKey: 'faq.qTypicalDay', answerKey: 'faq.aTypicalDay' },
    ],
  },
  {
    titleKey: 'faq.catCurriculumTitle',
    icon: BookOpen,
    color: '#4CAF50',
    questions: [
      { questionKey: 'faq.qCurriculum', answerKey: 'faq.aCurriculum' },
      { questionKey: 'faq.qKindergarten', answerKey: 'faq.aKindergarten' },
      { questionKey: 'faq.qSpecialNeeds', answerKey: 'faq.aSpecialNeeds' },
    ],
  },
  {
    titleKey: 'faq.catSafetyTitle',
    icon: Shield,
    color: '#C62828',
    questions: [
      { questionKey: 'faq.qLicensed', answerKey: 'faq.aLicensed' },
      { questionKey: 'faq.qRatio', answerKey: 'faq.aRatio' },
      { questionKey: 'faq.qBackgroundCheck', answerKey: 'faq.aBackgroundCheck' },
      { questionKey: 'faq.qDropoff', answerKey: 'faq.aDropoff' },
    ],
  },
  {
    titleKey: 'faq.catPricingTitle',
    icon: DollarSign,
    color: '#2196F3',
    questions: [
      { questionKey: 'faq.qTuition', answerKey: 'faq.aTuition' },
      { questionKey: 'faq.qAssistance', answerKey: 'faq.aAssistance' },
      { questionKey: 'faq.qTransportation', answerKey: 'faq.aTransportation' },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  const t = useT();
  return (
    <div className="border-b border-[#e5e0d8] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-4 text-left hover:bg-[#faf8f5] transition-colors duration-200 rounded-lg group"
        aria-expanded={isOpen}
      >
        <span className="text-[#1a1a1a] font-medium pr-4">{t(item.questionKey)}</span>
        <ChevronDown
          className={`h-5 w-5 text-[#6b6b6b] flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? '500px' : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <p className="px-4 pb-5 text-[#6b6b6b] leading-relaxed">{t(item.answerKey)}</p>
      </div>
    </div>
  );
}

function FAQCategorySection({ category, index }: { category: FAQCategory; index: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const Icon = category.icon;
  const t = useT();

  return (
    <ScrollFadeIn direction="up" duration={700} delay={index * 80} distance={40}>
      <div className="bg-white rounded-2xl shadow-sm border border-[#e5e0d8] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#e5e0d8] bg-[#faf8f5]">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: category.color }}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#1a1a1a]">{t(category.titleKey)}</h2>
        </div>
        <div className="px-2">
          {category.questions.map((item, qIndex) => (
            <AccordionItem
              key={qIndex}
              item={item}
              isOpen={openIndex === qIndex}
              onToggle={() => setOpenIndex(openIndex === qIndex ? null : qIndex)}
            />
          ))}
        </div>
      </div>
    </ScrollFadeIn>
  );
}

export default function FAQPage() {
  const t = useT();
  // Build FAQPage JSON-LD from the existing faqCategories data for AI search citation
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqCategories.flatMap((cat) =>
      cat.questions.map((q) => ({
        '@type': 'Question',
        name: t(q.questionKey),
        acceptedAnswer: {
          '@type': 'Answer',
          text: t(q.answerKey),
        },
      }))
    ),
  };

  return (
    <div className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-christina-red/10 flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-8 w-8 text-christina-red" />
            </div>
            <h1 className="font-playful text-4xl md:text-5xl text-[#1a1a1a] mb-4">
              {t('faq.heroTitle')}
            </h1>
            <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
              {t('faq.heroSubtitle')}
            </p>
          </div>
        </ScrollFadeIn>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, index) => (
            <FAQCategorySection key={category.titleKey} category={category} index={index} />
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <ScrollFadeIn direction="up" duration={600} delay={200}>
          <div className="text-center mt-16 p-8 bg-[#faf8f5] rounded-2xl border border-[#e5e0d8]">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">{t('faq.ctaTitle')}</h2>
            <p className="text-[#6b6b6b] mb-6">
              {t('faq.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:7633905870"
                className="inline-flex items-center justify-center px-6 py-3 bg-christina-red text-white font-medium rounded-lg hover:bg-christina-red/90 transition-colors"
              >
                {t('faq.ctaCall')}
              </a>
              <a
                href="/enroll"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-christina-red text-christina-red font-medium rounded-lg hover:bg-christina-red/5 transition-colors"
              >
                {t('faq.ctaTour')}
              </a>
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </div>
  );
}

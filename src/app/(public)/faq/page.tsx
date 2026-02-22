'use client';

import { useState } from 'react';
import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { ChevronDown, HelpCircle, Baby, Sun, BookOpen, Shield, DollarSign } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: React.ElementType;
  color: string;
  questions: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    title: 'Enrollment & Getting Started',
    icon: Baby,
    color: '#FF7043',
    questions: [
      {
        question: 'What ages do you serve?',
        answer:
          'We serve children from 6 weeks through 12 years of age. Our programs include Infant Care, Toddler, Preschool, and School Age, so your child can grow with us from their earliest days all the way through elementary school.',
      },
      {
        question: 'How do I enroll my child?',
        answer:
          'Enrollment is a simple four-step process. First, submit an inquiry through our website or give us a call. Next, we will schedule a personal tour of our center so you can see our classrooms and meet the staff. After your visit, you will complete enrollment paperwork and health forms. Then we welcome your family to Christina\'s!',
      },
      {
        question: 'Is there a waitlist?',
        answer:
          'Some of our programs do fill up, especially infant and toddler classrooms where ratios are smaller. We recommend reaching out as early as possible to check availability. If your preferred program is full, we will add you to our waitlist and contact you as soon as a spot opens.',
      },
      {
        question: 'What do I need to bring on the first day?',
        answer:
          'Please bring two sets of extra clothes (labeled with your child\'s name), a comfort item like a blanket or stuffed animal if your child uses one, and all completed enrollment forms. For infants, also bring diapers, wipes, bottles, and any specific formula. We provide all meals and snacks for enrolled children.',
      },
    ],
  },
  {
    title: 'Daily Life',
    icon: Sun,
    color: '#FFD54F',
    questions: [
      {
        question: 'What are your hours?',
        answer:
          'We are open Monday through Friday, 6:30 AM to 6:00 PM, year-round. We close for major holidays and provide families with a full holiday calendar at the start of each year so you can plan ahead.',
      },
      {
        question: 'Do you provide meals and snacks?',
        answer:
          'Yes! Breakfast, lunch, and two snacks are included daily at no extra cost. Our meals follow USDA Child and Adult Care Food Program guidelines and include a variety of healthy, kid-friendly options. We accommodate food allergies and dietary restrictions with advance notice.',
      },
      {
        question: 'What is your sick policy?',
        answer:
          'Children must be symptom-free for 24 hours before returning to the center. This includes being free of fever (without medication), vomiting, and diarrhea. If your child becomes ill during the day, we will contact you right away for pickup. This policy protects all of our children and staff.',
      },
      {
        question: 'Do you offer potty training support?',
        answer:
          'Absolutely. We work closely with families to create individual potty training plans that match what you are doing at home. Our teachers use positive reinforcement and consistent routines to support each child at their own pace. We consider potty training a partnership between families and our staff.',
      },
      {
        question: 'What does a typical day look like?',
        answer:
          'Each day includes a thoughtful mix of activities: morning circle time, free play and exploration, structured learning activities, outdoor time (weather permitting), meals and snacks, a rest or quiet time period, and creative projects like art and music. The schedule varies by age group, with infants following their own individual rhythms.',
      },
    ],
  },
  {
    title: 'Curriculum & Learning',
    icon: BookOpen,
    color: '#4CAF50',
    questions: [
      {
        question: 'What curriculum do you use?',
        answer:
          'We use a play-based, research-backed approach that covers seven key learning domains: cognitive development, language and literacy, math and science, social-emotional skills, physical development, creative arts, and approaches to learning. Every activity is designed with intentional learning goals while keeping the experience fun and engaging for children.',
      },
      {
        question: 'How do you prepare children for kindergarten?',
        answer:
          'Our preschool program focuses on the skills children need to thrive in kindergarten: letter and number recognition, early literacy and phonics, basic math concepts, social skills like sharing and taking turns, following multi-step directions, and building independence with self-help tasks. We track each child\'s progress and share regular updates with families.',
      },
      {
        question: 'Do you accommodate special needs?',
        answer:
          'Yes. We believe every child deserves a welcoming, inclusive environment. We work with families and outside specialists to create individualized plans that support each child\'s unique needs. If your child has an IEP or IFSP, we are happy to coordinate with your team to provide consistent care.',
      },
    ],
  },
  {
    title: 'Safety & Policies',
    icon: Shield,
    color: '#C62828',
    questions: [
      {
        question: 'Are you licensed?',
        answer:
          'Yes, we are fully licensed by the Minnesota Department of Children, Youth and Families (DCYF). Our center undergoes regular inspections and meets all state health, safety, and staffing requirements. We take pride in maintaining the highest standards of care.',
      },
      {
        question: 'What is your staff-to-child ratio?',
        answer:
          'We maintain ratios that meet or exceed Minnesota state requirements. Infants: 1 teacher for every 4 children. Toddlers: 1 teacher for every 5 children. Preschool: 1 teacher for every 8 children. School Age: 1 teacher for every 12 children. These ratios ensure every child receives the individual attention they need.',
      },
      {
        question: 'Are staff background checked?',
        answer:
          'Yes. All staff members undergo comprehensive background checks before they begin working at our center, including criminal history, child abuse registry, and fingerprinting. We also verify education credentials and check professional references. The safety of your children is our top priority.',
      },
      {
        question: 'What is your drop-off and pick-up procedure?',
        answer:
          'We use a secure entry system to ensure only authorized individuals can access the building. At drop-off, parents sign their child in and hand off directly to a classroom teacher. At pick-up, we verify identity against our authorized pickup list. Anyone not on the list will need prior written authorization from the parent to pick up a child.',
      },
    ],
  },
  {
    title: 'Pricing & Logistics',
    icon: DollarSign,
    color: '#2196F3',
    questions: [
      {
        question: 'What are your tuition rates?',
        answer:
          'Tuition varies by program and schedule. We offer competitive rates for Crystal and the surrounding area. Please contact us directly for our current rate sheet. We are happy to walk you through pricing options and help you find the best fit for your family\'s needs and budget.',
      },
      {
        question: 'Do you accept child care assistance?',
        answer:
          'Yes, we accept county child care assistance programs. If you currently receive assistance or are applying, we can help guide you through the process. Our goal is to make quality child care accessible to every family in our community.',
      },
      {
        question: 'Do you offer transportation?',
        answer:
          'Yes! We provide free pickup and drop-off for school-age children to and from local schools in the Crystal area. This is included at no additional cost for enrolled school-age families. Contact us for the current list of schools we serve.',
      },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#e5e0d8] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-4 text-left hover:bg-[#faf8f5] transition-colors duration-200 rounded-lg group"
        aria-expanded={isOpen}
      >
        <span className="text-[#1a1a1a] font-medium pr-4">{item.question}</span>
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
        <p className="px-4 pb-5 text-[#6b6b6b] leading-relaxed">{item.answer}</p>
      </div>
    </div>
  );
}

function FAQCategorySection({ category, index }: { category: FAQCategory; index: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const Icon = category.icon;

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
          <h2 className="text-xl font-bold text-[#1a1a1a]">{category.title}</h2>
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
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-christina-red/10 flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-8 w-8 text-christina-red" />
            </div>
            <h1 className="font-playful text-4xl md:text-5xl text-[#1a1a1a] mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
              Find answers to the most common questions families ask about Christina&apos;s Child Care Center. If you don&apos;t see your question here, please don&apos;t hesitate to reach out.
            </p>
          </div>
        </ScrollFadeIn>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, index) => (
            <FAQCategorySection key={category.title} category={category} index={index} />
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <ScrollFadeIn direction="up" duration={600} delay={200}>
          <div className="text-center mt-16 p-8 bg-[#faf8f5] rounded-2xl border border-[#e5e0d8]">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Still Have Questions?</h2>
            <p className="text-[#6b6b6b] mb-6">
              We would love to hear from you. Give us a call or schedule a tour to see our center in person.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:7633905870"
                className="inline-flex items-center justify-center px-6 py-3 bg-christina-red text-white font-medium rounded-lg hover:bg-christina-red/90 transition-colors"
              >
                Call (763) 390-5870
              </a>
              <a
                href="/enroll"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-christina-red text-christina-red font-medium rounded-lg hover:bg-christina-red/5 transition-colors"
              >
                Schedule a Tour
              </a>
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Clock, ArrowRight } from 'lucide-react';
import { getServerT } from '@/lib/i18n/server';
import type { TranslationKey } from '@/lib/i18n';

export const metadata: Metadata = {
  title: "Locations | Christina's Child Care Center",
  description:
    "Christina's Child Care Center serves families in Crystal, MN and Brooklyn Park, MN. Licensed, play-based care for infants through school age. Low ratios, experienced staff, free transportation.",
  alternates: {
    canonical: 'https://christinas-childcare.vercel.app/locations',
  },
  openGraph: {
    title: "Our Locations | Christina's Child Care Center",
    description:
      'Two Minnesota locations: Crystal and Brooklyn Park. Same team, same philosophy, closer to home.',
    url: 'https://christinas-childcare.vercel.app/locations',
  },
};

const locations: {
  slug: string;
  city: string;
  address: string;
  phone: string;
  summaryKey: TranslationKey;
}[] = [
  {
    slug: 'crystal',
    city: 'Crystal, MN',
    address: '5510 W Broadway Ave, Crystal, MN 55428',
    phone: '(763) 390-5870',
    summaryKey: 'loc.crystalSummary',
  },
  {
    slug: 'brooklyn-park',
    city: 'Brooklyn Park, MN',
    address: 'Brooklyn Park, MN 55428',
    phone: '(555) 555-5555',
    summaryKey: 'loc.bpSummary',
  },
];

export default function LocationsPage() {
  const { t } = getServerT();
  return (
    <div className="min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="font-playful text-4xl md:text-5xl text-[#1a1a1a] mb-4">
            {t('loc.title')}
          </h1>
          <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto">
            {t('loc.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {locations.map((loc) => (
            <Link
              key={loc.slug}
              href={`/locations/${loc.slug}`}
              className="block bg-white border border-[#e5e0d8] rounded-2xl p-6 hover:border-christina-red hover:shadow-lg transition-all"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                Christina&apos;s — {loc.city}
              </h2>
              <p className="text-[#6b6b6b] mb-4">{t(loc.summaryKey)}</p>
              <div className="space-y-2 text-sm text-[#4b4b4b]">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-christina-red mt-0.5 flex-shrink-0" />
                  <span>{loc.address}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-christina-red mt-0.5 flex-shrink-0" />
                  <a href={`tel:${loc.phone.replace(/\D/g, '')}`}>{loc.phone}</a>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-christina-red mt-0.5 flex-shrink-0" />
                  <span>{t('loc.hoursValue')}</span>
                </div>
              </div>
              <div className="mt-4 text-christina-red font-medium text-sm flex items-center gap-1">
                {t('loc.visitPage').replace('{city}', loc.city)}
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

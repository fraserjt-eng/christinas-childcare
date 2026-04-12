import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Clock, Calendar, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: "Brooklyn Park, MN Location | Christina's Child Care Center",
  description:
    "Christina's Child Care Center in Brooklyn Park, MN. Licensed childcare serving infants through school age. Same team, same philosophy, closer to home for north metro families.",
  keywords: [
    'childcare Brooklyn Park MN',
    'daycare Brooklyn Park Minnesota',
    'infant care Brooklyn Park',
    'preschool Brooklyn Park MN',
    'child care 55428',
  ],
  alternates: {
    canonical: 'https://christinas-childcare.vercel.app/locations/brooklyn-park',
  },
  openGraph: {
    title: "Brooklyn Park, MN | Christina's Child Care Center",
    description:
      'Licensed childcare in Brooklyn Park, MN. Enrolling infants through school age.',
    url: 'https://christinas-childcare.vercel.app/locations/brooklyn-park',
  },
};

const locationSchema = {
  '@context': 'https://schema.org',
  '@type': ['ChildCare', 'LocalBusiness'],
  '@id':
    'https://christinas-childcare.vercel.app/locations/brooklyn-park#location',
  name: "Christina's Child Care Center — Brooklyn Park",
  description:
    'Licensed child care center in Brooklyn Park, MN. Play-based care for infants through school age.',
  url: 'https://christinas-childcare.vercel.app/locations/brooklyn-park',
  telephone: '+1-555-555-5555',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Brooklyn Park',
    addressRegion: 'MN',
    postalCode: '55428',
    addressCountry: 'US',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '06:30',
    closes: '18:00',
  },
  priceRange: '$$',
};

export default function BrooklynParkLocationPage() {
  return (
    <div className="min-h-screen py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(locationSchema) }}
      />
      <div className="max-w-4xl mx-auto px-6">
        <Link
          href="/locations"
          className="inline-flex items-center gap-1 text-sm text-christina-red hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          All Locations
        </Link>

        <h1 className="font-playful text-4xl md:text-5xl text-[#1a1a1a] mb-4">
          Christina&apos;s — Brooklyn Park, MN
        </h1>
        <p className="text-lg text-[#6b6b6b] mb-8">
          Our Brooklyn Park location serves families in the north metro area. Same
          curriculum, same care philosophy, same licensed team that families in Crystal
          have trusted since 2020. Closer to home for Brooklyn Park and Maple Grove
          families.

        </p>

        <div className="bg-white border border-[#e5e0d8] rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">Visit or Call</h2>
          <div className="space-y-3 text-[#4b4b4b]">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-christina-red mt-0.5" />
              <div>
                <p className="font-medium">Brooklyn Park, MN 55428</p>
                <p className="text-sm text-christina-red">Address coming soon</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-christina-red mt-0.5" />
              <a href="tel:+15555555555" className="font-medium hover:underline">
                (555) 555-5555
              </a>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-christina-red mt-0.5" />
              <p>Monday through Friday, 6:30 AM to 6:00 PM</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e5e0d8] rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">Programs at This Location</h2>
          <ul className="space-y-2 text-[#4b4b4b]">
            <li>Infant Care (6 weeks to 15 months) — 1:4 ratio</li>
            <li>Toddler Program (15 months to 3 years) — 1:7 ratio</li>
            <li>Preschool (3 to 5 years) — 1:10 ratio</li>
            <li>School Age (5 to 12 years) — 1:12 ratio</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/schedule-tour"
            className="inline-flex items-center justify-center gap-2 bg-christina-red text-white px-6 py-3 rounded-full font-medium hover:bg-christina-red/90 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            Schedule a Tour
          </Link>
          <Link
            href="/enroll"
            className="inline-flex items-center justify-center gap-2 border border-christina-red text-christina-red px-6 py-3 rounded-full font-medium hover:bg-christina-red/10 transition-colors"
          >
            Start Enrollment
          </Link>
        </div>
      </div>
    </div>
  );
}

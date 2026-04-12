import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Clock, Calendar, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: "Crystal, MN Location | Christina's Child Care Center",
  description:
    "Christina's Child Care Center in Crystal, MN. Licensed childcare at 5510 W Broadway Ave serving infants through school age. Play-based curriculum, low ratios, free transportation. Enrolling now.",
  keywords: [
    'childcare Crystal MN',
    'daycare Crystal Minnesota',
    'infant care Crystal',
    'preschool Crystal MN',
    'child care 55428',
    '5510 W Broadway',
  ],
  alternates: {
    canonical: 'https://christinas-childcare.vercel.app/locations/crystal',
  },
  openGraph: {
    title: "Crystal, MN | Christina's Child Care Center",
    description:
      'Licensed childcare at 5510 W Broadway Ave, Crystal, MN. Enrolling infants through school age.',
    url: 'https://christinas-childcare.vercel.app/locations/crystal',
  },
};

const locationSchema = {
  '@context': 'https://schema.org',
  '@type': ['ChildCare', 'LocalBusiness'],
  '@id': 'https://christinas-childcare.vercel.app/locations/crystal#location',
  name: "Christina's Child Care Center — Crystal",
  description:
    'Licensed child care center at 5510 W Broadway Ave, Crystal, MN 55428. Play-based care for infants through school age.',
  url: 'https://christinas-childcare.vercel.app/locations/crystal',
  telephone: '+1-763-390-5870',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '5510 W Broadway Ave',
    addressLocality: 'Crystal',
    addressRegion: 'MN',
    postalCode: '55428',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 45.0322,
    longitude: -93.3603,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '06:30',
    closes: '18:00',
  },
  priceRange: '$$',
};

export default function CrystalLocationPage() {
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
          Christina&apos;s — Crystal, MN
        </h1>
        <p className="text-lg text-[#6b6b6b] mb-8">
          Our Crystal location at 5510 W Broadway Ave has served families since 2020.
          Licensed childcare for infants through school age with a play-based curriculum,
          experienced staff, and low adult-to-child ratios.

        </p>

        <div className="bg-white border border-[#e5e0d8] rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">Visit or Call</h2>
          <div className="space-y-3 text-[#4b4b4b]">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-christina-red mt-0.5" />
              <div>
                <p className="font-medium">5510 W Broadway Ave</p>
                <p className="text-sm">Crystal, MN 55428</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-christina-red mt-0.5" />
              <a href="tel:+17633905870" className="font-medium hover:underline">
                (763) 390-5870
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

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Christina's Child Care Center | Crystal, MN",
    template: "%s | Christina's Child Care Center",
  },
  description:
    "Licensed child care in Crystal, MN serving infants through school age. Play-based curriculum, experienced staff, low ratios, and free transportation. Enrolling now.",
  keywords: [
    "child care Crystal MN",
    "daycare Crystal Minnesota",
    "infant care near me",
    "toddler program Crystal",
    "preschool Crystal MN",
    "school age care",
    "licensed daycare Minnesota",
    "Christina's Child Care",
  ],
  openGraph: {
    title: "Christina's Child Care Center | Crystal, MN",
    description:
      "Licensed child care in Crystal, MN serving infants through school age. Play-based curriculum, experienced staff, and free transportation.",
    url: "https://christinas-childcare.vercel.app",
    siteName: "Christina's Child Care Center",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Christina's Child Care Center - Licensed Childcare in Crystal, MN",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Christina's Child Care Center | Crystal, MN",
    description:
      "Licensed child care in Crystal, MN. Play-based learning, low ratios, free transportation. Enrolling now.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://christinas-childcare.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C62828" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://christinas-childcare.vercel.app/#organization",
                  name: "Christina's Child Care Center",
                  url: "https://christinas-childcare.vercel.app",
                  description:
                    "Licensed child care center serving Crystal and Brooklyn Park, MN. Play-based education for infants through school age children.",
                  logo: "https://christinas-childcare.vercel.app/og-image.png",
                  sameAs: [],
                },
                {
                  "@type": ["ChildCare", "LocalBusiness"],
                  "@id": "https://christinas-childcare.vercel.app/locations/crystal#location",
                  name: "Christina's Child Care Center — Crystal",
                  description:
                    "Licensed child care center in Crystal, MN providing play-based education for infants through school age children.",
                  url: "https://christinas-childcare.vercel.app/locations/crystal",
                  telephone: "+1-763-390-5870",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "5510 W Broadway Ave",
                    addressLocality: "Crystal",
                    addressRegion: "MN",
                    postalCode: "55428",
                    addressCountry: "US",
                  },
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: 45.0322,
                    longitude: -93.3603,
                  },
                  openingHoursSpecification: [
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                      ],
                      opens: "06:30",
                      closes: "18:00",
                    },
                  ],
                  priceRange: "$$",
                  parentOrganization: {
                    "@id": "https://christinas-childcare.vercel.app/#organization",
                  },
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: "5",
                    reviewCount: "47",
                  },
                },
                {
                  "@type": ["ChildCare", "LocalBusiness"],
                  "@id": "https://christinas-childcare.vercel.app/locations/brooklyn-park#location",
                  name: "Christina's Child Care Center — Brooklyn Park",
                  description:
                    "Licensed child care center in Brooklyn Park, MN providing play-based education for infants through school age children.",
                  url: "https://christinas-childcare.vercel.app/locations/brooklyn-park",
                  telephone: "+1-555-555-5555",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Brooklyn Park",
                    addressRegion: "MN",
                    postalCode: "55428",
                    addressCountry: "US",
                  },
                  openingHoursSpecification: [
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                      ],
                      opens: "06:30",
                      closes: "18:00",
                    },
                  ],
                  priceRange: "$$",
                  parentOrganization: {
                    "@id": "https://christinas-childcare.vercel.app/#organization",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

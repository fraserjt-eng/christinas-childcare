import type { Metadata } from "next";
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
              "@type": "ChildCare",
              name: "Christina's Child Care Center",
              description:
                "Licensed child care center in Crystal, MN providing play-based education for infants through school age children.",
              url: "https://christinas-childcare.vercel.app",
              telephone: "+1-763-390-5870",
              email: "info@christinaschildcare.com",
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
              openingHoursSpecification: {
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
              priceRange: "$$",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "5",
                reviewCount: "47",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

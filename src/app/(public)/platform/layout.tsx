import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Platform',
  description:
    'The child care operations platform Christina uses to run her center. Scheduling, CACFP, enrollment, billing, family communication, and reporting. Built by a director. For directors. Book a 20-minute walkthrough.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Run your center like Christina runs hers.',
    description:
      'The platform a real operating director built for herself. Now open to you. Scheduling, CACFP, enrollment, billing, and reporting in one place.',
    url: 'https://christinas-childcare.vercel.app/platform',
    type: 'website',
  },
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

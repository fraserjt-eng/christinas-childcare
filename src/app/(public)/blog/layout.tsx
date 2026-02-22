import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Parent Resources',
  description:
    'Tips, guides, and insights for parents from the team at Christina\'s Child Care Center. Practical advice on child development, transitions, daily routines, and choosing quality care.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

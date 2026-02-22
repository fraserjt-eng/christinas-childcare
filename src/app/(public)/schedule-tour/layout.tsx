import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Schedule a Tour',
};

export default function ScheduleTourLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

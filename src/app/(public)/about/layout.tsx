import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Christina\'s Child Care Center in Crystal, MN. Founded on Ubuntu principles, our family-owned center has served 50+ families since 2020 with play-based learning, experienced staff, and deep community roots.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Training pages use DashboardLayout with employee styling
  // This overrides the public Header/Footer layout for training routes
  return (
    <DashboardLayout isAdmin={false} isEmployee={false}>
      {children}
    </DashboardLayout>
  );
}

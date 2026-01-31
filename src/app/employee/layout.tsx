'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getCurrentEmployee, seedSampleData } from '@/lib/employee-storage';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // Ensure sample data is seeded
      await seedSampleData();

      const employee = getCurrentEmployee();
      if (!employee) {
        router.push('/employee-login');
      } else {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <DashboardLayout isEmployee>{children}</DashboardLayout>;
}

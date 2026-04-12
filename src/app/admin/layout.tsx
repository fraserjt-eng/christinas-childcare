import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NotificationPopupWrapper } from '@/components/NotificationPopupWrapper';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <DashboardLayout isAdmin>
        <NotificationPopupWrapper audience="admin" />
        {children}
      </DashboardLayout>
    </ErrorBoundary>
  );
}

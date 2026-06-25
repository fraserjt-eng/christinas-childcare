import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NotificationPopupWrapper } from '@/components/NotificationPopupWrapper';
import { CoachWidget } from '@/components/coach/CoachWidget';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <DashboardLayout isAdmin>
        <NotificationPopupWrapper audience="admin" />
        {children}
        <CoachWidget />
      </DashboardLayout>
    </ErrorBoundary>
  );
}

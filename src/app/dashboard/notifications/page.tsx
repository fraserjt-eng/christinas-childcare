'use client';

import { NotificationSettings } from '@/components/dashboard/NotificationSettings';
import { Bell } from 'lucide-react';

export default function NotificationPrefsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6 text-christina-red" />
          Notification Preferences
        </h1>
        <p className="text-muted-foreground">Choose how you want to hear from us</p>
      </div>
      <NotificationSettings />
    </div>
  );
}

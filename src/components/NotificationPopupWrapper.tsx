'use client';

import { useEffect, useState } from 'react';
import { NotificationPopup } from './NotificationPopup';
import { getCurrentFamily } from '@/lib/family-storage';
import { getSessionEmployee } from '@/lib/session-employee';

type Audience = 'parents' | 'staff' | 'admin';

export function NotificationPopupWrapper({ audience }: { audience: Audience }) {
  const [userKey, setUserKey] = useState<string>('');

  useEffect(() => {
    (async () => {
      if (audience === 'parents') {
        const family = getCurrentFamily();
        if (family) setUserKey(family.email);
      } else if (audience === 'admin') {
        // Admin popup uses a shared admin key so all admins see the same state
        setUserKey('admin');
      } else if (audience === 'staff') {
        const emp = await getSessionEmployee();
        if (emp) setUserKey(emp.id || emp.email || 'staff');
      }
    })();
  }, [audience]);

  if (!userKey) return null;

  const messagesHref =
    audience === 'parents'
      ? '/dashboard/messages'
      : audience === 'admin'
      ? '/admin/parent-messages'
      : undefined;

  return (
    <NotificationPopup audience={audience} userKey={userKey} messagesHref={messagesHref} />
  );
}

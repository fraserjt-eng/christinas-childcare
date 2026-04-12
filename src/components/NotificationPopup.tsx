'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageCircle, Megaphone, X } from 'lucide-react';
import {
  getUnreadAnnouncements,
  dismissAnnouncement,
  dismissAllAnnouncements,
  CenterAnnouncement,
} from '@/lib/center-announcements-storage';
import {
  getUnreadCountForParent,
  getUnreadCountForAdmin,
} from '@/lib/parent-messages-storage';

type Audience = 'parents' | 'staff' | 'admin';

interface NotificationPopupProps {
  audience: Audience;
  userKey: string; // unique identifier per user (email or employee id)
  messagesHref?: string;
}

const PRIORITY_STYLES: Record<CenterAnnouncement['priority'], string> = {
  info: 'bg-christina-blue/10 text-christina-blue border-christina-blue/30',
  important: 'bg-christina-yellow/10 text-yellow-700 border-christina-yellow/40',
  urgent: 'bg-christina-red/10 text-christina-red border-christina-red/30',
};

export function NotificationPopup({
  audience,
  userKey,
  messagesHref,
}: NotificationPopupProps) {
  const [open, setOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<CenterAnnouncement[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!userKey) return;

    // Only show once per session
    const sessionKey = `christinas_popup_shown_${userKey}`;
    if (sessionStorage.getItem(sessionKey)) return;

    const unread = getUnreadAnnouncements(audience, userKey);
    const msgCount =
      audience === 'parents'
        ? getUnreadCountForParent(userKey)
        : audience === 'admin'
        ? getUnreadCountForAdmin()
        : 0;

    setAnnouncements(unread);
    setUnreadMessages(msgCount);

    if (unread.length > 0 || msgCount > 0) {
      setOpen(true);
      sessionStorage.setItem(sessionKey, '1');
    }
  }, [audience, userKey]);

  function handleDismissOne(id: string) {
    dismissAnnouncement(userKey, id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }

  function handleDismissAll() {
    dismissAllAnnouncements(userKey, audience);
    setAnnouncements([]);
    setOpen(false);
  }

  const totalItems = announcements.length + (unreadMessages > 0 ? 1 : 0);
  if (!open || totalItems === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-christina-red" />
            Welcome back
          </DialogTitle>
          <DialogDescription>
            You have {totalItems} {totalItems === 1 ? 'item' : 'items'} to review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {unreadMessages > 0 && messagesHref && (
            <div className="rounded-lg border border-christina-red/30 bg-christina-red/5 p-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-christina-red flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {unreadMessages} unread message{unreadMessages === 1 ? '' : 's'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {audience === 'parents'
                      ? 'New messages from staff are waiting for you.'
                      : 'Families have sent you messages.'}
                  </p>
                </div>
                <Button asChild size="sm" className="bg-christina-red hover:bg-christina-red/90">
                  <Link href={messagesHref} onClick={() => setOpen(false)}>
                    View
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {announcements.map((a) => (
            <div
              key={a.id}
              className={`rounded-lg border p-4 ${PRIORITY_STYLES[a.priority]}`}
            >
              <div className="flex items-start gap-3">
                <Megaphone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm">{a.title}</p>
                    <Badge variant="outline" className="text-xs capitalize flex-shrink-0">
                      {a.priority}
                    </Badge>
                  </div>
                  <p className="text-xs mb-2">{a.body}</p>
                  <p className="text-xs opacity-70">Posted by {a.postedBy}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => handleDismissOne(a.id)}
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Remind Me Later
          </Button>
          <Button type="button" onClick={handleDismissAll}>
            Dismiss All
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

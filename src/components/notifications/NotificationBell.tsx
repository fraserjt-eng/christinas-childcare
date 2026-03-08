'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  ListTodo,
  MessageSquare,
  Calendar,
  AlertTriangle,
  UserPlus,
  Activity,
  ChevronRight,
  Flame,
  Shield,
} from 'lucide-react';

const STORAGE_KEY = 'christinas_notifications';
const CHRISTINA_RED = '#C62828';

type NotificationType =
  | 'task'
  | 'message'
  | 'meeting'
  | 'incident'
  | 'hr'
  | 'drift'
  | 'training'
  | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  link_to: string;
}

function getRelativeTime(isoString: string): string {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case 'task':
      return { icon: ListTodo, color: '#1565C0', bg: '#E3F2FD' };
    case 'message':
      return { icon: MessageSquare, color: '#2E7D32', bg: '#E8F5E9' };
    case 'meeting':
      return { icon: Calendar, color: '#6A1B9A', bg: '#F3E5F5' };
    case 'incident':
      return { icon: AlertTriangle, color: '#E65100', bg: '#FFF3E0' };
    case 'hr':
      return { icon: UserPlus, color: '#00695C', bg: '#E0F2F1' };
    case 'drift':
      return { icon: Flame, color: CHRISTINA_RED, bg: '#FFEBEE' };
    case 'training':
      return { icon: Shield, color: '#F57F17', bg: '#FFFDE7' };
    case 'system':
      return { icon: Activity, color: '#546E7A', bg: '#ECEFF1' };
  }
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setNotifications(JSON.parse(stored) as Notification[]);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentFive = notifications
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const markOneRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold"
            style={{ backgroundColor: CHRISTINA_RED }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium hover:underline"
                style={{ color: CHRISTINA_RED }}
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {recentFive.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No notifications yet
              </div>
            ) : (
              recentFive.map((n) => {
                const typeInfo = getTypeIcon(n.type);
                const IconComponent = typeInfo.icon;
                return (
                  <Link
                    key={n.id}
                    href={n.link_to}
                    onClick={() => {
                      markOneRead(n.id);
                      setOpen(false);
                    }}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                      !n.read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: typeInfo.bg }}
                    >
                      <IconComponent className="h-4 w-4" style={{ color: typeInfo.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!n.read && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                        )}
                        <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{getRelativeTime(n.timestamp)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0 mt-1" />
                  </Link>
                );
              })
            )}
          </div>
          <Link
            href="/admin/notifications"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center text-sm font-medium border-t border-gray-100 hover:bg-gray-50 transition-colors"
            style={{ color: CHRISTINA_RED }}
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

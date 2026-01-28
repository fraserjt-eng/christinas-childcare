'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home, Users, BookOpen, Calendar, FileText, Camera,
  ClipboardList, UtensilsCrossed, Clock, BarChart3,
  LogOut, Menu, GraduationCap, Target, Building2,
  DollarSign, UserCheck, ShieldCheck, MessageSquare, SquareKanban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const parentNav = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/children', label: 'My Children', icon: Users },
  { href: '/dashboard/progress', label: 'Progress Reports', icon: BarChart3 },
  { href: '/dashboard/photos', label: 'Photo Gallery', icon: Camera },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
];

const adminNav = [
  { href: '/admin', label: 'Overview', icon: Home },
  { href: '/admin/attendance', label: 'Attendance', icon: ClipboardList },
  { href: '/admin/food-counts', label: 'Food Counts', icon: UtensilsCrossed },
  { href: '/admin/scheduling', label: 'Staff Scheduling', icon: Clock },
  { href: '/admin/ratios', label: 'Ratio Monitor', icon: BarChart3 },
  { href: '/admin/curriculum', label: 'Curriculum', icon: GraduationCap },
  { href: '/admin/strategic', label: 'Strategic Plan', icon: Target },
  { href: '/admin/lessons', label: 'Lesson Builder', icon: BookOpen },
  { href: '/admin/inquiries', label: 'Inquiries', icon: FileText },
  { href: '/admin/financial', label: 'Financial Planning', icon: DollarSign },
  { href: '/admin/staff', label: 'Staff Directory', icon: UserCheck },
  { href: '/admin/compliance', label: 'Compliance', icon: ShieldCheck },
  { href: '/admin/reports', label: 'Daily Reports', icon: BookOpen },
  { href: '/admin/pipeline', label: 'Enrollment Pipeline', icon: SquareKanban },
];

function NavSection({ items, label }: { items: typeof parentNav; label: string }) {
  const pathname = usePathname();
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">{label}</p>
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-christina-red/10 text-christina-red'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function SidebarContent({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 40 40" className="flex-shrink-0">
            <circle cx="20" cy="20" r="20" fill="#C62828" />
            <path d="M12 14 C12 14 20 8 28 14" stroke="#FFD54F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <line x1="20" y1="10" x2="20" y2="28" stroke="#FFD54F" strokeWidth="2" strokeLinecap="round" />
            <text x="20" y="34" textAnchor="middle" fill="white" fontSize="10" fontFamily="Fredoka One, cursive" fontWeight="bold">C</text>
          </svg>
          <span className="font-heading font-bold text-foreground">Christina&apos;s</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isAdmin ? (
          <NavSection items={adminNav} label="Business Hub" />
        ) : (
          <NavSection items={parentNav} label="Parent Portal" />
        )}
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-christina-red text-white text-xs">OZ</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Ophelia Zeogar</p>
            <p className="text-xs text-muted-foreground">Owner / Director</p>
          </div>
        </div>
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="h-4 w-4" /> Sign Out
        </Link>
      </div>
    </div>
  );
}

export function DashboardLayout({ children, isAdmin = false }: { children: React.ReactNode; isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-muted/30">
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r">
        <SidebarContent isAdmin={isAdmin} />
      </aside>
      <div className="flex-1 flex flex-col min-h-0">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between lg:justify-end">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent isAdmin={isAdmin} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:flex gap-1 items-center">
              <Building2 className="h-3 w-3" />
              5510 W Broadway Ave, Crystal
            </Badge>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

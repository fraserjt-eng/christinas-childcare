'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Home, Users, BookOpen, Calendar, FileText, Camera,
  ClipboardList, UtensilsCrossed, Clock, BarChart3,
  LogOut, Menu, GraduationCap, Target, Building2,
  DollarSign, UserCheck, ShieldCheck, MessageSquare, SquareKanban, Wallet,
  CreditCard, CalendarDays, UserCog, Briefcase, Package, CalendarRange, CalendarPlus,
  Newspaper, ChevronDown, type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Employee, getEmployeeFullName } from '@/types/employee';
import { getCurrentEmployee, logout as employeeLogout } from '@/lib/employee-storage';
import { FamilyAccount } from '@/types/family';
import { getCurrentFamily, logoutFamily } from '@/lib/family-storage';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

const parentNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/children', label: 'My Children', icon: Users },
  { href: '/dashboard/progress', label: 'Progress Reports', icon: BarChart3 },
  { href: '/dashboard/photos', label: 'Photo Gallery', icon: Camera },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
];

const adminNavGroups: NavGroup[] = [
  {
    label: 'Overview',
    icon: Home,
    items: [
      { href: '/admin', label: 'Dashboard', icon: Home },
      { href: '/admin/news', label: 'News & Updates', icon: Newspaper },
    ],
  },
  {
    label: 'Classroom',
    icon: GraduationCap,
    items: [
      { href: '/admin/attendance', label: 'Attendance', icon: ClipboardList },
      { href: '/admin/ratios', label: 'Ratio Monitor', icon: BarChart3 },
      { href: '/admin/curriculum', label: 'Curriculum', icon: GraduationCap },
      { href: '/admin/lessons', label: 'Lesson Builder', icon: BookOpen },
      { href: '/admin/reports', label: 'Daily Reports', icon: FileText },
    ],
  },
  {
    label: 'Food & Supplies',
    icon: UtensilsCrossed,
    items: [
      { href: '/admin/food-counts', label: 'Food Counts', icon: UtensilsCrossed },
      { href: '/admin/inventory', label: 'Inventory', icon: Package },
      { href: '/admin/menu-planning', label: 'Menu Planning', icon: CalendarRange },
    ],
  },
  {
    label: 'Staff',
    icon: Users,
    items: [
      { href: '/admin/scheduling', label: 'Scheduling', icon: Clock },
      { href: '/admin/schedule-requests', label: 'Schedule Requests', icon: CalendarPlus },
      { href: '/admin/salaried-scheduling', label: 'Salaried Staff', icon: Building2 },
      { href: '/admin/staff', label: 'Staff Directory', icon: UserCheck },
      { href: '/admin/payroll', label: 'Payroll', icon: CreditCard },
      { href: '/admin/compliance', label: 'Compliance', icon: ShieldCheck },
    ],
  },
  {
    label: 'Enrollment',
    icon: SquareKanban,
    items: [
      { href: '/admin/inquiries', label: 'Inquiries', icon: FileText },
      { href: '/admin/pipeline', label: 'Pipeline', icon: SquareKanban },
    ],
  },
  {
    label: 'Business',
    icon: DollarSign,
    items: [
      { href: '/admin/financial', label: 'Financial Planning', icon: DollarSign },
      { href: '/admin/budget', label: 'Budget', icon: Wallet },
      { href: '/admin/strategic', label: 'Strategic Plan', icon: Target },
    ],
  },
];

const employeeNav: NavItem[] = [
  { href: '/employee', label: 'Clock In/Out', icon: Clock },
  { href: '/employee/schedule', label: 'My Schedule', icon: CalendarDays },
  { href: '/employee/pay-stubs', label: 'Pay Stubs', icon: CreditCard },
  { href: '/employee/time-off', label: 'Time Off', icon: Calendar },
  { href: '/employee/profile', label: 'My Profile', icon: UserCog },
  { href: '/employee/training', label: 'Training', icon: Briefcase },
];

function NavSection({ items, label }: { items: NavItem[]; label: string }) {
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

function AdminNavSection({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();

  // Determine which groups have an active item
  const activeGroupIndices = groups.reduce<Set<number>>((acc, group, i) => {
    if (group.items.some((item) => item.href === pathname)) {
      acc.add(i);
    }
    return acc;
  }, new Set());

  // Initialize: expand active groups + Overview (index 0)
  const [expanded, setExpanded] = useState<Set<number>>(() => {
    const initial = new Set(activeGroupIndices);
    initial.add(0);
    return initial;
  });

  // Auto-expand when route changes
  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set(prev);
      activeGroupIndices.forEach((i) => next.add(i));
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggle(index: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Business Hub</p>
      <nav className="space-y-1">
        {groups.map((group, groupIndex) => {
          const isExpanded = expanded.has(groupIndex);
          const hasActive = group.items.some((item) => item.href === pathname);

          return (
            <div key={group.label}>
              {/* Group header */}
              <button
                onClick={() => toggle(groupIndex)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full',
                  hasActive
                    ? 'text-christina-red'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <group.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 transition-transform',
                    isExpanded ? 'rotate-0' : '-rotate-90'
                  )}
                />
              </button>

              {/* Group items */}
              {isExpanded && (
                <div className="ml-4 pl-3 border-l border-border/50 space-y-0.5 mt-0.5 mb-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-christina-red/10 text-christina-red font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

function SidebarContent({
  isAdmin,
  isEmployee,
  employee,
  family,
  onLogout
}: {
  isAdmin: boolean;
  isEmployee?: boolean;
  employee?: Employee | null;
  family?: FamilyAccount | null;
  onLogout?: () => void;
}) {
  let displayName = 'Ophelia Zeogar';
  let displayRole = 'Owner / Director';
  let initials = 'OZ';

  if (employee) {
    displayName = getEmployeeFullName(employee);
    displayRole = employee.job_title;
    initials = `${employee.first_name[0]}${employee.last_name[0]}`;
  } else if (family) {
    const primary = family.parents.find((p) => p.is_primary) || family.parents[0];
    if (primary) {
      displayName = primary.name;
      displayRole = 'Parent';
      const parts = primary.name.split(' ');
      initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0][0];
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 40 40" className="flex-shrink-0">
            <defs>
              <linearGradient id="zGradientDash" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="50%" stopColor="#FFD54F" />
                <stop offset="100%" stopColor="#FFC107" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="20" fill="#C62828" />
            <path
              d="M12,10 L28,10 Q30,10 29,12 L17,26 L28,26 Q30,26 30,28 Q30,30 28,30 L12,30 Q10,30 11,28 L23,14 L12,14 Q10,14 10,12 Q10,10 12,10 Z"
              fill="url(#zGradientDash)"
            />
            <circle cx="31" cy="9" r="1.5" fill="#FFE082" opacity="0.9" />
          </svg>
          <span className="font-heading font-bold text-foreground">Christina&apos;s</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isEmployee ? (
          <NavSection items={employeeNav} label="Employee Portal" />
        ) : isAdmin ? (
          <AdminNavSection groups={adminNavGroups} />
        ) : (
          <NavSection items={parentNav} label="Parent Portal" />
        )}
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-christina-red text-white text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground">{displayRole}</p>
          </div>
        </div>
        {onLogout ? (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        ) : (
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </Link>
        )}
      </div>
    </div>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
  isEmployee?: boolean;
}

export function DashboardLayout({ children, isAdmin = false, isEmployee = false }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [family, setFamily] = useState<FamilyAccount | null>(null);

  useEffect(() => {
    if (isEmployee) {
      const emp = getCurrentEmployee();
      setEmployee(emp);
    } else if (!isAdmin) {
      const fam = getCurrentFamily();
      setFamily(fam);
    }
  }, [isEmployee, isAdmin]);

  const handleLogout = () => {
    if (isEmployee) {
      employeeLogout();
      window.location.href = '/employee-login';
    } else {
      logoutFamily();
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex h-screen bg-muted/30">
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r">
        <SidebarContent
          isAdmin={isAdmin}
          isEmployee={isEmployee}
          employee={employee}
          family={family}
          onLogout={(isEmployee || !isAdmin) ? handleLogout : undefined}
        />
      </aside>
      <div className="flex-1 flex flex-col min-h-0">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between lg:justify-end">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent
                isAdmin={isAdmin}
                isEmployee={isEmployee}
                employee={employee}
                family={family}
                onLogout={(isEmployee || !isAdmin) ? handleLogout : undefined}
              />
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

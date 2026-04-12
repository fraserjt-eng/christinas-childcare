'use client';

import Link from 'next/link';
import { LayoutGrid, Monitor, Users, Home, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PortalSwitcherProps {
  isAdmin?: boolean;
  isEmployee?: boolean;
}

const adminPortals = [
  { href: '/kiosk', label: 'Kiosk Mode', icon: Monitor },
  { href: '/employee', label: 'Employee Portal', icon: Users },
  { href: '/dashboard', label: 'Parent Portal', icon: Home },
  { href: '/', label: 'Public Site', icon: Globe },
];

const employeePortals = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/admin-login', label: 'Admin Login', icon: LayoutGrid },
];

export function PortalSwitcher({ isAdmin = false, isEmployee = false }: PortalSwitcherProps) {
  const portals = isAdmin ? adminPortals : isEmployee ? employeePortals : [];

  if (portals.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Switch Portal">
          <LayoutGrid className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Switch Portal</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {portals.map((portal) => (
          <DropdownMenuItem key={portal.href} asChild>
            <Link href={portal.href} className="flex items-center gap-2 cursor-pointer">
              <portal.icon className="h-4 w-4" />
              {portal.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

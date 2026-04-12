'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, Shield, ShieldCheck, FileText, ChevronRight, Settings,
  Building2, BookOpen, Cog, School,
} from 'lucide-react';

const settingsCards = [
  {
    title: 'Center Information',
    description: 'Name, address, phone, hours, license number',
    href: '/admin/settings/center',
    icon: Building2,
    color: 'text-christina-red',
    bgColor: 'bg-christina-red/10',
  },
  {
    title: 'Classrooms',
    description: 'Room names, age groups, capacity, staff ratios',
    href: '/admin/settings/classrooms',
    icon: School,
    color: 'text-christina-blue',
    bgColor: 'bg-christina-blue/10',
  },
  {
    title: 'Programs & About',
    description: 'About page text, mission, vision, program descriptions',
    href: '/admin/settings/programs',
    icon: BookOpen,
    color: 'text-christina-green',
    bgColor: 'bg-christina-green/10',
  },
  {
    title: 'User Management',
    description: 'Add, edit, and manage staff and parent accounts',
    href: '/admin/settings/users',
    icon: Users,
    color: 'text-christina-coral',
    bgColor: 'bg-christina-coral/10',
  },
  {
    title: 'Roles & Permissions',
    description: 'View and configure role-based access controls',
    href: '/admin/settings/roles',
    icon: Shield,
    color: 'text-christina-yellow',
    bgColor: 'bg-christina-yellow/10',
  },
  {
    title: 'Security Settings',
    description: 'Password policies, session timeouts, and login security',
    href: '/admin/settings/security',
    icon: ShieldCheck,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  {
    title: 'Audit Logs',
    description: 'View activity logs and security events',
    href: '/admin/settings/audit',
    icon: FileText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  {
    title: 'System',
    description: 'Training unlocks, demo mode, data export, danger zone',
    href: '/admin/settings/system',
    icon: Cog,
    color: 'text-christina-red',
    bgColor: 'bg-christina-red/10',
    superadminOnly: true,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-christina-red/10 rounded-lg">
          <Settings className="h-6 w-6 text-christina-red" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading">Settings</h1>
          <p className="text-muted-foreground font-body">Manage your center, content, users, and system configuration</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-1 font-heading">{card.title}</CardTitle>
                <CardDescription className="font-body">{card.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

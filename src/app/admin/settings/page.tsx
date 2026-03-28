'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, ShieldCheck, FileText, ChevronRight, Settings } from 'lucide-react';

const settingsCards = [
  {
    title: 'User Management',
    description: 'Add, edit, and manage staff and parent accounts',
    href: '/admin/settings/users',
    icon: Users,
    color: 'text-christina-red',
    bgColor: 'bg-christina-red/10',
  },
  {
    title: 'Roles & Permissions',
    description: 'View and configure role-based access controls',
    href: '/admin/settings/roles',
    icon: Shield,
    color: 'text-christina-blue',
    bgColor: 'bg-christina-blue/10',
  },
  {
    title: 'Security Settings',
    description: 'Password policies, session timeouts, and login security',
    href: '/admin/settings/security',
    icon: ShieldCheck,
    color: 'text-christina-coral',
    bgColor: 'bg-christina-coral/10',
  },
  {
    title: 'Audit Logs',
    description: 'View activity logs and security events',
    href: '/admin/settings/audit',
    icon: FileText,
    color: 'text-christina-yellow',
    bgColor: 'bg-christina-yellow/10',
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
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage users, roles, security, and system configuration</p>
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
                <CardTitle className="text-lg mb-1">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-muted rounded-lg">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Security Status</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Your application is currently using demo authentication. For production use,
                configure Supabase authentication in your environment variables.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Demo Auth Active</span>
                <span className="px-2 py-1 bg-muted text-muted-foreground rounded">localStorage Storage</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  Wrench,
  FileText,
  ScrollText,
  BadgeCheck,
  ExternalLink,
} from 'lucide-react';

const protectedItems = [
  'Every admin, parent, and staff page requires a login. There are no open doors into the app.',
  'Children’s records and financial data are not readable by the public. They stay behind the login wall.',
  'A parent can only see their own child. We ran a real cross-center test on July 5, 2026, and confirmed no family could reach another family’s data.',
  'Photos are private. They load through short-lived signed links, so a photo cannot be shared by copying its address.',
];

const improvingItems = [
  'A few operational tables still allow anonymous writes. We are locking those down, and the fix is staged for a safe deploy window.',
  'Leaked-password protection is being turned on, so a password known to be exposed elsewhere cannot be used here.',
  'A handful of smaller hardening fixes are written and waiting for the next safe deploy window rather than being rushed to the live site.',
];

const policyLinks = [
  { title: 'Privacy Policy', href: '/privacy' },
  { title: 'Terms of Service', href: '/terms' },
  { title: 'Cookie Policy', href: '/cookie-policy' },
  { title: 'FERPA Notice', href: '/ferpa-notice' },
  { title: 'Delete My Data', href: '/delete-data' },
];

const complianceItems = [
  {
    label: 'COPPA',
    text: 'We follow COPPA-style protections for children under 13. Their information is collected only for care and never sold.',
  },
  {
    label: 'FERPA',
    text: 'We treat children’s learning and progress records with FERPA-style care, kept private to the family and authorized staff.',
  },
  {
    label: 'SOC 2 direction',
    text: 'We are building toward SOC 2 practices: access controls, audit trails, and change discipline. This is a direction of travel, not a certification.',
  },
];

export default function SecurityPrivacyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-christina-coral/10 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-christina-coral" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Security &amp; Privacy</h1>
            <p className="text-muted-foreground font-body">
              A plain-language summary of how family, child, and staff data is kept safe
            </p>
          </div>
        </div>
      </div>

      {/* What's protected */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-christina-green/10 rounded-lg">
              <Lock className="h-5 w-5 text-christina-green" />
            </div>
            <div>
              <CardTitle className="font-heading">What&apos;s protected</CardTitle>
              <CardDescription className="font-body">
                The safeguards that are live today
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {protectedItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-christina-green mt-0.5 flex-shrink-0" />
                <span className="text-sm font-body">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* What we're improving */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-christina-yellow/20 rounded-lg">
              <Wrench className="h-5 w-5 text-christina-red" />
            </div>
            <div>
              <CardTitle className="font-heading">What we&apos;re improving</CardTitle>
              <CardDescription className="font-body">
                Honest about the work still in progress
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {improvingItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Wrench className="h-5 w-5 text-christina-red mt-0.5 flex-shrink-0" />
                <span className="text-sm font-body">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Your policies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-christina-blue/10 rounded-lg">
              <FileText className="h-5 w-5 text-christina-blue" />
            </div>
            <div>
              <CardTitle className="font-heading">Your policies</CardTitle>
              <CardDescription className="font-body">
                The legal pages families can read
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {policyLinks.map((link) => (
              <Link key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="w-full justify-between font-body"
                >
                  {link.title}
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance posture */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-christina-coral/10 rounded-lg">
              <BadgeCheck className="h-5 w-5 text-christina-coral" />
            </div>
            <div>
              <CardTitle className="font-heading">Compliance posture</CardTitle>
              <CardDescription className="font-body">
                Where we stand, stated plainly and without overclaiming
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {complianceItems.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <ScrollText className="h-5 w-5 text-christina-coral mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold font-heading">{item.label}</p>
                  <p className="text-sm text-muted-foreground font-body">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

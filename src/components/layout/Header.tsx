'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/admin-login', label: 'Admin' },
  { href: '/programs', label: 'Programs' },
  { href: '/scope-sequence', label: 'Curriculum' },
  { href: '/training', label: 'Training' },
  { href: '/about', label: 'About' },
  { href: '/enroll', label: 'Enroll' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="bg-christina-red text-white text-sm py-1">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> (763) 390-5870</span>
            <span className="hidden sm:flex items-center gap-1"><Mail className="h-3 w-3" /> info@christinaschildcare.com</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/employee-login" className="hover:underline">Staff Portal</Link>
            <Link href="/login" className="hover:underline">Parent Portal</Link>
          </div>
        </div>
      </div>
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg width="40" height="40" viewBox="0 0 40 40" className="flex-shrink-0">
            <circle cx="20" cy="20" r="20" fill="#C62828" />
            {/* Formal Z */}
            <path
              d="M11,11 L29,11 L29,14 L16,27 L29,27 L29,30 L11,30 L11,27 L24,14 L11,14 Z"
              fill="#FFD54F"
            />
          </svg>
          <div>
            <span className="font-heading font-bold text-lg text-foreground leading-tight block">Christina&apos;s</span>
            <span className="text-xs text-muted-foreground leading-tight block">Child Care Center</span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground hover:text-christina-red transition-colors">
              {link.label}
            </Link>
          ))}
          <Button asChild className="bg-christina-red hover:bg-christina-red/90">
            <Link href="/enroll">Schedule a Tour</Link>
          </Button>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <div className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-lg font-medium py-2 border-b">
                  {link.label}
                </Link>
              ))}
              <Button asChild className="bg-christina-red hover:bg-christina-red/90 mt-4">
                <Link href="/enroll" onClick={() => setOpen(false)}>Schedule a Tour</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

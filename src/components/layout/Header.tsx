'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, Phone, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/programs', label: 'Programs' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/faq', label: 'FAQ' },
  { href: '/signup-guide', label: 'Parent Guide' },
  { href: '/enroll', label: 'Enroll' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="bg-christina-red text-white text-sm py-1">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="tel:+17633905870" className="flex items-center gap-1 hover:underline"><Phone className="h-3 w-3" /> (763) 390-5870</a>
            <a href="mailto:info@christinaschildcare.com" className="hidden sm:flex items-center gap-1 hover:underline"><Mail className="h-3 w-3" /> info@christinaschildcare.com</a>
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
            <defs>
              <linearGradient id="zGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="50%" stopColor="#FFD54F" />
                <stop offset="100%" stopColor="#FFC107" />
              </linearGradient>
              <filter id="zGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="20" cy="20" r="20" fill="#C62828" />
            <g filter="url(#zGlow)">
              <path
                d="M12,10 L28,10 Q30,10 29,12 L17,26 L28,26 Q30,26 30,28 Q30,30 28,30 L12,30 Q10,30 11,28 L23,14 L12,14 Q10,14 10,12 Q10,10 12,10 Z"
                fill="url(#zGradient)"
              />
            </g>
            <circle cx="31" cy="9" r="1.5" fill="#FFE082" opacity="0.9" />
            <circle cx="33" cy="12" r="1" fill="#FFE082" opacity="0.7" />
          </svg>
          <div>
            <span className="font-playful text-lg text-foreground leading-tight block">Christina&apos;s</span>
            <span className="text-xs text-muted-foreground leading-tight block">Child Care Center</span>
          </div>
        </Link>
        <div className="hidden lg:flex items-center gap-5">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground hover:text-christina-red transition-colors">
              {link.label}
            </Link>
          ))}
          <Button asChild className="bg-christina-red hover:bg-christina-red/90">
            <Link href="/schedule-tour" className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Schedule a Tour</Link>
          </Button>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <div className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-lg font-medium py-2 border-b">
                  {link.label}
                </Link>
              ))}
              <Button asChild className="bg-christina-red hover:bg-christina-red/90 mt-4">
                <Link href="/schedule-tour" onClick={() => setOpen(false)} className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Schedule a Tour</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

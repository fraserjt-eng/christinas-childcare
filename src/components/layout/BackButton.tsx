'use client';

// A simple "Back" control for the portal headers. Owners testing the app asked
// for a way back from a deep sub-page without hunting the sidebar. It calls the
// browser's history back, and hides itself on the portal "home" routes where
// going back would land on the login or an unrelated screen.

import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HOME_ROUTES = new Set([
  '/admin',
  '/employee',
  '/dashboard',
  '/preview/office',
  '/preview/family',
  '/preview/room',
]);

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  if (!pathname || HOME_ROUTES.has(pathname)) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className="gap-1 text-muted-foreground hover:text-foreground"
      aria-label="Go back"
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Back</span>
    </Button>
  );
}

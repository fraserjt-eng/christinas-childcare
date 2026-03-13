'use client';

import { NewsletterArchive } from '@/components/dashboard/NewsletterArchive';

export default function NewsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Family Newsletter</h1>
        <p className="text-muted-foreground">Weekly updates from Christina&apos;s Child Care</p>
      </div>
      <NewsletterArchive />
    </div>
  );
}

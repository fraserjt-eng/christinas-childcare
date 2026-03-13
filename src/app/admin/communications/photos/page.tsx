'use client';

import { PhotoReviewGrid } from '@/components/admin/PhotoReviewGrid';
import { Camera } from 'lucide-react';

export default function PhotoReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Camera className="h-6 w-6" />
          Daily Photo Review
        </h1>
        <p className="text-muted-foreground">
          Review and approve staff-uploaded photos before sharing with parents
        </p>
      </div>
      <PhotoReviewGrid />
    </div>
  );
}

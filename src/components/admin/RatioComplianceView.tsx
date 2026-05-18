'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { RATIO_REQUIREMENTS } from '@/lib/schedule-optimizer-storage';

const AGE_GROUP_LABELS: Record<string, string> = {
  infant: 'Infant (0-12mo)',
  toddler: 'Toddler (1-3yr)',
  preschool: 'Preschool (3-5yr)',
  school_age: 'School Age (5+)',
};

// Ratio compliance has one real source of truth: /admin/ratios, which reads
// real children present (live attendance) and real staff clocked in (the
// time spine). This tab used to compute a second, parallel answer from
// simulated enrollment and scheduled shifts; two compliance numbers that can
// disagree is worse than one. It now points at the real monitor and keeps
// the Minnesota ratio reference, which is the genuinely useful planning aid.
export function RatioComplianceView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-christina-red" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="border-[#C62828]/20 bg-[#C62828]/5">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[#C62828] mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">
                  Live ratio compliance is on the Ratio Monitor
                </p>
                <p className="text-sm text-gray-600 mt-1 max-w-xl">
                  That screen uses real children present (live check-ins) and
                  real staff clocked in (the time spine), so it is the single
                  source of truth. Use this tab to plan staffing against the
                  state ratios below.
                </p>
              </div>
            </div>
            <Button asChild className="bg-[#C62828] hover:bg-[#a91f1f] gap-2">
              <Link href="/admin/ratios">
                Open Ratio Monitor
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#C62828]" />
            Minnesota State Minimum Ratios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(RATIO_REQUIREMENTS).map(([group, req]) => (
              <div
                key={group}
                className="bg-white rounded-lg border p-3 text-center"
              >
                <p className="text-xs text-gray-500">
                  {AGE_GROUP_LABELS[group]}
                </p>
                <p className="text-lg font-bold text-gray-800 mt-0.5">
                  1 : {req.children}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            One staff member can supervise this many children of that age. Plan
            shifts so every room meets its number for the children expected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { Building2 } from 'lucide-react';
import { SalariedAllocationGrid } from '@/components/scheduling/SalariedAllocationGrid';

export default function SalariedSchedulingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Salaried Staff Scheduling
        </h1>
        <p className="text-muted-foreground">
          Allocate salaried staff across Crystal and Brooklyn Park locations
        </p>
      </div>

      {/* Allocation Grid */}
      <SalariedAllocationGrid />
    </div>
  );
}

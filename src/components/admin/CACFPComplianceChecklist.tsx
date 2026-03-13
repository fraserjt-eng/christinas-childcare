'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  getCACFPCompliance,
  updateChecklistItem,
  CACFPComplianceRecord,
  CACFPChecklistItem,
} from '@/lib/cacfp-compliance-storage';

const CATEGORY_LABELS: Record<string, string> = {
  meal_counts: 'Meal Counts',
  documentation: 'Documentation',
  training: 'Training',
  facility: 'Facility',
  records: 'Records',
};

const CATEGORY_ICONS: Record<string, string> = {
  meal_counts: 'bg-christina-blue/10 text-christina-blue',
  documentation: 'bg-purple-100 text-purple-700',
  training: 'bg-christina-green/10 text-christina-green',
  facility: 'bg-christina-yellow/10 text-yellow-700',
  records: 'bg-christina-coral/10 text-christina-coral',
};

interface CACFPComplianceChecklistProps {
  onScoreChange?: (score: number) => void;
}

export function CACFPComplianceChecklist({ onScoreChange }: CACFPComplianceChecklistProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  const [record, setRecord] = useState<CACFPComplianceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getCACFPCompliance(selectedMonth);
      setRecord(data);
      onScoreChange?.(data.audit_score);
      setLoading(false);
    }
    load();
  }, [selectedMonth, onScoreChange]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + (direction === 'next' ? 1 : -1), 1);
    setSelectedMonth(
      `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    );
  };

  const handleToggle = async (itemId: string, checked: boolean) => {
    if (!record) return;
    const updated = await updateChecklistItem(selectedMonth, itemId, {
      completed: checked,
      completedAt: checked ? new Date().toISOString() : undefined,
    });
    setRecord(updated);
    onScoreChange?.(updated.audit_score);
  };

  const formatMonth = (monthStr: string): string => {
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  // Group items by category
  const groupedItems = record?.checklist.reduce<Record<string, CACFPChecklistItem[]>>(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            CACFP Monthly Compliance Checklist
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-auto"
            />
            <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{formatMonth(selectedMonth)}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupedItems && Object.entries(groupedItems).map(([category, items]) => {
          const completedCount = items.filter(i => i.completed).length;
          const allComplete = completedCount === items.length;

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={CATEGORY_ICONS[category]}>
                    {CATEGORY_LABELS[category]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {completedCount}/{items.length}
                  </span>
                </div>
                {allComplete && (
                  <FileCheck className="h-4 w-4 text-christina-green" />
                )}
              </div>

              <div className="space-y-2 pl-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                      item.completed ? 'bg-green-50/50' : item.required ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.completed}
                      onCheckedChange={(checked) =>
                        handleToggle(item.id, checked as boolean)
                      }
                      disabled={item.autoCheck}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={item.id}
                        className={`text-sm cursor-pointer ${
                          item.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {item.label}
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        {item.required && !item.completed && (
                          <span className="text-xs text-christina-coral flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Required
                          </span>
                        )}
                        {item.autoCheck && (
                          <span className="text-xs text-christina-blue">Auto-verified</span>
                        )}
                        {item.completedAt && (
                          <span className="text-xs text-muted-foreground">
                            Completed {new Date(item.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { getCACFPCompliance, getComplianceGaps } from '@/lib/cacfp-compliance-storage';

interface AuditReadinessScoreProps {
  month?: string;
  score?: number; // Allow parent to pass score directly
}

export function AuditReadinessScore({ month, score: externalScore }: AuditReadinessScoreProps) {
  const [score, setScore] = useState(externalScore ?? 0);
  const [criticalGaps, setCriticalGaps] = useState<string[]>([]);
  const [recommendedGaps, setRecommendedGaps] = useState<string[]>([]);

  const currentMonth = month || (() => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  })();

  useEffect(() => {
    if (externalScore !== undefined) {
      setScore(externalScore);
    }
  }, [externalScore]);

  useEffect(() => {
    async function load() {
      const record = await getCACFPCompliance(currentMonth);
      if (externalScore === undefined) {
        setScore(record.audit_score);
      }
      const gaps = getComplianceGaps(record.checklist);
      setCriticalGaps(gaps.critical.map(g => g.label));
      setRecommendedGaps(gaps.recommended.map(g => g.label));
    }
    load();
  }, [currentMonth, externalScore]);

  const getScoreColor = () => {
    if (score >= 90) return 'text-christina-green';
    if (score >= 70) return 'text-christina-yellow';
    if (score >= 50) return 'text-christina-coral';
    return 'text-christina-red';
  };

  const getStatusBadge = () => {
    if (score >= 90) return { label: 'Audit Ready', class: 'bg-green-100 text-green-800' };
    if (score >= 70) return { label: 'Nearly Ready', class: 'bg-yellow-100 text-yellow-800' };
    if (score >= 50) return { label: 'Gaps to Address', class: 'bg-orange-100 text-orange-800' };
    return { label: 'Not Ready', class: 'bg-red-100 text-red-800' };
  };

  const status = getStatusBadge();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Audit Readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="text-center">
          <p className={`text-5xl font-bold ${getScoreColor()}`}>{score}%</p>
          <Badge className={`mt-2 ${status.class}`}>{status.label}</Badge>
        </div>

        <Progress value={score} className="h-3" />

        {/* Gap Report */}
        {criticalGaps.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1 text-christina-coral">
              <XCircle className="h-4 w-4" />
              Critical gaps ({criticalGaps.length})
            </p>
            <ul className="space-y-1 pl-5">
              {criticalGaps.map((gap, i) => (
                <li key={i} className="text-sm text-red-700 list-disc">{gap}</li>
              ))}
            </ul>
          </div>
        )}

        {recommendedGaps.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1 text-yellow-700">
              <AlertTriangle className="h-4 w-4" />
              Recommended ({recommendedGaps.length})
            </p>
            <ul className="space-y-1 pl-5">
              {recommendedGaps.map((gap, i) => (
                <li key={i} className="text-sm text-yellow-700 list-disc">{gap}</li>
              ))}
            </ul>
          </div>
        )}

        {criticalGaps.length === 0 && recommendedGaps.length === 0 && (
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <CheckCircle className="h-8 w-8 text-christina-green mx-auto mb-2" />
            <p className="font-medium text-green-800">All items complete</p>
            <p className="text-sm text-green-600">Ready for CACFP audit</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

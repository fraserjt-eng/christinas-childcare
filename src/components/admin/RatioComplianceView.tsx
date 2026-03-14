'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import {
  getRatioCompliance,
  RATIO_REQUIREMENTS,
  type RatioComplianceResult,
} from '@/lib/schedule-optimizer-storage';

const AGE_GROUP_LABELS: Record<string, string> = {
  infant: 'Infant (0-12mo)',
  toddler: 'Toddler (1-3yr)',
  preschool: 'Preschool (3-5yr)',
  school_age: 'School Age (5+)',
};

function complianceStatus(result: RatioComplianceResult): 'compliant' | 'borderline' | 'non_compliant' {
  if (!result.compliant) return 'non_compliant';
  if (result.scheduled_staff === result.required_staff) return 'borderline';
  return 'compliant';
}

function statusBadge(status: ReturnType<typeof complianceStatus>) {
  switch (status) {
    case 'compliant':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 border">
          <CheckCircle2 className="h-3 w-3" />
          Compliant
        </Badge>
      );
    case 'borderline':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 gap-1 border">
          <AlertTriangle className="h-3 w-3" />
          Borderline
        </Badge>
      );
    case 'non_compliant':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 gap-1 border">
          <XCircle className="h-3 w-3" />
          Below Minimum
        </Badge>
      );
  }
}

function rowBg(status: ReturnType<typeof complianceStatus>): string {
  switch (status) {
    case 'compliant':
      return 'bg-emerald-50/40';
    case 'borderline':
      return 'bg-yellow-50/40';
    case 'non_compliant':
      return 'bg-red-50/40';
  }
}

export function RatioComplianceView() {
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [results, setResults] = useState<RatioComplianceResult[]>([]);

  useEffect(() => {
    setResults(getRatioCompliance(selectedDate));
  }, [selectedDate]);

  function shiftDate(delta: number) {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
  }

  const compliantCount = results.filter(r => r.compliant).length;
  const nonCompliantCount = results.filter(r => !r.compliant).length;
  const borderlineCount = results.filter(r => r.compliant && r.scheduled_staff === r.required_staff).length;

  const dateLabel = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-5">
      {/* Date nav */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => shiftDate(-1)} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-gray-800 min-w-48 text-center">{dateLabel}</span>
        <Button variant="outline" size="icon" onClick={() => shiftDate(1)} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs ml-1"
          onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
        >
          Today
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-emerald-700">{compliantCount}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Compliant</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{borderlineCount}</p>
            <p className="text-xs text-yellow-600 font-medium mt-1">Borderline</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-red-700">{nonCompliantCount}</p>
            <p className="text-xs text-red-600 font-medium mt-1">Below Minimum</p>
          </CardContent>
        </Card>
      </div>

      {/* Classroom table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#C62828]" />
            Classroom Ratio Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-600 px-4 py-2.5">Classroom</th>
                  <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5">Age Group</th>
                  <th className="text-center text-xs font-semibold text-gray-600 px-3 py-2.5">Enrolled</th>
                  <th className="text-center text-xs font-semibold text-gray-600 px-3 py-2.5">Required Staff</th>
                  <th className="text-center text-xs font-semibold text-gray-600 px-3 py-2.5">Actual Staff</th>
                  <th className="text-center text-xs font-semibold text-gray-600 px-3 py-2.5">Ratio</th>
                  <th className="text-left text-xs font-semibold text-gray-600 px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map(result => {
                  const status = complianceStatus(result);
                  const req = RATIO_REQUIREMENTS[result.classroom.age_group];
                  return (
                    <tr key={result.classroom.classroom_id} className={`border-b last:border-b-0 ${rowBg(status)}`}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {result.classroom.classroom_name}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600">
                        {AGE_GROUP_LABELS[result.classroom.age_group]}
                      </td>
                      <td className="px-3 py-3 text-sm text-center font-medium text-gray-800">
                        {result.enrolled}
                      </td>
                      <td className="px-3 py-3 text-sm text-center">
                        <span className="font-semibold text-gray-800">{result.required_staff}</span>
                        <span className="text-xs text-gray-500 ml-1">(1:{req.children} rule)</span>
                      </td>
                      <td className="px-3 py-3 text-sm text-center">
                        <span className={`font-bold text-lg ${!result.compliant ? 'text-red-600' : 'text-emerald-600'}`}>
                          {result.scheduled_staff}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-center font-mono text-gray-700">
                        {result.ratio_string}
                      </td>
                      <td className="px-4 py-3">
                        {statusBadge(status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legal reference */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">MN State Minimum Ratios (Reference)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(RATIO_REQUIREMENTS).map(([group, req]) => (
              <div key={group} className="bg-white rounded-lg border p-2 text-center">
                <p className="text-xs text-gray-500">{AGE_GROUP_LABELS[group]}</p>
                <p className="text-base font-bold text-gray-800 mt-0.5">1 : {req.children}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

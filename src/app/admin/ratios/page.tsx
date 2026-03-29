'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Minnesota licensing ratios
const CLASSROOM_CONFIG = [
  { classroom: 'infant', label: 'Infant Room', ageGroup: 'Infant', capacity: 8, requiredRatio: 4, color: '#FF7043' },
  { classroom: 'toddler', label: 'Toddler Room', ageGroup: 'Toddler', capacity: 14, requiredRatio: 7, color: '#FFD54F' },
  { classroom: 'preschool', label: 'Preschool Room', ageGroup: 'Preschool', capacity: 20, requiredRatio: 10, color: '#4CAF50' },
  { classroom: 'school_age', label: 'School Age Room', ageGroup: 'School Age', capacity: 15, requiredRatio: 15, color: '#2196F3' },
];

interface ClassroomData {
  label: string;
  ageGroup: string;
  capacity: number;
  present: number;
  requiredRatio: number;
  color: string;
  staffPresent: number;
}

export default function RatiosPage() {
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];

    // Get today's checked-in children (not checked out)
    const { data: attendance } = await supabase
      .from('attendance')
      .select('child_id, child_name')
      .eq('date', today)
      .is('check_out', null);

    // Get children with their classrooms
    const { data: children } = await supabase
      .from('family_children')
      .select('id, classroom');

    // Build classroom lookup
    const childClassroom = new Map<string, string>();
    if (children) {
      for (const c of children) {
        childClassroom.set(c.id, c.classroom || 'unassigned');
      }
    }

    // Count present children per classroom
    const presentByClassroom = new Map<string, number>();
    if (attendance) {
      for (const a of attendance) {
        const cls = childClassroom.get(a.child_id) || 'unassigned';
        presentByClassroom.set(cls, (presentByClassroom.get(cls) || 0) + 1);
      }
    }

    // Build classroom data
    const data: ClassroomData[] = CLASSROOM_CONFIG.map((cfg) => ({
      label: cfg.label,
      ageGroup: cfg.ageGroup,
      capacity: cfg.capacity,
      present: presentByClassroom.get(cfg.classroom) || 0,
      requiredRatio: cfg.requiredRatio,
      color: cfg.color,
      // Staff count: estimate 1 staff per ratio group needed, minimum 1 if children present
      staffPresent: Math.max(
        presentByClassroom.get(cfg.classroom) ? 1 : 0,
        Math.ceil((presentByClassroom.get(cfg.classroom) || 0) / cfg.requiredRatio)
      ),
    }));

    setClassrooms(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground animate-pulse">Loading ratios...</p>
      </div>
    );
  }

  const totalPresent = classrooms.reduce((s, c) => s + c.present, 0);
  const allCompliant = classrooms.every(
    (c) => c.present === 0 || c.present / c.staffPresent <= c.requiredRatio
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ratio Monitor</h1>
          <p className="text-muted-foreground">
            Live staff-to-child ratios ({totalPresent} children present)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge
            className={
              allCompliant
                ? 'bg-christina-green text-white gap-1'
                : 'bg-christina-coral text-white gap-1'
            }
          >
            {allCompliant ? (
              <>
                <CheckCircle className="h-3 w-3" /> All Compliant
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3" /> Attention Needed
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classrooms.map((cls) => {
          const actualRatio = cls.staffPresent > 0 ? cls.present / cls.staffPresent : 0;
          const compliant = cls.present === 0 || actualRatio <= cls.requiredRatio;
          const percentage = (cls.present / cls.capacity) * 100;

          return (
            <Card key={cls.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold">{cls.label}</h3>
                    <p className="text-xs text-muted-foreground">{cls.ageGroup}</p>
                  </div>
                  {cls.present > 0 ? (
                    <Badge
                      className={
                        compliant ? 'bg-christina-green text-white' : 'bg-christina-coral text-white'
                      }
                    >
                      {compliant ? 'OK' : 'Alert'}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Empty</Badge>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Children Present</span>
                    <span className="font-medium">
                      {cls.present} / {cls.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: cls.color }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Staff Present</span>
                    <span className="font-medium">{cls.staffPresent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Required Ratio</span>
                    <span className="font-medium">1:{cls.requiredRatio}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Actual Ratio</span>
                    <span
                      className={`font-bold ${
                        compliant ? 'text-christina-green' : 'text-christina-coral'
                      }`}
                    >
                      {cls.present === 0 ? 'N/A' : `1:${actualRatio.toFixed(1)}`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

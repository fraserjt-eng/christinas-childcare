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
  requiredStaff: number;
}

export default function RatiosPage() {
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [staffOnDuty, setStaffOnDuty] = useState<number | null>(null);
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

    // Build classroom data. requiredStaff is the licensing minimum for the
    // children actually present (real), not a guess at who is in the room.
    const data: ClassroomData[] = CLASSROOM_CONFIG.map((cfg) => {
      const present = presentByClassroom.get(cfg.classroom) || 0;
      return {
        label: cfg.label,
        ageGroup: cfg.ageGroup,
        capacity: cfg.capacity,
        present,
        requiredRatio: cfg.requiredRatio,
        color: cfg.color,
        requiredStaff: present === 0 ? 0 : Math.ceil(present / cfg.requiredRatio),
      };
    });

    // Real staff on the floor right now, from the spine (open time_entries).
    try {
      const r = await fetch('/api/pulse/floor', { cache: 'no-store' });
      if (r.ok) {
        const f = await r.json();
        setStaffOnDuty(typeof f.staffOnDuty === 'number' ? f.staffOnDuty : 0);
      } else {
        setStaffOnDuty(null);
      }
    } catch {
      setStaffOnDuty(null);
    }

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
  const totalRequiredStaff = classrooms.reduce((s, c) => s + c.requiredStaff, 0);
  const anyOverCapacity = classrooms.some((c) => c.present > c.capacity);
  // Honest compliance: real staff clocked in must cover the licensing minimum
  // for the children actually present, and no room over capacity. Per-room
  // staff assignment is unknown until staff pick a room at sign-in.
  const staffingKnown = staffOnDuty !== null;
  const staffingOk = staffingKnown && staffOnDuty! >= totalRequiredStaff;
  const allCompliant = !anyOverCapacity && (staffingKnown ? staffingOk : true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ratio Monitor</h1>
          <p className="text-muted-foreground">
            {totalPresent} children present
            {' · '}
            {staffOnDuty === null
              ? 'staff on duty unavailable'
              : `${staffOnDuty} staff clocked in`}
            {' · '}
            {totalRequiredStaff} required
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

      <Card
        className={
          allCompliant
            ? 'border-christina-green/40 bg-green-50/40'
            : 'border-christina-coral/40 bg-red-50/40'
        }
      >
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Staff on the floor right now</p>
              <p className="text-2xl font-bold">
                {staffOnDuty === null ? '—' : staffOnDuty}
                <span className="text-base font-normal text-muted-foreground">
                  {' '}
                  clocked in · {totalRequiredStaff} required for {totalPresent}{' '}
                  {totalPresent === 1 ? 'child' : 'children'} present
                </span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              {staffOnDuty === null
                ? 'Live staff count is unavailable. Showing licensing requirements only.'
                : anyOverCapacity
                  ? 'A room is over its licensed capacity. Move children before anything else.'
                  : staffingOk
                    ? 'Real staff clocked in covers the licensing minimum for the children present.'
                    : 'Not enough staff are clocked in for the children present. Get coverage now.'}
              {' '}Per-room staff assignment turns on when staff pick a room at sign-in.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classrooms.map((cls) => {
          const overCapacity = cls.present > cls.capacity;
          const compliant = !overCapacity;
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
                    <span className="text-muted-foreground">Required Ratio</span>
                    <span className="font-medium">1:{cls.requiredRatio}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Staff Required</span>
                    <span
                      className={`font-bold ${
                        overCapacity ? 'text-christina-coral' : 'text-foreground'
                      }`}
                    >
                      {cls.present === 0 ? 'N/A' : cls.requiredStaff}
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

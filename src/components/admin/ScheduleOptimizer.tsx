'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, XCircle, AlertTriangle, ChevronLeft, ChevronRight, Plus, Pencil } from 'lucide-react';
import {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
  getRatioCompliance,
  backfillShiftClassrooms,
  CENTER_LABELS,
  type ScheduleShift,
  type RatioComplianceResult,
} from '@/lib/schedule-optimizer-storage';

// ─── Constants ────────────────────────────────────────────────────────────────

const STAFF = [
  { id: 'emp-oz', name: 'Ophelia Zeogar', center: 'crystal' },
  { id: 'emp-cf', name: 'Christina Fraser', center: 'crystal' },
  { id: 'emp-ms', name: 'Maria Santos', center: 'crystal' },
  { id: 'emp-jr', name: 'James Robinson', center: 'crystal' },
  { id: 'emp-sk', name: 'Sarah Kim', center: 'brooklyn_park' },
  { id: 'emp-dc', name: 'David Chen', center: 'brooklyn_park' },
  { id: 'emp-lj', name: 'Lisa Johnson', center: 'brooklyn_park' },
  { id: 'emp-sz', name: 'Stephen Zeogar', center: 'crystal' },
];

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 20; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMondayOfWeek(offset: number): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const mon = new Date(today);
  mon.setDate(today.getDate() + diff + offset * 7);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function dateStr(base: Date, dayOffset: number): string {
  const d = new Date(base);
  d.setDate(base.getDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

function formatTimeDisplay(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')}${period}`;
}

function centerColor(centerId: string): string {
  return centerId === 'crystal'
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-blue-50 border-blue-200 text-blue-800';
}

function centerBg(centerId: string): string {
  return centerId === 'crystal' ? 'bg-red-50' : 'bg-blue-50';
}

// ─── Shift Cell ───────────────────────────────────────────────────────────────

interface ShiftCellProps {
  shift?: ScheduleShift;
  centerId: string;
  onEdit: (shift: ScheduleShift) => void;
  onAdd: (employeeId: string, employeeName: string, date: string, centerId: string) => void;
  employeeId: string;
  employeeName: string;
  date: string;
}

function ShiftCell({ shift, centerId, onEdit, onAdd, employeeId, employeeName, date }: ShiftCellProps) {
  if (!shift) {
    return (
      <button
        onClick={() => onAdd(employeeId, employeeName, date, centerId)}
        className="w-full h-12 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors group"
      >
        <Plus className="h-3 w-3 text-gray-300 group-hover:text-gray-500" />
      </button>
    );
  }

  return (
    <button
      onClick={() => onEdit(shift)}
      className={`w-full h-12 rounded-lg border px-1.5 flex flex-col justify-center hover:brightness-95 transition-all ${centerColor(shift.center_id)}`}
    >
      <span className="text-xs font-semibold leading-tight">
        {formatTimeDisplay(shift.start_time)}
      </span>
      <span className="text-xs text-opacity-80 leading-tight flex items-center gap-0.5">
        {formatTimeDisplay(shift.end_time)}
        {shift.is_overtime && <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />}
        <Pencil className="h-2.5 w-2.5 opacity-40 ml-auto" />
      </span>
    </button>
  );
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────────

interface EditShiftDialogProps {
  open: boolean;
  shift?: ScheduleShift;
  newShiftData?: { employeeId: string; employeeName: string; date: string; centerId: string };
  onSave: () => void;
  onClose: () => void;
}

function EditShiftDialog({ open, shift, newShiftData, onSave, onClose }: EditShiftDialogProps) {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:30');

  useEffect(() => {
    if (shift) {
      setStartTime(shift.start_time);
      setEndTime(shift.end_time);
    } else {
      setStartTime('08:00');
      setEndTime('16:30');
    }
  }, [shift, open]);

  function handleSave() {
    if (shift) {
      updateShift(shift.id, { start_time: startTime, end_time: endTime });
    } else if (newShiftData) {
      createShift({
        employee_id: newShiftData.employeeId,
        employee_name: newShiftData.employeeName,
        center_id: newShiftData.centerId as 'crystal' | 'brooklyn_park',
        date: newShiftData.date,
        start_time: startTime,
        end_time: endTime,
        is_overtime: false,
      });
    }
    onSave();
    onClose();
  }

  function handleDelete() {
    if (shift) deleteShift(shift.id);
    onSave();
    onClose();
  }

  const title = shift
    ? `Edit shift: ${shift.employee_name}`
    : newShiftData
    ? `Add shift: ${newShiftData.employeeName}`
    : '';

  const dateLabel = shift
    ? new Date(shift.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    : newShiftData
    ? new Date(newShiftData.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{dateLabel}</p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Start Time</label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map(t => (
                    <SelectItem key={t} value={t}>{formatTimeDisplay(t)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">End Time</label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map(t => (
                    <SelectItem key={t} value={t}>{formatTimeDisplay(t)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            {shift && (
              <Button variant="destructive" size="sm" onClick={handleDelete} className="mr-auto">
                Remove Shift
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose} className="ml-auto">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-[#C62828] hover:bg-[#B71C1C] text-white">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Ratio Row ────────────────────────────────────────────────────────────────

function RatioRow({ compliance }: { compliance: RatioComplianceResult[] }) {
  return (
    <tr>
      <td className="py-2 pr-3 text-xs font-semibold text-gray-600 whitespace-nowrap">
        Ratio Check
      </td>
      {[0, 1, 2, 3, 4].map(day => {
        const allCompliant = compliance.every(c => c.compliant);
        const anyNonCompliant = compliance.some(c => !c.compliant);

        return (
          <td key={day} className="py-2 px-1 text-center">
            {anyNonCompliant ? (
              <div className="flex items-center justify-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Gap</span>
              </div>
            ) : allCompliant ? (
              <div className="flex items-center justify-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-medium">OK</span>
              </div>
            ) : (
              <div className="flex items-center justify-center text-gray-400">
                <span className="text-xs">--</span>
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ScheduleOptimizer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Backfill classroom_id on any pre-existing seed shifts so ratio
    // compliance reflects real coverage instead of zero across rooms.
    backfillShiftClassrooms();
    setMounted(true);
  }, []);

  const [weekOffset, setWeekOffset] = useState(0);
  const [shifts, setShifts] = useState<ScheduleShift[]>([]);
  const [compliance, setCompliance] = useState<RatioComplianceResult[]>([]);
  const [editShift, setEditShift] = useState<ScheduleShift | undefined>();
  const [newShiftData, setNewShiftData] = useState<{
    employeeId: string;
    employeeName: string;
    date: string;
    centerId: string;
  } | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [centerFilter, setCenterFilter] = useState<'all' | 'crystal' | 'brooklyn_park'>('all');

  // Stabilize the Date reference: getMondayOfWeek() returns a NEW Date object
  // on every render, which made `loadData`'s [monday] dep unstable, which made
  // the useEffect below fire on every render → setShifts/setCompliance →
  // re-render → infinite loop (React error #185). Pin to weekOffset (a
  // primitive) so the memo only recomputes when the week actually changes.
  const monday = useMemo(() => getMondayOfWeek(weekOffset), [weekOffset]);
  const mondayKey = useMemo(() => monday.toISOString().slice(0, 10), [monday]);
  const weekDates = useMemo(
    () => [0, 1, 2, 3, 4].map((d) => dateStr(monday, d)),
    [monday]
  );

  const loadData = useCallback(() => {
    const loaded = getShifts({ week_start: mondayKey });
    setShifts(loaded);

    // Use today for ratio compliance display
    const today = new Date().toISOString().slice(0, 10);
    setCompliance(getRatioCompliance(today));
  }, [mondayKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const weekLabel = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }`;

  function getShiftForCell(employeeId: string, date: string): ScheduleShift | undefined {
    return shifts.find(s => s.employee_id === employeeId && s.date === date);
  }

  function handleEditShift(shift: ScheduleShift) {
    setEditShift(shift);
    setNewShiftData(undefined);
    setDialogOpen(true);
  }

  function handleAddShift(employeeId: string, employeeName: string, date: string, centerId: string) {
    setEditShift(undefined);
    setNewShiftData({ employeeId, employeeName, date, centerId });
    setDialogOpen(true);
  }

  const filteredStaff = STAFF.filter(s =>
    centerFilter === 'all' || s.center === centerFilter
  );

  if (!mounted) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-christina-red" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset(w => w - 1)}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-gray-800 min-w-[200px] text-center">
            {weekLabel}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset(w => w + 1)}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {weekOffset !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)} className="text-xs">
              This Week
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="inline-block w-3 h-3 rounded bg-red-100 border border-red-300" />
            Crystal
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="inline-block w-3 h-3 rounded bg-blue-100 border border-blue-300" />
            Brooklyn Park
          </div>
          <Select value={centerFilter} onValueChange={v => setCenterFilter(v as typeof centerFilter)}>
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Centers</SelectItem>
              <SelectItem value="crystal">Crystal only</SelectItem>
              <SelectItem value="brooklyn_park">Brooklyn Park only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-amber-500" />
          Overtime risk
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          Ratio compliant
        </div>
        <div className="flex items-center gap-1">
          <XCircle className="h-3 w-3 text-red-500" />
          Ratio gap
        </div>
      </div>

      {/* Grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600 w-36 min-w-36">
                  Staff Member
                </th>
                {weekDates.map((date, i) => (
                  <th key={date} className="py-3 px-1 text-center text-xs font-semibold text-gray-600 min-w-24">
                    <div>{DAY_NAMES[i]}</div>
                    <div className="text-gray-400 font-normal">
                      {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr
                  key={staff.id}
                  className={`border-b last:border-b-0 ${centerBg(staff.center)} hover:brightness-95 transition-colors`}
                >
                  <td className="py-2 px-3">
                    <div className="text-xs font-semibold text-gray-800 leading-tight">{staff.name}</div>
                    <div className="text-xs text-gray-500">{CENTER_LABELS[staff.center]}</div>
                  </td>
                  {weekDates.map(date => {
                    const shift = getShiftForCell(staff.id, date);
                    return (
                      <td key={date} className="py-1.5 px-1">
                        <ShiftCell
                          shift={shift}
                          centerId={staff.center}
                          onEdit={handleEditShift}
                          onAdd={handleAddShift}
                          employeeId={staff.id}
                          employeeName={staff.name}
                          date={date}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Separator */}
              <tr className="bg-gray-100">
                <td colSpan={6} className="py-0.5" />
              </tr>

              {/* Ratio compliance row */}
              <RatioRow compliance={compliance} />
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        {compliance.filter(c => !c.compliant).map(c => (
          <Badge key={c.classroom.classroom_id} variant="outline" className="bg-red-50 border-red-200 text-red-700 text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            {c.classroom.classroom_name}: needs {c.required_staff - c.scheduled_staff} more staff
          </Badge>
        ))}
        {compliance.every(c => c.compliant) && (
          <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            All classrooms compliant today
          </Badge>
        )}
      </div>

      {/* Edit / Add dialog */}
      <EditShiftDialog
        open={dialogOpen}
        shift={editShift}
        newShiftData={newShiftData}
        onSave={loadData}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

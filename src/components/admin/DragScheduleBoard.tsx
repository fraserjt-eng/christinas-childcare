'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Trash2,
  X,
  Clock,
} from 'lucide-react';
import {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
  CENTER_LABELS,
  type ScheduleShift,
} from '@/lib/schedule-optimizer-storage';
import { getEmployees } from '@/lib/employee-storage';
import type { Employee } from '@/types/employee';

// ─── Types ────────────────────────────────────────────────────────────────

interface StaffMember {
  id: string;
  name: string;
  center: 'crystal' | 'brooklyn_park';
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// Grid: 6 AM to 6 PM = 12 hours = 720 minutes
const GRID_START_HOUR = 6;
const GRID_END_HOUR = 18;
const GRID_MINUTES = (GRID_END_HOUR - GRID_START_HOUR) * 60;

interface PresetShift {
  id: string;
  label: string;
  start: string;
  end: string;
  bg: string;
  border: string;
  text: string;
}

const PRESET_SHIFTS: PresetShift[] = [
  { id: 'morning', label: 'Morning', start: '07:00', end: '12:00', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
  { id: 'late-morning', label: 'Late Morning', start: '08:00', end: '13:00', bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-800' },
  { id: 'full-day', label: 'Full Day', start: '07:00', end: '15:30', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
  { id: 'afternoon', label: 'Afternoon', start: '12:00', end: '18:00', bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
  { id: 'opening', label: 'Opening', start: '06:00', end: '14:30', bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800' },
  { id: 'closing', label: 'Closing', start: '10:00', end: '18:00', bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-800' },
];

const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 20; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMondayOfWeek(offset: number): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
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

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function shiftDurationHours(start: string, end: string): number {
  return Math.max(0, (timeToMinutes(end) - timeToMinutes(start)) / 60);
}

// Returns left offset % and width % on the time grid
function shiftGridPosition(start: string, end: string): { left: string; width: string } {
  const startMin = timeToMinutes(start) - GRID_START_HOUR * 60;
  const endMin = timeToMinutes(end) - GRID_START_HOUR * 60;
  const clampedStart = Math.max(0, Math.min(startMin, GRID_MINUTES));
  const clampedEnd = Math.max(0, Math.min(endMin, GRID_MINUTES));
  const left = (clampedStart / GRID_MINUTES) * 100;
  const width = ((clampedEnd - clampedStart) / GRID_MINUTES) * 100;
  return { left: `${left}%`, width: `${Math.max(width, 2)}%` };
}

function formatWeekRange(monday: Date): string {
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const start = monday.toLocaleDateString('en-US', opts);
  const end = friday.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${start} – ${end}`;
}

function getPresetStyle(shift: ScheduleShift): { bg: string; border: string; text: string } {
  if (shift.center_id === 'crystal') {
    return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800' };
  }
  return { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800' };
}

// ─── Draggable Preset Tile ─────────────────────────────────────────────────

interface DraggablePresetProps {
  preset: PresetShift;
}

function DraggablePreset({ preset }: DraggablePresetProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `preset-${preset.id}`,
    data: { type: 'preset', preset },
  });

  const duration = shiftDurationHours(preset.start, preset.end);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        cursor-grab active:cursor-grabbing select-none
        rounded-lg border-2 px-3 py-2
        ${preset.bg} ${preset.border} ${preset.text}
        transition-all
        ${isDragging ? 'opacity-40 scale-95' : 'hover:brightness-95 hover:shadow-sm'}
      `}
    >
      <div className="font-semibold text-sm">{preset.label}</div>
      <div className="text-xs mt-0.5 opacity-75">
        {formatTimeDisplay(preset.start)} – {formatTimeDisplay(preset.end)}
      </div>
      <div className="text-xs mt-0.5 opacity-60">{duration}h</div>
    </div>
  );
}

// ─── Droppable Employee Row ────────────────────────────────────────────────

interface DroppableRowProps {
  employeeId: string;
  date: string;
  shifts: ScheduleShift[];
  onShiftClick: (shift: ScheduleShift) => void;
  onEmptyClick: (employeeId: string, date: string) => void;
}

function DroppableRow({ employeeId, date, shifts, onShiftClick, onEmptyClick }: DroppableRowProps) {
  const dropId = `row-${employeeId}-${date}`;
  const { setNodeRef, isOver } = useDroppable({ id: dropId, data: { employeeId, date } });

  return (
    <div
      ref={setNodeRef}
      onClick={() => { if (shifts.length === 0) onEmptyClick(employeeId, date); }}
      className={`
        relative h-12 rounded border transition-colors
        ${isOver ? 'bg-christina-yellow/20 border-christina-yellow border-2' : 'bg-gray-50 border-gray-200'}
        ${shifts.length === 0 ? 'cursor-pointer hover:bg-gray-100' : ''}
      `}
    >
      {shifts.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-300 text-xs">+ Add</span>
        </div>
      )}
      {shifts.map(shift => {
        const pos = shiftGridPosition(shift.start_time, shift.end_time);
        const style = getPresetStyle(shift);
        const duration = shiftDurationHours(shift.start_time, shift.end_time);
        return (
          <button
            key={shift.id}
            onClick={e => { e.stopPropagation(); onShiftClick(shift); }}
            style={{ left: pos.left, width: pos.width }}
            className={`
              absolute top-1 bottom-1 rounded border
              ${style.bg} ${style.border} ${style.text}
              flex flex-col justify-center px-1.5
              hover:brightness-95 transition-all overflow-hidden
              text-left
            `}
          >
            <span className="text-xs font-semibold leading-tight truncate">
              {formatTimeDisplay(shift.start_time)}–{formatTimeDisplay(shift.end_time)}
            </span>
            <span className="text-xs opacity-60 leading-tight">{duration}h</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Inline Shift Edit Panel (no Radix Dialog/Select to avoid portal crashes) ──

interface ShiftPanelProps {
  open: boolean;
  mode: 'add' | 'edit';
  shift?: ScheduleShift;
  employeeId?: string;
  employeeName?: string;
  date?: string;
  centerId?: 'crystal' | 'brooklyn_park';
  staffList: StaffMember[];
  onSave: () => void;
  onClose: () => void;
}

function ShiftPanel({ open, mode, shift, employeeId, employeeName, date, centerId, staffList, onSave, onClose }: ShiftPanelProps) {
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('15:30');

  useEffect(() => {
    if (shift) {
      setStartTime(shift.start_time);
      setEndTime(shift.end_time);
    } else {
      setStartTime('07:00');
      setEndTime('15:30');
    }
  }, [shift, open]);

  if (!open) return null;

  const handleSave = () => {
    const weeklyApprox = shiftDurationHours(startTime, endTime) * 5;
    const isOvertime = weeklyApprox > 40;

    if (mode === 'edit' && shift) {
      updateShift(shift.id, { start_time: startTime, end_time: endTime, is_overtime: isOvertime });
    } else if (mode === 'add' && employeeId && date && centerId) {
      const emp = staffList.find(s => s.id === employeeId);
      createShift({
        employee_id: employeeId,
        employee_name: emp?.name || employeeName || 'Staff',
        center_id: centerId,
        date,
        start_time: startTime,
        end_time: endTime,
        is_overtime: isOvertime,
      });
    }
    onSave();
    onClose();
  };

  const handleDelete = () => {
    if (shift) deleteShift(shift.id);
    onSave();
    onClose();
  };

  const emp = shift
    ? staffList.find(s => s.id === shift?.employee_id)
    : staffList.find(s => s.id === employeeId);

  return (
    <Card className="border-2 border-christina-red/30 bg-white shadow-lg">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-christina-red">
              {mode === 'add' ? 'Add Shift' : 'Edit Shift'}
            </p>
            <p className="text-sm text-gray-700">{emp?.name}</p>
            <p className="text-xs text-gray-500">
              {date || shift?.date} &middot; {centerId ? CENTER_LABELS[centerId] : shift ? CENTER_LABELS[shift.center_id] : ''}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Start Time</Label>
            <select
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {TIME_OPTIONS.map(t => (
                <option key={t} value={t}>{formatTimeDisplay(t)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">End Time</Label>
            <select
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {TIME_OPTIONS.map(t => (
                <option key={t} value={t}>{formatTimeDisplay(t)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{shiftDurationHours(startTime, endTime).toFixed(1)} hours</span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} className="flex-1 bg-christina-red hover:bg-christina-red/90 text-white">
            Save Shift
          </Button>
          {mode === 'edit' && (
            <Button variant="outline" size="icon" onClick={handleDelete} className="border-red-200 text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DragScheduleBoard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [shifts, setShifts] = useState<ScheduleShift[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [activeDragPreset, setActiveDragPreset] = useState<PresetShift | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [dialogShift, setDialogShift] = useState<ScheduleShift | undefined>(undefined);
  const [dialogEmployeeId, setDialogEmployeeId] = useState<string | undefined>(undefined);
  const [dialogDate, setDialogDate] = useState<string | undefined>(undefined);
  const [dialogCenterId, setDialogCenterId] = useState<'crystal' | 'brooklyn_park' | undefined>(undefined);
  const [copySuccess, setCopySuccess] = useState(false);

  const monday = getMondayOfWeek(weekOffset);
  const currentDate = dateStr(monday, selectedDayIndex);
  const mondayStr = monday.toISOString().slice(0, 10);

  const loadShifts = useCallback(() => {
    const weekShifts = getShifts({ week_start: mondayStr });
    setShifts(weekShifts);
  }, [mondayStr]);

  // Load real employees from employee-storage
  useEffect(() => {
    if (!mounted) return;
    async function loadStaff() {
      const employees = await getEmployees();
      const active = employees.filter((e: Employee) => e.employment_status === 'active');
      const mapped: StaffMember[] = active.map((e: Employee) => ({
        id: e.id,
        name: `${e.first_name} ${e.last_name}`,
        center: 'crystal' as const, // Default center; can be extended
      }));
      if (mapped.length > 0) {
        setStaff(mapped);
      }
    }
    loadStaff();
  }, [mounted]);

  useEffect(() => {
    if (mounted) loadShifts();
  }, [mounted, loadShifts]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'preset') {
      setActiveDragPreset(event.active.data.current.preset as PresetShift);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragPreset(null);
    const { over, active } = event;
    if (!over || active.data.current?.type !== 'preset') return;

    const preset = active.data.current.preset as PresetShift;
    const { employeeId, date } = over.data.current as { employeeId: string; date: string };
    const emp = staff.find(s => s.id === employeeId);
    if (!emp) return;

    const weeklyApprox = shiftDurationHours(preset.start, preset.end) * 5;
    createShift({
      employee_id: employeeId,
      employee_name: emp.name,
      center_id: emp.center,
      date,
      start_time: preset.start,
      end_time: preset.end,
      is_overtime: weeklyApprox > 40,
    });
    loadShifts();
  };

  const handleShiftClick = (shift: ScheduleShift) => {
    setDialogMode('edit');
    setDialogShift(shift);
    setDialogEmployeeId(undefined);
    setDialogDate(undefined);
    setDialogCenterId(undefined);
    setDialogOpen(true);
  };

  const handleEmptyClick = (employeeId: string, date: string) => {
    const emp = staff.find(s => s.id === employeeId);
    if (!emp) return;
    setDialogMode('add');
    setDialogShift(undefined);
    setDialogEmployeeId(employeeId);
    setDialogDate(date);
    setDialogCenterId(emp.center);
    setDialogOpen(true);
  };

  const handleCopyLastWeek = () => {
    const prevMonday = getMondayOfWeek(weekOffset - 1);
    const prevShifts = getShifts({ week_start: prevMonday.toISOString().slice(0, 10) });
    const currentMondayStr = mondayStr;

    if (prevShifts.length === 0) return;

    prevShifts.forEach(prev => {
      const prevDate = new Date(prev.date + 'T12:00:00');
      const prevMonStart = getMondayOfWeek(weekOffset - 1);
      const dayOffset = Math.round((prevDate.getTime() - prevMonStart.getTime()) / (1000 * 60 * 60 * 24));
      const newDate = new Date(currentMondayStr + 'T12:00:00');
      newDate.setDate(newDate.getDate() + dayOffset);
      const newDateStr = newDate.toISOString().slice(0, 10);

      createShift({
        employee_id: prev.employee_id,
        employee_name: prev.employee_name,
        center_id: prev.center_id,
        date: newDateStr,
        start_time: prev.start_time,
        end_time: prev.end_time,
        classroom_id: prev.classroom_id,
        hourly_rate: prev.hourly_rate,
        is_overtime: prev.is_overtime,
      });
    });

    loadShifts();
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const dayDate = dateStr(monday, selectedDayIndex);
  const dayShiftsMap: Record<string, ScheduleShift[]> = {};
  staff.forEach(emp => {
    dayShiftsMap[emp.id] = shifts.filter(s => s.employee_id === emp.id && s.date === dayDate);
  });

  // Time axis tick labels
  const hourTicks = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR + 1 }, (_, i) => GRID_START_HOUR + i);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christina-red" />
      </div>
    );
  }

  return (
    <>
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">

        {/* Week Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekOffset(w => w - 1)}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-heading font-semibold text-gray-800 min-w-[200px] text-center">
              {formatWeekRange(monday)}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekOffset(w => w + 1)}
              className="h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekOffset(0)}
              className="text-xs h-9"
            >
              This Week
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLastWeek}
            className={`gap-1.5 h-9 text-xs ${copySuccess ? 'border-green-400 text-green-700 bg-green-50' : ''}`}
          >
            <Copy className="h-3.5 w-3.5" />
            {copySuccess ? 'Copied!' : 'Copy Last Week'}
          </Button>
        </div>

        <div className="flex gap-4">
          {/* Preset Palette */}
          <div className="w-40 flex-shrink-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Shift Presets</p>
            <div className="space-y-2">
              {PRESET_SHIFTS.map(preset => (
                <DraggablePreset key={preset.id} preset={preset} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 leading-tight">
              Drag a preset onto an employee row to add that shift.
            </p>
          </div>

          {/* Schedule Grid */}
          <div className="flex-1 min-w-0">
            {/* Day Selector */}
            <div className="flex gap-1 mb-3">
              {DAY_NAMES.map((day, i) => {
                const d = dateStr(monday, i);
                const dayCount = shifts.filter(s => s.date === d).length;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDayIndex(i)}
                    className={`
                      flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors relative
                      ${selectedDayIndex === i
                        ? 'bg-christina-red text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {day}
                    {dayCount > 0 && (
                      <span className={`
                        ml-1 text-xs font-bold
                        ${selectedDayIndex === i ? 'text-red-100' : 'text-gray-400'}
                      `}>
                        {dayCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <Card className="overflow-hidden">
              {/* Time Axis Header */}
              <div className="flex border-b border-gray-100">
                <div className="w-40 flex-shrink-0 border-r border-gray-100 bg-gray-50 px-3 py-2">
                  <span className="text-xs text-gray-400 font-medium">Staff</span>
                </div>
                <div className="flex-1 relative h-8">
                  {hourTicks.map(hour => {
                    const pct = ((hour - GRID_START_HOUR) / (GRID_END_HOUR - GRID_START_HOUR)) * 100;
                    const label = hour === 12 ? '12p' : hour < 12 ? `${hour}a` : `${hour - 12}p`;
                    return (
                      <span
                        key={hour}
                        style={{ left: `${pct}%` }}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-xs text-gray-400 select-none"
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Employee Rows */}
              {staff.map((emp, idx) => {
                const isLastCrystal = emp.center === 'crystal' && (staff[idx + 1]?.center !== 'crystal');
                return (
                  <div
                    key={emp.id}
                    className={`flex border-b ${isLastCrystal ? 'border-b-2 border-b-red-100' : 'border-gray-50'}`}
                  >
                    {/* Employee Label */}
                    <div className={`
                      w-40 flex-shrink-0 border-r border-gray-100 px-3 py-2 flex flex-col justify-center
                      ${emp.center === 'crystal' ? 'bg-red-50' : 'bg-blue-50'}
                    `}>
                      <span className="text-xs font-semibold text-gray-700 leading-tight truncate">{emp.name}</span>
                      <span className={`text-xs leading-tight ${emp.center === 'crystal' ? 'text-red-500' : 'text-blue-500'}`}>
                        {CENTER_LABELS[emp.center]}
                      </span>
                    </div>

                    {/* Drop Zone */}
                    <div className="flex-1 px-1 py-1">
                      <DroppableRow
                        employeeId={emp.id}
                        date={currentDate}
                        shifts={dayShiftsMap[emp.id] || []}
                        onShiftClick={handleShiftClick}
                        onEmptyClick={handleEmptyClick}
                      />
                    </div>
                  </div>
                );
              })}
            </Card>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-2 px-1">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-red-100 border border-red-300" />
                <span className="text-xs text-gray-500">Crystal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-blue-100 border border-blue-300" />
                <span className="text-xs text-gray-500">Brooklyn Park</span>
              </div>
              <span className="text-xs text-gray-400 ml-auto">
                {(dayShiftsMap ? Object.values(dayShiftsMap).flat().length : 0)} shift{Object.values(dayShiftsMap).flat().length !== 1 ? 's' : ''} on {DAY_NAMES[selectedDayIndex]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragPreset && (
          <div className={`
            rounded-lg border-2 px-3 py-2 shadow-lg
            ${activeDragPreset.bg} ${activeDragPreset.border} ${activeDragPreset.text}
            opacity-90 cursor-grabbing
          `}>
            <div className="font-semibold text-sm">{activeDragPreset.label}</div>
            <div className="text-xs opacity-75">
              {formatTimeDisplay(activeDragPreset.start)} – {formatTimeDisplay(activeDragPreset.end)}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>

    {/* Shift Dialog — outside DndContext to prevent portal conflicts */}
    <ShiftPanel
      open={dialogOpen}
      mode={dialogMode}
      shift={dialogShift}
      employeeId={dialogEmployeeId}
      employeeName={dialogEmployeeId ? staff.find(s => s.id === dialogEmployeeId)?.name : undefined}
      date={dialogDate}
      centerId={dialogCenterId}
      staffList={staff}
      onSave={loadShifts}
      onClose={() => setDialogOpen(false)}
    />
    </>
  );
}

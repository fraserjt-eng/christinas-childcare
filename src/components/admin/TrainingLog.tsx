'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { BookOpen, Plus, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  getTrainingRecords,
  addTrainingRecord,
  getAnnualTrainingHours,
  ANNUAL_TRAINING_HOURS_REQUIRED,
  type TrainingRecord,
} from '@/lib/staff-development-storage';
import { isDemoSeedEnabled } from '@/lib/demo-mode';

const STAFF = isDemoSeedEnabled()
  ? [
      { id: 'emp-oz', name: 'Ophelia Zeogar' },
      { id: 'emp-cf', name: 'Christina Fraser' },
      { id: 'emp-ms', name: 'Maria Santos' },
      { id: 'emp-jr', name: 'James Robinson' },
      { id: 'emp-sk', name: 'Sarah Kim' },
      { id: 'emp-dc', name: 'David Chen' },
    ]
  : [];

const CURRENT_YEAR = new Date().getFullYear();

// ─── Add Training Dialog ──────────────────────────────────────────────────────

interface AddTrainingDialogProps {
  open: boolean;
  onAdd: (record: Omit<TrainingRecord, 'id'>) => void;
  onClose: () => void;
}

function AddTrainingDialog({ open, onAdd, onClose }: AddTrainingDialogProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [trainingName, setTrainingName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState('');
  const [provider, setProvider] = useState('');

  function handleSubmit() {
    if (!employeeId || !trainingName || !hours || !provider) return;
    const staff = STAFF.find(s => s.id === employeeId);
    if (!staff) return;

    onAdd({
      employee_id: employeeId,
      employee_name: staff.name,
      training_name: trainingName,
      date,
      hours: parseFloat(hours),
      provider,
    });
    // Reset
    setEmployeeId('');
    setTrainingName('');
    setDate(new Date().toISOString().slice(0, 10));
    setHours('');
    setProvider('');
    onClose();
  }

  const isValid = employeeId && trainingName.trim() && hours && provider.trim();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Training Record</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Employee</label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee..." />
              </SelectTrigger>
              <SelectContent>
                {STAFF.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Training Name</label>
            <input
              type="text"
              value={trainingName}
              onChange={e => setTrainingName(e.target.value)}
              placeholder="e.g. Child Development Workshop"
              className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Hours</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={hours}
                onChange={e => setHours(e.target.value)}
                placeholder="e.g. 3"
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Provider / Organization</label>
            <input
              type="text"
              value={provider}
              onChange={e => setProvider(e.target.value)}
              placeholder="e.g. MN Child Care Resource"
              className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!isValid}
              className="flex-1 bg-[#C62828] hover:bg-[#B71C1C] text-white"
            >
              Add Record
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Hours Progress Bar ───────────────────────────────────────────────────────

function HoursProgressBar({ employeeId, employeeName }: { employeeId: string; employeeName: string }) {
  const hours = getAnnualTrainingHours(employeeId, CURRENT_YEAR);
  const pct = Math.min(100, (hours / ANNUAL_TRAINING_HOURS_REQUIRED) * 100);
  const met = hours >= ANNUAL_TRAINING_HOURS_REQUIRED;

  return (
    <div className="flex items-center gap-3 py-2 border-b last:border-b-0">
      <div className="w-32 min-w-32">
        <p className="text-xs font-medium text-gray-800 truncate">{employeeName}</p>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">{hours}h / {ANNUAL_TRAINING_HOURS_REQUIRED}h required</span>
          {met ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          )}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${met ? 'bg-emerald-500' : pct >= 50 ? 'bg-[#2196F3]' : 'bg-amber-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TrainingLog() {
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [filterEmployee, setFilterEmployee] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);

  function loadRecords() {
    setRecords(getTrainingRecords());
  }

  useEffect(() => {
    loadRecords();
  }, []);

  function handleAdd(data: Omit<TrainingRecord, 'id'>) {
    addTrainingRecord(data);
    loadRecords();
  }

  const filteredRecords = filterEmployee === 'all'
    ? records
    : records.filter(r => r.employee_id === filterEmployee);

  return (
    <div className="space-y-5">
      {/* Annual hours summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#C62828]" />
            {CURRENT_YEAR} Annual Training Hours
          </CardTitle>
          <p className="text-xs text-muted-foreground">MN state requirement: {ANNUAL_TRAINING_HOURS_REQUIRED} hours/year</p>
        </CardHeader>
        <CardContent className="pt-0">
          {STAFF.length === 0 ? (
            <p className="py-4 text-sm text-gray-400">No training records yet.</p>
          ) : (
            STAFF.map(s => (
              <HoursProgressBar key={s.id} employeeId={s.id} employeeName={s.name} />
            ))
          )}
        </CardContent>
      </Card>

      {/* Training records list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#C62828]" />
              Training Records
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setAddOpen(true)}
              className="bg-[#C62828] hover:bg-[#B71C1C] text-white gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Record
            </Button>
          </div>
          <div className="mt-2">
            <Select value={filterEmployee} onValueChange={setFilterEmployee}>
              <SelectTrigger className="h-8 text-xs w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {STAFF.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRecords.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No training records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-2.5">Employee</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5">Training</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5">Provider</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5">Date</th>
                    <th className="text-center text-xs font-semibold text-gray-600 px-3 py-2.5">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map(record => (
                    <tr key={record.id} className="border-b last:border-b-0 hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">
                        {record.employee_name}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700 max-w-48">
                        {record.training_name}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {record.provider}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(record.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Badge variant="secondary" className="text-xs font-semibold">
                          {record.hours}h
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddTrainingDialog
        open={addOpen}
        onAdd={handleAdd}
        onClose={() => setAddOpen(false)}
      />
    </div>
  );
}

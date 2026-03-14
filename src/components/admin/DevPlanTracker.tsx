'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Target, Plus, CheckCircle2, AlertTriangle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getDevGoals,
  addDevGoal,
  updateDevGoal,
  type DevGoal,
} from '@/lib/staff-development-storage';

const STAFF = [
  { id: 'emp-oz', name: 'Ophelia Zeogar' },
  { id: 'emp-cf', name: 'Christina Fraser' },
  { id: 'emp-ms', name: 'Maria Santos' },
  { id: 'emp-jr', name: 'James Robinson' },
  { id: 'emp-sk', name: 'Sarah Kim' },
  { id: 'emp-dc', name: 'David Chen' },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

function statusBadge(status: DevGoal['status']) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 border gap-1 text-xs">
          <Clock className="h-3 w-3" />
          Active
        </Badge>
      );
    case 'completed':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border gap-1 text-xs">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>
      );
    case 'overdue':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 border gap-1 text-xs">
          <AlertTriangle className="h-3 w-3" />
          Overdue
        </Badge>
      );
  }
}

// ─── Add Goal Dialog ──────────────────────────────────────────────────────────

interface AddGoalDialogProps {
  open: boolean;
  onAdd: () => void;
  onClose: () => void;
}

function AddGoalDialog({ open, onAdd, onClose }: AddGoalDialogProps) {
  const defaultTarget = new Date();
  defaultTarget.setMonth(defaultTarget.getMonth() + 3);

  const [employeeId, setEmployeeId] = useState('');
  const [goalText, setGoalText] = useState('');
  const [targetDate, setTargetDate] = useState(defaultTarget.toISOString().slice(0, 10));

  function handleSubmit() {
    if (!employeeId || !goalText.trim()) return;
    const staff = STAFF.find(s => s.id === employeeId);
    if (!staff) return;

    addDevGoal({
      employee_id: employeeId,
      employee_name: staff.name,
      goal_text: goalText.trim(),
      target_date: targetDate,
    });
    setEmployeeId('');
    setGoalText('');
    setTargetDate(defaultTarget.toISOString().slice(0, 10));
    onAdd();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Development Goal</DialogTitle>
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
            <label className="text-xs font-medium text-gray-700 block mb-1">Goal</label>
            <textarea
              value={goalText}
              onChange={e => setGoalText(e.target.value)}
              placeholder="Describe the development goal..."
              rows={3}
              className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828] resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!employeeId || !goalText.trim()}
              className="flex-1 bg-[#C62828] hover:bg-[#B71C1C] text-white"
            >
              Add Goal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────

interface GoalCardProps {
  goal: DevGoal;
  onUpdate: () => void;
}

function GoalCard({ goal, onUpdate }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(goal.progress_notes || '');

  function handleStatusChange(newStatus: DevGoal['status']) {
    updateDevGoal(goal.id, { status: newStatus });
    onUpdate();
  }

  function handleSaveNotes() {
    updateDevGoal(goal.id, { progress_notes: notes });
    setEditingNotes(false);
    onUpdate();
  }

  const targetDate = new Date(goal.target_date + 'T12:00:00');
  const targetLabel = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`rounded-lg border p-3.5 ${
      goal.status === 'overdue' ? 'bg-red-50 border-red-200' :
      goal.status === 'completed' ? 'bg-emerald-50/50 border-emerald-100' :
      'bg-white border-gray-100'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${goal.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {goal.goal_text}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-gray-500">Target: {targetLabel}</span>
            {goal.progress_notes && (
              <span className="text-xs text-blue-500 font-medium">Has notes</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {statusBadge(goal.status)}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          {/* Progress notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-600">Progress Notes</label>
              {!editingNotes && (
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setEditingNotes(true)}>
                  Edit
                </Button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-1.5">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add progress notes..."
                  className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828] resize-none"
                />
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => { setEditingNotes(false); setNotes(goal.progress_notes || ''); }}>Cancel</Button>
                  <Button size="sm" className="text-xs h-7 bg-[#C62828] hover:bg-[#B71C1C] text-white" onClick={handleSaveNotes}>Save</Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">
                {goal.progress_notes || 'No notes yet.'}
              </p>
            )}
          </div>

          {/* Status actions */}
          {goal.status !== 'completed' && (
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => handleStatusChange('completed')}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Mark Complete
              </Button>
              {goal.status === 'overdue' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => handleStatusChange('active')}
                >
                  Reactivate
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DevPlanTracker() {
  const [goals, setGoals] = useState<DevGoal[]>([]);
  const [filterEmployee, setFilterEmployee] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);

  function loadGoals() {
    setGoals(getDevGoals());
  }

  useEffect(() => {
    loadGoals();
  }, []);

  let displayed = goals;
  if (filterEmployee !== 'all') displayed = displayed.filter(g => g.employee_id === filterEmployee);
  if (filterStatus !== 'all') displayed = displayed.filter(g => g.status === filterStatus);

  const activeCount = goals.filter(g => g.status === 'active').length;
  const overdueCount = goals.filter(g => g.status === 'overdue').length;
  const completedCount = goals.filter(g => g.status === 'completed').length;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{activeCount}</p>
            <p className="text-xs text-blue-600 font-medium mt-0.5">Active Goals</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-red-700">{overdueCount}</p>
            <p className="text-xs text-red-600 font-medium mt-0.5">Overdue</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-emerald-700">{completedCount}</p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Add button */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Select value={filterEmployee} onValueChange={setFilterEmployee}>
            <SelectTrigger className="h-8 text-xs w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {STAFF.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 text-xs w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          onClick={() => setAddOpen(true)}
          className="bg-[#C62828] hover:bg-[#B71C1C] text-white gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Goal
        </Button>
      </div>

      {/* Goals grouped by employee */}
      {filterEmployee === 'all' ? (
        <div className="space-y-5">
          {STAFF.map(staff => {
            const staffGoals = displayed.filter(g => g.employee_id === staff.id);
            if (staffGoals.length === 0) return null;
            return (
              <div key={staff.id}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#C62828]" />
                  {staff.name}
                  <span className="text-xs text-gray-400 font-normal">({staffGoals.length} goal{staffGoals.length !== 1 ? 's' : ''})</span>
                </h3>
                <div className="space-y-2">
                  {staffGoals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} onUpdate={loadGoals} />
                  ))}
                </div>
              </div>
            );
          })}
          {displayed.length === 0 && (
            <div className="text-center py-8">
              <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No goals match your filters.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No goals found.</p>
            </div>
          ) : (
            displayed.map(goal => (
              <GoalCard key={goal.id} goal={goal} onUpdate={loadGoals} />
            ))
          )}
        </div>
      )}

      <AddGoalDialog
        open={addOpen}
        onAdd={loadGoals}
        onClose={() => setAddOpen(false)}
      />
    </div>
  );
}

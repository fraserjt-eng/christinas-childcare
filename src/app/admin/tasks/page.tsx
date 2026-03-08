'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Task,
  TaskStatus,
  TaskPriority,
  DriftAlert,
  DEFAULT_TIME_BLOCKS,
  DEFAULT_CATEGORIES,
  generateTaskId,
} from '@/types/tasks';
import {
  Plus,
  X,
  ChevronDown,
  AlertTriangle,
  Moon,
  Users,
  BarChart3,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  Ban,
  Archive,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Edit3,
  Trash2,
  Save,
  Filter,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────
const STORAGE_KEY = 'christinas_tasks';
const DRIFT_STORAGE_KEY = 'christinas_drift_alerts';
const CHRISTINA_RED = '#C62828';

const STAFF_MEMBERS = [
  'Christina Fraser',
  'Sarah Johnson',
  'Maria Garcia',
  'James Wilson',
  'Emily Chen',
  'David Kim',
  'Ashley Brown',
  'Michael Davis',
];

const STATUS_COLUMNS: { key: TaskStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'backlog', label: 'Backlog', icon: <Archive className="h-4 w-4" />, color: '#6B7280' },
  { key: 'today', label: 'Today', icon: <Circle className="h-4 w-4" />, color: '#3B82F6' },
  { key: 'in_progress', label: 'In Progress', icon: <Loader2 className="h-4 w-4" />, color: '#F59E0B' },
  { key: 'blocked', label: 'Blocked', icon: <Ban className="h-4 w-4" />, color: '#EF4444' },
  { key: 'done', label: 'Done', icon: <CheckCircle2 className="h-4 w-4" />, color: '#10B981' },
];

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; icon: React.ReactNode }> = {
  urgent: { label: 'Urgent', color: '#DC2626', icon: <Flame className="h-3 w-3" /> },
  high: { label: 'High', color: '#F97316', icon: <ArrowUp className="h-3 w-3" /> },
  normal: { label: 'Normal', color: '#6B7280', icon: <Minus className="h-3 w-3" /> },
  low: { label: 'Low', color: '#9CA3AF', icon: <ArrowDown className="h-3 w-3" /> },
};

const RECURRENCE_OPTIONS = [
  { value: 'once', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const TIME_BLOCKS_WITH_IDS = DEFAULT_TIME_BLOCKS.map((tb, i) => ({ ...tb, id: `tb_${i}` }));
const CATEGORIES_WITH_IDS = DEFAULT_CATEGORIES.map((cat, i) => ({ ...cat, id: `cat_${i}` }));

// ─── Seed Data ──────────────────────────────────────────────────────
function createSeedTasks(): Task[] {
  const now = new Date().toISOString();
  return [
    {
      id: generateTaskId(),
      title: 'Submit CACFP Meal Counts',
      done_standard: 'All meal counts for breakfast, lunch, and PM snack entered in KidKare by 4:00 PM. Each count matches sign-in sheet totals. Zero discrepancies between headcount and recorded count.',
      category_id: 'cat_5',
      category_name: 'Food Program',
      time_block_id: 'tb_4',
      time_block_name: 'PM Activities',
      assigned_to: 'Sarah Johnson',
      priority: 'high',
      status: 'today',
      recurrence: 'daily',
      is_nap_time_task: false,
      estimated_minutes: 20,
      drift_count: 3,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateTaskId(),
      title: 'Update Parent Communication Board',
      done_standard: 'Daily schedule, meal menu, and activity highlights posted on hallway board by 8:00 AM. All information matches current date. No outdated flyers remaining.',
      category_id: 'cat_2',
      category_name: 'Communication',
      time_block_id: 'tb_0',
      time_block_name: 'Morning Arrival',
      assigned_to: 'Emily Chen',
      priority: 'normal',
      status: 'in_progress',
      recurrence: 'daily',
      is_nap_time_task: false,
      estimated_minutes: 15,
      drift_count: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateTaskId(),
      title: 'Sanitize Learning Centers',
      done_standard: 'All toy bins emptied and sprayed with approved sanitizer. Surfaces wiped and air-dried. Play mats cleaned on both sides. Dramatic play costumes in laundry bin if visibly soiled.',
      category_id: 'cat_0',
      category_name: 'Care Duties',
      time_block_id: 'tb_3',
      time_block_name: 'Nap Time',
      assigned_to: 'Maria Garcia',
      priority: 'high',
      status: 'today',
      recurrence: 'daily',
      is_nap_time_task: true,
      estimated_minutes: 35,
      drift_count: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateTaskId(),
      title: 'Prepare Lesson Materials for Tomorrow',
      done_standard: 'All art supplies counted and set out. Worksheets printed and organized by age group. Sensory bin refreshed with new materials. Teacher notes reviewed and adjusted.',
      category_id: 'cat_4',
      category_name: 'Curriculum/Teaching',
      time_block_id: 'tb_3',
      time_block_name: 'Nap Time',
      assigned_to: 'James Wilson',
      priority: 'normal',
      status: 'backlog',
      recurrence: 'daily',
      is_nap_time_task: true,
      estimated_minutes: 25,
      drift_count: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateTaskId(),
      title: 'Fire Drill Documentation',
      done_standard: 'Monthly fire drill completed and documented on state form. Time recorded. Headcount verified against attendance. Any issues noted with action plan. Form filed in compliance binder.',
      category_id: 'cat_3',
      category_name: 'Compliance/Licensing',
      time_block_id: 'tb_1',
      time_block_name: 'AM Activities',
      assigned_to: 'Christina Fraser',
      priority: 'urgent',
      status: 'today',
      recurrence: 'monthly',
      is_nap_time_task: false,
      estimated_minutes: 30,
      drift_count: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateTaskId(),
      title: 'Restock Bathroom Supplies',
      done_standard: 'Paper towels, soap, and toilet paper checked and restocked in all 3 bathrooms. Glove box refilled at each diaper station. Supply count logged on inventory sheet.',
      category_id: 'cat_6',
      category_name: 'Facilities/Supplies',
      time_block_id: 'tb_5',
      time_block_name: 'Closing',
      assigned_to: 'David Kim',
      priority: 'normal',
      status: 'done',
      recurrence: 'daily',
      is_nap_time_task: false,
      estimated_minutes: 15,
      drift_count: 0,
      completed_at: now,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateTaskId(),
      title: 'Process New Enrollment Paperwork',
      done_standard: 'All required forms complete: emergency contacts, medical info, immunization records, custody documents, photo release. Copies filed in child folder and digital backup created. Parent welcome packet assembled.',
      category_id: 'cat_1',
      category_name: 'Admin/Paperwork',
      time_block_id: 'tb_3',
      time_block_name: 'Nap Time',
      assigned_to: 'Christina Fraser',
      priority: 'high',
      status: 'in_progress',
      recurrence: 'once',
      is_nap_time_task: true,
      estimated_minutes: 45,
      drift_count: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateTaskId(),
      title: 'Outdoor Playground Safety Check',
      done_standard: 'All equipment inspected for loose bolts, sharp edges, and structural damage. Ground cover depth measured at fall zones (minimum 6 inches). Gate latches tested. Any hazards flagged with orange cone and reported immediately.',
      category_id: 'cat_3',
      category_name: 'Compliance/Licensing',
      time_block_id: 'tb_0',
      time_block_name: 'Morning Arrival',
      assigned_to: 'Ashley Brown',
      priority: 'high',
      status: 'backlog',
      recurrence: 'weekly',
      is_nap_time_task: false,
      estimated_minutes: 20,
      drift_count: 2,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateTaskId(),
      title: 'Send Weekly Parent Newsletter',
      done_standard: 'Newsletter drafted with upcoming events, curriculum highlights, and reminders. Photos included with parent permission. Reviewed by director. Sent via email and posted to parent portal by Friday 3:00 PM.',
      category_id: 'cat_2',
      category_name: 'Communication',
      time_block_id: 'tb_3',
      time_block_name: 'Nap Time',
      assigned_to: 'Emily Chen',
      priority: 'normal',
      status: 'blocked',
      recurrence: 'weekly',
      is_nap_time_task: true,
      estimated_minutes: 40,
      drift_count: 4,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateTaskId(),
      title: 'Prepare Afternoon Snack',
      done_standard: 'Snack prepared following posted menu. Allergen check completed against classroom allergy list. Portions meet CACFP guidelines. Serving area sanitized before and after. Leftover food stored or discarded per policy.',
      category_id: 'cat_5',
      category_name: 'Food Program',
      time_block_id: 'tb_4',
      time_block_name: 'PM Activities',
      assigned_to: 'Michael Davis',
      priority: 'normal',
      status: 'today',
      recurrence: 'daily',
      is_nap_time_task: false,
      estimated_minutes: 20,
      drift_count: 0,
      created_at: now,
      updated_at: now,
    },
  ];
}

function createSeedDriftAlerts(): DriftAlert[] {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return [
    {
      id: 'drift_1',
      task_id: 'seed',
      task_title: 'Submit CACFP Meal Counts',
      pattern_description: 'Meal counts entered after 4:00 PM deadline on 3 of the last 7 days. Tuesday and Thursday counts had discrepancies with sign-in sheets.',
      miss_count: 3,
      first_miss_date: weekAgo.toISOString(),
      latest_miss_date: now.toISOString(),
      status: 'active',
      created_at: now.toISOString(),
    },
    {
      id: 'drift_2',
      task_id: 'seed',
      task_title: 'Send Weekly Parent Newsletter',
      pattern_description: 'Newsletter sent after Friday 3:00 PM deadline for 4 consecutive weeks. Last two weeks had no photos included despite permissions being on file.',
      miss_count: 4,
      first_miss_date: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      latest_miss_date: now.toISOString(),
      status: 'active',
      created_at: now.toISOString(),
    },
    {
      id: 'drift_3',
      task_id: 'seed',
      task_title: 'Outdoor Playground Safety Check',
      pattern_description: 'Safety check skipped entirely on 2 of the last 4 weeks. When completed, ground cover depth was not measured.',
      miss_count: 2,
      first_miss_date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      latest_miss_date: now.toISOString(),
      status: 'active',
      created_at: now.toISOString(),
    },
  ];
}

// ─── Helper Components ──────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-sm font-medium"
      style={{ backgroundColor: `${config.color}15`, color: config.color }}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function CategoryDot({ categoryId }: { categoryId?: string }) {
  const cat = CATEGORIES_WITH_IDS.find((c) => c.id === categoryId);
  if (!cat) return null;
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ backgroundColor: cat.color }}
      title={cat.name}
    />
  );
}

function TimeBlockBadge({ timeBlockId }: { timeBlockId?: string }) {
  const tb = TIME_BLOCKS_WITH_IDS.find((t) => t.id === timeBlockId);
  if (!tb) return null;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
      <Clock className="h-3 w-3" />
      {tb.name}
    </span>
  );
}

// ─── Task Card ──────────────────────────────────────────────────────

function TaskCard({
  task,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow group">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <CategoryDot categoryId={task.category_id} />
          <h4 className="text-base font-semibold text-gray-900 truncate">{task.title}</h4>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Done standard (truncated) */}
      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{task.done_standard}</p>

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <TimeBlockBadge timeBlockId={task.time_block_id} />
        {task.is_nap_time_task && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-indigo-50 text-indigo-600">
            <Moon className="h-3 w-3" />
            Nap Time
          </span>
        )}
        {task.recurrence && task.recurrence !== 'once' && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-purple-50 text-purple-600">
            <RefreshCw className="h-3 w-3" />
            {task.recurrence}
          </span>
        )}
        {task.estimated_minutes && (
          <span className="text-xs text-gray-400">{task.estimated_minutes}m</span>
        )}
      </div>

      {/* Assigned + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {task.assigned_to ? (
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                style={{ backgroundColor: CHRISTINA_RED }}
              >
                {task.assigned_to.split(' ').map((n) => n[0]).join('')}
              </span>
              <span className="truncate max-w-[100px]">{task.assigned_to.split(' ')[0]}</span>
            </span>
          ) : (
            <span className="text-xs text-gray-400 italic">Unassigned</span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              title="Change status"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {showStatusMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-50 py-1 w-36">
                  {STATUS_COLUMNS.map((col) => (
                    <button
                      key={col.key}
                      onClick={() => {
                        onStatusChange(task.id, col.key);
                        setShowStatusMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2 ${
                        task.status === col.key ? 'font-semibold' : ''
                      }`}
                      style={{ color: task.status === col.key ? col.color : undefined }}
                    >
                      {col.icon}
                      {col.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            title="Edit"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Drift indicator */}
      {task.drift_count > 0 && (
        <div className="mt-2 pt-2 border-t border-dashed border-orange-200">
          <span className="inline-flex items-center gap-1 text-xs text-orange-600">
            <AlertTriangle className="h-3 w-3" />
            {task.drift_count} miss{task.drift_count !== 1 ? 'es' : ''} recorded
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Task Form ──────────────────────────────────────────────────────

interface TaskFormData {
  title: string;
  done_standard: string;
  category_id: string;
  time_block_id: string;
  assigned_to: string;
  priority: TaskPriority;
  recurrence: 'daily' | 'weekly' | 'monthly' | 'once';
  is_nap_time_task: boolean;
  estimated_minutes: string;
  notes: string;
}

const EMPTY_FORM: TaskFormData = {
  title: '',
  done_standard: '',
  category_id: '',
  time_block_id: '',
  assigned_to: '',
  priority: 'normal',
  recurrence: 'once',
  is_nap_time_task: false,
  estimated_minutes: '',
  notes: '',
};

function TaskFormModal({
  editingTask,
  onSave,
  onClose,
}: {
  editingTask: Task | null;
  onSave: (data: TaskFormData, existingId?: string) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<TaskFormData>(() => {
    if (editingTask) {
      return {
        title: editingTask.title,
        done_standard: editingTask.done_standard,
        category_id: editingTask.category_id || '',
        time_block_id: editingTask.time_block_id || '',
        assigned_to: editingTask.assigned_to || '',
        priority: editingTask.priority,
        recurrence: editingTask.recurrence || 'once',
        is_nap_time_task: editingTask.is_nap_time_task,
        estimated_minutes: editingTask.estimated_minutes?.toString() || '',
        notes: editingTask.notes || '',
      };
    }
    return EMPTY_FORM;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.done_standard.trim()) e.done_standard = 'Done standard is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form, editingTask?.id);
  }

  function updateField<K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  const labelClass = 'block text-base font-medium text-gray-700 mb-1';
  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent';
  const focusRing = `focus:ring-[${CHRISTINA_RED}]/30`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-lg font-bold text-gray-900">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className={labelClass}>Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className={`${inputClass} ${focusRing} ${errors.title ? 'border-red-400' : ''}`}
              placeholder="e.g., Submit CACFP Meal Counts"
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Done Standard */}
          <div>
            <label className={labelClass}>Done Standard *</label>
            <p className="text-sm text-gray-400 mb-1">What does done look like? Be specific and observable.</p>
            <textarea
              value={form.done_standard}
              onChange={(e) => updateField('done_standard', e.target.value)}
              rows={3}
              className={`${inputClass} ${focusRing} ${errors.done_standard ? 'border-red-400' : ''}`}
              placeholder="All meal counts entered in KidKare by 4:00 PM. Each count matches sign-in sheet totals..."
            />
            {errors.done_standard && <p className="text-sm text-red-500 mt-1">{errors.done_standard}</p>}
          </div>

          {/* Category + Time Block row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={form.category_id}
                onChange={(e) => updateField('category_id', e.target.value)}
                className={`${inputClass} ${focusRing}`}
              >
                <option value="">Select category</option>
                {CATEGORIES_WITH_IDS.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Time Block</label>
              <select
                value={form.time_block_id}
                onChange={(e) => updateField('time_block_id', e.target.value)}
                className={`${inputClass} ${focusRing}`}
              >
                <option value="">Select time block</option>
                {TIME_BLOCKS_WITH_IDS.map((tb) => (
                  <option key={tb.id} value={tb.id}>{tb.name} ({tb.start_time}-{tb.end_time})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assign To */}
          <div>
            <label className={labelClass}>Assign To</label>
            <select
              value={form.assigned_to}
              onChange={(e) => updateField('assigned_to', e.target.value)}
              className={`${inputClass} ${focusRing}`}
            >
              <option value="">Unassigned</option>
              {STAFF_MEMBERS.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Priority + Recurrence row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => updateField('priority', e.target.value as TaskPriority)}
                className={`${inputClass} ${focusRing}`}
              >
                {(['low', 'normal', 'high', 'urgent'] as TaskPriority[]).map((p) => (
                  <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Recurrence</label>
              <select
                value={form.recurrence}
                onChange={(e) => updateField('recurrence', e.target.value as TaskFormData['recurrence'])}
                className={`${inputClass} ${focusRing}`}
              >
                {RECURRENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Estimated Minutes + Nap Time row */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className={labelClass}>Estimated Minutes</label>
              <input
                type="number"
                min="0"
                value={form.estimated_minutes}
                onChange={(e) => updateField('estimated_minutes', e.target.value)}
                className={`${inputClass} ${focusRing}`}
                placeholder="e.g., 30"
              />
            </div>
            <div className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                id="nap_time"
                checked={form.is_nap_time_task}
                onChange={(e) => updateField('is_nap_time_task', e.target.checked)}
                className="h-6 w-6 rounded border-gray-300"
                style={{ accentColor: CHRISTINA_RED }}
              />
              <label htmlFor="nap_time" className="text-base text-gray-700 flex items-center gap-1">
                <Moon className="h-3.5 w-3.5 text-indigo-500" />
                Nap Time Task
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={2}
              className={`${inputClass} ${focusRing}`}
              placeholder="Additional context or instructions..."
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 min-h-[44px] text-sm font-medium text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 min-h-[44px] text-sm font-semibold text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
              style={{ backgroundColor: CHRISTINA_RED }}
            >
              <Save className="h-4 w-4" />
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delegation Dashboard ───────────────────────────────────────────

function DelegationDashboard({ tasks }: { tasks: Task[] }) {
  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const totalActive = activeTasks.length;

  const staffCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STAFF_MEMBERS.forEach((name) => (counts[name] = 0));
    activeTasks.forEach((t) => {
      if (t.assigned_to && counts[t.assigned_to] !== undefined) {
        counts[t.assigned_to]++;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [activeTasks]);

  const unassigned = activeTasks.filter((t) => !t.assigned_to);
  const maxCount = Math.max(...staffCounts.map(([, c]) => c), 1);
  const equityThreshold = totalActive > 0 ? totalActive * 0.3 : Infinity;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5" style={{ color: CHRISTINA_RED }} />
        <h3 className="font-bold text-gray-900">Delegation Dashboard</h3>
        <span className="text-sm text-gray-400 ml-auto">{totalActive} active tasks</span>
      </div>

      {/* Bar chart */}
      <div className="space-y-2 mb-4">
        {staffCounts.map(([name, count]) => {
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const overloaded = count > equityThreshold;
          return (
            <div key={name} className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-24 truncate">{name.split(' ')[0]}</span>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: overloaded ? '#EF4444' : CHRISTINA_RED,
                    minWidth: count > 0 ? '12px' : '0',
                  }}
                />
              </div>
              <span className={`text-xs font-semibold w-6 text-right ${overloaded ? 'text-red-600' : 'text-gray-600'}`}>
                {count}
              </span>
              {overloaded && (
                <span className="text-xs text-red-500 font-medium flex items-center gap-0.5" title="Over 30% of total tasks">
                  <AlertTriangle className="h-3 w-3" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Equity alerts */}
      {staffCounts.some(([, count]) => count > equityThreshold) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Equity Alert
          </p>
          <p className="text-xs text-red-600 mt-1">
            One or more staff members carry more than 30% of all active tasks. Consider redistributing to prevent burnout and develop other team members.
          </p>
        </div>
      )}

      {/* Unassigned tasks */}
      {unassigned.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">Unassigned Tasks ({unassigned.length})</p>
          <div className="space-y-1">
            {unassigned.map((t) => (
              <div key={t.id} className="flex items-center gap-2 text-xs text-gray-600">
                <CategoryDot categoryId={t.category_id} />
                <span className="truncate">{t.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Drift Alerts Section ───────────────────────────────────────────

function DriftAlertsSection({
  alerts,
  onStartRecovery,
}: {
  alerts: DriftAlert[];
  onStartRecovery: (alertId: string) => void;
}) {
  const activeAlerts = alerts.filter((a) => a.status === 'active');

  if (activeAlerts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-green-500" />
          <h3 className="font-bold text-gray-900">Drift Alerts</h3>
        </div>
        <p className="text-sm text-gray-500">No active drift alerts. All tasks are meeting their standards.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <h3 className="font-bold text-gray-900">Drift Alerts</h3>
        <span
          className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: '#EF4444' }}
        >
          {activeAlerts.length}
        </span>
      </div>

      <div className="space-y-4">
        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className="border border-orange-200 bg-orange-50/50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-900">{alert.task_title}</h4>
                <p className="text-sm text-gray-600 mt-1">{alert.pattern_description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm font-medium text-orange-700">
                    {alert.miss_count} miss{alert.miss_count !== 1 ? 'es' : ''}
                  </span>
                  <span className="text-sm text-gray-400">
                    Since {new Date(alert.first_miss_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onStartRecovery(alert.id)}
                className="flex-shrink-0 px-3 py-1.5 min-h-[44px] text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
                style={{ backgroundColor: CHRISTINA_RED }}
              >
                <RefreshCw className="h-3 w-3" />
                Start Recovery
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Nap Time Optimizer ─────────────────────────────────────────────

function NapTimeOptimizer({ tasks }: { tasks: Task[] }) {
  const NAP_MINUTES = 150;

  const napTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.is_nap_time_task && t.status !== 'done')
        .sort((a, b) => {
          const priorityOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }),
    [tasks]
  );

  const totalMinutes = napTasks.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);
  const usagePct = Math.min((totalMinutes / NAP_MINUTES) * 100, 100);
  const overCapacity = totalMinutes > NAP_MINUTES;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Moon className="h-5 w-5 text-indigo-500" />
        <h3 className="font-bold text-gray-900">Nap Time Optimizer</h3>
      </div>

      {/* Capacity bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500">Capacity Usage</span>
          <span className={`font-semibold ${overCapacity ? 'text-red-600' : 'text-gray-700'}`}>
            {totalMinutes}m / {NAP_MINUTES}m
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${usagePct}%`,
              backgroundColor: overCapacity ? '#EF4444' : usagePct > 80 ? '#F59E0B' : '#6366F1',
            }}
          />
        </div>
        {overCapacity && (
          <p className="text-xs text-red-500 mt-1 font-medium">
            Over capacity by {totalMinutes - NAP_MINUTES} minutes. Consider moving lower-priority tasks to another time block.
          </p>
        )}
      </div>

      {/* Task list */}
      {napTasks.length === 0 ? (
        <p className="text-sm text-gray-400">No nap time tasks scheduled.</p>
      ) : (
        <div className="space-y-2">
          {napTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2 text-xs">
              <PriorityBadge priority={task.priority} />
              <span className="text-gray-700 truncate flex-1">{task.title}</span>
              <span className="text-gray-400 flex-shrink-0">{task.estimated_minutes || '?'}m</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────

export default function TaskBoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [driftAlerts, setDriftAlerts] = useState<DriftAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'board' | 'delegation'>('board');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStaff, setFilterStaff] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTasks(JSON.parse(stored));
      } else {
        const seed = createSeedTasks();
        setTasks(seed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      }

      const storedDrift = localStorage.getItem(DRIFT_STORAGE_KEY);
      if (storedDrift) {
        setDriftAlerts(JSON.parse(storedDrift));
      } else {
        const seedDrift = createSeedDriftAlerts();
        setDriftAlerts(seedDrift);
        localStorage.setItem(DRIFT_STORAGE_KEY, JSON.stringify(seedDrift));
      }
    } catch {
      const seed = createSeedTasks();
      setTasks(seed);
      setDriftAlerts(createSeedDriftAlerts());
    }
    setIsLoaded(true);
  }, []);

  // Persist tasks
  const persistTasks = useCallback((updated: Task[]) => {
    setTasks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  // Persist drift alerts
  const persistDrift = useCallback((updated: DriftAlert[]) => {
    setDriftAlerts(updated);
    localStorage.setItem(DRIFT_STORAGE_KEY, JSON.stringify(updated));
  }, []);

  // Task operations
  function handleSaveTask(data: TaskFormData, existingId?: string) {
    const now = new Date().toISOString();
    const cat = CATEGORIES_WITH_IDS.find((c) => c.id === data.category_id);
    const tb = TIME_BLOCKS_WITH_IDS.find((t) => t.id === data.time_block_id);

    if (existingId) {
      const updated = tasks.map((t) =>
        t.id === existingId
          ? {
              ...t,
              title: data.title,
              done_standard: data.done_standard,
              category_id: data.category_id || undefined,
              category_name: cat?.name,
              time_block_id: data.time_block_id || undefined,
              time_block_name: tb?.name,
              assigned_to: data.assigned_to || undefined,
              priority: data.priority,
              recurrence: data.recurrence,
              is_nap_time_task: data.is_nap_time_task,
              estimated_minutes: data.estimated_minutes ? parseInt(data.estimated_minutes) : undefined,
              notes: data.notes || undefined,
              updated_at: now,
            }
          : t
      );
      persistTasks(updated);
    } else {
      const newTask: Task = {
        id: generateTaskId(),
        title: data.title,
        done_standard: data.done_standard,
        category_id: data.category_id || undefined,
        category_name: cat?.name,
        time_block_id: data.time_block_id || undefined,
        time_block_name: tb?.name,
        assigned_to: data.assigned_to || undefined,
        priority: data.priority,
        status: 'backlog',
        recurrence: data.recurrence,
        is_nap_time_task: data.is_nap_time_task,
        estimated_minutes: data.estimated_minutes ? parseInt(data.estimated_minutes) : undefined,
        notes: data.notes || undefined,
        drift_count: 0,
        created_at: now,
        updated_at: now,
      };
      persistTasks([...tasks, newTask]);
    }
    setShowForm(false);
    setEditingTask(null);
  }

  function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    const now = new Date().toISOString();
    const updated = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: newStatus,
            completed_at: newStatus === 'done' ? now : t.completed_at,
            updated_at: now,
          }
        : t
    );
    persistTasks(updated);
  }

  function handleDeleteTask(taskId: string) {
    persistTasks(tasks.filter((t) => t.id !== taskId));
  }

  function handleEditTask(task: Task) {
    setEditingTask(task);
    setShowForm(true);
  }

  function handleStartRecovery(alertId: string) {
    const updated = driftAlerts.map((a) =>
      a.id === alertId ? { ...a, status: 'recovery_started' as const } : a
    );
    persistDrift(updated);
  }

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterStaff && t.assigned_to !== filterStaff) return false;
      if (filterCategory && t.category_id !== filterCategory) return false;
      return true;
    });
  }, [tasks, filterStaff, filterCategory]);

  // Column counts
  const columnCounts = useMemo(() => {
    const counts: Record<TaskStatus, number> = { backlog: 0, today: 0, in_progress: 0, blocked: 0, done: 0 };
    filteredTasks.forEach((t) => counts[t.status]++);
    return counts;
  }, [filteredTasks]);

  // Stats
  const totalTasks = tasks.length;
  const completedToday = tasks.filter((t) => {
    if (t.status !== 'done' || !t.completed_at) return false;
    const completed = new Date(t.completed_at);
    const today = new Date();
    return completed.toDateString() === today.toDateString();
  }).length;
  const blockedCount = tasks.filter((t) => t.status === 'blocked').length;
  const activeAlertCount = driftAlerts.filter((a) => a.status === 'active').length;

  if (!isLoaded) {
    return (
      <DashboardLayout isAdmin>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isAdmin>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage tasks with clear done standards and accountability tracking
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTask(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-semibold text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: CHRISTINA_RED }}
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-lg border p-3">
            <p className="text-sm text-gray-500">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
          </div>
          <div className="bg-white rounded-lg border p-3">
            <p className="text-sm text-gray-500">Completed Today</p>
            <p className="text-2xl font-bold text-green-600">{completedToday}</p>
          </div>
          <div className="bg-white rounded-lg border p-3">
            <p className="text-sm text-gray-500">Blocked</p>
            <p className="text-2xl font-bold text-red-600">{blockedCount}</p>
          </div>
          <div className="bg-white rounded-lg border p-3">
            <p className="text-sm text-gray-500">Drift Alerts</p>
            <p className="text-2xl font-bold text-orange-600">{activeAlertCount}</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-4 border-b">
        <button
          onClick={() => setActiveTab('board')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'board'
              ? 'border-current text-[#C62828]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Kanban Board
          </span>
        </button>
        <button
          onClick={() => setActiveTab('delegation')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'delegation'
              ? 'border-current text-[#C62828]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Delegation
          </span>
        </button>
      </div>

      {/* Board View */}
      {activeTab === 'board' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Filter className="h-3.5 w-3.5" />
              Filters:
            </div>
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="text-sm px-2 py-1.5 min-h-[44px] border border-gray-200 rounded-lg bg-white text-gray-700"
            >
              <option value="">All Staff</option>
              {STAFF_MEMBERS.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-sm px-2 py-1.5 min-h-[44px] border border-gray-200 rounded-lg bg-white text-gray-700"
            >
              <option value="">All Categories</option>
              {CATEGORIES_WITH_IDS.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {(filterStaff || filterCategory) && (
              <button
                onClick={() => {
                  setFilterStaff('');
                  setFilterCategory('');
                }}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Kanban columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {STATUS_COLUMNS.map((col) => {
              const colTasks = filteredTasks
                .filter((t) => t.status === col.key)
                .sort((a, b) => {
                  const pOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
                  return pOrder[a.priority] - pOrder[b.priority];
                });
              return (
                <div key={col.key} className="bg-gray-50 rounded-xl p-3 min-h-[200px]">
                  {/* Column header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span style={{ color: col.color }}>{col.icon}</span>
                    <h3 className="text-base font-semibold text-gray-700">{col.label}</h3>
                    <span
                      className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: col.color }}
                    >
                      {columnCounts[col.key]}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2">
                    {colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEditTask}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="text-center py-8 text-xs text-gray-400">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom panels: Drift Alerts + Nap Time Optimizer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DriftAlertsSection alerts={driftAlerts} onStartRecovery={handleStartRecovery} />
            <NapTimeOptimizer tasks={tasks} />
          </div>
        </>
      )}

      {/* Delegation View */}
      {activeTab === 'delegation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DelegationDashboard tasks={tasks} />
          <NapTimeOptimizer tasks={tasks} />
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <TaskFormModal
          editingTask={editingTask}
          onSave={handleSaveTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}

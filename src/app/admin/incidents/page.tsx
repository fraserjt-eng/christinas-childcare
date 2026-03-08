'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Plus,
  ArrowLeft,
  X,
  BookOpen,
  Filter,
  Clock,
  MapPin,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import {
  Incident,
  INCIDENT_TYPES,
  SEVERITY_LEVELS,
  generateIncidentId,
  generateIncidentNumber,
} from '@/types/incidents';

// ─── Helpers ────────────────────────────────────────────────────────

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getTypeLabel(type: Incident['type']): string {
  const found = INCIDENT_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

function getSeverityColor(severity: Incident['severity']): string {
  switch (severity) {
    case 'minor':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'moderate':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'serious':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'critical':
      return 'bg-red-200 text-red-950 border-red-500';
  }
}

function getStatusColor(status: Incident['status']): string {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800';
    case 'investigating':
      return 'bg-yellow-100 text-yellow-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'closed':
      return 'bg-gray-100 text-gray-600';
  }
}

const STATUS_FLOW: Incident['status'][] = ['open', 'investigating', 'resolved', 'closed'];

function nextStatus(current: Incident['status']): Incident['status'] | null {
  const idx = STATUS_FLOW.indexOf(current);
  return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
}

// ─── Seed Data ──────────────────────────────────────────────────────

const SEED_INCIDENTS: Incident[] = [
  {
    id: 'inc_seed_1',
    incident_number: 'INC-2026-0001',
    date: '2026-03-03',
    time: '10:15',
    location: 'Outdoor Playground',
    type: 'injury',
    severity: 'minor',
    description: 'Child tripped on uneven pavement near the swing set and scraped their knee. The area was damp from morning dew. Wound was small, no bleeding beyond initial scrape.',
    children_involved: [{ name: 'Maya Thompson', age: '4', classroom: 'Sunflowers' }],
    staff_involved: [{ name: 'Sarah Johnson', role_in_incident: 'Supervising teacher on playground duty' }],
    witnesses: ['Lisa Park (aide)'],
    immediate_action: 'Cleaned the scrape with soap and water, applied antibiotic ointment and a bandage. Child returned to play after 5 minutes and showed no distress.',
    parent_notified: true,
    parent_notified_at: '2026-03-03T10:30:00Z',
    parent_notified_by: 'Sarah Johnson',
    licensing_reportable: false,
    follow_up_required: false,
    status: 'closed',
    reported_by: 'emp_sarah',
    reported_by_name: 'Sarah Johnson',
    reviewed_by: 'Christina',
    reviewed_at: '2026-03-03T14:00:00Z',
    resolution: 'Minor scrape treated on site. Pavement area flagged for maintenance inspection.',
    created_at: '2026-03-03T10:20:00Z',
    updated_at: '2026-03-03T14:00:00Z',
  },
  {
    id: 'inc_seed_2',
    incident_number: 'INC-2026-0002',
    date: '2026-03-05',
    time: '13:45',
    location: 'Butterfly Room',
    type: 'behavioral',
    severity: 'moderate',
    description: 'Two children got into a physical altercation during free play. One child bit the other on the forearm. The bite did not break skin but left a visible mark.',
    children_involved: [
      { name: 'Jayden Miller', age: '3', classroom: 'Butterflies' },
      { name: 'Sophia Chen', age: '3', classroom: 'Butterflies' },
    ],
    staff_involved: [
      { name: 'Maria Rodriguez', role_in_incident: 'Lead teacher, intervened and separated children' },
      { name: 'Tanya Brooks', role_in_incident: 'Aide, applied ice to affected area' },
    ],
    witnesses: [],
    immediate_action: 'Children were separated immediately. Ice applied to the bite area. Both children were calmed and redirected to different activities. Biting child was talked to about using words.',
    parent_notified: true,
    parent_notified_at: '2026-03-05T14:00:00Z',
    parent_notified_by: 'Maria Rodriguez',
    licensing_reportable: false,
    follow_up_required: true,
    follow_up_notes: 'Monitor both children over the next week. Schedule parent conference for biting child if behavior continues.',
    status: 'investigating',
    reported_by: 'emp_maria',
    reported_by_name: 'Maria Rodriguez',
    created_at: '2026-03-05T13:50:00Z',
    updated_at: '2026-03-05T14:10:00Z',
  },
  {
    id: 'inc_seed_3',
    incident_number: 'INC-2026-0003',
    date: '2026-03-07',
    time: '08:30',
    location: 'Kitchen / Food Prep Area',
    type: 'safety_hazard',
    severity: 'serious',
    description: 'During morning inspection, a staff member discovered that the walk-in cooler temperature had risen to 52 degrees F overnight (should be below 41 F). Approximately 15 lbs of perishable food items were affected, including milk, cheese, and cut fruit prepared for snack.',
    children_involved: [],
    staff_involved: [
      { name: 'Christina Davis', role_in_incident: 'Discovered issue during morning walkaround' },
    ],
    witnesses: [],
    immediate_action: 'All affected perishable food was discarded immediately. Emergency cooler repair service was called. Temporary cooler arrangements made for remaining food. Backup breakfast plan activated using shelf-stable items.',
    parent_notified: false,
    licensing_reportable: true,
    follow_up_required: true,
    follow_up_notes: 'Cooler repair scheduled for today. Need to file food safety incident with licensing. Restock perishable items. Review cooler monitoring procedures.',
    status: 'open',
    reported_by: 'emp_christina',
    reported_by_name: 'Christina Davis',
    created_at: '2026-03-07T08:35:00Z',
    updated_at: '2026-03-07T08:35:00Z',
  },
];

// ─── Storage ────────────────────────────────────────────────────────

const STORAGE_KEY = 'christinas_incidents';

function loadIncidents(): Incident[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_INCIDENTS));
    return SEED_INCIDENTS;
  }
  try {
    return JSON.parse(raw) as Incident[];
  } catch {
    return [];
  }
}

function saveIncidents(incidents: Incident[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
}

// ─── New Incident Form ──────────────────────────────────────────────

interface IncidentFormData {
  date: string;
  time: string;
  location: string;
  type: Incident['type'];
  severity: Incident['severity'];
  description: string;
  children_involved: { name: string; age: string; classroom: string }[];
  staff_involved: { name: string; role_in_incident: string }[];
  immediate_action: string;
  parent_notified: boolean;
  parent_notified_at: string;
  licensing_reportable: boolean;
  follow_up_required: boolean;
  follow_up_notes: string;
}

const DEFAULT_FORM: IncidentFormData = {
  date: new Date().toISOString().split('T')[0],
  time: '',
  location: '',
  type: 'injury',
  severity: 'minor',
  description: '',
  children_involved: [],
  staff_involved: [],
  immediate_action: '',
  parent_notified: false,
  parent_notified_at: '',
  licensing_reportable: false,
  follow_up_required: false,
  follow_up_notes: '',
};

function IncidentForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (incident: Incident) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<IncidentFormData>({ ...DEFAULT_FORM });
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childClassroom, setChildClassroom] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');

  const addChild = () => {
    if (!childName.trim()) return;
    setForm((prev) => ({
      ...prev,
      children_involved: [
        ...prev.children_involved,
        { name: childName.trim(), age: childAge.trim(), classroom: childClassroom.trim() },
      ],
    }));
    setChildName('');
    setChildAge('');
    setChildClassroom('');
  };

  const removeChild = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      children_involved: prev.children_involved.filter((_, i) => i !== idx),
    }));
  };

  const addStaff = () => {
    if (!staffName.trim()) return;
    setForm((prev) => ({
      ...prev,
      staff_involved: [
        ...prev.staff_involved,
        { name: staffName.trim(), role_in_incident: staffRole.trim() },
      ],
    }));
    setStaffName('');
    setStaffRole('');
  };

  const removeStaff = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      staff_involved: prev.staff_involved.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.location.trim()) return;

    const now = new Date().toISOString();
    const incident: Incident = {
      id: generateIncidentId(),
      incident_number: generateIncidentNumber(),
      date: form.date,
      time: form.time || undefined,
      location: form.location,
      type: form.type,
      severity: form.severity,
      description: form.description,
      children_involved: form.children_involved,
      staff_involved: form.staff_involved,
      witnesses: [],
      immediate_action: form.immediate_action,
      parent_notified: form.parent_notified,
      parent_notified_at: form.parent_notified ? form.parent_notified_at || now : undefined,
      licensing_reportable: form.licensing_reportable,
      follow_up_required: form.follow_up_required,
      follow_up_notes: form.follow_up_required ? form.follow_up_notes : undefined,
      status: 'open',
      reported_by: 'current_user',
      reported_by_name: 'Current User',
      created_at: now,
      updated_at: now,
    };
    onSubmit(incident);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Date, Time, Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="inc-date" className="text-base">Date *</Label>
          <Input
            id="inc-date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
            className="min-h-[44px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inc-time" className="text-base">Time</Label>
          <Input
            id="inc-time"
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="min-h-[44px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inc-location" className="text-base">Location *</Label>
          <Input
            id="inc-location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Outdoor Playground"
            required
            className="min-h-[44px]"
          />
        </div>
      </div>

      {/* Type and Severity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-base">Incident Type *</Label>
          <Select
            value={form.type}
            onValueChange={(val) => setForm({ ...form, type: val as Incident['type'] })}
          >
            <SelectTrigger className="min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCIDENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-base">Severity *</Label>
          <Select
            value={form.severity}
            onValueChange={(val) => setForm({ ...form, severity: val as Incident['severity'] })}
          >
            <SelectTrigger className="min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_LEVELS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="inc-desc" className="text-base">Description *</Label>
        <Textarea
          id="inc-desc"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe what happened in detail..."
          rows={4}
          required
        />
      </div>

      {/* Children Involved */}
      <div className="space-y-3">
        <Label>Children Involved</Label>
        {form.children_involved.length > 0 && (
          <div className="space-y-2">
            {form.children_involved.map((child, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2 text-sm">
                <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="font-medium">{child.name}</span>
                {child.age && <span className="text-muted-foreground">Age {child.age}</span>}
                {child.classroom && (
                  <Badge variant="outline" className="text-xs">
                    {child.classroom}
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={() => removeChild(idx)}
                  className="ml-auto text-muted-foreground hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">Name</span>
            <Input
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Child name"
              className="h-9"
            />
          </div>
          <div className="w-20 space-y-1">
            <span className="text-xs text-muted-foreground">Age</span>
            <Input
              value={childAge}
              onChange={(e) => setChildAge(e.target.value)}
              placeholder="Age"
              className="h-9"
            />
          </div>
          <div className="w-28 space-y-1">
            <span className="text-xs text-muted-foreground">Classroom</span>
            <Input
              value={childClassroom}
              onChange={(e) => setChildClassroom(e.target.value)}
              placeholder="Room"
              className="h-9"
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addChild} className="h-9">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Staff Involved */}
      <div className="space-y-3">
        <Label>Staff Involved</Label>
        {form.staff_involved.length > 0 && (
          <div className="space-y-2">
            {form.staff_involved.map((staff, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2 text-sm">
                <span className="font-medium">{staff.name}</span>
                {staff.role_in_incident && (
                  <span className="text-muted-foreground">- {staff.role_in_incident}</span>
                )}
                <button
                  type="button"
                  onClick={() => removeStaff(idx)}
                  className="ml-auto text-muted-foreground hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">Name</span>
            <Input
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="Staff name"
              className="h-9"
            />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">Role in Incident</span>
            <Input
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value)}
              placeholder="e.g. Supervising teacher"
              className="h-9"
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addStaff} className="h-9">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Immediate Action */}
      <div className="space-y-2">
        <Label htmlFor="inc-action" className="text-base">Immediate Action Taken</Label>
        <Textarea
          id="inc-action"
          value={form.immediate_action}
          onChange={(e) => setForm({ ...form, immediate_action: e.target.value })}
          placeholder="What was done right away?"
          rows={3}
        />
      </div>

      {/* Checkboxes */}
      <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
        <div className="flex items-start gap-3">
          <Checkbox
            id="parent-notified"
            checked={form.parent_notified}
            onCheckedChange={(checked) =>
              setForm({ ...form, parent_notified: checked === true })
            }
          />
          <div className="space-y-1">
            <Label htmlFor="parent-notified" className="cursor-pointer">
              Parent / Guardian Notified
            </Label>
            {form.parent_notified && (
              <Input
                type="datetime-local"
                value={form.parent_notified_at}
                onChange={(e) => setForm({ ...form, parent_notified_at: e.target.value })}
                className="h-8 w-60 text-sm mt-1"
                placeholder="When?"
              />
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="licensing-reportable"
            checked={form.licensing_reportable}
            onCheckedChange={(checked) =>
              setForm({ ...form, licensing_reportable: checked === true })
            }
          />
          <Label htmlFor="licensing-reportable" className="cursor-pointer">
            Licensing Reportable
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="follow-up"
            checked={form.follow_up_required}
            onCheckedChange={(checked) =>
              setForm({ ...form, follow_up_required: checked === true })
            }
          />
          <div className="space-y-1">
            <Label htmlFor="follow-up" className="cursor-pointer">
              Follow-up Required
            </Label>
            {form.follow_up_required && (
              <Textarea
                value={form.follow_up_notes}
                onChange={(e) => setForm({ ...form, follow_up_notes: e.target.value })}
                placeholder="Describe needed follow-up..."
                rows={2}
                className="mt-1"
              />
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="min-h-[44px]">
          Cancel
        </Button>
        <Button type="submit" className="bg-[#C62828] hover:bg-[#B71C1C] text-white min-h-[44px]">
          Submit Incident Report
        </Button>
      </div>
    </form>
  );
}

// ─── Incident Detail View ───────────────────────────────────────────

function IncidentDetail({
  incident,
  onBack,
  onUpdateStatus,
}: {
  incident: Incident;
  onBack: () => void;
  onUpdateStatus: (id: string, newStatus: Incident['status']) => void;
}) {
  const next = nextStatus(incident.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to List
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{incident.incident_number}</h2>
            <Badge className={`text-sm ${getSeverityColor(incident.severity)}`}>
              {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
            </Badge>
            <Badge className={`text-sm ${getStatusColor(incident.status)}`}>
              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Reported by {incident.reported_by_name} on {formatDate(incident.date)}
            {incident.time && ` at ${incident.time}`}
          </p>
        </div>
        {next && (
          <Button
            onClick={() => onUpdateStatus(incident.id, next)}
            className="bg-[#C62828] hover:bg-[#B71C1C] text-white min-h-[44px]"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark as {next.charAt(0).toUpperCase() + next.slice(1)}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#C62828]" />
              Incident Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Type</span>
                <Badge variant="outline">{getTypeLabel(incident.type)}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Location</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {incident.location}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Date</span>
                <span>{formatDate(incident.date)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Time</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {incident.time || 'Not recorded'}
                </span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-sm block mb-1">Description</span>
              <p className="text-sm leading-relaxed">{incident.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* People Involved */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-[#C62828]" />
              People Involved
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {incident.children_involved.length > 0 && (
              <div>
                <span className="text-muted-foreground text-sm block mb-2">Children</span>
                <div className="space-y-2">
                  {incident.children_involved.map((child, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{child.name}</span>
                      {child.age && (
                        <span className="text-muted-foreground">Age {child.age}</span>
                      )}
                      {child.classroom && (
                        <Badge variant="outline" className="text-xs">
                          {child.classroom}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {incident.children_involved.length === 0 && (
              <div>
                <span className="text-muted-foreground text-sm block mb-2">Children</span>
                <p className="text-sm text-muted-foreground italic">No children involved</p>
              </div>
            )}
            {incident.staff_involved.length > 0 && (
              <div>
                <span className="text-muted-foreground text-sm block mb-2">Staff</span>
                <div className="space-y-2">
                  {incident.staff_involved.map((staff, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{staff.name}</span>
                      {staff.role_in_incident && (
                        <span className="text-muted-foreground">
                          - {staff.role_in_incident}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {incident.witnesses.length > 0 && (
              <div>
                <span className="text-muted-foreground text-sm block mb-2">Witnesses</span>
                <div className="space-y-1">
                  {incident.witnesses.map((w, i) => (
                    <p key={i} className="text-sm">{w}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#C62828]" />
              Response &amp; Follow-up
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-muted-foreground text-sm block mb-1">Immediate Action Taken</span>
              <p className="text-sm leading-relaxed">
                {incident.immediate_action || 'Not recorded'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                {incident.parent_notified ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )}
                <span>
                  Parent notified
                  {incident.parent_notified && incident.parent_notified_at
                    ? ` on ${formatDateTime(incident.parent_notified_at)}`
                    : incident.parent_notified
                    ? ''
                    : ' - Not yet'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {incident.licensing_reportable ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                <span>
                  {incident.licensing_reportable
                    ? 'Licensing reportable'
                    : 'Not licensing reportable'}
                </span>
              </div>
            </div>
            {incident.follow_up_required && (
              <div>
                <span className="text-muted-foreground text-sm block mb-1">Follow-up Notes</span>
                <p className="text-sm leading-relaxed">
                  {incident.follow_up_notes || 'Follow-up is required but no notes have been added yet.'}
                </p>
              </div>
            )}
            {incident.resolution && (
              <div>
                <span className="text-muted-foreground text-sm block mb-1">Resolution</span>
                <p className="text-sm leading-relaxed">{incident.resolution}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#C62828]" />
              Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDateTime(incident.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span>{formatDateTime(incident.updated_at)}</span>
            </div>
            {incident.reviewed_by && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reviewed By</span>
                <span>
                  {incident.reviewed_by}
                  {incident.reviewed_at && ` on ${formatDateTime(incident.reviewed_at)}`}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status History</span>
              <div className="flex gap-1">
                {STATUS_FLOW.map((s) => {
                  const isActive = STATUS_FLOW.indexOf(s) <= STATUS_FLOW.indexOf(incident.status);
                  return (
                    <span
                      key={s}
                      className={`px-2 py-0.5 rounded text-xs ${
                        isActive
                          ? 'bg-[#C62828] text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </span>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    const data = loadIncidents();
    setIncidents(data);
    setLoading(false);
  }, []);

  const handleCreateIncident = useCallback(
    (incident: Incident) => {
      const updated = [incident, ...incidents];
      setIncidents(updated);
      saveIncidents(updated);
      setDialogOpen(false);
    },
    [incidents]
  );

  const handleUpdateStatus = useCallback(
    (id: string, newStatus: Incident['status']) => {
      const updated = incidents.map((inc) =>
        inc.id === id
          ? { ...inc, status: newStatus, updated_at: new Date().toISOString() }
          : inc
      );
      setIncidents(updated);
      saveIncidents(updated);
    },
    [incidents]
  );

  const selectedIncident = incidents.find((inc) => inc.id === selectedIncidentId) || null;

  const filteredIncidents = incidents.filter((inc) => {
    if (filterStatus !== 'all' && inc.status !== filterStatus) return false;
    if (filterType !== 'all' && inc.type !== filterType) return false;
    if (filterSeverity !== 'all' && inc.severity !== filterSeverity) return false;
    return true;
  });

  // Stats
  const openCount = incidents.filter((i) => i.status === 'open').length;
  const investigatingCount = incidents.filter((i) => i.status === 'investigating').length;
  const criticalCount = incidents.filter(
    (i) => (i.severity === 'serious' || i.severity === 'critical') && i.status !== 'closed'
  ).length;

  if (loading) {
    return (
      <DashboardLayout isAdmin>
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Loading incidents...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isAdmin>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Training Banner */}
        <div className="bg-[#C62828]/10 border border-[#C62828]/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-[#C62828]" />
            <div>
              <p className="font-medium text-base">Incident Response Training</p>
              <p className="text-sm text-muted-foreground">
                Make sure all staff have completed the required training modules.
              </p>
            </div>
          </div>
          <Link href="/admin/incidents/training">
            <Button variant="outline" size="sm" className="border-[#C62828]/40 text-[#C62828] hover:bg-[#C62828]/10">
              Complete Incident Training
            </Button>
          </Link>
        </div>

        {/* Detail View */}
        {selectedIncident ? (
          <IncidentDetail
            incident={selectedIncident}
            onBack={() => setSelectedIncidentId(null)}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-[#C62828]" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Incident Reports</h1>
                  <p className="text-muted-foreground">
                    Track, manage, and resolve incidents at your center
                  </p>
                </div>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#C62828] hover:bg-[#B71C1C] text-white min-h-[44px]">
                    <Plus className="h-4 w-4 mr-2" />
                    New Incident
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Report New Incident</DialogTitle>
                  </DialogHeader>
                  <IncidentForm
                    onSubmit={handleCreateIncident}
                    onCancel={() => setDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{incidents.length}</div>
                  <p className="text-sm text-muted-foreground">Total Incidents</p>
                </CardContent>
              </Card>
              <Card className={openCount > 0 ? 'border-blue-300' : ''}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">{openCount}</div>
                  <p className="text-sm text-muted-foreground">Open</p>
                </CardContent>
              </Card>
              <Card className={investigatingCount > 0 ? 'border-yellow-300' : ''}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-600">{investigatingCount}</div>
                  <p className="text-sm text-muted-foreground">Investigating</p>
                </CardContent>
              </Card>
              <Card className={criticalCount > 0 ? 'border-red-300' : ''}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
                  <p className="text-sm text-muted-foreground">Serious / Critical (Active)</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {INCIDENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      {SEVERITY_LEVELS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Incident List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {filteredIncidents.length === incidents.length
                    ? `All Incidents (${incidents.length})`
                    : `Filtered Results (${filteredIncidents.length} of ${incidents.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredIncidents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No incidents match your filters.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredIncidents.map((incident) => (
                      <button
                        key={incident.id}
                        onClick={() => setSelectedIncidentId(incident.id)}
                        className="w-full text-left p-4 bg-muted/30 hover:bg-muted/60 rounded-lg transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="shrink-0">
                              <span className="text-sm font-mono font-semibold text-[#C62828]">
                                {incident.incident_number}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-base font-medium truncate">
                                {incident.description.length > 100
                                  ? incident.description.slice(0, 100) + '...'
                                  : incident.description}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span>{formatDate(incident.date)}</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {incident.location}
                                </span>
                                {incident.children_involved.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {incident.children_involved.length} child
                                    {incident.children_involved.length !== 1 ? 'ren' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-sm">
                              {getTypeLabel(incident.type)}
                            </Badge>
                            <Badge className={`text-sm ${getSeverityColor(incident.severity)}`}>
                              {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                            </Badge>
                            <Badge className={`text-sm ${getStatusColor(incident.status)}`}>
                              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                            </Badge>
                            {incident.licensing_reportable && (
                              <Badge className="bg-red-100 text-red-800 text-sm">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Reportable
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

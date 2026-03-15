'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, AlertCircle, Camera, X, Phone } from 'lucide-react';
import {
  IncidentLog,
  IncidentType,
  IncidentSeverity,
  INCIDENT_TYPE_LABELS,
  SEVERITY_LABELS,
  createIncident,
  updateIncident,
} from '@/lib/incident-log-storage';

const CLASSROOMS = [
  'Bumblebees (Infant)',
  'Ladybugs (2-3yr)',
  'Butterflies (3-4yr)',
  'Sunflowers (PreK)',
  'Playground / Outdoor',
  'Common Area',
  'Cafeteria',
  'Other',
];

const STAFF_LIST = [
  'Maria Chen',
  'Sandra Williams',
  'James Okafor',
  'Rachel Torres',
  'Christina (Director)',
];

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  minor: 'bg-green-100 text-green-700 border-green-200',
  moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  serious: 'bg-red-100 text-red-700 border-red-200',
};

interface IncidentFormProps {
  existingIncident?: IncidentLog;
  onSaved?: () => void;
}

export function IncidentForm({ existingIncident, onSaved }: IncidentFormProps) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const nowStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  const [form, setForm] = useState({
    date: existingIncident?.date || todayStr,
    time: existingIncident?.time || nowStr,
    child_name: existingIncident?.child_name || '',
    classroom: existingIncident?.classroom || '',
    incident_type: (existingIncident?.incident_type || 'injury') as IncidentType,
    severity: (existingIncident?.severity || 'minor') as IncidentSeverity,
    description: existingIncident?.description || '',
    action_taken: existingIncident?.action_taken || '',
    witnesses: existingIncident?.witnesses || '',
    staff_on_duty: existingIncident?.staff_on_duty || '',
    parent_notified: existingIncident?.parent_notified ?? false,
    parent_notified_at: existingIncident?.parent_notified_at || '',
    follow_up_required: existingIncident?.follow_up_required ?? false,
    notes: existingIncident?.notes || '',
  });

  const [photos, setPhotos] = useState<string[]>(existingIncident?.photo_urls || []);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (photos.length >= 3) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.child_name.trim()) return setError('Child name is required.');
    if (!form.classroom) return setError('Classroom is required.');
    if (!form.description.trim()) return setError('Description is required.');
    if (!form.action_taken.trim()) return setError('Action taken is required.');
    if (!form.staff_on_duty) return setError('Staff on duty is required.');

    setSubmitting(true);
    try {
      const data = {
        ...form,
        parent_notified_at: form.parent_notified && !form.parent_notified_at
          ? new Date().toISOString()
          : form.parent_notified_at || undefined,
        photo_urls: photos.length > 0 ? photos : undefined,
        created_by: form.staff_on_duty,
      };

      if (existingIncident) {
        await updateIncident(existingIncident.id, data);
      } else {
        await createIncident(data);
      }

      setSuccess(true);
      onSaved?.();
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  const markParentNotified = () => {
    setForm({
      ...form,
      parent_notified: true,
      parent_notified_at: new Date().toISOString(),
    });
  };

  if (success && !existingIncident) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
          <p className="text-lg font-semibold">Incident logged</p>
          <p className="text-sm text-muted-foreground mt-1">
            The incident report has been saved. A parent notification is{' '}
            {form.parent_notified ? 'recorded.' : 'still required.'}
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              setSuccess(false);
              setForm({
                date: todayStr, time: nowStr, child_name: '', classroom: '',
                incident_type: 'injury', severity: 'minor', description: '',
                action_taken: '', witnesses: '', staff_on_duty: '',
                parent_notified: false, parent_notified_at: '',
                follow_up_required: false, notes: '',
              });
              setPhotos([]);
            }}
          >
            Log Another Incident
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Basic Information
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                max={todayStr}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time <span className="text-red-500">*</span></Label>
              <Input
                id="time"
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="child-name">
              Child&apos;s Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="child-name"
              placeholder="First name and last initial (e.g. Lucas M.)"
              value={form.child_name}
              onChange={(e) => setForm({ ...form, child_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Classroom <span className="text-red-500">*</span></Label>
            <Select
              value={form.classroom}
              onValueChange={(v) => setForm({ ...form, classroom: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select classroom" />
              </SelectTrigger>
              <SelectContent>
                {CLASSROOMS.map((room) => (
                  <SelectItem key={room} value={room}>{room}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Incident Type <span className="text-red-500">*</span></Label>
              <Select
                value={form.incident_type}
                onValueChange={(v) => setForm({ ...form, incident_type: v as IncidentType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INCIDENT_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severity <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                {(Object.keys(SEVERITY_LABELS) as IncidentSeverity[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, severity: s })}
                    className={`flex-1 text-xs py-2 px-1 rounded-md border transition-all ${
                      form.severity === s
                        ? SEVERITY_COLORS[s] + ' ring-2 ring-offset-1 ring-current'
                        : 'border-border text-muted-foreground hover:bg-muted/40'
                    }`}
                  >
                    {SEVERITY_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description & Action */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Incident Details
          </p>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe exactly what happened, where, and who was present. Be specific about how the incident occurred."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action">
              Action Taken <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="action"
              placeholder="What was done in response? Include first aid, who was called, where the child was taken, etc."
              value={form.action_taken}
              onChange={(e) => setForm({ ...form, action_taken: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="witnesses">Witnesses (optional)</Label>
            <Input
              id="witnesses"
              placeholder="Names of any witnesses"
              value={form.witnesses}
              onChange={(e) => setForm({ ...form, witnesses: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Staff on Duty <span className="text-red-500">*</span></Label>
            <Select
              value={form.staff_on_duty}
              onValueChange={(v) => setForm({ ...form, staff_on_duty: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {STAFF_LIST.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Parent Notification */}
      <Card
        className={
          !form.parent_notified
            ? 'border-orange-300 bg-orange-50/30'
            : 'border-green-300 bg-green-50/30'
        }
      >
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm uppercase tracking-wide">
              Parent Notification
            </p>
            {form.parent_notified ? (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Notified
              </Badge>
            ) : (
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                <AlertCircle className="h-3 w-3 mr-1" />
                Not yet notified
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Parent has been notified</p>
              <p className="text-xs text-muted-foreground">
                Required by state licensing — must notify within 24 hours
              </p>
            </div>
            <Switch
              checked={form.parent_notified}
              onCheckedChange={(checked) =>
                setForm({
                  ...form,
                  parent_notified: checked,
                  parent_notified_at: checked && !form.parent_notified_at
                    ? new Date().toISOString()
                    : form.parent_notified_at,
                })
              }
            />
          </div>

          {!form.parent_notified && (
            <Button
              type="button"
              onClick={markParentNotified}
              variant="outline"
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Phone className="h-4 w-4 mr-2" />
              Mark as Notified Now
            </Button>
          )}

          {form.parent_notified && form.parent_notified_at && (
            <p className="text-xs text-green-700">
              Notified at:{' '}
              {new Date(form.parent_notified_at).toLocaleString()}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <p className="text-sm font-medium">Follow-up required</p>
              <p className="text-xs text-muted-foreground">
                Needs monitoring, parent meeting, or additional documentation
              </p>
            </div>
            <Switch
              checked={form.follow_up_required}
              onCheckedChange={(checked) =>
                setForm({ ...form, follow_up_required: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <p className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Photos (optional, max 3)
          </p>
          <div className="flex gap-3 flex-wrap">
            {photos.map((photo, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt={`Incident photo ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/40 text-muted-foreground">
                <Camera className="h-5 w-5 mb-1" />
                <span className="text-xs">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional notes */}
      <Card>
        <CardContent className="p-5 space-y-2">
          <Label htmlFor="notes">Additional Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any follow-up information, parent feedback, medical findings, etc."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#C62828] hover:bg-[#b71c1c] text-white h-11 text-base"
      >
        {submitting ? 'Saving...' : existingIncident ? 'Save Changes' : 'Submit Incident Report'}
      </Button>
    </form>
  );
}

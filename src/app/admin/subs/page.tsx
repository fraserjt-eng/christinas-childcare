'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  UserPlus,
  Phone,
  Mail,
  Clock,
  Plus,
  Edit2,
  UserX,
  Award,
  Calendar,
} from 'lucide-react';
import {
  getSubs,
  createSub,
  updateSub,
  deactivateSub,
  assignSub,
  getAssignmentsForDate,
  Substitute,
  SubAssignment,
} from '@/lib/sub-storage';
import { CLASSROOMS } from '@/lib/schedule-optimizer-storage';

const EMPTY_SUB: Omit<Substitute, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  phone: '',
  email: '',
  certifications: [],
  availability: '',
  hourly_rate: 18,
  notes: '',
  status: 'active',
};

export default function SubsPage() {
  const [subs, setSubs] = useState<Substitute[]>([]);
  const [todaysAssignments, setTodaysAssignments] = useState<SubAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Substitute | null>(null);
  const [formData, setFormData] = useState(EMPTY_SUB);
  const [certInput, setCertInput] = useState('');

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSubObj, setAssignSubObj] = useState<Substitute | null>(null);
  const [assignClassroom, setAssignClassroom] = useState(CLASSROOMS[0]?.classroom_id || '');
  const [assignDate, setAssignDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignStart, setAssignStart] = useState('08:00');
  const [assignEnd, setAssignEnd] = useState('16:00');
  const [assignCoverFor, setAssignCoverFor] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [list, todays] = await Promise.all([
        getSubs(),
        getAssignmentsForDate(new Date().toISOString().split('T')[0]),
      ]);
      setSubs(list);
      setTodaysAssignments(todays);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function openNew() {
    setEditingSub(null);
    setFormData(EMPTY_SUB);
    setCertInput('');
    setEditOpen(true);
  }

  function openEdit(sub: Substitute) {
    setEditingSub(sub);
    setFormData({
      name: sub.name,
      phone: sub.phone,
      email: sub.email,
      certifications: [...sub.certifications],
      availability: sub.availability,
      hourly_rate: sub.hourly_rate,
      notes: sub.notes,
      status: sub.status,
    });
    setCertInput('');
    setEditOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (editingSub) {
      await updateSub(editingSub.id, formData);
    } else {
      await createSub(formData);
    }
    setEditOpen(false);
    await refresh();
  }

  async function handleDeactivate(sub: Substitute) {
    if (!confirm(`Deactivate ${sub.name}?`)) return;
    await deactivateSub(sub.id);
    await refresh();
  }

  function openAssign(sub: Substitute) {
    setAssignSubObj(sub);
    setAssignOpen(true);
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assignSubObj) return;
    const classroom = CLASSROOMS.find((c) => c.classroom_id === assignClassroom);
    if (!classroom) return;
    await assignSub({
      sub_id: assignSubObj.id,
      sub_name: assignSubObj.name,
      classroom_id: classroom.classroom_id,
      classroom_name: classroom.classroom_name,
      date: assignDate,
      start_time: assignStart,
      end_time: assignEnd,
      covering_for: assignCoverFor.trim() || undefined,
    });
    setAssignOpen(false);
    setAssignCoverFor('');
    await refresh();
  }

  function addCert() {
    const c = certInput.trim();
    if (!c) return;
    setFormData((prev) => ({ ...prev, certifications: [...prev.certifications, c] }));
    setCertInput('');
  }

  function removeCert(idx: number) {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== idx),
    }));
  }

  const activeSubs = subs.filter((s) => s.status === 'active');
  const inactiveSubs = subs.filter((s) => s.status === 'inactive');

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <UserPlus className="h-8 w-8 text-christina-red" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Substitute Staff</h1>
            <p className="text-muted-foreground text-sm">
              Manage your sub pool and assign subs to rooms when staff call out.
            </p>
          </div>
        </div>
        <Button onClick={openNew} className="bg-christina-red hover:bg-christina-red/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Sub
        </Button>
      </div>

      {/* Today's assignments */}
      {todaysAssignments.length > 0 && (
        <Card className="border-christina-blue/30 bg-christina-blue/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-christina-blue" />
              Today&apos;s Sub Assignments ({todaysAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todaysAssignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{a.sub_name}</span>
                  <span className="text-muted-foreground"> → {a.classroom_name}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {a.start_time} - {a.end_time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active subs */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Active Pool ({activeSubs.length})</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : activeSubs.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No subs in the pool yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first substitute to get started.
              </p>
              <Button onClick={openNew} className="mt-4 bg-christina-red hover:bg-christina-red/90">
                <Plus className="h-4 w-4 mr-2" />
                Add First Sub
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {activeSubs.map((sub) => (
              <Card key={sub.id}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{sub.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      ${sub.hourly_rate}/hr
                    </span>
                  </div>
                  {sub.phone && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {sub.phone}
                    </p>
                  )}
                  {sub.email && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {sub.email}
                    </p>
                  )}
                  {sub.availability && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {sub.availability}
                    </p>
                  )}
                  {sub.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sub.certifications.map((cert, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {sub.last_used_at && (
                    <p className="text-xs text-muted-foreground">
                      Last used: {new Date(sub.last_used_at).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => openAssign(sub)}
                    >
                      Assign
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(sub)}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeactivate(sub)}>
                      <UserX className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Inactive (collapsed) */}
      {inactiveSubs.length > 0 && (
        <details className="pt-2">
          <summary className="text-sm text-muted-foreground cursor-pointer">
            Inactive ({inactiveSubs.length})
          </summary>
          <div className="grid gap-2 md:grid-cols-3 mt-3">
            {inactiveSubs.map((sub) => (
              <div
                key={sub.id}
                className="p-3 rounded-lg border bg-muted/30 text-sm flex items-center justify-between"
              >
                <span className="text-muted-foreground">{sub.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await updateSub(sub.id, { status: 'active' });
                    await refresh();
                  }}
                >
                  Reactivate
                </Button>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSub ? 'Edit Sub' : 'Add Sub'}</DialogTitle>
            <DialogDescription>
              Sub pool members can be assigned to rooms when regular staff call out.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="sub-name">Name</Label>
              <Input
                id="sub-name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="sub-phone">Phone</Label>
                <Input
                  id="sub-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sub-rate">Rate ($/hr)</Label>
                <Input
                  id="sub-rate"
                  type="number"
                  min="0"
                  value={formData.hourly_rate}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, hourly_rate: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="sub-email">Email</Label>
              <Input
                id="sub-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sub-avail">Availability</Label>
              <Input
                id="sub-avail"
                value={formData.availability}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, availability: e.target.value }))
                }
                placeholder="Weekday mornings, any day, etc."
              />
            </div>
            <div className="space-y-1">
              <Label>Certifications</Label>
              <div className="flex gap-2">
                <Input
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  placeholder="CPR, First Aid, ECE..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCert();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addCert}>
                  Add
                </Button>
              </div>
              {formData.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {formData.certifications.map((c, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => removeCert(i)}
                    >
                      {c} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="sub-notes">Notes</Label>
              <Textarea
                id="sub-notes"
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-christina-red hover:bg-christina-red/90">
                {editingSub ? 'Save Changes' : 'Add to Pool'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign {assignSubObj?.name}</DialogTitle>
            <DialogDescription>
              Pick the room, date, and shift this sub will cover.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="assign-classroom">Room</Label>
              <select
                id="assign-classroom"
                value={assignClassroom}
                onChange={(e) => setAssignClassroom(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {CLASSROOMS.map((c) => (
                  <option key={c.classroom_id} value={c.classroom_id}>
                    {c.classroom_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="assign-date">Date</Label>
              <Input
                id="assign-date"
                type="date"
                value={assignDate}
                onChange={(e) => setAssignDate(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="assign-start">Start</Label>
                <Input
                  id="assign-start"
                  type="time"
                  value={assignStart}
                  onChange={(e) => setAssignStart(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="assign-end">End</Label>
                <Input
                  id="assign-end"
                  type="time"
                  value={assignEnd}
                  onChange={(e) => setAssignEnd(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="assign-cover">Covering for (optional)</Label>
              <Input
                id="assign-cover"
                value={assignCoverFor}
                onChange={(e) => setAssignCoverFor(e.target.value)}
                placeholder="Staff member name"
              />
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setAssignOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-christina-red hover:bg-christina-red/90">
                Assign
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

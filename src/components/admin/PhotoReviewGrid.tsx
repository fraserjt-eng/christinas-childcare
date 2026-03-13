'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ImageOff,
} from 'lucide-react';
import {
  getPhotos,
  updatePhotoStatus,
  bulkUpdateStatus,
  DailyPhoto,
  PhotoStatus,
  ACTIVITY_LABELS,
} from '@/lib/photo-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | PhotoStatus;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function statusBadgeClass(status: PhotoStatus): string {
  switch (status) {
    case 'approved':
      return 'bg-christina-green/10 text-christina-green border-christina-green/20';
    case 'rejected':
      return 'bg-christina-coral/10 text-christina-coral border-christina-coral/20';
    default:
      return 'bg-christina-yellow/10 text-yellow-700 border-christina-yellow/20';
  }
}

function activityBadgeClass(): string {
  return 'bg-christina-blue/10 text-christina-blue border-christina-blue/20';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PhotoReviewGrid() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [photos, setPhotos] = useState<DailyPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // ── Load photos ────────────────────────────────────────────────────────────

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const results = await getPhotos({ date: formatDateParam(selectedDate) });
      setPhotos(results);
    } catch (err) {
      console.error('Error loading photos:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered =
    statusFilter === 'all'
      ? photos
      : photos.filter((p) => p.status === statusFilter);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const total = photos.length;
  const pending = photos.filter((p) => p.status === 'pending').length;
  const approved = photos.filter((p) => p.status === 'approved').length;
  const rejected = photos.filter((p) => p.status === 'rejected').length;

  // ── Selection ──────────────────────────────────────────────────────────────

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((p) => selected.has(p.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // ── Single update ──────────────────────────────────────────────────────────

  async function handleSingleUpdate(id: string, status: PhotoStatus) {
    setUpdatingIds((prev) => new Set(prev).add(id));
    try {
      await updatePhotoStatus(id, status, 'admin');
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status, reviewed_by: 'admin', reviewed_at: new Date().toISOString() }
            : p
        )
      );
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error('Error updating photo:', err);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  // ── Bulk update ────────────────────────────────────────────────────────────

  async function handleBulkUpdate(status: PhotoStatus) {
    if (selected.size === 0) return;
    const ids = Array.from(selected);

    // Optimistically mark all as updating
    setUpdatingIds((prev) => new Set([...Array.from(prev), ...ids]));

    try {
      await bulkUpdateStatus(ids, status, 'admin');
      setPhotos((prev) =>
        prev.map((p) =>
          ids.includes(p.id)
            ? { ...p, status, reviewed_by: 'admin', reviewed_at: new Date().toISOString() }
            : p
        )
      );
      setSelected(new Set());
    } catch (err) {
      console.error('Error bulk updating photos:', err);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }
  }

  // ── Date navigation ────────────────────────────────────────────────────────

  function changeDate(delta: number) {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  }

  const isToday =
    formatDateParam(selectedDate) === formatDateParam(new Date());

  const dateLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Date navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => changeDate(-1)}
          aria-label="Previous day"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center flex-1">
          <p className="text-sm font-semibold">{dateLabel}</p>
          {isToday && (
            <p className="text-xs text-christina-blue">Today</p>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => changeDate(1)}
          disabled={isToday}
          aria-label="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total', value: total, color: 'text-foreground' },
          { label: 'Pending', value: pending, color: 'text-yellow-600' },
          { label: 'Approved', value: approved, color: 'text-christina-green' },
          { label: 'Rejected', value: rejected, color: 'text-christina-coral' },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <CardContent className="p-2">
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatusFilter(f)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize ${
              statusFilter === f
                ? 'bg-christina-red text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f === 'all' ? `All (${total})` : `${f} (${f === 'pending' ? pending : f === 'approved' ? approved : rejected})`}
          </button>
        ))}
      </div>

      {/* Bulk actions bar */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2">
          <Checkbox
            id="select-all"
            checked={allFilteredSelected}
            onCheckedChange={toggleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer flex-1">
            {selected.size > 0
              ? `${selected.size} selected`
              : 'Select all'}
          </label>
          {selected.size > 0 && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkUpdate('approved')}
                className="h-7 text-xs border-christina-green text-christina-green hover:bg-christina-green/10"
              >
                <Check className="h-3 w-3 mr-1" />
                Approve {selected.size}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkUpdate('rejected')}
                className="h-7 text-xs border-christina-coral text-christina-coral hover:bg-christina-coral/10"
              >
                <X className="h-3 w-3 mr-1" />
                Reject {selected.size}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Photo grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
          <ImageOff className="h-10 w-10" />
          <p className="text-sm">
            {total === 0
              ? 'No photos uploaded for this day.'
              : `No ${statusFilter} photos.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((photo) => {
            const isUpdating = updatingIds.has(photo.id);
            const isSelected = selected.has(photo.id);

            return (
              <Card
                key={photo.id}
                className={`overflow-hidden transition-all ${
                  isSelected ? 'ring-2 ring-christina-red' : ''
                }`}
              >
                {/* Photo thumbnail */}
                <div className="relative">
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || ACTIVITY_LABELS[photo.activity_type]}
                    className="w-full h-44 object-cover"
                  />
                  {/* Selection checkbox overlay */}
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(photo.id)}
                      className="bg-white/80 border-white/60"
                    />
                  </div>
                  {/* Status badge overlay */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${statusBadgeClass(photo.status)}`}
                    >
                      {photo.status}
                    </span>
                  </div>
                </div>

                <CardContent className="p-3 space-y-2">
                  {/* Meta */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{photo.classroom_name}</p>
                      {photo.caption && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${activityBadgeClass()}`}
                    >
                      {ACTIVITY_LABELS[photo.activity_type]}
                    </span>
                  </div>

                  {/* Uploaded by + time */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{photo.employee_name || 'Staff'}</span>
                    <span>{formatDateLabel(photo.created_at)}</span>
                  </div>

                  {/* Action buttons */}
                  {photo.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => handleSingleUpdate(photo.id, 'approved')}
                        className="flex-1 h-8 text-xs border-christina-green text-christina-green hover:bg-christina-green/10"
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => handleSingleUpdate(photo.id, 'rejected')}
                        className="flex-1 h-8 text-xs border-christina-coral text-christina-coral hover:bg-christina-coral/10"
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Undo approved/rejected */}
                  {photo.status !== 'pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isUpdating}
                      onClick={() => handleSingleUpdate(photo.id, 'pending')}
                      className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Undo'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

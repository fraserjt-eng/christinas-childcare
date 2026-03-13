'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  ImageOff,
  Loader2,
  Camera,
} from 'lucide-react';
import {
  getPhotos,
  getReactionCounts,
  toggleReaction,
  DailyPhoto,
  ACTIVITY_LABELS,
} from '@/lib/photo-storage';
import { getClassrooms } from '@/lib/food-storage';
import { Classroom } from '@/types/food';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEMO_PARENT_ID = 'demo-parent-1';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function activityBadgeColor(activity: string): string {
  const map: Record<string, string> = {
    art: 'bg-purple-100 text-purple-700 border-purple-200',
    outdoor: 'bg-christina-green/10 text-christina-green border-christina-green/20',
    circle_time: 'bg-christina-blue/10 text-christina-blue border-christina-blue/20',
    free_play: 'bg-christina-yellow/10 text-yellow-700 border-christina-yellow/20',
    meals: 'bg-orange-100 text-orange-700 border-orange-200',
    nap_prep: 'bg-sky-100 text-sky-700 border-sky-200',
    special_event: 'bg-christina-coral/10 text-christina-coral border-christina-coral/20',
    other: 'bg-muted text-muted-foreground border-border',
  };
  return map[activity] || map.other;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PhotoFeed() {
  const [photos, setPhotos] = useState<DailyPhoto[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('all');
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Load photos and reactions ──────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allPhotos, rooms] = await Promise.all([
        getPhotos({ status: 'approved' }),
        getClassrooms({ active_only: true }),
      ]);

      setPhotos(allPhotos);
      setClassrooms(rooms);

      if (allPhotos.length > 0) {
        const ids = allPhotos.map((p) => p.id);
        const counts = await getReactionCounts(ids);
        setReactionCounts(counts);

        // Determine which the current parent has liked
        // We check by re-loading reactions per photo is expensive in demo mode,
        // so we track liked state in component memory only (resets on reload).
        // In production this would be a DB query filtered by parent_id.
      }
    } catch (err) {
      console.error('Error loading photo feed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Classroom filter ───────────────────────────────────────────────────────

  const filtered =
    selectedClassroomId === 'all'
      ? photos
      : photos.filter((p) => p.classroom_id === selectedClassroomId);

  // ── Heart toggle ───────────────────────────────────────────────────────────

  async function handleHeart(photoId: string) {
    if (togglingId === photoId) return;
    setTogglingId(photoId);

    try {
      const added = await toggleReaction(photoId, DEMO_PARENT_ID);

      setLikedIds((prev) => {
        const next = new Set(prev);
        if (added) {
          next.add(photoId);
        } else {
          next.delete(photoId);
        }
        return next;
      });

      setReactionCounts((prev) => ({
        ...prev,
        [photoId]: (prev[photoId] || 0) + (added ? 1 : -1),
      }));
    } catch (err) {
      console.error('Error toggling reaction:', err);
    } finally {
      setTogglingId(null);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-christina-red" />
          <h2 className="text-lg font-semibold">Today&apos;s Photos</h2>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {filtered.length} {filtered.length === 1 ? 'photo' : 'photos'}
        </Badge>
      </div>

      {/* Classroom filter */}
      {classrooms.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            type="button"
            onClick={() => setSelectedClassroomId('all')}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedClassroomId === 'all'
                ? 'bg-christina-red text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All Classrooms
          </button>
          {classrooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => setSelectedClassroomId(room.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedClassroomId === room.id
                  ? 'bg-christina-red text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
          <ImageOff className="h-10 w-10" />
          <p className="text-sm text-center">
            {photos.length === 0
              ? 'No photos have been shared yet today. Check back later!'
              : 'No photos for this classroom today.'}
          </p>
        </div>
      )}

      {/* Photo feed */}
      {filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((photo) => {
            const heartCount = reactionCounts[photo.id] || 0;
            const isLiked = likedIds.has(photo.id);
            const isToggling = togglingId === photo.id;

            return (
              <Card key={photo.id} className="overflow-hidden">
                {/* Full-width photo */}
                <div className="relative">
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || ACTIVITY_LABELS[photo.activity_type]}
                    className="w-full object-cover max-h-72"
                  />
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Classroom + activity */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {photo.classroom_name}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${activityBadgeColor(photo.activity_type)}`}
                    >
                      {ACTIVITY_LABELS[photo.activity_type]}
                    </span>
                  </div>

                  {/* Caption */}
                  {photo.caption && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {photo.caption}
                    </p>
                  )}

                  {/* Footer: timestamp + heart */}
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(photo.created_at)}
                    </p>

                    {/* Heart button */}
                    <button
                      type="button"
                      onClick={() => handleHeart(photo.id)}
                      disabled={isToggling}
                      aria-label={isLiked ? 'Unlike photo' : 'Like photo'}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        isLiked
                          ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-red-400'
                      } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Heart
                        className={`h-4 w-4 transition-all ${
                          isLiked ? 'fill-red-500 text-red-500' : ''
                        } ${isToggling ? 'animate-pulse' : ''}`}
                      />
                      {heartCount > 0 && (
                        <span>{heartCount}</span>
                      )}
                      {heartCount === 0 && !isLiked && (
                        <span>Love it</span>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

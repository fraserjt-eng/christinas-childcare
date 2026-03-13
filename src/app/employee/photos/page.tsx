'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Upload,
  X,
  CheckCircle2,
  ImagePlus,
  Loader2,
} from 'lucide-react';
import { createPhoto, ACTIVITY_LABELS, ActivityType } from '@/lib/photo-storage';
import { getClassrooms } from '@/lib/food-storage';
import { Classroom } from '@/types/food';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PhotoDraft {
  file: File;
  previewUrl: string;
  activityType: ActivityType;
  caption: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeePhotosPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [drafts, setDrafts] = useState<PhotoDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load classrooms ────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      const rooms = await getClassrooms({ active_only: true });
      setClassrooms(rooms);
      if (rooms.length > 0) {
        setSelectedClassroomId(rooms[0].id);
      }
    }
    load();
  }, []);

  // ── File selection ─────────────────────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = 5 - drafts.length;
    const toAdd = files.slice(0, remaining);

    const newDrafts: PhotoDraft[] = await Promise.all(
      toAdd.map(async (file) => ({
        file,
        previewUrl: await readFileAsDataUrl(file),
        activityType: 'free_play' as ActivityType,
        caption: '',
      }))
    );

    setDrafts((prev) => [...prev, ...newDrafts]);

    // Reset input so the same files can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  // ── Per-draft updates ──────────────────────────────────────────────────────

  function updateDraftActivity(index: number, value: ActivityType) {
    setDrafts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, activityType: value } : d))
    );
  }

  function updateDraftCaption(index: number, value: string) {
    setDrafts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, caption: value } : d))
    );
  }

  function removeDraft(index: number) {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (drafts.length === 0 || !selectedClassroomId) return;

    setSubmitting(true);

    const classroom = classrooms.find((c) => c.id === selectedClassroomId);
    const classroomName = classroom?.name || 'Unknown Classroom';

    try {
      await Promise.all(
        drafts.map((draft) =>
          createPhoto({
            classroom_id: selectedClassroomId,
            classroom_name: classroomName,
            employee_id: 'demo-employee-1',
            employee_name: 'Demo Employee',
            photo_url: draft.previewUrl,
            caption: draft.caption || undefined,
            activity_type: draft.activityType,
          })
        )
      );

      setUploadCount(drafts.length);
      setDrafts([]);
      setSubmitted(true);
    } catch (err) {
      console.error('Error uploading photos:', err);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Reset after success ────────────────────────────────────────────────────

  function handleUploadMore() {
    setSubmitted(false);
    setUploadCount(0);
  }

  // ─── Success state ─────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 space-y-4">
        <div className="rounded-full bg-christina-green/10 p-5">
          <CheckCircle2 className="h-12 w-12 text-christina-green" />
        </div>
        <h2 className="text-2xl font-bold text-center">Photos Uploaded!</h2>
        <p className="text-muted-foreground text-center">
          {uploadCount} {uploadCount === 1 ? 'photo' : 'photos'} submitted for review.
          Christina will approve them before parents can see them.
        </p>
        <Button
          onClick={handleUploadMore}
          className="bg-christina-red hover:bg-christina-red/90 text-white mt-2"
        >
          <Camera className="h-4 w-4 mr-2" />
          Upload More Photos
        </Button>
      </div>
    );
  }

  // ─── Main form ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Upload Photos</h1>
        <p className="text-muted-foreground mt-1">
          Share moments from the day. Photos are reviewed before parents see them.
        </p>
      </div>

      {/* Classroom selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Classroom</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedClassroomId}
            onChange={(e) => setSelectedClassroomId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {classrooms.length === 0 && (
              <option value="">No classrooms available</option>
            )}
            {classrooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Photo picker */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Photos</CardTitle>
            {drafts.length > 0 && (
              <Badge variant="secondary">
                {drafts.length} of 5 selected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Add photos button */}
          {drafts.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 py-8 text-muted-foreground hover:border-christina-red/40 hover:bg-christina-red/5 transition-colors"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm font-medium">
                {drafts.length === 0 ? 'Select photos from your gallery' : 'Add more photos'}
              </span>
              <span className="text-xs">
                Up to {5 - drafts.length} more photo{5 - drafts.length !== 1 ? 's' : ''}
              </span>
            </button>
          )}

          {/* Draft list */}
          {drafts.length > 0 && (
            <div className="space-y-4">
              {drafts.map((draft, index) => (
                <div
                  key={index}
                  className="rounded-xl border bg-muted/20 overflow-hidden"
                >
                  <div className="flex gap-3 p-3">
                    {/* Thumbnail */}
                    <div className="relative shrink-0">
                      <img
                        src={draft.previewUrl}
                        alt={`Photo ${index + 1}`}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeDraft(index)}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
                        aria-label="Remove photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Fields */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Activity type */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Activity</Label>
                        <select
                          value={draft.activityType}
                          onChange={(e) =>
                            updateDraftActivity(index, e.target.value as ActivityType)
                          }
                          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map((key) => (
                            <option key={key} value={key}>
                              {ACTIVITY_LABELS[key]}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Caption */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Caption{' '}
                          <span className="text-muted-foreground/60">(optional)</span>
                        </Label>
                        <Input
                          value={draft.caption}
                          onChange={(e) => updateDraftCaption(index, e.target.value)}
                          placeholder="What were the kids doing?"
                          className="h-8 text-sm"
                          maxLength={200}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit button */}
      {drafts.length > 0 && (
        <Button
          onClick={handleSubmit}
          disabled={submitting || !selectedClassroomId}
          className="w-full bg-christina-red hover:bg-christina-red/90 text-white h-12 text-base"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading {drafts.length} {drafts.length === 1 ? 'photo' : 'photos'}...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Submit {drafts.length} {drafts.length === 1 ? 'Photo' : 'Photos'} for Review
            </>
          )}
        </Button>
      )}
    </div>
  );
}

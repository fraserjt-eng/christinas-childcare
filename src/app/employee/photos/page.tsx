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
import { ACTIVITY_LABELS, ActivityType } from '@/lib/photo-storage';
import { getClassrooms } from '@/lib/food-storage';
import { Classroom } from '@/types/food';
import { supabase } from '@/lib/supabase';

// Short clips only, to keep Supabase storage + egress cost bounded.
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_SECONDS = 60;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PhotoDraft {
  file: File;
  previewUrl: string;
  activityType: ActivityType;
  caption: string;
  isVideo: boolean;
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

// Read a video's duration from a temporary object URL, so we can reject clips
// over the cap before any upload starts. Resolves null if the browser can't read it.
function getVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(v.duration) ? v.duration : null);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    v.src = url;
  });
}

// Returns an error message if the video is too big or too long, else null.
async function validateVideo(file: File): Promise<string | null> {
  if (file.size > MAX_VIDEO_BYTES) {
    return `That video is too large. Keep it under ${Math.round(MAX_VIDEO_BYTES / 1024 / 1024)}MB.`;
  }
  const dur = await getVideoDuration(file);
  if (dur != null && dur > MAX_VIDEO_SECONDS + 1) {
    return `That video is too long. Keep it under ${MAX_VIDEO_SECONDS} seconds.`;
  }
  return null;
}

const VIDEO_CONTENT_TYPES: Record<string, string> = {
  'video/mp4': 'video/mp4',
  'video/webm': 'video/webm',
  'video/quicktime': 'video/quicktime',
  'video/mov': 'video/quicktime',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeePhotosPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [drafts, setDrafts] = useState<PhotoDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
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
    setErrorMsg('');

    const remaining = 5 - drafts.length;
    const toAdd = files.slice(0, remaining);

    const newDrafts: PhotoDraft[] = [];
    for (const file of toAdd) {
      const isVideo = file.type.startsWith('video/');
      if (isVideo) {
        const err = await validateVideo(file);
        if (err) {
          setErrorMsg(err);
          continue;
        }
        // Object URL for the preview; the File itself is uploaded straight to
        // storage on submit (never read into a data URL — too large for that).
        newDrafts.push({
          file,
          previewUrl: URL.createObjectURL(file),
          activityType: 'free_play',
          caption: '',
          isVideo: true,
        });
      } else {
        newDrafts.push({
          file,
          previewUrl: await readFileAsDataUrl(file),
          activityType: 'free_play',
          caption: '',
          isVideo: false,
        });
      }
    }

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
    setErrorMsg('');

    const classroom = classrooms.find((c) => c.id === selectedClassroomId);
    const classroomName = classroom?.name || '';

    try {
      // Photos ride in the JSON body as small data URLs. Videos are too large
      // for that, so each uploads straight to storage via a server-minted signed
      // URL, and we record only its path. Both then post to /api/employee/photos,
      // which tags the classroom's children for owner approval.
      const items: Array<Record<string, unknown>> = [];
      for (const draft of drafts) {
        if (draft.isVideo) {
          const contentType = VIDEO_CONTENT_TYPES[draft.file.type] || 'video/mp4';
          const urlRes = await fetch('/api/employee/media-upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classroom_id: selectedClassroomId, content_type: contentType }),
          });
          const urlJson = await urlRes.json().catch(() => ({}));
          if (!urlRes.ok || !urlJson.path || !urlJson.token) {
            throw new Error(urlJson.error || 'Could not start the video upload.');
          }
          const up = await supabase.storage
            .from('child_photos')
            .uploadToSignedUrl(urlJson.path, urlJson.token, draft.file, { contentType });
          if (up.error) {
            throw new Error('The video upload failed. Please try again.');
          }
          items.push({
            storage_path: urlJson.path,
            media_type: 'video',
            activity_type: draft.activityType,
            caption: draft.caption || undefined,
          });
        } else {
          items.push({
            photo_data: draft.previewUrl,
            activity_type: draft.activityType,
            caption: draft.caption || undefined,
          });
        }
      }

      const res = await fetch('/api/employee/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroom_id: selectedClassroomId,
          classroom_name: classroomName,
          photos: items,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Upload failed. Please try again.');
      }

      setUploadCount(json.count ?? drafts.length);
      setDrafts([]);
      setSubmitted(true);
    } catch (err) {
      console.error('Error uploading photos:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed. Please try again.');
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
        <h1 className="text-2xl font-bold">Upload Photos &amp; Video</h1>
        <p className="text-muted-foreground mt-1">
          Share moments from the day: photos or a short video (up to 60 seconds). Everything is
          reviewed before parents see it.
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
            accept="image/*,video/*"
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
                      {draft.isVideo ? (
                        <video
                          src={draft.previewUrl}
                          className="h-20 w-20 rounded-lg object-cover bg-black"
                          muted
                          playsInline
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={draft.previewUrl}
                          alt={`Photo ${index + 1}`}
                          className="h-20 w-20 rounded-lg object-cover"
                          loading="lazy"
                        />
                      )}
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
                          Description{' '}
                          <span className="text-muted-foreground/60">(what are they doing?)</span>
                        </Label>
                        <Input
                          value={draft.caption}
                          onChange={(e) => updateDraftCaption(index, e.target.value)}
                          placeholder="e.g. Building block towers at free play"
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

      {errorMsg && (
        <p className="text-sm text-christina-coral text-center" role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  );
}

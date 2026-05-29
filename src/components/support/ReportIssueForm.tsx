'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Square, Trash2, ImagePlus } from 'lucide-react';
import { useAudioRecorder } from '@/lib/support/useAudioRecorder';
import { compressImage } from '@/lib/support/compressImage';
import { captureContext } from '@/lib/support/captureContext';

export function ReportIssueForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const rec = useAudioRecorder();

  const canSubmit =
    subject.trim().length > 0 &&
    (description.trim().length > 0 || rec.result !== null || image !== null) &&
    !submitting;

  async function submit() {
    setErr(null);
    setSubmitting(true);
    try {
      const ctx = captureContext();
      const fd = new FormData();
      fd.set('subject', subject.trim());
      fd.set('description', description.trim());
      fd.set('page_url', ctx.page_url);
      fd.set('viewport', ctx.viewport);
      if (rec.result) {
        const ext = rec.result.mime.includes('mp4')
          ? 'mp4'
          : rec.result.mime.includes('ogg')
          ? 'ogg'
          : 'webm';
        fd.set('audio', new File([rec.result.blob], `audio.${ext}`, { type: rec.result.mime }));
      }
      if (image) {
        const blob = await compressImage(image);
        fd.set('image', new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
      }
      const res = await fetch('/api/support/tickets', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('failed');
      setDone(true);
      if (onSubmitted) onSubmitted();
    } catch {
      setErr('Something went wrong sending your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="p-2 text-sm">
        <p className="font-medium text-foreground">Thanks. Your report was sent.</p>
        <p className="text-muted-foreground mt-1">
          We will take a look. You can track it under Report an Issue in your menu.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">What is the issue?</label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Short summary"
          maxLength={200}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          Tell us more <span className="text-muted-foreground">(optional if you record or add a photo)</span>
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What happened? What were you trying to do?"
          rows={4}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Voice memo (optional)</label>
        <div className="flex items-center gap-2 flex-wrap">
          {!rec.recording && !rec.result && (
            <Button type="button" variant="outline" size="sm" onClick={rec.start}>
              <Mic className="h-4 w-4 mr-1" /> Record
            </Button>
          )}
          {rec.recording && (
            <Button type="button" variant="destructive" size="sm" onClick={rec.stop}>
              <Square className="h-4 w-4 mr-1" /> Stop
            </Button>
          )}
          {rec.result && (
            <>
              <audio src={rec.result.url} controls className="h-9 max-w-[200px]" />
              <Button type="button" variant="ghost" size="sm" onClick={rec.clear}>
                <Trash2 className="h-4 w-4 mr-1" /> Re-record
              </Button>
            </>
          )}
        </div>
        {rec.error && <p className="text-xs text-christina-coral">{rec.error}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          <span className="inline-flex items-center gap-1">
            <ImagePlus className="h-4 w-4" /> Screenshot or photo (optional)
          </span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
          className="block text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
        {image && <p className="text-xs text-muted-foreground">{image.name}</p>}
      </div>

      {err && <p className="text-sm text-christina-coral">{err}</p>}

      <Button
        type="button"
        disabled={!canSubmit}
        onClick={submit}
        className="bg-christina-red hover:bg-christina-red/90 text-white"
      >
        {submitting ? 'Sending…' : 'Send report'}
      </Button>
    </div>
  );
}

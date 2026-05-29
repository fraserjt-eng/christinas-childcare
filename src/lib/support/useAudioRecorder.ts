'use client';

import { useCallback, useRef, useState } from 'react';

// Pick a mime the browser actually supports. iOS Safari prefers mp4; most
// others take webm. Empty string lets MediaRecorder choose its default.
function pickMime(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = ['audio/webm', 'audio/mp4', 'audio/ogg'];
  for (const m of candidates) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
}

export interface AudioRecording {
  blob: Blob;
  url: string;
  mime: string;
  seconds: number;
}

export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<AudioRecording | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMime();
      const rec = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const mimeOut = rec.mimeType || mime || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeOut });
        const seconds = Math.round((Date.now() - startedRef.current) / 1000);
        setResult({ blob, url: URL.createObjectURL(blob), mime: mimeOut, seconds });
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };
      startedRef.current = Date.now();
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch {
      setError('Microphone access was blocked. You can still type or add a photo.');
    }
  }, []);

  const stop = useCallback(() => {
    if (recRef.current && recRef.current.state !== 'inactive') {
      recRef.current.stop();
    }
    setRecording(false);
  }, []);

  const clear = useCallback(() => {
    setResult((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
  }, []);

  return { recording, result, error, start, stop, clear };
}

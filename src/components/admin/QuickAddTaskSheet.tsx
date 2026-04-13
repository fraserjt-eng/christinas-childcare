'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Flame, ArrowUp, Minus, ArrowDown } from 'lucide-react';
import { TaskPriority } from '@/types/tasks';

// Minimal shape of a Web Speech API recognizer — browsers prefix differently
interface MinimalSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => MinimalSpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export interface QuickTaskData {
  title: string;
  done_standard: string;
  priority: TaskPriority;
  assigned_to: string;
}

interface QuickAddTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: QuickTaskData) => void;
  staffOptions?: string[];
}

export function QuickAddTaskSheet({
  open,
  onOpenChange,
  onSave,
  staffOptions = [],
}: QuickAddTaskSheetProps) {
  const [title, setTitle] = useState('');
  const [doneStandard, setDoneStandard] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [assignedTo, setAssignedTo] = useState('');

  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);
  const supportsSpeech = !!getSpeechRecognition();

  useEffect(() => {
    return () => {
      // Clean up any active recognition on unmount
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  function resetForm() {
    setTitle('');
    setDoneStandard('');
    setPriority('normal');
    setAssignedTo('');
    setVoiceError('');
    setListening(false);
  }

  function startDictation() {
    const Rec = getSpeechRecognition();
    if (!Rec) {
      setVoiceError('Voice dictation is not supported in this browser.');
      return;
    }
    try {
      const rec = new Rec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          if (result.isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }
        setTitle((prev) => {
          // Append the best-known transcript to whatever is already typed
          const base = prev.endsWith(' ') || prev.length === 0 ? prev : prev + ' ';
          return base + (final || interim);
        });
      };

      rec.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceError('Microphone access blocked. Enable it in your browser settings.');
        } else if (event.error !== 'no-speech') {
          setVoiceError(`Voice error: ${event.error}`);
        }
        setListening(false);
      };

      rec.onend = () => {
        setListening(false);
      };

      rec.start();
      recognitionRef.current = rec;
      setVoiceError('');
      setListening(true);
    } catch (e) {
      console.error('Speech recognition failed to start:', e);
      setVoiceError('Could not start microphone. Try again.');
      setListening(false);
    }
  }

  function stopDictation() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setListening(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    onSave({
      title: cleanTitle,
      done_standard: doneStandard.trim(),
      priority,
      assigned_to: assignedTo.trim(),
    });

    resetForm();
    onOpenChange(false);
  }

  const priorityOptions: { value: TaskPriority; icon: React.ReactNode; label: string; color: string }[] = [
    { value: 'urgent', icon: <Flame className="h-4 w-4" />, label: 'Urgent', color: 'bg-christina-coral' },
    { value: 'high', icon: <ArrowUp className="h-4 w-4" />, label: 'High', color: 'bg-christina-yellow' },
    { value: 'normal', icon: <Minus className="h-4 w-4" />, label: 'Normal', color: 'bg-christina-blue' },
    { value: 'low', icon: <ArrowDown className="h-4 w-4" />, label: 'Low', color: 'bg-muted-foreground' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quick Add Task</SheetTitle>
          <SheetDescription>
            Type or use the microphone to dictate. Add details after.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="quick-title">Task</Label>
            <div className="flex gap-2">
              <Input
                id="quick-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to happen?"
                className="flex-1 text-base"
                autoFocus
                required
              />
              {supportsSpeech && (
                <Button
                  type="button"
                  variant={listening ? 'default' : 'outline'}
                  size="icon"
                  onClick={listening ? stopDictation : startDictation}
                  aria-label={listening ? 'Stop dictation' : 'Start dictation'}
                  className={listening ? 'bg-christina-red hover:bg-christina-red/90 animate-pulse' : ''}
                >
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
            </div>
            {voiceError && (
              <p className="text-xs text-christina-coral">{voiceError}</p>
            )}
            {listening && (
              <p className="text-xs text-christina-red animate-pulse">Listening...</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-done">Done when... (optional)</Label>
            <Textarea
              id="quick-done"
              value={doneStandard}
              onChange={(e) => setDoneStandard(e.target.value)}
              placeholder="How do we know it's complete?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="grid grid-cols-4 gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border text-xs font-medium transition-colors ${
                    priority === opt.value
                      ? `${opt.color} text-white border-transparent`
                      : 'bg-background hover:bg-muted border-border'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {staffOptions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="quick-assignee">Assign to (optional)</Label>
              <select
                id="quick-assignee"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Unassigned</option>
                {staffOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t sticky bottom-0 bg-background pb-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-christina-red hover:bg-christina-red/90"
              disabled={!title.trim()}
            >
              Add Task
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

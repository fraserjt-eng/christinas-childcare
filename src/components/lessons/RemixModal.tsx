'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shuffle, Loader2, AlertCircle } from 'lucide-react';
import {
  Lesson,
  AgeGroup,
  LearningDomain,
  AGE_GROUPS,
  LEARNING_DOMAINS,
  AGE_GROUP_LABELS,
  DOMAIN_LABELS,
} from '@/types/curriculum';

interface RemixModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseLesson: Lesson | null;
  onRemix: (data: {
    baseLessonId: string;
    newAgeGroup: AgeGroup;
    newDuration?: number;
    newDomain?: LearningDomain;
    adaptationNotes?: string;
  }) => Promise<void>;
  isRemixing?: boolean;
  error?: string | null;
}

export function RemixModal({
  open,
  onOpenChange,
  baseLesson,
  onRemix,
  isRemixing = false,
  error,
}: RemixModalProps) {
  const [newAgeGroup, setNewAgeGroup] = useState<AgeGroup>(
    baseLesson?.ageGroup || 'preschool'
  );
  const [newDuration, setNewDuration] = useState(
    baseLesson?.duration?.toString() || '30'
  );
  const [newDomain, setNewDomain] = useState<LearningDomain | undefined>(
    undefined
  );
  const [adaptationNotes, setAdaptationNotes] = useState('');

  const handleRemix = async () => {
    if (!baseLesson) return;

    await onRemix({
      baseLessonId: baseLesson.id,
      newAgeGroup,
      newDuration: parseInt(newDuration, 10),
      newDomain,
      adaptationNotes: adaptationNotes || undefined,
    });
  };

  if (!baseLesson) return null;

  const hasChanges =
    newAgeGroup !== baseLesson.ageGroup ||
    parseInt(newDuration, 10) !== baseLesson.duration ||
    (newDomain && newDomain !== baseLesson.domain);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-christina-blue" />
            Remix Lesson
          </DialogTitle>
          <DialogDescription>
            Adapt &quot;{baseLesson.title}&quot; for a different age group, duration, or
            domain. AI will regenerate appropriate activities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Original Lesson
            </p>
            <p className="font-semibold text-sm">{baseLesson.title}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge className="bg-christina-red/10 text-christina-red text-xs">
                {AGE_GROUP_LABELS[baseLesson.ageGroup].split(' ')[0]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {DOMAIN_LABELS[baseLesson.domain].split(' ')[0]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {baseLesson.duration}m
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Age Group</label>
            <Select
              value={newAgeGroup}
              onValueChange={(v) => setNewAgeGroup(v as AgeGroup)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGE_GROUPS.map((age) => (
                  <SelectItem key={age} value={age}>
                    {AGE_GROUP_LABELS[age]}
                    {age === baseLesson.ageGroup && ' (current)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Duration (minutes)</label>
            <Input
              type="number"
              min="5"
              max="120"
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              New Domain (optional)
            </label>
            <Select
              value={newDomain || ''}
              onValueChange={(v) =>
                setNewDomain(v ? (v as LearningDomain) : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Keep same domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Keep same domain</SelectItem>
                {LEARNING_DOMAINS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {DOMAIN_LABELS[d]}
                    {d === baseLesson.domain && ' (current)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Adaptation Notes (optional)
            </label>
            <Textarea
              placeholder="Any specific adaptations or requirements for the remix..."
              value={adaptationNotes}
              onChange={(e) => setAdaptationNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRemixing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemix}
            disabled={isRemixing || !hasChanges}
            className="bg-christina-blue hover:bg-christina-blue/90"
          >
            {isRemixing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Remixing...
              </>
            ) : (
              <>
                <Shuffle className="h-4 w-4 mr-2" />
                Generate Remix
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

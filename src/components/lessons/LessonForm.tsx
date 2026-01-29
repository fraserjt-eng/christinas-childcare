'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  Sparkles,
  Plus,
  X,
  Loader2,
  Save,
  AlertCircle,
} from 'lucide-react';
import {
  Lesson,
  LessonFormInput,
  AgeGroup,
  LearningDomain,
  AGE_GROUPS,
  LEARNING_DOMAINS,
  AGE_GROUP_LABELS,
  DOMAIN_LABELS,
} from '@/types/curriculum';

interface LessonFormProps {
  initialData?: Partial<Lesson>;
  onSave: (data: LessonFormInput) => Promise<void>;
  onGenerate?: (data: { topic: string; ageGroup: AgeGroup; domain: LearningDomain; duration: number; additionalContext?: string }) => Promise<void>;
  isGenerating?: boolean;
  isSaving?: boolean;
  error?: string | null;
}

export function LessonForm({
  initialData,
  onSave,
  onGenerate,
  isGenerating = false,
  isSaving = false,
  error,
}: LessonFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(initialData?.ageGroup || 'preschool');
  const [domain, setDomain] = useState<LearningDomain>(initialData?.domain || 'cognitive');
  const [duration, setDuration] = useState(initialData?.duration?.toString() || '30');
  const [objectives, setObjectives] = useState<string[]>(initialData?.objectives || ['']);
  const [materials, setMaterials] = useState<string[]>(initialData?.materials || ['']);
  const [additionalContext, setAdditionalContext] = useState('');

  const addObjective = () => setObjectives([...objectives, '']);
  const removeObjective = (index: number) => {
    if (objectives.length > 1) {
      setObjectives(objectives.filter((_, i) => i !== index));
    }
  };
  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  const addMaterial = () => setMaterials([...materials, '']);
  const removeMaterial = (index: number) => {
    if (materials.length > 1) {
      setMaterials(materials.filter((_, i) => i !== index));
    }
  };
  const updateMaterial = (index: number, value: string) => {
    const newMaterials = [...materials];
    newMaterials[index] = value;
    setMaterials(newMaterials);
  };

  const handleSave = async () => {
    const filteredObjectives = objectives.filter((o) => o.trim());
    const filteredMaterials = materials.filter((m) => m.trim());

    await onSave({
      title,
      ageGroup,
      domain,
      duration: parseInt(duration, 10),
      objectives: filteredObjectives,
      materials: filteredMaterials,
    });
  };

  const handleGenerate = async () => {
    if (!onGenerate) return;

    await onGenerate({
      topic: title,
      ageGroup,
      domain,
      duration: parseInt(duration, 10),
      additionalContext: additionalContext || undefined,
    });
  };

  const isValid = title.trim().length >= 3 && objectives.some((o) => o.trim());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-christina-red" />
          {initialData?.id ? 'Edit Lesson' : 'Create New Lesson'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Lesson Title / Topic <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Rainbow Counting Adventure"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/100 characters
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Age Group</label>
            <Select value={ageGroup} onValueChange={(v) => setAgeGroup(v as AgeGroup)}>
              <SelectTrigger>
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                {AGE_GROUPS.map((age) => (
                  <SelectItem key={age} value={age}>
                    {AGE_GROUP_LABELS[age]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Learning Domain</label>
            <Select value={domain} onValueChange={(v) => setDomain(v as LearningDomain)}>
              <SelectTrigger>
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                {LEARNING_DOMAINS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {DOMAIN_LABELS[d]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Duration (minutes)</label>
            <Input
              type="number"
              min="5"
              max="120"
              placeholder="30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Learning Objectives <span className="text-red-500">*</span>
            </label>
            <Button variant="ghost" size="sm" onClick={addObjective}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {objectives.map((obj, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Objective ${index + 1}`}
                  value={obj}
                  onChange={(e) => updateObjective(index, e.target.value)}
                />
                {objectives.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeObjective(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Materials Needed</label>
            <Button variant="ghost" size="sm" onClick={addMaterial}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {materials.map((mat, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Material ${index + 1}`}
                  value={mat}
                  onChange={(e) => updateMaterial(index, e.target.value)}
                />
                {materials.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMaterial(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {onGenerate && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Additional Context for AI (optional)
            </label>
            <Textarea
              placeholder="Add any special requirements, themes, or context for AI generation..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={2}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {onGenerate && (
            <Button
              onClick={handleGenerate}
              disabled={!title.trim() || isGenerating || isSaving}
              className="bg-christina-blue hover:bg-christina-blue/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!isValid || isGenerating || isSaving}
            className="bg-christina-red hover:bg-christina-red/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Lesson
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="text-red-500">*</span> Required fields. AI generation creates a complete 5-segment lesson plan based on your topic.
        </p>
      </CardContent>
    </Card>
  );
}

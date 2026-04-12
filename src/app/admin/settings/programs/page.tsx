'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, ChevronLeft, Save, Check, X, Plus } from 'lucide-react';
import { getContent, setContent, DEFAULT_CONTENT } from '@/lib/site-content-storage';

interface ProgramInfo {
  name: string;
  ageRange: string;
  description: string;
}

const PROGRAM_KEYS = ['infant', 'toddler', 'preschool', 'schoolAge'] as const;
const PROGRAM_COLORS: Record<string, string> = {
  infant: 'text-christina-coral',
  toddler: 'text-christina-blue',
  preschool: 'text-christina-green',
  schoolAge: 'text-christina-red',
};

export default function ProgramsAboutPage() {
  const [mission, setMission] = useState('');
  const [vision, setVision] = useState('');
  const [values, setValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');
  const [programs, setPrograms] = useState<Record<string, ProgramInfo>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const [m, v, vals, infant, toddler, preschool, schoolAge] = await Promise.all([
        getContent<string>('about.mission', DEFAULT_CONTENT['about.mission'] as string),
        getContent<string>('about.vision', DEFAULT_CONTENT['about.vision'] as string),
        getContent<string[]>('about.values', DEFAULT_CONTENT['about.values'] as string[]),
        getContent<ProgramInfo>('programs.infant', DEFAULT_CONTENT['programs.infant'] as ProgramInfo),
        getContent<ProgramInfo>('programs.toddler', DEFAULT_CONTENT['programs.toddler'] as ProgramInfo),
        getContent<ProgramInfo>('programs.preschool', DEFAULT_CONTENT['programs.preschool'] as ProgramInfo),
        getContent<ProgramInfo>('programs.schoolAge', DEFAULT_CONTENT['programs.schoolAge'] as ProgramInfo),
      ]);
      setMission(m);
      setVision(v);
      setValues(vals);
      setPrograms({ infant, toddler, preschool, schoolAge });
    }
    load();
  }, []);

  function updateProgram(key: string, field: keyof ProgramInfo, value: string) {
    setPrograms((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  function addValue() {
    const trimmed = newValue.trim();
    if (trimmed && !values.includes(trimmed)) {
      setValues((prev) => [...prev, trimmed]);
      setNewValue('');
    }
  }

  function removeValue(index: number) {
    setValues((prev) => prev.filter((_, i) => i !== index));
  }

  function handleValueKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue();
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all([
        setContent('about.mission', mission),
        setContent('about.vision', vision),
        setContent('about.values', values),
        ...PROGRAM_KEYS.map((key) =>
          setContent(`programs.${key}`, programs[key])
        ),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-body"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-christina-green/10 rounded-lg">
          <BookOpen className="h-6 w-6 text-christina-green" />
        </div>
        <h1 className="text-2xl font-bold font-heading">Programs &amp; About</h1>
      </div>

      {/* Section A: About */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">About the Center</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mission" className="font-body">Mission Statement</Label>
            <Textarea
              id="mission"
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              placeholder="Your center's mission..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vision" className="font-body">Vision Statement</Label>
            <Textarea
              id="vision"
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              placeholder="Your center's vision..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body">Values</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {values.map((val, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {val}
                  <button
                    onClick={() => removeValue(i)}
                    className="ml-1 hover:text-christina-coral"
                    aria-label={`Remove ${val}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={handleValueKeyDown}
                placeholder="Add a value..."
                className="max-w-xs"
              />
              <Button type="button" variant="outline" size="sm" onClick={addValue}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section B: Programs */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Programs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {PROGRAM_KEYS.map((key) => {
            const program = programs[key];
            if (!program) return null;
            return (
              <div key={key} className="space-y-3 pb-6 border-b last:border-b-0 last:pb-0">
                <span className={`text-sm font-semibold uppercase tracking-wide ${PROGRAM_COLORS[key]} font-heading`}>
                  {key === 'schoolAge' ? 'School Age' : key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="font-body">Program Name</Label>
                    <Input
                      value={program.name}
                      onChange={(e) => updateProgram(key, 'name', e.target.value)}
                      placeholder="Program name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body">Age Range</Label>
                    <Input
                      value={program.ageRange}
                      onChange={(e) => updateProgram(key, 'ageRange', e.target.value)}
                      placeholder="e.g., 6 weeks - 16 months"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-body">Description</Label>
                  <Textarea
                    value={program.description}
                    onChange={(e) => updateProgram(key, 'description', e.target.value)}
                    placeholder="Program description..."
                    rows={2}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="bg-christina-green hover:bg-christina-green/90">
          {saving ? (
            <>Saving...</>
          ) : saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
        {saved && (
          <span className="text-sm text-christina-green font-body">Changes saved successfully.</span>
        )}
      </div>
    </div>
  );
}

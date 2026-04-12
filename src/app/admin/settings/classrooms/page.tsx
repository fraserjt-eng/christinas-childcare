'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { School, ChevronLeft, Save, Check, Plus, Trash2 } from 'lucide-react';
import { getContent, setContent } from '@/lib/site-content-storage';

interface Classroom {
  id: string;
  name: string;
  ageGroup: 'infant' | 'toddler' | 'preschool' | 'school_age';
  capacity: number;
  ratio: string;
}

const DEFAULT_CLASSROOMS: Classroom[] = [
  { id: '1', name: 'Sunshine Room', ageGroup: 'infant', capacity: 8, ratio: '1:4' },
  { id: '2', name: 'Rainbow Room', ageGroup: 'toddler', capacity: 12, ratio: '1:7' },
  { id: '3', name: 'Star Room', ageGroup: 'preschool', capacity: 16, ratio: '1:10' },
  { id: '4', name: 'Explorer Room', ageGroup: 'school_age', capacity: 20, ratio: '1:15' },
];

const AGE_GROUP_LABELS: Record<string, string> = {
  infant: 'Infant',
  toddler: 'Toddler',
  preschool: 'Preschool',
  school_age: 'School Age',
};

const AGE_GROUP_COLORS: Record<string, string> = {
  infant: 'bg-christina-coral/10 text-christina-coral',
  toddler: 'bg-christina-blue/10 text-christina-blue',
  preschool: 'bg-christina-green/10 text-christina-green',
  school_age: 'bg-christina-red/10 text-christina-red',
};

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getContent<Classroom[]>('classrooms', DEFAULT_CLASSROOMS);
      setClassrooms(data && data.length > 0 ? data : DEFAULT_CLASSROOMS);
    }
    load();
  }, []);

  function updateClassroom(id: string, field: keyof Classroom, value: string | number) {
    setClassrooms((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  function addClassroom() {
    const newId = String(Date.now());
    setClassrooms((prev) => [
      ...prev,
      { id: newId, name: '', ageGroup: 'preschool', capacity: 12, ratio: '1:10' },
    ]);
  }

  function confirmRemove(id: string) {
    if (removing === id) {
      setClassrooms((prev) => prev.filter((c) => c.id !== id));
      setRemoving(null);
    } else {
      setRemoving(id);
    }
  }

  function cancelRemove() {
    setRemoving(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await setContent('classrooms', classrooms);
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-christina-blue/10 rounded-lg">
            <School className="h-6 w-6 text-christina-blue" />
          </div>
          <h1 className="text-2xl font-bold font-heading">Classrooms</h1>
        </div>
        <Button onClick={addClassroom} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Classroom
        </Button>
      </div>

      <div className="space-y-4">
        {classrooms.map((room) => (
          <Card key={room.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className={AGE_GROUP_COLORS[room.ageGroup]}>
                  {AGE_GROUP_LABELS[room.ageGroup]}
                </Badge>
                {removing === room.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-christina-coral font-body">Remove this room?</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmRemove(room.id)}
                    >
                      Yes, Remove
                    </Button>
                    <Button variant="outline" size="sm" onClick={cancelRemove}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-christina-coral"
                    onClick={() => confirmRemove(room.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label className="font-body">Room Name</Label>
                  <Input
                    value={room.name}
                    onChange={(e) => updateClassroom(room.id, 'name', e.target.value)}
                    placeholder="Room name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-body">Age Group</Label>
                  <Select
                    value={room.ageGroup}
                    onValueChange={(val) => updateClassroom(room.id, 'ageGroup', val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infant">Infant</SelectItem>
                      <SelectItem value="toddler">Toddler</SelectItem>
                      <SelectItem value="preschool">Preschool</SelectItem>
                      <SelectItem value="school_age">School Age</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-body">Capacity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={room.capacity}
                    onChange={(e) => updateClassroom(room.id, 'capacity', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-body">Staff Ratio</Label>
                  <Input
                    value={room.ratio}
                    onChange={(e) => updateClassroom(room.id, 'ratio', e.target.value)}
                    placeholder="1:4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {classrooms.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground font-body">
              No classrooms configured. Click &ldquo;Add Classroom&rdquo; to get started.
            </CardContent>
          </Card>
        )}
      </div>

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

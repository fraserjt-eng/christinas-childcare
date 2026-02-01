'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Save, Loader2, Plus, Pencil, Trash2, Settings } from 'lucide-react';
import {
  Classroom,
  AgeGroup,
  AGE_GROUP_LABELS,
} from '@/types/food';
import {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
} from '@/lib/food-storage';

interface ClassroomSettingsProps {
  onUpdate?: () => void;
}

export function ClassroomSettings({ onUpdate }: ClassroomSettingsProps) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedCapacity, setEditedCapacity] = useState(0);
  const [editedAgeGroup, setEditedAgeGroup] = useState<AgeGroup>('preschool');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newClassroom, setNewClassroom] = useState({
    name: '',
    capacity: 16,
    age_group: 'preschool' as AgeGroup,
  });

  useEffect(() => {
    loadClassrooms();
  }, []);

  async function loadClassrooms() {
    setLoading(true);
    const data = await getClassrooms();
    setClassrooms(data);
    setLoading(false);
  }

  const startEditing = (classroom: Classroom) => {
    setEditingId(classroom.id);
    setEditedName(classroom.name);
    setEditedCapacity(classroom.capacity);
    setEditedAgeGroup(classroom.age_group);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedName('');
    setEditedCapacity(0);
    setEditedAgeGroup('preschool');
  };

  const saveClassroom = async (id: string) => {
    setSaving(true);
    try {
      await updateClassroom(id, {
        name: editedName,
        capacity: editedCapacity,
        age_group: editedAgeGroup,
      });
      await loadClassrooms();
      setEditingId(null);
      onUpdate?.();
    } catch (error) {
      console.error('Error saving classroom:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddClassroom = async () => {
    if (!newClassroom.name.trim()) return;

    setSaving(true);
    try {
      await createClassroom({
        name: newClassroom.name.trim(),
        capacity: newClassroom.capacity,
        age_group: newClassroom.age_group,
        is_active: true,
      });
      await loadClassrooms();
      setShowAddDialog(false);
      setNewClassroom({ name: '', capacity: 16, age_group: 'preschool' });
      onUpdate?.();
    } catch (error) {
      console.error('Error creating classroom:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClassroom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this classroom?')) return;

    try {
      await deleteClassroom(id);
      await loadClassrooms();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting classroom:', error);
    }
  };

  const toggleActive = async (classroom: Classroom) => {
    try {
      await updateClassroom(classroom.id, { is_active: !classroom.is_active });
      await loadClassrooms();
      onUpdate?.();
    } catch (error) {
      console.error('Error toggling classroom:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Classroom Settings
          </CardTitle>
          <CardDescription>
            Customize classroom names, capacities, and age groups
          </CardDescription>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Classroom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Classroom</DialogTitle>
              <DialogDescription>
                Create a new classroom for tracking food counts
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="new-name">Classroom Name</Label>
                <Input
                  id="new-name"
                  placeholder="e.g., Little Stars, Butterflies..."
                  value={newClassroom.name}
                  onChange={(e) =>
                    setNewClassroom({ ...newClassroom, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-capacity">Capacity</Label>
                <Input
                  id="new-capacity"
                  type="number"
                  min="1"
                  max="50"
                  value={newClassroom.capacity}
                  onChange={(e) =>
                    setNewClassroom({
                      ...newClassroom,
                      capacity: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-age-group">Age Group</Label>
                <Select
                  value={newClassroom.age_group}
                  onValueChange={(value) =>
                    setNewClassroom({
                      ...newClassroom,
                      age_group: value as AgeGroup,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AGE_GROUP_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddClassroom}
                disabled={!newClassroom.name.trim() || saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Add Classroom
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {classrooms.map((classroom) => (
            <div
              key={classroom.id}
              className={`flex items-center justify-between p-3 border rounded-lg ${
                !classroom.is_active ? 'opacity-50 bg-muted/50' : ''
              }`}
            >
              {editingId === classroom.id ? (
                <div className="flex-1 flex items-center gap-3">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="max-w-[200px]"
                    placeholder="Classroom name"
                  />
                  <Input
                    type="number"
                    value={editedCapacity}
                    onChange={(e) =>
                      setEditedCapacity(parseInt(e.target.value) || 0)
                    }
                    className="w-20"
                    min="1"
                    max="50"
                  />
                  <Select
                    value={editedAgeGroup}
                    onValueChange={(value) =>
                      setEditedAgeGroup(value as AgeGroup)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AGE_GROUP_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveClassroom(classroom.id)}
                      disabled={saving || !editedName.trim()}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{classroom.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {AGE_GROUP_LABELS[classroom.age_group]} | Capacity:{' '}
                        {classroom.capacity}
                      </p>
                    </div>
                    {!classroom.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing(classroom)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(classroom)}
                    >
                      {classroom.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClassroom(classroom.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {classrooms.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No classrooms configured. Add your first classroom above.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

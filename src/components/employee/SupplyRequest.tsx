'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, Package, AlertCircle } from 'lucide-react';
import { createRequest } from '@/lib/supply-inventory-storage';

const CLASSROOMS = [
  'Bumblebees (Infant)',
  'Ladybugs (2-3yr)',
  'Butterflies (3-4yr)',
  'Sunflowers (PreK)',
  'Office / Common Area',
  'Kitchen',
  'Outdoor / Playground',
];

const URGENCY_OPTIONS = [
  { value: 'today', label: 'Today — needed before end of day', color: 'text-red-600' },
  { value: 'this_week', label: 'This Week — within the next 5 days', color: 'text-yellow-600' },
  { value: 'routine', label: 'Routine — next regular supply order', color: 'text-blue-600' },
] as const;

interface SupplyRequestFormProps {
  staffName?: string;
}

export function SupplyRequestForm({ staffName = 'Staff Member' }: SupplyRequestFormProps) {
  const [itemName, setItemName] = useState('');
  const [classroom, setClassroom] = useState('');
  const [urgency, setUrgency] = useState<'today' | 'this_week' | 'routine'>('routine');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!itemName.trim()) {
      setError('Please enter the item name.');
      return;
    }
    if (!classroom) {
      setError('Please select your classroom.');
      return;
    }

    setSubmitting(true);
    try {
      await createRequest({
        item_name: itemName.trim(),
        requested_by: staffName,
        classroom,
        urgency,
        notes: notes.trim() || undefined,
      });
      setSuccess(true);
      setItemName('');
      setClassroom('');
      setUrgency('routine');
      setNotes('');
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
          <p className="text-lg font-semibold">Request submitted</p>
          <p className="text-sm text-muted-foreground mt-1">
            Christina will review your request and respond shortly.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => setSuccess(false)}
          >
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Package className="h-5 w-5 text-[#C62828]" />
          <h2 className="font-semibold text-lg">Supply Request</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="item-name">
              Item Needed <span className="text-red-500">*</span>
            </Label>
            <Input
              id="item-name"
              placeholder="e.g. Washable markers, Paper towels, Glue sticks"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classroom">
              Your Classroom / Area <span className="text-red-500">*</span>
            </Label>
            <Select value={classroom} onValueChange={setClassroom} disabled={submitting}>
              <SelectTrigger id="classroom">
                <SelectValue placeholder="Select your classroom" />
              </SelectTrigger>
              <SelectContent>
                {CLASSROOMS.map((room) => (
                  <SelectItem key={room} value={room}>{room}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>How soon do you need this?</Label>
            <div className="space-y-2">
              {URGENCY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    urgency === option.value
                      ? 'border-[#C62828] bg-[#C62828]/5'
                      : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value={option.value}
                    checked={urgency === option.value}
                    onChange={() => setUrgency(option.value)}
                    className="mt-0.5"
                    disabled={submitting}
                  />
                  <span className={`text-sm font-medium ${urgency === option.value ? option.color : ''}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any details that would help — quantity needed, specific brand, reason, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || !itemName.trim() || !classroom}
            className="w-full bg-[#C62828] hover:bg-[#b71c1c] text-white"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

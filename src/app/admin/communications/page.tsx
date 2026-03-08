'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Mail,
  Plus,
  ArrowLeft,
  X,
  Sparkles,
  Send,
  Save,
  Users,
  Briefcase,
  Calendar,
  FileText,
  GripVertical,
  Trash2,
} from 'lucide-react';
import {
  Newsletter,
  NewsletterSection,
  generateNewsletterId,
  generateSectionId,
} from '@/types/communications';

// ─── Helpers ────────────────────────────────────────────────────────

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatWeekOf(dateString: string): string {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusColor(status: Newsletter['status']): string {
  switch (status) {
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'sent':
      return 'bg-green-100 text-green-800';
  }
}

function getAudienceColor(audience: Newsletter['audience']): string {
  switch (audience) {
    case 'parent':
      return 'bg-purple-100 text-purple-800';
    case 'staff':
      return 'bg-teal-100 text-teal-800';
  }
}

function snippetFromSections(sections: NewsletterSection[]): string {
  if (sections.length === 0) return 'No content yet.';
  const first = sections[0];
  const text = first.body || '';
  return text.length > 120 ? text.slice(0, 120) + '...' : text;
}

// ─── Seed Data ──────────────────────────────────────────────────────

const SEED_NEWSLETTERS: Newsletter[] = [
  {
    id: 'nl_seed_parent_1',
    title: 'Sunshine Weekly Update',
    audience: 'parent',
    status: 'sent',
    week_of: '2026-03-02',
    content_sections: [
      {
        id: 'sec_p1_1',
        heading: 'Welcome Back from Spring Break!',
        body: 'We hope everyone had a wonderful break. This week we are easing back into routines with some fun spring-themed activities. Please make sure your child has weather-appropriate clothing as we will be spending more time outdoors now that the temperatures are warming up.',
        sort_order: 1,
      },
      {
        id: 'sec_p1_2',
        heading: 'Important Reminders',
        body: 'Picture day is this Friday, March 6th. Order forms were sent home last week. If you need another copy, please ask your classroom teacher. Also, tuition payments for March are due by the 10th.',
        sort_order: 2,
      },
      {
        id: 'sec_p1_3',
        heading: 'What We Are Learning',
        body: 'This week our theme is "Growing Things." Children will be planting seeds, reading books about gardens, and exploring nature during outdoor time. The Butterflies room will also be starting a new art project using pressed flowers.',
        sort_order: 3,
      },
    ],
    menu_summary: 'Monday: Chicken nuggets with peas. Tuesday: Pasta with marinara. Wednesday: Turkey sandwiches. Thursday: Rice and beans. Friday: Pizza day!',
    classroom_highlights: [
      'Sunflowers class completed their color wheel project.',
      'Butterflies class welcomed a new friend, Aiden.',
      'Ladybugs class has been practicing letter sounds.',
    ],
    upcoming_events: [
      { title: 'Picture Day', date: '2026-03-06' },
      { title: 'Parent-Teacher Conferences', date: '2026-03-20' },
      { title: 'Spring Festival', date: '2026-04-10' },
    ],
    ai_generated: false,
    created_by: 'Christina Davis',
    created_at: '2026-03-01T09:00:00Z',
    updated_at: '2026-03-02T08:00:00Z',
  },
  {
    id: 'nl_seed_staff_1',
    title: 'Staff Weekly Briefing',
    audience: 'staff',
    status: 'sent',
    week_of: '2026-03-02',
    content_sections: [
      {
        id: 'sec_s1_1',
        heading: 'This Week at a Glance',
        body: 'We have a full week ahead. Picture day is Friday, so please plan your classroom activities around the photography schedule. Morning sessions will be photographed first, followed by afternoon groups. Make sure all children have their name tags visible.',
        sort_order: 1,
      },
      {
        id: 'sec_s1_2',
        heading: 'Professional Development',
        body: 'The online training module on "Positive Guidance Strategies" must be completed by all staff before March 15th. You can access it through the training portal. This counts toward your annual licensing hours.',
        sort_order: 2,
      },
    ],
    teaching_focus: 'This week we are focusing on the "Growing Things" theme across all classrooms. Lesson plans should incorporate plant life cycles, nature exploration, and sensory activities with soil and seeds. Art supplies for pressed flower projects have been ordered and will arrive Tuesday.',
    policy_reminders: [
      'All incident reports must be filed within 2 hours of the incident.',
      'Please clock in and out accurately. Timecard corrections must be submitted by Friday.',
      'Outdoor supervision ratios must be maintained at all times.',
    ],
    announcements: [
      'Staff meeting moved to Wednesday at 5:30 PM this week.',
      'New first aid kits have been placed in each classroom. Please check yours.',
      'We are hiring for a part-time aide position. Referral bonus of $200 is available.',
    ],
    ai_generated: false,
    created_by: 'Christina Davis',
    created_at: '2026-03-01T08:00:00Z',
    updated_at: '2026-03-02T07:30:00Z',
  },
];

// ─── Storage ────────────────────────────────────────────────────────

const STORAGE_KEY = 'christinas_newsletters';

function loadNewsletters(): Newsletter[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NEWSLETTERS));
    return SEED_NEWSLETTERS;
  }
  try {
    return JSON.parse(raw) as Newsletter[];
  } catch {
    return [];
  }
}

function saveNewsletters(newsletters: Newsletter[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newsletters));
}

// ─── Newsletter Form ────────────────────────────────────────────────

interface NewsletterFormData {
  audience: Newsletter['audience'];
  title: string;
  week_of: string;
  sections: { id: string; heading: string; body: string }[];
  menu_summary: string;
  classroom_highlights: string[];
  upcoming_events: { title: string; date: string }[];
  teaching_focus: string;
  policy_reminders: string[];
  announcements: string[];
}

function getDefaultFormData(audience: Newsletter['audience']): NewsletterFormData {
  const baseSections =
    audience === 'parent'
      ? [
          { id: generateSectionId(), heading: 'Welcome', body: '' },
          { id: generateSectionId(), heading: 'What We Are Learning', body: '' },
        ]
      : [
          { id: generateSectionId(), heading: 'This Week at a Glance', body: '' },
          { id: generateSectionId(), heading: 'Important Updates', body: '' },
        ];

  return {
    audience,
    title: '',
    week_of: new Date().toISOString().split('T')[0],
    sections: baseSections,
    menu_summary: '',
    classroom_highlights: [''],
    upcoming_events: [{ title: '', date: '' }],
    teaching_focus: '',
    policy_reminders: [''],
    announcements: [''],
  };
}

function NewsletterForm({
  initialData,
  onSaveDraft,
  onMarkSent,
  onCancel,
}: {
  initialData?: Newsletter;
  onSaveDraft: (newsletter: Newsletter) => void;
  onMarkSent: (newsletter: Newsletter) => void;
  onCancel: () => void;
}) {
  const [showAiMessage, setShowAiMessage] = useState(false);
  const [form, setForm] = useState<NewsletterFormData>(() => {
    if (initialData) {
      return {
        audience: initialData.audience,
        title: initialData.title,
        week_of: initialData.week_of,
        sections: initialData.content_sections.map((s) => ({
          id: s.id,
          heading: s.heading,
          body: s.body,
        })),
        menu_summary: initialData.menu_summary || '',
        classroom_highlights: initialData.classroom_highlights?.length
          ? initialData.classroom_highlights
          : [''],
        upcoming_events: initialData.upcoming_events?.length
          ? initialData.upcoming_events
          : [{ title: '', date: '' }],
        teaching_focus: initialData.teaching_focus || '',
        policy_reminders: initialData.policy_reminders?.length
          ? initialData.policy_reminders
          : [''],
        announcements: initialData.announcements?.length ? initialData.announcements : [''],
      };
    }
    return getDefaultFormData('parent');
  });

  const switchAudience = (audience: Newsletter['audience']) => {
    if (audience === form.audience) return;
    setForm(getDefaultFormData(audience));
  };

  // Section management
  const addSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [...prev.sections, { id: generateSectionId(), heading: '', body: '' }],
    }));
  };

  const removeSection = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== idx),
    }));
  };

  const updateSection = (idx: number, field: 'heading' | 'body', value: string) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  };

  // Dynamic list helpers
  const addHighlight = () =>
    setForm((prev) => ({ ...prev, classroom_highlights: [...prev.classroom_highlights, ''] }));
  const removeHighlight = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      classroom_highlights: prev.classroom_highlights.filter((_, i) => i !== idx),
    }));
  const updateHighlight = (idx: number, val: string) =>
    setForm((prev) => ({
      ...prev,
      classroom_highlights: prev.classroom_highlights.map((h, i) => (i === idx ? val : h)),
    }));

  const addEvent = () =>
    setForm((prev) => ({
      ...prev,
      upcoming_events: [...prev.upcoming_events, { title: '', date: '' }],
    }));
  const removeEvent = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      upcoming_events: prev.upcoming_events.filter((_, i) => i !== idx),
    }));
  const updateEvent = (idx: number, field: 'title' | 'date', val: string) =>
    setForm((prev) => ({
      ...prev,
      upcoming_events: prev.upcoming_events.map((e, i) =>
        i === idx ? { ...e, [field]: val } : e
      ),
    }));

  const addReminder = () =>
    setForm((prev) => ({ ...prev, policy_reminders: [...prev.policy_reminders, ''] }));
  const removeReminder = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      policy_reminders: prev.policy_reminders.filter((_, i) => i !== idx),
    }));
  const updateReminder = (idx: number, val: string) =>
    setForm((prev) => ({
      ...prev,
      policy_reminders: prev.policy_reminders.map((r, i) => (i === idx ? val : r)),
    }));

  const addAnnouncement = () =>
    setForm((prev) => ({ ...prev, announcements: [...prev.announcements, ''] }));
  const removeAnnouncement = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((_, i) => i !== idx),
    }));
  const updateAnnouncement = (idx: number, val: string) =>
    setForm((prev) => ({
      ...prev,
      announcements: prev.announcements.map((a, i) => (i === idx ? val : a)),
    }));

  const buildNewsletter = (status: Newsletter['status']): Newsletter => {
    const now = new Date().toISOString();
    return {
      id: initialData?.id || generateNewsletterId(),
      title: form.title,
      audience: form.audience,
      status,
      week_of: form.week_of,
      content_sections: form.sections.map((s, i) => ({
        id: s.id,
        heading: s.heading,
        body: s.body,
        sort_order: i + 1,
      })),
      menu_summary: form.audience === 'parent' ? form.menu_summary || undefined : undefined,
      classroom_highlights:
        form.audience === 'parent'
          ? form.classroom_highlights.filter((h) => h.trim())
          : undefined,
      upcoming_events:
        form.audience === 'parent'
          ? form.upcoming_events.filter((e) => e.title.trim())
          : undefined,
      teaching_focus: form.audience === 'staff' ? form.teaching_focus || undefined : undefined,
      policy_reminders:
        form.audience === 'staff'
          ? form.policy_reminders.filter((r) => r.trim())
          : undefined,
      announcements:
        form.audience === 'staff'
          ? form.announcements.filter((a) => a.trim())
          : undefined,
      ai_generated: false,
      created_by: initialData?.created_by || 'Current User',
      created_at: initialData?.created_at || now,
      updated_at: now,
    };
  };

  return (
    <div className="space-y-5">
      {/* AI Generation Placeholder */}
      {showAiMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-amber-800">AI Generation</span>
          </div>
          <p className="text-amber-700">
            AI generation requires API key configuration. Once configured, this feature will
            auto-draft newsletter content based on your center&apos;s recent activities, menu plans,
            and upcoming events.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAiMessage(false)}
            className="mt-2 text-amber-700"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Audience Toggle */}
      {!initialData && (
        <div className="space-y-2">
          <Label>Audience</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={form.audience === 'parent' ? 'default' : 'outline'}
              onClick={() => switchAudience('parent')}
              className={
                form.audience === 'parent' ? 'bg-[#C62828] hover:bg-[#B71C1C] text-white' : ''
              }
            >
              <Users className="h-4 w-4 mr-2" />
              Parent Newsletter
            </Button>
            <Button
              type="button"
              variant={form.audience === 'staff' ? 'default' : 'outline'}
              onClick={() => switchAudience('staff')}
              className={
                form.audience === 'staff' ? 'bg-[#C62828] hover:bg-[#B71C1C] text-white' : ''
              }
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Staff Newsletter
            </Button>
          </div>
        </div>
      )}

      {/* Title and Week */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nl-title">Title *</Label>
          <Input
            id="nl-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={
              form.audience === 'parent' ? 'e.g. Weekly Family Update' : 'e.g. Staff Briefing'
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nl-week">Week Of *</Label>
          <Input
            id="nl-week"
            type="date"
            value={form.week_of}
            onChange={(e) => setForm({ ...form, week_of: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Content Sections</Label>
          <Button type="button" variant="outline" size="sm" onClick={addSection} className="min-h-[44px]">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Section
          </Button>
        </div>
        {form.sections.map((section, idx) => (
          <div key={section.id} className="border rounded-lg p-4 space-y-4 bg-muted/20">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={section.heading}
                onChange={(e) => updateSection(idx, 'heading', e.target.value)}
                placeholder="Section heading"
                className="font-medium"
              />
              {form.sections.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSection(idx)}
                  className="text-muted-foreground hover:text-red-600 shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Textarea
              value={section.body}
              onChange={(e) => updateSection(idx, 'body', e.target.value)}
              placeholder="Section content..."
              rows={3}
            />
          </div>
        ))}
      </div>

      {/* Parent-specific fields */}
      {form.audience === 'parent' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="nl-menu">Menu Summary</Label>
            <Textarea
              id="nl-menu"
              value={form.menu_summary}
              onChange={(e) => setForm({ ...form, menu_summary: e.target.value })}
              placeholder="Monday: ... Tuesday: ... etc."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Classroom Highlights</Label>
              <Button type="button" variant="outline" size="sm" onClick={addHighlight} className="min-h-[44px]">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
            {form.classroom_highlights.map((h, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={h}
                  onChange={(e) => updateHighlight(idx, e.target.value)}
                  placeholder="Highlight from a classroom..."
                />
                {form.classroom_highlights.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHighlight(idx)}
                    className="text-muted-foreground hover:text-red-600 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Upcoming Events</Label>
              <Button type="button" variant="outline" size="sm" onClick={addEvent} className="min-h-[44px]">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
            {form.upcoming_events.map((evt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={evt.title}
                  onChange={(e) => updateEvent(idx, 'title', e.target.value)}
                  placeholder="Event name"
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={evt.date}
                  onChange={(e) => updateEvent(idx, 'date', e.target.value)}
                  className="w-40"
                />
                {form.upcoming_events.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEvent(idx)}
                    className="text-muted-foreground hover:text-red-600 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Staff-specific fields */}
      {form.audience === 'staff' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="nl-focus">Teaching Focus</Label>
            <Textarea
              id="nl-focus"
              value={form.teaching_focus}
              onChange={(e) => setForm({ ...form, teaching_focus: e.target.value })}
              placeholder="Describe the teaching focus or theme for this week..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Policy Reminders</Label>
              <Button type="button" variant="outline" size="sm" onClick={addReminder} className="min-h-[44px]">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
            {form.policy_reminders.map((r, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={r}
                  onChange={(e) => updateReminder(idx, e.target.value)}
                  placeholder="Policy reminder..."
                />
                {form.policy_reminders.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReminder(idx)}
                    className="text-muted-foreground hover:text-red-600 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Announcements</Label>
              <Button type="button" variant="outline" size="sm" onClick={addAnnouncement} className="min-h-[44px]">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
            {form.announcements.map((a, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={a}
                  onChange={(e) => updateAnnouncement(idx, e.target.value)}
                  placeholder="Announcement..."
                />
                {form.announcements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAnnouncement(idx)}
                    className="text-muted-foreground hover:text-red-600 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAiMessage(true)}
          disabled={showAiMessage}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate with AI
        </Button>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onSaveDraft(buildNewsletter('draft'))}
            disabled={!form.title.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={() => onMarkSent(buildNewsletter('sent'))}
            disabled={!form.title.trim()}
            className="bg-[#C62828] hover:bg-[#B71C1C] text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Mark as Sent
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Newsletter Preview ─────────────────────────────────────────────

function NewsletterPreview({
  newsletter,
  onBack,
}: {
  newsletter: Newsletter;
  onBack: () => void;
}) {
  const isParent = newsletter.audience === 'parent';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to List
        </Button>
      </div>

      {/* Newsletter Preview Card */}
      <Card className="max-w-3xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-[#C62828] text-white p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-1 text-white/70 text-sm">
            <Calendar className="h-4 w-4" />
            Week of {formatWeekOf(newsletter.week_of)}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">{newsletter.title}</h2>
          <div className="flex items-center gap-3 mt-3">
            <Badge className={`${getAudienceColor(newsletter.audience)} border-0`}>
              {isParent ? 'Parent Newsletter' : 'Staff Newsletter'}
            </Badge>
            <Badge className={`${getStatusColor(newsletter.status)} border-0`}>
              {newsletter.status.charAt(0).toUpperCase() + newsletter.status.slice(1)}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Logo / Branding area */}
          <div className="text-center pb-4 border-b">
            <h3 className="text-lg font-semibold text-[#C62828]">
              Christina&apos;s Child Care Center
            </h3>
            <p className="text-base text-muted-foreground">
              Nurturing Growth, Building Futures
            </p>
          </div>

          {/* Content Sections */}
          {newsletter.content_sections.map((section) => (
            <div key={section.id} className="space-y-2">
              <h4 className="text-lg font-semibold text-gray-900 border-l-4 border-[#C62828] pl-3">
                {section.heading}
              </h4>
              <p className="text-base leading-relaxed text-gray-700 pl-3">{section.body}</p>
            </div>
          ))}

          {/* Parent-specific content */}
          {isParent && newsletter.menu_summary && (
            <div className="bg-orange-50 rounded-lg p-4 space-y-2">
              <h4 className="text-lg font-semibold text-orange-800 flex items-center gap-2">
                <span>This Week&apos;s Menu</span>
              </h4>
              <p className="text-base text-orange-900 leading-relaxed whitespace-pre-line">
                {newsletter.menu_summary}
              </p>
            </div>
          )}

          {isParent && newsletter.classroom_highlights && newsletter.classroom_highlights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-gray-900 border-l-4 border-[#C62828] pl-3">
                Classroom Highlights
              </h4>
              <ul className="space-y-1.5 pl-3">
                {newsletter.classroom_highlights.map((highlight, i) => (
                  <li key={i} className="text-base text-gray-700 flex items-start gap-2">
                    <span className="text-[#C62828] mt-1 shrink-0">*</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isParent && newsletter.upcoming_events && newsletter.upcoming_events.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <h4 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </h4>
              <div className="space-y-2">
                {newsletter.upcoming_events.map((evt, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-blue-900">{evt.title}</span>
                    <span className="text-blue-700">{formatDate(evt.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staff-specific content */}
          {!isParent && newsletter.teaching_focus && (
            <div className="bg-teal-50 rounded-lg p-4 space-y-2">
              <h4 className="text-lg font-semibold text-teal-800">Teaching Focus</h4>
              <p className="text-base text-teal-900 leading-relaxed">{newsletter.teaching_focus}</p>
            </div>
          )}

          {!isParent && newsletter.policy_reminders && newsletter.policy_reminders.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-gray-900 border-l-4 border-[#C62828] pl-3">
                Policy Reminders
              </h4>
              <ul className="space-y-1.5 pl-3">
                {newsletter.policy_reminders.map((reminder, i) => (
                  <li key={i} className="text-base text-gray-700 flex items-start gap-2">
                    <span className="text-[#C62828] mt-1 shrink-0">*</span>
                    {reminder}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isParent && newsletter.announcements && newsletter.announcements.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-4 space-y-2">
              <h4 className="text-lg font-semibold text-amber-800">Announcements</h4>
              <ul className="space-y-1.5">
                {newsletter.announcements.map((announcement, i) => (
                  <li key={i} className="text-base text-amber-900 flex items-start gap-2">
                    <span className="text-amber-600 mt-1 shrink-0">*</span>
                    {announcement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-4 text-center text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Christina&apos;s Child Care Center</p>
            <p>
              Created by {newsletter.created_by || 'Staff'} on{' '}
              {formatDate(newsletter.created_at)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function CommunicationsPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(null);
  const [previewNewsletterId, setPreviewNewsletterId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('parent');

  useEffect(() => {
    const data = loadNewsletters();
    setNewsletters(data);
    setLoading(false);
  }, []);

  const handleSave = useCallback(
    (newsletter: Newsletter) => {
      let updated: Newsletter[];
      const existing = newsletters.find((n) => n.id === newsletter.id);
      if (existing) {
        updated = newsletters.map((n) => (n.id === newsletter.id ? newsletter : n));
      } else {
        updated = [newsletter, ...newsletters];
      }
      setNewsletters(updated);
      saveNewsletters(updated);
      setDialogOpen(false);
      setEditingNewsletter(null);
    },
    [newsletters]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm('Are you sure you want to delete this newsletter?')) return;
      const updated = newsletters.filter((n) => n.id !== id);
      setNewsletters(updated);
      saveNewsletters(updated);
    },
    [newsletters]
  );

  const previewNewsletter = newsletters.find((n) => n.id === previewNewsletterId) || null;

  const parentNewsletters = newsletters.filter((n) => n.audience === 'parent');
  const staffNewsletters = newsletters.filter((n) => n.audience === 'staff');

  const draftCount = newsletters.filter((n) => n.status === 'draft').length;
  const sentCount = newsletters.filter((n) => n.status === 'sent').length;

  if (loading) {
    return (
      <DashboardLayout isAdmin>
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Loading newsletters...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isAdmin>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Preview Mode */}
        {previewNewsletter ? (
          <NewsletterPreview
            newsletter={previewNewsletter}
            onBack={() => setPreviewNewsletterId(null)}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-[#C62828]" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Communications</h1>
                  <p className="text-muted-foreground">
                    Create and manage newsletters for parents and staff
                  </p>
                </div>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-[#C62828] hover:bg-[#B71C1C] text-white"
                    onClick={() => {
                      setEditingNewsletter(null);
                      setDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Newsletter
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingNewsletter ? 'Edit Newsletter' : 'Create Newsletter'}
                    </DialogTitle>
                  </DialogHeader>
                  <NewsletterForm
                    initialData={editingNewsletter || undefined}
                    onSaveDraft={handleSave}
                    onMarkSent={handleSave}
                    onCancel={() => {
                      setDialogOpen(false);
                      setEditingNewsletter(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{newsletters.length}</div>
                  <p className="text-base text-muted-foreground">Total Newsletters</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-600">
                    {parentNewsletters.length}
                  </div>
                  <p className="text-base text-muted-foreground">Parent Newsletters</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-teal-600">
                    {staffNewsletters.length}
                  </div>
                  <p className="text-base text-muted-foreground">Staff Newsletters</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-baseline gap-3">
                    <div>
                      <span className="text-2xl font-bold text-yellow-600">{draftCount}</span>
                      <span className="text-sm text-muted-foreground ml-1">Drafts</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-green-600">{sentCount}</span>
                      <span className="text-sm text-muted-foreground ml-1">Sent</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="parent" className="flex items-center gap-2 min-h-[44px]">
                  <Users className="h-4 w-4" />
                  Parent ({parentNewsletters.length})
                </TabsTrigger>
                <TabsTrigger value="staff" className="flex items-center gap-2 min-h-[44px]">
                  <Briefcase className="h-4 w-4" />
                  Staff ({staffNewsletters.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="parent" className="mt-4">
                <NewsletterList
                  newsletters={parentNewsletters}
                  onPreview={(id) => setPreviewNewsletterId(id)}
                  onEdit={(nl) => {
                    setEditingNewsletter(nl);
                    setDialogOpen(true);
                  }}
                  onDelete={handleDelete}
                  emptyLabel="parent"
                />
              </TabsContent>

              <TabsContent value="staff" className="mt-4">
                <NewsletterList
                  newsletters={staffNewsletters}
                  onPreview={(id) => setPreviewNewsletterId(id)}
                  onEdit={(nl) => {
                    setEditingNewsletter(nl);
                    setDialogOpen(true);
                  }}
                  onDelete={handleDelete}
                  emptyLabel="staff"
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── Newsletter List Component ──────────────────────────────────────

function NewsletterList({
  newsletters,
  onPreview,
  onEdit,
  onDelete,
  emptyLabel,
}: {
  newsletters: Newsletter[];
  onPreview: (id: string) => void;
  onEdit: (newsletter: Newsletter) => void;
  onDelete: (id: string) => void;
  emptyLabel: string;
}) {
  if (newsletters.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No {emptyLabel} newsletters yet. Create your first one!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {newsletters.map((nl) => (
        <Card key={nl.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={() => onPreview(nl.id)}
                className="flex-1 min-w-0 text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base truncate">{nl.title}</h3>
                  <Badge className={`text-xs shrink-0 ${getStatusColor(nl.status)}`}>
                    {nl.status.charAt(0).toUpperCase() + nl.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Week of {formatWeekOf(nl.week_of)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {nl.content_sections.length} section
                    {nl.content_sections.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-base text-muted-foreground line-clamp-2">
                  {snippetFromSections(nl.content_sections)}
                </p>
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreview(nl.id)}
                  className="text-[#C62828]"
                >
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(nl)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(nl.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

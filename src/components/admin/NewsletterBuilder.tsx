'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Newspaper,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Send,
  Save,
  GripVertical,
  Clock,
  CheckCircle2,
  FileEdit,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  createNewsletter,
  updateNewsletter,
  sendNewsletter,
  generateDefaultSections,
  SECTION_TYPE_LABELS,
  getNewsletters,
} from '@/lib/newsletter-storage';
import type { NewsletterSection, NewsletterStatus } from '@/lib/newsletter-storage';

type SectionType = NewsletterSection['type'];

function generateSectionId() {
  return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

function StatusBadge({ status }: { status: NewsletterStatus }) {
  if (status === 'sent') {
    return (
      <Badge className="bg-christina-green/10 text-christina-green border-christina-green/20 border flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Sent
      </Badge>
    );
  }
  if (status === 'scheduled') {
    return (
      <Badge className="bg-christina-yellow/20 text-yellow-800 border-christina-yellow/30 border flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Scheduled
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
      <FileEdit className="h-3 w-3" />
      Draft
    </Badge>
  );
}

interface SectionEditorProps {
  section: NewsletterSection;
  onChange: (updated: NewsletterSection) => void;
  onDelete: () => void;
  index: number;
  total: number;
}

function SectionEditor({ section, onChange, onDelete, index }: SectionEditorProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card className="border-l-4 border-l-christina-blue/40">
      <CardHeader className="py-2 px-3">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {SECTION_TYPE_LABELS[section.type] ?? section.type}
              </Badge>
            </div>
            <p className="text-sm font-medium truncate mt-0.5">{section.title || 'Untitled section'}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded hover:bg-muted text-muted-foreground"
            >
              {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={onDelete}
              className="p-1 rounded hover:bg-destructive/10 text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent className="px-3 pb-3 space-y-2.5">
          <div className="space-y-1.5">
            <Label className="text-xs">Section Title</Label>
            <Input
              value={section.title}
              onChange={(e) => onChange({ ...section, title: e.target.value })}
              placeholder="Section title..."
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Content</Label>
            <Textarea
              value={section.content_html}
              onChange={(e) => onChange({ ...section, content_html: e.target.value })}
              placeholder="Write section content here..."
              rows={4}
              className="resize-none text-sm"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface PreviewProps {
  subject: string;
  sections: NewsletterSection[];
}

function NewsletterPreview({ subject, sections }: PreviewProps) {
  return (
    <Card className="border-2 border-christina-red/20">
      <CardHeader className="bg-christina-red/5 border-b border-christina-red/10 pb-3">
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Christina&apos;s Child Care Center</p>
          <CardTitle className="text-lg text-christina-red">{subject || 'Newsletter Subject'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {sections.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No sections added yet.</p>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="space-y-2">
              <h3 className="text-base font-semibold text-christina-red border-b border-christina-red/20 pb-1">
                {section.title}
              </h3>
              <div
                className="text-sm prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: section.content_html }}
              />
            </div>
          ))
        )}
        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">Christina&apos;s Child Care Center</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface NewsletterBuilderProps {
  editId?: string;
  onSaved?: (id: string) => void;
}

export function NewsletterBuilder({ editId, onSaved }: NewsletterBuilderProps) {
  const [subject, setSubject] = useState('');
  const [sections, setSections] = useState<NewsletterSection[]>([]);
  const [status, setStatus] = useState<NewsletterStatus>('draft');
  const [scheduledFor, setScheduledFor] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(editId ?? null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [newSectionType, setNewSectionType] = useState<SectionType>('custom');
  const [saveMessage, setSaveMessage] = useState('');

  const loadExisting = useCallback(async (id: string) => {
    const newsletters = await getNewsletters();
    const found = newsletters.find((n) => n.id === id);
    if (found) {
      setSubject(found.subject);
      setSections(found.sections);
      setStatus(found.status);
      if (found.scheduled_for) setScheduledFor(found.scheduled_for);
    }
  }, []);

  useEffect(() => {
    if (editId) {
      loadExisting(editId);
    } else {
      setSections(generateDefaultSections());
    }
  }, [editId, loadExisting]);

  function updateSection(index: number, updated: NewsletterSection) {
    setSections((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  }

  function deleteSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  function addSection() {
    const label = SECTION_TYPE_LABELS[newSectionType] ?? 'New Section';
    const newSection: NewsletterSection = {
      id: generateSectionId(),
      type: newSectionType,
      title: label,
      content_html: '<p>Add content here...</p>',
      order: sections.length,
    };
    setSections((prev) => [...prev, newSection]);
  }

  async function handleSaveDraft() {
    if (!subject.trim()) return;
    setSaving(true);
    try {
      if (currentId) {
        await updateNewsletter(currentId, { subject: subject.trim(), sections, status: 'draft' });
      } else {
        const created = await createNewsletter({
          subject: subject.trim(),
          sections,
          status: 'draft',
          scheduled_for: showSchedule && scheduledFor ? scheduledFor : undefined,
        });
        setCurrentId(created.id);
        onSaved?.(created.id);
      }
      setStatus('draft');
      setSaveMessage('Draft saved.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendNow() {
    if (!subject.trim()) return;
    setSending(true);
    try {
      let id = currentId;
      if (!id) {
        const created = await createNewsletter({
          subject: subject.trim(),
          sections,
          status: 'draft',
        });
        id = created.id;
        setCurrentId(id);
        onSaved?.(id);
      } else {
        await updateNewsletter(id, { subject: subject.trim(), sections });
      }
      await sendNewsletter(id);
      setStatus('sent');
      setSaveMessage('Newsletter sent!');
      setTimeout(() => setSaveMessage(''), 4000);
    } finally {
      setSending(false);
    }
  }

  async function handleSchedule() {
    if (!subject.trim() || !scheduledFor) return;
    setSaving(true);
    try {
      if (currentId) {
        await updateNewsletter(currentId, {
          subject: subject.trim(),
          sections,
          status: 'scheduled',
          scheduled_for: scheduledFor,
        });
      } else {
        const created = await createNewsletter({
          subject: subject.trim(),
          sections,
          status: 'scheduled',
          scheduled_for: scheduledFor,
        });
        setCurrentId(created.id);
        onSaved?.(created.id);
      }
      setStatus('scheduled');
      setSaveMessage('Newsletter scheduled.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  }

  const isSent = status === 'sent';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-christina-red" />
          <h2 className="text-lg font-semibold">
            {currentId ? 'Edit Newsletter' : 'New Newsletter'}
          </h2>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center gap-2">
          {saveMessage && (
            <span className="text-sm text-christina-green flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {saveMessage}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="h-8"
          >
            {showPreview ? (
              <><EyeOff className="h-3.5 w-3.5 mr-1.5" />Hide Preview</>
            ) : (
              <><Eye className="h-3.5 w-3.5 mr-1.5" />Preview</>
            )}
          </Button>
        </div>
      </div>

      <div className={`grid gap-4 ${showPreview ? 'lg:grid-cols-2' : ''}`}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Subject Line</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Week of March 17 — Family Newsletter"
              disabled={isSent}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sections</Label>
              <Badge variant="outline" className="text-xs">{sections.length} sections</Badge>
            </div>
            {sections.map((section, index) => (
              <SectionEditor
                key={section.id}
                section={section}
                onChange={(updated) => updateSection(index, updated)}
                onDelete={() => deleteSection(index)}
                index={index}
                total={sections.length}
              />
            ))}
            {!isSent && (
              <div className="flex gap-2">
                <Select value={newSectionType} onValueChange={(v) => setNewSectionType(v as SectionType)}>
                  <SelectTrigger className="h-8 flex-1 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SECTION_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSection}
                  className="h-8 shrink-0 border-christina-green/40 text-christina-green hover:bg-christina-green/5"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Section
                </Button>
              </div>
            )}
          </div>

          {!isSent && (
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowSchedule(!showSchedule)}
                  >
                    <Clock className="h-4 w-4" />
                    Schedule for later
                    {showSchedule ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {showSchedule && (
                  <div className="space-y-2">
                    <input
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSchedule}
                      disabled={saving || !scheduledFor || !subject.trim()}
                      className="h-8 border-christina-yellow/40 text-yellow-800 hover:bg-christina-yellow/10"
                    >
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      {saving ? 'Scheduling...' : 'Schedule Newsletter'}
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={saving || !subject.trim()}
                    className="h-8"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    {saving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSendNow}
                    disabled={sending || !subject.trim()}
                    className="h-8 bg-christina-red hover:bg-christina-red/90 text-white"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    {sending ? 'Sending...' : 'Send Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {showPreview && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Label>
            <NewsletterPreview subject={subject} sections={sections} />
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  Download,
  Palette,
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
import { RichTextEditor } from './RichTextEditor';
import { sanitizeHTML } from '@/lib/sanitize';

type SectionType = NewsletterSection['type'];

function generateSectionId() {
  return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// ─── Status Badge ──────────────────────────────────────────────────────────

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

// ─── Sortable Section Editor ────────────────────────────────────────────────

interface SectionEditorProps {
  section: NewsletterSection;
  onChange: (updated: NewsletterSection) => void;
  onDelete: () => void;
  index: number;
  disabled?: boolean;
}

function SortableSectionEditor({ section, onChange, onDelete, index, disabled }: SectionEditorProps) {
  const [collapsed, setCollapsed] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sectionColors: Record<string, string> = {
    photos: 'border-l-pink-400',
    events: 'border-l-christina-blue',
    menu: 'border-l-christina-yellow',
    classroom_spotlight: 'border-l-christina-green',
    milestones: 'border-l-purple-400',
    announcements: 'border-l-christina-coral',
    custom: 'border-l-gray-400',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`border-l-4 ${sectionColors[section.type] || 'border-l-christina-blue/40'}`}>
        <CardHeader className="py-2 px-3">
          <div className="flex items-center gap-2">
            <button
              className="touch-none cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/60" />
            </button>
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
              {!disabled && (
                <button
                  onClick={onDelete}
                  className="p-1 rounded hover:bg-destructive/10 text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
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
                disabled={disabled}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Content</Label>
              {disabled ? (
                <div
                  className="text-sm prose-sm max-w-none p-3 border rounded-lg bg-muted/20"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(section.content_html) }}
                />
              ) : (
                <RichTextEditor
                  content={section.content_html}
                  onChange={(html) => onChange({ ...section, content_html: html })}
                  placeholder="Write section content..."
                />
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ─── Branded Preview ────────────────────────────────────────────────────────

interface PreviewProps {
  subject: string;
  sections: NewsletterSection[];
}

function NewsletterPreview({ subject, sections }: PreviewProps) {
  return (
    <Card className="border-2 border-christina-red/20 overflow-hidden">
      {/* Branded header */}
      <div className="bg-gradient-to-r from-christina-red to-christina-red/80 text-white p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Palette className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider opacity-90">
            Christina&apos;s Child Care Center
          </span>
        </div>
        <h2 className="text-xl font-bold">{subject || 'Newsletter Subject'}</h2>
        <p className="text-sm opacity-80 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Content */}
      <CardContent className="p-0">
        {sections.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No sections added yet.</p>
        ) : (
          <div className="divide-y">
            {sections.map((section) => (
              <div key={section.id} className="p-5 space-y-2">
                <h3 className="text-base font-bold text-christina-red flex items-center gap-2">
                  <span className="w-1 h-5 bg-christina-red rounded-full" />
                  {section.title}
                </h3>
                <div
                  className="text-sm prose prose-sm max-w-none prose-headings:text-christina-red prose-a:text-christina-blue"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(section.content_html) }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Branded footer */}
        <div className="bg-gray-50 border-t p-4 text-center space-y-2">
          <p className="text-xs font-semibold text-christina-red">
            Christina&apos;s Child Care Center
          </p>
          <p className="text-xs text-muted-foreground">
            5510 W Broadway Ave, Crystal, MN
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span>Phone: (763) 555-0100</span>
            <span>&middot;</span>
            <span>info@christinaschildcare.com</span>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-2">
            You received this because your family is enrolled at Christina&apos;s Child Care.
            <br />
            Manage notification preferences in your parent dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Builder Component ─────────────────────────────────────────────────

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

  // Drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

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
      content_html: '',
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

  const handleExportPdf = () => {
    // Dynamic import to avoid SSR issues with jspdf
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(198, 40, 40); // christina-red
      doc.text(subject || 'Newsletter', 20, 20);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Christina's Child Care Center", 20, 28);
      doc.text(new Date().toLocaleDateString(), 20, 34);

      let y = 45;
      for (const section of sections) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(13);
        doc.setTextColor(198, 40, 40);
        doc.text(section.title, 20, y);
        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        const stripped = section.content_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const lines = doc.splitTextToSize(stripped, 170);
        doc.text(lines, 20, y);
        y += lines.length * 5 + 10;
      }

      doc.save(`newsletter-${subject.replace(/\s+/g, '-').toLowerCase() || 'draft'}.pdf`);
    });
  };

  const isSent = status === 'sent';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-christina-red" />
          <h2 className="text-lg font-semibold">
            {currentId ? 'Edit Newsletter' : 'New Newsletter'}
          </h2>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {saveMessage && (
            <span className="text-sm text-christina-green flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {saveMessage}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            className="h-8"
            disabled={sections.length === 0}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            PDF
          </Button>
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
        {/* Editor column */}
        <div className="space-y-4">
          {/* Subject */}
          <div className="space-y-1.5">
            <Label>Subject Line</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Week of March 17 — Family Newsletter"
              disabled={isSent}
              className="text-base font-medium"
            />
          </div>

          {/* Sections with drag-and-drop */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sections</Label>
              <Badge variant="outline" className="text-xs">{sections.length} sections</Badge>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {sections.map((section, index) => (
                  <SortableSectionEditor
                    key={section.id}
                    section={section}
                    onChange={(updated) => updateSection(index, updated)}
                    onDelete={() => deleteSection(index)}
                    index={index}
                    disabled={isSent}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Add section */}
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

          {/* Actions */}
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

        {/* Preview column */}
        {showPreview && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Live Preview
            </Label>
            <NewsletterPreview subject={subject} sections={sections} />
          </div>
        )}
      </div>
    </div>
  );
}

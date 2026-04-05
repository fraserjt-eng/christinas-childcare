'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Megaphone,
  MessageSquare,
  FileText,
  Plus,
  Send,
  Search,
  Users,
  User,
  Clock,
  CheckCheck,
  Tag,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import {
  getCommunications,
  createCommunication,
  sendCommunication,
  deleteCommunication,
  getTemplates,
  getReadCounts,
  TEMPLATE_CATEGORIES,
} from '@/lib/comms-storage';
import type {
  Communication,
  CommunicationType,
  AudienceType,
  MessageTemplate,
} from '@/lib/comms-storage';
import { getClassrooms } from '@/lib/food-storage';
import type { Classroom } from '@/types/food';
import { sanitizeHTML } from '@/lib/sanitize';

type StatusFilter = 'all' | 'draft' | 'scheduled' | 'sent';

const TYPE_LABELS: Record<CommunicationType, string> = {
  announcement: 'Announcement',
  individual: 'Individual',
  daily_update: 'Daily Update',
  template: 'Template',
};

const TYPE_COLORS: Record<CommunicationType, string> = {
  announcement: 'bg-christina-blue/10 text-christina-blue border-christina-blue/20',
  individual: 'bg-christina-green/10 text-christina-green border-christina-green/20',
  daily_update: 'bg-christina-yellow/20 text-yellow-800 border-christina-yellow/30',
  template: 'bg-gray-100 text-gray-700 border-gray-200',
};

function getStatusBadge(comm: Communication) {
  if (comm.sent_at) {
    return <Badge className="bg-christina-green/10 text-christina-green border-christina-green/20 border text-xs">Sent</Badge>;
  }
  if (comm.scheduled_for) {
    return <Badge className="bg-christina-yellow/20 text-yellow-800 border-christina-yellow/30 border text-xs">Scheduled</Badge>;
  }
  return <Badge variant="outline" className="text-xs text-muted-foreground">Draft</Badge>;
}

function AudienceIcon({ type }: { type: AudienceType }) {
  if (type === 'all') return <Users className="h-3.5 w-3.5" />;
  if (type === 'classroom') return <Users className="h-3.5 w-3.5" />;
  return <User className="h-3.5 w-3.5" />;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface ComposeFormProps {
  initialSubject?: string;
  initialBody?: string;
  onSent: () => void;
  onCancel: () => void;
  classrooms: Classroom[];
}

function ComposeForm({ initialSubject = '', initialBody = '', onSent, onCancel, classrooms }: ComposeFormProps) {
  const [type, setType] = useState<CommunicationType>('announcement');
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [audienceType, setAudienceType] = useState<AudienceType>('all');
  const [classroomId, setClassroomId] = useState('');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      const comm = await createCommunication({
        type,
        subject: subject.trim(),
        body_html: body.trim(),
        audience_type: audienceType,
        audience_ids: audienceType === 'classroom' && classroomId ? [classroomId] : undefined,
        scheduled_for: scheduleEnabled && scheduledFor ? scheduledFor : undefined,
      });
      if (!scheduleEnabled) {
        await sendCommunication(comm.id);
      }
      onSent();
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="border-christina-red/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-christina-red" />
            New Message
          </span>
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-7 px-2 text-muted-foreground">
            Cancel
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Message Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as CommunicationType)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="individual">Individual Message</SelectItem>
                <SelectItem value="daily_update">Daily Update</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Send To</Label>
            <Select value={audienceType} onValueChange={(v) => setAudienceType(v as AudienceType)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Families</SelectItem>
                <SelectItem value="classroom">Specific Classroom</SelectItem>
                <SelectItem value="individual">Individual Parent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {audienceType === 'classroom' && (
          <div className="space-y-1.5">
            <Label className="text-xs">Classroom</Label>
            <Select value={classroomId} onValueChange={setClassroomId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select classroom..." />
              </SelectTrigger>
              <SelectContent>
                {classrooms.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs">Subject</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Message subject..."
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Message</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your message here..."
            rows={5}
            className="resize-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="schedule-send"
            checked={scheduleEnabled}
            onCheckedChange={(v) => setScheduleEnabled(Boolean(v))}
          />
          <Label htmlFor="schedule-send" className="text-sm cursor-pointer">Schedule for later</Label>
        </div>

        {scheduleEnabled && (
          <div className="space-y-1.5">
            <Label className="text-xs">Send Date & Time</Label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
            className="bg-christina-red hover:bg-christina-red/90 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            {scheduleEnabled ? 'Schedule' : 'Send Now'}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface CommRowProps {
  comm: Communication;
  readCount: number;
  onDelete: (id: string) => void;
}

function CommRow({ comm, readCount, onDelete }: CommRowProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full text-left p-3 hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{comm.subject}</span>
              <Badge
                variant="outline"
                className={`text-xs ${TYPE_COLORS[comm.type]}`}
              >
                {TYPE_LABELS[comm.type]}
              </Badge>
              {getStatusBadge(comm)}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <AudienceIcon type={comm.audience_type} />
                {comm.audience_type === 'all' ? 'All families' : comm.audience_type}
              </span>
              {comm.sent_at && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(comm.sent_at)}
                </span>
              )}
              {comm.sent_at && (
                <span className="flex items-center gap-1">
                  <CheckCheck className="h-3 w-3" />
                  {readCount} read
                </span>
              )}
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="border-t bg-muted/20 p-3 space-y-3">
          <div
            className="text-sm prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(comm.body_html) }}
          />
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(comm.id)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: MessageTemplate;
  onUse: (template: MessageTemplate) => void;
}

function TemplateCard({ template, onUse }: TemplateCardProps) {
  const categoryLabel = TEMPLATE_CATEGORIES[template.category] ?? template.category;
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm">{template.name}</h3>
          <Badge variant="outline" className="text-xs shrink-0 bg-christina-blue/10 text-christina-blue border-christina-blue/20">
            {categoryLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{template.subject}</p>
        {template.merge_fields.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {template.merge_fields.map((f) => (
              <Badge key={f} variant="secondary" className="text-xs px-1.5 py-0">{f}</Badge>
            ))}
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          className="w-full h-8 text-xs border-christina-red/30 text-christina-red hover:bg-christina-red/5"
          onClick={() => onUse(template)}
        >
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
}

export function CommunicationHub() {
  const [tab, setTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState<Communication[]>([]);
  const [individuals, setIndividuals] = useState<Communication[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [readCounts, setReadCounts] = useState<Record<string, number>>({});
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [composing, setComposing] = useState(false);
  const [prefilledSubject, setPrefilledSubject] = useState('');
  const [prefilledBody, setPrefilledBody] = useState('');

  const loadData = useCallback(async () => {
    const [allComms, tmpls, rooms] = await Promise.all([
      getCommunications({ search: search || undefined }),
      getTemplates(),
      getClassrooms({ active_only: true }),
    ]);

    let filtered = allComms;
    if (statusFilter !== 'all') {
      filtered = allComms.filter((c) => {
        if (statusFilter === 'sent') return !!c.sent_at;
        if (statusFilter === 'scheduled') return !!c.scheduled_for && !c.sent_at;
        return !c.sent_at && !c.scheduled_for;
      });
    }

    setAnnouncements(filtered.filter((c) => c.type === 'announcement'));
    setIndividuals(filtered.filter((c) => c.type === 'individual' || c.type === 'daily_update'));
    setTemplates(tmpls);
    setClassrooms(rooms);

    const ids = allComms.map((c) => c.id);
    const counts = await getReadCounts(ids);
    setReadCounts(counts);
  }, [search, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDelete(id: string) {
    await deleteCommunication(id);
    loadData();
  }

  function handleUseTemplate(template: MessageTemplate) {
    setPrefilledSubject(template.subject);
    setPrefilledBody(template.body_html);
    setComposing(true);
    setTab('announcements');
  }

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'sent', label: 'Sent' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <div className="flex items-center gap-1">
          {statusOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={statusFilter === opt.value ? 'default' : 'outline'}
              size="sm"
              className={
                statusFilter === opt.value
                  ? 'bg-christina-red hover:bg-christina-red/90 text-white h-8'
                  : 'h-8'
              }
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          className="bg-christina-red hover:bg-christina-red/90 text-white h-8 shrink-0"
          onClick={() => { setPrefilledSubject(''); setPrefilledBody(''); setComposing(true); }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Compose
        </Button>
      </div>

      {composing && (
        <ComposeForm
          initialSubject={prefilledSubject}
          initialBody={prefilledBody}
          classrooms={classrooms}
          onSent={() => { setComposing(false); loadData(); }}
          onCancel={() => setComposing(false)}
        />
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="announcements" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Megaphone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Announcements</span>
            <span className="sm:hidden">Posts</span>
            {announcements.length > 0 && (
              <Badge className="bg-christina-red/20 text-christina-red text-xs px-1.5 py-0 ml-0.5">
                {announcements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Messages</span>
            {individuals.length > 0 && (
              <Badge className="bg-christina-green/20 text-christina-green text-xs px-1.5 py-0 ml-0.5">
                {individuals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <FileText className="h-3.5 w-3.5" />
            <span>Templates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="space-y-2 mt-4">
          {announcements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No announcements yet. Compose one above.</p>
            </div>
          ) : (
            announcements.map((comm) => (
              <CommRow
                key={comm.id}
                comm={comm}
                readCount={readCounts[comm.id] ?? 0}
                onDelete={handleDelete}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="individual" className="space-y-2 mt-4">
          {individuals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No individual messages yet.</p>
            </div>
          ) : (
            individuals.map((comm) => (
              <CommRow
                key={comm.id}
                comm={comm}
                readCount={readCounts[comm.id] ?? 0}
                onDelete={handleDelete}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <TemplateCard key={t.id} template={t} onUse={handleUseTemplate} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

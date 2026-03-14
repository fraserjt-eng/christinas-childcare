'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import {
  getEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  publishEntry,
  getVersions,
  rollbackToVersion,
  searchEntries,
  CATEGORY_LABELS,
  type KnowledgeEntry,
  type KnowledgeVersion,
  type KnowledgeCategory,
} from '@/lib/knowledge-storage';
import {
  Search,
  Plus,
  BookOpen,
  ChevronLeft,
  Clock,
  RotateCcw,
  Trash2,
  Send,
  Save,
  History,
  Filter,
  CheckCircle2,
  FileEdit,
} from 'lucide-react';

const CATEGORY_COLORS: Record<KnowledgeCategory, string> = {
  daily_procedures: 'bg-blue-100 text-blue-800',
  emergency_protocols: 'bg-red-100 text-red-800',
  classroom_routines: 'bg-green-100 text-green-800',
  parent_templates: 'bg-purple-100 text-purple-800',
  compliance_checklists: 'bg-orange-100 text-orange-800',
  vendor_contacts: 'bg-slate-100 text-slate-800',
  equipment_instructions: 'bg-yellow-100 text-yellow-800',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── List view ────────────────────────────────────────────────────────────────

interface EntryListProps {
  onSelect: (entry: KnowledgeEntry) => void;
  onCreateNew: () => void;
}

function EntryList({ onSelect, onCreateNew }: EntryListProps) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<KnowledgeCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let results: KnowledgeEntry[];
    if (search.trim()) {
      results = await searchEntries(search);
    } else {
      results = await getEntries(
        categoryFilter !== 'all' || statusFilter !== 'all'
          ? {
              category: categoryFilter !== 'all' ? categoryFilter : undefined,
              status: statusFilter !== 'all' ? statusFilter : undefined,
            }
          : undefined
      );
    }
    setEntries(results);
    setLoading(false);
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="pl-9"
          />
        </div>
        <Button
          onClick={onCreateNew}
          className="bg-christina-red hover:bg-christina-red/90 text-white shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value as KnowledgeCategory | 'all')}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All Categories</option>
          {(Object.keys(CATEGORY_LABELS) as KnowledgeCategory[]).map(cat => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'all' | 'draft' | 'published')}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        {(search || categoryFilter !== 'all' || statusFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(''); setCategoryFilter('all'); setStatusFilter('all'); }}
            className="text-muted-foreground"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Entry list */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-christina-red mr-3" />
          Loading...
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">No entries found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {search ? 'Try a different search term.' : 'Create your first knowledge base entry.'}
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {entries.map(entry => (
            <button
              key={entry.id}
              onClick={() => onSelect(entry)}
              className="w-full text-left px-4 py-4 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-sm group-hover:text-christina-red transition-colors">
                      {entry.title}
                    </h3>
                    {entry.is_onboarding_required && (
                      <Badge className="bg-christina-red/10 text-christina-red text-xs">
                        Onboarding
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className={`text-xs ${CATEGORY_COLORS[entry.category]}`}>
                      {CATEGORY_LABELS[entry.category]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      by {entry.author_name}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDateShort(entry.updated_at)}
                    </span>
                  </div>
                </div>
                <Badge
                  className={entry.status === 'published'
                    ? 'bg-green-100 text-green-800 shrink-0'
                    : 'bg-yellow-100 text-yellow-800 shrink-0'
                  }
                >
                  {entry.status === 'published' ? (
                    <><CheckCircle2 className="h-3 w-3 mr-1" />Published</>
                  ) : (
                    <><FileEdit className="h-3 w-3 mr-1" />Draft</>
                  )}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-right">
        {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
      </p>
    </div>
  );
}

// ─── Edit view ────────────────────────────────────────────────────────────────

interface EntryEditorProps {
  initial: KnowledgeEntry | null;
  onBack: () => void;
  onSaved: () => void;
}

function EntryEditor({ initial, onBack, onSaved }: EntryEditorProps) {
  const isNew = initial === null;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState<KnowledgeCategory>(initial?.category ?? 'daily_procedures');
  const [contentHtml, setContentHtml] = useState(initial?.content_html ?? '');
  const [isOnboarding, setIsOnboarding] = useState(initial?.is_onboarding_required ?? false);
  const [authorName, setAuthorName] = useState(initial?.author_name ?? 'Christina Fraser');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<KnowledgeVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [saved, setSaved] = useState(false);

  async function loadVersions() {
    if (!initial) return;
    setLoadingVersions(true);
    const v = await getVersions(initial.id);
    setVersions(v);
    setLoadingVersions(false);
  }

  useEffect(() => {
    if (showHistory && initial) loadVersions();
  }, [showHistory]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!title.trim() || !contentHtml.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        await createEntry({
          title: title.trim(),
          category,
          content_html: contentHtml,
          author_name: authorName,
          status: 'draft',
          is_onboarding_required: isOnboarding,
        });
      } else {
        await updateEntry(initial!.id, {
          title: title.trim(),
          category,
          content_html: contentHtml,
          is_onboarding_required: isOnboarding,
        }, authorName);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!title.trim() || !contentHtml.trim()) return;
    setPublishing(true);
    try {
      if (isNew) {
        const entry = await createEntry({
          title: title.trim(),
          category,
          content_html: contentHtml,
          author_name: authorName,
          status: 'published',
          is_onboarding_required: isOnboarding,
        });
        await publishEntry(entry.id);
      } else {
        await updateEntry(initial!.id, {
          title: title.trim(),
          category,
          content_html: contentHtml,
          is_onboarding_required: isOnboarding,
        }, authorName);
        await publishEntry(initial!.id);
      }
      onSaved();
      onBack();
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteEntry(initial.id);
      onSaved();
      onBack();
    } finally {
      setDeleting(false);
    }
  }

  async function handleRollback(version: KnowledgeVersion) {
    if (!initial) return;
    if (!confirm('Roll back to this version? Current content will be saved as a new version.')) return;
    await rollbackToVersion(initial.id, version, authorName);
    setContentHtml(version.content_html);
    setShowHistory(false);
    onSaved();
  }

  const isValid = title.trim().length > 0 && contentHtml.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to list
        </button>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(h => !h)}
              className={showHistory ? 'border-christina-blue text-christina-blue' : ''}
            >
              <History className="h-4 w-4 mr-1.5" />
              History
            </Button>
          )}
          {!isNew && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="kb-title">Title</Label>
                <Input
                  id="kb-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Morning Opening Checklist"
                  className="text-base font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="kb-category">Category</Label>
                  <select
                    id="kb-category"
                    value={category}
                    onChange={e => setCategory(e.target.value as KnowledgeCategory)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {(Object.keys(CATEGORY_LABELS) as KnowledgeCategory[]).map(cat => (
                      <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="kb-author">Author</Label>
                  <Input
                    id="kb-author"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Content</Label>
                <RichTextEditor
                  content={contentHtml}
                  onChange={setContentHtml}
                  placeholder="Write the knowledge base entry here..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Required for onboarding</p>
                  <p className="text-xs text-muted-foreground">New hires must read this entry</p>
                </div>
                <Switch
                  checked={isOnboarding}
                  onCheckedChange={setIsOnboarding}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !isValid}
                  variant="outline"
                  className="w-full"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saved ? 'Saved!' : 'Save as Draft'}
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={publishing || !isValid}
                  className="w-full bg-christina-green hover:bg-christina-green/90 text-white"
                >
                  {publishing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Publish
                </Button>
              </div>

              {!isNew && initial && (
                <>
                  <Separator />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Created: {formatDate(initial.created_at)}</p>
                    <p>Updated: {formatDate(initial.updated_at)}</p>
                    <p>Status: <span className={initial.status === 'published' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>{initial.status}</span></p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Version history panel */}
          {showHistory && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Version History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingVersions ? (
                  <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Loading...
                  </div>
                ) : versions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    No previous versions. Versions are saved each time you edit and save.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {versions.map(version => (
                      <div
                        key={version.id}
                        className="rounded-lg border p-3 space-y-2"
                      >
                        <div>
                          <p className="text-xs font-medium">{version.edited_by}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(version.edited_at)}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRollback(version)}
                          className="w-full h-7 text-xs"
                        >
                          <RotateCcw className="h-3 w-3 mr-1.5" />
                          Rollback to this version
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export function KnowledgeBaseEditor() {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [selected, setSelected] = useState<KnowledgeEntry | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSelect(entry: KnowledgeEntry) {
    setSelected(entry);
    setView('edit');
  }

  function handleCreateNew() {
    setSelected(null);
    setView('edit');
  }

  function handleBack() {
    setView('list');
    setSelected(null);
  }

  function handleSaved() {
    setRefreshKey(k => k + 1);
  }

  if (view === 'edit') {
    return (
      <EntryEditor
        key={selected?.id ?? 'new'}
        initial={selected}
        onBack={handleBack}
        onSaved={handleSaved}
      />
    );
  }

  return <EntryList key={refreshKey} onSelect={handleSelect} onCreateNew={handleCreateNew} />;
}

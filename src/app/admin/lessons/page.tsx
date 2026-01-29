'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from '@/components/ui/dialog';
import {
  BookOpen,
  Clock,
  Plus,
  BarChart3,
  Shuffle,
  Search,
  Star,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

import { LessonCard } from '@/components/lessons/LessonCard';
import { LessonForm } from '@/components/lessons/LessonForm';
import { LessonDisplay } from '@/components/lessons/LessonDisplay';
import { RemixModal } from '@/components/lessons/RemixModal';

import {
  Lesson,
  LessonFilters,
  LessonAnalytics,
  AgeGroup,
  LearningDomain,
  AGE_GROUPS,
  LEARNING_DOMAINS,
  AGE_GROUP_LABELS,
  DOMAIN_LABELS,
  LessonFormInput,
  createEmptyLesson,
} from '@/types/curriculum';

import {
  getLessons,
  getLesson,
  saveLesson,
  updateLesson,
  deleteLesson,
  toggleFavorite,
  getAnalytics,
  seedSampleLessons,
} from '@/lib/lesson-storage';

import { generateLessonPDF } from '@/lib/pdf/lesson-pdf';
import { generateActivityCards } from '@/lib/pdf/activity-cards';
import { generateParentLetter } from '@/lib/pdf/parent-letter';
import { generateAssessmentChecklist } from '@/lib/pdf/assessment-checklist';

type ViewMode = 'list' | 'view' | 'edit';

export default function LessonBuilderPage() {
  const [tab, setTab] = useState('new');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [analytics, setAnalytics] = useState<LessonAnalytics | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAge, setFilterAge] = useState<AgeGroup | 'all'>('all');
  const [filterDomain, setFilterDomain] = useState<LearningDomain | 'all'>('all');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'duration'>('newest');

  // Loading/Error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [remixModalOpen, setRemixModalOpen] = useState(false);
  const [remixBaseLesson, setRemixBaseLesson] = useState<Lesson | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);

  // Load lessons
  const loadLessons = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: LessonFilters = {
        searchQuery: searchQuery || undefined,
        ageGroup: filterAge !== 'all' ? filterAge : undefined,
        domain: filterDomain !== 'all' ? filterDomain : undefined,
        isFavorite: filterFavorites || undefined,
        sortBy,
      };

      const data = await getLessons(filters);
      setLessons(data);

      const analyticsData = await getAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading lessons:', err);
      setError('Failed to load lessons');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filterAge, filterDomain, filterFavorites, sortBy]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  // Seed sample data on first load
  useEffect(() => {
    const initData = async () => {
      const seeded = await seedSampleLessons();
      if (seeded > 0) {
        loadLessons();
      }
    };
    initData();
  }, [loadLessons]);

  // Handlers
  const handleSaveLesson = async (data: LessonFormInput) => {
    setIsSaving(true);
    setError(null);
    try {
      if (editingLesson) {
        await updateLesson(editingLesson.id, data);
      } else {
        const emptyLesson = createEmptyLesson();
        await saveLesson({
          ...emptyLesson,
          ...data,
        });
      }
      await loadLessons();
      setEditingLesson(null);
      setViewMode('list');
      setTab('library');
    } catch (err) {
      console.error('Error saving lesson:', err);
      setError('Failed to save lesson');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateLesson = async (data: {
    topic: string;
    ageGroup: AgeGroup;
    domain: LearningDomain;
    duration: number;
    additionalContext?: string;
  }) => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          save: true,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      await loadLessons();
      setSelectedLesson(result.lesson);
      setViewMode('view');
    } catch (err) {
      console.error('Error generating lesson:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate lesson');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemixLesson = async (data: {
    baseLessonId: string;
    newAgeGroup: AgeGroup;
    newDuration?: number;
    newDomain?: LearningDomain;
    adaptationNotes?: string;
  }) => {
    setIsRemixing(true);
    setError(null);
    try {
      const response = await fetch('/api/lessons/remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          baseLesson: remixBaseLesson,
          save: true,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Remix failed');
      }

      await loadLessons();
      setRemixModalOpen(false);
      setRemixBaseLesson(null);
      setSelectedLesson(result.lesson);
      setViewMode('view');
    } catch (err) {
      console.error('Error remixing lesson:', err);
      setError(err instanceof Error ? err.message : 'Failed to remix lesson');
    } finally {
      setIsRemixing(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;
    try {
      await deleteLesson(lessonToDelete.id);
      await loadLessons();
      setDeleteConfirmOpen(false);
      setLessonToDelete(null);
      if (selectedLesson?.id === lessonToDelete.id) {
        setSelectedLesson(null);
        setViewMode('list');
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
      setError('Failed to delete lesson');
    }
  };

  const handleToggleFavorite = async (lesson: Lesson) => {
    try {
      await toggleFavorite(lesson.id);
      await loadLessons();
      if (selectedLesson?.id === lesson.id) {
        const updated = await getLesson(lesson.id);
        setSelectedLesson(updated);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleDuplicateLesson = async (lesson: Lesson) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, updatedAt, ...lessonData } = lesson;
      await saveLesson({
        ...lessonData,
        title: `${lesson.title} (Copy)`,
        isFavorite: false,
      });
      await loadLessons();
    } catch (err) {
      console.error('Error duplicating lesson:', err);
      setError('Failed to duplicate lesson');
    }
  };

  const handleDownloadPDF = (type: 'lesson' | 'activity-cards' | 'parent-letter' | 'assessment') => {
    if (!selectedLesson) return;

    switch (type) {
      case 'lesson':
        generateLessonPDF(selectedLesson);
        break;
      case 'activity-cards':
        generateActivityCards(selectedLesson);
        break;
      case 'parent-letter':
        generateParentLetter(selectedLesson);
        break;
      case 'assessment':
        generateAssessmentChecklist(selectedLesson);
        break;
    }
  };

  // View handlers
  const handleViewLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setViewMode('view');
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setViewMode('edit');
    setTab('new');
  };

  const handleRemixClick = (lesson: Lesson) => {
    setRemixBaseLesson(lesson);
    setRemixModalOpen(true);
  };

  const handleDeleteClick = (lesson: Lesson) => {
    setLessonToDelete(lesson);
    setDeleteConfirmOpen(true);
  };

  const handleBackToList = () => {
    setSelectedLesson(null);
    setEditingLesson(null);
    setViewMode('list');
  };

  // Render view mode
  if (viewMode === 'view' && selectedLesson) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBackToList} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Button>
        <LessonDisplay
          lesson={selectedLesson}
          onEdit={() => handleEditLesson(selectedLesson)}
          onRemix={() => handleRemixClick(selectedLesson)}
          onDelete={() => handleDeleteClick(selectedLesson)}
          onToggleFavorite={() => handleToggleFavorite(selectedLesson)}
          onDownloadPDF={handleDownloadPDF}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lesson Builder</h1>
        <p className="text-muted-foreground">
          Create, manage, and remix lesson plans for all age groups.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="new" className="gap-1">
            <Plus className="h-3 w-3" /> New Lesson
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-1">
            <BookOpen className="h-3 w-3" /> Library
            {lessons.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {lessons.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="remix" className="gap-1">
            <Shuffle className="h-3 w-3" /> Remix
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1">
            <BarChart3 className="h-3 w-3" /> Analytics
          </TabsTrigger>
        </TabsList>

        {/* New Lesson Form */}
        <TabsContent value="new">
          {editingLesson && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingLesson(null);
              }}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel Edit
            </Button>
          )}
          <LessonForm
            initialData={editingLesson || undefined}
            onSave={handleSaveLesson}
            onGenerate={handleGenerateLesson}
            isGenerating={isGenerating}
            isSaving={isSaving}
            error={error}
          />
        </TabsContent>

        {/* Library */}
        <TabsContent value="library" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search lessons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={filterAge}
                    onValueChange={(v) => setFilterAge(v as AgeGroup | 'all')}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Age Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      {AGE_GROUPS.map((age) => (
                        <SelectItem key={age} value={age}>
                          {AGE_GROUP_LABELS[age].split(' ')[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filterDomain}
                    onValueChange={(v) => setFilterDomain(v as LearningDomain | 'all')}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Domains</SelectItem>
                      {LEARNING_DOMAINS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {DOMAIN_LABELS[d].split(' ')[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant={filterFavorites ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setFilterFavorites(!filterFavorites)}
                    className={filterFavorites ? 'bg-christina-yellow hover:bg-christina-yellow/90' : ''}
                  >
                    <Star className={`h-4 w-4 ${filterFavorites ? 'fill-current' : ''}`} />
                  </Button>

                  <Select
                    value={sortBy}
                    onValueChange={(v) => setSortBy(v as typeof sortBy)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lessons Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-christina-red" />
            </div>
          ) : lessons.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No lessons found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterAge !== 'all' || filterDomain !== 'all' || filterFavorites
                    ? 'Try adjusting your filters'
                    : 'Create your first lesson to get started'}
                </p>
                <Button
                  className="bg-christina-red hover:bg-christina-red/90"
                  onClick={() => setTab('new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Lesson
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onView={handleViewLesson}
                  onEdit={handleEditLesson}
                  onRemix={handleRemixClick}
                  onDelete={handleDeleteClick}
                  onToggleFavorite={handleToggleFavorite}
                  onDuplicate={handleDuplicateLesson}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Remix Tab */}
        <TabsContent value="remix">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shuffle className="h-5 w-5 text-christina-blue" />
                Remix an Existing Lesson
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select a lesson from your library to adapt for a different age group, domain, or
                duration. AI will regenerate appropriate activities while keeping the core concept.
              </p>

              {lessons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No lessons available to remix. Create a lesson first!
                  </p>
                  <Button onClick={() => setTab('new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Lesson
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lessons.map((lesson) => (
                    <Card
                      key={lesson.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleRemixClick(lesson)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-2">{lesson.title}</h3>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge className="bg-christina-red/10 text-christina-red text-xs">
                            {AGE_GROUP_LABELS[lesson.ageGroup].split(' ')[0]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {DOMAIN_LABELS[lesson.domain].split(' ')[0]}
                          </Badge>
                          <Badge variant="outline" className="text-xs gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.duration}m
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemixClick(lesson);
                          }}
                        >
                          <Shuffle className="h-3 w-3 mr-1" />
                          Remix This Lesson
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-christina-red">
                      {analytics.totalLessons}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Lessons</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-christina-blue">
                      {analytics.lessonsThisMonth}
                    </p>
                    <p className="text-xs text-muted-foreground">This Month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-christina-green">
                      {analytics.favoritesCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Favorites</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-christina-coral">
                      {analytics.avgDuration} min
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Duration</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lessons by Domain</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {LEARNING_DOMAINS.map((domain) => {
                      const count = analytics.byDomain[domain] || 0;
                      const pct =
                        analytics.totalLessons > 0
                          ? Math.round((count / analytics.totalLessons) * 100)
                          : 0;
                      return (
                        <div key={domain} className="flex items-center gap-3">
                          <span className="text-sm font-medium w-36 truncate">
                            {DOMAIN_LABELS[domain].split(' ')[0]}
                          </span>
                          <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-christina-red h-full rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-16 text-right">
                            {count} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lessons by Age Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {AGE_GROUPS.map((age) => {
                      const count = analytics.byAgeGroup[age] || 0;
                      return (
                        <div
                          key={age}
                          className="p-4 border rounded-lg text-center"
                        >
                          <p className="text-xl font-bold text-christina-red">
                            {count}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {AGE_GROUP_LABELS[age].split(' ')[0]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Remix Modal */}
      <RemixModal
        open={remixModalOpen}
        onOpenChange={setRemixModalOpen}
        baseLesson={remixBaseLesson}
        onRemix={handleRemixLesson}
        isRemixing={isRemixing}
        error={error}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{lessonToDelete?.title}&quot;? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLesson}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
        Designed by Josh Fraser Ed.D. &bull;{' '}
        <a
          href="https://pd-session-builder.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-christina-red hover:underline"
        >
          PD Session Builder <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  Target,
  Package,
  Star,
  Edit,
  Shuffle,
  Trash2,
  Download,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  User,
  Users,
  FileText,
  Mail,
  ClipboardList,
} from 'lucide-react';
import {
  Lesson,
  LessonSegmentItem,
  AGE_GROUP_LABELS,
  DOMAIN_LABELS,
  DOMAIN_COLORS,
  SEGMENT_LABELS,
  getSegmentColor,
} from '@/types/curriculum';

interface LessonDisplayProps {
  lesson: Lesson;
  onEdit?: () => void;
  onRemix?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  onDownloadPDF?: (type: 'lesson' | 'activity-cards' | 'parent-letter' | 'assessment') => void;
}

function SegmentCard({
  segment,
  index,
}: {
  segment: LessonSegmentItem;
  index: number;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const segmentColor = getSegmentColor(segment.segment);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className={`w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full ${segmentColor} flex items-center justify-center text-white text-sm font-bold`}
          >
            {index + 1}
          </div>
          <div>
            <p className="font-semibold text-sm">{segment.title}</p>
            <p className="text-xs text-muted-foreground">
              {SEGMENT_LABELS[segment.segment]} - {segment.duration} min
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="p-4 pt-0 space-y-4 border-t">
          <p className="text-sm">{segment.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <User className="h-3 w-3" />
                Teacher Actions
              </p>
              <p className="text-sm">{segment.teacherActions}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <Users className="h-3 w-3" />
                Child Actions
              </p>
              <p className="text-sm">{segment.childActions}</p>
            </div>
          </div>

          {segment.materials.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Materials for this Segment
              </p>
              <div className="flex flex-wrap gap-1">
                {segment.materials.map((mat, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {mat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-christina-green">
                Simplify
              </p>
              <p className="text-xs">{segment.adaptations.simplify || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-christina-blue">
                Extend
              </p>
              <p className="text-xs">{segment.adaptations.extend || 'N/A'}</p>
            </div>
          </div>

          {segment.assessmentOpportunity && (
            <div className="p-3 bg-christina-yellow/10 rounded-lg">
              <p className="text-xs font-semibold text-amber-700 uppercase mb-1">
                Assessment Opportunity
              </p>
              <p className="text-sm">{segment.assessmentOpportunity}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LessonDisplay({
  lesson,
  onEdit,
  onRemix,
  onDelete,
  onToggleFavorite,
  onDownloadPDF,
}: LessonDisplayProps) {
  const ageLabel = AGE_GROUP_LABELS[lesson.ageGroup];
  const domainLabel = DOMAIN_LABELS[lesson.domain];
  const domainColor = DOMAIN_COLORS[lesson.domain];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{lesson.title}</h2>
                {lesson.isFavorite && (
                  <Star className="h-5 w-5 fill-christina-yellow text-christina-yellow" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-christina-red/10 text-christina-red">
                  {ageLabel}
                </Badge>
                <Badge className={domainColor}>{domainLabel}</Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {lesson.duration} minutes
                </Badge>
                {lesson.createdBy === 'ai' && (
                  <Badge variant="outline" className="text-christina-blue">
                    AI Generated
                  </Badge>
                )}
              </div>
              {lesson.theme && (
                <p className="text-sm text-muted-foreground">
                  Theme: {lesson.theme}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleFavorite}
              >
                <Star
                  className={`h-4 w-4 mr-1 ${
                    lesson.isFavorite ? 'fill-christina-yellow text-christina-yellow' : ''
                  }`}
                />
                {lesson.isFavorite ? 'Unfavorite' : 'Favorite'}
              </Button>
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={onRemix}>
                <Shuffle className="h-4 w-4 mr-1" />
                Remix
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-1">
            <Target className="h-3 w-3" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="segments" className="gap-1">
            <ClipboardList className="h-3 w-3" />
            Segments
          </TabsTrigger>
          <TabsTrigger value="materials" className="gap-1">
            <Package className="h-3 w-3" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="assessment" className="gap-1">
            <CheckSquare className="h-3 w-3" />
            Assessment
          </TabsTrigger>
          <TabsTrigger value="downloads" className="gap-1">
            <Download className="h-3 w-3" />
            Downloads
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-christina-red" />
                Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lesson.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-christina-green">✓</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-christina-blue" />
                Lesson Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 items-center">
                {lesson.segments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Badge className={getSegmentColor(seg.segment)}>
                      {seg.segment}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {seg.duration}m
                    </span>
                    {i < lesson.segments.length - 1 && (
                      <span className="text-muted-foreground mx-1">→</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {lesson.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {lesson.tags.map((tag, i) => (
                    <Badge key={i} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-3">
          {lesson.segments.map((segment, index) => (
            <SegmentCard
              key={index}
              segment={segment}
              index={index}
            />
          ))}
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-christina-coral" />
                Materials Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lesson.materials.map((mat, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm p-2 hover:bg-muted rounded"
                  >
                    <input type="checkbox" className="rounded" />
                    {mat}
                  </li>
                ))}
              </ul>
              {lesson.segments.some((s) => s.materials.length > 0) && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Materials by Segment
                  </p>
                  {lesson.segments
                    .filter((s) => s.materials.length > 0)
                    .map((seg, i) => (
                      <div key={i} className="mb-2">
                        <Badge className={`${getSegmentColor(seg.segment)} text-xs`}>
                          {seg.segment}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          {seg.materials.join(', ')}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-christina-green" />
                Assessment Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Objectives to Observe
                </p>
                {lesson.objectives.map((obj, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 border rounded-lg"
                  >
                    <span className="text-sm flex-1">{obj}</span>
                    <div className="flex gap-2 text-xs">
                      <Badge variant="outline">Not Yet</Badge>
                      <Badge variant="outline" className="bg-christina-yellow/20">
                        Developing
                      </Badge>
                      <Badge variant="outline" className="bg-christina-green/20">
                        Mastered
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {lesson.segments.some((s) => s.assessmentOpportunity) && (
                <div className="space-y-3 pt-4 border-t">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Observation Notes by Segment
                  </p>
                  {lesson.segments
                    .filter((s) => s.assessmentOpportunity)
                    .map((seg, i) => (
                      <div
                        key={i}
                        className="p-3 bg-christina-yellow/10 rounded-lg"
                      >
                        <Badge className={`${getSegmentColor(seg.segment)} text-xs mb-2`}>
                          {seg.segment}
                        </Badge>
                        <p className="text-sm">{seg.assessmentOpportunity}</p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Downloads Tab */}
        <TabsContent value="downloads">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4 text-christina-blue" />
                Download Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => onDownloadPDF?.('lesson')}
                >
                  <FileText className="h-8 w-8 text-christina-red" />
                  <span className="font-semibold">Lesson Plan PDF</span>
                  <span className="text-xs text-muted-foreground">
                    Complete lesson with all segments
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => onDownloadPDF?.('activity-cards')}
                >
                  <ClipboardList className="h-8 w-8 text-christina-blue" />
                  <span className="font-semibold">Activity Cards</span>
                  <span className="text-xs text-muted-foreground">
                    One card per segment for posting
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => onDownloadPDF?.('parent-letter')}
                >
                  <Mail className="h-8 w-8 text-christina-green" />
                  <span className="font-semibold">Parent Letter</span>
                  <span className="text-xs text-muted-foreground">
                    Home activities and conversation starters
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => onDownloadPDF?.('assessment')}
                >
                  <CheckSquare className="h-8 w-8 text-christina-coral" />
                  <span className="font-semibold">Assessment Checklist</span>
                  <span className="text-xs text-muted-foreground">
                    Observation form for documentation
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-xs text-muted-foreground border-t pt-4 flex flex-wrap justify-between">
        <span>
          Created: {new Date(lesson.createdAt).toLocaleDateString()} |
          Updated: {new Date(lesson.updatedAt).toLocaleDateString()}
        </span>
        {lesson.remixedFrom && (
          <span className="text-christina-blue">
            Remixed from another lesson
          </span>
        )}
      </div>
    </div>
  );
}

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  Star,
  MoreVertical,
  Eye,
  Edit,
  Shuffle,
  Trash2,
  Copy,
} from 'lucide-react';
import {
  Lesson,
  AGE_GROUP_LABELS,
  DOMAIN_LABELS,
  DOMAIN_COLORS,
} from '@/types/curriculum';

interface LessonCardProps {
  lesson: Lesson;
  onView?: (lesson: Lesson) => void;
  onEdit?: (lesson: Lesson) => void;
  onRemix?: (lesson: Lesson) => void;
  onDelete?: (lesson: Lesson) => void;
  onToggleFavorite?: (lesson: Lesson) => void;
  onDuplicate?: (lesson: Lesson) => void;
}

export function LessonCard({
  lesson,
  onView,
  onEdit,
  onRemix,
  onDelete,
  onToggleFavorite,
  onDuplicate,
}: LessonCardProps) {
  const ageLabel = AGE_GROUP_LABELS[lesson.ageGroup].split(' ')[0]; // Just "Infant", "Toddler", etc.
  const domainLabel = DOMAIN_LABELS[lesson.domain];
  const domainColor = DOMAIN_COLORS[lesson.domain];

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-sm leading-tight pr-2">{lesson.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onToggleFavorite?.(lesson)}
            >
              <Star
                className={`h-4 w-4 ${
                  lesson.isFavorite
                    ? 'fill-christina-yellow text-christina-yellow'
                    : 'text-muted-foreground'
                }`}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(lesson)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(lesson)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRemix?.(lesson)}>
                  <Shuffle className="h-4 w-4 mr-2" />
                  Remix
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(lesson)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDelete?.(lesson)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge className="bg-christina-red/10 text-christina-red text-xs">
            {ageLabel}
          </Badge>
          <Badge className={`${domainColor} text-xs`}>
            {domainLabel.split(' ')[0]}
          </Badge>
          <Badge variant="outline" className="text-xs gap-1">
            <Clock className="h-3 w-3" />
            {lesson.duration}m
          </Badge>
        </div>

        <div className="mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
            Objectives
          </p>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {lesson.objectives.slice(0, 2).map((obj, i) => (
              <li key={i} className="truncate">
                - {obj}
              </li>
            ))}
            {lesson.objectives.length > 2 && (
              <li className="text-christina-blue">
                +{lesson.objectives.length - 2} more
              </li>
            )}
          </ul>
        </div>

        <div className="flex flex-wrap gap-1">
          {lesson.materials.slice(0, 3).map((mat, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {mat}
            </Badge>
          ))}
          {lesson.materials.length > 3 && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              +{lesson.materials.length - 3}
            </Badge>
          )}
        </div>

        {lesson.createdBy === 'ai' && (
          <div className="mt-3 pt-2 border-t">
            <Badge variant="outline" className="text-xs text-christina-blue">
              AI Generated
            </Badge>
          </div>
        )}

        <div className="mt-3 pt-2 border-t flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onView?.(lesson)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onEdit?.(lesson)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

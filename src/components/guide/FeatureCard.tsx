'use client';

import { useState } from 'react';
import { type LucideIcon } from 'lucide-react';
import {
  ChevronDown,
  Lightbulb,
  Sparkles,
  Play,
  Video,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  whyItExists: string;
  howItHelps: string;
  route: string;
  tourId?: string;
  videoUrl?: string;
  steps: string[];
  roles: ('parent' | 'staff' | 'admin')[];
  category?: string;
  categoryColor?: string;
}

const roleBadgeStyles: Record<string, { label: string; className: string }> = {
  parent: {
    label: 'Parent',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  staff: {
    label: 'Staff',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  admin: {
    label: 'Admin',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  whyItExists,
  howItHelps,
  route,
  tourId,
  videoUrl,
  steps,
  roles,
  categoryColor,
}: FeatureCardProps) {
  const [expanded, setExpanded] = useState(false);

  const tourHref = tourId ? `${route}?tour=${tourId}` : route;

  return (
    <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
      {/* Category color bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: categoryColor }}
      />

      <div className="pl-5 pr-5 pt-5 pb-4 flex-1">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: categoryColor + '18' }}
          >
            <Icon className="w-5 h-5" style={{ color: categoryColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1.5">
              {title}
            </h3>
            <div className="flex flex-wrap gap-1">
              {roles.map((role) => {
                const style = roleBadgeStyles[role];
                return (
                  <span
                    key={role}
                    className={cn(
                      'inline-block text-xs font-medium px-2 py-0.5 rounded-full border',
                      style.className
                    )}
                  >
                    {style.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {description}
        </p>

        {/* Expandable section */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors mb-3 group"
          aria-expanded={expanded}
        >
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
          {expanded ? 'Hide details' : 'See how it works'}
        </button>

        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            expanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="space-y-3 pb-1">
            {/* Why it exists */}
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
              <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-xs mb-1">
                <Lightbulb className="w-3.5 h-3.5" />
                Why this exists
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {whyItExists}
              </p>
            </div>

            {/* How it helps */}
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                How it helps you
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {howItHelps}
              </p>
            </div>

            {/* Step-by-step */}
            {steps.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Step by step
                </p>
                <ol className="space-y-1.5">
                  {steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <span
                        className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-[10px] mt-0.5"
                        style={{ backgroundColor: categoryColor }}
                      >
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-4 flex gap-2 flex-wrap">
        <Button
          size="sm"
          className="text-white text-xs h-8 px-3"
          style={{ backgroundColor: categoryColor }}
          asChild
        >
          <Link href={tourHref}>
            <Play className="w-3 h-3 mr-1" />
            {tourId ? 'Take the Tour' : 'Go There'}
          </Link>
        </Button>

        {videoUrl ? (
          <Button size="sm" variant="outline" className="text-xs h-8 px-3" asChild>
            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
              <Video className="w-3 h-3 mr-1" />
              Watch Video
            </a>
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="text-xs h-8 px-3" asChild>
            <Link href={route}>
              <ExternalLink className="w-3 h-3 mr-1" />
              Open
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}


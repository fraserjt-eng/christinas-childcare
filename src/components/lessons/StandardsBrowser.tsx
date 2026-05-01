'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ChevronDown,
  ChevronRight,
  Award,
  Search,
  Filter,
} from 'lucide-react';
import { MN_ECIPS, ECIPS_AGE_BANDS } from '@/data/standards/mn-ecips';
import type { Lesson } from '@/types/curriculum';

interface StandardsBrowserProps {
  lessons: Lesson[];
  onIndicatorClick?: (code: string) => void;
}

const DOMAIN_COLORS: Record<string, string> = {
  SED: 'border-rose-200 bg-rose-50',
  APL: 'border-amber-200 bg-amber-50',
  LLC: 'border-blue-200 bg-blue-50',
  ART: 'border-pink-200 bg-pink-50',
  MTH: 'border-indigo-200 bg-indigo-50',
  SCI: 'border-teal-200 bg-teal-50',
  SOC: 'border-violet-200 bg-violet-50',
  PMD: 'border-green-200 bg-green-50',
};

const DOMAIN_BADGE_COLORS: Record<string, string> = {
  SED: 'bg-rose-100 text-rose-800',
  APL: 'bg-amber-100 text-amber-800',
  LLC: 'bg-blue-100 text-blue-800',
  ART: 'bg-pink-100 text-pink-800',
  MTH: 'bg-indigo-100 text-indigo-800',
  SCI: 'bg-teal-100 text-teal-800',
  SOC: 'bg-violet-100 text-violet-800',
  PMD: 'bg-green-100 text-green-800',
};

export function StandardsBrowser({
  lessons,
  onIndicatorClick,
}: StandardsBrowserProps) {
  const [search, setSearch] = useState('');
  const [bandFilter, setBandFilter] = useState<string | 'all'>('all');
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(
    new Set(['LLC', 'SED']) // start with the two most common domains expanded
  );

  // Build a lesson-count map per indicator code so teachers can see at a
  // glance which standards are well-covered and which are gaps.
  const lessonsByIndicator = useMemo(() => {
    const map = new Map<string, number>();
    for (const lesson of lessons) {
      if (!lesson.ecipsIndicators) continue;
      for (const code of lesson.ecipsIndicators) {
        map.set(code, (map.get(code) ?? 0) + 1);
      }
    }
    return map;
  }, [lessons]);

  const totalAlignedLessons = useMemo(
    () => lessons.filter((l) => l.ecipsIndicators && l.ecipsIndicators.length > 0).length,
    [lessons]
  );

  const toggleDomain = (code: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const matchesSearch = (text: string) =>
    !search || text.toLowerCase().includes(search.toLowerCase());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-600" />
          Minnesota ECIPS Standards
          <Badge variant="secondary" className="text-xs">
            {totalAlignedLessons} / {lessons.length} lessons aligned
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search indicators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={bandFilter}
              onChange={(e) => setBandFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All ages</option>
              {ECIPS_AGE_BANDS.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.label} ({b.range})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Domain tree */}
        <div className="space-y-2">
          {MN_ECIPS.map((domain) => {
            // Filter components and indicators by search + age band.
            const filteredComponents = domain.components
              .map((comp) => ({
                ...comp,
                indicators: comp.indicators.filter((ind) => {
                  if (bandFilter !== 'all' && ind.ageBand !== bandFilter) return false;
                  if (
                    !matchesSearch(ind.description) &&
                    !matchesSearch(ind.code) &&
                    !matchesSearch(comp.name) &&
                    !matchesSearch(domain.name)
                  ) {
                    return false;
                  }
                  return true;
                }),
              }))
              .filter((c) => c.indicators.length > 0);

            if (filteredComponents.length === 0) return null;

            const isExpanded = expandedDomains.has(domain.code);
            const totalIndicators = filteredComponents.reduce(
              (sum, c) => sum + c.indicators.length,
              0
            );
            const totalCoveredHere = filteredComponents.reduce(
              (sum, c) =>
                sum +
                c.indicators.filter((i) => (lessonsByIndicator.get(i.code) ?? 0) > 0)
                  .length,
              0
            );

            return (
              <div
                key={domain.code}
                className={`rounded-lg border ${DOMAIN_COLORS[domain.code] ?? ''}`}
              >
                <button
                  type="button"
                  onClick={() => toggleDomain(domain.code)}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`text-xs font-bold ${DOMAIN_BADGE_COLORS[domain.code] ?? ''}`}
                    >
                      {domain.code}
                    </Badge>
                    <div>
                      <div className="font-semibold text-sm">{domain.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {filteredComponents.length}{' '}
                        {filteredComponents.length === 1 ? 'component' : 'components'} ·{' '}
                        {totalIndicators} indicators · {totalCoveredHere} covered
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-current/10 pt-2">
                    {filteredComponents.map((comp) => (
                      <div key={`${domain.code}.${comp.number}`}>
                        <div className="text-xs font-semibold text-muted-foreground mb-1.5">
                          {domain.code}.{comp.number} {comp.name}
                        </div>
                        <div className="space-y-1">
                          {comp.indicators.map((ind) => {
                            const count = lessonsByIndicator.get(ind.code) ?? 0;
                            return (
                              <button
                                key={ind.code}
                                type="button"
                                onClick={() => onIndicatorClick?.(ind.code)}
                                disabled={!onIndicatorClick}
                                className={`w-full text-left rounded-md px-2.5 py-2 text-xs flex items-start gap-2 transition-colors ${
                                  onIndicatorClick
                                    ? 'hover:bg-white/60 cursor-pointer'
                                    : 'cursor-default'
                                }`}
                              >
                                <span className="font-mono text-[10px] text-muted-foreground shrink-0 mt-0.5 w-20">
                                  {ind.code}
                                </span>
                                <span className="flex-1">{ind.description}</span>
                                <Badge
                                  variant={count > 0 ? 'default' : 'outline'}
                                  className={`text-[10px] shrink-0 ${
                                    count > 0
                                      ? 'bg-green-100 text-green-800 border-green-200'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {count} {count === 1 ? 'lesson' : 'lessons'}
                                </Badge>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {onIndicatorClick && (
          <p className="text-xs text-muted-foreground border-t pt-3">
            Click any indicator to filter the lesson library by that standard.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

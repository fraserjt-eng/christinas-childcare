'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Award } from 'lucide-react';
import { getIndicatorMeta } from '@/data/standards/mn-ecips';

interface EcipsAlignmentProps {
  codes: string[];
  /** Compact mode: badges only, no expand. */
  compact?: boolean;
}

const DOMAIN_COLORS: Record<string, string> = {
  SED: 'bg-rose-100 text-rose-800 border-rose-200',
  APL: 'bg-amber-100 text-amber-800 border-amber-200',
  LLC: 'bg-blue-100 text-blue-800 border-blue-200',
  ART: 'bg-pink-100 text-pink-800 border-pink-200',
  MTH: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  SCI: 'bg-teal-100 text-teal-800 border-teal-200',
  SOC: 'bg-violet-100 text-violet-800 border-violet-200',
  PMD: 'bg-green-100 text-green-800 border-green-200',
};

export function EcipsAlignment({ codes, compact = false }: EcipsAlignmentProps) {
  const [expanded, setExpanded] = useState(false);

  if (!codes || codes.length === 0) return null;

  // Resolve each code to its metadata. Skip codes the framework doesn't know
  // about (e.g. legacy data from before the indicator migration).
  const resolved = codes
    .map((code) => ({ code, meta: getIndicatorMeta(code) }))
    .filter((r) => r.meta !== null) as Array<{
      code: string;
      meta: NonNullable<ReturnType<typeof getIndicatorMeta>>;
    }>;

  if (resolved.length === 0) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {resolved.map(({ code, meta }) => (
          <Badge
            key={code}
            variant="outline"
            title={`${meta.domain.shortName} > ${meta.component.name}: ${meta.indicator.description}`}
            className={`text-xs ${DOMAIN_COLORS[meta.domain.code] ?? ''}`}
          >
            {code}
          </Badge>
        ))}
      </div>
    );
  }

  // Group by domain for the expanded view.
  const byDomain = new Map<
    string,
    { domainName: string; entries: typeof resolved }
  >();
  for (const r of resolved) {
    const key = r.meta.domain.code;
    if (!byDomain.has(key)) {
      byDomain.set(key, { domainName: r.meta.domain.shortName, entries: [] });
    }
    byDomain.get(key)!.entries.push(r);
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-700" />
          <span className="text-sm font-semibold text-amber-900">
            Minnesota ECIPS Alignment
          </span>
          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
            {resolved.length} {resolved.length === 1 ? 'indicator' : 'indicators'}
          </Badge>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-amber-700" />
        ) : (
          <ChevronDown className="h-4 w-4 text-amber-700" />
        )}
      </button>

      {!expanded ? (
        <div className="flex flex-wrap gap-1 mt-2">
          {resolved.map(({ code, meta }) => (
            <Badge
              key={code}
              variant="outline"
              title={meta.indicator.description}
              className={`text-xs ${DOMAIN_COLORS[meta.domain.code] ?? ''}`}
            >
              {code}
            </Badge>
          ))}
        </div>
      ) : (
        <div className="space-y-3 mt-3">
          {Array.from(byDomain.entries()).map(([domainCode, group]) => (
            <div key={domainCode}>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold ${DOMAIN_COLORS[domainCode] ?? ''}`}
                >
                  {domainCode}
                </Badge>
                <span className="text-xs font-medium text-amber-900">
                  {group.domainName}
                </span>
              </div>
              <ul className="space-y-1.5 pl-2">
                {group.entries.map(({ code, meta }) => (
                  <li key={code} className="text-xs text-amber-900">
                    <span className="font-mono text-amber-700 mr-2">{code}</span>
                    <span className="text-muted-foreground">
                      ({meta.component.name})
                    </span>{' '}
                    {meta.indicator.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

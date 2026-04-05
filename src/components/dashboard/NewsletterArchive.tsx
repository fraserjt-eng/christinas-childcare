'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Newspaper,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getSentNewsletters } from '@/lib/newsletter-storage';
import type { Newsletter } from '@/lib/newsletter-storage';
import { sanitizeHTML } from '@/lib/sanitize';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getPreviewSnippet(newsletter: Newsletter): string {
  const firstSection = newsletter.sections.find((s) => s.content_html);
  if (!firstSection) return '';
  const stripped = firstSection.content_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return stripped.length > 120 ? stripped.slice(0, 120) + '...' : stripped;
}

interface ArchiveItemProps {
  newsletter: Newsletter;
  isExpanded: boolean;
  onToggle: () => void;
}

function ArchiveItem({ newsletter, isExpanded, onToggle }: ArchiveItemProps) {
  const snippet = getPreviewSnippet(newsletter);

  return (
    <Card className="overflow-hidden hover:shadow-sm transition-shadow">
      <button
        className="w-full text-left"
        onClick={onToggle}
      >
        <CardHeader className="pb-3 hover:bg-muted/30 transition-colors">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-christina-red/10 flex items-center justify-center shrink-0 mt-0.5">
              <Newspaper className="h-4 w-4 text-christina-red" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-base leading-snug">{newsletter.subject}</h3>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {newsletter.sent_at ? formatShortDate(newsletter.sent_at) : 'Unknown date'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {newsletter.sections.length} sections
                </Badge>
              </div>
              {!isExpanded && snippet && (
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{snippet}</p>
              )}
            </div>
          </div>
        </CardHeader>
      </button>

      {isExpanded && (
        <CardContent className="p-0">
          <div className="border-t">
            <div className="p-4 bg-christina-red/5 border-b border-christina-red/10 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                Christina&apos;s Child Care Center
              </p>
              <p className="text-sm font-semibold text-christina-red">{newsletter.subject}</p>
              {newsletter.sent_at && (
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(newsletter.sent_at)}</p>
              )}
            </div>
            <div className="divide-y">
              {newsletter.sections.map((section) => (
                <div key={section.id} className="p-4 space-y-2">
                  <h4 className="font-semibold text-sm text-christina-red">{section.title}</h4>
                  <div
                    className="text-sm prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(section.content_html) }}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function NewsletterArchive() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getSentNewsletters();
      if (search.trim()) {
        const q = search.toLowerCase();
        setNewsletters(
          all.filter(
            (n) =>
              n.subject.toLowerCase().includes(q) ||
              n.sections.some(
                (s) =>
                  s.title.toLowerCase().includes(q) ||
                  s.content_html.toLowerCase().includes(q)
              )
          )
        );
      } else {
        setNewsletters(all);
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function toggleExpanded(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search newsletters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
      ) : newsletters.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No newsletters yet</p>
          <p className="text-sm mt-1">
            {search ? 'No newsletters match your search.' : 'Newsletters will appear here once sent.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {newsletters.map((newsletter) => (
            <ArchiveItem
              key={newsletter.id}
              newsletter={newsletter}
              isExpanded={expandedId === newsletter.id}
              onToggle={() => toggleExpanded(newsletter.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

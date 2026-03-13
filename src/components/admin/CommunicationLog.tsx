'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  History,
  Search,
  ChevronDown,
  ChevronUp,
  Users,
  User,
  CheckCheck,
} from 'lucide-react';
import { getCommunications, getReadCounts } from '@/lib/comms-storage';
import type { Communication, CommunicationType } from '@/lib/comms-storage';

const TYPE_LABELS: Record<CommunicationType, string> = {
  announcement: 'Announcement',
  individual: 'Individual',
  daily_update: 'Daily Update',
  template: 'Template',
};

const TYPE_BADGE_CLASSES: Record<CommunicationType, string> = {
  announcement: 'bg-christina-blue/10 text-christina-blue border-christina-blue/20',
  individual: 'bg-christina-green/10 text-christina-green border-christina-green/20',
  daily_update: 'bg-christina-yellow/20 text-yellow-800 border-christina-yellow/30',
  template: 'bg-gray-100 text-gray-700 border-gray-200',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface ExpandedRowProps {
  comm: Communication;
  readCount: number;
}

function ExpandedContent({ comm, readCount }: ExpandedRowProps) {
  return (
    <div className="px-4 pb-4 pt-2 bg-muted/20 border-t space-y-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          {comm.audience_type === 'individual' ? (
            <User className="h-3.5 w-3.5" />
          ) : (
            <Users className="h-3.5 w-3.5" />
          )}
          Sent to: {comm.audience_type === 'all' ? 'All families' : comm.audience_type}
        </span>
        <span className="flex items-center gap-1">
          <CheckCheck className="h-3.5 w-3.5" />
          {readCount} read
        </span>
        {comm.sent_at && (
          <span>Sent: {formatDate(comm.sent_at)}</span>
        )}
      </div>
      <div
        className="text-sm prose-sm max-w-none bg-white rounded border p-3"
        dangerouslySetInnerHTML={{ __html: comm.body_html }}
      />
    </div>
  );
}

export function CommunicationLog() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [readCounts, setReadCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const comms = await getCommunications({ status: 'sent', search: search || undefined });
      const filtered = typeFilter !== 'all'
        ? comms.filter((c) => c.type === typeFilter)
        : comms;

      const dateFiltered = filtered.filter((c) => {
        if (!c.sent_at) return false;
        const sentDate = c.sent_at.split('T')[0];
        if (dateFrom && sentDate < dateFrom) return false;
        if (dateTo && sentDate > dateTo) return false;
        return true;
      });

      setCommunications(dateFiltered);

      const ids = dateFiltered.map((c) => c.id);
      const counts = await getReadCounts(ids);
      setReadCounts(counts);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, dateFrom, dateTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function toggleExpanded(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-full sm:w-44">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="announcement">Announcements</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="daily_update">Daily Updates</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm h-9"
          />
          <span>to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm h-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-christina-red" />
            Sent Communications
            <Badge variant="outline" className="ml-1 text-xs">{communications.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
          ) : communications.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
              No sent communications match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Date Sent</TableHead>
                    <TableHead className="text-xs">Subject</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Type</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Audience</TableHead>
                    <TableHead className="text-xs text-right">Read</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communications.map((comm) => (
                    <>
                      <TableRow
                        key={comm.id}
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => toggleExpanded(comm.id)}
                      >
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap py-3">
                          {comm.sent_at ? formatShortDate(comm.sent_at) : '—'}
                        </TableCell>
                        <TableCell className="text-sm font-medium py-3 max-w-[200px]">
                          <span className="truncate block">{comm.subject}</span>
                        </TableCell>
                        <TableCell className="py-3 hidden sm:table-cell">
                          <Badge
                            variant="outline"
                            className={`text-xs ${TYPE_BADGE_CLASSES[comm.type]}`}
                          >
                            {TYPE_LABELS[comm.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground capitalize">
                            {comm.audience_type === 'all' ? 'All families' : comm.audience_type}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <span className="flex items-center gap-1 justify-end text-xs text-muted-foreground">
                            <CheckCheck className="h-3.5 w-3.5" />
                            {readCounts[comm.id] ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          {expandedId === comm.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedId === comm.id && (
                        <TableRow key={`${comm.id}-expanded`} className="hover:bg-transparent">
                          <TableCell colSpan={6} className="p-0">
                            <ExpandedContent comm={comm} readCount={readCounts[comm.id] ?? 0} />
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

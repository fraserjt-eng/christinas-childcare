'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  FileText,
} from 'lucide-react';
import {
  IncidentLog,
  IncidentType,
  IncidentSeverity,
  INCIDENT_TYPE_LABELS,
  SEVERITY_LABELS,
  getIncidents,
  updateIncident,
} from '@/lib/incident-log-storage';
import { IncidentForm } from './IncidentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TYPE_COLORS: Record<IncidentType, string> = {
  injury: 'bg-red-100 text-red-700 border-red-200',
  illness: 'bg-orange-100 text-orange-700 border-orange-200',
  behavioral: 'bg-purple-100 text-purple-700 border-purple-200',
  property: 'bg-blue-100 text-blue-700 border-blue-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  minor: 'bg-green-100 text-green-700 border-green-200',
  moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  serious: 'bg-red-100 text-red-700 border-red-200',
};

interface IncidentTimelineProps {
  onRefresh?: () => void;
}

export function IncidentTimeline({ onRefresh }: IncidentTimelineProps) {
  const [incidents, setIncidents] = useState<IncidentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [notifFilter, setNotifFilter] = useState<string>('all');
  const [editingIncident, setEditingIncident] = useState<IncidentLog | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await getIncidents();
    setIncidents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const markParentNotified = async (incident: IncidentLog) => {
    await updateIncident(incident.id, {
      parent_notified: true,
      parent_notified_at: new Date().toISOString(),
    });
    await loadData();
    onRefresh?.();
  };

  const markFollowUpComplete = async (incident: IncidentLog) => {
    await updateIncident(incident.id, {
      follow_up_completed_at: new Date().toISOString(),
    });
    await loadData();
    onRefresh?.();
  };

  const isOverdue = (incident: IncidentLog): boolean => {
    if (incident.parent_notified) return false;
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return new Date(incident.created_at).getTime() < cutoff;
  };

  const filtered = incidents.filter((inc) => {
    if (typeFilter !== 'all' && inc.incident_type !== typeFilter) return false;
    if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
    if (notifFilter === 'notified' && !inc.parent_notified) return false;
    if (notifFilter === 'not_notified' && inc.parent_notified) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C62828]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(INCIDENT_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={notifFilter} onValueChange={setNotifFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All notifications" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notification Status</SelectItem>
            <SelectItem value="notified">Parent Notified</SelectItem>
            <SelectItem value="not_notified">Not Yet Notified</SelectItem>
          </SelectContent>
        </Select>

        <p className="self-center text-sm text-muted-foreground ml-auto">
          {filtered.length} incident{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No incidents match your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((incident) => {
            const overdue = isOverdue(incident);
            const isExpanded = expanded.has(incident.id);

            return (
              <div
                key={incident.id}
                className={`border rounded-lg overflow-hidden ${
                  overdue ? 'border-red-400' : ''
                }`}
              >
                {/* Overdue banner */}
                {overdue && (
                  <div className="bg-red-500 text-white text-xs px-4 py-1.5 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Parent not notified — more than 24 hours ago
                  </div>
                )}

                {/* Summary row */}
                <button
                  onClick={() => toggle(incident.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{incident.child_name}</span>
                      <Badge className={`text-xs border ${TYPE_COLORS[incident.incident_type]}`}>
                        {INCIDENT_TYPE_LABELS[incident.incident_type]}
                      </Badge>
                      <Badge className={`text-xs border ${SEVERITY_COLORS[incident.severity]}`}>
                        {SEVERITY_LABELS[incident.severity]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {incident.classroom} &middot;{' '}
                      {new Date(incident.date + 'T' + incident.time).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                      })} &middot; {incident.staff_on_duty}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {incident.parent_notified ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                        <Phone className="h-3 w-3 mr-1" />
                        Notified
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
                        onClick={() => markParentNotified(incident)}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Notify
                      </Button>
                    )}
                    {incident.follow_up_required && !incident.follow_up_completed_at && (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Follow-up
                      </Badge>
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t bg-muted/10 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                          Description
                        </p>
                        <p className="leading-relaxed">{incident.description}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                          Action Taken
                        </p>
                        <p className="leading-relaxed">{incident.action_taken}</p>
                      </div>
                    </div>

                    {incident.witnesses && (
                      <div className="text-sm">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          Witnesses:{' '}
                        </span>
                        {incident.witnesses}
                      </div>
                    )}

                    {incident.notes && (
                      <div className="text-sm">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          Notes:{' '}
                        </span>
                        {incident.notes}
                      </div>
                    )}

                    {incident.photo_urls && incident.photo_urls.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                          Photos
                        </p>
                        <div className="flex gap-2">
                          {incident.photo_urls.map((url, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={i}
                              src={url}
                              alt={`Photo ${i + 1}`}
                              className="w-16 h-16 object-cover rounded-md border"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status row */}
                    <div className="flex items-center gap-3 flex-wrap pt-2 border-t text-sm">
                      <div className="flex items-center gap-1.5">
                        {incident.parent_notified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                        <span className={incident.parent_notified ? 'text-green-700' : 'text-orange-600'}>
                          {incident.parent_notified
                            ? `Parent notified ${new Date(incident.parent_notified_at!).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
                            : 'Parent not yet notified'}
                        </span>
                      </div>

                      {incident.follow_up_required && (
                        <div className="flex items-center gap-2">
                          {incident.follow_up_completed_at ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Follow-up complete
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => markFollowUpComplete(incident)}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Mark Follow-up Complete
                            </Button>
                          )}
                        </div>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs ml-auto"
                        onClick={() => setEditingIncident(incident)}
                      >
                        Edit Report
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog
        open={!!editingIncident}
        onOpenChange={(open) => { if (!open) setEditingIncident(null); }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Incident Report</DialogTitle>
          </DialogHeader>
          {editingIncident && (
            <IncidentForm
              existingIncident={editingIncident}
              onSaved={() => {
                setEditingIncident(null);
                loadData();
                onRefresh?.();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

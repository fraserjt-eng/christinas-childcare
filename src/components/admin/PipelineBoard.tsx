'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  AlertTriangle,
  Phone,
  Mail,
  CalendarDays,
  ArrowRight,
  MessageSquare,
  Clock,
} from 'lucide-react';
import {
  PipelineLead,
  PipelineActivity,
  PipelineStage,
  STAGE_LABELS,
  STAGE_ORDER,
  SOURCE_LABELS,
  ACTIVITY_LABELS,
  ActivityType,
  getLeads,
  updateLeadStage,
  addActivity,
  getActivitiesForLead,
} from '@/lib/enrollment-pipeline-storage';

// ─── Helpers ──────────────────────────────────────────────────────────

function daysSince(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

const SOURCE_COLORS: Record<string, string> = {
  website: 'bg-blue-100 text-blue-800',
  referral: 'bg-green-100 text-green-800',
  drive_by: 'bg-yellow-100 text-yellow-800',
  social_media: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-700',
};

const STAGE_HEADER_COLORS: Record<PipelineStage, string> = {
  inquiry: 'border-t-gray-300',
  tour_scheduled: 'border-t-blue-300',
  tour_completed: 'border-t-indigo-400',
  application: 'border-t-yellow-400',
  waitlist: 'border-t-orange-400',
  enrolled: 'border-t-[#C62828]',
  active: 'border-t-[#4CAF50]',
};

// ─── Lead Card ────────────────────────────────────────────────────────

function LeadCard({
  lead,
  staleThreshold,
  onClick,
}: {
  lead: PipelineLead;
  staleThreshold: number;
  onClick: () => void;
}) {
  const daysInStage = daysSince(lead.last_activity);
  const isStale = daysInStage >= staleThreshold;
  const daysInquiry = daysSince(lead.inquiry_date);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-lg p-3 shadow-sm border transition-all hover:shadow-md hover:border-gray-300 ${
        isStale ? 'border-yellow-400 border' : 'border-gray-200'
      }`}
    >
      {isStale && (
        <div className="flex items-center gap-1 text-xs text-yellow-700 mb-2 bg-yellow-50 px-2 py-1 rounded-md">
          <AlertTriangle className="h-3 w-3" />
          No activity for {daysInStage} days
        </div>
      )}
      <p className="font-semibold text-sm text-gray-900 truncate">{lead.child_name}</p>
      <p className="text-xs text-gray-500 truncate">{lead.parent_name}</p>
      <div className="mt-2 flex items-center gap-1 flex-wrap">
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SOURCE_COLORS[lead.lead_source]}`}>
          {SOURCE_LABELS[lead.lead_source]}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {daysInStage === 0 ? 'Today' : `${daysInStage}d ago`}
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          Day {daysInquiry}
        </span>
      </div>
    </button>
  );
}

// ─── Lead Detail Dialog ───────────────────────────────────────────────

function LeadDetailDialog({
  lead,
  onClose,
  onUpdate,
}: {
  lead: PipelineLead | null;
  onClose: () => void;
  onUpdate: () => void | Promise<void>;
}) {
  const [activities, setActivities] = useState<PipelineActivity[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<ActivityType>('note');
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    if (lead) {
      getActivitiesForLead(lead.id).then(setActivities);
    }
  }, [lead]);

  if (!lead) return null;

  const currentStageIdx = STAGE_ORDER.indexOf(lead.stage);
  const nextStage = currentStageIdx < STAGE_ORDER.length - 1 ? STAGE_ORDER[currentStageIdx + 1] : null;

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await addActivity(lead.id, noteType, newNote.trim());
    setNewNote('');
    const fresh = await getActivitiesForLead(lead.id);
    setActivities(fresh);
    onUpdate();
  };

  const handleAdvance = async () => {
    if (!nextStage) return;
    setAdvancing(true);
    await updateLeadStage(lead.id, nextStage);
    onUpdate();
  };

  const activityTypeOptions: { value: ActivityType; label: string }[] = [
    { value: 'note', label: 'Note' },
    { value: 'call', label: 'Phone Call' },
    { value: 'email', label: 'Email' },
    { value: 'follow_up', label: 'Follow-Up' },
  ];

  return (
    <Dialog open={!!lead} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead.child_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Contact info */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">{lead.parent_name}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Phone className="h-3 w-3" /> {lead.parent_phone}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Mail className="h-3 w-3" /> {lead.parent_email}
            </p>
          </div>

          {/* Stage + source */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-gray-100 text-gray-800">
              {STAGE_LABELS[lead.stage]}
            </Badge>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${SOURCE_COLORS[lead.lead_source]}`}>
              {SOURCE_LABELS[lead.lead_source]}
            </span>
            <span className="text-xs text-gray-400">
              Day {daysSince(lead.inquiry_date)} in pipeline
            </span>
          </div>

          {lead.notes && (
            <p className="text-sm text-gray-600 italic bg-gray-50 rounded p-2">{lead.notes}</p>
          )}

          {/* Advance stage */}
          {nextStage && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <ArrowRight className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <div className="flex-1 text-sm text-blue-800">
                Advance to <strong>{STAGE_LABELS[nextStage]}</strong>
              </div>
              <Button
                size="sm"
                onClick={handleAdvance}
                disabled={advancing}
                className="bg-[#2196F3] hover:bg-blue-700 text-white h-8"
              >
                Advance
              </Button>
            </div>
          )}

          {/* Add note */}
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              Add Activity
            </p>
            <div className="flex gap-2">
              <Select value={noteType} onValueChange={(v) => setNoteType(v as ActivityType)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activityTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Notes..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              />
            </div>
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className="bg-[#C62828] hover:bg-[#b71c1c] text-white"
            >
              Add
            </Button>
          </div>

          {/* Activity history */}
          {activities.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Activity History</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700">
                        {ACTIVITY_LABELS[act.activity_type]}
                      </span>
                      <span className="text-gray-400 mx-1">&bull;</span>
                      <span className="text-gray-500">{act.notes}</span>
                      <p className="text-gray-400 mt-0.5">
                        {new Date(act.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Column ───────────────────────────────────────────────────────────

function BoardColumn({
  stage,
  leads,
  staleThreshold,
  onCardClick,
}: {
  stage: PipelineStage;
  leads: PipelineLead[];
  staleThreshold: number;
  onCardClick: (lead: PipelineLead) => void;
}) {
  return (
    <div className={`flex-shrink-0 w-56 rounded-xl border-t-4 bg-gray-50 ${STAGE_HEADER_COLORS[stage]}`}>
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">{STAGE_LABELS[stage]}</span>
          <Badge className="bg-white text-gray-700 border border-gray-300 text-xs">
            {leads.length}
          </Badge>
        </div>
      </div>
      <div className="p-2 space-y-2 min-h-32 max-h-[28rem] overflow-y-auto">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            staleThreshold={staleThreshold}
            onClick={() => onCardClick(lead)}
          />
        ))}
        {leads.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No leads</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────

export function PipelineBoard() {
  const [leads, setLeads] = useState<PipelineLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null);

  async function load() {
    const fresh = await getLeads();
    setLeads(fresh);
  }

  useEffect(() => {
    load();
  }, []);

  const leadsByStage: Record<PipelineStage, PipelineLead[]> = {
    inquiry: [],
    tour_scheduled: [],
    tour_completed: [],
    application: [],
    waitlist: [],
    enrolled: [],
    active: [],
  };

  for (const lead of leads) {
    leadsByStage[lead.stage].push(lead);
  }

  const staleCount = leads.filter((l) => {
    if (l.stage === 'active') return false;
    return daysSince(l.last_activity) >= 7;
  }).length;

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Pipeline Board</h2>
            <p className="text-xs text-gray-500">{leads.length} total leads</p>
          </div>
          {staleCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              {staleCount} stale lead{staleCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="overflow-x-auto pb-3">
          <div className="flex gap-3 min-w-max">
            {STAGE_ORDER.map((stage) => (
              <BoardColumn
                key={stage}
                stage={stage}
                leads={leadsByStage[stage]}
                staleThreshold={7}
                onCardClick={(lead) => setSelectedLead(lead)}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Cards with a yellow border have had no activity in 7 or more days. Click any card to view details or advance the lead.
        </p>
      </div>

      <LeadDetailDialog
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={async () => {
          const freshLeads = await getLeads();
          setLeads(freshLeads);
          setSelectedLead((prev) =>
            prev ? (freshLeads.find((l) => l.id === prev.id) ?? null) : null
          );
        }}
      />
    </>
  );
}

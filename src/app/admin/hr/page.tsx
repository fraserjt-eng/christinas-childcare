'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  ArrowLeft,
  Eye,
  Users,
  ClipboardList,
  AlertTriangle,
  Lock,
  Unlock,
  ChevronRight,
  Download,
  CheckCircle2,
  Clock,
  Calendar,
  X,
} from 'lucide-react';
import {
  HRTemplate,
  HRDocument,
  DisciplineRecord,
  TemplateField,
  DISCIPLINE_LEVELS,
  HR_TEMPLATE_TYPES,
  SYSTEM_TEMPLATES,
  generateHRDocId,
  generateTemplateId,
  generateDisciplineId,
} from '@/types/hr';
import { useToast } from '@/hooks/use-toast';

// ─── Constants ──────────────────────────────────────────────────────

const STORAGE_KEYS = {
  templates: 'christinas_hr_templates',
  documents: 'christinas_hr_documents',
  discipline: 'christinas_discipline_records',
};

const EMPLOYEES = [
  'Christina Fraser',
  'Sarah Johnson',
  'Maria Garcia',
  'James Wilson',
  'Emily Chen',
  'David Kim',
  'Ashley Brown',
  'Michael Davis',
];

type TabValue = 'templates' | 'documents' | 'discipline';

// ─── Helpers ────────────────────────────────────────────────────────

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getTypeLabel(type: HRTemplate['type']): string {
  const found = HR_TEMPLATE_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

function getTypeBadgeColor(type: HRTemplate['type']): string {
  switch (type) {
    case 'offer_letter':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'onboarding_checklist':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'performance_review':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'corrective_action':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'termination':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'policy_ack':
      return 'bg-teal-100 text-teal-800 border-teal-300';
    case 'custom':
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

function getStatusBadgeColor(status: HRDocument['status']): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'pending_signature':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'signed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'filed':
      return 'bg-blue-100 text-blue-800 border-blue-300';
  }
}

function getStatusLabel(status: HRDocument['status']): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'pending_signature':
      return 'Pending';
    case 'signed':
      return 'Signed';
    case 'filed':
      return 'Filed';
  }
}

const STATUS_FLOW: HRDocument['status'][] = ['draft', 'pending_signature', 'signed', 'filed'];

function nextStatus(current: HRDocument['status']): HRDocument['status'] | null {
  const idx = STATUS_FLOW.indexOf(current);
  return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
}

function getDisciplineLevelColor(level: DisciplineRecord['level']): string {
  const found = DISCIPLINE_LEVELS.find((l) => l.value === level);
  return found ? found.color : '#666';
}

function getDisciplineLevelLabel(level: DisciplineRecord['level']): string {
  const found = DISCIPLINE_LEVELS.find((l) => l.value === level);
  return found ? found.label : level;
}

// ─── Seed Data ──────────────────────────────────────────────────────

function buildSystemTemplates(): HRTemplate[] {
  return SYSTEM_TEMPLATES.map((st, idx) => ({
    ...st,
    id: `sys_tpl_${idx}`,
    created_at: '2025-01-15T00:00:00Z',
  }));
}

function buildSeedDocuments(templates: HRTemplate[]): HRDocument[] {
  const offerTemplate = templates.find((t) => t.type === 'offer_letter');
  const onboardingTemplate = templates.find((t) => t.type === 'onboarding_checklist');

  const docs: HRDocument[] = [];

  if (offerTemplate) {
    docs.push({
      id: 'seed_doc_1',
      employee_id: 'emp_sarah',
      employee_name: 'Sarah Johnson',
      template_id: offerTemplate.id,
      template_name: offerTemplate.name,
      type: 'offer_letter',
      title: 'Offer Letter - Sarah Johnson',
      field_values: {
        f1: 'Lead Teacher - Preschool',
        f2: '2025-03-01',
        f3: '$18.50',
        f4: 'Mon-Fri 7:30am - 4:00pm',
        f5: 'Crystal Center',
        f6: '',
        f7: '',
        f8: '',
      },
      status: 'signed',
      signed_at: '2025-02-20T14:30:00Z',
      signed_by: 'Sarah Johnson',
      created_by: 'Christina Fraser',
      created_at: '2025-02-15T10:00:00Z',
      updated_at: '2025-02-20T14:30:00Z',
    });
  }

  if (onboardingTemplate) {
    docs.push({
      id: 'seed_doc_2',
      employee_id: 'emp_emily',
      employee_name: 'Emily Chen',
      template_id: onboardingTemplate.id,
      template_name: onboardingTemplate.name,
      type: 'onboarding_checklist',
      title: 'Onboarding Checklist - Emily Chen',
      field_values: {
        f1: 'true',
        f2: 'true',
        f3: 'true',
        f4: 'true',
        f5: 'false',
        f6: 'false',
        f7: 'true',
        f8: 'false',
        f9: 'false',
        f10: 'false',
        f11: '',
        f12: '',
      },
      status: 'pending_signature',
      created_by: 'Christina Fraser',
      created_at: '2025-03-01T09:00:00Z',
      updated_at: '2025-03-01T09:00:00Z',
    });
  }

  return docs;
}

function buildSeedDiscipline(): DisciplineRecord[] {
  return [
    {
      id: 'seed_disc_1',
      employee_id: 'emp_david',
      employee_name: 'David Kim',
      level: 'verbal',
      reason: 'Late arrival to shift',
      details:
        'David arrived 25 minutes late on March 3rd without prior notice, leaving the toddler room short-staffed during morning drop-off. This is the third occurrence in the past month.',
      improvement_plan:
        'Set a personal alarm 15 minutes earlier. Communicate any potential delays to the director by 6:30am at the latest.',
      follow_up_date: '2025-04-03',
      issued_by: 'Christina Fraser',
      witness: 'Maria Garcia',
      employee_acknowledged: true,
      acknowledged_at: '2025-03-03T16:00:00Z',
      created_at: '2025-03-03T15:30:00Z',
    },
  ];
}

// ─── Main Component ─────────────────────────────────────────────────

export default function HROnboardingPage() {
  const { toast } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<TabValue>('templates');
  const [templates, setTemplates] = useState<HRTemplate[]>([]);
  const [documents, setDocuments] = useState<HRDocument[]>([]);
  const [disciplineRecords, setDisciplineRecords] = useState<DisciplineRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Template state
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState<HRTemplate | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateType, setNewTemplateType] = useState<HRTemplate['type']>('custom');
  const [newTemplateFields, setNewTemplateFields] = useState<TemplateField[]>([]);

  // Document state
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<HRDocument | null>(null);
  const [newDocEmployee, setNewDocEmployee] = useState('');
  const [newDocTemplateId, setNewDocTemplateId] = useState('');
  const [newDocFieldValues, setNewDocFieldValues] = useState<Record<string, string>>({});

  // Discipline state
  const [showDisciplineForm, setShowDisciplineForm] = useState(false);
  const [newDiscEmployee, setNewDiscEmployee] = useState('');
  const [newDiscLevel, setNewDiscLevel] = useState<DisciplineRecord['level']>('verbal');
  const [newDiscReason, setNewDiscReason] = useState('');
  const [newDiscDetails, setNewDiscDetails] = useState('');
  const [newDiscPlan, setNewDiscPlan] = useState('');
  const [newDiscFollowUp, setNewDiscFollowUp] = useState('');
  const [newDiscWitness, setNewDiscWitness] = useState('');

  // ─── Load from localStorage ─────────────────────────────────────

  useEffect(() => {
    const storedTemplates = localStorage.getItem(STORAGE_KEYS.templates);
    const storedDocuments = localStorage.getItem(STORAGE_KEYS.documents);
    const storedDiscipline = localStorage.getItem(STORAGE_KEYS.discipline);

    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    } else {
      const seed = buildSystemTemplates();
      setTemplates(seed);
      localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(seed));
    }

    if (storedDocuments) {
      setDocuments(JSON.parse(storedDocuments));
    } else {
      const tpls = storedTemplates ? JSON.parse(storedTemplates) : buildSystemTemplates();
      const seed = buildSeedDocuments(tpls);
      setDocuments(seed);
      localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(seed));
    }

    if (storedDiscipline) {
      setDisciplineRecords(JSON.parse(storedDiscipline));
    } else {
      const seed = buildSeedDiscipline();
      setDisciplineRecords(seed);
      localStorage.setItem(STORAGE_KEYS.discipline, JSON.stringify(seed));
    }

    setIsLoaded(true);
  }, []);

  // ─── Persist helpers ────────────────────────────────────────────

  const persistTemplates = useCallback(
    (data: HRTemplate[]) => {
      setTemplates(data);
      localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(data));
    },
    []
  );

  const persistDocuments = useCallback(
    (data: HRDocument[]) => {
      setDocuments(data);
      localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(data));
    },
    []
  );

  const persistDiscipline = useCallback(
    (data: DisciplineRecord[]) => {
      setDisciplineRecords(data);
      localStorage.setItem(STORAGE_KEYS.discipline, JSON.stringify(data));
    },
    []
  );

  // ─── Template actions ───────────────────────────────────────────

  function addFieldToTemplate() {
    setNewTemplateFields((prev) => [
      ...prev,
      {
        id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        label: '',
        type: 'text',
        required: false,
        options: [],
      },
    ]);
  }

  function updateTemplateField(index: number, updates: Partial<TemplateField>) {
    setNewTemplateFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  }

  function removeTemplateField(index: number) {
    setNewTemplateFields((prev) => prev.filter((_, i) => i !== index));
  }

  function resetTemplateForm() {
    setNewTemplateName('');
    setNewTemplateType('custom');
    setNewTemplateFields([]);
    setShowTemplateForm(false);
  }

  function saveTemplate() {
    if (!newTemplateName.trim()) {
      toast({ title: 'Template name is required', variant: 'destructive' });
      return;
    }
    if (newTemplateFields.length === 0) {
      toast({ title: 'Add at least one field', variant: 'destructive' });
      return;
    }
    const hasEmptyLabels = newTemplateFields.some((f) => !f.label.trim());
    if (hasEmptyLabels) {
      toast({ title: 'All fields must have labels', variant: 'destructive' });
      return;
    }

    const template: HRTemplate = {
      id: generateTemplateId(),
      name: newTemplateName.trim(),
      type: newTemplateType,
      fields: newTemplateFields,
      is_system: false,
      created_at: new Date().toISOString(),
    };

    persistTemplates([...templates, template]);
    resetTemplateForm();
    toast({ title: 'Template created successfully' });
  }

  // ─── Document actions ───────────────────────────────────────────

  function resetDocumentForm() {
    setNewDocEmployee('');
    setNewDocTemplateId('');
    setNewDocFieldValues({});
    setShowDocumentForm(false);
  }

  function handleTemplateSelection(templateId: string) {
    setNewDocTemplateId(templateId);
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      const defaultValues: Record<string, string> = {};
      tpl.fields.forEach((f) => {
        defaultValues[f.id] = f.default_value || '';
      });
      setNewDocFieldValues(defaultValues);
    }
  }

  function saveDocument() {
    if (!newDocEmployee) {
      toast({ title: 'Select an employee', variant: 'destructive' });
      return;
    }
    if (!newDocTemplateId) {
      toast({ title: 'Select a template', variant: 'destructive' });
      return;
    }

    const tpl = templates.find((t) => t.id === newDocTemplateId);
    if (!tpl) return;

    const doc: HRDocument = {
      id: generateHRDocId(),
      employee_id: `emp_${newDocEmployee.toLowerCase().replace(/\s+/g, '_')}`,
      employee_name: newDocEmployee,
      template_id: tpl.id,
      template_name: tpl.name,
      type: tpl.type,
      title: `${tpl.name} - ${newDocEmployee}`,
      field_values: { ...newDocFieldValues },
      status: 'draft',
      created_by: 'Christina Fraser',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    persistDocuments([doc, ...documents]);
    resetDocumentForm();
    toast({ title: 'Document created as draft' });
  }

  function advanceDocumentStatus(docId: string) {
    const updated = documents.map((d) => {
      if (d.id !== docId) return d;
      const next = nextStatus(d.status);
      if (!next) return d;
      return {
        ...d,
        status: next,
        updated_at: new Date().toISOString(),
        ...(next === 'signed'
          ? { signed_at: new Date().toISOString(), signed_by: d.employee_name }
          : {}),
      };
    });
    persistDocuments(updated);
    setViewingDocument(updated.find((d) => d.id === docId) || null);
    toast({ title: 'Status updated' });
  }

  function handleGeneratePDF() {
    toast({ title: 'PDF generation coming soon', description: 'This feature is under development.' });
  }

  // ─── Discipline actions ─────────────────────────────────────────

  function resetDisciplineForm() {
    setNewDiscEmployee('');
    setNewDiscLevel('verbal');
    setNewDiscReason('');
    setNewDiscDetails('');
    setNewDiscPlan('');
    setNewDiscFollowUp('');
    setNewDiscWitness('');
    setShowDisciplineForm(false);
  }

  function saveDisciplineRecord() {
    if (!newDiscEmployee) {
      toast({ title: 'Select an employee', variant: 'destructive' });
      return;
    }
    if (!newDiscReason.trim()) {
      toast({ title: 'Reason is required', variant: 'destructive' });
      return;
    }
    if (!newDiscDetails.trim()) {
      toast({ title: 'Details are required', variant: 'destructive' });
      return;
    }

    const record: DisciplineRecord = {
      id: generateDisciplineId(),
      employee_id: `emp_${newDiscEmployee.toLowerCase().replace(/\s+/g, '_')}`,
      employee_name: newDiscEmployee,
      level: newDiscLevel,
      reason: newDiscReason.trim(),
      details: newDiscDetails.trim(),
      improvement_plan: newDiscPlan.trim() || undefined,
      follow_up_date: newDiscFollowUp || undefined,
      issued_by: 'Christina Fraser',
      witness: newDiscWitness.trim() || undefined,
      employee_acknowledged: false,
      created_at: new Date().toISOString(),
    };

    persistDiscipline([record, ...disciplineRecords]);
    resetDisciplineForm();
    toast({ title: 'Discipline record created' });
  }

  function toggleAcknowledgment(recordId: string) {
    const updated = disciplineRecords.map((r) => {
      if (r.id !== recordId) return r;
      return {
        ...r,
        employee_acknowledged: !r.employee_acknowledged,
        acknowledged_at: !r.employee_acknowledged ? new Date().toISOString() : undefined,
      };
    });
    persistDiscipline(updated);
    toast({ title: 'Acknowledgment updated' });
  }

  // ─── Loading state ──────────────────────────────────────────────

  if (!isLoaded) {
    return (
      <DashboardLayout isAdmin>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading HR data...</div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Template detail view ───────────────────────────────────────

  if (viewingTemplate) {
    return (
      <DashboardLayout isAdmin>
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          <button
            onClick={() => setViewingTemplate(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </button>

          <div className="flex items-center gap-3">
            <FileText className="h-7 w-7 text-[#C62828]" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{viewingTemplate.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getTypeBadgeColor(viewingTemplate.type)}>
                  {getTypeLabel(viewingTemplate.type)}
                </Badge>
                {viewingTemplate.is_system ? (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    System Template
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Unlock className="h-3 w-3" />
                    Custom
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Template Fields ({viewingTemplate.fields.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {viewingTemplate.fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="flex items-start gap-4 p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#C62828]/10 text-[#C62828] text-sm font-semibold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{field.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {field.type}
                        </Badge>
                        {field.required && (
                          <Badge className="text-xs bg-red-100 text-red-700 border-red-300">
                            Required
                          </Badge>
                        )}
                      </div>
                      {field.options && field.options.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Options: {field.options.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Document detail view ──────────────────────────────────────

  if (viewingDocument) {
    const tpl = templates.find((t) => t.id === viewingDocument.template_id);
    const next = nextStatus(viewingDocument.status);

    return (
      <DashboardLayout isAdmin>
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          <button
            onClick={() => setViewingDocument(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Documents
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <FileText className="h-7 w-7 text-[#C62828]" />
              <div>
                <h1 className="text-2xl font-bold">{viewingDocument.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getTypeBadgeColor(viewingDocument.type)}>
                    {getTypeLabel(viewingDocument.type)}
                  </Badge>
                  <Badge className={getStatusBadgeColor(viewingDocument.status)}>
                    {getStatusLabel(viewingDocument.status)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {next && (
                <button
                  onClick={() => advanceDocumentStatus(viewingDocument.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-[#C62828] text-white hover:bg-[#B71C1C] transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                  Move to {getStatusLabel(next)}
                </button>
              )}
              <button
                onClick={handleGeneratePDF}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                Generate PDF
              </button>
            </div>
          </div>

          {/* Document meta */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Employee</p>
                  <p className="font-medium">{viewingDocument.employee_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(viewingDocument.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created By</p>
                  <p className="font-medium">{viewingDocument.created_by || 'N/A'}</p>
                </div>
                {viewingDocument.signed_at && (
                  <div>
                    <p className="text-muted-foreground">Signed</p>
                    <p className="font-medium">
                      {formatDate(viewingDocument.signed_at)} by {viewingDocument.signed_by}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status progression */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 flex-wrap">
                {STATUS_FLOW.map((s, idx) => {
                  const isCurrent = s === viewingDocument.status;
                  const isPast = STATUS_FLOW.indexOf(s) < STATUS_FLOW.indexOf(viewingDocument.status);
                  return (
                    <div key={s} className="flex items-center gap-2">
                      {idx > 0 && (
                        <ChevronRight className={`h-4 w-4 ${isPast ? 'text-green-500' : 'text-gray-300'}`} />
                      )}
                      <div
                        className={`
                          px-3 py-1.5 rounded-full text-sm font-medium border
                          ${isCurrent ? 'bg-[#C62828] text-white border-[#C62828]' : ''}
                          ${isPast ? 'bg-green-100 text-green-800 border-green-300' : ''}
                          ${!isCurrent && !isPast ? 'bg-gray-50 text-gray-400 border-gray-200' : ''}
                        `}
                      >
                        {isPast && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                        {getStatusLabel(s)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Field values */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tpl?.fields.map((field) => {
                  const value = viewingDocument.field_values[field.id] || '';
                  return (
                    <div key={field.id} className="space-y-1">
                      <Label className="text-sm text-muted-foreground">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {field.type === 'checkbox' ? (
                        <div className="flex items-center gap-2">
                          <Checkbox checked={value === 'true'} disabled />
                          <span className="text-sm">{value === 'true' ? 'Completed' : 'Not completed'}</span>
                        </div>
                      ) : field.type === 'signature' ? (
                        <div className="p-3 border rounded-md bg-muted/30 text-sm italic text-muted-foreground">
                          {value || 'Awaiting signature'}
                        </div>
                      ) : (
                        <div className="p-3 border rounded-md bg-muted/30 text-sm">
                          {value || <span className="text-muted-foreground italic">Not provided</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
                {!tpl && (
                  <p className="text-sm text-muted-foreground italic">
                    Template not found. Raw field values:
                  </p>
                )}
                {!tpl &&
                  Object.entries(viewingDocument.field_values).map(([key, val]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-sm text-muted-foreground">{key}</Label>
                      <div className="p-3 border rounded-md bg-muted/30 text-sm">{val || 'N/A'}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Main render ────────────────────────────────────────────────

  const selectedDocTemplate = templates.find((t) => t.id === newDocTemplateId);
  const sortedDocuments = [...documents].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Group discipline records by employee
  const disciplineByEmployee = disciplineRecords.reduce<Record<string, DisciplineRecord[]>>(
    (acc, r) => {
      if (!acc[r.employee_name]) acc[r.employee_name] = [];
      acc[r.employee_name].push(r);
      return acc;
    },
    {}
  );

  return (
    <DashboardLayout isAdmin>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-[#C62828]" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">HR & Onboarding</h1>
            <p className="text-muted-foreground">
              Manage templates, employee documents, and discipline records
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('templates')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#C62828]/10">
                  <ClipboardList className="h-5 w-5 text-[#C62828]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{templates.length}</p>
                  <p className="text-sm text-muted-foreground">Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('documents')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{documents.length}</p>
                  <p className="text-sm text-muted-foreground">Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('discipline')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{disciplineRecords.length}</p>
                  <p className="text-sm text-muted-foreground">Discipline Records</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab bar */}
        <div className="flex border-b">
          {(['templates', 'documents', 'discipline'] as TabValue[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize
                ${
                  activeTab === tab
                    ? 'border-[#C62828] text-[#C62828]'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ═══════════════════ TEMPLATES TAB ═══════════════════ */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">HR Templates</h2>
              <button
                onClick={() => setShowTemplateForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-[#C62828] text-white hover:bg-[#B71C1C] transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Template
              </button>
            </div>

            <div className="grid gap-3">
              {templates.map((tpl) => (
                <Card
                  key={tpl.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setViewingTemplate(tpl)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-muted shrink-0">
                          <FileText className="h-5 w-5 text-[#C62828]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium truncate">{tpl.name}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge className={`text-xs ${getTypeBadgeColor(tpl.type)}`}>
                              {getTypeLabel(tpl.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {tpl.fields.length} field{tpl.fields.length !== 1 ? 's' : ''}
                            </span>
                            {tpl.is_system ? (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Lock className="h-3 w-3" />
                                System
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Unlock className="h-3 w-3" />
                                Custom
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* New Template Dialog */}
            <Dialog open={showTemplateForm} onOpenChange={(open) => { if (!open) resetTemplateForm(); }}>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      placeholder="e.g., New Hire Orientation Checklist"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Template Type</Label>
                    <Select value={newTemplateType} onValueChange={(v) => setNewTemplateType(v as HRTemplate['type'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HR_TEMPLATE_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fields */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Fields ({newTemplateFields.length})</Label>
                      <button
                        onClick={addFieldToTemplate}
                        className="inline-flex items-center gap-1 text-sm text-[#C62828] hover:text-[#B71C1C] font-medium"
                      >
                        <Plus className="h-3 w-3" />
                        Add Field
                      </button>
                    </div>

                    {newTemplateFields.length === 0 && (
                      <p className="text-sm text-muted-foreground italic py-4 text-center">
                        No fields yet. Click &quot;Add Field&quot; to get started.
                      </p>
                    )}

                    {newTemplateFields.map((field, idx) => (
                      <div key={field.id} className="p-3 border rounded-lg space-y-3 bg-muted/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Field {idx + 1}
                          </span>
                          <button
                            onClick={() => removeTemplateField(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Label</Label>
                            <Input
                              value={field.label}
                              onChange={(e) => updateTemplateField(idx, { label: e.target.value })}
                              placeholder="Field label"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={field.type}
                              onValueChange={(v) =>
                                updateTemplateField(idx, { type: v as TemplateField['type'] })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="textarea">Textarea</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="signature">Signature</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                                <SelectItem value="select">Select</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={field.required}
                            onCheckedChange={(checked) =>
                              updateTemplateField(idx, { required: checked === true })
                            }
                          />
                          <Label className="text-sm cursor-pointer">Required</Label>
                        </div>
                        {field.type === 'select' && (
                          <div className="space-y-1">
                            <Label className="text-xs">Options (comma-separated)</Label>
                            <Input
                              value={(field.options || []).join(', ')}
                              onChange={(e) =>
                                updateTemplateField(idx, {
                                  options: e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                })
                              }
                              placeholder="Option 1, Option 2, Option 3"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={resetTemplateForm}
                      className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveTemplate}
                      className="px-4 py-2 text-sm font-medium rounded-md bg-[#C62828] text-white hover:bg-[#B71C1C] transition-colors"
                    >
                      Create Template
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* ═══════════════════ DOCUMENTS TAB ═══════════════════ */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">HR Documents</h2>
              <button
                onClick={() => setShowDocumentForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-[#C62828] text-white hover:bg-[#B71C1C] transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Document
              </button>
            </div>

            {sortedDocuments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">No documents yet. Create one to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {sortedDocuments.map((doc) => (
                  <Card
                    key={doc.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setViewingDocument(doc)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-muted shrink-0">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium truncate">{doc.title}</h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-sm text-muted-foreground">{doc.employee_name}</span>
                              <span className="text-muted-foreground">|</span>
                              <Badge className={`text-xs ${getTypeBadgeColor(doc.type)}`}>
                                {getTypeLabel(doc.type)}
                              </Badge>
                              <Badge className={`text-xs ${getStatusBadgeColor(doc.status)}`}>
                                {getStatusLabel(doc.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</p>
                          <Eye className="h-4 w-4 text-muted-foreground ml-auto mt-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* New Document Dialog */}
            <Dialog open={showDocumentForm} onOpenChange={(open) => { if (!open) resetDocumentForm(); }}>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Employee</Label>
                    <Select value={newDocEmployee} onValueChange={setNewDocEmployee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee..." />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYEES.map((emp) => (
                          <SelectItem key={emp} value={emp}>
                            {emp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select value={newDocTemplateId} onValueChange={handleTemplateSelection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((tpl) => (
                          <SelectItem key={tpl.id} value={tpl.id}>
                            {tpl.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Auto-populated fields from template */}
                  {selectedDocTemplate && (
                    <div className="space-y-3 pt-2 border-t">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                        Document Fields
                      </Label>
                      {selectedDocTemplate.fields.map((field) => (
                        <div key={field.id} className="space-y-1">
                          <Label className="text-sm">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {field.type === 'text' && (
                            <Input
                              value={newDocFieldValues[field.id] || ''}
                              onChange={(e) =>
                                setNewDocFieldValues((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                            />
                          )}
                          {field.type === 'textarea' && (
                            <Textarea
                              value={newDocFieldValues[field.id] || ''}
                              onChange={(e) =>
                                setNewDocFieldValues((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                              rows={3}
                            />
                          )}
                          {field.type === 'date' && (
                            <Input
                              type="date"
                              value={newDocFieldValues[field.id] || ''}
                              onChange={(e) =>
                                setNewDocFieldValues((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                            />
                          )}
                          {field.type === 'checkbox' && (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={newDocFieldValues[field.id] === 'true'}
                                onCheckedChange={(checked) =>
                                  setNewDocFieldValues((prev) => ({
                                    ...prev,
                                    [field.id]: checked ? 'true' : 'false',
                                  }))
                                }
                              />
                              <span className="text-sm text-muted-foreground">
                                {newDocFieldValues[field.id] === 'true' ? 'Yes' : 'No'}
                              </span>
                            </div>
                          )}
                          {field.type === 'select' && field.options && (
                            <Select
                              value={newDocFieldValues[field.id] || ''}
                              onValueChange={(v) =>
                                setNewDocFieldValues((prev) => ({
                                  ...prev,
                                  [field.id]: v,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options.map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {field.type === 'signature' && (
                            <Input
                              placeholder="Type name as signature"
                              value={newDocFieldValues[field.id] || ''}
                              onChange={(e) =>
                                setNewDocFieldValues((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={resetDocumentForm}
                      className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveDocument}
                      className="px-4 py-2 text-sm font-medium rounded-md bg-[#C62828] text-white hover:bg-[#B71C1C] transition-colors"
                    >
                      Create Document
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* ═══════════════════ DISCIPLINE TAB ═══════════════════ */}
        {activeTab === 'discipline' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Discipline Records</h2>
              <button
                onClick={() => setShowDisciplineForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-[#C62828] text-white hover:bg-[#B71C1C] transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Record
              </button>
            </div>

            {/* Progressive discipline legend */}
            <Card>
              <CardContent className="py-3">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-xs text-muted-foreground mr-2">Levels:</span>
                  {DISCIPLINE_LEVELS.map((level, idx) => (
                    <div key={level.value} className="flex items-center gap-1">
                      {idx > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: level.color }}
                      >
                        {level.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {Object.keys(disciplineByEmployee).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">No discipline records. Hopefully it stays that way.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(disciplineByEmployee)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([employeeName, records]) => {
                    const sorted = [...records].sort(
                      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );
                    return (
                      <Card key={employeeName}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4 text-[#C62828]" />
                            {employeeName}
                            <Badge variant="outline" className="ml-auto text-xs">
                              {records.length} record{records.length !== 1 ? 's' : ''}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="relative pl-6 space-y-4">
                            {/* Timeline line */}
                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200" />

                            {sorted.map((record) => (
                              <div key={record.id} className="relative">
                                {/* Timeline dot */}
                                <div
                                  className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white"
                                  style={{ backgroundColor: getDisciplineLevelColor(record.level) }}
                                />

                                <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
                                  <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span
                                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                          style={{ backgroundColor: getDisciplineLevelColor(record.level) }}
                                        >
                                          {getDisciplineLevelLabel(record.level)}
                                        </span>
                                        {record.employee_acknowledged ? (
                                          <Badge className="bg-green-100 text-green-800 border-green-300 text-xs gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Acknowledged
                                          </Badge>
                                        ) : (
                                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs gap-1">
                                            <Clock className="h-3 w-3" />
                                            Pending
                                          </Badge>
                                        )}
                                      </div>
                                      <h4 className="font-medium">{record.reason}</h4>
                                    </div>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {formatDate(record.created_at)}
                                    </span>
                                  </div>

                                  <p className="text-sm text-muted-foreground">{record.details}</p>

                                  {record.improvement_plan && (
                                    <div className="text-sm">
                                      <span className="font-medium">Improvement Plan:</span>{' '}
                                      <span className="text-muted-foreground">{record.improvement_plan}</span>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                    <span>Issued by: {record.issued_by}</span>
                                    {record.witness && <span>Witness: {record.witness}</span>}
                                    {record.follow_up_date && (
                                      <span>Follow-up: {formatDate(record.follow_up_date)}</span>
                                    )}
                                  </div>

                                  {!record.employee_acknowledged && (
                                    <button
                                      onClick={() => toggleAcknowledgment(record.id)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                                    >
                                      <CheckCircle2 className="h-3 w-3" />
                                      Mark Acknowledged
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}

            {/* New Discipline Dialog */}
            <Dialog open={showDisciplineForm} onOpenChange={(open) => { if (!open) resetDisciplineForm(); }}>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Discipline Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Employee</Label>
                    <Select value={newDiscEmployee} onValueChange={setNewDiscEmployee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee..." />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYEES.map((emp) => (
                          <SelectItem key={emp} value={emp}>
                            {emp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Discipline Level</Label>
                    <Select value={newDiscLevel} onValueChange={(v) => setNewDiscLevel(v as DisciplineRecord['level'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DISCIPLINE_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full inline-block"
                                style={{ backgroundColor: level.color }}
                              />
                              {level.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Input
                      placeholder="Brief reason for the action"
                      value={newDiscReason}
                      onChange={(e) => setNewDiscReason(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Details</Label>
                    <Textarea
                      placeholder="Describe the incident, context, and any prior discussions..."
                      value={newDiscDetails}
                      onChange={(e) => setNewDiscDetails(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Improvement Plan (optional)</Label>
                    <Textarea
                      placeholder="What steps should the employee take to improve?"
                      value={newDiscPlan}
                      onChange={(e) => setNewDiscPlan(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Follow-up Date (optional)</Label>
                      <Input
                        type="date"
                        value={newDiscFollowUp}
                        onChange={(e) => setNewDiscFollowUp(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Witness (optional)</Label>
                      <Input
                        placeholder="Witness name"
                        value={newDiscWitness}
                        onChange={(e) => setNewDiscWitness(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={resetDisciplineForm}
                      className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveDisciplineRecord}
                      className="px-4 py-2 text-sm font-medium rounded-md bg-[#C62828] text-white hover:bg-[#B71C1C] transition-colors"
                    >
                      Create Record
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

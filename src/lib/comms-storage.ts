// Communications Storage Module for Christina's Child Care Center
// localStorage for demo mode, designed for Supabase migration

export type CommunicationType = 'announcement' | 'individual' | 'daily_update' | 'template';
export type AudienceType = 'all' | 'classroom' | 'individual';
export type CommunicationStatus = 'draft' | 'scheduled' | 'sent';

export interface Communication {
  id: string;
  center_id?: string;
  type: CommunicationType;
  subject: string;
  body_html: string;
  audience_type: AudienceType;
  audience_ids?: string[]; // classroom IDs or parent IDs
  template_name?: string;
  scheduled_for?: string;
  sent_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CommunicationRead {
  id: string;
  communication_id: string;
  parent_id: string;
  read_at: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  category: 'closure' | 'illness' | 'field_trip' | 'supply_request' | 'fee_reminder' | 'positive_update' | 'custom';
  merge_fields: string[]; // e.g., ['{child_name}', '{classroom}', '{date}']
  created_at: string;
}

export const TEMPLATE_CATEGORIES: Record<string, string> = {
  closure: 'Closure Notice',
  illness: 'Illness Notification',
  field_trip: 'Field Trip Permission',
  supply_request: 'Supply Request',
  fee_reminder: 'Fee Reminder',
  positive_update: 'Positive Update',
  custom: 'Custom',
};

const COMMS_KEY = 'christinas_communications';
const READS_KEY = 'christinas_comm_reads';
const TEMPLATES_KEY = 'christinas_comm_templates';

function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Communications CRUD

export async function getCommunications(filters?: {
  type?: CommunicationType;
  status?: CommunicationStatus;
  search?: string;
}): Promise<Communication[]> {
  let comms = getFromStorage<Communication>(COMMS_KEY);

  if (filters) {
    if (filters.type) {
      comms = comms.filter(c => c.type === filters.type);
    }
    if (filters.status) {
      if (filters.status === 'sent') {
        comms = comms.filter(c => c.sent_at);
      } else if (filters.status === 'scheduled') {
        comms = comms.filter(c => c.scheduled_for && !c.sent_at);
      } else {
        comms = comms.filter(c => !c.sent_at && !c.scheduled_for);
      }
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      comms = comms.filter(c =>
        c.subject.toLowerCase().includes(q) ||
        c.body_html.toLowerCase().includes(q)
      );
    }
  }

  comms.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return comms;
}

export async function createCommunication(
  data: Omit<Communication, 'id' | 'created_at' | 'updated_at'>
): Promise<Communication> {
  const comms = getFromStorage<Communication>(COMMS_KEY);
  const now = new Date().toISOString();

  const comm: Communication = {
    ...data,
    id: generateId('comm'),
    created_at: now,
    updated_at: now,
  };

  comms.push(comm);
  saveToStorage(COMMS_KEY, comms);
  return comm;
}

export async function updateCommunication(
  id: string,
  updates: Partial<Communication>
): Promise<Communication | null> {
  const comms = getFromStorage<Communication>(COMMS_KEY);
  const index = comms.findIndex(c => c.id === id);
  if (index === -1) return null;

  comms[index] = {
    ...comms[index],
    ...updates,
    id: comms[index].id,
    created_at: comms[index].created_at,
    updated_at: new Date().toISOString(),
  };

  saveToStorage(COMMS_KEY, comms);
  return comms[index];
}

export async function sendCommunication(id: string): Promise<Communication | null> {
  return updateCommunication(id, { sent_at: new Date().toISOString() });
}

export async function deleteCommunication(id: string): Promise<boolean> {
  const comms = getFromStorage<Communication>(COMMS_KEY);
  const filtered = comms.filter(c => c.id !== id);
  if (filtered.length === comms.length) return false;
  saveToStorage(COMMS_KEY, filtered);
  return true;
}

// Read receipts

export async function markAsRead(communicationId: string, parentId: string): Promise<void> {
  const reads = getFromStorage<CommunicationRead>(READS_KEY);
  const exists = reads.find(r => r.communication_id === communicationId && r.parent_id === parentId);
  if (exists) return;

  reads.push({
    id: generateId('read'),
    communication_id: communicationId,
    parent_id: parentId,
    read_at: new Date().toISOString(),
  });
  saveToStorage(READS_KEY, reads);
}

export async function getReadCounts(commIds: string[]): Promise<Record<string, number>> {
  const reads = getFromStorage<CommunicationRead>(READS_KEY);
  const counts: Record<string, number> = {};
  for (const id of commIds) {
    counts[id] = reads.filter(r => r.communication_id === id).length;
  }
  return counts;
}

// Templates

export async function getTemplates(): Promise<MessageTemplate[]> {
  let templates = getFromStorage<MessageTemplate>(TEMPLATES_KEY);
  if (templates.length === 0) {
    templates = getDefaultTemplates();
    saveToStorage(TEMPLATES_KEY, templates);
  }
  return templates;
}

export async function createTemplate(
  data: Omit<MessageTemplate, 'id' | 'created_at'>
): Promise<MessageTemplate> {
  const templates = getFromStorage<MessageTemplate>(TEMPLATES_KEY);
  const template: MessageTemplate = {
    ...data,
    id: generateId('tmpl'),
    created_at: new Date().toISOString(),
  };
  templates.push(template);
  saveToStorage(TEMPLATES_KEY, templates);
  return template;
}

function getDefaultTemplates(): MessageTemplate[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'tmpl_default_1',
      name: 'Closure Notice',
      subject: 'Center Closure: {date}',
      body_html: '<p>Dear families,</p><p>Please be advised that our center will be closed on <strong>{date}</strong> due to {reason}.</p><p>Normal operations will resume the following business day. If you need to make alternative care arrangements, please contact us.</p><p>Thank you for your understanding.</p>',
      category: 'closure',
      merge_fields: ['{date}', '{reason}'],
      created_at: now,
    },
    {
      id: 'tmpl_default_2',
      name: 'Illness Alert',
      subject: 'Health Notice: {illness_type} in {classroom}',
      body_html: '<p>Dear {classroom} families,</p><p>We want to make you aware that a case of <strong>{illness_type}</strong> has been reported in your child\'s classroom.</p><p>Please monitor your child for symptoms and keep them home if they show signs of illness. We have increased our sanitization procedures.</p><p>If you have questions, please reach out.</p>',
      category: 'illness',
      merge_fields: ['{illness_type}', '{classroom}'],
      created_at: now,
    },
    {
      id: 'tmpl_default_3',
      name: 'Positive Update',
      subject: 'Great day for {child_name}!',
      body_html: '<p>Hi there!</p><p>We wanted to share a wonderful moment from {child_name}\'s day:</p><p>{update_text}</p><p>It\'s so great to see {child_name} growing and learning. Keep up the great work at home!</p>',
      category: 'positive_update',
      merge_fields: ['{child_name}', '{update_text}'],
      created_at: now,
    },
    {
      id: 'tmpl_default_4',
      name: 'Fee Reminder',
      subject: 'Tuition Payment Reminder',
      body_html: '<p>Dear {parent_name},</p><p>This is a friendly reminder that tuition payment for {child_name} is due on <strong>{due_date}</strong>.</p><p>If you have already sent payment, please disregard this notice. If you have questions about your account, please contact us.</p>',
      category: 'fee_reminder',
      merge_fields: ['{parent_name}', '{child_name}', '{due_date}'],
      created_at: now,
    },
    {
      id: 'tmpl_default_5',
      name: 'Supply Request',
      subject: 'Supply Request for {classroom}',
      body_html: '<p>Dear {classroom} families,</p><p>We are running low on the following supplies and would appreciate any donations:</p><ul><li>{item_list}</li></ul><p>Thank you for helping us keep our classroom well-stocked!</p>',
      category: 'supply_request',
      merge_fields: ['{classroom}', '{item_list}'],
      created_at: now,
    },
  ];
}

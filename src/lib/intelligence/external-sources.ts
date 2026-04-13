// External research source catalog
// Public pages fetched by the external researcher to surface regulatory,
// grant, and industry changes relevant to MN childcare operators.

export type ExternalSourceTopic =
  | 'licensing'
  | 'cacfp'
  | 'grants'
  | 'industry';

export interface ExternalSource {
  id: string;
  url: string;
  topic: ExternalSourceTopic;
  frequency: 'weekly' | 'monthly';
  label: string;
  extractPrompt: string;
}

export const EXTERNAL_SOURCES: ExternalSource[] = [
  {
    id: 'mn-dhs-licensing',
    url: 'https://mn.gov/dhs/partners-and-providers/licensing/',
    topic: 'licensing',
    frequency: 'weekly',
    label: 'MN DHS Licensing Updates',
    extractPrompt:
      'Identify any recent changes, updates, or announcements that would affect a licensed family childcare operator in Minnesota. Focus on staff ratios, required training, inspection processes, or reporting requirements.',
  },
  {
    id: 'usda-cacfp-rates',
    url: 'https://www.fns.usda.gov/cacfp/reimbursement-rates',
    topic: 'cacfp',
    frequency: 'monthly',
    label: 'USDA CACFP Reimbursement Rates',
    extractPrompt:
      'Identify the current CACFP meal reimbursement rates and any recent changes. Note if rates have changed in the last 30 days and by how much.',
  },
  {
    id: 'usda-cacfp-grants',
    url: 'https://www.fns.usda.gov/cacfp/grants',
    topic: 'grants',
    frequency: 'monthly',
    label: 'USDA CACFP Grants',
    extractPrompt:
      'Identify any open grant opportunities for CACFP participants or childcare operators. Note deadlines, eligibility requirements, and award amounts.',
  },
  {
    id: 'ccamn-provider-news',
    url: 'https://www.childcareawaremn.org/providers/',
    topic: 'industry',
    frequency: 'weekly',
    label: 'Child Care Aware MN — Provider News',
    extractPrompt:
      'Identify any news, training opportunities, or policy changes relevant to a Minnesota childcare provider. Focus on workforce, compensation, or operational support programs.',
  },
];

export function getSourcesByTopic(topic: ExternalSourceTopic): ExternalSource[] {
  return EXTERNAL_SOURCES.filter((s) => s.topic === topic);
}

export function getSourceById(id: string): ExternalSource | undefined {
  return EXTERNAL_SOURCES.find((s) => s.id === id);
}

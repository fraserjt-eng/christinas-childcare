// External research runner (server-side)
// Fetches public web pages, strips HTML, asks Claude for insights, writes
// findings to the shared research_findings store.

import { callClaudeHaiku } from '@/lib/ai/claude-client';
import { loadAIConfig } from '@/lib/ai-config';
import { EXTERNAL_SOURCES, ExternalSource } from './external-sources';
import type { ResearchFinding } from './research-findings-storage';
import { generateFindingId } from './research-findings-storage';

const SYSTEM_PROMPT = `You are a researcher scanning public web pages for a Minnesota childcare center owner. Your job is to surface one non-obvious, actionable insight per source.

Rules:
- Return ONLY valid JSON. No markdown, no commentary, no code fences.
- Shape: {"finding": "...", "evidence": "..."}
- "finding" is ONE sentence describing the insight plainly. Warm, direct, no jargon.
- "evidence" is 1-2 sentences with specific text from the page (quote if helpful).
- If the page has no notable insight, return {"finding": "No notable changes.", "evidence": ""}.
- Never invent facts. Only use what's in the page text.`;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchAndExtract(source: ExternalSource): Promise<string | null> {
  try {
    const res = await fetch(source.url, {
      headers: {
        'User-Agent':
          'ChristinasChildCareResearcher/1.0 (+https://christinas-childcare.vercel.app)',
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const text = stripHtml(html);
    return text.slice(0, 5000);
  } catch (e) {
    console.error(`External fetch failed for ${source.url}:`, e);
    return null;
  }
}

async function runOneExternal(
  source: ExternalSource,
  apiKey: string
): Promise<ResearchFinding | null> {
  const text = await fetchAndExtract(source);
  if (!text) return null;

  const userPrompt = `Source: ${source.label}
Topic: ${source.topic}
URL: ${source.url}

Research instruction:
${source.extractPrompt}

Page text (first 5000 chars):
${text}

Return JSON: {"finding": "...", "evidence": "..."}`;

  try {
    const response = await callClaudeHaiku(SYSTEM_PROMPT, userPrompt, apiKey, 500);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.finding || parsed.finding.toLowerCase().startsWith('no notable')) return null;

    return {
      id: generateFindingId(),
      questionId: `external_${source.id}`,
      questionText: `${source.label}: ${source.extractPrompt}`,
      finding: parsed.finding,
      evidence: parsed.evidence || '',
      frameworkTag: source.topic === 'cacfp' ? 'financial' : 'compliance',
      severity: source.topic === 'licensing' ? 'risk' : 'opportunity',
      source: 'external',
      status: 'new',
      createdAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error(`External research Claude call failed:`, e);
    return null;
  }
}

export async function runExternalResearchPass(
  sourceIds?: string[]
): Promise<{ ok: boolean; error?: string; findings: ResearchFinding[] }> {
  const config = await loadAIConfig();
  if (!config.apiKey || !config.enabled || !config.features.autoResearcher) {
    return {
      ok: false,
      error: 'Auto Researcher is not configured. Enable it in Admin → Settings → AI.',
      findings: [],
    };
  }

  const sources = sourceIds
    ? EXTERNAL_SOURCES.filter((s) => sourceIds.includes(s.id))
    : EXTERNAL_SOURCES;

  const findings: ResearchFinding[] = [];
  for (const source of sources) {
    const finding = await runOneExternal(source, config.apiKey);
    if (finding) findings.push(finding);
  }

  return { ok: true, findings };
}

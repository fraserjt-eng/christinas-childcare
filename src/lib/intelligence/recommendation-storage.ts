/**
 * Recommendation + Decision persistence.
 * Uses the site-content key-value store (dual-write Supabase + localStorage).
 */

import { getContent, setContent } from '@/lib/site-content-storage';
import { AIRecommendation, RecommendationDecision } from './types';

const RECS_KEY = 'intelligence_recommendations';
const DECISIONS_KEY = 'intelligence_decisions';
const MAX_DECISIONS = 200;

export async function getRecommendations(): Promise<AIRecommendation[]> {
  return getContent<AIRecommendation[]>(RECS_KEY, []);
}

export async function saveRecommendations(recs: AIRecommendation[]): Promise<void> {
  await setContent(RECS_KEY, recs);
}

export async function getDecisions(): Promise<RecommendationDecision[]> {
  return getContent<RecommendationDecision[]>(DECISIONS_KEY, []);
}

export async function saveDecision(decision: RecommendationDecision): Promise<void> {
  const existing = await getDecisions();
  const updated = [decision, ...existing].slice(0, MAX_DECISIONS);
  await setContent(DECISIONS_KEY, updated);

  // Also update the recommendation status
  const recs = await getRecommendations();
  const updatedRecs = recs.map((r) =>
    r.id === decision.recommendationId ? { ...r, status: decision.decision as 'approved' | 'denied' } : r
  );
  await saveRecommendations(updatedRecs);
}

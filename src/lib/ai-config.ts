// AI Config (server-side helper)
// Reads/writes centralized AI settings from Supabase app_settings table.
// Used by all AI-powered API routes (newsletter, lessons, intelligence).

import { getSupabase } from './supabase/client';

export interface AIConfig {
  apiKey: string;
  model: string;
  enabled: boolean;
  features: {
    newsletter: boolean;
    lessonBuilder: boolean;
    intelligence: boolean;
    autoResearcher: boolean;
    learning: boolean;
  };
}

const SETTING_KEY = 'ai_config';

const DEFAULT_CONFIG: AIConfig = {
  apiKey: '',
  model: 'claude-3-haiku-20240307',
  enabled: true,
  features: {
    newsletter: true,
    lessonBuilder: true,
    intelligence: true,
    autoResearcher: true,
    learning: true,
  },
};

/**
 * Load AI config from app_settings, falling back to env var.
 * Called from server-side API routes.
 */
export async function loadAIConfig(): Promise<AIConfig> {
  const config: AIConfig = { ...DEFAULT_CONFIG };

  // Try Supabase first
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', SETTING_KEY)
        .maybeSingle();

      if (!error && data?.value) {
        const stored = data.value as Partial<AIConfig>;
        Object.assign(config, stored);
      }
    } catch (e) {
      console.error('Failed to load AI config from Supabase:', e);
    }
  }

  // Fall back to env var if no stored key
  if (!config.apiKey && process.env.ANTHROPIC_API_KEY) {
    config.apiKey = process.env.ANTHROPIC_API_KEY;
  }

  return config;
}

/**
 * Save AI config to app_settings.
 */
export async function saveAIConfig(config: Partial<AIConfig>): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    // Upsert by key
    const { error } = await supabase
      .from('app_settings')
      .upsert(
        {
          key: SETTING_KEY,
          value: config,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('Failed to save AI config:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('AI config save exception:', e);
    return false;
  }
}

/**
 * Check if AI is enabled for a specific feature.
 */
export async function isFeatureEnabled(
  feature: keyof AIConfig['features']
): Promise<boolean> {
  const config = await loadAIConfig();
  return config.enabled && config.features[feature] && !!config.apiKey;
}

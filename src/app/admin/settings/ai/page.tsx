'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  TestTube,
  Save,
  ExternalLink,
} from 'lucide-react';

interface AIStatus {
  enabled: boolean;
  model: string;
  hasKey: boolean;
  maskedKey: string;
  features: {
    newsletter: boolean;
    lessonBuilder: boolean;
    intelligence: boolean;
    autoResearcher: boolean;
    learning: boolean;
  };
}

const FEATURE_LABELS: Record<keyof AIStatus['features'], { label: string; description: string }> = {
  newsletter: {
    label: 'Newsletter Builder',
    description: 'Auto-draft newsletter sections from center data',
  },
  lessonBuilder: {
    label: 'Lesson Builder',
    description: 'Generate and remix developmentally-aligned lessons',
  },
  intelligence: {
    label: 'Intelligence Recommendations',
    description: 'Operational recommendations from scan data',
  },
  autoResearcher: {
    label: 'Auto Researcher',
    description: 'Research queries and framework-aligned suggestions',
  },
  learning: {
    label: 'Decision Learning',
    description: 'Learn from owner approval/denial patterns',
  },
};

interface UsageInfo {
  usedToday: number;
  cap: number;
  remaining: number;
  overQuota: boolean;
}

export default function AISettingsPage() {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [newCap, setNewCap] = useState('');
  const [savingCap, setSavingCap] = useState(false);
  const [features, setFeatures] = useState<AIStatus['features']>({
    newsletter: true,
    lessonBuilder: true,
    intelligence: true,
    autoResearcher: true,
    learning: true,
  });
  const [enabled, setEnabled] = useState(true);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const [configRes, usageRes] = await Promise.all([
        fetch('/api/ai/config'),
        fetch('/api/ai/usage'),
      ]);
      if (configRes.ok) {
        const data = await configRes.json();
        setStatus(data);
        setFeatures(data.features);
        setEnabled(data.enabled);
      }
      if (usageRes.ok) {
        const data = await usageRes.json();
        setUsage(data);
      }
    } catch (e) {
      console.error('Failed to load AI status:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleSaveCap() {
    const capNum = Number(newCap);
    if (!Number.isFinite(capNum) || capNum < 1000) {
      setSaveMessage('Cap must be at least 1000');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    setSavingCap(true);
    try {
      const res = await fetch('/api/ai/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cap: capNum }),
      });
      if (res.ok) {
        setSaveMessage('Daily cap updated');
        setNewCap('');
        await loadStatus();
      } else {
        const data = await res.json();
        setSaveMessage(data.error || 'Failed to save cap');
      }
    } catch {
      setSaveMessage('Network error while saving cap');
    } finally {
      setSavingCap(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  }

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: newKey || undefined }),
      });
      const data = await res.json();
      if (data.ok) {
        setTestResult({ ok: true, message: 'Key verified — API reachable' });
      } else {
        setTestResult({ ok: false, message: data.error || 'Test failed' });
      }
    } catch {
      setTestResult({ ok: false, message: 'Network error during test' });
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage('');
    try {
      const payload: Record<string, unknown> = {
        enabled,
        features,
      };
      if (newKey) payload.apiKey = newKey;

      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMessage('Settings saved successfully.');
        setNewKey('');
        setTestResult(null);
        await loadStatus();
      } else {
        setSaveMessage(data.error || 'Save failed');
      }
    } catch {
      setSaveMessage('Network error during save');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(''), 4000);
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">AI Settings</h1>
          <p className="text-muted-foreground">
            One API key powers newsletter builder, lesson builder, intelligence, and auto research.
          </p>
        </div>
      </div>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {loading ? (
              'Loading status...'
            ) : status?.hasKey && status?.enabled ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-christina-green" />
                AI is configured and active
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-christina-coral" />
                AI is not configured
              </>
            )}
          </CardTitle>
        </CardHeader>
        {status && (
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model</span>
              <span className="font-mono">{status.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">API key</span>
              <span className="font-mono">
                {status.hasKey ? status.maskedKey : 'Not set'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-medium">Enable AI globally</span>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Daily Usage + Cap */}
      {usage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Used today</span>
                <span className="font-mono font-medium">
                  {usage.usedToday.toLocaleString()} tokens
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cap</span>
                <span className="font-mono">{usage.cap.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span
                  className={`font-mono font-medium ${
                    usage.overQuota ? 'text-christina-coral' : 'text-christina-green'
                  }`}
                >
                  {usage.remaining.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={
                    usage.overQuota
                      ? 'h-full bg-christina-coral'
                      : 'h-full bg-christina-blue'
                  }
                  style={{
                    width: `${Math.min(100, Math.round((usage.usedToday / usage.cap) * 100))}%`,
                  }}
                />
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="dailyCap">Update daily token cap</Label>
              <div className="flex gap-2">
                <Input
                  id="dailyCap"
                  type="number"
                  min={1000}
                  step={1000}
                  value={newCap}
                  onChange={(e) => setNewCap(e.target.value)}
                  placeholder={String(usage.cap)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveCap}
                  disabled={savingCap || !newCap}
                >
                  {savingCap ? 'Saving...' : 'Update Cap'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 1,000. Claude Haiku input tokens cost ~$0.00025 per 1K.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Anthropic API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Paste a new key to replace the current one</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="apiKey"
                  type={showKey ? 'text' : 'password'}
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="pr-10 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                disabled={testing}
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testing ? 'Testing...' : 'Test'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to test the currently stored key. Keys are stored in Supabase and never
              exposed to parent or employee portals.
            </p>
          </div>

          {testResult && (
            <div
              className={`rounded-lg p-3 text-sm ${
                testResult.ok
                  ? 'bg-christina-green/10 text-christina-green border border-christina-green/30'
                  : 'bg-christina-coral/10 text-christina-coral border border-christina-coral/30'
              }`}
            >
              {testResult.message}
            </div>
          )}

          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-christina-blue hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Get a key from the Anthropic console
          </a>
        </CardContent>
      </Card>

      {/* Feature toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enabled Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(FEATURE_LABELS) as Array<keyof AIStatus['features']>).map((key) => (
            <div
              key={key}
              className="flex items-start justify-between gap-4 pb-3 border-b last:border-0 last:pb-0"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{FEATURE_LABELS[key].label}</p>
                <p className="text-xs text-muted-foreground">
                  {FEATURE_LABELS[key].description}
                </p>
              </div>
              <Switch
                checked={features[key]}
                onCheckedChange={(checked) =>
                  setFeatures((prev) => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center justify-between sticky bottom-4 bg-background p-4 rounded-lg border shadow-sm">
        <div className="text-sm">
          {saveMessage && (
            <Badge
              variant={saveMessage.includes('success') ? 'default' : 'destructive'}
              className="font-normal"
            >
              {saveMessage}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-christina-red hover:bg-christina-red/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}

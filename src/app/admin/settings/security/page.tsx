'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, ArrowLeft, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getSecuritySettings, updateSecuritySettings, SecuritySettings } from '@/lib/user-storage';

export default function SecurityPage() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSecuritySettings());
  }, []);

  const handleSettingChange = <K extends keyof SecuritySettings>(
    key: K,
    value: SecuritySettings[K]
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = () => {
    if (!settings) return;
    updateSecuritySettings(settings);
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-christina-coral/10 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-christina-coral" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Security Settings</h1>
              <p className="text-muted-foreground">Configure password and session policies</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Saved
            </Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-christina-red hover:bg-christina-red/90"
          >
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Demo Warning */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-900">Demo Mode Active</p>
            <p className="text-sm text-yellow-700">
              These settings are stored in localStorage for demonstration purposes.
              For production use, configure Supabase authentication in your environment variables.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Password Policy</CardTitle>
          <CardDescription>
            Configure password requirements for all user accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min_length">Minimum Password Length</Label>
              <Input
                id="min_length"
                type="number"
                min={6}
                max={32}
                value={settings.password_min_length}
                onChange={(e) =>
                  handleSettingChange('password_min_length', parseInt(e.target.value) || 8)
                }
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 8 or more characters
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Password Complexity Requirements</h4>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require_uppercase">Require Uppercase Letter</Label>
                <p className="text-sm text-muted-foreground">
                  Password must contain at least one uppercase letter (A-Z)
                </p>
              </div>
              <Switch
                id="require_uppercase"
                checked={settings.require_uppercase}
                onCheckedChange={(checked) =>
                  handleSettingChange('require_uppercase', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require_number">Require Number</Label>
                <p className="text-sm text-muted-foreground">
                  Password must contain at least one number (0-9)
                </p>
              </div>
              <Switch
                id="require_number"
                checked={settings.require_number}
                onCheckedChange={(checked) =>
                  handleSettingChange('require_number', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require_special">Require Special Character</Label>
                <p className="text-sm text-muted-foreground">
                  Password must contain at least one special character (!@#$%^&*)
                </p>
              </div>
              <Switch
                id="require_special"
                checked={settings.require_special_char}
                onCheckedChange={(checked) =>
                  handleSettingChange('require_special_char', checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Session Settings</CardTitle>
          <CardDescription>
            Configure how long users stay logged in and security timeouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="session_timeout">Session Timeout (Hours)</Label>
              <Input
                id="session_timeout"
                type="number"
                min={1}
                max={72}
                value={settings.session_timeout_hours}
                onChange={(e) =>
                  handleSettingChange('session_timeout_hours', parseInt(e.target.value) || 8)
                }
              />
              <p className="text-xs text-muted-foreground">
                Users will be logged out after this period of inactivity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Security */}
      <Card>
        <CardHeader>
          <CardTitle>Login Security</CardTitle>
          <CardDescription>
            Configure protection against unauthorized login attempts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="max_attempts">Max Failed Login Attempts</Label>
              <Input
                id="max_attempts"
                type="number"
                min={3}
                max={10}
                value={settings.max_failed_attempts}
                onChange={(e) =>
                  handleSettingChange('max_failed_attempts', parseInt(e.target.value) || 5)
                }
              />
              <p className="text-xs text-muted-foreground">
                Account will be locked after this many failed attempts
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lockout_duration">Lockout Duration (Minutes)</Label>
              <Input
                id="lockout_duration"
                type="number"
                min={5}
                max={60}
                value={settings.lockout_duration_minutes}
                onChange={(e) =>
                  handleSettingChange('lockout_duration_minutes', parseInt(e.target.value) || 15)
                }
              />
              <p className="text-xs text-muted-foreground">
                How long the account remains locked after max attempts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Settings Summary */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Current Policy Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Min {settings.password_min_length} characters
            </Badge>
            {settings.require_uppercase && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Uppercase required
              </Badge>
            )}
            {settings.require_number && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Number required
              </Badge>
            )}
            {settings.require_special_char && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Special char required
              </Badge>
            )}
            <Badge variant="outline">
              {settings.session_timeout_hours}h session timeout
            </Badge>
            <Badge variant="outline">
              {settings.max_failed_attempts} max login attempts
            </Badge>
            <Badge variant="outline">
              {settings.lockout_duration_minutes}m lockout
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

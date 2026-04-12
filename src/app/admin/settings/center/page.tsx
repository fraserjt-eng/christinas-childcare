'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, ChevronLeft, Save, Check } from 'lucide-react';
import { getContent, setContent, DEFAULT_CONTENT } from '@/lib/site-content-storage';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

type HoursMap = Record<string, { open: string; close: string }>;

export default function CenterInformationPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [license, setLicense] = useState('');
  const [hours, setHours] = useState<HoursMap>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const [n, a, p, e, l, h] = await Promise.all([
        getContent<string>('center.name', DEFAULT_CONTENT['center.name'] as string),
        getContent<string>('center.address', DEFAULT_CONTENT['center.address'] as string),
        getContent<string>('center.phone', DEFAULT_CONTENT['center.phone'] as string),
        getContent<string>('center.email', DEFAULT_CONTENT['center.email'] as string),
        getContent<string>('center.license', DEFAULT_CONTENT['center.license'] as string),
        getContent<HoursMap>('center.hours', DEFAULT_CONTENT['center.hours'] as HoursMap),
      ]);
      setName(n);
      setAddress(a);
      setPhone(p);
      setEmail(e);
      setLicense(l);
      setHours(h);
    }
    load();
  }, []);

  function updateHour(day: string, field: 'open' | 'close', value: string) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all([
        setContent('center.name', name),
        setContent('center.address', address),
        setContent('center.phone', phone),
        setContent('center.email', email),
        setContent('center.license', license),
        setContent('center.hours', hours),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-body"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-christina-red/10 rounded-lg">
          <Building2 className="h-6 w-6 text-christina-red" />
        </div>
        <h1 className="text-2xl font-bold font-heading">Center Information</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="center-name" className="font-body">Center Name</Label>
              <Input
                id="center-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Center name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="center-license" className="font-body">License Number</Label>
              <Input
                id="center-license"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="License number"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="center-address" className="font-body">Address</Label>
            <Input
              id="center-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="center-phone" className="font-body">Phone</Label>
              <Input
                id="center-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(xxx) xxx-xxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="center-email" className="font-body">Email</Label>
              <Input
                id="center-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Operating Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DAYS.map((day) => (
              <div key={day} className="grid grid-cols-[120px_1fr_1fr] gap-3 items-center">
                <span className="text-sm font-medium font-body">{DAY_LABELS[day]}</span>
                <Input
                  value={hours[day]?.open ?? ''}
                  onChange={(e) => updateHour(day, 'open', e.target.value)}
                  placeholder="Open"
                  className="text-sm"
                />
                <Input
                  value={hours[day]?.close ?? ''}
                  onChange={(e) => updateHour(day, 'close', e.target.value)}
                  placeholder="Close"
                  className="text-sm"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="bg-christina-green hover:bg-christina-green/90">
          {saving ? (
            <>Saving...</>
          ) : saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
        {saved && (
          <span className="text-sm text-christina-green font-body">Changes saved successfully.</span>
        )}
      </div>
    </div>
  );
}

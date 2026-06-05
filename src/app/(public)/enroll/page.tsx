'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { CheckCircle, Phone, Mail, MapPin, Calendar, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import { useT } from '@/contexts/LanguageContext';

interface InquiryData {
  parentName: string;
  email: string;
  phone: string;
  childName: string;
  childAge: string;
  program: string;
  startDate: string;
  message: string;
  submittedAt: string;
  status: 'new';
}

export default function EnrollPage() {
  const t = useT();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    childName: '',
    childAge: '',
    program: '',
    startDate: '',
    message: '',
  });

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    // POST to API route (saves to Supabase)
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.status === 429) {
        // Still save locally and show success (don't punish the user)
        console.warn('Rate limited on enrollment submission');
      }
    } catch {
      // Network error, still save locally
    }

    // Persist to localStorage as backup
    const inquiry: InquiryData = {
      ...formData,
      submittedAt: new Date().toISOString(),
      status: 'new',
    };

    const existing = JSON.parse(localStorage.getItem('christinas_inquiries') || '[]');
    existing.push(inquiry);
    localStorage.setItem('christinas_inquiries', JSON.stringify(existing));

    // Brief delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="py-24">
        <div className="max-w-lg mx-auto text-center px-4">
          <ScrollFadeIn direction="up" duration={600}>
            <div className="w-16 h-16 rounded-full bg-christina-green/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-christina-green" />
            </div>
            <h1 className="font-playful text-3xl mb-4">{t('enroll.thankYouTitle')}</h1>
            <p className="text-muted-foreground text-lg mb-6">
              {t('enroll.thankYouBody')}
            </p>
            <div className="bg-muted/50 rounded-lg p-6 text-left mb-6">
              <h3 className="font-heading font-bold mb-3">{t('enroll.whatHappensNext')}</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="font-bold text-christina-red">1.</span> {t('enroll.successStep1')}</li>
                <li className="flex gap-2"><span className="font-bold text-christina-red">2.</span> {t('enroll.successStep2')}</li>
                <li className="flex gap-2"><span className="font-bold text-christina-red">3.</span> {t('enroll.successStep3')}</li>
                <li className="flex gap-2"><span className="font-bold text-christina-red">4.</span> {t('enroll.successStep4')}</li>
              </ol>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-christina-red hover:bg-christina-red/90">
                <Link href="/schedule-tour">{t('enroll.scheduleTourNow')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">{t('enroll.backToHome')}</Link>
              </Button>
            </div>
          </ScrollFadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <h1 className="font-playful text-4xl md:text-5xl mb-4">{t('enroll.heroTitle')}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('enroll.heroSubtitle')}
            </p>
          </div>
        </ScrollFadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('enroll.formCardTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parentName">{t('enroll.parentNameLabel')}</Label>
                      <Input
                        id="parentName"
                        required
                        placeholder={t('enroll.parentNamePlaceholder')}
                        value={formData.parentName}
                        onChange={(e) => updateField('parentName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('enroll.emailLabel')}</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        aria-label={t('enroll.emailLabel')}
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('enroll.phoneLabel')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        placeholder="(763) 555-0000"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="childName">{t('enroll.childNameLabel')}</Label>
                      <Input
                        id="childName"
                        required
                        placeholder={t('enroll.childNamePlaceholder')}
                        value={formData.childName}
                        onChange={(e) => updateField('childName', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="childAge">{t('enroll.childAgeLabel')}</Label>
                      <Input
                        id="childAge"
                        required
                        placeholder={t('enroll.childAgePlaceholder')}
                        value={formData.childAge}
                        onChange={(e) => updateField('childAge', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="program">{t('enroll.programLabel')}</Label>
                      <Select
                        required
                        value={formData.program}
                        onValueChange={(v) => updateField('program', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('enroll.programPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="infant">{t('enroll.programInfant')}</SelectItem>
                          <SelectItem value="toddler">{t('enroll.programToddler')}</SelectItem>
                          <SelectItem value="preschool">{t('enroll.programPreschool')}</SelectItem>
                          <SelectItem value="school_age">{t('enroll.programSchoolAge')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">{t('enroll.startDateLabel')}</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateField('startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t('enroll.messageLabel')}</Label>
                    <Textarea
                      id="message"
                      placeholder={t('enroll.messagePlaceholder')}
                      rows={4}
                      value={formData.message}
                      onChange={(e) => updateField('message', e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-christina-red hover:bg-christina-red/90"
                    disabled={loading}
                  >
                    {loading ? t('enroll.submitting') : t('enroll.submitButton')}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    {t('enroll.privacyPrefix')}{' '}
                    <Link href="/privacy" className="text-christina-red hover:underline">
                      {t('enroll.privacyPolicyLink')}
                    </Link>
                    {t('enroll.privacySuffix')}
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">{t('enroll.contactInfoTitle')}</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-christina-red mt-0.5" />
                    <div className="text-sm">
                      <p>5510 W Broadway Ave</p>
                      <p>Crystal, MN 55428</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-christina-red" />
                    <a href="tel:+17633905870" className="text-sm hover:text-christina-red transition-colors">(763) 390-5870</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-christina-red" />
                    <a href="mailto:info@christinaschildcare.com" className="text-sm hover:text-christina-red transition-colors">info@christinaschildcare.com</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-christina-red" />
                    <span className="text-sm">{t('enroll.hours')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">{t('enroll.whatToExpectTitle')}</h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-christina-red text-white flex items-center justify-center text-xs flex-shrink-0">1</span>
                    <span>{t('enroll.expectStep1')}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-christina-red text-white flex items-center justify-center text-xs flex-shrink-0">2</span>
                    <span>{t('enroll.expectStep2')}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-christina-red text-white flex items-center justify-center text-xs flex-shrink-0">3</span>
                    <span>{t('enroll.expectStep3')}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-christina-red text-white flex items-center justify-center text-xs flex-shrink-0">4</span>
                    <span>{t('enroll.expectStep4')}</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card className="bg-christina-red text-white">
              <CardContent className="p-6">
                <Calendar className="h-8 w-8 mb-3 text-white/80" />
                <h3 className="font-bold mb-2">{t('enroll.tourFirstTitle')}</h3>
                <p className="text-sm text-white/80 mb-4">
                  {t('enroll.tourFirstBody')}
                </p>
                <Button asChild variant="outline" className="border-white text-white hover:bg-white/10 w-full">
                  <Link href="/schedule-tour">{t('enroll.scheduleTour')}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Shield className="h-6 w-6 text-christina-green mb-3" />
                <h3 className="font-bold mb-2 text-sm">{t('enroll.weAcceptTitle')}</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>{t('enroll.acceptCounty')}</li>
                  <li>{t('enroll.acceptFsa')}</li>
                  <li>{t('enroll.acceptMultiple')}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { useT } from '@/contexts/LanguageContext';
import Link from 'next/link';
import {
  CalendarDays,
  CheckCircle,
  MapPin,
  Car,
  ClipboardList,
  Eye,
} from 'lucide-react';

export default function ScheduleTourPage() {
  const t = useT();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preferredTime, setPreferredTime] = useState('');

  function getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const tourRequest = {
      id: crypto.randomUUID(),
      parentName: formData.get('parentName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      preferredDate: formData.get('preferredDate') as string,
      preferredTime,
      numberOfChildren: formData.get('numberOfChildren') as string,
      childrenAges: formData.get('childrenAges') as string,
      questions: formData.get('questions') as string,
      submittedAt: new Date().toISOString(),
    };

    // POST to API route (saves to Supabase)
    try {
      const res = await fetch('/api/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tourRequest),
      });
      if (res.status === 429) {
        // Still save locally and show success (don't punish the user)
        console.warn('Rate limited on tour submission');
      }
    } catch {
      // Network error, still save locally
    }

    // Save to localStorage as backup
    const existing = localStorage.getItem('christinas_tour_requests');
    const requests = existing ? JSON.parse(existing) : [];
    requests.push(tourRequest);
    localStorage.setItem('christinas_tour_requests', JSON.stringify(requests));

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="py-24">
        <div className="max-w-lg mx-auto text-center px-4">
          <ScrollFadeIn direction="up" duration={500}>
            <div className="w-20 h-20 rounded-full bg-christina-red/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-christina-red" />
            </div>
            <h1 className="text-3xl font-bold mb-4">{t('tour.successTitle')}</h1>
            <p className="text-muted-foreground text-lg mb-8">
              {t('tour.successMessage')}
            </p>
            <Card>
              <CardContent className="p-6 text-left space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-christina-red mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">{t('tour.successLocationLabel')}</p>
                    <p className="text-muted-foreground">5510 W Broadway Ave, Crystal, MN 55428</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ClipboardList className="h-5 w-5 text-christina-red mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">{t('tour.successBringLabel')}</p>
                    <ul className="text-muted-foreground space-y-1 mt-1">
                      <li>{t('tour.successBring1')}</li>
                      <li>{t('tour.successBring2')}</li>
                      <li>{t('tour.successBring3')}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollFadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <h1 className="font-playful text-4xl md:text-5xl mb-4 text-[#1a1a1a]">
              {t('tour.heroTitle')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('tour.heroSubtitle')}
            </p>
          </div>
        </ScrollFadeIn>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
            <ScrollFadeIn direction="left" duration={600} delay={100}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-christina-red" />
                    {t('tour.formTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Parent Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parentName">{t('tour.parentNameLabel')}</Label>
                        <Input
                          id="parentName"
                          name="parentName"
                          required
                          placeholder={t('tour.parentNamePlaceholder')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('tour.emailLabel')}</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    {/* Phone & Preferred Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('tour.phoneLabel')}</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          placeholder="(763) 555-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferredDate">{t('tour.preferredDateLabel')}</Label>
                        <Input
                          id="preferredDate"
                          name="preferredDate"
                          type="date"
                          required
                          min={getTomorrowDate()}
                        />
                      </div>
                    </div>

                    {/* Preferred Time & Number of Children */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preferredTime">{t('tour.preferredTimeLabel')}</Label>
                        <Select required onValueChange={setPreferredTime}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('tour.preferredTimePlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning-9-10">{t('tour.timeMorning')}</SelectItem>
                            <SelectItem value="late-morning-10-11">{t('tour.timeLateMorning')}</SelectItem>
                            <SelectItem value="afternoon-1-2">{t('tour.timeAfternoon')}</SelectItem>
                            <SelectItem value="late-afternoon-3-4">{t('tour.timeLateAfternoon')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numberOfChildren">{t('tour.numberOfChildrenLabel')}</Label>
                        <Input
                          id="numberOfChildren"
                          name="numberOfChildren"
                          type="number"
                          min="1"
                          max="10"
                          placeholder="1"
                        />
                      </div>
                    </div>

                    {/* Children's Ages */}
                    <div className="space-y-2">
                      <Label htmlFor="childrenAges">{t('tour.childrenAgesLabel')}</Label>
                      <Input
                        id="childrenAges"
                        name="childrenAges"
                        placeholder={t('tour.childrenAgesPlaceholder')}
                      />
                    </div>

                    {/* Questions */}
                    <div className="space-y-2">
                      <Label htmlFor="questions">{t('tour.questionsLabel')}</Label>
                      <Textarea
                        id="questions"
                        name="questions"
                        placeholder={t('tour.questionsPlaceholder')}
                        rows={4}
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-christina-red hover:bg-christina-red/90"
                      disabled={loading}
                    >
                      {loading ? t('tour.submitLoading') : t('tour.submitButton')}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      {t('tour.privacyPrefix')}{' '}
                      <Link href="/privacy" className="text-christina-red hover:underline">
                        {t('tour.privacyLink')}
                      </Link>
                      {t('tour.privacySuffix')}
                    </p>
                  </form>
                </CardContent>
              </Card>
            </ScrollFadeIn>
          </div>

          {/* Right Column: Info */}
          <div className="space-y-6">
            {/* What to Expect Card */}
            <ScrollFadeIn direction="right" duration={600} delay={200}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-christina-red" />
                    {t('tour.expectTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4 text-sm">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-christina-red text-white flex items-center justify-center text-xs flex-shrink-0">
                        1
                      </span>
                      <div>
                        <span className="font-medium">{t('tour.expect1Title')}</span>
                        <p className="text-muted-foreground mt-0.5">
                          {t('tour.expect1Body')}
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-christina-red text-white flex items-center justify-center text-xs flex-shrink-0">
                        2
                      </span>
                      <div>
                        <span className="font-medium">{t('tour.expect2Title')}</span>
                        <p className="text-muted-foreground mt-0.5">
                          {t('tour.expect2Body')}
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-christina-red text-white flex items-center justify-center text-xs flex-shrink-0">
                        3
                      </span>
                      <div>
                        <span className="font-medium">{t('tour.expect3Title')}</span>
                        <p className="text-muted-foreground mt-0.5">
                          {t('tour.expect3Body')}
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-christina-red text-white flex items-center justify-center text-xs flex-shrink-0">
                        4
                      </span>
                      <div>
                        <span className="font-medium">{t('tour.expect4Title')}</span>
                        <p className="text-muted-foreground mt-0.5">
                          {t('tour.expect4Body')}
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-christina-red text-white flex items-center justify-center text-xs flex-shrink-0">
                        5
                      </span>
                      <div>
                        <span className="font-medium">{t('tour.expect5Title')}</span>
                        <p className="text-muted-foreground mt-0.5">
                          {t('tour.expect5Body')}
                        </p>
                      </div>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </ScrollFadeIn>

            {/* Getting Here Card */}
            <ScrollFadeIn direction="right" duration={600} delay={350}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-christina-red" />
                    {t('tour.gettingHereTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <p className="font-medium">5510 W Broadway Ave</p>
                    <p className="text-muted-foreground">Crystal, MN 55428</p>
                  </div>

                  {/* Map Embed */}
                  <div className="rounded-lg overflow-hidden border">
                    <iframe
                      title="Christina's Childcare Location"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2821.5!2d-93.364!3d45.046!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s5510+W+Broadway+Ave%2C+Crystal%2C+MN+55428!5e0!3m2!1sen!2sus!4v1700000000000"
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <Car className="h-5 w-5 text-christina-red mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{t('tour.parkingLabel')}</p>
                      <p className="text-muted-foreground">{t('tour.parkingBody')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollFadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
